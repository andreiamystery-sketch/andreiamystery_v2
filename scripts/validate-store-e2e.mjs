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

const results = {};
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(5000);

for (const [slug, expected] of [
  ["grupo-belle-p2824-12941", "18,45"],
  ["grupo-belle-p2825-12944", "18,45"],
  ["grupo-belle-n0951-12943", "35,06"],
]) {
  await page.goto(`http://localhost:3000/produto/${slug}`, { waitUntil: "networkidle" });
  results[`price:${slug}`] = (await page.locator("main").innerText()).includes(expected);
}

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByPlaceholder("Pesquisar produto").fill("P2824");
const card = page.locator("article.group").filter({ hasText: "Colar 3 pedras quadrada GB" }).first();
results.cardPrice = (await card.innerText()).includes("18,45");
await card.getByRole("button", { name: /Adicionar Colar 3 pedras quadrada GB/ }).click();
await page.waitForTimeout(800);
results.cartCounterAfterAdd = (await page.locator(".pill-counter").allTextContents()).includes("1");
results.localStorageAfterAdd = await page.evaluate(() => localStorage.getItem("andreas-cart")?.includes("112941") ?? false);
results.noBrowserErrors = browserErrors.length === 0;
await page.getByRole("button", { name: "Carrinho", exact: true }).click();
results.singleLine = (await page.locator("aside").filter({ hasText: "Carrinho" }).getByText("Colar 3 pedras quadrada GB").count()) === 1;
await page.getByRole("button", { name: /Aumentar quantidade/ }).click();
results.quantityTwo = await page.locator("aside").getByText("2", { exact: true }).isVisible();
results.subtotalTwo = (await page.locator("aside").filter({ hasText: "Carrinho" }).innerText()).includes("36,90");

await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Carrinho", exact: true }).click();
results.persistence = (await page.locator("aside").filter({ hasText: "Carrinho" }).innerText()).includes("36,90");
await page.getByRole("button", { name: /Diminuir quantidade/ }).click();
results.decrease = await page.locator("aside").getByText("1", { exact: true }).isVisible();
await page.getByRole("button", { name: /Remover Colar 3 pedras quadrada GB/ }).click();
results.removal = (await page.locator("aside").filter({ hasText: "Carrinho" }).innerText()).includes("carrinho esta vazio");
results.emptyCheckoutDisabled = await page.getByRole("button", { name: "Finalizar encomenda" }).isDisabled();

await page.goto("http://localhost:3000/produto/grupo-belle-p2824-12941", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Adicionar ao carrinho/ }).click();
await page.locator(".pill-counter").filter({ hasText: "1" }).waitFor();
await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("button", { name: "Continuar" }).click();
results.invalidForm = (await page.locator("main").innerText()).includes("Indica o teu nome");

await page.locator("main label").filter({ hasText: /^Nome/ }).locator("input").fill("Cliente Teste");
await page.locator("main label").filter({ hasText: /^Email/ }).locator("input").fill("cliente@example.com");
await page.locator("main label").filter({ hasText: /^Telefone/ }).locator("input").fill("912345678");
await page.locator("main label").filter({ hasText: /^Morada/ }).locator("input").fill("Rua de Teste 1");
await page.locator("main label").filter({ hasText: /^Código postal/ }).locator("input").fill("1000-001");
await page.locator("main label").filter({ hasText: /^Localidade/ }).locator("input").fill("Lisboa");
await page.getByRole("button", { name: "Continuar" }).click();
results.validForm = (await page.locator("main").innerText()).includes("Entrega ou levantamento");
results.shippingSelection = await page.getByText("Envio para morada").isVisible();
results.pickupHiddenWithoutLocations = (await page.getByText(/Levantamento —/).count()) === 0;
await page.getByRole("button", { name: "Continuar" }).click();
results.reviewTotal = (await page.locator("main").innerText()).includes("18,45") && (await page.locator("main").innerText()).includes("A confirmar");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
results.mobileNoHorizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const hiddenResponse = await page.goto("http://localhost:3000/produto/grupo-belle-xlh6703-6908", { waitUntil: "networkidle" });
results.hiddenProduct404 = hiddenResponse?.status() === 404;

await browser.close();
const failures = Object.entries(results).filter(([, passed]) => !passed);
console.log(JSON.stringify({ results, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
