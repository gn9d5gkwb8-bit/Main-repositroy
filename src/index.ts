import { startServer } from "./server.js";

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { startServer } from "./server.js";
export { events, upcomingEvents } from "./events.js";
