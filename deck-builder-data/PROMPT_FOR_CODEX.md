# Codex/AI 批量填入卡片效果 — 提示詞

將以下內容完整貼給 Codex 或其他 AI 執行。

---

## 提示詞正文

```
你是一個 PTCG（寶可夢集換式卡牌遊戲）效果規格填入助手。

## 你的任務

讀取 `cards.json` 中每張卡片的效果描述文字，根據 `EFFECT_SPEC.md` 的規格，
將 `effect_specs` 陣列中每個 status 為 "pending" 的項目填入：
1. `handler` — 從標準 handler 清單中選擇，或標記為 custom
2. `params` — 依照對應 handler 的參數格式填入
3. `status` — 改為 "ready"、"custom"、"manual" 或 "skip"
4. `notes` — 用中文簡短說明效果邏輯（方便人工檢查）

## 輸入格式

每張卡片的相關欄位：
- `card_id`: 卡片唯一識別碼
- `name`: 卡片名稱（中文）
- `card_type`: "寶可夢" | "訓練家" | "基本能量" | "特殊能量"
- `trainer_subtype_code`: "item" | "supporter" | "stadium" | null
- `attacks[]`: 招式陣列，每個有 index, name, cost, damage, effect_text
- `abilities[]`: 特性陣列，每個有 index, name, effect_text
- `effect_text`: 卡片本身的效果文字（訓練家/特殊能量用）
- `effect_specs[]`: 待填入的效果規格陣列

## 輸出格式

只輸出修改過的 effect_specs，格式為 JSON 陣列，每個元素包含：
```json
{
  "card_id": 18421,
  "effect_specs": [
    {
      "source_type": "attack",
      "source_index": 1,
      "status": "ready",
      "handler": "coinFlipOrFail",
      "params": { "flips": 1 },
      "notes": "擲1次硬幣，反面失敗"
    }
  ]
}
```

## 標準 handler 清單

### 傷害類
| handler | 用途 | params |
|---------|------|--------|
| damageMultiply | 倍率傷害 | base_per, count_what, count_filter, include_self |
| damagePlus | 條件加傷 | base, bonus, condition |
| damageRecoil | 自傷 | self_damage |
| damageBench | 傷害備戰區 | target(opponent_bench_all/choose/self_bench_all), amount, choose_count |

### 硬幣類
| handler | 用途 | params |
|---------|------|--------|
| coinFlipOrFail | 反面招式失敗 | flips |
| coinFlipBonus | 正面加傷 | flips, per_heads |
| coinFlipUntilTails | 連擲到反面 | per_heads |
| coinFlipEffect | 正反各有效果 | flips, on_heads, on_tails |

### 卡片移動類
| handler | 用途 | params |
|---------|------|--------|
| draw | 抽卡 | player(self/opponent), count |
| discardEnergy | 丟棄能量 | from, energy_type, count |
| discardHand | 丟棄手牌 | player, count(0=全部), choose |
| searchDeck | 搜尋牌庫 | player, find, find_filter, count, to, shuffle_after |
| recycleFromDiscard | 從棄牌堆回收 | find, count, to |
| shuffleHandToDeck | 手牌洗回牌庫 | player, to, then_draw |

### 狀態類
| handler | 用途 | params |
|---------|------|--------|
| applyStatus | 施加狀態 | target, status(poison/burn/sleep/paralysis/confusion) |
| applyStatusMulti | 多重狀態 | target, statuses[] |

### 回復類
| handler | 用途 | params |
|---------|------|--------|
| heal | 回復HP | target(self_active/self_bench/self_choose/self_all), amount |
| healAll | 完全回復 | target |

### 替換類
| handler | 用途 | params |
|---------|------|--------|
| switchOpponent | 強制對手換場 | choose_by(self/opponent) |
| switchSelf | 自己換場 | (無) |

### 能量類
| handler | 用途 | params |
|---------|------|--------|
| attachEnergyFromDeck | 從牌庫附加能量 | energy_type, count, to |
| attachEnergyFromDiscard | 從棄牌堆附加能量 | energy_type, count, to |
| moveEnergy | 移動能量 | from, to, count |

### 被動能力類（特性用）
| handler | 用途 | params |
|---------|------|--------|
| reduceDamage | 減傷 | amount |
| preventStatus | 防止狀態 | statuses[] |
| freeRetreat | 免費撤退 | (無) |

### 特殊能量類
| handler | 用途 | params |
|---------|------|--------|
| energyProvide | 特殊能量 | provides, on_discard, on_discard_condition, bonus_effect |

### 組合類
| handler | 用途 | params |
|---------|------|--------|
| sequence | 依序執行多步驟 | steps[] |
| conditional | 條件分支 | if, then, else |

## 判斷規則（請嚴格遵守）

### status 判斷
1. `"skip"` — 以下情況直接跳過：
   - 基本能量卡（card_type === "基本能量"）
   - effect_text 為 null 且 attacks[].effect_text 也為 null
   - 純傷害招式（有 damage 數值但無 effect_text）
   - 規則文字（如「寶可夢【ex】被擊倒時，對手多拿1張獎賞卡」這類規則提示）

2. `"ready"` — 能用標準 handler 或 sequence/conditional 組合表達的效果

3. `"custom"` — 以下情況標記為 custom：
   - 複製對手的招式
   - 效果持續到下個回合（如「下個回合這隻寶可夢不受傷害」）
   - 根據對手手牌內容決定效果
   - 涉及進化機制（如「從手牌進化」作為招式效果）
   - 多層條件巢狀超過 2 層
   - GX 招式、VSTAR 力量、ACE SPEC 等限制使用次數的效果
   - 改變弱點/抵抗力
   - 禁止對手使用特定卡片
   - 任何你不確定的效果

4. `"manual"` — 效果描述模糊或涉及場外因素（幾乎不會用到）

### handler 選擇
- 優先使用最簡單的 handler（如只是擲硬幣決定失敗，用 coinFlipOrFail，不要用 coinFlipEffect）
- 多步驟效果用 sequence
- 有條件才能使用的卡片用 conditional
- 不確定時標記 custom，不要硬套標準 handler

### params 填入
- 所有文字值用英文（handler 名稱、target、player 等）
- notes 用中文，簡短描述（一句話）
- 不要添加規格中沒有定義的 params 欄位

### custom handler 命名
- 格式：`custom_{card_id}_{source_type}{source_index}`
- 例如：card_id 18423 的第一個攻擊 → `custom_18423_attack1`

## 條件名稱速查
| 條件名稱 | 說明 |
|---------|------|
| opponent_prize_lte_N | 對手獎賞卡剩 N 張以下 |
| self_prize_lte_N | 自己獎賞卡剩 N 張以下 |
| opponent_has_damage | 對手戰鬥寶可夢有傷害 |
| self_active_is_TYPE | 自己戰鬥寶可夢是某屬性 |
| self_bench_has_NAME | 備戰區有某寶可夢 |
| energy_attached_gte_N | 附加 N 個以上能量 |
| opponent_bench_count_gte_N | 對手備戰區有 N 隻以上 |
| last_turn_knocked_out | 上回合有寶可夢被擊倒 |
| is_evolved | 是進化寶可夢 |
| first_turn | 先攻第一回合 |

## 範例（輸入 → 輸出）

### 輸入1：擲硬幣決定失敗
```json
{ "card_id": 18421, "name": "獨角蟲",
  "attacks": [{ "index": 1, "name": "偷襲", "damage": "30",
    "effect_text": "擲1次硬幣若為反面，則這個招式失敗。" }],
  "effect_specs": [{ "source_type": "attack", "source_index": 1, "status": "pending" }] }
