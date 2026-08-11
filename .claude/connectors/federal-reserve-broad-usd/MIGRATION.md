# Gold connector migration

The shared `federal-reserve-broad-usd` connector replaces the former
`federal-reserve-broad-usd-gold` connector and owns the common
`macro.broad-usd-index` series across Gold, energy, industrial metals,
grains and softs.

The former connector directory was removed so directory-based production
discovery cannot treat a retired identity as a malformed live connector.
Already sealed vintages retain their original connector identity in the
immutable vintage and receipt chain. Point-in-time readers resolve that chain
without depending on a currently installed connector manifest, so the
migration does not erase or rewrite historical evidence.
