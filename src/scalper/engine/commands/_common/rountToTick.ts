export const roundToTick = (value: number, tickSize: number, priceScale: number) =>
  (Math.ceil(value / tickSize) * tickSize).toFixed(priceScale);
