# GAME RULE CHANGELOG

## 2026-04-08 Round 7: Trainer/Energy/Evolution 全面修正

### 根本原因修正
- **mapRawCardType 缺少「訓練家」判定**：783 張訓練家卡因 `card_type: "訓練家"` 未被識別，全部被錯誤歸類為 Pokemon，導致所有訓練家卡效果無法觸發。新增 `t.includes("訓練家")` 檢查。
- **executeEffectSpec handler 路由修正**：status="ready" 的自訂 handler 無法被找到（只搜尋 effectHandlers，未搜尋 customHandlers）。新增 `resolveCustomHandler` fallback。

### 訓練家卡系統
- 新增手牌右鍵選單「使用」按鈕，作為拖曳到展示區的替代方式
- `playTrainerCardFromHand` 新增遊戲階段（`遊戲中`）與回合歸屬檢查，防止在設置/對手回合使用
- `莉莉艾的決意` 5 張卡全部轉換為 `shuffleHandToDeck` handler
- `寶可平板` 3 張卡轉換為 `searchDeck` + `exclude_rule_box` 過濾（排除擁有規則的寶可夢）
- `好友寶芬` 的 `searchDeck` 過濾已支援：新增 `is_basic`、`max_hp`/`hp_lte`、`min_hp`/`hp_gte` 過濾條件
- `resolveTrainerEffectSpecs` 修正為同時查詢 source_index 0 和 1

### 能量系統
- 新增 `resolveEnergyProvides(energyCard, hostCard)` — 解析特殊能量提供的類型/數量
- 新增 `getEnergyUnitCount(energyCard, hostCard)` — 取得能量卡提供的單位數
- 新增 `meetsEnergyCost(card, attack)` — 驗證附加能量是否滿足招式費用
- 攻擊選擇視窗加入能量門檻：不足時灰階顯示、禁止點擊
- 特殊能量資料修正：燃火能量 (17207, 13114) 和新衝天能量 (9770) 轉換為 `energyProvide` handler
- `resolveEnergyProvides` 支援 `stage2_pokemon` 條件判定
- **能量丟棄改為計算單位數**：`chooseAttachedEnergyCards` 改為依能量單位總和判定，單張特殊能量提供 3 單位即可滿足「丟棄 2 能量」需求

### 進化系統
- **進化鏈 fallback 修正**：`getHandPokemonPlacementRule` 改用 `resolveEvolutionChainForEntry` 作為 fallback，確保進化鏈資料始終可用
- 支援跨系列進化（如 呱頭蛙 → 超級甲賀忍蛙ex、多龍奇 → 多龍巴魯托ex）
- 進化鏈中只要場上寶可夢在鏈中位於進化目標之前即允許進化

### 效果引擎
- `useCardAbility` 新增 `gamePhase` 檢查，防止遊戲開始前/結束後使用特性
- `notifyCardMovedForEffects` 擊倒判定修正：僅在 HP 歸零或傷害 >= HP 時才記錄為擊倒
- `canAttackWithEffects` 支援完全攻擊鎖定（空 attackName = 鎖定所有攻擊）
- 移除 `executeTrainerCardEffects` 中的 debug console.log

### 新增 Custom Handlers（11 個）
- `confuse_opponent_active`, `damage_and_confuse/poison/burn/paralyze/sleep`
- `discard_all_self_energy`
- `damage_all_opponent_bench`, `damage_one_opponent_bench`
- `ignore_resistance`
- `cannot_attack_next_turn` / `self_cannot_attack_next_turn` / `cannot_attack_next_own_turn`
- `prevent_retreat` 及變體
- `damage_per_self_damage_counter`

### 批量卡片轉換
- 118 張卡片自訂效果啟用（匹配已註冊 handler）
- 40 張卡片追加啟用（匹配新註冊 handler）
- 8 張備戰傷害卡的傷害值從 notes 提取
- `matchFilter` 新增 `exclude_rule_box` 過濾（排除 ex/V/VSTAR/VMAX/GX 等）

