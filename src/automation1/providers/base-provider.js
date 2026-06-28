export class BaseEnhancementProvider {
  constructor(name) {
    if (new.target === BaseEnhancementProvider) {
      throw new Error("BaseEnhancementProvider is abstract and cannot be instantiated directly.");
    }

    this.name = name;
  }

  async enhance(_job) {
    throw new Error(`Provider "${this.name}" has not implemented enhance().`);
  }
}
