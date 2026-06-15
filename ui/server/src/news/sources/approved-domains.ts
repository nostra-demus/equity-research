// The approved-source firewall, as domains. This is the machine mirror of the swarm doctrine's
// Gate-0 allow-list (.claude/agents/screener/SWARM.md → sources.signal_gate.allowed): only these
// publishers may enter the inbox. It does TWO jobs:
//   1. build the GDELT query (we ask GDELT only for these domains, so the firehose is pre-filtered);
//   2. map a returned article's domain back to its canonical source_name + region + input_nature.
//
// Gate 0 in the gauntlet still runs authoritatively when a row is promoted — this is a cheap
// pre-filter that keeps off-list noise out of the inbox, not a replacement for it.
//
// Coverage note: GDELT indexes newswires / financial press well (Reuters, Bloomberg, ET, …). Some
// approved sources are data terminals or agencies GDELT barely indexes (CapIQ, IBKR, LME, Baltic,
// Spark, LSEG) — those stay reachable via the manual /screener:sweep; we don't fake their presence.

import type { Region } from '../types'

interface SourceMeta {
  source_name: string // canonical name, exactly as it appears on the swarm allow-list
  region: Region
  input_nature: string // default classification for items from this domain
  gdelt?: boolean // false → keep on the firewall but DON'T query GDELT for it (covered directly by
  // RSS/NSE, and GDELT barely indexes regulators/wires/exchanges — this keeps the GDELT query lean).
  // Undefined defaults to true (the original news-press domains GDELT indexes well).
}

