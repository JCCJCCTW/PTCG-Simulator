# PTCG 卡片效果規格（Effect Specification）

## 概述

每張卡片的 `effect_specs` 陣列中，每個效果物件定義一個可執行的遊戲邏輯。
Codex/AI 的任務是根據 `effect_text`（中文敘述），填入 `effect_type`、`payload_json`、`simulator_handler`。

---

## effect_specs 物件結構

```json
{
  "source_type": "attack" | "ability" | "card",
  "source_index": 1,
  "effect_type": "damage | coin_flip | draw | discard | search | shuffle | heal | status | move_card | energy | switch | prevent | modify_damage | copy | counter | special",
  "payload_json": { ... },
  "simulator_handler": "handler_function_name",
  "status": "pending" | "ready" | "manual" | "skip",
  "notes": "補充說明"
}
```

### status 定義
| 值 | 說明 |
|-----|------|
| `pending` | 尚未處理 |
| `ready` | 已填入 payload，可由模擬器執行 |
| `manual` | 效果過於複雜，需人工操作（模擬器僅顯示提示文字） |
| `skip` | 無實質效果（如基本能量、規則提示文字） |

---

## effect_type 分類與 payload 格式

### 1. `damage` — 傷害

```json
{
  "effect_type": "damage",
  "payload_json": {
    "base": 110,
    "modifier": "none" | "multiply" | "add" | "subtract",
    "modifier_source": null | "coin_flip" | "energy_count" | "bench_count" | "damage_counter" | "card_count",
    "modifier_query": {},
    "modifier_per": 10,
    "target": "opponent_active" | "opponent_bench" | "opponent_bench_all" | "self" | "choose_opponent",
    "self_damage": 0
  }
}
```

**範例：** 造成自己的場上的「大針蜂」的數量 ×110 點傷害
```json
{
  "base": 0,
  "modifier": "multiply",
  "modifier_source": "card_count",
  "modifier_query": { "owner": "self", "zone": "field", "name_contains": "大針蜂" },
  "modifier_per": 110,
  "target": "opponent_active"
}
```

### 2. `coin_flip` — 擲硬幣

```json
{
  "effect_type": "coin_flip",
  "payload_json": {
    "count": 1,
    "on_heads": { "action": "damage", "value": 30 },
    "on_tails": { "action": "fail" },
    "until_tails": false,
    "per_heads": null
  }
}
```

**範例：** 擲1次硬幣若為反面，則這個招式失敗
```json
{
  "count": 1,
  "on_heads": { "action": "none" },
  "on_tails": { "action": "fail" }
}
```

**範例：** 擲硬幣直到出現反面，每次正面造成 30 點傷害
```json
{
  "count": 0,
  "until_tails": true,
  "per_heads": { "action": "damage", "value": 30 }
}
```

### 3. `draw` — 抽卡

```json
{
  "effect_type": "draw",
  "payload_json": {
    "player": "self" | "opponent",
    "count": 2
  }
}
```

### 4. `discard` — 丟棄

```json
{
  "effect_type": "discard",
  "payload_json": {
    "player": "self" | "opponent",
    "from": "hand" | "deck_top" | "active" | "bench" | "field",
    "target": "card" | "energy" | "trainer" | "pokemon" | "any",
    "count": 1,
    "choose": true,
    "energy_type": null | "Fire" | "Water" | "any",
    "then": null
  }
}
```

### 5. `search` — 搜尋牌庫

```json
{
  "effect_type": "search",
  "payload_json": {
    "player": "self",
    "from": "deck" | "discard" | "prize",
    "filter": {
      "card_type": null | "寶可夢" | "訓練家" | "能量",
      "name_contains": null,
      "evolution_stage": null,
      "attribute": null,
      "hp_max": null,
      "trainer_subtype": null
    },
    "count": 1,
    "destination": "hand" | "bench" | "active" | "deck_top" | "deck_bottom",
    "reveal": false,
    "shuffle_after": true
  }
}
```

### 6. `shuffle` — 洗牌 / 放回牌庫

```json
{
  "effect_type": "shuffle",
  "payload_json": {
    "player": "self" | "opponent",
    "source": "hand" | "discard" | "field",
    "target": "all" | "choose",
    "count": 0,
    "destination": "deck" | "deck_bottom" | "deck_top",
    "shuffle_deck": true
  }
}
```

