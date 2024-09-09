# CONTRIBUTING

## GIT Conventions
### Branches Conventions
- `main` is the main branch.
- `beta` is the branch where the latest changes are merged into.
- <your-github-user>/<what-you-are-gonna-change>

## Testing

### Monad tests

From testing perspective, we are applying a role based testing approach. In this case,
the role is monad, and we create tests cases for each monad.

check the `src/monads/monads.test.ts` folder for more information.

So, you have just to new test cases for your new monad that you are going to implement.


### Matchable tests

From testing perspective, we are applying a role based testing approach. In this case,
the role is matchable, and we create tests cases for each matchable.

check the `src/matchable/matchable.test.ts` folder for more information.

So, you have just to new test cases for your new matchable that you are going to implement.


### Specific tests for each monad

Each `monad` has a particular way to be created or a particular API. So, we have to create
specific tests for them.

for example, the 'Try' monad has a particular way to be created, so we have to create
tests for that.

```typescript
import { describe, it, expect } from 'vitest';
import { Failure, Success, Try } from './try';

  it.each([
  { type: 'Success', executable: () => 2, expected: new Success(2) },
  {
    type: 'Failure',
    executable: () => {
      throw new Error();
    },
    expected: new Failure(new Error()),
  },
])('should create $type correctly', ({ executable, expected }) => {
  expect(Try.execute(executable)).toEqual(expected);
});
```

or the 'Option' monad has a particular API, so we have to create tests for that.

```typescript
import { describe, it, expect } from 'vitest';
import { None, Option, Some } from './option';

it.each([
  { type: 'Some', option: Option.of(2), expected: 2 },
  { type: 'None', option: Option.of<number>(undefined), expected: 2 },
])('$type should handle getOrElse operation correctly', ({ option, expected }) => {
  expect(option.getOrElse(2)).toEqual(expected);
});
```


