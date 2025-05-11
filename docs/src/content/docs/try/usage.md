---
title: Usage
next: false
prev: false
---

The `Try` monad represents a computation that may fail.

## Creating a Try

You can create a `Try` using the static method `Try.execute`.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.execute(() => 42); // Success(42)

const failure = Try.execute(() => {
  throw new Error('Error');
}); // Failure(Error('Error'))
```

## Using `map`

You can use the `map` method to transform the value inside a `Success`.

```typescript
import { Try } from '@leanmind/monads';

m

const success = Try.execute(() => 42).map(x => x + 1); // Success(43)
```

## Using `flatMap`

You can use the `flatMap` method to transform the value inside a `Success` with a fallible closure.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.execute(() => 42).flatMap(x => Try.execute(() => x + 1)); // Success(43)
```

## Matching a Try

You can use the `match` method to handle both `Success` and `Failure` cases and unwrap the result.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.execute(() => 42).match(
  err => `Error: ${err}`,
  x => x + 1
); // 43

const failure = Try.execute(() => {
  throw new Error('Error');
}).match(
  err => `Error: ${err}`,
  x => x + 1
); // 'Error: Error'
```

## Handling errors in Infrastructure code

Normally, Try is used to handle `Exceptions` that are raise by third party libraries

```typescript
import { Try } from '@leanmind/monads';

const result = Try.execute(() => {
  // Some API of a library that may throw an exception
  return 42;
}).match(
  err => `Error: ${err}`,
  x => x + 1
);

console.log(result); // 43
```

## Checking if a Try is Success or Failure

If needed, you can check explicitly if a `Try` is `Success` or `Failure` using the `isSuccess` and `isFailure` methods.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.execute(() => 42);
success.isSuccess(); // true

const failure = Try.execute(() => {
  throw new Error('Error');
});
failure.isFailure(); // true
```
