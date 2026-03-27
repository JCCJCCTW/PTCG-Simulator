# Card Change Log

## 2026-03-27 Batch 1

- Range: `card_id 18421-18470`
- Scope: first 50 cards with `effect_specs.status == "pending"` from `deck-builder-data/cards.json`
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_18421_18470_effect_specs.json`
- Notes: used standard handlers where the spec was sufficient; used `custom` for delayed effects, damage formulas not covered by standard params, random discard, de-evolution, attack lock, and prevention clauses that require simulator-side implementation

## 2026-03-27 Batch 2

- Range: next 50 pending entries after Batch 1 in current `cards.json` order
- Card IDs: `18471-18503`, `18360-18376`
- Scope: 50 cards with `effect_specs.status == "pending"` continuing from the previous batch output
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_18471_18503_18360_18376_effect_specs.json`
- Notes: used `ready` for pure damage-plus-heal, draw, switch, recoil, conditional supporter, and special energy patterns already covered by standard handlers; used `custom` for event-triggered abilities, target-specific energy movement, poison-lock, deck/hand count-dependent effects, special stadium placement rules, and state-preserving replacement effects

## 2026-03-27 Batch 3

- Range: next 100 pending entries after Batch 2 in current `cards.json` order
- Card IDs: `18377-18381`, `17978-18057`, `18384-18398`
- Scope: 100 cards with `effect_specs.status == "pending"` continuing from the previous batch output
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_18377_18381_17978_18057_18384_18398_effect_specs.json`
- Notes: used `ready` for direct draw, heal, switch, recoil, simple discard-energy, bench damage, status, and standard special-energy provide patterns; used `custom` for top-N deck search, attack/seal effects, discard-then-scale damage, named-card and prize-count conditions, fossil-as-Pokemon tools, stadium turn-ending effects, and simulator-state-dependent prevention or modifier abilities
