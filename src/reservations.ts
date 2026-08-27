export interface ReservationRequest {
  name: string;
  email: string;
  eventId: string;
  guests: number;
  notes?: string;
}

export interface Reservation extends ReservationRequest {
  reference: string;
  createdAt: string;
}

export type ParseResult = { ok: true; value: ReservationRequest } | { ok: false; errors: string[] };

const MAX_GUESTS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates an untrusted reservation payload from the booking form.
 */
export function parseReservation(input: unknown, knownEventIds: readonly string[]): ParseResult {
  const errors: string[] = [];
  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const body = input as Record<string, unknown>;
  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const eventId = asTrimmedString(body.eventId);
  const notes = asTrimmedString(body.notes);
  const guests = Number(body.guests);

  if (name.length < 2) {
    errors.push("Please give the name the table is under.");
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.push("Please give a valid email address.");
  }
  if (!knownEventIds.includes(eventId)) {
    errors.push("Please choose one of the listed events.");
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    errors.push(`Guests must be a whole number between 1 and ${MAX_GUESTS}.`);
  }
  if (notes.length > 500) {
    errors.push("Notes must be 500 characters or fewer.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: { name, email, eventId, guests, ...(notes ? { notes } : {}) },
  };
}

/** Human-readable booking reference, e.g. `KC-4F2A9C`. */
export function createReference(
  randomInt: () => number = () => Math.floor(Math.random() * 0xffffff),
): string {
  const suffix = (randomInt() & 0xffffff).toString(16).toUpperCase();
  return `KC-${suffix.padStart(6, "0")}`;
}

export function createReservation(
  request: ReservationRequest,
  now: Date = new Date(),
): Reservation {
  return {
    ...request,
    reference: createReference(),
    createdAt: now.toISOString(),
  };
}