### UI 修正
- 老大的指令選擇對手寶可夢時，選擇區域改為靠左顯示（對手場地側）
- 選擇對手寶可夢時，放大預覽圖維持在右側原位

### 建置
- `build-onefile.ps1` 加入 try/catch：舊 exe 被鎖定時改用時間戳檔名輸出
- 重新打包 exe

---

## 2026-04-02 Round 5: Condition System & Reactive Effects

### 條件系統大幅擴充
`condition()` 函數從 10 個條件擴充至 35+ 個，新增支援：
- 獎勵卡比較：`self_prize_more_than_opponent`, `only_if_behind_on_prizes`, `self_prizes_remaining_equals_N`, `opponent_prizes_remaining_max_N`
- 對手狀態：`opponent_active_has_damage_counters`, `opponent_active_is_evolved`, `opponent_active_is_basic`, `opponent_active_is_poisoned`, `opponent_active_is_burned`, `opponent_active_has_special_condition`, `opponent_active_is_ex`, `opponent_active_has_pokemon_tool`
- 自身狀態：`self_has_damage_counters`, `self_has_no_damage_counters/self_full_hp`, `self_has_no_attached_energy`, `self_is_poisoned`, `self_is_active`, `self_has_pokemon_tool`, `self_hp_remaining_max_N`
- 場地：`stadium_in_play`, `self_bench_count_gte_N`
- KO 追蹤：`self_pokemon_knocked_out_last_opponent_turn` 等多個別名

### 反應式效果引擎擴充
`handleAfterAttackDamage` 新增 5 種反應式效果模式：
- 依附加金屬能量數對攻擊方放置傷害指示物（每張 20）
- 被攻擊時抽 2 張卡
- `if_damaged_by_attack_next_opponent_turn_place_N_damage_counters_on_attacker`（正則匹配 N 值）
- 附加道具版的反擊傷害（2 或 12 傷害指示物）
- `when_in_active_takes_damage_from_opponent_attack_burn_attacker` 別名支援

### 其他修正
- `draw` handler 預設抽卡數從 0 改為 1，避免空抽
- 所有語法檢查通過，exe 重新打包

---

## 2026-04-01 Round 4: Weakness/Resistance & Effect Completeness

### 新功能
- **弱點/抗性傷害計算**：新增 `applyWeaknessResistance()` 函數，在 `executeAttack` 中效果傷害修正後、防禦方減免前計算。讀取防禦方卡片的 `weakness`（如 `"Fire ×2"`）與 `resistance`（如 `"Fighting -30"`）欄位，自動匹配攻擊方屬性。支援 `ignoreWeakness` flag 跳過弱點計算。計算結果會記錄到遊戲日誌。

### 效果引擎修正
- **resolveAndExecuteAttackEffects**：迴圈中加入 `if (context.runtime.attackFailed) break;`，攻擊失敗後立即停止執行後續效果 spec。
- **hasAttachedEnergy** (effect-engine.js)：保護系統的 `hasAttachedEnergy` 條件過濾從所有附加卡改為僅過濾能量卡（`isEnergy()`）。

### Handler 修正
- **if_opponent_active_is_ex_or_v_bonus_80**：V/ex 判定從簡易 `.includes(" v")` 改為正規表達式匹配 `名字結尾 ex`、`名字結尾 V/VSTAR/VMAX`、`ruleText 包含 pokémon v`。
- **attach_up_to_2_basic_fighting_energy_from_discard_to_own_benched_any_way**：從自動輪流分配改為玩家選擇（先選能量張數，再逐張選目標寶可夢）。加入 `isEnergy()` 篩選確保只選能量卡。

### Verification
- `node --check` 四個 JS 檔案 — 全部 OK
- `npm run dist:onefile` — OK

