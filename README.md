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
      * [Recovering from a Left value](#recovering-from-a-left-value)
      * [Running side effects](#running-side-effects)
      * [Folding an Either](#folding-an-either)
      * [checking if an Either is Right or Left](#checking-if-an-either-is-right-or-left)
      * [Chaining operations](#chaining-operations)
      * [Handling errors](#handling-errors)
      * [Asynchronous Operations (AsyncEither)](#asynchronous-operations-asynceither)
        * [Creating an AsyncEither](#creating-an-asynceither)
        * [Mapping over an AsyncEither](#mapping-over-an-asynceither)
        * [Running side effects](#running-side-effects-1)
        * [Folding an AsyncEither](#folding-an-asynceither)
        * [Working with Promises](#working-with-promises)
        * [Handling asynchronous errors](#handling-asynchronous-errors)
  * [Option Monad](#option-monad)
    * [Usage](#usage-1)
      * [Creating an Option](#creating-an-option)
      * [Retrieving the value of an Option](#retrieving-the-value-of-an-option)
      * [Filtering an Option](#filtering-an-option)
      * [Mapping over an Option](#mapping-over-an-option)
        * [Using `flatMap`](#using-flatmap)
        * [Using `map`](#using-map)
      * [Running side effects](#running-side-effects-2)
      * [Folding an Option](#folding-an-option)
      * [Checking if an Option is Some or None](#checking-if-an-option-is-some-or-none)
  * [Try Monad](#try-monad)
    * [Usage](#usage-2)
      * [Using `map`](#using-map-1)
      * [Using `flatMap`](#using-flatmap-1)
      * [Running side effects](#running-side-effects-3)
      * [Retrieving the value](#retrieving-the-value)
      * [Folding a Try](#folding-a-try)
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
import { Either } from '@leanmind/monads';

m

const right = Either.right(42).flatMap(x => Either.right(x + 1)); // Right(43)
const left = Either.left('Error').flatMapLeft(err => Either.left(`New ${err}`)); // Left('New Error')
```

##### Using `map` and `mapLeft`

```typescript
import { Either } from '@leanmind/monads';

const right = Either.right(42).map(x => x + 1); // Right(43)
const left = Either.left('Error').mapLeft(err => `New ${err}`); // Left('New Error')
```

#### Recovering from a Left value

You can use the `recover` method to recover from a `Left` value and transform it into a `Right`.

```typescript
import { Either } from '@leanmind/monads';

const recoverIfEven = (x: number) => {
  if (x % 2 === 0) {
    return Either.right('Even');
  }
  return Either.left('Not even');
};

const right = Either.right<number, string>('irrelevant').recover(recoverIfEven); // Right('irrelevant')

const leftEven = Either.left<number, number>(42).recover(recoverIfEven); // Right('Even')
const leftOdd = Either.left<number, number>(43).recover(recoverIfEven); // Left('Not even')
```

#### Running side effects

You can use the `onRight` method to run side effects on the value inside a `Right`.

```typescript
import { Either } from '@leanmind/monads';

const right = Either.right(42).onRight(x => console.log(x)); // 42
const left = Either.left('Error').onRight(x => console.log(x)); // No execution
```

Or you can use the `onLeft` method to run side effects on the value inside a `Left`.

```typescript
import { Either } from '@leanmind/monads';

const right = Either.right(42).onLeft(err => console.log(err)); // No execution
const left = Either.left('Error').onLeft(err => console.log(err)); // 'Error'
```

#### Folding an Either

You can use the `fold` method to handle both `Right` and `Left` cases and unwrap the result.

```typescript
import { Either } from '@leanmind/monads';

const success = Either.right<string, number>(42).fold({
  ifRight: x => `${x + 1}`,
  ifLeft: err => `Error: ${err}`,
}); // '43'

const error = Either.left<string, number>('Error').fold({
  ifRight: x => `${x + 1}`,
  ifLeft: err => `Error: ${err}`,
}); // 'Error: Error'
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
  .fold({
    ifRight: x => x.toString(),
    ifLeft: err => `Error: ${err}`,
  })

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
  .fold({
    ifRight: x => `Result: ${x}`,
    ifLeft: err => `Error: ${err}`,
  });

console.log(result); // 'Result: 10'
```

In this example, the divide function returns an `Either` that represents the result of the division or an error if the
division is by zero. The result is then transformed and folded to produce a final `string`.

#### Asynchronous Operations (AsyncEither)

`AsyncEither` is the asynchronous variant of `Either`, which wraps a Promise that resolves to an Either. It provides
similar functionality to synchronous `Either` but works with asynchronous operations.

##### Creating an AsyncEither

You can create an `AsyncEither` using the static methods `AsyncEither.fromPromise`, `AsyncEither.fromSafePromise`, and
`AsyncEither.fromSync`.

```typescript
import { AsyncEither, Either } from '@leanmind/monads';

// Creating an AsyncEither from a Promise with error handling
const fromPromise = AsyncEither.fromPromise(
  fetch('https://api.example.com/users/1').then(res => res.json()),
  err => `API Error: ${err}`
); // AsyncEither<string, User>

// Creating an AsyncEither from a Promise that cannot fail
const fromSafePromise = AsyncEither.fromSafePromise(
  Promise.resolve(42)
); // AsyncEither<never, number>

// Converting a synchronous Either to an AsyncEither
const fromSync = AsyncEither.fromSync(Either.right(42)); // AsyncEither<never, number>
```

##### Mapping over an AsyncEither

Similar to `Either`, you can use `map`, `mapLeft`, `flatMap`, and `flatMapLeft` methods to transform values
asynchronously:

```typescript
import { AsyncEither, Either } from '@leanmind/monads';

// Using map
const mapped = await AsyncEither.fromSync(Either.right(42))
  .map(x => x * 2); // AsyncEither<never, 84>

// Using mapLeft
const mappedLeft = await AsyncEither.fromSync(Either.left('error'))
  .mapLeft(err => `Transformed: ${err}`); // AsyncEither<'Transformed: error', never>

// Using flatMap with async operations
const flatMapped = await AsyncEither.fromSync(Either.right(42))
  .flatMap(x => AsyncEither.fromPromise(
    Promise.resolve(x + 1),
    err => `Error: ${err}`
  )); // AsyncEither<string, 43>

// Using flatMapLeft
const flatMappedLeft = await AsyncEither.fromSync(Either.left('error'))
  .flatMapLeft(err => AsyncEither.fromSync(Either.left(`${err}_handled`))); // AsyncEither<'error_handled', never>
```

Note that async transformations are supported for both map and flatMap operations:

```typescript
import { AsyncEither } from '@leanmind/monads';

const asyncMapped = await AsyncEither.fromSync(Either.right(42))
  .map(async x => {
    const result = await someAsyncOperation(x);
    return result * 2;
  }); // AsyncEither<never, number>
```

##### Running side effects

While not explicitly shown in the provided code, you can use the `fold` method with appropriate handlers to perform side
effects:

```typescript
import { AsyncEither, Either } from '@leanmind/monads';

const asyncEither = AsyncEither.fromSync(Either.right(42));

// Execute side effects after resolving the AsyncEither
await asyncEither.then(either => {
  either.onRight(value => console.log(`Success: ${value}`)); // Logs "Success: 42"
  either.onLeft(error => console.error(`Error: ${error}`)); // Not executed
});
```

##### Folding an AsyncEither

You can use the `fold` method to handle both `Right` and `Left` cases and unwrap the result:

```typescript
import { AsyncEither, Either } from '@leanmind/monads';

const asyncEither = AsyncEither.fromSync(Either.right(42));
const result = await asyncEither.fold({
  ifRight: x => `Success: ${x}`,
  ifLeft: err => `Error: ${err}`,
}); // 'Success: 42'

const asyncEitherError = AsyncEither.fromSync(Either.left('failed'));
const errorResult = await asyncEitherError.fold({
  ifRight: x => `Success: ${x}`,
  ifLeft: err => `Error: ${err}`,
}); // 'Error: failed'
```

##### Working with Promises

`AsyncEither` implements the `PromiseLike` interface, allowing it to be used in Promise chains and with `await`:

```typescript
import { AsyncEither, Either } from '@leanmind/monads';

// Using await to get the wrapped Either
const asyncEither = AsyncEither.fromSync(Either.right(42));
const either = await asyncEither; // Either<never, 42>

// Using in Promise chain
AsyncEither.fromPromise(fetchUser(1), err => `Failed to fetch: ${err}`)
  .then(either => {
    either.fold({
      ifRight: user => console.log(`User: ${user.name}`),
      ifLeft: err => console.error(err)
    });
  });
```

##### Handling asynchronous errors

Here's a complete example of handling asynchronous operations with error handling:

```typescript
import { AsyncEither } from '@leanmind/monads';

async function fetchUserData(userId: string) {
  // Create an AsyncEither from a Promise that might fail
  return AsyncEither.fromPromise(
    fetch(`https://api.example.com/users/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      }),
    error => `Failed to fetch user: ${error.message}`
  );
}

// Usage
async function displayUserInfo(userId: string) {
  const userResult = await fetchUserData(userId)
    .map(user => ({
      displayName: `${user.firstName} ${user.lastName}`,
      email: user.email
    }))
    .fold({
      ifRight: userInfo => `User: ${userInfo.displayName} (${userInfo.email})`,
      ifLeft: error => `Error: ${error}`
    });

  console.log(userResult);
}

displayUserInfo('123'); // Either 'User: John Doe (john@example.com)' or 'Error: Failed to fetch user: ...'
```

This example demonstrates how `AsyncEither` helps with handling asynchronous operations that might fail, allowing for
clean error handling and functional transformations of the results.

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
import { Option } from '@leanmind/monads';

const some = Option.of(42).filter(x => x > 40); // Some(42)
const none = Option.of(42).filter(x => x > 50); // None
```

#### Mapping over an Option

You can use the `flatMap` or `map` method to transform the `Some` value.

##### Using `flatMap`

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42).flatMap(x => Option.of(x + 1)); // Some(43)
const none = Option.of(null).flatMap(x => Option.of(x + 1)); // None
```

##### Using `map`

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42).map(x => x + 1); // Some(43)
const none = Option.of(null).map(x => x + 1); // None
```

#### Running side effects

You can use the `onSome` method to run side effects on the value inside a `Some`.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.some(42).onSome(x => console.log(x)); // 42
const none = Option.none().onSome(x => console.log(x)); // No execution
```

Or you can use the `onNone` method to run side effects on the value inside a `None`.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.some(42).onNone(_ => console.log('Empty value')); // No execution
const none = Option.none().onNone(_ => console.log('Empty value')); // 'Empty value'
```

#### Folding an Option

You can use the `fold` method to handle both `Some` and `None` cases and unwrap the result.

```typescript
import { Option } from '@leanmind/monads';

const some = Option.of(42).fold({
  ifSome: x => `${x + 1}`,
  ifNone: () => 'No value',
}); // '43'

const none = Option.of(null).fold({
  ifSome: x => `${x + 1}`,
  ifNone: () => 'No value',
}); // 'No value'
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

#### Using `map`

You can use the `map` method to transform the value inside a `Success`.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42).map(x => x + 1); // Success(43)
```

#### Using `flatMap`

You can use the `flatMap` method to transform the value inside a `Success` with a fallible closure.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42).flatMap(x => Try.success(x + 1)); // Success(43)
```

#### Running side effects

You can use the `onSuccess` method to run side effects on the value inside a `Success`.

```typescript
import { Try } from '@leanmind/monads';

const succcess = Try.succcess(42).onSuccess(x => console.log(x)); // 42
const failure = Try.failure('Error').onSuccess(x => console.log(x)); // No execution
```

Or you can use the `onFailure` method to run side effects on the value inside a `Failure`.

```typescript
import { Try } from '@leanmind/monads';

const succcess = Try.succcess(42).onFailure(err => console.log(err)); // No execution
const failure = Try.failure(new Error('Error')).onFailure(err => console.log(err)); // Error('Error')
```

#### Retrieving the value

You can use the `getOrElse` method to retrieve the value of a `Success` or provide a default value if it is `Failure`.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42);
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

#### Folding a Try

You can use the `fold` method to handle both `Success` and `Failure` cases and unwrap the result.

```typescript
import { Try } from '@leanmind/monads';

const success = Try.success(42).fold({
  ifSuccess: x => `${x + 1}`,
  ifFailure: err => `Error: ${err}`,
}); // '43'

const failure = Try.failure(new Error('an error')).fold({
  ifSuccess: x => `${x + 1}`,
  ifFailure: err => `Error: ${err}`,
}); // 'Error: an error'
```

#### Handling errors in Infrastructure code

Normally, Try is used to handle `Exceptions` that are raise by third party libraries

```typescript
import { Try } from '@leanmind/monads';

const result = Try.execute(() => {
  // Some API of a library that may throw an exception
  return 42;
}).fold({
  ifSuccess: x => `${x + 1}`,
  ifFailure: err => `Error: ${err.message}`,
})

console.log(result); // 43
```

#### Checking if a Try is Success or Failure

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








