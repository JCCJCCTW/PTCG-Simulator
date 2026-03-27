# PTCG 卡片效果規格（Effect Specification）v2

## 設計原則

1. **人可讀** — 效果用簡短的動作指令描述，不用深層巢狀 JSON
2. **易維護** — 效果出錯時能快速定位卡片、看懂邏輯、直接修改
3. **特例友好** — 複雜效果直接寫 `"custom"` 標記，由專屬 handler 處理
4. **AI 可批量處理** — 格式規律，可從中文效果文字機械式轉換

---

## 資料結構

### cards.json 中每張卡的 effect_specs

```jsonc
{
  "card_id": 18421,
  "name": "獨角蟲",
  "attacks": [
    { "index": 1, "name": "偷襲", "cost": ["Grass"], "damage": "30",
      "effect_text": "擲1次硬幣若為反面，則這個招式失敗。" }
  ],
  "abilities": [],
  "effect_specs": [
    {
      "source_type": "attack",       // "attack" | "ability" | "card"
      "source_index": 1,             // 對應 attacks[]/abilities[] 的 index
      "status": "ready",             // 處理狀態
      "handler": "coinFlipOrFail",   // 執行函式名稱（見 handler 清單）
      "params": {                    // handler 的參數（人可讀的扁平結構）
        "flips": 1,
        "on_tails": "fail"
      },
      "notes": ""                    // 人工備註（除錯用）
    }
  ]
}
```

### status 定義

| 值 | 說明 | 誰設定 |
|----|------|--------|
| `pending` | 未處理 | 初始值 |
| `ready` | 可執行，handler + params 已填好 | AI 或人工 |
| `custom` | 效果特殊，由專屬 handler 處理，params 僅供參考 | AI 標記 |
| `manual` | 無法自動化，遊戲中僅顯示提示文字讓玩家自行操作 | AI 或人工 |
| `skip` | 無效果（基本能量、規則文字） | AI |
| `error` | 效果執行有問題，待修復 | 人工標記 |

---

## Handler 清單（標準動作）

以下是所有標準 handler，每個都接受扁平的 `params` 物件。
AI 只需從此清單中選擇適合的 handler 並填入對應的 params。

### 傷害類

#### `damage`
純傷害（已含在 `attacks[].damage` 欄位中的基礎傷害，無額外效果時不需要 effect_spec）。

#### `damageMultiply` — 倍率傷害
```jsonc
{ "handler": "damageMultiply",
  "params": {
    "base_per": 110,           // 每單位造成的傷害
    "count_what": "field_pokemon", // 計算什麼的數量
    "count_filter": { "name_contains": "大針蜂", "side": "self" },
    "include_self": true       // 是否包含自己
  }}
```

#### `damagePlus` — 條件加傷
```jsonc
{ "handler": "damagePlus",
  "params": {
    "base": 60,
    "bonus": 60,               // 符合條件時額外傷害
    "condition": "opponent_has_damage"  // 條件名稱
  }}
```

#### `damageRecoil` — 自傷
```jsonc
{ "handler": "damageRecoil",
  "params": { "self_damage": 30 }}
```

#### `damageBench` — 傷害備戰區
```jsonc
{ "handler": "damageBench",
  "params": {
    "target": "opponent_bench_all",  // opponent_bench_all | opponent_bench_choose | self_bench_all
    "amount": 20,
    "choose_count": 1               // 當 target 含 choose 時
  }}
```

### 硬幣類

#### `coinFlipOrFail` — 反面失敗
```jsonc
{ "handler": "coinFlipOrFail",
  "params": { "flips": 1 }}
```

#### `coinFlipBonus` — 正面加傷
```jsonc
{ "handler": "coinFlipBonus",
  "params": {
    "flips": 3,
    "per_heads": 50            // 每個正面增加的傷害
  }}
```

#### `coinFlipUntilTails` — 連續擲到反面
```jsonc
{ "handler": "coinFlipUntilTails",
  "params": { "per_heads": 30 }}
```

#### `coinFlipEffect` — 正面/反面各有效果
```jsonc
{ "handler": "coinFlipEffect",
  "params": {
    "flips": 1,
    "on_heads": "apply_status:paralysis",  // 見動作語法
    "on_tails": "none"
  }}
```

### 卡片移動類

#### `draw` — 抽卡
```jsonc
{ "handler": "draw", "params": { "player": "self", "count": 2 }}
```

#### `discardEnergy` — 丟棄能量
```jsonc
{ "handler": "discardEnergy",
  "params": {
    "from": "self_active",     // self_active | self_any | opponent_active
    "energy_type": "any",      // Fire | Water | any | all
    "count": 1
  }}
```

