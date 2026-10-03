/*** Identify malformed JSON at the Next.js transport boundary without leaking parser internals. */
export class InvalidJsonBodyError extends Error {}
