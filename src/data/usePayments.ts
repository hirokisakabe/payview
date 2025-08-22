import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

type Props = {
  fileName: string;
};

export function usePayments({ fileName }: Props) {
  const files = useLiveQuery(() =>
    db.paymentFiles.where("fileName").equals(fileName).toArray(),
  );
  const file = files ? files[0] : undefined;

  if (!file) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, payments: file.payments };
}
