export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface StrategyConfig {
  shortPeriod: number;
  longPeriod: number;
}

export interface BacktestTrade {
  enteredAt: string;
  exitedAt: string;
  entryPrice: number;
  exitPrice: number;
  profitLoss: number;
  returnPct: number;
}

export interface BacktestSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  netProfit: number;
  totalReturnPct: number;
  maxDrawdownPct: number;
}

export interface BacktestResult {
  config: StrategyConfig;
  trades: BacktestTrade[];
  summary: BacktestSummary;
}

const DEFAULT_CONFIG: StrategyConfig = {
  shortPeriod: 5,
  longPeriod: 20
};

function assertValidConfig(config: StrategyConfig): void {
  if (config.shortPeriod < 2) {
    throw new Error("shortPeriod must be greater than or equal to 2.");
  }

  if (config.longPeriod <= config.shortPeriod) {
    throw new Error("longPeriod must be greater than shortPeriod.");
  }
}

export function calculateSimpleMovingAverage(
  values: number[],
  period: number
): Array<number | null> {
  if (period < 1) {
    throw new Error("period must be greater than zero.");
  }

  const result: Array<number | null> = [];
  let rollingSum = 0;

  for (let index = 0; index < values.length; index += 1) {
    const currentValue = values[index];

    if (currentValue === undefined) {
      continue;
    }

    rollingSum += currentValue;

    if (index >= period) {
      const expiredValue = values[index - period];

      if (expiredValue !== undefined) {
        rollingSum -= expiredValue;
      }
    }

    if (index < period - 1) {
      result.push(null);
      continue;
    }

    result.push(rollingSum / period);
  }

  return result;
}

function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) {
    return 0;
  }

  const firstEquity = equityCurve[0];

  if (firstEquity === undefined) {
    return 0;
  }

  let peak = firstEquity;
  let maxDrawdown = 0;

  for (const equity of equityCurve) {
    if (equity > peak) {
      peak = equity;
    }

    if (peak === 0) {
      continue;
    }

    const drawdown = ((peak - equity) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return Number(maxDrawdown.toFixed(2));
}

export function runSmaCrossoverBacktest(
  candles: Candle[],
  config: Partial<StrategyConfig> = {}
): BacktestResult {
  const resolvedConfig: StrategyConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };

  assertValidConfig(resolvedConfig);

  if (candles.length < resolvedConfig.longPeriod + 1) {
    throw new Error("Not enough candles to run the backtest.");
  }

  const closes = candles.map((candle) => candle.close);
  const shortSma = calculateSimpleMovingAverage(closes, resolvedConfig.shortPeriod);
  const longSma = calculateSimpleMovingAverage(closes, resolvedConfig.longPeriod);

  let entryPrice: number | null = null;
  let enteredAt: string | null = null;
  const trades: BacktestTrade[] = [];
  const equityCurve: number[] = [0];
  let netProfit = 0;

  for (let index = 1; index < candles.length; index += 1) {
    const currentShort = shortSma[index];
    const currentLong = longSma[index];
    const previousShort = shortSma[index - 1];
    const previousLong = longSma[index - 1];
    const currentCandle = candles[index];

    if (
      currentShort === undefined ||
      currentLong === undefined ||
      previousShort === undefined ||
      previousLong === undefined ||
      currentShort === null ||
      currentLong === null ||
      previousShort === null ||
      previousLong === null ||
      currentCandle === undefined
    ) {
      continue;
    }

    const bullishCross = previousShort <= previousLong && currentShort > currentLong;
    const bearishCross = previousShort >= previousLong && currentShort < currentLong;

    if (bullishCross && entryPrice === null) {
      entryPrice = currentCandle.close;
      enteredAt = currentCandle.timestamp;
      continue;
    }

    if (bearishCross && entryPrice !== null && enteredAt !== null) {
      const exitPrice = currentCandle.close;
      const profitLoss = Number((exitPrice - entryPrice).toFixed(4));
      const returnPct = Number((((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2));

      trades.push({
        enteredAt,
        exitedAt: currentCandle.timestamp,
        entryPrice,
        exitPrice,
        profitLoss,
        returnPct
      });

      netProfit += profitLoss;
      equityCurve.push(Number(netProfit.toFixed(4)));
      entryPrice = null;
      enteredAt = null;
    }
  }

  if (entryPrice !== null && enteredAt !== null) {
    const lastCandle = candles[candles.length - 1];

    if (lastCandle === undefined) {
      throw new Error("Unable to read the final candle.");
    }

    const exitPrice = lastCandle.close;
    const profitLoss = Number((exitPrice - entryPrice).toFixed(4));
    const returnPct = Number((((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2));

    trades.push({
      enteredAt,
      exitedAt: lastCandle.timestamp,
      entryPrice,
      exitPrice,
      profitLoss,
      returnPct
    });

    netProfit += profitLoss;
    equityCurve.push(Number(netProfit.toFixed(4)));
  }

  const winningTrades = trades.filter((trade) => trade.profitLoss > 0).length;
  const losingTrades = trades.filter((trade) => trade.profitLoss <= 0).length;
  const totalReturnPct = trades.reduce((sum, trade) => sum + trade.returnPct, 0);

  return {
    config: resolvedConfig,
    trades,
    summary: {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate: trades.length === 0 ? 0 : Number(((winningTrades / trades.length) * 100).toFixed(2)),
      netProfit: Number(netProfit.toFixed(4)),
      totalReturnPct: Number(totalReturnPct.toFixed(2)),
      maxDrawdownPct: calculateMaxDrawdown(equityCurve)
    }
  };
}
