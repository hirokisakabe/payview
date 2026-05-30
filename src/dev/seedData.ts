import type { Category, CategoryRule, PaymentFile } from "../data";

const FOOD_ID = "seed-cat-food";
const TRANSPORT_ID = "seed-cat-transport";
const ENTERTAINMENT_ID = "seed-cat-entertainment";
const DAILY_ID = "seed-cat-daily";
const TELECOM_ID = "seed-cat-telecom";
const MEDICAL_ID = "seed-cat-medical";

export const SEED_CATEGORIES: Category[] = [
  { id: FOOD_ID, name: "食費", order: 0 },
  { id: TRANSPORT_ID, name: "交通費", order: 1 },
  { id: ENTERTAINMENT_ID, name: "娯楽費", order: 2 },
  { id: DAILY_ID, name: "日用品", order: 3 },
  { id: TELECOM_ID, name: "通信費", order: 4 },
  { id: MEDICAL_ID, name: "医療費", order: 5 },
];

export const SEED_CATEGORY_RULES: CategoryRule[] = [
  {
    id: "seed-rule-food-1",
    categoryId: FOOD_ID,
    pattern: "スーパー",
    order: 0,
  },
  {
    id: "seed-rule-food-2",
    categoryId: FOOD_ID,
    pattern: "コンビニ",
    order: 1,
  },
  { id: "seed-rule-food-3", categoryId: FOOD_ID, pattern: "カフェ", order: 2 },
  {
    id: "seed-rule-food-4",
    categoryId: FOOD_ID,
    pattern: "レストラン",
    order: 3,
  },
  {
    id: "seed-rule-transport-1",
    categoryId: TRANSPORT_ID,
    pattern: "交通系IC",
    order: 0,
  },
  {
    id: "seed-rule-transport-2",
    categoryId: TRANSPORT_ID,
    pattern: "タクシー",
    order: 1,
  },
  {
    id: "seed-rule-entertainment-1",
    categoryId: ENTERTAINMENT_ID,
    pattern: "Netflix",
    order: 0,
  },
  {
    id: "seed-rule-entertainment-2",
    categoryId: ENTERTAINMENT_ID,
    pattern: "Amazon Prime",
    order: 1,
  },
  {
    id: "seed-rule-entertainment-3",
    categoryId: ENTERTAINMENT_ID,
    pattern: "Spotify",
    order: 2,
  },
  {
    id: "seed-rule-daily-1",
    categoryId: DAILY_ID,
    pattern: "ドラッグストア",
    order: 0,
  },
  {
    id: "seed-rule-daily-2",
    categoryId: DAILY_ID,
    pattern: "UNIQLO",
    order: 1,
  },
  {
    id: "seed-rule-telecom-1",
    categoryId: TELECOM_ID,
    pattern: "NTTドコモ",
    order: 0,
  },
  {
    id: "seed-rule-medical-1",
    categoryId: MEDICAL_ID,
    pattern: "病院",
    order: 0,
  },
  {
    id: "seed-rule-medical-2",
    categoryId: MEDICAL_ID,
    pattern: "薬局",
    order: 1,
  },
];

function makePayments(year: number, month: number): PaymentFile["payments"] {
  const mm = String(month).padStart(2, "0");
  const d = (day: number) => `${year}-${mm}-${String(day).padStart(2, "0")}`;

  return [
    { name: "スーパーマーケット", date: d(2), price: 3200, count: 1 },
    { name: "コンビニ セブン-イレブン", date: d(3), price: 850, count: 1 },
    { name: "交通系IC チャージ", date: d(5), price: 3000, count: 1 },
    { name: "カフェ スターバックス", date: d(6), price: 620, count: 1 },
    {
      name: "ドラッグストア マツモトキヨシ",
      date: d(8),
      price: 1540,
      count: 1,
    },
    { name: "レストラン 丸亀製麺", date: d(10), price: 780, count: 1 },
    { name: "Netflix", date: d(12), price: 1490, count: 1 },
    { name: "スーパーマーケット", date: d(14), price: 4100, count: 1 },
    { name: "タクシー GO", date: d(15), price: 1230, count: 1 },
    { name: "Amazon Prime", date: d(16), price: 600, count: 1 },
    { name: "コンビニ ファミリーマート", date: d(18), price: 420, count: 1 },
    { name: "UNIQLO", date: d(20), price: 5490, count: 1 },
    { name: "NTTドコモ", date: d(22), price: 4180, count: 1 },
    { name: "カフェ ドトール", date: d(24), price: 480, count: 1 },
    { name: "スーパーマーケット", date: d(26), price: 2980, count: 1 },
    { name: "Spotify", date: d(28), price: 980, count: 1 },
  ];
}

export const SEED_PAYMENT_FILES: PaymentFile[] = [
  { fileName: "2025-11.csv", payments: makePayments(2025, 11) },
  { fileName: "2025-12.csv", payments: makePayments(2025, 12) },
  { fileName: "2026-01.csv", payments: makePayments(2026, 1) },
  { fileName: "2026-02.csv", payments: makePayments(2026, 2) },
  { fileName: "2026-03.csv", payments: makePayments(2026, 3) },
  { fileName: "2026-04.csv", payments: makePayments(2026, 4) },
];
