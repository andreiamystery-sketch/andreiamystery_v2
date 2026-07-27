export function roundCurrency(value: number) {
  return Math.round(value * 10) / 10;
}

export function multiplyCurrency(value: number, multiplier: number) {
  const normalized = value.toString();
  const [whole, fraction = ""] = normalized.split(".");
  const scale = 10 ** fraction.length;
  const units = Number(whole) * scale + Number(fraction || 0);
  return Math.round((units * multiplier * 10) / scale) / 10;
}
