export function isPaymentsTestModeEnabled() {
  return process.env.PAYMENTS_TEST_MODE === "true";
}
