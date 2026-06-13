// The entity safety-net. The cheap title-only triage routinely mislabels NON-companies as companies —
// countries (China, India), regions (Haryana, Middle East), indices (Nifty, Euribor), central banks /
// regulators (Fed, SEBI, ESMA), and parser junk ("[]", "major tyre maker"). A study of 50 live articles
// found this in ~half of them. This module is the deterministic backstop (the Groq body-read is the
// primary fix): drop anything that is NOT an investable firm, while never dropping a real company.
//
// Matching is on the WHOLE normalized name, so "China" is dropped but "China Mobile" (a real listed
// firm) is kept — we only reject when the entire name IS the non-company entity.

const norm = (s: unknown): string => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,]/g, '').replace(/\(.*?\)/g, '').replace(/^the /, '').trim()

// exact-match denylist (normalized). Grouped only for readability.
const DENY = new Set<string>([
  // countries / nationalities
  'india', 'indian', 'china', 'chinese', 'japan', 'japanese', 'uk', 'u k', 'united kingdom', 'britain', 'british',
  'us', 'u s', 'usa', 'u s a', 'united states', 'america', 'american', 'eu', 'european union', 'europe', 'european',
  'thailand', 'thai', 'turkey', 'turkish', 'indonesia', 'indonesian', 'pakistan', 'taiwan', 'south korea', 'korea', 'korean',
  'dr congo', 'democratic republic of congo', 'congo', 'iran', 'iranian', 'israel', 'israeli', 'cambodia', 'philippines',
  'malaysia', 'malaysian', 'germany', 'german', 'france', 'french', 'russia', 'russian', 'ukraine', 'ukrainian',
  'brazil', 'canada', 'canadian', 'australia', 'australian', 'singapore', 'vietnam', 'saudi arabia', 'uae', 'qatar',
  'egypt', 'nigeria', 'mexico', 'italy', 'spain', 'netherlands', 'switzerland', 'swiss', 'sweden', 'hong kong', 'lebanon',
  // states / regions / cities
  'haryana', 'kinshasa', 'west asia', 'asia', 'gulf', 'strait of hormuz', 'middle east', 'mideast', 'global', 'wall street', 'dalal street',
  // indices / benchmarks / rates
  's&p 500', 's&p', 'sp 500', 'nasdaq', 'dow', 'dow jones', 'stoxx 600', 'stoxx', 'msci', 'sensex', 'nifty', 'idx',
  'euribor', 'sofr', 'cape', 'shiller cape', 'fedwatch', 'ftse', 'dax', 'nikkei', 'hang seng', 'russell', 'vix',
  // government bodies / regulators / central banks / multilaterals
  'fed', 'federal reserve', 'fomc', 'ecb', 'boj', 'rbi', 'sebi', 'esma', 'eba', 'eiopa', 'fsma', 'emmi', 'sec', 'doj',
  'fcc', 'fda', 'ftc', 'cftc', 'irs', 'treasury', 'us treasury', 'european commission', 'opec', 'opec+', 'nsf', 'un',
  'united nations', 'mpc', 'fsa', 'imf', 'world bank', 'wto', 'nato', 'white house', 'congress', 'parliament', 'pentagon',
  'supreme court', 'european central bank', 'bank of england', 'boe', 'pboc',
  // generic placeholders / parser junk
  '[]', 'n/a', 'na', 'none', 'unknown', 'the company', 'company', 'the firm', 'firm', 'unnamed', 'certain entities',
  'startups', 'hyperscalers', 'discoms', 'others', 'various', 'major tyre maker', 'a major tyre maker', 'analysts', 'investors',
  // named INDIVIDUALS (politicians / public figures) — drivers of an event, never an investable position.
  // Curated to the ones that actually leak through; the title-prefix patterns below catch the long tail.
  // Bare surnames that collide with a real listed firm (Powell→Powell Industries, Reddy→Dr Reddy's,
  // Xi) are deliberately NOT listed here — only the full disambiguated forms are.
  'trump', 'donald trump', 'donald j trump', 'us president donald trump', 'president donald trump', 'president trump',
  'trump administration', 'trump allies', 'melania trump', 'modi', 'narendra modi', 'pm modi', 'prime minister modi',
  'macron', 'emmanuel macron', 'putin', 'vladimir putin', 'xi jinping', 'president xi', 'biden', 'joe biden',
  'kamala harris', 'netanyahu', 'benjamin netanyahu', 'zelensky', 'zelenskyy', 'volodymyr zelensky', 'erdogan',
  'rishi sunak', 'keir starmer', 'starmer', 'jeff bezos', 'bezos', 'elon musk', 'sam altman', 'mark zuckerberg',
  'jensen huang', 'warren buffett', 'jerome powell', 'jay powell', 'nirmala sitharaman', 'shaktikanta das',
  'g kishan reddy', 'kishan reddy', 'nino guerrero', 'tren de aragua',
  // DEMOGRAPHIC / role classes — populations, not firms (they leaked in as "companies")
  'foreign nationals', 'foreign national', 'patients', 'clinical trial patients', 'customers', 'sbi customers',
  'consumers', 'creditors', 'lenders', 'shareholders', 'tendering shareholders', 'retail investors', 'depositors',
  'fraudsters', 'criminals', 'employees', 'workers', 'taxpayers', 'voters', 'migrants', 'residents', 'india military',
])

// pattern denylist — whole-name shapes that are always institutions or people, not firms
const DENY_RE = [
  /^ministry of /, /^department of /, /^bank of [a-z]+$/, /^(reserve|central|national) bank/, /\bcommission$/,
  /\b(authority|regulator|regulators|tribunal|parliament|ministry|govt|government)\b/, /^[a-z]$/,
  // titled individuals — honorific/office PREFIXES that no real company name starts with
  /^(mr|mrs|ms|miss|prof|professor|sir|dame|lord|rev|reverend|senator|congressman|congresswoman|justice|governor|ambassador|ayatollah|pope|crown prince) /,
  // any "<dept> minister", "minister of/for X", or a bare "X minister" — a person/office, not a firm
  /\bminister\b/,
]

/** True only for a plausible investable FIRM. False for countries, regions, indices, central banks,
 *  regulators, multilaterals, and parser junk. Never throws. */
export function isCompanyName(name: unknown): boolean {
  const n = norm(name)
  if (!n || n.length < 2) return false
  if (DENY.has(n)) return false
  if (DENY_RE.some((re) => re.test(n))) return false
  return true
}

/** Keep only the entries that look like real companies (used to scrub a guessed-company list). */
export function filterCompanies<T extends { name?: string | null }>(companies: T[] | null | undefined): T[] {
  return (companies || []).filter((c) => isCompanyName(c?.name))
}
