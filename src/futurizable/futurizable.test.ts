import { describe, it, expect, vi } from 'vitest';
import { Either } from '../either';
import { Try } from '../try';
import { Option } from '../option';
import { IO } from '../io';
import { Futurizable } from './futurizable';

describe('Futurizable', () => {
  const expectedValuePassedToOnFailureClosure = 'value';
  const testCasesWhereValueShouldBeCompletableWithOnFailureClosure = [
    { monad: Either.right(expectedValuePassedToOnFailureClosure), monadType: 'Either Right' },
    { monad: Try.execute(() => expectedValuePassedToOnFailureClosure), monadType: 'Try Success' },
    { monad: Option.some(expectedValuePassedToOnFailureClosure), monadType: 'Option Some'},
    { monad: IO.of(() => expectedValuePassedToOnFailureClosure), monadType: 'IO' },
  ] as { monad: Futurizable<unknown>; monadType: string}[];

  it.each(testCasesWhereValueShouldBeCompletableWithOnFailureClosure)(
    `should resolve the future value of converted async $monadType using onFailure closure`,
    async ({ monad }) => {
      const onFailureClosureDummy = vi.fn();
      const onSuccessClosureSpy = vi.fn();

      const future = monad.toFuture();
      await future.complete(onSuccessClosureSpy, onFailureClosureDummy);

      expect(onSuccessClosureSpy).toHaveBeenCalledWith(expectedValuePassedToOnFailureClosure);
    }
  );
});
