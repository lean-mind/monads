export type Nullable<T> = T | null | undefined;
export type Present<T> = Exclude<T, null | undefined>;
