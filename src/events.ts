export type EventCategory = "club-night" | "live" | "members";

export interface ClubEvent {
  id: string;
  title: string;
  lineup: string[];
  /** Calendar date in `YYYY-MM-DD` form, in the club's local time. */
  date: string;
  doorsOpen: string;
  room: string;
  category: EventCategory;
  ticketsFrom: number;
  soldOut: boolean;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  "club-night": "Club night",
  live: "Live",
  members: "Members only",
};

/**
 * The club's programme. Placeholder listings — replace with the real diary.
 */
export const events: ClubEvent[] = [
  {
    id: "coronation-friday",
    title: "Coronation Fridays",
    lineup: ["Sasha Lume", "Bobby Vale"],
    date: "2026-09-04",
    doorsOpen: "22:00",
    room: "Main Room",
    category: "club-night",
    ticketsFrom: 15,
    soldOut: false,
  },
  {
    id: "velvet-hour",
    title: "The Velvet Hour",
    lineup: ["Nia Okonkwo Trio"],
    date: "2026-09-06",
    doorsOpen: "20:00",
    room: "The Parlour",
    category: "live",
    ticketsFrom: 22,
    soldOut: false,
  },
  {
    id: "crown-social",
    title: "Crown Social",
    lineup: ["Members' reception", "Resident: Theo Marsh"],
    date: "2026-09-11",
    doorsOpen: "19:30",
    room: "The Gallery",
    category: "members",
    ticketsFrom: 0,
    soldOut: false,
  },
  {
    id: "after-dark-xii",
    title: "After Dark XII",
    lineup: ["KLARA", "Dust & Gold", "Mikey Renn"],
    date: "2026-09-19",
    doorsOpen: "23:00",
    room: "Main Room",
    category: "club-night",
    ticketsFrom: 18,
    soldOut: true,
  },
  {
    id: "brass-and-bass",
    title: "Brass & Bass",
    lineup: ["The Regents", "DJ Amara"],
    date: "2026-09-26",
    doorsOpen: "21:00",
    room: "Main Room",
    category: "live",
    ticketsFrom: 20,
    soldOut: false,
  },
  {
    id: "kings-new-year",
    title: "King's New Year",
    lineup: ["Full residency", "Guest TBA"],
    date: "2026-12-31",
    doorsOpen: "21:00",
    room: "Whole venue",
    category: "members",
    ticketsFrom: 60,
    soldOut: false,
  },
];

/** Today's date in `YYYY-MM-DD` form, using the host's local calendar. */
export function toCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Events happening today or later, soonest first. Comparing calendar dates as
 * strings keeps the result stable regardless of the server's timezone.
 */
export function upcomingEvents(all: readonly ClubEvent[], now: Date = new Date()): ClubEvent[] {
  const today = toCalendarDate(now);
  return all.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function filterByCategory(
  all: readonly ClubEvent[],
  category: EventCategory | "all",
): ClubEvent[] {
  return category === "all" ? [...all] : all.filter((event) => event.category === category);
}

export function isEventCategory(value: string): value is EventCategory {
  return Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, value);
}
