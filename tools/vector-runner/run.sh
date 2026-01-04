#!/bin/bash
# Talos SDK Conformance Runner
# Runs vectors against specified SDK

set -e

LANGUAGE=$1
shift

VECTORS_PATH=""
REPORT_PATH=""
PROTOCOL=""
FEATURES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --vectors)
            VECTORS_PATH="$2"
            shift 2
            ;;
        --report)
            REPORT_PATH="$2"
            shift 2
            ;;
        --protocol)
            PROTOCOL="$2"
            shift 2
            ;;
        --features)
            FEATURES="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 2
            ;;
    esac
done

if [ -z "$LANGUAGE" ] || [ -z "$VECTORS_PATH" ]; then
    echo "Usage: run.sh <language> --vectors <path> [--report <path>] [--protocol <version>] [--features <list>]"
    exit 2
fi

HARNESS_CMD=""
HARNESS_ARGS="--vectors $VECTORS_PATH"

if [ -n "$REPORT_PATH" ]; then
    HARNESS_ARGS="$HARNESS_ARGS --report $REPORT_PATH"
fi

if [ -n "$PROTOCOL" ]; then
    HARNESS_ARGS="$HARNESS_ARGS --protocol $PROTOCOL"
fi

if [ -n "$FEATURES" ]; then
    HARNESS_ARGS="$HARNESS_ARGS --features $FEATURES"
fi

case $LANGUAGE in
    python)
        HARNESS_CMD="python -m talos_sdk.conformance"
        ;;
    typescript|ts)
        HARNESS_CMD="npx @talosprotocol/sdk conformance"
        ;;
    rust|rs)
        HARNESS_CMD="cargo run --bin conformance --"
        ;;
    go)
        HARNESS_CMD="go run ./cmd/conformance"
        ;;
    java)
        HARNESS_CMD="mvn -q exec:java -Dexec.mainClass=org.talosprotocol.sdk.Conformance -Dexec.args="
        ;;
    *)
        echo "Unsupported language: $LANGUAGE"
        exit 2
        ;;
esac

echo "Running conformance for $LANGUAGE..."
echo "Command: $HARNESS_CMD $HARNESS_ARGS"

$HARNESS_CMD $HARNESS_ARGS
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All vectors passed"
else
    echo "❌ Some vectors failed (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
