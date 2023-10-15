import esbuild from "esbuild";
import chokidar from "chokidar";
import liveServer from "live-server";

const FOLDER = "example";

const baseConfig = {
  entryPoints: ["src/example.dev.tsx"],
  loader: {
    ".tsx": "tsx",
  },
  define: { "process.env.NODE_ENV": `'development'` },
  bundle: true,
  sourcemap: true,
  minify: true,
  metafile: true,
};

const esmConfig = {
  ...baseConfig,
  format: "esm",
  outfile: `${FOLDER}/dev.mjs`,
};

const builder = await esbuild.context(esmConfig);

chokidar.watch("src/**/*.{ts,tsx}", {
  interval: 0,
}).on("all", (eventName, path) => {
  const startTime = Date.now();
  console.log(`${eventName} ${path}`);

  builder.rebuild().then(() => {
    const endTime = Date.now();
    console.log(`Build time: ${endTime - startTime}ms`);
  });
});

liveServer.start({
  // Opens the local server on start.
  open: true,
  // Uses `PORT=...` or 8080 as a fallback.
  port: +process.env.PORT || 8080,
  // Uses `public` as the local server folder.
  root: FOLDER,
});
