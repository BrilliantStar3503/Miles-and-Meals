import fs from "node:fs";

export function watchCandidates(config, onChange, { debounceMs = 300 } = {}) {
  const directory = config.directories["Instagram Candidates"];
  let timer = null;

  const trigger = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onChange, debounceMs);
  };

  const watcher = fs.watch(directory, { persistent: true }, trigger);

  return {
    close() {
      if (timer) {
        clearTimeout(timer);
      }

      watcher.close();
    }
  };
}
