# monads

This is a set of implementations of monads in TypeScript with OOP perspective.
It is a work in progress and the first monad implemented is the Either monad.

<!-- TOC -->
* [monads](#monads)
  * [Either Monad](#either-monad)
    * [Usage](#usage)
      * [Creating an Either](#creating-an-either)
      * [Creating Either from possible failed operations](#creating-either-from-possible-failed-operations)
      * [Mapping over an Either](#mapping-over-an-either)
        * [Using `flatMap` and `flatMapLeft`](#using-flatmap-and-flatmapleft)
        * [Using `map` and `mapLeft`](#using-map-and-mapleft)
      * [Matching an Either](#matching-an-either)
      * [checking if an Either is Right or Left](#checking-if-an-either-is-right-or-left)
      * [Chaining operations](#chaining-operations)
      * [Handling errors](#handling-errors)
  * [Option Monad](#option-monad)
    * [Usage](#usage-1)
      * [Creating an Option](#creating-an-option)
      * [Retrieving the value of an Option](#retrieving-the-value-of-an-option)
      * [Filtering an Option](#filtering-an-option)
      * [Mapping over an Option](#mapping-over-an-option)
        * [Using `flatMap`](#using-flatmap)
        * [Using `map`](#using-map)
      * [Matching an Option](#matching-an-option)
      * [Checking if an Option is Some or None](#checking-if-an-option-is-some-or-none)
<!-- TOC -->

## Either Monad

The `Either` monad represents a value of one of two possible types (a disjoint union).
An `Either` is either a `Left` or a `Right`.
By convention, `Right` is used to hold a successful value,
while `Left` is used to hold an error or failure.

### Usage

#### Creating an Either

You can create an `Either` using the static methods `Either.right` and `Either.left`.

```typescript
import { Either } from 'monads';

// Creating a Right
const right = Either.right(42);

// Creating a Left
const left = Either.left('Error');
```

#### Creating Either from possible failed operations

You can create an `Either` from a failed operations using the static method `Either.catch`.

```typescript
import { Either } from 'monads';

const findUser = (id: number): User => {
  if (id === 42) {
    return { id: 42, name: 'John Doe' };
  }
  throw new Error('User with id ${id} not found');
};

const right = Either.catch<User>(() => findUser(42)); // Right({ id: 42, name: 'John Doe' })
const left = Either.catch<User>(() => findUser(1)); // Left(Error('User with id 1 not found'))
```

#### Mapping over an Either

You can use the `flatMap` or `map`method to transform the value inside a `Right`, and `flatMapLeft` or `mapLeft` to
transform the value inside a `Left`.

##### Using `flatMap` and `flatMapLeft`

```typescript
const right = Either.right(42).flatMap(x => Either.right(x + 1)); // Right(43)
const left = Either.left('Error').flatMapLeft(err => Either.left(`New ${err}`)); // Left('New Error')
```

##### Using `map` and `mapLeft`

```typescript
const right = Either.right(42).map(x => x + 1); // Right(43)
const left = Either.left('Error').mapLeft(err => `New ${err}`); // Left('New Error')
```

#### Matching an Either

You can use the `match` method to handle both `Right` and `Left` cases and unwrap the result.

```typescript
const sucess = Either.right(42).match(
  err => `Error: ${err}`,
  x => (x + 1).toString()
); // '43'

const error = Either.left('Error').match(
  err => `Error: ${err}`,
  x => (x + 1).toString(),
); // 'Error: Error'
```

#### checking if an Either is Right or Left

You can check explicitly if an `Either` is `Right` or `Left` using the `isRight` and `isLeft` methods.
Probably you will not need to use these methods, but they are available
in case of refactoring from try-catch blocks or other situations.

```typescript
const right = Either.right(42);
const left = Either.left('Error');

right.isRight(); // true
right.isLeft(); // false
left.isRight(); // false
left.isLeft(); // true
```

#### Chaining operations

You can chain operations using the `map`, `mapLeft`, `flatMap` and `flatMapLeft` method.

The following example demonstrates how to chain operations using the map method:

```typescript
const result = Either.right(42)
  .map(x => x + 1)
  .map(x => x * 2)
  .match<string|number>(
    err => `Error: ${err}`,
    x => x
  );

console.log(result); // 86
```

#### Handling errors

Here is a complete example demonstrating the usage of the `Either` monad:

```typescript
import { Either } from 'monads';

function divide(a: number, b: number): Either<string, number> {
  if (b === 0) {
    return Either.left('Division by zero');
  }
  return Either.right(a / b);
}

const result = divide(10, 2)
  .map(x => x * 2)
  .match(
    err => `Error: ${err}`,
    value => `Result: ${value}`
  );

console.log(result); // 'Result: 10'
```

In this example, the divide function returns an `Either` that represents the result of the division or an error if the
division is by zero. The result is then transformed and matched to produce a final `string`.

## Option Monad

The `Option` monad represents a value that may or may not be present.
An `Option` is either a `Some` or a `None`.
`Some` is used to hold a value, while `None` is used to represent the absence of a value.

### Usage

#### Creating an Option

You can create an `Option` using the static methods `Option.of`.

```typescript
import { Option } from 'monads';

// Creating a Some
const some = Option.of(42); // Some(42)

// Creating a None
const none = Option.of(null); // None
```

#### Retrieving the value of an Option

You can use the `getOrElse` method to retrieve the value of an `Option` or provide a default value if it is `None`.

```typescript
const some = Option.of(42);
some.getOrElse(0); // 42

const none = Option.of(null);
none.getOrElse(0); // 0
```

#### Filtering an Option

You can use the `filter` method to keep the `Some` value if it satisfies a predicate.

```typescript
const some = Option.of(42).filter(x => x > 40); // Some(42)
const none = Option.of(42).filter(x => x > 50); // None
```

#### Mapping over an Option

You can use the `flatMap` or `map` method to transform the `Some` value.

##### Using `flatMap`

```typescript
const some = Option.of(42).flatMap(x => Option.of(x + 1)); // Some(43)
const none = Option.of(null).flatMap(x => Option.of(x + 1)); // None
```

##### Using `map`

```typescript
const some = Option.of(42).map(x => x + 1); // Some(43)
const none = Option.of(null).map(x => x + 1); // None
```

#### Matching an Option

You can use the `match` method to handle both `Some` and `None` cases and unwrap the result.

```typescript
const some = Option.of(42).match(
  x => x + 1,
  () => 'No value'
); // 43

const none = Option.of(null).match(
  x => x + 1,
  () => 'No value'
); // 'No value'
```

#### Checking if an Option is Some or None

If needed, you can check explicitly if an `Option` is `Some` or `None` using the `isSome` and `isNone` methods.

```typescript
const some = Option.of(42);
some.isSome(); // true
some.isNone(); // false

const none = Option.of(undefined);
none.isSome(); // false
none.isNone(); // true
```
