import esbuild from "esbuild";
import { globSync } from "glob";
import packageJson from "../package.json" assert { type: "json" };

const DIST_FOLDER = "dist";

const files = globSync("{./src/**/*.ts, ./src/**/*.tsx}");

const baseConfig = {
  entryPoints: files,
  loader: {
    ".tsx": "tsx",
  },
  define: { "process.env.NODE_ENV": `'production'` },
  external: Object.keys(packageJson.peerDependencies),
  bundle: true,
  sourcemap: true,
  treeShaking: true,
  minify: true,
  metafile: true,
  tsconfig: "./tsconfig.json",
};

const cjsConfig = {
  ...baseConfig,
  format: "cjs",
  splitting: false,
  outdir: `${DIST_FOLDER}/cjs`,
};

const esmConfig = {
  ...baseConfig,
  format: "esm",
  splitting: true,
  outdir: `${DIST_FOLDER}/esm`,
};

async function build() {
  await Promise.all([
    esbuild.build(cjsConfig),
    esbuild.build(esmConfig),
  ]).catch(
    (error) => {
      console.error(error);
      process.exit(1);
    },
  );
}

await build();