#### `discardHand` — 丟棄手牌
```jsonc
{ "handler": "discardHand",
  "params": {
    "player": "self",          // self | opponent
    "count": 1,                // 0 = 全部
    "choose": true             // true = 玩家選擇, false = 隨機/全部
  }}
```

#### `searchDeck` — 搜尋牌庫
```jsonc
{ "handler": "searchDeck",
  "params": {
    "player": "self",
    "find": "pokemon",         // pokemon | trainer | energy | item | supporter | any
    "find_filter": {},         // 額外條件 { "evolution_stage": "基礎", "name": "皮卡丘" }
    "count": 1,
    "to": "hand",              // hand | bench | deck_top | active
    "shuffle_after": true
  }}
```

#### `recycleFromDiscard` — 從棄牌堆回收
```jsonc
{ "handler": "recycleFromDiscard",
  "params": {
    "find": "any",
    "count": 2,
    "to": "hand"               // hand | deck | deck_top | deck_bottom
  }}
```

#### `shuffleHandToDeck` — 手牌洗回牌庫
```jsonc
{ "handler": "shuffleHandToDeck",
  "params": {
    "player": "opponent",
    "to": "deck_bottom",       // deck | deck_bottom | deck_top
    "then_draw": 3             // 之後抽幾張，0 = 不抽
  }}
```

### 狀態類

#### `applyStatus` — 施加特殊狀態
```jsonc
{ "handler": "applyStatus",
  "params": {
    "target": "opponent_active",
    "status": "poison"         // poison | burn | sleep | paralysis | confusion
  }}
```

#### `applyStatusMulti` — 同時施加多個狀態
```jsonc
{ "handler": "applyStatusMulti",
  "params": {
    "target": "opponent_active",
    "statuses": ["poison", "burn"]
  }}
```

### 回復類

#### `heal` — 回復HP
```jsonc
{ "handler": "heal",
  "params": {
    "target": "self_active",   // self_active | self_bench | self_choose | self_all
    "amount": 30
  }}
```

#### `healAll` — 回復全部HP
```jsonc
{ "handler": "healAll",
  "params": { "target": "self_active" }}
```

### 替換類

#### `switchOpponent` — 強制對手換場
```jsonc
{ "handler": "switchOpponent",
  "params": { "choose_by": "self" }}   // self = 我方選對手的備戰, opponent = 對手自選
```

#### `switchSelf` — 自己換場
```jsonc
{ "handler": "switchSelf",
  "params": {}}
```

### 能量類

#### `attachEnergyFromDeck` — 從牌庫附加能量
```jsonc
{ "handler": "attachEnergyFromDeck",
  "params": {
    "energy_type": "Fire",     // Fire | Water | any | basic
    "count": 1,
    "to": "self_active"        // self_active | self_bench | self_choose
  }}
```

#### `attachEnergyFromDiscard` — 從棄牌堆附加能量
```jsonc
{ "handler": "attachEnergyFromDiscard",
  "params": {
    "energy_type": "any",
    "count": 1,
    "to": "self_choose"
  }}
```

#### `moveEnergy` — 移動能量
```jsonc
{ "handler": "moveEnergy",
  "params": {
    "from": "self_any",
    "to": "self_choose",
    "count": 1
  }}
```

### 被動能力類

#### `reduceDamage` — 減少受到的傷害（特性用）
```jsonc
{ "handler": "reduceDamage",
  "params": { "amount": 20 }}
```

#### `preventStatus` — 防止特殊狀態（特性用）
```jsonc
{ "handler": "preventStatus",
  "params": { "statuses": ["all"] }}   // ["all"] | ["poison", "burn"]
```

#### `freeRetreat` — 撤退費用歸零（特性用）
```jsonc
{ "handler": "freeRetreat", "params": {}}
```

### 特殊能量類

#### `energyProvide` — 特殊能量提供
```jsonc
{ "handler": "energyProvide",
  "params": {
    "provides": "Fire",
    "on_discard": "return_to_hand",     // null | return_to_hand | attach_to_bench
    "on_discard_condition": { "pokemon_attribute": "Fire" },
    "bonus_effect": null                // null | "+20_damage" | "no_weakness"
  }}
```

### 組合動作類

#### `sequence` — 依序執行多個動作
```jsonc
{ "handler": "sequence",
  "params": {
    "steps": [
      { "handler": "discardEnergy", "params": { "from": "self_active", "energy_type": "Fire", "count": 2 }},
      { "handler": "damage", "params": { "amount": 120 }}
    ]
  }}
```

#### `conditional` — 條件分支
```jsonc
{ "handler": "conditional",
  "params": {
    "if": "opponent_prize_lte_3",       // 條件名稱
    "then": { "handler": "shuffleHandToDeck", "params": { "player": "opponent", "to": "deck_bottom", "then_draw": 3 }},
    "else": null                        // null = 不可使用
  }}
```

