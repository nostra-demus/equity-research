import { readDiscoveryCatalog } from './ui/server/src/news/ideas/ideas-workspace'
try {
  const result = readDiscoveryCatalog('/Users/chiraagkapil/equity-research')
  console.log("Success, items:", result.cards.length)
} catch (e) {
  console.error("Error:", e)
}
