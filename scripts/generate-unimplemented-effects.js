const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CARDS_PATH = path.join(ROOT, "deck-builder-data", "cards.json");
const HANDLERS_PATH = path.join(ROOT, "effect-handlers.js");
const CUSTOM_HANDLERS_PATH = path.join(ROOT, "effect-custom-handlers.js");
const ENGINE_PATH = path.join(ROOT, "effect-engine.js");
const OUTPUT_PATH = path.join(ROOT, "docs", "unimplemented_effects.md");

const TYPE_POKEMON = "\u5bf6\u53ef\u5922";
const TYPE_TRAINER = "\u8a13\u7df4\u5bb6";
const TYPE_SPECIAL_ENERGY = "\u7279\u6b8a\u80fd\u91cf";
const SUBTYPE_ITEM = "item";
const SUBTYPE_TOOL = "tool";
const SUBTYPE_STADIUM = "stadium";

const GROUPS = [
  { key: "pokemon_abilities", title: "\u5bf6\u53ef\u5922\u7279\u6027" },
  { key: "pokemon_attacks", title: "\u5bf6\u53ef\u5922\u62db\u5f0f" },
  { key: "trainer", title: "\u8a13\u7df4\u5bb6" },
  { key: "item", title: "\u9053\u5177" },
  { key: "stadium", title: "\u7af6\u6280\u5834" },
  { key: "special_energy", title: "\u7279\u6b8a\u80fd\u91cf" }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractSet(text, regex, groupIndex = 1) {
  const values = new Set();
  let match;
  while ((match = regex.exec(text))) {
    values.add(match[groupIndex]);
  }
  return values;
}

function normalizeSpec(spec) {
  if (!spec || typeof spec !== "object") return null;
  let params = spec.params;
  if (!params && spec.payload_json && typeof spec.payload_json === "object") {
    params = spec.payload_json;
  }
  return {
    sourceType: String(spec.source_type || spec.sourceType || "attack").trim(),
    sourceIndex: Number(spec.source_index || spec.sourceIndex) || 1,
    status: String(spec.status || "pending").trim(),
    handler: String(spec.handler || spec.simulator_handler || "").trim(),
    params: params && typeof params === "object" ? params : {}
  };
}

function cleanText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function hasEffectText(value) {
  return cleanText(value).length > 0;
}

function sourceText(source) {
  return cleanText(
    source && (
      source.effect_text
      || source.effectText
      || source.effect_text_raw
      || source.effectTextRaw
    )
  );
}

function cardText(card) {
  return cleanText(
    card && (
      card.effect_text
      || card.effectText
      || card.effect_text_raw
      || card.effectTextRaw
    )
  );
}

function getTrainerSubtypeCode(card) {
  return String(card && (card.trainer_subtype_code || card.trainerSubtypeCode || "") || "")
    .trim()
    .toLowerCase();
}

function buildImplementationIndex() {
  const standardHandlers = extractSet(readText(HANDLERS_PATH), /effectHandlers\.([A-Za-z0-9_]+)\s*=/g);
  const customHandlers = extractSet(readText(CUSTOM_HANDLERS_PATH), /register\("([^"]+)"/g);
  const engineEffects = extractSet(readText(ENGINE_PATH), /case "([^"]+)":/g);
  return {
    standardHandlers,
    customHandlers,
    engineEffects
  };
}

function isKnownEffectName(index, effectName) {
  return index.customHandlers.has(effectName) || index.engineEffects.has(effectName);
}

function isExecutableAction(index, action) {
  if (action == null) return true;
  if (typeof action === "string") {
    return action.startsWith("apply_status:");
  }
  if (typeof action === "object") {
    return isSpecImplemented(index, {
      status: "ready",
      handler: action.handler,
      params: action.params || {}
    });
  }
  return false;
}

function isSpecImplemented(index, spec) {
  if (!spec || typeof spec !== "object") return false;

  const normalized = normalizeSpec(spec);
  if (!normalized) return false;

  const status = normalized.status;
  const handler = normalized.handler;
  const params = normalized.params || {};

  if (!handler) return false;
  if (status === "pending" || status === "error" || status === "manual" || status === "skip") {
    return false;
  }

  if (status === "custom" || handler === "custom") {
    const key = cleanText(params.effect || handler);
    return !!key && index.customHandlers.has(key);
  }

  if (!(index.standardHandlers.has(handler) || index.customHandlers.has(handler))) {
    return false;
  }

  if (params.effect) {
    const effectName = cleanText(params.effect);
    if (!isKnownEffectName(index, effectName)) {
      return false;
    }
  }

  if (handler === "sequence") {
    const steps = Array.isArray(params.steps) ? params.steps : [];
    return steps.length > 0 && steps.every((step) => isSpecImplemented(index, {
      status: "ready",
      handler: step && step.handler,
      params: step && step.params || {}
    }));
  }

  if (handler === "conditional") {
    const branches = [params.then, params.else].filter(Boolean);
    return branches.length > 0 && branches.every((branch) => isSpecImplemented(index, {
      status: "ready",
      handler: branch.handler,
      params: branch.params || {}
    }));
  }

  if (handler === "coinFlipEffect") {
    return isExecutableAction(index, params.on_heads) && isExecutableAction(index, params.on_tails);
  }

  return true;
}

function sourceHasUnimplementedPart(index, specs) {
  if (!Array.isArray(specs) || specs.length === 0) {
    return true;
  }
  return specs.some((spec) => !isSpecImplemented(index, spec));
}