---

## 條件名稱速查

| 條件名稱 | 說明 |
|---------|------|
| `opponent_prize_lte_N` | 對手獎賞卡剩 N 張以下 |
| `self_prize_lte_N` | 自己獎賞卡剩 N 張以下 |
| `opponent_has_damage` | 對手戰鬥寶可夢有傷害指示物 |
| `self_active_is_TYPE` | 自己的戰鬥寶可夢是某屬性 |
| `self_bench_has_NAME` | 自己的備戰區有某寶可夢 |
| `energy_attached_gte_N` | 身上附加 N 個以上能量 |
| `opponent_bench_count_gte_N` | 對手備戰區有 N 隻以上 |
| `last_turn_knocked_out` | 上回合自己有寶可夢被擊倒 |
| `is_evolved` | 這隻寶可夢是進化後的 |
| `first_turn` | 先攻第一回合 |

---

## 特例處理（custom）

當效果無法用標準 handler 表達時：

```jsonc
{
  "source_type": "attack",
  "source_index": 1,
  "status": "custom",
  "handler": "custom_BeedrillEx_Attack1",
  "params": {
    "description": "造成自己的場上的「大針蜂」（包含寶可夢ex）的數量×110點傷害",
    "damage_formula": "count × 110",
    "count_target": "自己場上名稱含「大針蜂」的寶可夢"
  },
  "notes": "需要專屬實作：計算場上特定名稱寶可夢數量"
}
```

**規則：**
- `handler` 命名為 `custom_{卡片英文名}_{來源}` 或 `custom_{card_id}_{來源}`
- `params.description` 必填，用自然語言描述效果邏輯
- `notes` 寫明為什麼需要 custom（哪部分無法標準化）
- 模擬器端會有一個 `customHandlers` 物件，key 對應 handler 名稱

---

## 何時用 custom vs 標準 handler

| 情況 | 用什麼 |
|------|--------|
| 擲硬幣決定傷害 | 標準 `coinFlipBonus` |
| 丟棄能量後造成傷害 | 標準 `sequence` |
| 計算場上特定寶可夢數量×傷害 | 可用 `damageMultiply`，但如果條件複雜就用 `custom` |
| 複製對手招式 | `custom` |
| 根據對手手牌數量決定效果 | `custom` |
| 多層條件巢狀 | `custom` |
| GX / VSTAR 大招 | `custom` |
| 效果持續到下個回合 | `custom` |
| 連鎖反應（觸發其他能力） | `custom` |

---

## 純傷害招式（不需要 effect_spec）

如果招式 **只有傷害數值、沒有任何文字效果**，則不需要 effect_spec：

```jsonc
// 這個招式不需要 effect_spec
{ "index": 1, "name": "撞擊", "cost": ["Colorless"], "damage": "30", "effect_text": null }
```

**規則：** 當 `effect_text` 為 `null` 或空字串時，`effect_specs` 中不需要對應項目，或標記為 `"skip"`。

---

## 完整範例

### 獨角蟲（簡單硬幣）
```jsonc
{
  "card_id": 18421,
  "effect_specs": [{
    "source_type": "attack", "source_index": 1,
    "status": "ready",
    "handler": "coinFlipOrFail",
    "params": { "flips": 1 },
    "notes": ""
  }]
}
```

### 鐵殼蛹（被動特性 + 普通攻擊）
```jsonc
{
  "card_id": 18422,
  "effect_specs": [
    {
      "source_type": "ability", "source_index": 1,
      "status": "ready",
      "handler": "reduceDamage",
      "params": { "amount": 20 },
      "notes": "堅硬身軀：受到招式傷害 -20"
    },
    {
      "source_type": "attack", "source_index": 1,
      "status": "skip",
      "handler": null, "params": null,
      "notes": "純傷害 20，無額外效果"
    }
  ]
}
```

### 特殊紅牌（條件 + 組合動作）
```jsonc
{
  "card_id": 18492,
  "effect_specs": [{
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
    "notes": "對手獎賞卡≤3時可用：對手手牌全部放回牌庫底，然後抽3張"
  }]
}
```

### 燃料【火】能量（特殊能量）
```jsonc
{
  "card_id": 18501,
  "effect_specs": [{
    "source_type": "card", "source_index": 1,
    "status": "ready",
    "handler": "energyProvide",
    "params": {
      "provides": "Fire",
      "on_discard": "return_to_hand",
      "on_discard_condition": { "pokemon_attribute": "Fire", "cause": "attack_effect" },
      "bonus_effect": null
    },
    "notes": "提供1個火能量；火屬性寶可夢因招式效果丟棄時回到手牌"
  }]
}
```