**範例：** 對手將手牌全部放回牌庫下方，然後抽3張
```json
[
  {
    "effect_type": "shuffle",
    "payload_json": {
      "player": "opponent",
      "source": "hand",
      "target": "all",
      "destination": "deck_bottom",
      "shuffle_deck": false
    }
  },
  {
    "effect_type": "draw",
    "payload_json": { "player": "opponent", "count": 3 }
  }
]
```

### 7. `heal` — 回復HP

```json
{
  "effect_type": "heal",
  "payload_json": {
    "target": "self_active" | "self_bench" | "self_any" | "choose",
    "amount": 30,
    "condition": null | { "is_ex": true }
  }
}
```

### 8. `status` — 特殊狀態

```json
{
  "effect_type": "status",
  "payload_json": {
    "target": "opponent_active" | "self_active",
    "condition": "poison" | "burn" | "sleep" | "paralysis" | "confusion",
    "poison_damage": 10
  }
}
```

### 9. `move_card` — 移動卡片

```json
{
  "effect_type": "move_card",
  "payload_json": {
    "player": "self" | "opponent",
    "from": "hand" | "deck" | "discard" | "bench" | "active" | "prize",
    "to": "hand" | "deck" | "discard" | "bench" | "active" | "deck_bottom" | "deck_top" | "lost_zone",
    "filter": {},
    "count": 1,
    "choose": true,
    "reveal": false
  }
}
```

### 10. `energy` — 能量操作

```json
{
  "effect_type": "energy",
  "payload_json": {
    "action": "attach" | "move" | "discard" | "return",
    "from": "discard" | "deck" | "active" | "bench" | "hand",
    "to": "active" | "bench" | "any_pokemon" | "hand" | "discard",
    "energy_type": null | "Fire" | "Water" | "Grass" | "any",
    "count": 1,
    "choose_target": true
  }
}
```

### 11. `switch` — 替換寶可夢

```json
{
  "effect_type": "switch",
  "payload_json": {
    "player": "self" | "opponent",
    "choose": true,
    "choose_by": "self" | "opponent"
  }
}
```

### 12. `prevent` — 防止效果（被動）

```json
{
  "effect_type": "prevent",
  "payload_json": {
    "trigger": "on_damage_received" | "on_attack" | "on_retreat" | "on_status",
    "condition": null,
    "prevent_type": "damage" | "effect" | "status" | "all",
    "until": "end_of_turn" | "permanent" | "next_turn"
  }
}
```

### 13. `modify_damage` — 傷害修正（被動）

```json
{
  "effect_type": "modify_damage",
  "payload_json": {
    "trigger": "on_damage_received" | "on_damage_dealt",
    "amount": -20,
    "condition": null,
    "scope": "this_pokemon" | "all_pokemon"
  }
}
```

**範例：** 堅硬身軀 — 這隻寶可夢受到招式的傷害「-20」點
```json
{
  "trigger": "on_damage_received",
  "amount": -20,
  "condition": { "source": "attack" },
  "scope": "this_pokemon"
}
```

### 14. `special` — 特殊/複合效果

當效果過於複雜，無法用單一 type 表達時，使用 `special`：

```json
{
  "effect_type": "special",
  "payload_json": {
    "description": "效果的自然語言描述",
    "steps": [
      { "effect_type": "...", "payload_json": { ... } },
      { "effect_type": "...", "payload_json": { ... } }
    ],
    "condition": null
  }
}
```

---

## 條件系統 (condition)

許多效果有使用條件，統一格式：

```json
{
  "condition": {
    "type": "prize_count" | "card_in_zone" | "pokemon_type" | "energy_attached" | "turn" | "hp" | "coin",
    "player": "self" | "opponent",
    "operator": "lte" | "gte" | "eq" | "lt" | "gt",
    "value": 3,
    "zone": null,
    "query": {}
  }
}
```

**範例：** 這張卡只有在對手剩餘獎賞卡的張數為3張以下時才可使用
```json
{
  "type": "prize_count",
  "player": "opponent",
  "operator": "lte",
  "value": 3
}
```

---

## 能量提供（特殊能量卡）

特殊能量卡提供的能量及附加效果：

```json
{
  "effect_type": "energy_provide",
  "payload_json": {
    "provides": [{ "type": "Fire", "count": 1 }],
    "on_discard_by_attack": {
      "action": "return_to_hand",
      "condition": { "pokemon_attribute": "Fire" }
    }
  }
}
```

---

## 複合效果範例

### 特殊紅牌（完整 effect_specs）

