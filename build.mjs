import esbuild from "esbuild";
import { execSync } from "child_process";
const DIST_FOLDER = "dist";

const baseConfig = {
  entryPoints: ["src/index.ts"],
  loader: {
    ".tsx": "tsx",
  },
  define: { "process.env.NODE_ENV": `'production'` },
  // target: ["chrome58", "firefox57", "safari11", "edge16"],
  external: ["react", "react-dom"],
  bundle: true,
  sourcemap: true,
  treeShaking: true,
  minify: true,
  metafile: true,
  tsconfig: "./tsconfig.json"
};

const esmConfig = {
  ...baseConfig,
  format: "esm",
  splitting: true,
  outdir: `${DIST_FOLDER}/esm`
};

const cjsConfig = {
  ...baseConfig,
  format: "cjs",
  splitting: false,
  outdir: `${DIST_FOLDER}/cjs`
};

function generateTypeDefs() {
  try {
    execSync("tsc", { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to generate type definitions:", error);
    process.exit(1);
  }
}

async function build() {
  // generateTypeDefs();
  await Promise.all([esbuild.build(esmConfig), esbuild.build(cjsConfig)]).catch(
    () => process.exit(1),
  );
}

await build();
