import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import { createApp } from "./server.js";

const server = createApp();
let origin = "";

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

describe("GET /api/events", () => {
  it("returns upcoming events", async () => {
    const res = await fetch(`${origin}/api/events`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { events: { category: string }[] };
    expect(Array.isArray(body.events)).toBe(true);
  });

  it("filters by category and ignores an unknown one", async () => {
    const live = (await (await fetch(`${origin}/api/events?category=live`)).json()) as {
      events: { category: string }[];
    };
    expect(live.events.every((e) => e.category === "live")).toBe(true);

    const all = (await (await fetch(`${origin}/api/events?category=nonsense`)).json()) as {
      events: unknown[];
    };
    expect(all.events.length).toBeGreaterThanOrEqual(live.events.length);
  });
});

describe("POST /api/reservations", () => {
  it("rejects an invalid booking with 400", async () => {
    const res = await fetch(`${origin}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", email: "nope", guests: 0 }),
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { errors: string[] }).errors.length).toBeGreaterThan(0);
  });

  it("rejects a malformed JSON body with 400", async () => {
    const res = await fetch(`${origin}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    expect(res.status).toBe(400);
  });

  it("accepts a valid booking and returns a reference", async () => {
    const res = await fetch(`${origin}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada Vance",
        email: "ada@example.com",
        eventId: "velvet-hour",
        guests: 4,
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { reference: string };
    expect(body.reference).toMatch(/^KC-[0-9A-F]{6}$/);
  });
});

describe("static files", () => {
  it("serves the home page", async () => {
    const res = await fetch(`${origin}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("Kings Club");
  });

  it("falls back to the home page for an unknown path", async () => {
    const res = await fetch(`${origin}/not-a-page`);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain("Kings Club");
  });

  it("does not serve files outside public/", async () => {
    const res = await fetch(`${origin}/../package.json`, { redirect: "manual" });
    expect(await res.text()).not.toContain("devDependencies");
  });

  it("returns 404 for an unknown API endpoint", async () => {
    expect((await fetch(`${origin}/api/nope`)).status).toBe(404);
  });
});
