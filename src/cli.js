#!/usr/bin/env node

import { initializeWorkspace, runPipeline, getStatus } from "./content-factory/pipeline.js";

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === "--root") {
      options.root = rest[index + 1];
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

Commands:
  init     Create the local content factory folders and state store.
  run      Process RAW media and Instagram Ready exports into draft workflow state.
  status   Print current pipeline counts.
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
  } else {
    printHelp();
    process.exitCode = command === "help" ? 0 : 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
