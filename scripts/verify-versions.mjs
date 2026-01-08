
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkgPath = path.join(root, "typescript/package.json");
const pyPath = path.join(root, "python/pyproject.toml");

if (!fs.existsSync(pkgPath) || !fs.existsSync(pyPath)) {
    console.error("verify-versions: Missing package.json or pyproject.toml");
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const pyContent = fs.readFileSync(pyPath, "utf8");

// Extract version from pyproject.toml (simple regex)
const pyVersionMatch = pyContent.match(/^version = "([^"]+)"/m);
if (!pyVersionMatch) {
    console.error("verify-versions: Could not extract version from pyproject.toml");
    process.exit(1);
}

const pkgVersion = pkg.version;
const pyVersion = pyVersionMatch[1];

if (pkgVersion !== pyVersion) {
    console.error(`❌ Version mismatch detected!`);
    console.error(`   TypeScript: ${pkgVersion}`);
    console.error(`   Python:     ${pyVersion}`);
    console.error(`Versions must match exactly.`);
    process.exit(1);
}

console.log(`✅ Versions match: ${pkgVersion}`);
