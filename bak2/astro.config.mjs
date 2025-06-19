import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: "https://sreeraj.in",
  integrations: [mdx(), pagefind()],
});
