// Same fixture under a `*.test.ts` entry point: a single test file run directly (`npx tsx test/x.test.ts`)
// has no suite runner to export ENGINE_TEST_RUN, so the guard must recognise it from the entry point alone.
import './reach-real-committer'
