import { defineConfig } from "astro/config";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const site = process.env.SITE_URL || undefined;
const base = process.env.BASE_PATH || "/";

function prefixRootLinks() {
  return {
    name: "prefix-root-links",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const b = base.replace(/\/$/, "");
        if (!b) return;
        const root = fileURLToPath(dir);
        const walk = async (d) => {
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith(".html")) {
              const html = await readFile(p, "utf8");
              const out = html.replace(/(\s(?:href|src|action))="\/(?!\/)([^"]*)"/g, (m, attr, rest) =>
                ("/" + rest).startsWith(b + "/") || "/" + rest === b ? m : `${attr}="${b}/${rest}"`);
              if (out !== html) await writeFile(p, out);
            }
          }
        };
        await walk(root);
      },
    },
  };
}

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  redirects: {
    "/methods/llob": "/methods/zbroux/",
    "/methods/fslz": "/methods/zbroux/",
    "/llob": "/methods/zbroux/",
    "/zbroux": "/methods/zbroux/",
  },
  integrations: [prefixRootLinks()],
});
