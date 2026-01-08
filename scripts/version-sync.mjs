
import fs from "node:fs";
import path from "node:path";

function bumpPatch(v) {
    const m = /^(\d+)\.(\d+)\.(\d+)(.*)?$/.exec(v);
    if (!m) throw new Error(`Invalid semver: ${v}`);
    const major = Number(m[1]);
    const minor = Number(m[2]);
    const patch = Number(m[3]) + 1;
    const suffix = m[4] ?? "";
    return `${major}.${minor}.${patch}${suffix}`;
}

function readJson(p) {
    return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
    fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

const root = process.cwd();
const pkgPath = path.join(root, "typescript/package.json");
const pyPath = path.join(root, "python/pyproject.toml");

if (!fs.existsSync(pkgPath)) {
    console.log("version-sync: no package.json, skipping");
    process.exit(0);
}

// 1. Read TypeScript version
const pkg = readJson(pkgPath);
if (!pkg.version) throw new Error("package.json missing version");

// 2. Bump version
const next = bumpPatch(pkg.version);
pkg.version = next;

// 3. Update package.json
writeJson(pkgPath, pkg);
console.log(`version-sync: package.json updated to ${next}`);

// 4. Update pyproject.toml if it exists
if (fs.existsSync(pyPath)) {
    let pyContent = fs.readFileSync(pyPath, "utf8");
    const pyVersionRegex = /^version = "([^"]+)"/m;
    const pyMatch = pyContent.match(pyVersionRegex);

    if (pyMatch) {
        // Replace version while preserving the rest of the file
        pyContent = pyContent.replace(pyVersionRegex, `version = "${next}"`);
        fs.writeFileSync(pyPath, pyContent, "utf8");
        console.log(`version-sync: pyproject.toml updated to ${next}`);
    } else {
        console.warn("version-sync: could not find version in pyproject.toml");
    }
}
