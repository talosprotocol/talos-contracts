// src/infrastructure/uuidv7.ts
// Strict UUIDv7 validation - pure regex, no external dependencies

const RE_UUID =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuidV7(id: string): boolean {
  if (!RE_UUID.test(id)) return false;
  // version nibble is first nibble of 3rd group (position 14)
  const version = id[14]!;
  if (version !== "7") return false;

  // variant is first nibble of 4th group (position 19): 8, 9, a, b
  const variant = id[19]!.toLowerCase();
  return (
    variant === "8" || variant === "9" || variant === "a" || variant === "b"
  );
}

export function isCanonicalLowerUuid(id: string): boolean {
  return id === id.toLowerCase();
}
