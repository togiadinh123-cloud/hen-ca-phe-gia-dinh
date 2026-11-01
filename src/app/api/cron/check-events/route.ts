import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { isPollClosed } from "@/lib/time";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  const now = new Date();
  let closedPollsCount = 0;
  let noShowsProcessed = 0;

  // 1. Automatically close polls that passed deadline
  dataStore.events.forEach((event) => {
    if (event.venue_poll_status === "open" && isPollClosed(event.poll_closes_at)) {
      const places = dataStore.places.filter((p) => p.event_id === event.id);
      if (places.length > 0) {
        // Vote count
        const counts = places.map((p) => ({
          place: p,
          count: dataStore.votes.filter((v) => v.place_id === p.id).length,
        }));
        counts.sort((a, b) => b.count - a.count);
        event.venue_poll_status = "closed";
        event.selected_place_id = counts[0].place.id;
        closedPollsCount++;
      }
    }
  });

  return NextResponse.json({
    success: true,
    processedAt: now.toISOString(),
    closedPollsCount,
    noShowsProcessed,
  });
}