### Known Remaining Issues (Round 4)
- `freeRetreat`、`energyProvide` 仍為骨架（app.js 無撤退執行流程）
- 無能量附加事件 hook（部分特性需在附加能量時觸發，目前只有 moveCardToZone 通知）
- 部分 custom handler 仍為 fallback 提示

---

## 2026-04-01 Round 3: Deep Review & Critical Bug Fixes

### Critical Fixes
- **effect-handlers.js**: `applyStatusThroughEffects` 函數不存在，導致所有狀態效果（中毒/灼傷/麻痺/睡眠/混亂）觸發時 `ReferenceError` crash。已將所有呼叫改為正確的 `applyStatus`。
- **effect-handlers.js**: `reduceDamage` handler 被定義兩次（line 553 stub + line 642 完整版），stub 永遠被覆蓋。移除多餘的 stub。
- **app.js `executeAttack`**: `resolveAndExecuteAttackEffects` 回傳的 `cancel_attack` 從未被檢查，導致攻擊效果設定 `attackFailed=true` 時攻擊仍然繼續執行。已加入 `cancel_attack` 判定 + 傷害歸零 + toast 提示。
- **effect-custom-handlers.js**: `if_own_total_energy_3_or_more_bonus_70_ignore_weakness` 計算所有附加卡而非僅能量卡，導致有道具的寶可夢虛增能量數。已加入 `isEnergy()` 篩選。

### Handler Additions
- 新增 `fail` handler：設定 `context.runtime.attackFailed = true`，用於「攻擊失敗」效果。
- 新增 `shuffleSelfToDeck` handler：將攻擊者及其所有附加卡洗入牌庫。

### Moderate Fixes
- **effect-handlers.js `attachEnergyFromDeck`**: `to: "self_bench"` 原本自動選第一隻備戰寶可夢，現在備戰區超過 1 隻時會彈出選擇視窗。
- **effect-handlers.js `damageBench`**: 選擇目標提示從 `context.opponentOwner`（防禦方選）改為 `context.owner`（攻擊方選），符合 PTCG 規則。
- **app.js `executeAbilityEffects`**: 未檢查 `result.cancelled` 和 `result.success`。已加入取消處理和 `didRun` 判定，與 `executeTrainerCardEffects` 一致。

### Data Fixes
- card_id=11266: 第二個 spec `status: "custom"` → `"ready"`（damageBench 是標準 handler 不應走 custom 路徑）。
- card_id=12705/12706: `params.recoil` → `params.self_damage`（damageRecoil handler 讀取 `self_damage`）。
- 以上修正同步套用至 batch JSON 和 `cards.json`。

### Verification
- `node --check` 四個 JS 檔案 — 全部 OK
- `npm run dist:onefile` — OK
- 新 exe: `dist\PTCG Simulator.exe`

### Known Remaining Issues (Round 3)
- `freeRetreat`、`energyProvide` 仍為骨架
- 弱點/抗性傷害計算尚未在 `executeAttack` 中實作
- `ignoreWeakness` flag 已就緒但無弱點計算可跳過
- 無能量附加事件 hook（部分特性需在附加能量時觸發）
- 部分 custom handler 仍為 fallback 提示

---

## 2026-04-01 Effect System Code Review & Bug Fixes

### Scope
- Workspace: `F:\Claude Code\PTCG`
- Files: `effect-engine.js`, `effect-handlers.js`, `effect-custom-handlers.js`, `deck-builder-data/cards.json`, 77 batch effect spec JSON files
- Branch: `feature/effect-system`
- Build artifact: `dist\PTCG Simulator.exe`

### Critical Fixes

- **effect-engine.js**: `log()` 未定義導致 strict mode 下 `ReferenceError` crash，已改為 `console.warn("[EffectEngine]")`。
- **effect-handlers.js**: `coinFlipEffect` 中的正面判定字串 `"甇?"` 為 UTF-8 亂碼，導致永遠無法偵測正面結果，已修正為 `"正面"`。
- **effect-handlers.js**: 移除 83 行重複 handler 定義（coinFlipEffect、applyStatus、applyStatusMulti、damageBench、discardEnergy、switchOpponent 各有 2~3 個版本互相覆蓋），保留最新且最完整的版本。

