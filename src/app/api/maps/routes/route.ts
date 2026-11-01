import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, travelMode = "DRIVE" } = await req.json();

    if (!origin || !destination) {
      return NextResponse.json({ error: "Thiếu điểm xuất phát hoặc điểm đến" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;

    if (!apiKey) {
      // Return clear configuration state per prompt
      return NextResponse.json({
        configured: false,
        message: "GOOGLE_MAPS_SERVER_API_KEY chưa được cấu hình. Trả về khoảng cách ước tính.",
        distanceMeters: 850,
        durationSeconds: 300,
        formattedDuration: "5 phút",
      });
    }

    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode,
        routingPreference: travelMode === "DRIVE" ? "TRAFFIC_AWARE" : undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Routes API error" }, { status: response.status });
    }

    const route = data.routes?.[0];
    if (!route) {
      return NextResponse.json({ error: "Không tìm thấy tuyến đường phù hợp" }, { status: 404 });
    }

    const durationSeconds = parseInt(route.duration?.replace("s", "") || "0", 10);
    const distanceMeters = route.distanceMeters || 0;
    const minutes = Math.round(durationSeconds / 60);

    return NextResponse.json({
      configured: true,
      distanceMeters,
      durationSeconds,
      formattedDuration: `${minutes} phút`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to compute route" }, { status: 500 });
  }
}
