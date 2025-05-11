---
title: Usage
next: false
prev: false
---

The `Future` monad represents a computation that may be executed asynchronously.

## Creating a Future

You can create a `Future` using the static method `Future.of`.

```typescript
import { Future } from '@leanmind/monads';

const future = Future.of(() => Promise.resolve(42));
```

## Mapping over a Future

You can use the `map` or `flatMap` method to transform the computed value inside a `Future`. The operation will not
execute the transformation (_lazy evaluation_) until `complete` method is called.

### Using `flatMap`

```typescript
import { Future } from '@leanmind/monads';

const future = Future.of(() => Promise.resolve(42))
  .flatMap(x => Future.of(() => Promise.resolve(x + 1)))
  .complete(
    x => console.log(x),
    err => console.error(err)
  ); // 43
```

### Using `map`

```typescript
import { Future } from '@leanmind/monads';

const future = Future.of(() => Promise.resolve(42))
  .map(x => x + 1)
  .complete(
    x => console.log(x),
    err => console.error(err)
  ); // 43
```

## Evaluate a Future

You can evaluate a `Future` using the `complete` method. The `complete` method takes two functions as arguments:
one for the success case and one for the failure case.

```typescript
import { Future } from '@leanmind/monads';

const successFuture = Future.of(() => Promise.resolve(42));

await successFuture.complete(
  x => console.log(x),
  err => console.error(err)
); // 42

const failureFuture = Future.of(() => Promise.reject(new Error('Error')));

await failureFuture.complete(
  x => console.log(x),
  err => console.error(err)
); // Error('Error')
```
