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
## 2026-03-27 Batch 4

- Range: next 100 pending entries after Batch 3 in current `cards.json` order excluding card_ids already covered by prior batch files
- Card IDs: `18399-18420`, `16472-16549`
- Scope: 100 cards with `effect_specs.status == "pending"` continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_18399_18420_16472_16549_effect_specs.json`
- Notes: used `ready` for standard heal, draw, status, recoil, switch, recycle, and direct damage-plus-bench patterns; used `custom` for triggered abilities, attack locks, rule-prevention clauses, conditional supporter checks, variable damage formulas tied to discarded cards, hand contents, prizes, attached energy totals, and complex energy movement or multi-target distribution effects
## 2026-03-27 Batch 5

- Range: next 50 pending entries after Batch 4 in current `cards.json` order excluding card_ids already covered by prior batch files
- Card IDs: `16550-16599`
- Scope: 50 cards with `effect_specs.status == "pending"` continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_16550_16599_effect_specs.json`
- Notes: used `ready` for standard heal, draw, status, recoil, discard-energy, shuffle-hand-and-draw, search, and attach-energy patterns; used `custom` for damage-counter placement from discard counts, deck-top mill scaling, bench-wide or targeted redistribution, self or opponent attack locks, prize and bench-count conditions, attached-energy total formulas, and triggered or continuous modifier abilities

## 2026-03-27 Batch 8

- Range: next 50 pending entries after Batch 7 in current `cards.json` order excluding card_ids already covered by prior batch files
- Card IDs: `16700-16744`, `18255`, `16745`, `18256`, `16746-16747`
- Scope: 50 cards with `effect_specs.status == "pending"` continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_16700_16747_with_18255_18256_effect_specs.json`
- Notes: used `ready` for standard draw, heal, attach-energy, discard-energy, coin-flip status, bench damage, and search effects; used `custom` for self-KO acceleration, prize or energy count scaling, hand inspection and selective discard, item lock, retreat lock, next-turn attack restrictions, bench-damage prevention rules, arbitrary energy distribution, and other lingering turn-based effects

## 2026-03-27 Batch 9

- Range: next 50 pending entries after Batch 8 in current `cards.json` order excluding card_ids already covered by prior batch files
- Card IDs: `16748-16794`, `18257`, `18258`, `18260`
- Scope: 50 cards with `effect_specs.status == "pending"` continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_16748_16794_with_18257_18258_18260_effect_specs.json`
- Notes: used `ready` for standard coin flips, draw, heal, bench damage, search, discard-energy, and simple status effects; used `custom` for copy attacks, random or selective discard, de-evolution, card-wide prevention rules, global ability suppression, prize manipulation, conditional attack-use restrictions, and complex energy redistribution or damage formulas

## 2026-03-27 Batch 10

