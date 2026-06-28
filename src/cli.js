#!/usr/bin/env node

import { initializeWorkspace, runPipeline, getStatus } from "./content-factory/pipeline.js";
import {
  initializeAutomation1,
  runAutomation1,
  getAutomation1Status,
  watchAutomation1
} from "./automation1/pipeline.js";
import {
  initializeAutomation2,
  runAutomation2,
  getAutomation2Status,
  watchAutomation2
} from "./automation2/pipeline.js";

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === "--root") {
      options.root = rest[index + 1];
      index += 1;
    } else if (token === "--provider") {
      options.provider = rest[index + 1];
      index += 1;
    }
  }

  return { command, options };
}

function printHelp() {
  console.log(`
Miles & Meals AI Content Factory

Usage:
  node src/cli.js init [--root content-factory]
  node src/cli.js run [--root content-factory]
  node src/cli.js status [--root content-factory]

  node src/cli.js automation1:init [--root <media-workspace>]
  node src/cli.js automation1:run [--root <media-workspace>] [--provider passthrough]
  node src/cli.js automation1:status [--root <media-workspace>]
  node src/cli.js automation1:watch [--root <media-workspace>] [--provider passthrough]

  node src/cli.js automation2:init [--root <media-workspace>]
  node src/cli.js automation2:run [--root <media-workspace>]
  node src/cli.js automation2:status [--root <media-workspace>]
  node src/cli.js automation2:watch [--root <media-workspace>]

Commands:
  init                 Create the local content factory folders and state store.
  run                  Process RAW media and Instagram Ready exports into draft workflow state.
  status               Print current pipeline counts.

  automation1:init     Create the Automation 1 folders (Instagram Candidates, Enhanced, Lightroom Ready) and state store.
  automation1:run      Validate and enhance pending Instagram Candidates once, then exit.
  automation1:status   Print current Automation 1 media counts.
  automation1:watch    Watch Instagram Candidates continuously and run Automation 1 on change.

  automation2:init     Create the Automation 2 folders (Instagram Ready, Posting Package) and state store.
  automation2:run      Generate posting packages for pending Instagram Ready images once, then exit.
  automation2:status   Print current Automation 2 posting package counts.
  automation2:watch    Watch Instagram Ready continuously and run Automation 2 on change.

Automation 1 defaults to the production media workspace (~/Miles and Meals PH or
$AUTOMATION1_MEDIA_ROOT) and the Pass-through enhancement provider. See docs/ARCHITECTURE.md.

Automation 2 generates draft posting packages only. It never publishes, never connects to
Instagram, and never modifies the original image. See docs/FEATURES/automation-2.md.
`);
}

const { command, options } = parseArgs(process.argv.slice(2));

try {
  if (command === "init") {
    const result = await initializeWorkspace(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "run") {
    const result = await runPipeline(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "status") {
    const result = await getStatus(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation1:init") {
    const result = await initializeAutomation1(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation1:run") {
    const result = await runAutomation1(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation1:status") {
    const result = await getAutomation1Status(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation1:watch") {
    const handle = await watchAutomation1(options, {
      onRun: (result) => console.log(JSON.stringify(result, null, 2))
    });

    process.on("unhandledRejection", (reason) => {
      console.error(
        "[automation1] ERROR Unhandled rejection while watching:",
        reason instanceof Error ? reason.message : reason
      );
    });

    let shuttingDown = false;
    const shutdown = async (signal) => {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;
      console.log(`\n[automation1] Received ${signal}. Stopping watcher...`);
      await handle.close();
      console.log("[automation1] Watcher stopped.");
      process.exit(0);
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } else if (command === "automation2:init") {
    const result = await initializeAutomation2(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation2:run") {
    const result = await runAutomation2(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation2:status") {
    const result = await getAutomation2Status(options);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "automation2:watch") {
    const handle = await watchAutomation2(options, {
      onRun: (result) => console.log(JSON.stringify(result, null, 2))
    });

    process.on("unhandledRejection", (reason) => {
      console.error(
        "[automation2] ERROR Unhandled rejection while watching:",
        reason instanceof Error ? reason.message : reason
      );
    });

    let shuttingDown = false;
    const shutdown = async (signal) => {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;
      console.log(`\n[automation2] Received ${signal}. Stopping watcher...`);
      await handle.close();
      console.log("[automation2] Watcher stopped.");
      process.exit(0);
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } else {
    printHelp();
    process.exitCode = command === "help" ? 0 : 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
