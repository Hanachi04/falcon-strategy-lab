# falcon-strategy-lab
Falcon Strategy Lab — منصة عربية لبناء واختبار توثيق استراتيجيات التداول الخوارزمية (مرحلة أولية: `engine-core`). Monorepo مبني باستخدام `TypeScript` و`Turborepo` و`pnpm workspaces`.

## الهيكل الحالي
- `packages/engine-core`: نواة أولية تحتوي على أنواع بيانات الشموع ومنطق backtest مبسط لاستراتيجية تقاطع المتوسطات المتحركة.
- `apps/lab-cli`: تطبيق CLI بسيط يستهلك `engine-core` ويشغّل مثالًا تجريبيًا.

## المتطلبات
- `Node.js 20+`
- `pnpm 9+`

## التثبيت
```bash
pnpm install
```

## الأوامر الرئيسية
```bash
pnpm build
pnpm dev
pnpm typecheck
```

## تشغيل المثال التجريبي
```bash
pnpm --filter @falcon/lab-cli dev
```

## الخطوة التالية المقترحة
- إضافة وحدة `strategy-docs` لتوثيق الاستراتيجيات.
- إضافة اختبارات تلقائية على `engine-core`.
- إدخال بيانات سوق حقيقية بدل البيانات التجريبية.
