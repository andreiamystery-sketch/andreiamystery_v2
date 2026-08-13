export function isPaymentsTestModeEnabled() {
  return process.env.PAYMENTS_TEST_MODE !== "false";
}

export function getPaymentsMode() {
  return isPaymentsTestModeEnabled() ? "test" : "live";
}