function groupKeyForCard(card, effectType) {
  if (effectType === "\u7279\u6027") return "pokemon_abilities";
  if (effectType === "\u62db\u5f0f") return "pokemon_attacks";
  if (card.card_type === TYPE_SPECIAL_ENERGY) return "special_energy";

  const subtypeCode = getTrainerSubtypeCode(card);
  if (subtypeCode === SUBTYPE_STADIUM) return "stadium";
  if (subtypeCode === SUBTYPE_ITEM || subtypeCode === SUBTYPE_TOOL) return "item";
  return "trainer";
}

function outputTypeForCard(card) {
  if (card.card_type === TYPE_SPECIAL_ENERGY) return "\u7279\u6b8a\u80fd\u91cf";
  const subtypeCode = getTrainerSubtypeCode(card);
  if (subtypeCode === SUBTYPE_STADIUM) return "\u7af6\u6280\u5834";
  if (subtypeCode === SUBTYPE_ITEM || subtypeCode === SUBTYPE_TOOL) return "\u9053\u5177";
  return "\u8a13\u7df4\u5bb6";
}

function addEntry(groups, groupKey, entry) {
  groups.get(groupKey).push(entry);
}

function collectEntries(cards, index) {
  const groups = new Map(GROUPS.map((group) => [group.key, []]));

  for (const card of cards) {
    const specs = (Array.isArray(card.effect_specs) ? card.effect_specs : [])
      .map(normalizeSpec)
      .filter(Boolean);

    for (const ability of Array.isArray(card.abilities) ? card.abilities : []) {
      const text = sourceText(ability);
      if (!hasEffectText(text)) continue;
      const sourceIndex = Number(ability.index) || 1;
      const matchedSpecs = specs.filter((spec) => spec.sourceType === "ability" && spec.sourceIndex === sourceIndex);
      if (!sourceHasUnimplementedPart(index, matchedSpecs)) continue;
      addEntry(groups, groupKeyForCard(card, "\u7279\u6027"), {
        cardName: card.name,
        cardId: card.card_id,
        effectType: "\u7279\u6027",
        effectDescription: text
      });
    }

    for (const attack of Array.isArray(card.attacks) ? card.attacks : []) {
      const text = sourceText(attack);
      if (!hasEffectText(text)) continue;
      const sourceIndex = Number(attack.index) || 1;
      const matchedSpecs = specs.filter((spec) => spec.sourceType === "attack" && spec.sourceIndex === sourceIndex);
      if (!sourceHasUnimplementedPart(index, matchedSpecs)) continue;
      addEntry(groups, groupKeyForCard(card, "\u62db\u5f0f"), {
        cardName: card.name,
        cardId: card.card_id,
        effectType: "\u62db\u5f0f",
        effectDescription: text
      });
    }

    if (card.card_type === TYPE_TRAINER || card.card_type === TYPE_SPECIAL_ENERGY) {
      const text = cardText(card);
      if (!hasEffectText(text)) continue;
      const matchedSpecs = specs.filter((spec) => spec.sourceType === "card");
      if (!sourceHasUnimplementedPart(index, matchedSpecs)) continue;
      addEntry(groups, groupKeyForCard(card, outputTypeForCard(card)), {
        cardName: card.name,
        cardId: card.card_id,
        effectType: outputTypeForCard(card),
        effectDescription: text
      });
    }
  }

  for (const items of groups.values()) {
    items.sort((a, b) => {
      if (a.cardId !== b.cardId) return a.cardId - b.cardId;
      return a.effectType.localeCompare(b.effectType, "zh-Hant");
    });
  }

  return groups;
}

function formatEntry(entry) {
  return `- \`${entry.cardName}\`｜卡片ID：\`${entry.cardId}\`｜未實裝的效果類型：${entry.effectType}｜效果描述：${entry.effectDescription}`;
}

function buildMarkdown(groups) {
  const total = GROUPS.reduce((sum, group) => sum + groups.get(group.key).length, 0);
  const lines = [];
  lines.push("# 尚未實裝效果清單");
  lines.push("");
  lines.push("此文件依 `deck-builder-data/cards.json` 的效果欄位與目前 `effect-handlers.js`、`effect-custom-handlers.js`、`effect-engine.js` 已註冊/可解析的 handler 比對產生。");
  lines.push("");
  lines.push("判定規則：");
  lines.push("- 該效果沒有對應的 `effect_specs`。");
  lines.push("- 對應 `effect_specs` 含有 `pending`、`manual`、`error`、`skip`，或 handler / 巢狀步驟不存在。");
  lines.push("- 本清單著重於 handler 映射是否存在，不額外判定已存在 handler 的語意完整度。");
  lines.push("");
  lines.push(`總筆數：${total}`);
  lines.push("");

  for (const group of GROUPS) {
    const entries = groups.get(group.key);
    lines.push(`## ${group.title}（${entries.length}）`);
    if (!entries.length) {
      lines.push("");
      lines.push("- 無");
      lines.push("");
      continue;
    }
    lines.push("");
    for (const entry of entries) {
      lines.push(formatEntry(entry));
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function main() {
  const cards = readJson(CARDS_PATH);
  const index = buildImplementationIndex();
  const groups = collectEntries(cards, index);
  const markdown = buildMarkdown(groups);
  fs.writeFileSync(OUTPUT_PATH, markdown, "utf8");
  const summary = Object.fromEntries(GROUPS.map((group) => [group.key, groups.get(group.key).length]));
  console.log(JSON.stringify({
    output: path.relative(ROOT, OUTPUT_PATH),
    summary
  }, null, 2));
}

main();
