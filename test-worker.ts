import { readFilingActionsSafely } from './ui/server/src/news/ideas/ideas-workspace'
async function run() {
  try {
    const actions = await readFilingActionsSafely('/Users/chiraagkapil/equity-research')
    console.log("Success, actions:", actions.length)
  } catch (e) {
    console.error("Error:", e)
  }
}
run()
