import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist-pages");
const basePath = (process.argv[2] ?? "").replace(/\/$/, "");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "dist/client"), output, { recursive: true });

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", Date.now().toString());
const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("http://localhost/", { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) throw new Error(`No se pudo exportar: ${response.status}`);

let html = await response.text();
if (basePath) {
  html = html
    .replaceAll("/assets/", `${basePath}/assets/`)
    .replaceAll("/og.png", `${basePath}/og.png`);
}
await writeFile(resolve(output, "index.html"), html);
await writeFile(resolve(output, ".nojekyll"), "");

const manifest = await readFile(
  resolve(root, "dist/client/.vite/manifest.json"),
  "utf8",
);
if (!manifest.includes("page")) {
  throw new Error("La exportación no contiene el código de la página.");
}
