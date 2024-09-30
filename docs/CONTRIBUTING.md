# Contributing to Monads

✨ Thanks for contributing to **Monads**! ✨

As a contributor, here are the guidelines we would like you to follow:

- [Code of Conduct](#code-of-conduct)
- [How can I contribute?](#how-can-i-contribute)
- [Using the Issue Tracker](#using-the-issue-tracker)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding Rules](#coding-rules)
- [Working with the Code](#working-with-the-code)

We also recommend that you read [How to Contribute to Open Source](https://opensource.guide/how-to-contribute).

## Code of Conduct

Help us keep **Monads** open and inclusive. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How can I contribute?

### Improve Documentation

As a **Monads** user, you are the perfect candidate to help us improve our documentation: typo corrections,
clarifications, more examples, add translations, etc.

### Give Feedback on Issues

Some issues may lack the required information. Help us by providing additional relevant context and feedback.

Participating in these discussions is a great way to influence the future of **Monads**.

### Fix Bugs and Implement Features

Bugs and features ready for work are labeled
with [help wanted](https://github.com/lean-mind/monads/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22). Feel
free to comment on an issue to request guidance from
the [@Monads/maintainers](https://github.com/lean-mind/monads/graphs/contributors)
or the community.

## Using the Issue Tracker

The issue tracker is used for [bug reports](#bug-report), [feature requests](#feature-request),
and [submitting pull requests](#submitting-a-pull-request).

Before opening an issue or Pull Request, please search
the [GitHub issue tracker](https://github.com/lean-mind/monads/issues) to check if it has already been reported or fixed.

### Bug Report

A good bug report provides enough detail to allow others to reproduce the problem. Please fill in the information
requested in the [bug report template](https://github.com/lean-mind/monads/issues/new?template=bugs.yml).

### Feature Request

Feature requests should fit with the project's goals. Take the time to make a strong case for your feature by filling
out the [feature request template](https://github.com/lean-mind/monads/issues/new?template=enhacements.yml).

### Request docs changes

If you see something wrong or missing in the documentation, please open an issue using the
[documentation issue template](https://github.com/lean-mind/monads/issues/new?template=docs.yml).


## Submitting a Pull Request

Good pull requests, whether bug fixes, improvements, or new features, are welcome! Please ensure your PR is focused on a
single topic and contains no unrelated changes.

Before starting significant pull requests (e.g. new features, major refactors), please discuss your plans with the
maintainers to avoid unnecessary work.

If you're new to submitting pull
requests, [here's a great tutorial](https://opensource.guide/how-to-contribute/#opening-a-pull-request) to help you get
started! 🎉

Steps to submit a PR:

1. [Set up the workspace](#set-up-the-workspace)
2. Ensure you are up to date with the latest changes:

    ```bash
    git checkout main
    git pull upstream main
    npm install
    ```

3. Create a new branch for your feature or bugfix:

    ```bash
    git checkout -b <branch-name>
    ```

4. Make your changes and follow the [Coding Rules](#coding-rules).
5. Push your branch to your fork:

    ```bash
    git push origin <branch-name>
    ```

6. [Create a Pull Request](https://help.github.com/articles/creating-a-pull-request/) with a clear title and
   description. We have already a [PR template](https://github.com/lean-mind/monads/blob/beta/.github/PULL_REQUEST_TEMPLATE.md) where you can fill the details.


**Tips**:

- For complex changes, open a PR early with the `DRAFT:: <PR Title>` prefix to get feedback.
- Allow maintainers to make changes to your PR branch to help with rebasing or minor tweaks.

## Coding Rules

### Source Code

To ensure consistency and quality across the codebase:

- No linting errors
- Add tests for any new code or changes
- Ensure your code is covered by tests
- Write [valid commit messages](#commit-message-guidelines)
- Update documentation for new or modified features

### Commit Message Guidelines

Each commit message should consist of a **header**, **body**, and **footer** (optional). The header must follow this
format:

```commit
<type>(<scope>): <subject>
```

### Commit types include:

| Type     | Description                                                   |
|----------|---------------------------------------------------------------|
| feat     | New feature                                                   |
| fix      | Bug fix                                                       |
| docs     | Documentation-only changes                                    |
| style    | Code style changes (whitespace, formatting)                   |
| refactor | Code changes that do not affect functionality                 |
| chore    | Changes to the build process or auxiliary tools and libraries |

For further information check the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Working with the Code

### Set up the Workspace

Fork the repository, clone your fork, configure the remotes, and install dependencies:

```bash
git clone https://github.com/<your-username>/monads
cd monads
git remote add upstream https://github.com/lean-mind/monads
npm install
```

### Running Tests

Ensure that all tests pass before pushing your code:

```bash
$ npm test
```

Thanks again for contributing to Monads!
