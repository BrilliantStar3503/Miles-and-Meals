export class ProcessingQueue {
  constructor({ concurrency = 1 } = {}) {
    this.concurrency = Math.max(1, concurrency);
    this.tasks = [];
    this.results = [];
  }

  add(task) {
    this.tasks.push(task);
  }

  async run() {
    const workers = Array.from({ length: this.concurrency }, () => this.#worker());
    await Promise.all(workers);
    return this.results;
  }

  async #worker() {
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      if (!task) {
        return;
      }

      try {
        const value = await task();
        this.results.push({ status: "fulfilled", value });
      } catch (error) {
        this.results.push({ status: "rejected", reason: error });
      }
    }
  }
}