- Range: next 50 pending entries after Batch 9 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: `16795-16844`
- Scope: 50 cards with `effect_specs.status == "pending"` continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_16795_16844_effect_specs.json`
- Notes: used `ready` for standard heal, search, status, shuffle-hand-and-draw, recoil, and selected discard-energy patterns; used `custom` for deck-top reordering, hand-size and board-state dependent damage, attack copying, bench and active redirection, attack-use locks, trait suppression, first-turn restrictions, and lingering prevention or modifier effects

## 2026-03-27 Batch 11

- Range: next 50 pending entries after Batch 10 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: `16845-16894`
- Scope: 50 cards with `effect_specs.status == "pending"` continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: `deck-builder-data/batch_16845_16894_effect_specs.json`
- Notes: used `ready` for standard attach-energy, draw, switch, recoil, coin-flip bonus, and selected discard-energy patterns; used `custom` for attack-use restrictions, damage modifiers based on evolution, future trait, prizes, or damage counters, de-evolution, hand-placement acceleration, global damage auras, resistance-ignoring clauses, and multi-target or conditional prevention effects

## 2026-03-27 Batch 12

- Range: next 50 pending entries after Batch 11 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 16895-16944
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_16895_16944_effect_specs.json
- Notes: used eady for standard attach-energy, discard-energy, direct status, confusion, recoil, supporter search, and simple pure-damage attacks; used custom for bench-only protection rules, named-Pokemon checks, evolution-from-deck effects, special poison clauses, delayed retaliation, attack-copying, hand inspection, movement of damage counters or opponent energy, and other conditional or lingering effects

## 2026-03-27 Batch 13

- Range: next 50 pending entries after Batch 12 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 16945-16994
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_16945_16994_effect_specs.json
- Notes: used eady for standard coin flips, draw, direct status, bench damage, recoil, discard-energy, supporter search, attach-energy, and temporary damage reduction effects; used custom for prize gain, named attack lock, hand discard selection, conditional damage formulas, self-poison setup, special poison modifiers, delayed retreat lock, move-counter effects, and other board-state or turn-state dependent clauses

## 2026-03-27 Batch 14

- Range: next 50 pending entries after Batch 13 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 16995-17044
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_16995_17044_effect_specs.json
- Notes: used eady for standard bench damage, coin flips, draw, recoil, discard-energy, supporter or Pokemon search, and temporary damage reduction or free-retreat effects; used custom for evolution-from-hand triggers, attack-copying, instant knock out clauses, hand-to-field energy acceleration, conditional damage formulas, prevention auras, shuffle-back attacks, and other turn-state or board-state dependent effects
## 2026-03-27 Batch 15

- Range: next 50 pending entries after Batch 14 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 17045-17094
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_17045_17094_effect_specs.json
- Notes: used ready for standard switch, draw, search, attach-energy, bench damage, recoil, and simple coin-flip bonus patterns; used custom for attack lock clauses, hand inspection, variable damage formulas based on attached energy or benched Pokemon counts, weakness changes, self-status setup, conditional damage modifiers, and other turn-state or board-state dependent effects
## 2026-03-27 Batch 16

- Range: next 50 pending entries after Batch 15 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 17095-17144
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_17095_17144_effect_specs.json
- Notes: used ready for standard draw, heal, search, switch, recycle-from-discard, move-energy, multistatus, and simple sequence patterns; used custom for prize-count restrictions, attack-cost reduction, retaliation abilities, first-turn usage limits, named Pokemon filters, top-deck look or choose effects, complex item timing clauses, fossil rules, and other board-state or card-state dependent effects
## 2026-03-27 Batch 17

- Range: next 50 pending entries after Batch 16 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 17145-17194
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_17145_17194_effect_specs.json
- Notes: used ready for standard draw, heal, switch, search, recycle-from-discard, move-energy, and simple card-level sequence patterns; used custom for Pokemon Tool modifiers, damage-reduction berries, cost reduction, prize and first-turn restrictions, top-deck choose effects, selective hand refresh, fossil rules, conditional supporter clauses, and other persistent or board-state dependent card effects
## 2026-03-27 Batch 18

- Range: next 50 pending entries after Batch 17 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 17195-17213, 18334-18357, 14661-14667
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_17195_17213_18334_18357_14661_14667_effect_specs.json
- Notes: used ready for standard draw, heal, search, switch, move-energy, recoil, paralysis coin flips, and direct damage-only attacks; used custom for supporter decision branches, prize-condition clauses, all-field or named-card restrictions, special energy replacement text, Pokemon Tool continuous modifiers, variable damage formulas, targeted bench damage, and entry-triggered or fossil-like persistent effects
## 2026-03-27 Batch 19

- Range: next 50 pending entries after Batch 18 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14668-14717
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14668_14717_effect_specs.json
- Notes: used ready for standard status, attach-energy, heal, recoil, draw-discard refresh, search, move-energy, and selected discard-energy patterns; used custom for named-Pokemon support auras, attack-use locks, first-turn clauses, conditional damage formulas, self-preservation replacement effects, special immunity text, bench sniping against restricted targets, and other persistent or board-state dependent effects
## 2026-03-27 Batch 20

- Range: next 50 pending entries after Batch 19 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14718-14767
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14718_14767_effect_specs.json
- Notes: used ready for standard coin-flip bonus, draw, heal, search, status, recoil, damage reduction, and discard-energy patterns; used custom for attack-use locks, damage formulas tied to bench, prizes, counters, or attached cards, evolve and bench setup, extra-prize and retreat auras, evolve-triggered counter placement, and other persistent or board-state dependent effects
## 2026-03-27 Batch 21

- Range: next 50 pending entries after Batch 20 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14768-14817
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14768_14817_effect_specs.json
- Notes: used ready for standard draw, heal, search, switch, status, recoil, discard-energy, energy recovery, and selected card-item search patterns; used custom for name-based or tera-based restrictions, prize and bench dependent damage formulas, attack copying, evolve triggers, global damage auras, protection clauses, hand discard selection, and multi-step trainer effects with special targeting or top-deck inspection
## 2026-03-27 Batch 22

- Range: next 50 pending entries after Batch 21 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14818-14853, 15942-15955
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14818_14853_15942_15955_effect_specs.json
- Notes: used ready for standard search, switch, draw, discard-energy, heal, status, recoil, energy recovery, and selected special-energy provisioning patterns; used custom for rule-box and named-card restrictions, prize and tera conditions, top-deck inspection, hand-size and bench-dependent damage formulas, global stadium auras, targeted discard or gust effects, and multi-step supporter or item effects with conditional branches
## 2026-03-27 Batch 23

- Range: next 50 pending entries after Batch 22 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 15956-15998, 14319-14325
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_15956_15998_14319_14325_effect_specs.json
- Notes: used ready for standard search, switch, status, recoil, discard-energy, heal, draw-to-count, and selected energy-provide patterns; used custom for hand-size and bench-dependent damage formulas, top-deck and card-choice inspection, name-based and mega or tera restrictions, special prize adjustments, global stadium and tool suppression auras, attack copying, and multi-step supporter or item effects with persistent turn clauses

## 2026-03-27 Batch 24

- Range: next 50 pending entries after Batch 23 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14326-14375
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14326_14375_effect_specs.json
- Notes: used ready for standard draw, search, heal, recoil, switch, coin-flip bonus, coin-flip fail, discard-energy, and selected damage-reduction patterns; used custom for board-wide or named-card counting damage formulas, active-or-bench conditional bonuses, attack-effect immunity, hand and bench targeting clauses, evolve triggers, stadium interaction, prevention auras, attack locks, and other board-state or turn-state dependent effects

## 2026-03-27 Batch 25

- Range: next 50 pending entries after Batch 24 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14376-14398, 14105-14127, 14129-14132
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14376_14398_14105_14127_14129_14132_effect_specs.json
- Notes: used ready for standard draw, search, switch, heal, move-energy, attach-energy, recycle-from-discard, coin-flip bonus, coin-flip until tails, and selected damage-reduction patterns; used custom for bench-to-active condition bonuses, tool or stadium continuous rules, hand costs, hand-size and board-size dependent damage formulas, opponent hand disruption, conditional immunity, prize reduction, mixed-type recovery choices, and other persistent or board-state dependent clauses

## 2026-03-27 Batch 26

- Range: next 50 pending entries after Batch 25 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14133-14151, 13958-13988
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14133_14151_13958_13988_effect_specs.json
- Notes: used ready for standard draw, search, switch, heal, recoil, discard-energy, attach-energy, bench damage, coin-flip fail, coin-flip bonus, and selected status patterns; used custom for persistent tool or ability rules, supporter-copying, turn-based attack lock clauses, mixed search filters, named-Pokemon requirements, prize and bench dependent damage formulas, setup-stage evolution shortcuts, and other board-state or turn-state dependent effects

## 2026-03-27 Batch 27

- Range: next 50 pending entries after Batch 26 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 13989-14020, 14182-14199
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_13989_14020_14182_14199_effect_specs.json
- Notes: used ready for standard draw, heal, search, switch, recoil, discard-energy, bench damage, coin-flip bonus, and direct status patterns; used custom for KO or immunity clauses, prize and energy dependent damage formulas, supporter-copying, topdeck swap effects, special target selection, setup-stage and once-per-turn restrictions, conditional damage replacement, and other persistent or board-state dependent effects

## 2026-03-27 Batch 28

- Range: next 50 pending entries after Batch 27 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 14200-14210, 14021-14059
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_14200_14210_14021_14059_effect_specs.json
- Notes: used ready for standard search, draw, heal, switch, direct status, discard-energy, recoil, bench damage, and coin-flip bonus or fail patterns; used custom for evolving triggers, aura effects, special hand or deck manipulation, conditional immunity, prize or energy dependent damage formulas, KO clauses, persistent attack locks, and other board-state or turn-state dependent effects
## 2026-03-27 Batch 29
- Card IDs: 14060-14083, 14211-14236
- Output: `deck-builder-data/batch_14060_14083_14211_14236_effect_specs.json`
- Notes: 完成 M1S 下一批 50 張 pending 卡片效果規格填寫與合併。

## 2026-03-27 Batch 30
- Card IDs: 14237-14239, 14084-14101, 14416-14427, 14431-14432, 14443, 14462-14468, 17971-17977
- Output: `deck-builder-data/batch_14237_14239_14084_14101_14416_14427_14431_14432_14443_14462_14468_17971_17977_effect_specs.json`
- Notes: 完成下一批 50 張 pending 卡片效果規格填寫與合併。

## 2026-03-27 Batch 31
- Card IDs: 18058-18078, 18504-18505, 14445, 13161-13182, 13137-13140
- Output: `deck-builder-data/batch_18058_18078_18504_18505_14445_13161_13182_13137_13140_effect_specs.json`
- Notes: 完成下一批 50 張 pending 卡片效果規格填寫與合併。

## 2026-03-27 Batch 32
- Card IDs: 13141-13159, 12943-12973
- Output: `deck-builder-data/batch_13141_13159_12943_12973_effect_specs.json`
- Notes: 完成下一批 50 張 pending 卡片效果規格填寫與合併。


## 2026-03-27 Batch 33
- Card IDs: 12974-13023
- Output: deck-builder-data/batch_12974_13023_effect_specs.json
- Notes: 處理下一批 50 張 pending 卡片效果規格，涵蓋標準檢索、附能、治療、狀態、增傷、反傷與多個需自訂的條件、進化、化石、檢視手牌與防護效果。

## 2026-03-27 Batch 34
- Card IDs: 13024-13028, 13692-13736
- Output: deck-builder-data/batch_13024_13028_13692_13736_effect_specs.json
- Notes: 處理下一批 50 張 pending 卡片效果規格，涵蓋工具與特殊能量、標準抽牌與治療、狀態與丟能量、以及多個需自訂的輪唱、進化、條件失敗、檢視牌庫上方、招式封鎖與免疫效果。

## 2026-03-27 Batch 35
- Card IDs: 13737-13778, 13954, 13029-13035
- Output: `deck-builder-data/batch_13737_13778_13954_13029_13035_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 36
- Card IDs: 13036-13085
- Output: `deck-builder-data/batch_13036_13085_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 37
- Card IDs: 13086-13114, 13779-13799
- Output: `deck-builder-data/batch_13086_13114_13779_13799_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 38
- Card IDs: 13800-13849
- Output: `deck-builder-data/batch_13800_13849_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 39
- Card IDs: 13850-13865, 13956, 12751-12783
- Output: `deck-builder-data/batch_13850_13865_13956_12751_12783_effect_specs.json`
- Notes: 續處理 cards.updated.json 中下一批 50 張 pending 效果規格。
## 2026-03-27 Batch 40
- Card IDs: 12784-12833
- Output: `deck-builder-data/batch_12784_12833_effect_specs.json`
- Notes: 續處理 cards.updated.json 中下一批 50 張 pending 效果規格。
## 2026-03-27 Batch 41
- Card IDs: 12834-12848, 12904-12937, 12659
- Output: `deck-builder-data/batch_12834_12848_12904_12937_12659_effect_specs.json`
- Notes: 續處理 cards.updated.json 中下一批 50 張 pending 效果規格。
## 2026-03-27 Batch 42
- Card IDs: 12660-12709
- Output: `deck-builder-data/batch_12660_12709_effect_specs.json`
- Notes: 續處理 cards.updated.json 中下一批 50 張 pending 效果規格。
## 2026-03-27 Batch 43
- Card IDs: 12710-12750, 12581-12589
- Output: `deck-builder-data/batch_12710_12750_12581_12589_effect_specs.json`
- Notes: 續處理 cards.updated.json 中下一批 50 張 pending 效果規格。
## 2026-03-27 Batch 44
- Card IDs: 12590-12625, 12463-12478
- Output: `deck-builder-data/batch_12590_12625_12463_12478_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 45
- Card IDs: 12479-12528
- Output: `deck-builder-data/batch_12479_12528_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 46
- Card IDs: 12529-12562, 12627-12642
- Output: `deck-builder-data/batch_12529_12562_12627_12642_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 47
- Card IDs: 12643-12658, 11526-11559
- Output: `deck-builder-data/batch_12643_12658_11526_11559_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 48
- Card IDs: 11560-11609
- Output: `deck-builder-data/batch_11560_11609_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 49
- Card IDs: 11610-11659
- Output: `deck-builder-data/batch_11610_11659_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 50
- Card IDs: 11660-11709
- Output: `deck-builder-data/batch_11660_11709_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 51
- Card IDs: 11710-11712, 12269-12315
- Output: `deck-builder-data/batch_11710_11712_12269_12315_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 52
- Card IDs: 12316-12318, 12071-12117
- Output: `deck-builder-data/batch_12316_12318_12071_12117_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 53
- Card IDs: 12118-12167
- Output: `deck-builder-data/batch_12118_12167_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 54
- Card IDs: 12168-12217
- Output: `deck-builder-data/batch_12168_12217_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????
## 2026-03-27 Batch 55
- Card IDs: 12218-12245, 11181-11202
- Output: `deck-builder-data/batch_12218_12245_11181_11202_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 57
- Card IDs: 11203-11252
- Output: deck-builder-data/batch_11203_11252_effect_specs.json`r
- Notes: ��B�z cards.updated.json ���U�@�� 50 �i pending �ĪG�W��C


