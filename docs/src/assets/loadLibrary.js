import * as Monads from 'https://unpkg.com/@leanmind/monads@latest/dist/esm/index.js';

window.Option = Monads.Option;
window.Try = Monads.Try;
window.Either = Monads.Either;
window.IO = Monads.IO;
window.Future = Monads.Future;

// eslint-disable-next-line no-console
console.info('⌨ Type `Either`, `Option`, `Try`, `IO`, or `Future` in the console to use the library!! 🙌🏻');
