const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const iconGen = require('icon-gen');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');
const sourceCandidates = [
  path.join(assetsDir, 'app-icon-source.png'),
  path.join(projectRoot, 'icon.jpg'),
  path.join(assetsDir, 'app-icon.png')
];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveSourceIcon() {
  for (const candidate of sourceCandidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  throw new Error(`No icon source found. Expected one of: ${sourceCandidates.join(', ')}`);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function buildPngSet(sourcePath, tempDir) {
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  const image = sharp(sourcePath, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to read source image metadata.');
  }

  for (const size of sizes) {
    await image
      .clone()
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(tempDir, `${size}.png`));
  }

  await image
    .clone()
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(assetsDir, 'app-icon.png'));
}

async function main() {
  const sourcePath = await resolveSourceIcon();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ptcg-iconset-'));

  try {
    await ensureDir(assetsDir);
    await buildPngSet(sourcePath, tempDir);

    await iconGen(tempDir, assetsDir, {
      report: true,
      ico: {
        name: 'app-icon',
        sizes: [16, 24, 32, 48, 64, 128, 256]
      },
      icns: {
        name: 'app-icon',
        sizes: [16, 32, 64, 128, 256, 512, 1024]
      }
    });

    console.log(`Generated macOS and Windows icons from ${sourcePath}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
