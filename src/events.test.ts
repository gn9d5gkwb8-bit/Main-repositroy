import { describe, expect, it } from "vitest";
import {
  events,
  filterByCategory,
  isEventCategory,
  toCalendarDate,
  upcomingEvents,
  type ClubEvent,
} from "./events.js";

function makeEvent(id: string, date: string, over: Partial<ClubEvent> = {}) {
  return {
    id,
    title: id,
    lineup: [],
    date,
    doorsOpen: "22:00",
    room: "Main Room",
    category: "club-night",
    ticketsFrom: 10,
    soldOut: false,
    ...over,
  } satisfies ClubEvent;
}

describe("toCalendarDate", () => {
  it("pads month and day", () => {
    expect(toCalendarDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("upcomingEvents", () => {
  const sample = [
    makeEvent("later", "2026-09-20"),
    makeEvent("past", "2026-08-01"),
    makeEvent("soon", "2026-09-04"),
  ];

  it("drops past events and sorts the rest soonest first", () => {
    const result = upcomingEvents(sample, new Date(2026, 8, 1));
    expect(result.map((e) => e.id)).toEqual(["soon", "later"]);
  });

  it("keeps an event happening today", () => {
    const result = upcomingEvents(sample, new Date(2026, 8, 4));
    expect(result.map((e) => e.id)).toContain("soon");
  });

  it("does not mutate the input", () => {
    const input = [...sample];
    upcomingEvents(input, new Date(2026, 8, 1));
    expect(input.map((e) => e.id)).toEqual(sample.map((e) => e.id));
  });
});

describe("filterByCategory", () => {
  it("returns every event for 'all'", () => {
    expect(filterByCategory(events, "all")).toHaveLength(events.length);
  });

  it("narrows to one category", () => {
    const live = filterByCategory(events, "live");
    expect(live.length).toBeGreaterThan(0);
    expect(live.every((e) => e.category === "live")).toBe(true);
  });
});

describe("isEventCategory", () => {
  it("accepts known categories and rejects others", () => {
    expect(isEventCategory("members")).toBe(true);
    expect(isEventCategory("karaoke")).toBe(false);
    expect(isEventCategory("toString")).toBe(false);
  });
});

describe("the programme", () => {
  it("has unique event ids", () => {
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
  });
});
