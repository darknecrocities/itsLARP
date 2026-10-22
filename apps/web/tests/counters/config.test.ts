import { describe, it, expect } from "vitest";
import { isCountersConfigured, isCounterId, type FirebaseWebConfig } from "@/lib/counters/config";

describe("counters config", () => {
  it("validates when all required fields are present", () => {
    const valid: FirebaseWebConfig = {
      apiKey: "AIzaSyFakeKey123456789",
      authDomain: "itslarp-counter.firebaseapp.com",
      projectId: "itslarp-counter",
      storageBucket: "itslarp-counter.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef",
    };
    expect(isCountersConfigured(valid)).toBe(true);
  });

  it("fails closed when apiKey is empty", () => {
    const invalid: FirebaseWebConfig = {
      apiKey: "",
      authDomain: "",
      projectId: "itslarp-counter",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    };
    expect(isCountersConfigured(invalid)).toBe(false);
  });

  it("fails closed when projectId does not match GCP pattern", () => {
    const invalid: FirebaseWebConfig = {
      apiKey: "AIzaSyFakeKey123456789",
      authDomain: "",
      projectId: "BAD_ID",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    };
    expect(isCountersConfigured(invalid)).toBe(false);
  });

  it("recognizes valid counter IDs", () => {
    expect(isCounterId("visits")).toBe(true);
    expect(isCounterId("downloads")).toBe(true);
    expect(isCounterId("unknown")).toBe(false);
    expect(isCounterId(null)).toBe(false);
  });
});
