import { beforeEach, expect, test, vi } from "vitest";
import { seedIfNeeded } from "./seed";

vi.mock("../data", () => ({
  db: {
    paymentFiles: {
      count: vi.fn(),
      bulkPut: vi.fn(),
    },
    categories: {
      bulkPut: vi.fn(),
    },
    categoryRules: {
      bulkPut: vi.fn(),
    },
    transaction: vi.fn(
      (_mode: unknown, _tables: unknown, callback: () => Promise<void>) =>
        callback(),
    ),
  },
}));

import { db } from "../data";

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

test("VITE_ENABLE_SEED が未設定のとき、何も実行されない", async () => {
  await seedIfNeeded();

  expect(db.paymentFiles.count).not.toHaveBeenCalled();
  expect(db.transaction).not.toHaveBeenCalled();
});

test("VITE_ENABLE_SEED=true かつ paymentFiles が空でないとき、スキップする", async () => {
  vi.stubEnv("VITE_ENABLE_SEED", "true");
  vi.mocked(db.paymentFiles.count).mockResolvedValue(3);

  await seedIfNeeded();

  expect(db.transaction).not.toHaveBeenCalled();
});

test("VITE_ENABLE_SEED=true かつ paymentFiles が空のとき、3テーブルに bulkPut する", async () => {
  vi.stubEnv("VITE_ENABLE_SEED", "true");
  vi.mocked(db.paymentFiles.count).mockResolvedValue(0);

  await seedIfNeeded();

  expect(db.transaction).toHaveBeenCalledOnce();
  expect(db.paymentFiles.bulkPut).toHaveBeenCalledOnce();
  expect(db.categories.bulkPut).toHaveBeenCalledOnce();
  expect(db.categoryRules.bulkPut).toHaveBeenCalledOnce();
});