### Handler Logic Fixes

- `switchSelf`：原本自動選第一隻備戰寶可夢，現在會彈出選擇視窗讓玩家選。
- `switchOpponent`：加入玩家選擇 + 支援 `choose_by` 參數（self/opponent）。
- `damageMultiply`：未處理 `include_self` 參數，現在當 `include_self: false` 時會排除攻擊者自身。
- `attachEnergyFromDeck/Discard/Hand`：`to: "self_choose"` 原本自動選第一隻，現在會彈出選擇視窗。
- `moveEnergy`：加入來源/目標雙重選擇視窗。
- `discardHand`：`choose: false` 原本仍然彈出選擇視窗，現在改為隨機丟棄。
- 新增條件判定：`is_evolved`（進化寶可夢）、`self_bench_has_NAME`（備戰區有指定寶可夢）。

### Custom Handler Fixes

- `heal_1_own_ancient_benched_pokemon`：加入古代寶可夢篩選（原本會治療任意備戰寶可夢）+ 玩家選擇。
- `bonus_if_any_own_benched_has_damage_counters`：原本永遠給加傷，現在會實際檢查備戰區是否有受傷寶可夢。
- `coin_flip_heads_prevent_damage_and_effects_next_opponent_turn`：原本沒有擲硬幣就直接給保護，現在會先擲硬幣，正面才生效。
- `return_self_and_all_attached_cards_to_deck_and_shuffle`：加入 `renderBoard` 確保 UI 更新。
- `return_1_own_pokemon_to_hand_discard_all_other_attached_cards`：加入玩家選擇（原本自動選第一隻）。

### Engine Fixes

- **effect-engine.js**: protection 過期篩選邏輯反轉（`!item` 保留 null 而非移除），已修正。
- **effect-engine.js**: `canAttackWithEffects` 中 `syncId` 使用 `===` 比較，與其他地方使用 `num()` 不一致，可能導致攻擊鎖無效，已修正。
- **effect-engine.js**: `resolveAndExecuteAttackEffects` 迴圈中加入 try/catch，防止單一 handler 拋錯中斷整個攻擊流程。

### Data Fixes

- 修正 17 個 effect_spec 的 `status` 欄位（handler 名稱誤填在 status 中，如 `status: "sequence"`），改為 `"ready"` 並將原值移到 handler 欄位。
- 修正 285 個 `status: "skip"` 的 spec，將 `handler: "skip"` 改為 `handler: null`（符合 EFFECT_SPEC.md 規範）。
- 以上修正同步套用至 77 個 batch JSON 和 `cards.json`。

### Verification
- `node --check effect-engine.js` — OK
- `node --check effect-handlers.js` — OK
- `node --check effect-custom-handlers.js` — OK
- `node --check app.js` — OK
- `npm run dist:onefile` — OK

### Round 2 Fixes (同日)

- `discardEnergy`：修正 `energy_type: "all"` 與 `count: 0`（棄掉全部能量）的處理路徑。
- `ignoreWeakness`：在 `context.runtime` 加入 `ignoreWeakness` flag，`resolveAndExecuteAttackEffects` 回傳值包含此 flag，`if_own_total_energy_3_or_more_bonus_70_ignore_weakness` custom handler 已正確設置。
- `executeTrainerCardEffects`：`didRun` 判定改為依 status 與 `result.success` 雙重判斷，新增取消操作處理（`result.cancelled`）。
- `knockoutsLastOpponentTurn`：在 `notifyCardMovedForEffects` 中加入 KO 追蹤邏輯（戰鬥區 → 棄牌區 = 被擊倒）。