```json
"effect_specs": [
  {
    "source_type": "card",
    "source_index": 1,
    "effect_type": "special",
    "payload_json": {
      "condition": {
        "type": "prize_count",
        "player": "opponent",
        "operator": "lte",
        "value": 3
      },
      "steps": [
        {
          "effect_type": "shuffle",
          "payload_json": {
            "player": "opponent",
            "source": "hand",
            "target": "all",
            "destination": "deck_bottom",
            "shuffle_deck": false
          }
        },
        {
          "effect_type": "draw",
          "payload_json": { "player": "opponent", "count": 3 }
        }
      ]
    },
    "simulator_handler": "handleSpecialRedCard",
    "status": "ready",
    "notes": null
  }
]
```

---

## simulator_handler 命名規範

格式：`handle{CardName}{EffectSource}`

| source_type | 命名範例 |
|-------------|---------|
| attack | `handleBeedrillExAttack1` |
| ability | `handleMetapodAbility1` |
| card (trainer) | `handleSpecialRedCard` |
| card (energy) | `handleFuelFireEnergy` |

---

## Codex/AI 填入指引

### 輸入
- `effect_text`（中文效果描述）
- `attacks[].effect_text`（招式效果描述）
- `abilities[].effect_text`（特性效果描述）
- `card_type`、`trainer_subtype_code`（判斷卡片類型）

### 輸出
填入每個 `effect_specs` 項目的：
1. `effect_type` — 從上方分類中選擇
2. `payload_json` — 依照對應格式填入參數
3. `simulator_handler` — 依命名規範產生
4. `status` — 設為 `"ready"`（可執行）或 `"manual"`（需人工）

### 判斷規則
1. 基本能量卡 → `status: "skip"`，不需要效果
2. 純數值傷害無附加效果 → `effect_type: "damage"` + 簡單 payload
3. 效果描述包含多個步驟 → 使用 `special` + `steps` 陣列
4. 效果涉及玩家選擇（選擇目標、選擇丟棄等）→ `choose: true`
5. 效果文字過於模糊或涉及未定義機制 → `status: "manual"`

---

## 遊戲狀態介面（模擬器端）

效果執行時可存取的遊戲狀態：

```javascript
const gameState = {
  // 區域
  zones: {
    "player1-active": [Card],
    "player1-bench": [Card],
    "player1-hand": [Card],
    "player1-deck": [Card],
    "player1-discard": [Card],
    "player1-prize": [Card],
    "opponent-active": [Card],
    "opponent-bench": [Card],
    // ...同上
  },

  // 卡片
  Card: {
    id, syncId, owner, name, series, number,
    cardType, elementType, hp, currentHp,
    energies: [{ type: "Fire", cardId: 123 }],
    statusConditions: ["poison", "burn"],
    isFaceUp: true,
    zoneId: "player1-active"
  },

  // 回合資訊
  turn: {
    player: "player1" | "opponent",
    number: 1,
    supporterPlayed: false,
    retreated: false,
    energyAttached: false
  }
};
```

### 效果處理器介面

```javascript
// 每個 handler 接收統一的 context 物件
async function handleEffect(context) {
  const {
    gameState,       // 當前遊戲狀態
    source,          // 發動效果的卡片
    payload,         // effect_specs.payload_json
    ui,              // UI 互動介面
  } = context;

  // UI 互動方法
  await ui.coinFlip(count);                    // 擲硬幣，回傳 ["heads", "tails", ...]
  await ui.chooseCard(cards, count, prompt);    // 玩家選擇卡片
  await ui.choosePokemon(zone, prompt);        // 玩家選擇寶可夢
  await ui.confirm(prompt);                    // 確認對話框
  await ui.showMessage(text);                  // 顯示訊息

  // 遊戲操作方法
  gameState.dealDamage(target, amount);        // 造成傷害
  gameState.healDamage(target, amount);        // 回復HP
  gameState.drawCards(player, count);          // 抽卡
  gameState.discardCard(card);                 // 丟棄卡片
  gameState.moveCard(card, fromZone, toZone);  // 移動卡片
  gameState.applyStatus(target, condition);    // 施加狀態
  gameState.removeStatus(target, condition);   // 移除狀態
  gameState.attachEnergy(pokemon, energyCard); // 附加能量
  gameState.switchPokemon(player, target);     // 替換寶可夢
  gameState.shuffleDeck(player);               // 洗牌
  gameState.getCardsInZone(zoneId);            // 取得區域卡片
  gameState.findCards(query);                  // 搜尋符合條件的卡片
}
```
