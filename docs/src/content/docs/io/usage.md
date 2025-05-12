---
title: Usage
next: false
prev: false
---

The `IO` monad represents a computation that may have side effects.

In this way, the `IO` monad is used to encapsulate side effects in a pure functional way.

So, you can operate as pure functions until you call the `runUnsafe` method.

## Creating an IO

You can create an `IO` using the static method `IO.of`.

```typescript
import { IO } from '@leanmind/monads';

const io = IO.of(() => 42);
```

## Mapping over an IO

You can use the `flatMap` or `map` method to concatenate `IO` operations.

The operation is not executed until you call the `runUnsafe` method.

### Using `flatMap`

```typescript
import { IO } from '@leanmind/monads';

const io = IO.of(() => 42).flatMap(x => IO.of(() => x + 1));

io.run(); // 43
```

### Using `map`

```typescript
import { IO } from '@leanmind/monads';

const io = IO.of(() => 42).map(x => x + 1);

io.runUnsafe(); // 43
```
