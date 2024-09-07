export type Nullable<T> = T | null | undefined;
export type Fallible<T> = () => T | Error;
