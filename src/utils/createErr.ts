import { Err, err } from "neverthrow";

export function createErr<E extends Error>(error: E): Err<never, E> {
  console.error(error);

  return err(error);
}
