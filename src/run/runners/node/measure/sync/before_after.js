// Task `before()`. Performed outside measurements.
// Its return value is passed to `main()` and `after()`.
// `before`, `main` and `after` must be pure functions. This is because when
// `repeat > 1` `before|after` are executed in chunks instead of one after
// another.
// This is required to be able to loop `main` several times with a single
// `now()` performed.
export const performBeforeSync = function (before, repeat) {
  if (before === undefined) {
    return
  }

  const beforeArgs = []

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, no-plusplus, no-param-reassign
  while (repeat--) {
    // Use `unshift()` to reverse the array in order since it is consumed from
    // the end to start by `main` and `after`.
    // They do so because `while (repeat--)` is the fastest loop.
    // We guarantee that `main` and `after` are called in the same order as
    // `before` (in terms of `beforeArgs`).
    // eslint-disable-next-line fp/no-mutating-methods
    beforeArgs.unshift(before())
  }

  return beforeArgs
}

// Task `after()`. Performed outside measurements.
export const performAfterSync = function (after, repeat, beforeArgs = []) {
  if (after === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, no-plusplus, no-param-reassign
  while (repeat--) {
    after(beforeArgs[repeat])
  }
}