## 2026-03-27 Batch 58
- Card IDs: 11253-11286, 11460-11475
- Output: deck-builder-data/batch_11253_11286_11460_11475_effect_specs.json`r
- Notes: ��B�z cards.updated.json ���U�@�� 50 �i pending �ĪG�W��C

## 2026-03-27 Batch 59

- Range: next 50 pending entries after Batch 58 in current cards.json order excluding card_ids already covered by prior batch files
- Card IDs: 11476-11491, 11031-11064
- Scope: 50 cards with effect_specs.status == "pending" continuing from the previous batch outputs without redoing completed cards
- Output format: JSON array for merge script consumption
- Output file: deck-builder-data/batch_11476_11491_11031_11064_effect_specs.json
- Notes: used ready for standard status, heal, discard-energy, search, switch, recoil, bench damage, coin-flip bonus/effect, and sequence patterns; used custom for retreat lock, deck mill, staged evolution shortcuts, tera or rule-specific immunities, damage replacement, evolving-card removal, prize/type-conditional formulas, and persistent turn-state modifiers.


## 2026-03-27 Batch 59
- Card IDs: 11065-11094, 11430-11449
- Output: deck-builder-data/batch_11065_11094_11430_11449_effect_specs.json`r
- Notes: ��B�z cards.updated.json ���U�@�� 50 �i pending �ĪG�W��C


