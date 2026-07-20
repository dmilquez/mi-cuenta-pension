import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Spanish pension calculator shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Mi Cuenta Pensión/);
  assert.match(html, /Calculadora pensional/);
  assert.match(html, /57 años/);
  assert.match(html, /62 para hombres/);
  assert.match(html, /No enviamos tu nombre ni tu fecha de nacimiento/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("implements cookie privacy and legal thresholds", async () => {
  const [page, logic, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/pension.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /SameSite=Lax/);
  assert.match(page, /Max-Age=31536000/);
  assert.match(page, /Borrar mis datos/);
  assert.match(logic, /sex === "mujer" \? 57 : 62/);
  assert.match(layout, /lang="es"/);
});
