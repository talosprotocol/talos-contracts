// typescript/src/base64url.ts
// Strict base64url encoding/decoding - NO btoa/atob, NO padding

export class Base64UrlError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Base64UrlError";
    }
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const RE_VALID = /^[A-Za-z0-9\-_]*$/;

function toUtf8Bytes(s: string): Uint8Array {
    return new TextEncoder().encode(s);
}

function fromUtf8Bytes(b: Uint8Array): string {
    return new TextDecoder("utf-8", { fatal: true }).decode(b);
}

export function base64urlEncodeBytes(bytes: Uint8Array): string {
    if (bytes.length === 0) return "";

    let out = "";
    let i = 0;

    while (i + 3 <= bytes.length) {
        const n = (bytes[i]! << 16) | (bytes[i + 1]! << 8) | bytes[i + 2]!;
        out += ALPHABET[(n >>> 18) & 63]!;
        out += ALPHABET[(n >>> 12) & 63]!;
        out += ALPHABET[(n >>> 6) & 63]!;
        out += ALPHABET[n & 63]!;
        i += 3;
    }

    const rem = bytes.length - i;
    if (rem === 1) {
        const n = bytes[i]!;
        out += ALPHABET[(n >>> 2) & 63]!;
        out += ALPHABET[(n << 4) & 63]!;
        // no padding
    } else if (rem === 2) {
        const n = (bytes[i]! << 8) | bytes[i + 1]!;
        out += ALPHABET[(n >>> 10) & 63]!;
        out += ALPHABET[(n >>> 4) & 63]!;
        out += ALPHABET[(n << 2) & 63]!;
        // no padding
    }

    return out;
}

function decodeChar(c: string): number {
    const idx = ALPHABET.indexOf(c);
    if (idx === -1) throw new Base64UrlError(`Invalid base64url character: ${c}`);
    return idx;
}

export function base64urlDecodeToBytes(s: string): Uint8Array {
    if (s.length === 0) return new Uint8Array(0);

    // Reject padding and non-url alphabet
    if (s.includes("=")) throw new Base64UrlError("Padding is not allowed");
    if (!RE_VALID.test(s)) throw new Base64UrlError("Non-base64url characters present");
    // length mod 4 == 1 is impossible for canonical base64url
    if (s.length % 4 === 1) throw new Base64UrlError("Invalid base64url length");

    const out: number[] = [];
    let i = 0;

    while (i < s.length) {
        const remain = s.length - i;

        if (remain >= 4) {
            const a = decodeChar(s[i]!), b = decodeChar(s[i + 1]!), c = decodeChar(s[i + 2]!), d = decodeChar(s[i + 3]!);
            const n = (a << 18) | (b << 12) | (c << 6) | d;
            out.push((n >>> 16) & 255, (n >>> 8) & 255, n & 255);
            i += 4;
            continue;
        }

        if (remain === 2) {
            const a = decodeChar(s[i]!), b = decodeChar(s[i + 1]!);
            const n = (a << 18) | (b << 12);
            out.push((n >>> 16) & 255);
            i += 2;
            continue;
        }

        if (remain === 3) {
            const a = decodeChar(s[i]!), b = decodeChar(s[i + 1]!), c = decodeChar(s[i + 2]!);
            const n = (a << 18) | (b << 12) | (c << 6);
            out.push((n >>> 16) & 255, (n >>> 8) & 255);
            i += 3;
            continue;
        }

        throw new Base64UrlError("Invalid base64url length");
    }

    const decoded = new Uint8Array(out);
    // Strict canonical check: re-encode must match exactly
    const recoded = base64urlEncodeBytes(decoded);
    if (recoded !== s) throw new Base64UrlError("Non-canonical base64url form");
    return decoded;
}

export function base64urlEncodeUtf8(s: string): string {
    return base64urlEncodeBytes(toUtf8Bytes(s));
}

export function base64urlDecodeToUtf8(s: string): string {
    return fromUtf8Bytes(base64urlDecodeToBytes(s));
}
