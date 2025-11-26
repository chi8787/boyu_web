import fetch from "node-fetch";
import ical from "node-ical";

async function main() {
  const BOOKING_ICAL_URL = '你的.ics連結';

  const res = await fetch(BOOKING_ICAL_URL);
  const text = await res.text();
  const data = await ical.async.parseICS(text);

  const booked = [];

  for (const k in data) {
    const ev = data[k];
    if (ev.type === "VEVENT") {
      let cur = new Date(ev.start);
      const end = new Date(ev.end);

      while (cur < end) {
        booked.push(cur.toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  console.log("BOOKED:", booked);
}

main();
