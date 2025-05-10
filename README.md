# monads

This is a set of implementations of monads in TypeScript with OOP perspective.

<!-- TOC -->
* [monads](#monads)
  * [Installation](#installation)
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
  * [Try Monad](#try-monad)
    * [Usage](#usage-2)
    * [Using `map`](#using-map-1)
    * [Using `flatMap`](#using-flatmap-1)
    * [Retrieving the value](#retrieving-the-value)
    * [Matching a Try](#matching-a-try)
    * [Handling errors in Infrastructure code](#handling-errors-in-infrastructure-code)
    * [Checking if a Try is Success or Failure](#checking-if-a-try-is-success-or-failure)
  * [Future Monad](#future-monad)
    * [Usage](#usage-3)
      * [Creating a Future](#creating-a-future)
      * [Mapping over a Future](#mapping-over-a-future)
        * [Using `flatMap`](#using-flatmap-2)
        * [Using `map`](#using-map-2)
      * [Evaluate a Future](#evaluate-a-future)
  * [IO Monad](#io-monad)
    * [Usage](#usage-4)
      * [Creating an IO](#creating-an-io)
      * [Mapping over an IO](#mapping-over-an-io)
        * [Using `flatMap`](#using-flatmap-3)
        * [Using `map`](#using-map-3)
<!-- TOC -->

## Installation

You can install the package using npm:

```bash
npm install @leanmind/monads
```

## Either Monad

The `Either` monad represents a value of one of two possible types (a disjoint union).
An `Either` is either a `Left` or a `Right`.
By convention, `Right` is used to hold a successful value,
while `Left` is used to hold an error or failure.

### Usage

#### Creating an Either

You can create an `Either` using the static methods `Either.right` and `Either.left`.

```typescript
import { Either } from '@leanmind/monads';

// Creating a Right
const right = Either.right(42);

// Creating a Left
const left = Either.left('Error');
```

#### Creating Either from possible failed operations

You can create an `Either` from a failed operations using the static method `Either.catch`.

```typescript
import { Either } from '@leanmind/monads';

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
import { Either } from '@leanmind/monads';m

const right = Either.right(42).flatMap(x => Either.right(x + 1)); // Right(43)
const left = Either.left('Error').flatMapLeft(err => Either.left(`New ${err}`)); // Left('New Error')
```

##### Using `map` and `mapLeft`

```typescript
import { Either } from '@leanmind/monads';

const right = Either.right(42).map(x => x + 1); // Right(43)
const left = Either.left('Error').mapLeft(err => `New ${err}`); // Left('New Error')
```

#### Matching an Either

You can use the `match` method to handle both `Right` and `Left` cases and unwrap the result.

```typescript
import { Either } from '@leanmind/monads';

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
import { Either } from '@leanmind/monads';

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
import { Either } from '@leanmind/monads';

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
import { Either } from '@leanmind/monads';

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
import { Option } from '@leanmind/monads';

// Creating a Some
const some = Option.of(42); // Some(42)

// Creating a None
const none = Option.of(null); // None
```

#### Retrieving the value of an Option

You can use the `getOrElse` method to retrieve the value of an `Option` or provide a default value if it is `None`.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42);
some.getOrElse(0); // 42

const none = Option.of(null);
none.getOrElse(0); // 0
```

#### Filtering an Option

You can use the `filter` method to keep the `Some` value if it satisfies a predicate.

```typescript
import { Option } from '@leanmind/monads';m

const some = Option.of(42).filter(x => x > 40); // Some(42)
const none = Option.of(42).filter(x => x > 50); // None
```

#### Mapping over an Option

You can use the `flatMap` or `map` method to transform the `Some` value.

##### Using `flatMap`

```typescript
import { Option } from '@leanmind/monads';m

const some = Option.of(42).flatMap(x => Option.of(x + 1)); // Some(43)
const none = Option.of(null).flatMap(x => Option.of(x + 1)); // None
```

##### Using `map`

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42).map(x => x + 1); // Some(43)
const none = Option.of(null).map(x => x + 1); // None
```

#### Matching an Option

You can use the `match` method to handle both `Some` and `None` cases and unwrap the result.

```typescript
import { Option } from '@leanmind/monads';

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
import { Option } from '@leanmind/monads';

const some = Option.of(42);
some.isSome(); // true
some.isNone(); // false

const none = Option.of(undefined);
none.isSome(); // false
none.isNone(); // true
```

## Try Monad

The `Try` monad represents a computation that may fail.

### Usage

you can create a `Try` using the static method `Try.success` or `Try.failure`.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42); // Success(42)

const failure = Try.failure(new Error('Error')); // Failure(Error('Error'))
```

Also, you can create a `Try` using the static method `Try.execute` from a function that may throw an exception.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.execute(() => 42); // Success(42)

const failure = Try.execute(() => {
  throw new Error('Error');
}); // Failure(Error('Error'))
```

### Using `map`

You can use the `map` method to transform the value inside a `Success`.

```typescript
import { Try } from '@leanmind/monads';m

const success = Try.success(42).map(x => x + 1); // Success(43)
```

### Using `flatMap`

You can use the `flatMap` method to transform the value inside a `Success` with a fallible closure.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42).flatMap(x => Try.success(x + 1)); // Success(43)
```

### Retrieving the value

You can use the `getOrElse` method to retrieve the value of a `Success` or provide a default value if it is `Failure`.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.sucess(42);
const value = success.getOrElse(0); // 42

const failure = Try.failure(new Error('Error'));
const otherValue = failure.getOrElse(0); // 0
```

Also, you can use the `getOrThrow` method to retrieve the value of a `Success` or throw the error if it is `Failure`.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42);
const value = success.getOrThrow(); // 42

const failure = Try.failure(new Error('Error'));
const otherValue = failure.getOrThrow(); // throws Error('Error')
```

### Matching a Try

You can use the `match` method to handle both `Success` and `Failure` cases and unwrap the result.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.sucess(42).match(
  err => `Error: ${err}`,
  x => `${x + 1}`
); // '43'

const failure = Try.failure(new Error('Error')).match(
  err => `Error: ${err}`,
  x => `${x + 1}`
); // 'Error: Error'
```

### Handling errors in Infrastructure code

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

### Checking if a Try is Success or Failure

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

## Future Monad

The `Future` monad represents a computation that may be executed asynchronously.

### Usage

#### Creating a Future

You can create a `Future` using the static method `Future.of`.

```typescript
import { Future } from '@leanmind/monads';

const future = Future.of(() => Promise.resolve(42));
```

#### Mapping over a Future

You can use the `map` or `flatMap` method to transform the computed value inside a `Future`. The operation will not
execute the transformation (_lazy evaluation_) until `complete` method is called.

##### Using `flatMap`

```typescript
import { Future } from '@leanmind/monads';

const future = Future.of(() => Promise.resolve(42))
  .flatMap(x => Future.of(() => Promise.resolve(x + 1)))
  .complete(
    x => console.log(x),
    err => console.error(err)
  ); // 43
```

##### Using `map`

```typescript
import { Future } from '@leanmind/monads';

const future = Future.of(() => Promise.resolve(42))
  .map(x => x + 1)
  .complete(
    x => console.log(x),
    err => console.error(err)
  ); // 43
```

#### Evaluate a Future

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

## IO Monad

The `IO` monad represents a computation that may have side effects.

In this way, the `IO` monad is used to encapsulate side effects in a pure functional way.

So, you can operate as pure functions until you call the `runUnsafe` method.

### Usage

#### Creating an IO
You can create an `IO` using the static method `IO.of`.

```typescript
import { IO } from '@leanmind/monads';

const io = IO.of(() => 42);
```

#### Mapping over an IO

You can use the `flatMap` or `map` method to concatenate `IO` operations.

The operation is not executed until you call the `runUnsafe` method.

##### Using `flatMap`

```typescript
import { IO } from '@leanmind/monads';

const io = IO.of(() => 42).flatMap(x => IO.of(() => x + 1));

io.run(); // 43
```

##### Using `map`

```typescript
import { IO } from '@leanmind/monads';

const io = IO.of(() => 42).map(x => x + 1);

io.runUnsafe(); // 43
```








