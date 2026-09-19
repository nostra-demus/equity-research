import { readDiscoveryCatalog, readFilingActionsSafely } from './ui/server/src/news/ideas/ideas-workspace'
async function run() {
  try {
    const promises = Array(10).fill(0).map(() => readFilingActionsSafely('/Users/chiraagkapil/equity-research'))
    const results = await Promise.all(promises)
    console.log("Success")
  } catch (e) {
    console.error("Error:", e)
  }
}
run()
