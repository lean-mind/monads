---
title: Usage
next: false
prev: false
---

The `Option` monad represents a value that may or may not be present.
An `Option` is either a `Some` or a `None`.
`Some` is used to hold a value, while `None` is used to represent the absence of a value.

## Creating an Option

You can create an `Option` using the static methods `Option.of`.

```typescript
import { Option } from '@leanmind/monads';

// Creating a Some
const some = Option.of(42); // Some(42)

// Creating a None
const none = Option.of(null); // None
```

## Retrieving the value of an Option

You can use the `getOrElse` method to retrieve the value of an `Option` or provide a default value if it is `None`.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42);
some.getOrElse(0); // 42

const none = Option.of(null);
none.getOrElse(0); // 0
```

## Filtering an Option

You can use the `filter` method to keep the `Some` value if it satisfies a predicate.

```typescript
import { Option } from '@leanmind/monads';m

const some = Option.of(42).filter(x => x > 40); // Some(42)
const none = Option.of(42).filter(x => x > 50); // None
```

## Mapping over an Option

You can use the `flatMap` or `map` method to transform the `Some` value.

### Using `flatMap`

```typescript
import { Option } from '@leanmind/monads';m

const some = Option.of(42).flatMap(x => Option.of(x + 1)); // Some(43)
const none = Option.of(null).flatMap(x => Option.of(x + 1)); // None
```

### Using `map`

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42).map(x => x + 1); // Some(43)
const none = Option.of(null).map(x => x + 1); // None
```

## Matching an Option

You can use the `match` method to handle both `Some` and `None` cases and unwrap the result.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42).match(
  x => x + 1,
  () => 0
); // 43

const none = Option.of(null).match(
  x => x + 1,
  () => 0
); // 0
```

## Checking if an Option is Some or None

If needed, you can check explicitly if an `Option` is `Some` or `None` using the `isSome` and `isNone` methods.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42);
some.isSome(); // true
some.isNone(); // false

const none = Option.of(undefined);
none.isSome(); // false
none.isNone(); // true
```