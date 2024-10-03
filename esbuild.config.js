const esbuild = require("esbuild");
const { execSync } = require("child_process");

// 'src' 디렉터리에서 'example.ts' 제외한 모든 .ts 파일 찾기
const tsFiles = execSync("find src -name '*.ts' ! -path 'src/example/*'", {
  encoding: "utf-8",
})
  .split("\n")
  .filter(Boolean);

esbuild
  .build({
    entryPoints: tsFiles,
    platform: "node",
    target: "esnext",
    outdir: "dist",
    format: "cjs",
    bundle: true,
    minify: true,
    logLevel: "info",
  })
  .catch(() => process.exit(1));
