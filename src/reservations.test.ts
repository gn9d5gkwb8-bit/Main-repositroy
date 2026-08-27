import { describe, expect, it } from "vitest";
import { createReference, createReservation, parseReservation } from "./reservations.js";

const ids = ["coronation-friday", "velvet-hour"];
const valid = {
  name: "Ada Vance",
  email: "ada@example.com",
  eventId: "velvet-hour",
  guests: 4,
};

describe("parseReservation", () => {
  it("accepts a well-formed request and trims whitespace", () => {
    const result = parseReservation({ ...valid, name: "  Ada Vance  " }, ids);
    expect(result).toEqual({ ok: true, value: { ...valid, name: "Ada Vance" } });
  });

  it("accepts numeric strings from form fields", () => {
    const result = parseReservation({ ...valid, guests: "2" }, ids);
    expect(result.ok && result.value.guests).toBe(2);
  });

  it("rejects a non-object body", () => {
    expect(parseReservation("nope", ids).ok).toBe(false);
    expect(parseReservation(null, ids).ok).toBe(false);
  });

  it("rejects a bad email", () => {
    const result = parseReservation({ ...valid, email: "ada@" }, ids);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors).toContain("Please give a valid email address.");
  });

  it("rejects an unknown event", () => {
    expect(parseReservation({ ...valid, eventId: "ghost" }, ids).ok).toBe(false);
  });

  it("rejects out-of-range or fractional guest counts", () => {
    expect(parseReservation({ ...valid, guests: 0 }, ids).ok).toBe(false);
    expect(parseReservation({ ...valid, guests: 13 }, ids).ok).toBe(false);
    expect(parseReservation({ ...valid, guests: 2.5 }, ids).ok).toBe(false);
  });

  it("collects every problem at once", () => {
    const result = parseReservation({ name: "A", email: "x", guests: 0 }, ids);
    expect(result.ok === false && result.errors).toHaveLength(4);
  });

  it("omits empty notes and keeps real ones", () => {
    const blank = parseReservation({ ...valid, notes: "   " }, ids);
    expect(blank.ok && "notes" in blank.value).toBe(false);
    const kept = parseReservation({ ...valid, notes: "Birthday" }, ids);
    expect(kept.ok && kept.value.notes).toBe("Birthday");
  });

  it("rejects overlong notes", () => {
    const result = parseReservation({ ...valid, notes: "x".repeat(501) }, ids);
    expect(result.ok).toBe(false);
  });
});

describe("createReference", () => {
  it("formats as KC- plus six hex characters", () => {
    expect(createReference(() => 0x4f2a9c)).toBe("KC-4F2A9C");
    expect(createReference(() => 1)).toBe("KC-000001");
    expect(createReference()).toMatch(/^KC-[0-9A-F]{6}$/);
  });
});

describe("createReservation", () => {
  it("stamps a reference and creation time", () => {
    const reservation = createReservation(valid, new Date("2026-08-27T10:00:00Z"));
    expect(reservation.createdAt).toBe("2026-08-27T10:00:00.000Z");
    expect(reservation.reference).toMatch(/^KC-[0-9A-F]{6}$/);
    expect(reservation.name).toBe("Ada Vance");
  });
});