## 2026-03-27 Batch 60
- Card IDs: 11450-11459, 11131-11170
- Output: deck-builder-data/batch_11450_11459_11131_11170_effect_specs.json`r
- Notes: ��B�z cards.updated.json ���U�@�� 50 �i pending �ĪG�W��C


## 2026-03-27 Batch 61
- Card IDs: 11171-11172, 11103-11110, 11095-11102, 10896-10927
- Output: `deck-builder-data/batch_11171_11172_11103_11110_11095_11102_10896_10927_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 62
- Card IDs: 10928-10977
- Output: `deck-builder-data/batch_10928_10977_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 63
- Card IDs: 10978-11027
- Output: `deck-builder-data/batch_10978_11027_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 64
- Card IDs: 11028-11030, 10795-10813, 10837-10854, 10727-10736
- Output: `deck-builder-data/batch_11028_11030_10795_10813_10837_10854_10727_10736_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 65
- Card IDs: 10737-10747, 10749-10770, 10815-10831
- Output: `deck-builder-data/batch_10737_10747_10749_10770_10815_10831_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????

## 2026-03-27 Batch 66
- Card IDs: 10832-10835, 10772-10793, 10583-10606
- Output: `deck-builder-data/batch_10832_10835_10772_10793_10583_10606_effect_specs.json`
- Notes: ? cards.updated.json ???? 50 ? pending ???? effect specs?

