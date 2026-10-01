/**
 * Kept out of actions.ts on purpose. A "use server" module may export only async
 * functions — an exported object or type-adjacent constant throws
 * `A "use server" file can only export async functions, found object` at module
 * evaluation, and `next build` does not catch it: only `next dev` reports it.
 * Types are erased and would be safe, but the initial state value is not, so
 * both live here where neither can trip that wire.
 */
export type GateState = {
  error: string | null;
  /** Re-keys the input so a rejected attempt clears the field on remount. */
  attempt: number;
};

export const INITIAL_GATE_STATE: GateState = { error: null, attempt: 0 };
