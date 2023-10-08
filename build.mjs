import esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";
import { globSync } from "glob";

const DIST_FOLDER = "dist";

const files = globSync("{./src/**/!(*.test).ts, ./src/**/!(*.test).tsx}");

const baseConfig = {
  entryPoints: files,
  loader: {
    ".tsx": "tsx",
  },
  define: { "process.env.NODE_ENV": `'production'` },
  external: ["react", "react-dom"],
  bundle: true,
  sourcemap: true,
  treeShaking: true,
  minify: true,
  metafile: true,
  tsconfig: "./tsconfig.json",
  plugins: [
    nodeExternalsPlugin(),
  ],
};

const esmConfig = {
  ...baseConfig,
  format: "esm",
  splitting: true,
  outdir: `${DIST_FOLDER}/esm`,
};

async function build() {
  await Promise.all([esbuild.build(esmConfig)]).catch(
    () => process.exit(1),
  );
}

await build();
