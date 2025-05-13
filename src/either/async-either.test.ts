import { AsyncEither } from './async-either';
import { describe, expect, it } from 'vitest';
import { Either } from './either';

const mockFetch = (url: string): Promise<string> => {
  if (url.includes('users/1')) {
    return Promise.resolve(JSON.stringify({ id: 1, name: 'Alice' }));
  } else if (url.includes('posts/1')) {
    return Promise.resolve(JSON.stringify([{ title: 'First post' }, { title: 'Second post' }]));
  } else {
    return Promise.reject(new Error(`Resource not found: ${url}`));
  }
};

type User = { id: number; name: string };

const fetchUser = (id: number): AsyncEither<Error, User> => {
  return AsyncEither.fromPromise(
    mockFetch(`/api/users/${id}`).then(JSON.parse),
    (error) => new Error(`Failed to fetch user: ${(error as Error).message}`)
  );
};

type Post = { title: string };

const fetchPosts = (id: number): AsyncEither<Error, Post[]> => {
  return AsyncEither.fromPromise(
    mockFetch(`/api/posts/${id}`).then(JSON.parse),
    (error) => new Error(`Failed to fetch posts: ${error}`)
  );
};

type Response<T> = {
  status: number;
  body: T;
};

const successResponse = (posts: Post[]): Response<string[]> => ({
  status: 200,
  body: posts.map((post) => post.title),
});

const failureResponse = (error: string): Response<string> => ({
  status: 500,
  body: error,
});

const divide = (a: number, b: number): Either<string, number> => {
  if (b === 0) return Either.left<string, number>('Division by zero');
  return Either.right<string, number>(a / b);
};

describe('AsyncEither should', () => {
  it('handle right values', async () => {
    const result = await AsyncEither.fromSafePromise<string, number>(Promise.resolve(5))
      .map((x) => x * 2)
      .fold({
        ifRight: (value) => `Value: ${value}`,
        ifLeft: (error) => error,
      });

    expect(result).toBe('Value: 10');
  });

  it('handle left values', async () => {
    const result = await AsyncEither.fromPromise(Promise.reject('Something went wrong'), (reason) => reason as string)
      .mapLeft((error) => `Error: ${error}`)
      .fold({
        ifRight: (value) => `Value: ${value}`,
        ifLeft: (error) => error,
      });

    expect(result).toBe('Error: Something went wrong');
  });

  it('interoperate with synchronous Either', async () => {
    const syncEither = divide(10, 2);

    const result = await AsyncEither.fromSync(syncEither)
      .map((value) => value * 3)
      .fold({
        ifRight: (value) => `value is ${value}`,
        ifLeft: (error) => error,
      });

    expect(result).toBe('value is 15');
  });

  it('compose successive async operations', async () => {
    const getPostsByUser = (user: User) => {
      return fetchPosts(user.id);
    };

    async function fetchPostsByUser(id: number) {
      return await fetchUser(id)
        .flatMap(getPostsByUser)
        .map(successResponse)
        .flatMapLeft((error) => Either.left('Unsuccessful operation: ' + error.message))
        .mapLeft(failureResponse)
        .fold<Response<string | string[]>>({
          ifRight: (titles) => titles,
          ifLeft: (error) => error,
        });
    }

    await expect(fetchPostsByUser(1)).resolves.toEqual({ status: 200, body: ['First post', 'Second post'] });
    await expect(fetchPostsByUser(2)).resolves.toEqual({
      status: 500,
      body: 'Unsuccessful operation: Failed to fetch user: Resource not found: /api/users/2',
    });
  });
});
