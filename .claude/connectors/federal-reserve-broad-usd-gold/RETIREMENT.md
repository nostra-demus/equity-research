# Retired connector identity

`federal-reserve-broad-usd-gold` stopped scheduling when the shared
`federal-reserve-broad-usd` connector took ownership of the common
`macro.broad-usd-index` series for Gold and Crude Oil.

The old manifest is retained as `connector.retired.json` for audit identity.
Its already-sealed data vintages and archived decision artifacts remain
immutable and point-in-time reviewable. There is deliberately no
`connector.json` or runnable fetch entry in this directory, so production
discovery cannot acquire the same Gold dataset twice.
