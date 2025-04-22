// opennext.config.ts
import type { Config } from "@opennextjs/cloudflare";

const config: Config = {
  overrides: {
    wrapper: "cloudflare-node",
    converter: "edge",
    proxyExternalRequest: "fetch",
    incrementalCache: {
      type: "dummy"
    },
    tagCache: "dummy",
    queue: "dummy"
  },
  edgeExternals: ["node:crypto"]
};

export default config;