### Known Remaining Issues
- `freeRetreat`、`energyProvide` 仍為骨架，app.js 中尚無撤退執行流程可供整合。
- `knockoutsLastOpponentTurn` 可寫入但尚無 handler 讀取（`last_turn_knocked_out` 條件未接通）。
- `ignore_weakness` flag 已加入但 app.js 的 `executeAttack` 尚未依此 flag 跳過弱點計算。
- 部分 custom handler 仍為 fallback 提示，未完整實作。

## 2026-03-31 Trainer Multi-Step Selection Locking

### Scope
- Workspace: `F:\Claude Code\PTCG`
- Files: `app.js`, `effect-handlers.js`, `effect-custom-handlers.js`, `styles.css`
- Build artifact: `dist\PTCG Simulator.exe`

### Changes
- `神奇糖果`、`高級球` 這類多階段選擇流程，現在在前一步確認後會直接進入下一個選擇視窗，不需要先手動把訓練家卡丟棄。
- 訓練家卡與可主動特性在廣播後不再等待 banner 播放完畢，會直接進入效果執行與選擇流程。
- 選擇視窗現在預設可取消；右上角關閉鈕在選擇模式下會顯示為「取消」，可中止整個操作並回滾。
- `sequence` 類效果現在會辨識「玩家取消」，並中止後續步驟，避免前一步取消後仍繼續執行下一步或把卡錯誤送去棄牌。
- 選擇模式下會鎖住視窗外互動，並禁止拖曳手牌與場上卡片。

### Implementation Notes
- 補上 overlay 選擇取消狀態追蹤，供 standard handler 與 custom handler 讀取。
- 移除 overlay 關閉動畫在連續開關時造成的 hidden race。
- 將選擇中的 overlay 擴展為全場遮罩，只保留右側選擇面板可操作。

### Verification
- `node --check app.js`
- `node --check effect-handlers.js`
- `node --check effect-custom-handlers.js`
- `node --check effect-engine.js`
- `cmd /c npm run dist:onefile`

## 2026-03-31 Rare Candy Evolution Logic

### Scope
- Workspace: `F:\Claude Code\PTCG`
- Files: `app.js`, `effect-custom-handlers.js`, `deck-builder-data\cards.json`

### Changes
- Unified all `神奇糖果` card entries to the same executable custom effect.
- `神奇糖果` now checks the player's hand for legal `2階進化` Pokemon and the field for matching `基礎` Pokemon in the same evolution chain.
- Using `神奇糖果` now opens two explicit selection flows:
  - choose the stage-2 Pokemon from hand
  - choose the matching basic Pokemon on the field
- After confirmation, the stage-2 Pokemon directly covers the matching basic Pokemon and skips stage 1.
- If there is no legal target or the player cancels, the trainer card returns to hand instead of staying in reveal.

### Verification
- `node --check app.js`
- `node --check effect-custom-handlers.js`
- `cmd /c npm run dist:onefile`

## 2026-03-31 Effect Selection And Evolution Highlight

### Scope
- Workspace: `F:\Claude Code\PTCG`
- Files: `app.js`, `effect-handlers.js`, `index.html`, `styles.css`
- Build artifact: `dist\PTCG Simulator.exe`

### Changes
- Replaced temporary auto-pick behavior in standard effect handlers with a real card-selection flow.
- `searchDeck`, `discardHand`, `recycleFromDiscard`, `attachEnergyFromDeck`, `attachEnergyFromDiscard`, `attachEnergyFromHand` now open a card list overlay and wait for the player to choose.
- Deck-search effects now automatically open the deck list selection window instead of silently taking the first legal card.
- While dragging an evolution Pokemon from hand, legal evolution targets are highlighted and illegal targets are dimmed/locked.

