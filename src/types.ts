export type Nullable<T> = T | null | undefined;
//type NotNullable<T> = T extends null | undefined ? never : T
export type NotNullable<T> = Exclude<T, null | undefined>;
