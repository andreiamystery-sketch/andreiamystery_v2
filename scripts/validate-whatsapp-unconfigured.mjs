import { createRequire } from "node:module";
import process from "node:process";

const runtimeModules = process.env.CODEX_RUNTIME_NODE_MODULES;
if (!runtimeModules) throw new Error("Define CODEX_RUNTIME_NODE_MODULES para executar esta validação.");
const require = createRequire(`${runtimeModules}/package.json`);
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("andreas-cart", JSON.stringify([{ productId: "andreas-1", quantity: 1 }])));
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByLabel("Nome completo").fill("Cliente Teste");
await page.getByLabel("Email").fill("cliente@example.com");
await page.getByLabel("Telefone").fill("912345678");
await page.getByLabel("Morada").fill("Rua de Teste 1");
await page.getByLabel("Código postal").fill("1000-001");
await page.getByLabel("Localidade").fill("Lisboa");
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("button", { name: "Continuar" }).click();
const button = page.getByRole("button", { name: "Finalizar encomenda no WhatsApp" });
const results = {
  configurationMessage: (await page.locator("main").innerText()).includes("WhatsApp da loja ainda não está configurado"),
  finalButtonDisabled: await button.isDisabled(),
  noInvalidLink: (await page.locator('a[href^="https://wa.me/"]').count()) === 0,
};
await browser.close();
const failures = Object.entries(results).filter(([, passed]) => !passed);
console.log(JSON.stringify({ results, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
