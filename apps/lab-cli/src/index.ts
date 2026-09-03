import {
  type Candle,
  runSmaCrossoverBacktest
} from "@falcon/engine-core";

function createDemoCandles(size: number): Candle[] {
  const candles: Candle[] = [];
  let price = 100;

  for (let index = 0; index < size; index += 1) {
    const wave = Math.sin(index / 3) * 1.8;
    const drift = index * 0.22;
    const close = Number((100 + drift + wave).toFixed(2));
    const open = Number(price.toFixed(2));
    const high = Number((Math.max(open, close) + 0.9).toFixed(2));
    const low = Number((Math.min(open, close) - 0.9).toFixed(2));

    candles.push({
      timestamp: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      open,
      high,
      low,
      close,
      volume: 1000 + index * 17
    });

    price = close;
  }

  return candles;
}

function main(): void {
  const candles = createDemoCandles(60);
  const result = runSmaCrossoverBacktest(candles, {
    shortPeriod: 5,
    longPeriod: 12
  });

  console.log("Falcon Strategy Lab");
  console.log("===================");
  console.log("Initial engine-core demo");
  console.log("");
  console.log("Backtest summary:");
  console.table(result.summary);

  if (result.trades.length > 0) {
    console.log("Trades:");
    console.table(result.trades);
  } else {
    console.log("No trades were generated for the demo data.");
  }
}

main();