```
### 輸出1：
```json
{ "card_id": 18421, "effect_specs": [{
    "source_type": "attack", "source_index": 1,
    "status": "ready",
    "handler": "coinFlipOrFail",
    "params": { "flips": 1 },
    "notes": "擲1次硬幣，反面失敗"
}]}
```

### 輸入2：被動減傷特性 + 無效果攻擊
```json
{ "card_id": 18422, "name": "鐵殼蛹",
  "abilities": [{ "index": 1, "name": "堅硬身軀",
    "effect_text": "這隻寶可夢受到招式的傷害「-20」點。" }],
  "attacks": [{ "index": 1, "name": "垂吊", "damage": "20", "effect_text": null }],
  "effect_specs": [
    { "source_type": "ability", "source_index": 1, "status": "pending" },
    { "source_type": "attack", "source_index": 1, "status": "pending" }
  ]}
```
### 輸出2：
```json
{ "card_id": 18422, "effect_specs": [
    { "source_type": "ability", "source_index": 1,
      "status": "ready", "handler": "reduceDamage",
      "params": { "amount": 20 },
      "notes": "堅硬身軀：受到招式傷害 -20" },
    { "source_type": "attack", "source_index": 1,
      "status": "skip", "handler": null, "params": null,
      "notes": "純傷害 20，無額外效果" }
]}
```

### 輸入3：訓練家卡（有條件的組合效果）
```json
{ "card_id": 18492, "name": "特殊紅牌", "card_type": "訓練家", "trainer_subtype_code": "item",
  "effect_text": "這張卡只有在對手剩餘獎賞卡的張數為3張以下時才可使用。\n對手將對手自己的手牌全部翻回反面並重洗，放回牌庫下方。然後，對手從牌庫抽出3張卡。",
  "effect_specs": [{ "source_type": "card", "source_index": 1, "status": "pending" }] }