## 2026-03-27 Batch 67
- Card IDs: 10607-10646, 10866-10875
- Output: `deck-builder-data/batch_10607_10646_10866_10875_effect_specs.json`
- Notes: ? cards.updated.json ???? 50 ? pending ???? effect specs?

## 2026-03-27 Batch 68
- Card IDs: 10876-10895, 10415-10444
- Output: deck-builder-data/batch_10876_10895_10415_10444_effect_specs.json
- Notes: ��B�z cards.json �̧ǤU�@�� 50 �i pending �ĪG�W��A�¶ˮ`�ۦ��аO�� skip�A����P����W�h��� custom�A�зǥi�����ĪG�ϥ� ready handler�C

## 2026-03-27 Batch 69
- Card IDs: 10445-10494
- Output: deck-builder-data/batch_10445_10494_effect_specs.json
- Notes: 續處理 cards.json 依序下一批 50 張 pending 效果規格，純傷害招式標記為 skip，常見效果使用 ready handler，其餘條件與狀態限制使用 custom。


## 2026-03-27 Batch 70
- Card IDs: 10495-10515, 10554-10582
- Output: `deck-builder-data/batch_10495_10515_10554_10582_effect_specs.json`
- Notes: 依 cards.json 順序處理下一批 50 張 pending，優先複用已完成同規格卡片的 effect_specs；無可複用者以純傷害標記 skip，其餘以 custom 補齊並填寫繁中說明。

## 2026-03-27 Batch 71
- Card IDs: 15824-15826, 10248-10294
- Output: `deck-builder-data/batch_15824_15826_10248_10294_effect_specs.json`
- Notes: ? cards.updated.json ???? 50 ? pending ???? effect specs?

## 2026-03-27 Batch 72
- Card IDs: 10295-10313, 10700-10726, 15821-15823, 9771
- Output: `deck-builder-data/batch_10295_10313_10700_10726_15821_15823_9771_effect_specs.json`
- Notes: ? cards.updated.json ???? 50 ? pending ???? effect specs?


## 2026-03-27 Batch 73
- Card IDs: 9772-9821
- Output: `deck-builder-data/batch_9772_9821_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????


## 2026-03-27 Batch 74
- Card IDs: 9822-9828, 9758-9770, 10195-10220, 15493-15495, 9842
- Output: `deck-builder-data/batch_9822_9828_9758_9770_10195_10220_15493_15495_9842_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????


## 2026-03-27 Batch 75
- Card IDs: 9843-9892
- Output: `deck-builder-data/batch_9843_9892_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ?????


## 2026-03-27 Batch 76
- Card IDs: 9893-9912, 10221-10246, 15818-15820, 10052
- Output: `deck-builder-data/batch_9893_9912_10221_10246_15818_15820_10052_effect_specs.json`
- Notes: ??? cards.updated.json ???? 50 ? pending ???????????? handler ??????????? skip??????????? custom ? sequence ???

## 2026-03-27 Batch 77
- Card IDs: 10053-10073, 10076-10097
- Output: `deck-builder-data/batch_10053_10097_effect_specs.json`
- Notes: ?? cards.updated.json ???? 43 ? pending ?????????????????????????????????? custom ???