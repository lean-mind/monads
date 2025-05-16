interface Railway<Acceptable, Unacceptable> {
  andThen<R>(transform: (value: Acceptable) => Railway<R, Unacceptable>): Railway<R, Unacceptable>;
  orElse<R>(f: (value: Unacceptable) => Railway<Acceptable, R>): Railway<Acceptable, R>;
  combineWith<T extends unknown[]>(others: Railway<unknown, Unacceptable>[]): Railway<[Acceptable, ...T], Unacceptable>;
}

export { Railway };