### Implementation Notes
- Added a reusable overlay-based `promptEffectCardChoice()` flow.
- Added overlay confirm/cancel controls and selection state management.
- Disabled drag in effect-selection overlay and forced face-up rendering for selectable cards.
- Connected effect handlers to the new selection flow instead of using temporary `slice(0, n)` behavior.
- Added drag-time visual guidance for hand evolution placement using `getHandPokemonPlacementRule()`.
- `神奇糖果` 的跳階進化判定改為先讀完整 `evolution_chain`，若資料不完整則沿著 `evolves_from_name` 遞迴回推到基礎寶可夢。

### Verification
- `node --check app.js`
- `node --check effect-handlers.js`
- `node --check effect-custom-handlers.js`
- `node --check effect-engine.js`
- `cmd /c npm run dist:onefile`

## 2026-03-31 Evolution Placement Rule

### Scope
- Workspace: `F:\Claude Code\PTCG`
- File: `app.js`
- Build artifact: `dist\PTCG Simulator.exe`

### Rule
- Evolution-stage Pokemon in hand cannot be placed directly onto an empty Active or Bench slot.
- A hand evolution card may only be placed onto a battle slot when the current top Pokemon name exactly matches that card's `evolves_from_name`.
- Basic Pokemon in hand cannot be placed on top of an existing Pokemon in the target battle slot.
- Swapping positions between Pokemon already on the field remains unchanged.

### Implementation Notes
- Added runtime support for `evolvesFromName` and `evolutionChain`.
- Added `getHandPokemonPlacementRule()` as the single placement gate for hand-to-battle-slot drops.
- Blocked invalid drops through `isDropAllowedForCard()`.
- Added user-facing rejection reasons in `handleDrop()`.
- Added `normalizeDropTargetZoneForCards()` so a hand Pokemon dropped onto a slot's `-attach` layer is normalized back to the corresponding main zone before legality checks.

### Verification
- `node --check app.js`
- `cmd /c npm run dist:onefile`

## 2026-03-31 Effect Fixes

### Scope
- Workspace: `F:\Claude Code\PTCG`
- Files: `effect-handlers.js`, `effect-custom-handlers.js`, `deck-builder-data/cards.json`
- Build artifact: `dist\PTCG Simulator.exe`

### Rule / Behavior Updates
- `鬥子` 現在會依序從牌庫選擇 1 張進化寶可夢卡與 1 張能量卡加入手牌，不再只選到能量。
- `甲賀忍蛙ex` 的「忍之利刃」現在會先造成 170 點傷害，再從牌庫選擇任意 1 張卡加入手牌。
- `甲賀忍蛙ex` 的「分身連打」現在會先選擇並丟棄自己身上的 2 個能量，再由攻擊方選擇對手場上的 2 隻寶可夢，各造成 120 點傷害。
- `莉莉艾的皮皮ex` 的招式傷害現在正確為 `20 + 20 x 雙方備戰區寶可夢總數`。
- `吉雉雞ex` 與同類型「對手的 1 隻寶可夢受到傷害」的招式，現在可選擇對手戰鬥區或備戰區任一寶可夢作為目標。

### Implementation Notes
- `matchFind()` 新增 `find: "evolution"`，可正確搜尋非基礎寶可夢。
- `targets()` 新增 `opponent_choose / opponent_any / opponent_all`，讓效果可指向對手場上的任意寶可夢。
- 新增共用 custom handler：
  - `deal_170_then_optional_search_any_1_to_hand`
  - `bonus_damage_per_both_players_bench_pokemon`
  - `snipe_one_opponent_pokemon`
  - `discard_2_energy_from_self_then_damage_two_opponent_pokemon`
- `cards.json` 已統一修正 `鬥子`、`甲賀忍蛙ex`、`莉莉艾的皮皮ex`、`吉雉雞ex` 相關版本的 effect spec。

### Verification
- `node --check app.js`
- `node --check effect-handlers.js`
- `node --check effect-custom-handlers.js`
- `node --check effect-engine.js`
- `cmd /c npm run dist:onefile`
