import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

export function usePaymentsFiles() {
  return useLiveQuery(() => db.paymentFiles.toArray());
}
