import { createRequire } from "node:module";
import process from "node:process";

const runtimeModules = process.env.CODEX_RUNTIME_NODE_MODULES;
if (!runtimeModules) throw new Error("Define CODEX_RUNTIME_NODE_MODULES para executar esta validação.");
const require = createRequire(`${runtimeModules}/package.json`);
const { chromium } = require("playwright");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(() => {
  window.__openedWhatsAppUrls = [];
  window.open = (url) => {
    window.__openedWhatsAppUrls.push(String(url));
    return null;
  };
});
const page = await context.newPage();
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));
const results = {};

await page.goto("http://localhost:3000/produto/anel-delicate-duas-aliancas", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Aumentar quantidade" }).click();
await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
results.addQuantityTwo = (await page.locator(".pill-counter").allTextContents()).includes("2");
results.minimalStableStorage = await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem("andreas-cart") ?? "[]");
  return stored.length === 1 && stored[0].productId === "andreas-1" && stored[0].quantity === 2 && !("price" in stored[0]);
});

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
results.persistence =
  (await page.locator(".pill-counter").allTextContents()).includes("2") &&
  (await page.evaluate(() => JSON.parse(localStorage.getItem("andreas-cart") ?? "[]")[0]?.quantity)) === 2;
await page.getByRole("button", { name: "Carrinho", exact: true }).click();
await page.locator("aside").getByRole("button", { name: /Diminuir quantidade/ }).click();
results.decrease = await page.locator("aside").getByText("1", { exact: true }).isVisible();
await page.locator("aside").getByRole("button", { name: /Aumentar quantidade/ }).click();
results.increase = await page.locator("aside").getByText("2", { exact: true }).isVisible();
await page.getByRole("button", { name: /Fechar carrinho/ }).click();

await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("button", { name: "Continuar" }).click();
results.invalidForm = (await page.locator("main").innerText()).includes("Indica o teu nome");

await page.getByLabel("Nome completo").fill("Cliente Teste");
await page.getByLabel("Email").fill("cliente@example.com");
await page.getByLabel("Telefone").fill("912345678");
await page.getByLabel("Morada").fill("Rua de Teste 1");
await page.getByLabel("Código postal").fill("1000001");
await page.getByLabel("Localidade").fill("Lisboa");
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("button", { name: "Continuar" }).click();
results.invalidPostalCode = (await page.locator("main").innerText()).includes("Usa o formato 0000-000");
await page.getByLabel("Código postal").fill("1000-001");
await page.getByLabel("Observações (opcional)").fill("Por favor, confirmar disponibilidade.");
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("button", { name: "Continuar" }).click();
results.review = (await page.locator("main").innerText()).includes("Revisão da encomenda");
results.reviewProducts = (await page.locator("main").innerText()).includes("2 × Anel Delicate");
results.reviewShipping = (await page.locator("main").innerText()).includes("Portes") && (await page.locator("main").innerText()).includes("A confirmar");

await page.screenshot({
  path: "C:\\Users\\lalves\\OneDrive\\Desktop\\Andrea\\screenshots\\checkout-whatsapp-desktop.png",
});
await page.setViewportSize({ width: 390, height: 844 });
results.mobileNoOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
await page.screenshot({
  path: "C:\\Users\\lalves\\OneDrive\\Desktop\\Andrea\\screenshots\\checkout-whatsapp-mobile.png",
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByLabel("Confirmo que os dados da encomenda estão corretos.").check();
const finalButton = page.getByRole("button", { name: "Finalizar encomenda no WhatsApp" });
results.finalEnabled = await finalButton.isEnabled();
await finalButton.click();
await page.getByText("Encomenda preparada").waitFor({ state: "visible" });
results.confirmation = (await page.locator("main").innerText()).includes("Encomenda preparada");
results.orderNumber = /AM-\d{8}-[A-F0-9]{4}/.test(await page.locator("main").innerText());
const openedUrls = await page.evaluate(() => window.__openedWhatsAppUrls);
results.singleOpen = openedUrls.length === 1;
const openedUrl = openedUrls[0] ?? "";
results.validWhatsAppUrl = openedUrl.startsWith("https://wa.me/351916303632?text=");
const message = decodeURIComponent(openedUrl.split("?text=")[1] ?? "");
results.completeMessage = [
  "ENCOMENDA",
  "PRODUTOS",
  "Quantidade: 2",
  "Preço unitário:",
  "RESUMO",
  "CLIENTE",
  "ENTREGA",
  "OBSERVAÇÕES",
  "A aguardar confirmação",
].every((text) => message.includes(text));
results.noSupplierPrice = !message.includes("supplierPrice");
results.cartKept = await page.evaluate(() => JSON.parse(localStorage.getItem("andreas-cart") ?? "[]").length === 1);

const reopenLink = page.getByRole("link", { name: "Abrir novamente o WhatsApp" });
results.reopenAvailable = (await reopenLink.count()) === 1 && (await reopenLink.getAttribute("href")) === openedUrl;
results.noBrowserErrors = browserErrors.length === 0;

await browser.close();
const failures = Object.entries(results).filter(([, passed]) => !passed);
console.log(JSON.stringify({ results, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
