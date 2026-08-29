export const MODULES = [
  'business-model',
  'earnings',
  'balance-sheet-survival',
  'competitive-intel',
  'management-governance',
  'valuation',
  'catalyst',
]

export const PARTIAL_FILES = [
  'modules/business-model/orbs/identity.md',
  'modules/business-model/synthesis.md',
]

export const REQUIRED_FILES = [
  ...MODULES.flatMap((module) => [`modules/${module}/orbs/fixture.md`, `modules/${module}/synthesis.md`]),
  'final_thesis.md',
  'decision_record.json',
  'execution_provenance.receipt.json',
  'publication.receipt.json',
]
