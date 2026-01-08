#!/usr/bin/env node
// scripts/smoke-test.mjs
// Consumer smoke test - validates package can be imported correctly
// Run after `npm pack` to verify the published artifact works

import { execSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const PACKAGE_NAME = '@talosprotocol/contracts';

console.log('🔍 Running consumer smoke test...\n');

// Find the tarball
const packOutput = execSync('npm pack --json', { encoding: 'utf-8' });
const packInfo = JSON.parse(packOutput);
const tarball = packInfo[0].filename;
console.log(`📦 Packed: ${tarball}`);

// Create temp directory
const tempDir = mkdtempSync(join(tmpdir(), 'contracts-smoke-'));
console.log(`📁 Temp dir: ${tempDir}`);

try {
    // Initialize package.json
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        name: 'smoke-test',
        type: 'module',
        dependencies: {}
    }, null, 2));

    // Install the tarball
    console.log('\n📥 Installing tarball...');
    execSync(`npm install ${join(process.cwd(), tarball)}`, { 
        cwd: tempDir, 
        stdio: 'inherit' 
    });

    // ESM import test
    console.log('\n🧪 Testing ESM import...');
    const esmTest = `
import {
    base64urlEncodeBytes,
    base64urlDecodeToBytes,
    isUuidV7,
    deriveCursor,
    decodeCursor,
    compareCursor,
    assertCursorInvariant,
    checkCursorContinuity,
    orderingCompare,
    redactEvent,
    redactGatewaySnapshot,
    createEvidenceBundle,
    Base64UrlError
} from '${PACKAGE_NAME}';

// Verify functions exist and are callable
const exports = {
    base64urlEncodeBytes,
    base64urlDecodeToBytes,
    isUuidV7,
    deriveCursor,
    decodeCursor,
    compareCursor,
    assertCursorInvariant,
    checkCursorContinuity,
    orderingCompare,
    redactEvent,
    redactGatewaySnapshot,
    createEvidenceBundle,
    Base64UrlError
};

const missing = Object.entries(exports)
    .filter(([_, v]) => typeof v !== 'function')
    .map(([k]) => k);

if (missing.length > 0) {
    console.error('❌ Missing exports:', missing);
    process.exit(1);
}

// Quick functional test
const encoded = base64urlEncodeBytes(new Uint8Array([1, 2, 3]));
console.log('  base64urlEncodeBytes([1,2,3]) =', encoded);

const uuid = '01234567-89ab-7cde-8f01-234567890abc';
console.log('  isUuidV7(' + uuid + ') =', isUuidV7(uuid));

console.log('✅ ESM import test passed!');
console.log('✅ All', Object.keys(exports).length, 'exports verified.');
`;

    writeFileSync(join(tempDir, 'esm-test.mjs'), esmTest);
    execSync('node esm-test.mjs', { cwd: tempDir, stdio: 'inherit' });

    // Deep import rejection test
    console.log('\n🧪 Testing deep import rejection...');
    const deepImportTest = `
try {
    await import('${PACKAGE_NAME}/base64url');
    console.error('❌ Deep import should have been rejected!');
    process.exit(1);
} catch (e) {
    if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
        console.log('✅ Deep import correctly rejected:', e.message);
    } else {
        console.error('❌ Unexpected error:', e);
        process.exit(1);
    }
}
`;

    writeFileSync(join(tempDir, 'deep-import-test.mjs'), deepImportTest);
    execSync('node deep-import-test.mjs', { cwd: tempDir, stdio: 'inherit' });

    console.log('\n🎉 All smoke tests passed!\n');

} finally {
    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });
    rmSync(tarball, { force: true });
    console.log('🧹 Cleaned up temp files');
}
