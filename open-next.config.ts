// opennext.config.ts
export default {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy", // or a function
      tagCache: "dummy",
      queue: "dummy", // or "direct" or a function
    }
  },
  edgeExternals: ["node:crypto"]
};
