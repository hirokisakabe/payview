import { z } from "zod";

export const paymentSchema = z.object({
  date: z.string(),
  name: z.string(),
  price: z.string().transform((val) => parseInt(val, 10)),
  count: z.string().transform((val) => parseInt(val, 10)),
});

export type Payment = z.infer<typeof paymentSchema>;
