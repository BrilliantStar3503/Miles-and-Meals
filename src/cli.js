#!/usr/bin/env node

import { initializeWorkspace, runPipeline, getStatus } from "./content-factory/pipeline.js";
import {
  initializeAutomation1,
  runAutomation1,
  getAutomation1Status,
  watchAutomation1
} from "./automation1/pipeline.js";

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

Commands:
  init                 Create the local content factory folders and state store.
  run                  Process RAW media and Instagram Ready exports into draft workflow state.
  status               Print current pipeline counts.

  automation1:init     Create the Automation 1 folders (Instagram Candidates, Enhanced, Lightroom Ready) and state store.
  automation1:run      Validate and enhance pending Instagram Candidates once, then exit.
  automation1:status   Print current Automation 1 media counts.
  automation1:watch    Watch Instagram Candidates continuously and run Automation 1 on change.

Automation 1 defaults to the production media workspace (~/Miles and Meals PH or
$AUTOMATION1_MEDIA_ROOT) and the Pass-through enhancement provider. See docs/ARCHITECTURE.md.
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
    process.on("SIGINT", () => {
      handle.close();
      process.exit(0);
    });
  } else {
    printHelp();
    process.exitCode = command === "help" ? 0 : 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
