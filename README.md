# monads-ts

This is a set of implementations of monads in TypeScript with OOP perspective.
It is a work in progress and the first monad implemented is the Either monad.

## Either Monad
The `Either` monad represents a value of one of two possible types (a disjoint union).
An `Either` is either a `Left` or a `Right`. 
By convention, `Right` is used to hold a successful value, 
while `Left` is used to hold an error or failure.

### Usage
#### Creating an Either

You can create an `Either` using the static methods `Either.right` and `Either.left`.
```typescript
import { Either } from 'monads-ts';

// Creating a Right
const right = Either.right(42);

// Creating a Left
const left = Either.left('Error');
```

#### Creating Either from possible failed operations

You can create an `Either` from a failed operations using the static method `Either.catch`.
```typescript
import { Either } from 'monads-ts';

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

You can use the `flatMap` method to transform the value inside a `Right`, and `flatMapLeft` to transform the value inside a `Left`.

```typescript
const right = Either.right(42).flatMap(x => Either.right(x + 1)); // Right(43)
const left = Either.left('Error').flatMapLeft(err => Either.left(`New ${err}`)); // Left('New Error')
```

#### Matching an Either

You can use the `match` method to handle both `Right` and `Left` cases and unwrap the result.

```typescript
const sucess = Either.right(42).match(
  err => `Error: ${err}`,
  x => x + 1
); // 43

const error = Either.left('Error').match(
  err => `Error: ${err}`,
  x => x + 1,
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
  .match(
    err => `Error: ${err}`,
    x => x
  );

console.log(result); // 86
```


#### Handling errors

Here is a complete example demonstrating the usage of the `Either` monad:

```typescript
import { Either } from 'monads-ts';

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
In this example, the divide function returns an `Either` that represents the result of the division or an error if the division is by zero. The result is then transformed and matched to produce a final `string`.

