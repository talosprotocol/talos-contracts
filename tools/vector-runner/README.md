# Talos SDK Conformance Runner

A language-agnostic tool for running test vectors against SDKs.

## Usage

```bash
# Run all vectors against Python SDK
./run.sh python --vectors ../test_vectors/sdk --report results/python.xml

# Run specific feature set
./run.sh python --vectors ../test_vectors/sdk --features core_v1

# Run against specific protocol version
./run.sh python --vectors ../test_vectors/sdk --protocol 1.0
```

## SDK Harness Interface

Each SDK must provide a conformance harness with this CLI:

```bash
# Required command
talos-sdk conformance run --vectors <path> --report <junit.xml>

# Optional flags
--protocol <version>  # Filter by protocol version
--features <list>     # Filter by feature set
```

### Exit Codes
- `0`: All vectors passed
- `1`: One or more vectors failed
- `2`: Harness error (missing SDK, bad vectors path, etc.)

### Report Format

JUnit XML with extensions:

```xml
<testsuites>
  <testsuite name="signing_verify" tests="3" failures="1">
    <testcase name="sign_verify_basic" time="0.001"/>
    <testcase name="sign_empty_message" time="0.001"/>
    <testcase name="invalid_seed_length">
      <failure type="TALOS_INVALID_INPUT">
        Expected: code=TALOS_INVALID_INPUT
        Actual: code=ValueError
        Diff: error code mismatch
      </failure>
    </testcase>
  </testsuite>
</testsuites>
```

## Supported Languages

| Language | Harness Command | Status |
| :--- | :--- | :--- |
| Python | `python -m talos_sdk.conformance` | ✅ Planned |
| TypeScript | `npx @talosprotocol/sdk conformance` | ⏳ Planned |
| Rust | `cargo run --bin conformance` | ⏳ Planned |
| Go | `go run ./cmd/conformance` | ⏳ Planned |
| Java | `mvn exec:java -Dexec.mainClass=conformance` | ⏳ Planned |
