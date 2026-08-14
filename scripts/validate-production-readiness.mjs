import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

const checks = {
  stripeServerExists: exists("lib/stripe/server.ts"),
  stripeWebhookExists: exists("app/api/stripe/webhook/route.ts"),
  checkoutServerActionExists: exists("app/checkout/actions.ts"),
  goLiveChecklistExists: exists("docs/GO-LIVE-CHECKLIST.md"),
};

const packageJson = JSON.parse(read("package.json"));
const paymentConfig = read("config/payments.ts");
const checkoutAction = read("app/checkout/actions.ts");
const webhook = read("app/api/stripe/webhook/route.ts");
const envExample = read(".env.example");
const chatbotKnowledge = read("data/chatbot/knowledge.json");
const legal = read("data/legal.ts");

checks.noInstagramPublisherScripts = !Object.keys(packageJson.scripts ?? {}).some((script) =>
  /^instagram:(?:setup|test|publish|schedule|stories|reels|browser|scheduler|start|launch:publish)$/.test(script),
);
checks.cardProductionMethodConfigured = paymentConfig.includes('id: "Cartão de crédito"') && paymentConfig.includes('productionOnly: true');
checks.stripeTestMethodConfigured = paymentConfig.includes('id: "Stripe Checkout Test"') && paymentConfig.includes('testOnly: true');
checks.mbWayUsesStripe = paymentConfig.includes('if (method === "MB Way") return "mb_way"');
checks.cardUsesStripe = paymentConfig.includes('if (method === "Cartão de crédito") return "card"');
checks.checkoutDoesNotRequireAutomaticInventory = !checkoutAction.includes("validateInventoryForOrder") && !checkoutAction.includes("product_inventory");
checks.checkoutStillUsesPublishedProducts = checkoutAction.includes("getPublishedProducts()") && checkoutAction.includes("Um produto deixou de estar disponível");
checks.checkoutUsesOfficialPrices = checkoutAction.includes("unitPriceCents = Math.round(product.price * 100)") && !checkoutAction.includes("unit_price: requested");
checks.checkoutStillCreatesOrders = checkoutAction.includes('.from("orders")') && checkoutAction.includes(".insert({");
checks.webhookValidatesSignature = webhook.includes("constructStripeWebhookEvent(await request.text(), signature)");
checks.webhookClaimsEvents = webhook.includes("claimWebhookEvent(event)");
checks.webhookValidatesAmount = webhook.includes("validateAmount(order");
checks.webhookDoesNotDebitAutomaticInventory = !webhook.includes("decrementInventoryForPaidOrder") && !webhook.includes("decrement_order_inventory_once");
checks.webhookSendsPaidEmail = webhook.includes('sendOrderNotification({ ...order, payment_status: "pago"');
checks.envDocumentsLiveMode = envExample.includes("PAYMENTS_TEST_MODE=false") && envExample.includes("sk_live_") && envExample.includes("pk_live_");
checks.chatbotDoesNotPromiseActiveMultibancoReference = chatbotKnowledge.includes("referência Multibanco está preparada para futuro") && !chatbotKnowledge.includes("cartão de crédito e referência Multibanco.");
checks.legalDoesNotPromiseInactiveMultibancoReference = legal.includes("A referência Multibanco está preparada para futuro, mas não está ativa");

const failures = Object.entries(checks).filter(([, passed]) => !passed);
console.log(JSON.stringify({ checks, failures }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
