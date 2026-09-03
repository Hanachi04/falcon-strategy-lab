import { useMemo, useState } from "react";
import { runSmaCrossoverBacktest } from "@falcon/engine-core";
import { MetricCard } from "./components/MetricCard";
import { TradesTable } from "./components/TradesTable";
import { createDemoCandles } from "./data/demoCandles";

const demoCandles = createDemoCandles(120);

export default function App() {
  const [shortPeriod, setShortPeriod] = useState(5);
  const [longPeriod, setLongPeriod] = useState(12);

  const result = useMemo(() => {
    return runSmaCrossoverBacktest(demoCandles, {
      shortPeriod,
      longPeriod
    });
  }, [shortPeriod, longPeriod]);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="badge">المرحلة الثانية</span>
          <h1>Falcon Strategy Lab</h1>
          <p className="lead">
            واجهة ويب أولية قابلة للتوسع لتوثيق واختبار استراتيجيات التداول الخوارزمية
            بالاعتماد على نواة `engine-core`.
          </p>
        </div>

        <div className="hero-card">
          <h2>إعداد الاستراتيجية</h2>
          <div className="controls">
            <label>
              <span>الفترة القصيرة</span>
              <input
                type="number"
                min={2}
                max={20}
                value={shortPeriod}
                onChange={(event) => setShortPeriod(Number(event.target.value))}
              />
            </label>

            <label>
              <span>الفترة الطويلة</span>
              <input
                type="number"
                min={3}
                max={50}
                value={longPeriod}
                onChange={(event) => setLongPeriod(Number(event.target.value))}
              />
            </label>
          </div>
          <p className="helper-text">
            يتم احتساب نتائج تجريبية مباشرةً على بيانات سوق وهمية قابلة للاستبدال لاحقًا
            ببيانات حقيقية.
          </p>
        </div>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>ملخص الـ Backtest</h2>
              <p>نتائج محسوبة لحظيًا من `engine-core` داخل المتصفح.</p>
            </div>
          </div>

          <div className="metrics-grid">
            <MetricCard label="عدد الصفقات" value={result.summary.totalTrades} />
            <MetricCard label="معدل النجاح" value={`${result.summary.winRate}%`} />
            <MetricCard label="صافي الربح" value={result.summary.netProfit.toFixed(2)} />
            <MetricCard
              label="إجمالي العائد"
              value={`${result.summary.totalReturnPct.toFixed(2)}%`}
            />
            <MetricCard
              label="أقصى تراجع"
              value={`${result.summary.maxDrawdownPct.toFixed(2)}%`}
            />
            <MetricCard
              label="الإعداد الحالي"
              value={`${result.config.shortPeriod}/${result.config.longPeriod}`}
              hint="قصير / طويل"
            />
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>خريطة المرحلة الثانية</h2>
              <p>أساس قوي يمكن البناء عليه خلال المراحل القادمة.</p>
            </div>
          </div>

          <ul className="roadmap-list">
            <li>فصل الواجهة عن منطق الاستراتيجيات عبر `@falcon/engine-core`.</li>
            <li>اعتماد تطبيق ويب مستقل داخل `apps/web` لتسهيل التوسع.</li>
            <li>تهيئة بنية قابلة لإضافة API أو مصادقة أو قاعدة بيانات لاحقًا.</li>
            <li>عرض النتائج والإعدادات داخل تجربة عربية أولية وواضحة.</li>
          </ul>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>سجل الصفقات</h2>
            <p>الصفقات الناتجة عن استراتيجية تقاطع المتوسطات المتحركة.</p>
          </div>
        </div>

        {result.trades.length > 0 ? (
          <TradesTable trades={result.trades} />
        ) : (
          <p className="empty-state">لا توجد صفقات ناتجة عن الإعدادات الحالية.</p>
        )}
      </section>
    </main>
  );
}