// domain → meta. Keys are bare registrable domains (no www, no path). Subdomains match by suffix.
const DOMAINS: Record<string, SourceMeta> = {
  // global wires
  'reuters.com': { source_name: 'Reuters', region: 'GLOBAL', input_nature: 'news_headline' },
  'apnews.com': { source_name: 'Associated Press', region: 'GLOBAL', input_nature: 'news_headline' },
  'ap.org': { source_name: 'Associated Press', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false }, // GDELT indexes AP under apnews.com, not ap.org (verified empty) — keep approved, drop the wasted query slot
  'bloomberg.com': { source_name: 'Bloomberg', region: 'GLOBAL', input_nature: 'news_headline' },
  'afp.com': { source_name: 'AFP', region: 'GLOBAL', input_nature: 'news_headline' },
  'ft.com': { source_name: 'Financial Times', region: 'GLOBAL', input_nature: 'news_headline' },
  'spglobal.com': { source_name: 'S&P Global Market Intelligence', region: 'GLOBAL', input_nature: 'news_headline' },
  // US press
  'wsj.com': { source_name: 'The Wall Street Journal', region: 'US', input_nature: 'news_headline' },
  'cnbc.com': { source_name: 'CNBC', region: 'US', input_nature: 'news_headline' },
  'marketwatch.com': { source_name: 'MarketWatch', region: 'US', input_nature: 'news_headline' },
  // India press
  'economictimes.indiatimes.com': { source_name: 'The Economic Times', region: 'IN', input_nature: 'news_headline' },
  'business-standard.com': { source_name: 'Business Standard', region: 'IN', input_nature: 'news_headline' },
  'livemint.com': { source_name: 'LiveMint', region: 'IN', input_nature: 'news_headline' },
  'moneycontrol.com': { source_name: 'Moneycontrol', region: 'IN', input_nature: 'news_headline' },
  // regulators / exchanges → classified as filings / exchange intimations
  'sec.gov': { source_name: 'SEC EDGAR', region: 'US', input_nature: 'regulatory_filing' },
  'nseindia.com': { source_name: 'BSE / NSE Exchange Filing', region: 'IN', input_nature: 'exchange_announcement' },
  'bseindia.com': { source_name: 'BSE / NSE Exchange Filing', region: 'IN', input_nature: 'exchange_announcement' },
  // energy / commodity agencies → macro prints (indexed thinly by GDELT, included where useful)
  'iea.org': { source_name: 'IEA', region: 'GLOBAL', input_nature: 'macro_data_release' },
  'opec.org': { source_name: 'OPEC Secretariat', region: 'GLOBAL', input_nature: 'macro_data_release' },
  'eia.gov': { source_name: 'US EIA', region: 'US', input_nature: 'macro_data_release' },
  'argusmedia.com': { source_name: 'Argus Media', region: 'GLOBAL', input_nature: 'commodity_price_move' },
  // other agency on the list
  'tasnimnews.com': { source_name: 'Tasnim News Agency', region: 'OTHER', input_nature: 'news_headline', gdelt: false }, // GDELT returns nothing for tasnimnews.com (verified empty) — drop the wasted query slot

  // ============================================================================================
  // Expanded coverage — verified-live feeds wired into frameworks/screener/rss_feeds.json and the
  // NSE adapter (sources/nse.ts). Every entry is gdelt:false: each reaches the inbox through its
  // OWN RSS/NSE feed, so the GDELT query stays lean (approvedDomains() filters these out). The
  // firewall (lookupSource) still gates every item by its link domain. Provenance: each URL was
  // confirmed HTTP 200 + parseable by scripts/verify-feeds.ts before being added.
  // --- US (new) ---
  '247wallst.com': { source_name: '24/7 Wall St.', region: 'US', input_nature: 'news_headline', gdelt: false },
  'axios.com': { source_name: 'Axios', region: 'US', input_nature: 'news_headline', gdelt: false },
  'bankingdive.com': { source_name: 'Banking Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'bea.gov': { source_name: 'Bureau of Economic Analysis', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'benzinga.com': { source_name: 'Benzinga', region: 'US', input_nature: 'news_headline', gdelt: false },
  'biopharmadive.com': { source_name: 'BioPharma Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'bls.gov': { source_name: 'Bureau of Labor Statistics', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'businessinsider.com': { source_name: 'Business Insider', region: 'US', input_nature: 'news_headline', gdelt: false },
  'businesswire.com': { source_name: 'Business Wire', region: 'US', input_nature: 'company_press_release', gdelt: false },
  'canarymedia.com': { source_name: 'Canary Media', region: 'US', input_nature: 'news_headline', gdelt: false },
  'cbo.gov': { source_name: 'Congressional Budget Office', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'cbsnews.com': { source_name: 'CBS MoneyWatch', region: 'US', input_nature: 'news_headline', gdelt: false },
  'census.gov': { source_name: 'U.S. Census Bureau', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'cfodive.com': { source_name: 'CFO Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'cftc.gov': { source_name: 'CFTC Commitments of Traders', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'ciodive.com': { source_name: 'CIO Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'clinicaltrials.gov': { source_name: 'ClinicalTrials.gov', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'constructiondive.com': { source_name: 'Construction Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'content.govdelivery.com': { source_name: 'US Government agency (GovDelivery)', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'cpsc.gov': { source_name: 'U.S. CPSC', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'defensedaily.com': { source_name: 'Defense Daily', region: 'US', input_nature: 'news_headline', gdelt: false },
  'dol.gov': { source_name: 'DOL', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'endpoints.news': { source_name: 'Endpoints News', region: 'US', input_nature: 'news_headline', gdelt: false },
  'esgdive.com': { source_name: 'ESG Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'fda.gov': { source_name: 'U.S. Food & Drug Administration (Press Releases)', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'federalregister.gov': { source_name: 'Federal Register', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'federalreserve.gov': { source_name: 'Federal Reserve Board', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'ferc.gov': { source_name: 'FERC', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'fiercebiotech.com': { source_name: 'FierceBiotech', region: 'US', input_nature: 'news_headline', gdelt: false },
  'fiercehealthcare.com': { source_name: 'Fierce Healthcare', region: 'US', input_nature: 'news_headline', gdelt: false },
  'fiercepharma.com': { source_name: 'FiercePharma', region: 'US', input_nature: 'news_headline', gdelt: false },
  'forbes.com': { source_name: 'Forbes', region: 'US', input_nature: 'news_headline', gdelt: false },
  'fortune.com': { source_name: 'Fortune', region: 'US', input_nature: 'news_headline', gdelt: false },
  'foxbusiness.com': { source_name: 'Fox Business', region: 'US', input_nature: 'news_headline', gdelt: false },
  'ftc.gov': { source_name: 'Federal Trade Commission (Press Releases)', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'geekwire.com': { source_name: 'GeekWire', region: 'US', input_nature: 'news_headline', gdelt: false },
  'globenewswire.com': { source_name: 'GlobeNewswire', region: 'US', input_nature: 'company_press_release', gdelt: false },
  'grocerydive.com': { source_name: 'Grocery Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'healthcaredive.com': { source_name: 'Healthcare Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'housingwire.com': { source_name: 'HousingWire', region: 'US', input_nature: 'news_headline', gdelt: false },
  'justice.gov': { source_name: 'DOJ', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'manufacturingdive.com': { source_name: 'Manufacturing Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'medtechdive.com': { source_name: 'MedTech Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'nasdaq.com': { source_name: 'Nasdaq', region: 'US', input_nature: 'news_headline', gdelt: false },
  'newyorkfed.org': { source_name: 'Federal Reserve Bank of New York', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'nhtsa.gov': { source_name: 'NHTSA', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'npr.org': { source_name: 'NPR', region: 'US', input_nature: 'news_headline', gdelt: false },
  'occ.gov': { source_name: 'Office of the Comptroller of the Currency', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'osha.gov': { source_name: 'OSHA', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'politico.com': { source_name: 'POLITICO', region: 'US', input_nature: 'news_headline', gdelt: false },
  'prnewswire.com': { source_name: 'PR Newswire', region: 'US', input_nature: 'company_press_release', gdelt: false },
  'restaurantdive.com': { source_name: 'Restaurant Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'retaildive.com': { source_name: 'Retail Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'saferproducts.gov': { source_name: 'U.S. Consumer Product Safety Commission', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'statnews.com': { source_name: 'STAT News', region: 'US', input_nature: 'news_headline', gdelt: false },
  'stlouisfed.org': { source_name: 'FRED (St. Louis Fed)', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'stocktitan.net': { source_name: 'Stock Titan', region: 'US', input_nature: 'company_press_release', gdelt: false },
  'supplychaindive.com': { source_name: 'Supply Chain Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'techcrunch.com': { source_name: 'TechCrunch', region: 'US', input_nature: 'news_headline', gdelt: false },
  'thehill.com': { source_name: 'The Hill', region: 'US', input_nature: 'news_headline', gdelt: false },
  'thestreet.com': { source_name: 'TheStreet', region: 'US', input_nature: 'news_headline', gdelt: false },
  'theverge.com': { source_name: 'The Verge', region: 'US', input_nature: 'news_headline', gdelt: false },
  'treasurydirect.gov': { source_name: 'TreasuryDirect', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'usda.gov': { source_name: 'USDA National Agricultural Statistics Service', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'utilitydive.com': { source_name: 'Utility Dive', region: 'US', input_nature: 'news_headline', gdelt: false },
  'war.gov': { source_name: 'U.S. Department of War (formerly DoD)', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'wardsauto.com': { source_name: 'WardsAuto (Automotive Dive)', region: 'US', input_nature: 'news_headline', gdelt: false },
  'yahoo.com': { source_name: 'Yahoo Finance', region: 'US', input_nature: 'news_headline', gdelt: false },
  // --- India (new) ---
  'cnbctv18.com': { source_name: 'CNBC-TV18', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'hindustantimes.com': { source_name: 'Hindustan Times (Business)', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'ndtvprofit.com': { source_name: 'NDTV Profit', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'rbi.org.in': { source_name: 'Reserve Bank of India (RBI)', region: 'IN', input_nature: 'regulatory_filing', gdelt: false },
  'sebi.gov.in': { source_name: 'Securities and Exchange Board of India (SEBI)', region: 'IN', input_nature: 'regulatory_filing', gdelt: false },
  'thehindubusinessline.com': { source_name: 'The Hindu BusinessLine', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'timesofindia.indiatimes.com': { source_name: 'The Times of India (Business)', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'trai.gov.in': { source_name: 'Telecom Regulatory Authority of India (TRAI)', region: 'IN', input_nature: 'regulatory_filing', gdelt: false },
  // --- Global (new) ---
  'afr.com': { source_name: 'Australian Financial Review', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'aljazeera.com': { source_name: 'Al Jazeera', region: 'GLOBAL', input_nature: 'geopolitical_event', gdelt: false },
  'bankingsupervision.europa.eu': { source_name: 'ECB Banking Supervision (SSM)', region: 'GLOBAL', input_nature: 'regulatory_filing', gdelt: false },
  'bankofcanada.ca': { source_name: 'Bank of Canada', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'bankofengland.co.uk': { source_name: 'Bank of England', region: 'GB', input_nature: 'macro_data_release', gdelt: false },
  'bbc.com': { source_name: 'BBC News', region: 'GB', input_nature: 'news_headline', gdelt: false },
  // BBC's RSS items link to BOTH bbc.com and bbc.co.uk — without this entry the bbc.co.uk items were
  // silently dropped at the gate (~5 of every ~85 BBC items/cycle). Same source_name for clean dedup.
  'bbc.co.uk': { source_name: 'BBC News', region: 'GB', input_nature: 'news_headline', gdelt: false },
  'bis.org': { source_name: 'Bank for International Settlements', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'boj.or.jp': { source_name: 'Bank of Japan', region: 'JP', input_nature: 'macro_data_release', gdelt: false },
  'businesstimes.com.sg': { source_name: 'The Business Times (Singapore)', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'carscoops.com': { source_name: 'Carscoops', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'coindesk.com': { source_name: 'CoinDesk', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'cointelegraph.com': { source_name: 'Cointelegraph', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'defensenews.com': { source_name: 'Defense News', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'dw.com': { source_name: 'Deutsche Welle', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'eba.europa.eu': { source_name: 'European Banking Authority (EBA)', region: 'GLOBAL', input_nature: 'regulatory_filing', gdelt: false },
  'ec.europa.eu': { source_name: 'Eurostat', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'ecb.europa.eu': { source_name: 'European Central Bank', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'eetimes.com': { source_name: 'EE Times', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'ema.europa.eu': { source_name: 'European Medicines Agency', region: 'GLOBAL', input_nature: 'regulatory_filing', gdelt: false },
  'esma.europa.eu': { source_name: 'ESMA', region: 'GLOBAL', input_nature: 'regulatory_filing', gdelt: false },
  'fca.org.uk': { source_name: 'UK Financial Conduct Authority (FCA)', region: 'GB', input_nature: 'regulatory_filing', gdelt: false },
  'france24.com': { source_name: 'France 24', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'gcaptain.com': { source_name: 'gCaptain', region: 'GLOBAL', input_nature: 'shipping_rate_move', gdelt: false },
  'gold.org': { source_name: 'World Gold Council', region: 'GLOBAL', input_nature: 'commodity_price_move', gdelt: false },
  'handelsblatt.com': { source_name: 'Handelsblatt', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'hellenicshippingnews.com': { source_name: 'Hellenic Shipping News Worldwide', region: 'GLOBAL', input_nature: 'shipping_rate_move', gdelt: false },
  'ieee.org': { source_name: 'IEEE Spectrum', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'investing.com': { source_name: 'Investing.com', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'maritime-executive.com': { source_name: 'Maritime Executive', region: 'GLOBAL', input_nature: 'shipping_rate_move', gdelt: false },
  'mining.com': { source_name: 'Mining.com', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'nikkei.com': { source_name: 'Nikkei Asia', region: 'JP', input_nature: 'news_headline', gdelt: false },
  'offshore-energy.biz': { source_name: 'Offshore Energy', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'oilprice.com': { source_name: 'OilPrice.com', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'rigzone.com': { source_name: 'Rigzone', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'riksbank.se': { source_name: 'Sveriges Riksbank', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'scmp.com': { source_name: 'South China Morning Post', region: 'CN', input_nature: 'news_headline', gdelt: false },
  'seatrade-maritime.com': { source_name: 'Seatrade Maritime News', region: 'GLOBAL', input_nature: 'shipping_rate_move', gdelt: false },
  'semiwiki.com': { source_name: 'SemiWiki', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'ship.energy': { source_name: 'ship.energy (Bunkerspot)', region: 'GLOBAL', input_nature: 'commodity_price_move', gdelt: false },
  'snb.ch': { source_name: 'Swiss National Bank', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'splash247.com': { source_name: 'Splash247', region: 'GLOBAL', input_nature: 'shipping_rate_move', gdelt: false },
  'straitstimes.com': { source_name: 'The Straits Times', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'theglobeandmail.com': { source_name: 'The Globe and Mail', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'theguardian.com': { source_name: 'The Guardian', region: 'GB', input_nature: 'news_headline', gdelt: false },
  'theloadstar.com': { source_name: 'The Loadstar', region: 'GLOBAL', input_nature: 'shipping_rate_move', gdelt: false },
  'theregister.com': { source_name: 'The Register', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'tomshardware.com': { source_name: 'Tom\'s Hardware', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'worldbank.org': { source_name: 'World Bank Group', region: 'GLOBAL', input_nature: 'macro_data_release' }, // no free RSS exists (verified) — let GDELT cover its headlines (it indexes them) instead of an empty promise
  'worldsteel.org': { source_name: 'World Steel Association (worldsteel)', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  'wto.org': { source_name: 'World Trade Organization', region: 'GLOBAL', input_nature: 'geopolitical_event', gdelt: false },
  // --- Other markets (new) ---
  'cbc.ca': { source_name: 'CBC', region: 'OTHER', input_nature: 'news_headline', gdelt: false },
  'euronext.com': { source_name: 'Euronext', region: 'OTHER', input_nature: 'exchange_announcement', gdelt: false },
  'moneyweb.co.za': { source_name: 'South Africa JSE / SENS', region: 'OTHER', input_nature: 'news_headline', gdelt: false },
  'rba.gov.au': { source_name: 'Reserve Bank of Australia', region: 'OTHER', input_nature: 'macro_data_release', gdelt: false },
  'tpex.org.tw': { source_name: 'Taipei Exchange (TPEx)', region: 'OTHER', input_nature: 'exchange_announcement', gdelt: false },
  'twse.com.tw': { source_name: 'Taiwan Stock Exchange (TWSE)', region: 'OTHER', input_nature: 'regulatory_filing', gdelt: false },
  // --- Top IBKR-tradable markets — Japan, UK, China, South Korea + US/India deepening (verified live) ---
  // --- US (added) ---
  'fool.com': { source_name: 'The Motley Fool', region: 'US', input_nature: 'news_headline', gdelt: false },
  'nasdaqtrader.com': { source_name: 'Nasdaq Trader', region: 'US', input_nature: 'exchange_announcement', gdelt: false },
  // --- United Kingdom ---
  'cityam.com': { source_name: 'City A.M.', region: 'GB', input_nature: 'news_headline', gdelt: false },
  'independent.co.uk': { source_name: 'The Independent', region: 'GB', input_nature: 'news_headline', gdelt: false },
  'ons.gov.uk': { source_name: 'Office for National Statistics (ONS)', region: 'GB', input_nature: 'macro_data_release', gdelt: false },
  'sky.com': { source_name: 'Sky News', region: 'GB', input_nature: 'news_headline', gdelt: false },
  'standard.co.uk': { source_name: 'The Standard (Evening Standard)', region: 'GB', input_nature: 'news_headline', gdelt: false },
  'thisismoney.co.uk': { source_name: 'This is Money (Daily Mail)', region: 'GB', input_nature: 'news_headline', gdelt: false },
  // --- Japan ---
  'fsa.go.jp': { source_name: 'Financial Services Agency (FSA Japan)', region: 'JP', input_nature: 'regulatory_filing', gdelt: false },
  'japantimes.co.jp': { source_name: 'The Japan Times', region: 'JP', input_nature: 'news_headline', gdelt: false },
  'japantoday.com': { source_name: 'Japan Today', region: 'JP', input_nature: 'news_headline', gdelt: false },
  'jpx.co.jp': { source_name: 'Japan Exchange Group (JPX)', region: 'JP', input_nature: 'exchange_announcement', gdelt: false },
  'kyodonews.net': { source_name: 'Kyodo News (Japan Wire)', region: 'JP', input_nature: 'news_headline', gdelt: false },
  'mainichi.jp': { source_name: 'The Mainichi', region: 'JP', input_nature: 'news_headline', gdelt: false },
  'nippon.com': { source_name: 'nippon.com', region: 'JP', input_nature: 'news_headline', gdelt: false },
  // --- China (mainland, English) ---
  'cgtn.com': { source_name: 'CGTN Business', region: 'CN', input_nature: 'news_headline', gdelt: false },
  'cnevpost.com': { source_name: 'CnEVPost', region: 'CN', input_nature: 'news_headline', gdelt: false },
  'ecns.cn': { source_name: 'ECNS (China News Service, English)', region: 'CN', input_nature: 'news_headline', gdelt: false },
  'globaltimes.cn': { source_name: 'Global Times', region: 'CN', input_nature: 'news_headline', gdelt: false },
  'sixthtone.com': { source_name: 'Sixth Tone', region: 'CN', input_nature: 'news_headline', gdelt: false },
  'technode.com': { source_name: 'TechNode', region: 'CN', input_nature: 'news_headline', gdelt: false },
  // --- South Korea ---
  'yna.co.kr': { source_name: 'Yonhap News Agency', region: 'KR', input_nature: 'news_headline', gdelt: false },
  'kedglobal.com': { source_name: 'KED Global (Korea Economic Daily, English)', region: 'KR', input_nature: 'news_headline', gdelt: false },
  'koreaherald.com': { source_name: 'The Korea Herald', region: 'KR', input_nature: 'news_headline', gdelt: false },
  'businesskorea.co.kr': { source_name: 'BusinessKorea', region: 'KR', input_nature: 'news_headline', gdelt: false },
  // --- India (deepened) ---
  'businesstoday.in': { source_name: 'Business Today', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'deccanherald.com': { source_name: 'Deccan Herald', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'freepressjournal.in': { source_name: 'Free Press Journal', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'outlookbusiness.com': { source_name: 'Outlook Business', region: 'IN', input_nature: 'news_headline', gdelt: false },
  'outlookmoney.com': { source_name: 'Outlook Money', region: 'IN', input_nature: 'news_headline' },
  'theprint.in': { source_name: 'The Print', region: 'IN', input_nature: 'news_headline', gdelt: false },
  // --- Genuinely-new high-edge expansion (Jun 2026): primary regulatory/recall feeds, new exchange
  //     regions, central banks, crypto/datacenter/semi trade press, weather catastrophe. All carry
  //     their own RSS/JSON (gdelt:false → keep the GDELT query lean). Verified live by verify-feeds.ts.
  'cision.com': { source_name: 'Cision (Nordic regulatory wire)', region: 'OTHER', input_nature: 'company_press_release', gdelt: false },
  'bok.or.kr': { source_name: 'Bank of Korea', region: 'KR', input_nature: 'macro_data_release', gdelt: false },
  'rbnz.govt.nz': { source_name: 'Reserve Bank of New Zealand', region: 'OTHER', input_nature: 'macro_data_release', gdelt: false },
  'trendforce.com': { source_name: 'TrendForce', region: 'OTHER', input_nature: 'news_headline', gdelt: false },
  'consumerfinance.gov': { source_name: 'CFPB', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'drugs.com': { source_name: 'Drugs.com', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'nih.gov': { source_name: 'DailyMed (NIH/NLM)', region: 'US', input_nature: 'regulatory_filing', gdelt: false },
  'noaa.gov': { source_name: 'NOAA / National Hurricane Center', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'weather.gov': { source_name: 'US National Weather Service', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'atlantafed.org': { source_name: 'Atlanta Fed (GDPNow)', region: 'US', input_nature: 'macro_data_release', gdelt: false },
  'blockworks.com': { source_name: 'Blockworks', region: 'US', input_nature: 'news_headline', gdelt: false },
  'decrypt.co': { source_name: 'Decrypt', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'datacenterdynamics.com': { source_name: 'DataCenterDynamics', region: 'GLOBAL', input_nature: 'news_headline', gdelt: false },
  'usgs.gov': { source_name: 'USGS Earthquakes', region: 'GLOBAL', input_nature: 'macro_data_release', gdelt: false },
  // --- GDELT-queried global financial press (Jun 2026): high-quality, genuinely-additive outlets we
  //     have no direct feed for, covering regions/sectors beyond our existing wires. NO gdelt:false →
  //     GDELT pulls their headlines (it indexes these reliably). Kept conservative (+15) so the GDELT
  //     query stays short and few-chunked; expand only while watching for 429 / "query too long".
  'barrons.com': { source_name: "Barron's", region: 'US', input_nature: 'news_headline' },
  'economist.com': { source_name: 'The Economist', region: 'GB', input_nature: 'news_headline' },
  'caixinglobal.com': { source_name: 'Caixin Global', region: 'CN', input_nature: 'news_headline' },
  'investors.com': { source_name: "Investor's Business Daily", region: 'US', input_nature: 'news_headline' },
  'semafor.com': { source_name: 'Semafor Business', region: 'US', input_nature: 'news_headline' },
  'theblock.co': { source_name: 'The Block (crypto)', region: 'GLOBAL', input_nature: 'news_headline' },
  'finextra.com': { source_name: 'Finextra', region: 'GB', input_nature: 'news_headline' },
  'lesechos.fr': { source_name: 'Les Echos', region: 'OTHER', input_nature: 'news_headline' },
  'ilsole24ore.com': { source_name: 'Il Sole 24 Ore', region: 'OTHER', input_nature: 'news_headline' },
  'expansion.com': { source_name: 'Expansión', region: 'OTHER', input_nature: 'news_headline' },
  'thenationalnews.com': { source_name: 'The National (UAE)', region: 'OTHER', input_nature: 'news_headline' },
  'arabnews.com': { source_name: 'Arab News', region: 'OTHER', input_nature: 'news_headline' },
  'bangkokpost.com': { source_name: 'Bangkok Post', region: 'OTHER', input_nature: 'news_headline' },
  'businesslive.co.za': { source_name: 'Business Day (BusinessLive)', region: 'OTHER', input_nature: 'news_headline' },
  'dealstreetasia.com': { source_name: 'DealStreetAsia', region: 'OTHER', input_nature: 'news_headline' },
  // --- International exchange primary-disclosure JSON adapters (exchange-intl.ts) — items pass the
  //     firewall on these link domains (the API hosts differ). gdelt:false: read directly, not via GDELT.
  'hkexnews.hk': { source_name: 'HKEXnews (HK Exchange Filing)', region: 'CN', input_nature: 'exchange_announcement', gdelt: false },
  'asx.com.au': { source_name: 'ASX (Australia Exchange Filing)', region: 'OTHER', input_nature: 'exchange_announcement', gdelt: false },
}

/** Lowercase, strip a leading www., and keep only the host (no scheme/path) — GDELT gives a bare host already. */
export function normalizeDomain(raw: string): string {
  let d = (raw || '').trim().toLowerCase()
  if (d.includes('/')) {
    try {
      d = new URL(d.includes('://') ? d : `https://${d}`).hostname
    } catch {
      d = d.split('/')[0]
    }
  }
  return d.replace(/^www\./, '')
}

/**
 * Resolve an article's domain to an approved source, or null if off-list.
 * Matches the exact registrable domain OR a subdomain on a dot boundary (markets.ft.com → ft.com),
 * never a look-alike (notactuallyft.com does NOT match ft.com) — closing GDELT's loose-match gap.
 */
export function lookupSource(rawDomain: string): SourceMeta | null {
  const host = normalizeDomain(rawDomain)
  if (!host) return null
  if (DOMAINS[host]) return DOMAINS[host]
  for (const dom of Object.keys(DOMAINS)) {
    if (host === dom || host.endsWith('.' + dom)) return DOMAINS[dom]
  }
  return null
}

/** The bare domains to ask GDELT for (so the firehose is pre-filtered to approved sources). Excludes
 *  domains flagged gdelt:false — those reach the inbox through their own RSS/NSE feed, and adding
 *  them to GDELT would only bloat the query with sources GDELT does not meaningfully index. */
export function approvedDomains(): string[] {
  return Object.keys(DOMAINS).filter((d) => DOMAINS[d].gdelt !== false)
}

/** Every approved domain (for tests / introspection) — the full firewall, GDELT-queried or not. */
export function allApprovedDomains(): string[] {
  return Object.keys(DOMAINS)
}
