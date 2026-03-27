const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "deck-builder-data");
const sourceCardsPath = path.join(dataDir, "cards.json");
const mergedCardsPath = path.join(dataDir, "cards.updated.json");
const mergedPendingPath = path.join(dataDir, "effect_specs_pending.updated.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function listBatchFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^batch_.*_effect_specs\.json$/i.test(entry.name))
    .map((entry) => {
      const fullPath = path.join(directory, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        name: entry.name,
        fullPath,
        mtimeMs: stat.mtimeMs,
      };
    })
    .sort((a, b) => {
      if (a.mtimeMs !== b.mtimeMs) {
        return a.mtimeMs - b.mtimeMs;
      }
      return a.name.localeCompare(b.name);
    });
}

function mergeCards(cards, batchFiles) {
  const cardsById = new Map(cards.map((card) => [card.card_id, card]));
  const mergedCardIds = [];
  const overwrittenCardIds = new Set();

  for (const batchFile of batchFiles) {
    const updates = readJson(batchFile.fullPath);
    for (const update of updates) {
      const card = cardsById.get(update.card_id);
      if (!card) {
        throw new Error(`Card ID ${update.card_id} from ${batchFile.name} not found in cards.json`);
      }

      if (mergedCardIds.includes(update.card_id)) {
        overwrittenCardIds.add(update.card_id);
      }

      card.effect_specs = update.effect_specs;
      mergedCardIds.push(update.card_id);
    }
  }

  return {
    cards,
    mergedCardIds,
    overwrittenCardIds: Array.from(overwrittenCardIds).sort((a, b) => a - b),
  };
}

function main() {
  if (!fs.existsSync(sourceCardsPath)) {
    throw new Error(`Source file not found: ${sourceCardsPath}`);
  }

  const cards = readJson(sourceCardsPath);
  const batchFiles = listBatchFiles(dataDir);

  if (batchFiles.length === 0) {
    throw new Error(`No batch files found in ${dataDir}`);
  }

  const { cards: mergedCards, mergedCardIds, overwrittenCardIds } = mergeCards(cards, batchFiles);
  const pendingCards = mergedCards.filter((card) =>
    Array.isArray(card.effect_specs) && card.effect_specs.some((spec) => spec.status === "pending"),
  );

  writeJson(mergedCardsPath, mergedCards);
  writeJson(mergedPendingPath, pendingCards);

  const uniqueMergedCardIds = new Set(mergedCardIds);

  console.log(
    JSON.stringify(
      {
        source: path.relative(projectRoot, sourceCardsPath),
        batches: batchFiles.map((file) => path.relative(projectRoot, file.fullPath)),
        mergedOutput: path.relative(projectRoot, mergedCardsPath),
        mergedPendingOutput: path.relative(projectRoot, mergedPendingPath),
        mergedCards: uniqueMergedCardIds.size,
        pendingCardsRemaining: pendingCards.length,
        overwrittenCardIds,
      },
      null,
      2,
    ),
  );
}

main();