```
### 輸出3：
```json
{ "card_id": 18492, "effect_specs": [{
    "source_type": "card", "source_index": 1,
    "status": "ready",
    "handler": "conditional",
    "params": {
      "if": "opponent_prize_lte_3",
      "then": {
        "handler": "sequence",
        "params": {
          "steps": [
            { "handler": "shuffleHandToDeck", "params": { "player": "opponent", "to": "deck_bottom", "then_draw": 0 }},
            { "handler": "draw", "params": { "player": "opponent", "count": 3 }}
          ]
        }
      },
      "else": null
    },
    "notes": "對手獎賞卡≤3時可用：對手手牌放回牌庫底，抽3張"
}]}
```

### 輸入4：複雜效果（標記為 custom）
```json
{ "card_id": 18423, "name": "大針蜂ex",
  "attacks": [{ "index": 1, "name": "針蜂轟鳴", "damage": "110×",
    "effect_text": "造成自己的場上的「大針蜂（包含『寶可夢【ex】』）」的數量×110點傷害。" }],
  "effect_specs": [{ "source_type": "attack", "source_index": 1, "status": "pending" }] }
```
### 輸出4：
```json
{ "card_id": 18423, "effect_specs": [{
    "source_type": "attack", "source_index": 1,
    "status": "ready",
    "handler": "damageMultiply",
    "params": {
      "base_per": 110,
      "count_what": "field_pokemon",
      "count_filter": { "name_contains": "大針蜂", "side": "self" },
      "include_self": true
    },
    "notes": "場上大針蜂（含ex）數量 ×110 傷害"
}]}
```

### 輸入5：特殊能量
```json
{ "card_id": 18501, "name": "燃料【火】能量", "card_type": "特殊能量",
  "effect_text": "只要這張卡附於寶可夢身上，視為提供1個【火】能量。\n若因附有這張卡的【火】寶可夢使用的招式的效果使這張卡被丟棄，則在招式的傷害與效果的影響之後，這張卡放回手牌。",
  "effect_specs": [{ "source_type": "card", "source_index": 1, "status": "pending" }] }
```
### 輸出5：
```json
{ "card_id": 18501, "effect_specs": [{
    "source_type": "card", "source_index": 1,
    "status": "ready",
    "handler": "energyProvide",
    "params": {
      "provides": "Fire",
      "on_discard": "return_to_hand",
      "on_discard_condition": { "pokemon_attribute": "Fire", "cause": "attack_effect" },
      "bonus_effect": null
    },
    "notes": "提供1個火能量；火寶可夢因招式丟棄時回手牌"
}]}
```

## 注意事項

1. 一次處理一批卡片（建議每批 50-100 張），不要跳過任何 pending 的效果
2. 對於 rule_text 中的規則提示（如 ex 規則），標記 skip
3. 如果一張卡有多個 effect_specs（多個招式/特性），全部都要處理
4. 請確保 JSON 格式正確，可以被程式直接解析
5. 優先正確性，不確定就標 custom，不要猜
6. 每個輸出都必須包含 card_id，方便合併回 cards.json
```

---

## 使用方式

1. 將上方「提示詞正文」的全部內容（``` 區塊內）複製貼給 Codex/AI
2. 接著貼入一批卡片的 JSON 資料（從 cards.json 中擷取）
3. AI 會回傳處理好的 effect_specs
4. 將結果合併回 cards.json 中對應的卡片
5. 重複直到所有卡片處理完畢

### 擷取卡片資料的腳本

```javascript
// 在 Node.js 中執行，擷取前 50 張有 pending effect_specs 的卡片
const fs = require("fs");
const cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
const pending = cards.filter(c =>
  c.effect_specs && c.effect_specs.some(e => e.status === "pending")
);
const batch = pending.slice(0, 50).map(c => ({
  card_id: c.card_id,
  name: c.name,
  card_type: c.card_type,
  trainer_subtype_code: c.trainer_subtype_code,
  attacks: c.attacks,
  abilities: c.abilities,
  effect_text: c.effect_text,
  effect_specs: c.effect_specs
}));
console.log(JSON.stringify(batch, null, 2));
```

### 合併結果的腳本

```javascript
// 將 AI 輸出的結果合併回 cards.json
const fs = require("fs");
const cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
const results = JSON.parse(fs.readFileSync("ai_output.json", "utf8"));
// results 格式: [{ card_id: 18421, effect_specs: [...] }, ...]

results.forEach(result => {
  const card = cards.find(c => c.card_id === result.card_id);
  if (!card) { console.warn("找不到 card_id:", result.card_id); return; }
  card.effect_specs = result.effect_specs;
});

fs.writeFileSync("cards.json", JSON.stringify(cards, null, 2), "utf8");
console.log(`已更新 ${results.length} 張卡片`);
```
