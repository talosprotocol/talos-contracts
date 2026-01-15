import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateDigest } from "../src/infrastructure/canonical.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vectorPath = path.resolve(
  __dirname,
  "../../test_vectors/tga/golden_trace_chain.json",
);

describe("TGA Digest Parity (Normative)", () => {
  const chain = JSON.parse(fs.readFileSync(vectorPath, "utf-8"));

  test("ActionRequest digest parity", () => {
    const ar = chain.action_request;
    const digest = calculateDigest(ar);
    expect(digest).toBe(ar._digest);
  });

  test("SupervisorDecision digest parity", () => {
    const sd = chain.supervisor_decision;
    const digest = calculateDigest(sd);
    expect(digest).toBe(sd._digest);
  });

  test("ToolCall digest parity", () => {
    const tc = chain.tool_call;
    const digest = calculateDigest(tc);
    expect(digest).toBe(tc._digest);
  });

  test("ToolEffect digest parity", () => {
    const te = chain.tool_effect;
    const digest = calculateDigest(te);
    expect(digest).toBe(te._digest);
  });
});
