import { PassthroughEnhancementProvider } from "./passthrough-provider.js";

const providerFactories = new Map([["passthrough", () => new PassthroughEnhancementProvider()]]);

export function registerProvider(name, factory) {
  providerFactories.set(name, factory);
}

export function createProvider(name) {
  const factory = providerFactories.get(name);

  if (!factory) {
    const available = [...providerFactories.keys()].join(", ");
    throw new Error(`Unknown enhancement provider "${name}". Available providers: ${available}.`);
  }

  return factory();
}
