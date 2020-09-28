// Shorter versions of commonly used types:
// Logic? Undefined is spoken with stronger 'u', so we call it U!
export type u = unknown;
export type U = undefined;

export type obj = Record<string, unknown>;

// Returns if data is a non-null object
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isObject(data: any): data is obj {
  return typeof data === 'object' && data !== null;
}


// Converts {a: b} & {b: c} to {a: b, b: c}
export type Id<T> = unknown & { [P in keyof T]: T[P] };