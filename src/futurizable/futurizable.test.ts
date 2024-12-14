import { describe, it, expect, vi } from 'vitest';
import { Either } from '../either';
import { Try } from '../try';
import { Option } from '../option';
import { IO } from '../io';
import { Futurizable } from './futurizable';

describe('Futurizable', () => {
  const expectedValuePassedToOnSuccessClosure = 'value';
  const testCasesWhereValueShouldBeCompletableWithOnSuccessClosure = [
    { monad: Either.right(expectedValuePassedToOnSuccessClosure), monadType: 'Either Right' },
    { monad: Try.execute(() => expectedValuePassedToOnSuccessClosure), monadType: 'Try Success' },
    { monad: Option.some(expectedValuePassedToOnSuccessClosure), monadType: 'Option Some' },
    { monad: IO.of(() => expectedValuePassedToOnSuccessClosure), monadType: 'IO' },
  ] as { monad: Futurizable<unknown>; monadType: string }[];

  it.each(testCasesWhereValueShouldBeCompletableWithOnSuccessClosure)(
    `should complete the future value of converted async $monadType using onSuccess closure`,
    async ({ monad }) => {
      const onFailureClosureDummy = vi.fn();
      const onSuccessClosureSpy = vi.fn();

      const future = monad.toFuture();
      await future.complete(onSuccessClosureSpy, onFailureClosureDummy);

      expect(onSuccessClosureSpy).toHaveBeenCalledWith(expectedValuePassedToOnSuccessClosure);
    }
  );

  const testCasesWhereErrorShouldBeCompletableWithOnFailureClosure = [
    {
      monad: Either.left('error'),
      monadType: 'Either Left',
      expectedEdgeCasePassedToOnFailureClosure: new Error('error'),
    },
    {
      monad: Try.execute(() => {
        throw new Error('error');
      }),
      monadType: 'Try Failure',
      expectedEdgeCasePassedToOnFailureClosure: new Error('error'),
    },
    {
      monad: Option.none(),
      monadType: 'Option None',
      expectedEdgeCasePassedToOnFailureClosure: new Error('No value provided'),
    },
    {
      monad: IO.of(() => {
        throw new Error('error');
      }),
      monadType: 'IO',
      expectedEdgeCasePassedToOnFailureClosure: new Error('error'),
    },
  ] as { monad: Futurizable<unknown>; monadType: string; expectedEdgeCasePassedToOnFailureClosure: Error }[];

  it.each(testCasesWhereErrorShouldBeCompletableWithOnFailureClosure)(
    `should complete the future value of converted async $monadType using onFailure closure`,
    async ({ monad, expectedEdgeCasePassedToOnFailureClosure }) => {
      const onSuccessClosureDummy = vi.fn();
      const onFailureClosureSpy = vi.fn();

      const future = monad.toFuture();
      await future.complete(onSuccessClosureDummy, onFailureClosureSpy);

      expect(onFailureClosureSpy).toHaveBeenCalledWith(expectedEdgeCasePassedToOnFailureClosure);
    }
  );
});
