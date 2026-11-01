import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ places: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;

  if (!apiKey) {
    // If credentials are not configured, return clear state according to Master Prompt Section 1.1 & 11.1
    return NextResponse.json({
      configured: false,
      message: "GOOGLE_MAPS_SERVER_API_KEY chưa được cấu hình trong .env.local",
      places: [
        {
          google_place_id: "demo_place_1",
          place_name: `${query} (Demo Place 1)`,
          formatted_address: "123 Đường Mẫu, Quận 1, TP. Hồ Chí Minh",
          latitude: 10.7743,
          longitude: 106.7048,
          is_demo: true,
        },
      ],
    });
  }

  try {
    // Call Google Places API (New) Text Search
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery: `${query} cà phê`,
        languageCode: "vi",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Places API error" }, { status: response.status });
    }

    const places = (data.places || []).map((p: any) => ({
      google_place_id: p.id,
      place_name: p.displayName?.text || "",
      formatted_address: p.formattedAddress || "",
      latitude: p.location?.latitude || 0,
      longitude: p.location?.longitude || 0,
      google_maps_uri: p.googleMapsUri || null,
    }));

    return NextResponse.json({ configured: true, places });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch places" }, { status: 500 });
  }
}
