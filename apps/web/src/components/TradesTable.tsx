import type { BacktestTrade } from "@falcon/engine-core";

interface TradesTableProps {
  trades: BacktestTrade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <div className="table-shell">
      <table className="trades-table">
        <thead>
          <tr>
            <th>الدخول</th>
            <th>الخروج</th>
            <th>سعر الدخول</th>
            <th>سعر الخروج</th>
            <th>الربح/الخسارة</th>
            <th>العائد %</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={`${trade.enteredAt}-${trade.exitedAt}`}>
              <td>{new Date(trade.enteredAt).toLocaleDateString("ar-EG")}</td>
              <td>{new Date(trade.exitedAt).toLocaleDateString("ar-EG")}</td>
              <td>{trade.entryPrice.toFixed(2)}</td>
              <td>{trade.exitPrice.toFixed(2)}</td>
              <td className={trade.profitLoss >= 0 ? "positive" : "negative"}>
                {trade.profitLoss.toFixed(2)}
              </td>
              <td className={trade.returnPct >= 0 ? "positive" : "negative"}>
                {trade.returnPct.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
