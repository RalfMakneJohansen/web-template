import { configure } from '@testing-library/dom';

/**
 * FAIRWAY: a budget that survives a full suite run.
 *
 * Testing Library gives every `waitFor` one second. That is plenty for a
 * single suite — ListingPage's nineteen tests run in under four seconds on
 * their own — but the heavier pages render a merged configuration, the route
 * table, a Redux store and loadable components inside that budget, and under
 * `--runInBand` with seventy-five other suites competing for the CPU a render
 * occasionally crosses it.
 *
 * The result was a suite that failed roughly one run in three, always on a
 * different assertion, always green when the same test was run alone. That is
 * worse than a slow suite: it teaches you to re-run instead of read, and a
 * real regression hides in the noise. Two genuine bugs found by hand this week
 * — the wizard that could not leave step one, and the buy button live on your
 * own listing — were exactly the kind a trusted suite should have caught.
 *
 * Raising the ceiling weakens nothing. A passing assertion still passes as
 * fast as it did; only the false failures stop.
 */
configure({ asyncUtilTimeout: 5000 });
