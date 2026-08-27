import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { events, filterByCategory, isEventCategory, upcomingEvents } from "./events.js";
import { createReservation, parseReservation, type Reservation } from "./reservations.js";

const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const MAX_BODY_BYTES = 16 * 1024;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** Reservations taken this process run. Swap for a real store when there is one. */
const reservations: Reservation[] = [];

export function listReservations(): readonly Reservation[] {
  return reservations;
}

/**
 * Maps a request path to a file inside `public/`, or null when the path tries
 * to escape it.
 */
export function resolvePublicPath(urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const relative = normalize(decoded === "/" ? "index.html" : decoded).replace(/^([./\\])+/, "");
  if (relative.split(/[/\\]/).includes("..")) {
    return null;
  }
  const resolved = join(PUBLIC_DIR, relative);
  return resolved.startsWith(PUBLIC_DIR.replace(/[/\\]$/, "") + sep) ? resolved : null;
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function createApp(): Server {
  return createServer((req, res) => {
    void handle(req, res).catch(() => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: "Something went wrong." });
      }
    });

    async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
      const url = new URL(request.url ?? "/", "http://localhost");

      if (url.pathname === "/api/events" && request.method === "GET") {
        const requested = url.searchParams.get("category") ?? "all";
        const category = requested === "all" || isEventCategory(requested) ? requested : "all";
        sendJson(response, 200, {
          events: filterByCategory(upcomingEvents(events), category),
        });
        return;
      }

      if (url.pathname === "/api/reservations" && request.method === "POST") {
        let payload: unknown;
        try {
          payload = JSON.parse(await readBody(request));
        } catch {
          sendJson(response, 400, { errors: ["Could not read the request."] });
          return;
        }
        const parsed = parseReservation(
          payload,
          events.map((event) => event.id),
        );
        if (!parsed.ok) {
          sendJson(response, 400, { errors: parsed.errors });
          return;
        }
        const reservation = createReservation(parsed.value);
        reservations.push(reservation);
        sendJson(response, 201, {
          reference: reservation.reference,
          eventId: reservation.eventId,
        });
        return;
      }

      if (url.pathname.startsWith("/api/")) {
        sendJson(response, 404, { error: "Unknown endpoint." });
        return;
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
      }

      const filePath = resolvePublicPath(url.pathname);
      if (!filePath) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      try {
        const file = await readFile(filePath);
        response.writeHead(200, {
          "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
        });
        response.end(request.method === "HEAD" ? undefined : file);
      } catch {
        const fallback = await readFile(join(PUBLIC_DIR, "index.html"));
        response.writeHead(404, { "Content-Type": MIME_TYPES[".html"] });
        response.end(request.method === "HEAD" ? undefined : fallback);
      }
    }
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": MIME_TYPES[".json"],
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function startServer(port = Number(process.env.PORT ?? 3000)): Server {
  const server = createApp();
  server.listen(port, () => {
    console.log(`Kings Club running at http://localhost:${port}`);
  });
  return server;
}
