import { NextResponse } from "next/server";
import { fetchHistoricalData, getForecast } from "@/services/forecast.service";

export async function POST(request: Request) {
  try {
    console.log("[Forecast API] Generating 48-hour forecast...");

    // Parse request body (optional: can specify hours of historical data)
    const body = await request.json().catch(() => ({}));
    const hours = body.hours || 24; // Default: 24 hours for optimal ML predictions

    // Step 1: Fetch historical IoT data
    console.log(`[Forecast API] Fetching ${hours} hours of historical data...`);
    const historicalData = await fetchHistoricalData(hours);

    if (historicalData.length === 0) {
      return NextResponse.json(
        {
          error: "Insufficient historical data",
          message: "No IoT data available for forecast generation. Please check data source.",
        },
        { status: 404 }
      );
    }

    console.log(`[Forecast API] Found ${historicalData.length} historical data points`);

    // Validate minimum data requirement (at least 12 hours)
    if (historicalData.length < 12) {
      return NextResponse.json(
        {
          error: "Insufficient historical data",
          message: `Need at least 12 hours of data. Currently have ${historicalData.length} data points.`,
          dataPoints: historicalData.length,
        },
        { status: 400 }
      );
    }

    // Step 2: Call ML API for predictions
    console.log("[Forecast API] Calling ML API for predictions...");
    const forecastResponse = await getForecast(historicalData);

    console.log(`[Forecast API] Received ${forecastResponse.predictions.length} predictions`);

    // Step 3: Return forecast with metadata
    return NextResponse.json({
      success: true,
      predictions: forecastResponse.predictions,
      metadata: {
        generatedAt: new Date().toISOString(),
        historicalDataPoints: historicalData.length,
        historicalDataRange: {
          from: historicalData[0]?.timestamp,
          to: historicalData[historicalData.length - 1]?.timestamp,
        },
        predictionCount: forecastResponse.predictions.length,
      },
    });
  } catch (error) {
    console.error("[Forecast API] Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Google Sheets")) {
        return NextResponse.json(
          {
            error: "Data source error",
            message: "Failed to fetch historical data from Google Sheets",
            details: error.message,
          },
          { status: 500 }
        );
      }

      if (error.message.includes("ML API")) {
        return NextResponse.json(
          {
            error: "ML API error",
            message: "Failed to generate forecast predictions",
            details: error.message,
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to generate forecast",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
