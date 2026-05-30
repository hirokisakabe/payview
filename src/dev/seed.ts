import { db } from "../data";
import {
  SEED_CATEGORIES,
  SEED_CATEGORY_RULES,
  SEED_PAYMENT_FILES,
} from "./seedData";

export async function seedIfNeeded(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_SEED !== "true") return;

  const count = await db.paymentFiles.count();
  if (count > 0) return;

  await db.transaction(
    "rw",
    [db.paymentFiles, db.categories, db.categoryRules],
    async () => {
      await db.paymentFiles.bulkAdd(SEED_PAYMENT_FILES);
      await db.categories.bulkAdd(SEED_CATEGORIES);
      await db.categoryRules.bulkAdd(SEED_CATEGORY_RULES);
    },
  );
}
