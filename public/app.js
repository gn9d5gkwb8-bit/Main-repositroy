const CATEGORY_LABELS = {
  "club-night": "Club night",
  live: "Live",
  members: "Members only",
};

const eventsList = document.getElementById("events");
const eventsStatus = document.getElementById("events-status");
const filters = document.querySelector(".filters");
const nightSelect = document.getElementById("eventId");
const form = document.getElementById("reservation-form");
const formMessage = document.getElementById("form-message");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = document.getElementById("nav-links");

let allEvents = [];
let activeCategory = "all";

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return {
    day: String(day),
    month: date.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString(undefined, { weekday: "long" }),
  };
}

function priceLabel(event) {
  return event.ticketsFrom === 0 ? "Free to members" : `From £${event.ticketsFrom}`;
}

function renderEvents() {
  const shown =
    activeCategory === "all"
      ? allEvents
      : allEvents.filter((event) => event.category === activeCategory);

  eventsList.replaceChildren();

  if (shown.length === 0) {
    eventsStatus.textContent = "Nothing listed in that category yet.";
    return;
  }
  eventsStatus.textContent = "";

  for (const event of shown) {
    const when = formatDate(event.date);
    const item = document.createElement("li");
    item.className = "event";

    const date = document.createElement("div");
    date.className = "event__date";
    date.innerHTML = `<span class="event__day"></span><span class="event__month"></span>`;
    date.querySelector(".event__day").textContent = when.day;
    date.querySelector(".event__month").textContent = when.month;

    const body = document.createElement("div");
    body.className = "event__body";
    const title = document.createElement("h3");
    title.textContent = event.title;
    const lineup = document.createElement("p");
    lineup.className = "event__lineup";
    lineup.textContent = event.lineup.join(" · ");
    const meta = document.createElement("p");
    meta.className = "event__meta";
    const tag = document.createElement("span");
    tag.className = `tag tag--${event.category}`;
    tag.textContent = CATEGORY_LABELS[event.category] ?? event.category;
    const detail = document.createElement("span");
    detail.textContent = `${when.weekday} · Doors ${event.doorsOpen} · ${event.room}`;
    meta.append(tag, detail);
    body.append(title, lineup, meta);

    const action = document.createElement("div");
    action.className = "event__action";
    const price = document.createElement("span");
    price.className = "event__price";
    price.textContent = priceLabel(event);
    action.append(price);

    if (event.soldOut) {
      const soldOut = document.createElement("span");
      soldOut.className = "event__sold-out";
      soldOut.textContent = "Sold out";
      action.append(soldOut);
    } else {
      const book = document.createElement("a");
      book.className = "button button--small button--ghost";
      book.href = "#reserve";
      book.textContent = "Reserve";
      book.addEventListener("click", () => {
        nightSelect.value = event.id;
      });
      action.append(book);
    }

    item.append(date, body, action);
    eventsList.append(item);
  }
}

function fillNightSelect() {
  for (const event of allEvents) {
    if (event.soldOut) continue;
    const option = document.createElement("option");
    option.value = event.id;
    const when = formatDate(event.date);
    option.textContent = `${event.title} — ${when.weekday} ${when.day} ${when.month}`;
    nightSelect.append(option);
  }
}

async function loadEvents() {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    allEvents = Array.isArray(data.events) ? data.events : [];
    fillNightSelect();
    renderEvents();
  } catch {
    eventsStatus.textContent =
      "We couldn't load the programme. Refresh, or call the club on 020 7946 0100.";
  }
}

filters.addEventListener("click", (clickEvent) => {
  const chip = clickEvent.target.closest(".chip");
  if (!chip) return;
  activeCategory = chip.dataset.category;
  for (const button of filters.querySelectorAll(".chip")) {
    button.classList.toggle("is-active", button === chip);
  }
  renderEvents();
});

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", (clickEvent) => {
  if (clickEvent.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

form.addEventListener("submit", async (submitEvent) => {
  submitEvent.preventDefault();
  const submitButton = form.querySelector("button[type=submit]");
  const data = Object.fromEntries(new FormData(form).entries());

  formMessage.className = "form__message";
  formMessage.textContent = "Sending…";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, guests: Number(data.guests) }),
    });
    const result = await response.json();

    if (!response.ok) {
      formMessage.classList.add("is-error");
      formMessage.textContent = (result.errors ?? ["Something went wrong."]).join(" ");
      return;
    }

    formMessage.classList.add("is-success");
    formMessage.textContent = `Table requested — your reference is ${result.reference}. We'll confirm by email.`;
    form.reset();
  } catch {
    formMessage.classList.add("is-error");
    formMessage.textContent = "We couldn't reach the club. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});

loadEvents();
