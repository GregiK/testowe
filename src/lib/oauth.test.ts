import { describe, it, expect } from "vitest";
import {
  isOAuthProvider,
  generateState,
  generatePkcePair,
  buildAuthorizationUrl,
  getProviderLabel,
} from "./oauth";
import { createHash } from "node:crypto";

describe("isOAuthProvider", () => {
  it("akceptuje wyłącznie znanych dostawców", () => {
    expect(isOAuthProvider("google")).toBe(true);
    expect(isOAuthProvider("facebook")).toBe(true);
    expect(isOAuthProvider("twitter")).toBe(false);
    expect(isOAuthProvider("")).toBe(false);
  });
});

describe("generateState", () => {
  it("zwraca losowy, unikalny ciąg za każdym razem", () => {
    const a = generateState();
    const b = generateState();
    expect(a).not.toEqual(b);
    expect(a.length).toBeGreaterThan(20);
  });
});

describe("generatePkcePair", () => {
  it("challenge to poprawny SHA-256(verifier) w base64url (RFC 7636)", () => {
    const { verifier, challenge } = generatePkcePair();
    const expected = createHash("sha256").update(verifier).digest("base64url");
    expect(challenge).toEqual(expected);
  });

  it("generuje różne pary za każdym wywołaniem", () => {
    const a = generatePkcePair();
    const b = generatePkcePair();
    expect(a.verifier).not.toEqual(b.verifier);
  });
});

describe("buildAuthorizationUrl", () => {
  it("dla Google dodaje code_challenge (PKCE)", () => {
    const url = new URL(
      buildAuthorizationUrl("google", {
        clientId: "client123",
        redirectUri: "https://example.pl/api/auth/oauth/google/callback",
        state: "state123",
        codeChallenge: "challenge123",
      }),
    );
    expect(url.searchParams.get("client_id")).toEqual("client123");
    expect(url.searchParams.get("state")).toEqual("state123");
    expect(url.searchParams.get("code_challenge")).toEqual("challenge123");
    expect(url.searchParams.get("code_challenge_method")).toEqual("S256");
  });

  it("dla Facebooka nie dodaje code_challenge (brak PKCE)", () => {
    const url = new URL(
      buildAuthorizationUrl("facebook", {
        clientId: "client123",
        redirectUri: "https://example.pl/api/auth/oauth/facebook/callback",
        state: "state123",
        codeChallenge: "challenge123",
      }),
    );
    expect(url.searchParams.get("code_challenge")).toBeNull();
  });
});

describe("getProviderLabel", () => {
  it("zwraca czytelną nazwę dostawcy", () => {
    expect(getProviderLabel("google")).toEqual("Google");
    expect(getProviderLabel("facebook")).toEqual("Facebook");
  });
});
