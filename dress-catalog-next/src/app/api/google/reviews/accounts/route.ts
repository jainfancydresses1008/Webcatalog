import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or GOOGLE_REFRESH_TOKEN is missing.",
        },
        { status: 500 },
      );
    }

    // Get a fresh access token using the refresh token.
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
        cache: "no-store",
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google token refresh failed:", tokenData);

      return NextResponse.json(
        {
          error: "Unable to refresh Google access token.",
          details: tokenData,
        },
        { status: 500 },
      );
    }

    const accessToken = tokenData.access_token;

    // List Business Profile accounts available to the
    // Google account that authorized this application.
    const accountsResponse = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    const accountsData = await accountsResponse.json();

    if (!accountsResponse.ok) {
      console.error(
        "Google Business Profile accounts request failed:",
        accountsData,
      );

      return NextResponse.json(
        {
          error: "Unable to retrieve Google Business Profile accounts.",
          details: accountsData,
        },
        { status: accountsResponse.status },
      );
    }

    return NextResponse.json(accountsData);
  } catch (error) {
    console.error("Google Business Profile account error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve Google Business Profile accounts.",
      },
      { status: 500 },
    );
  }
}