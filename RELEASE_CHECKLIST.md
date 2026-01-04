# Release Checklist (v1.0.0)

## Pre-Release
- [ ] **Vectors**: Ensure `release_sets/v1.0.0.json` is pinned and valid.
- [ ] **Conformance**: All SDKs pass conformance harness with v1.0.0 set.
- [ ] **Docs**: `COMPATIBILITY.md` updated.
- [ ] **Security**: `SECURITY.md` present.
- [ ] **Provenance**: CI pipeline configured to generate SBOMs (CycloneDX).

## Release Steps
1.  **Tag**: `git tag v1.0.0` on `talos-contracts`.
2.  **Lock**: Update `talos-contracts` submodule in all SDKs to v1.0.0 tag.
3.  **Build**: Run `make build` in all SDKs.
4.  **Verify**: Run `make conformance` in all SDKs.
5.  **Publish**:
    - Python: `twine upload dist/*`
    - NPM: `npm publish --access public`
    - Rust: `cargo publish`
    - Go: Tag version `v1.0.0`
    - Java: `mvn deploy`

## Post-Release
- [ ] Verify package availability on registries.
- [ ] Run smoke tests against installed packages.
- [ ] Yank if critical bugs found within 24h.
