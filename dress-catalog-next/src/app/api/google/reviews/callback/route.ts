import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      {
        error: `Google OAuth failed: ${error}`,
      },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        error: "Google authorization code was not provided.",
      },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: "Google OAuth credentials are not configured.",
      },
      { status: 500 },
    );
  }

const redirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/google/reviews/callback";

  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    },
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Google token response:", tokenData);

    return NextResponse.json(
      {
        error: "Unable to exchange Google authorization code.",
        details: tokenData,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message:
      "Google authorization successful. Save the refresh token securely.",
    hasAccessToken: Boolean(tokenData.access_token),
    hasRefreshToken: Boolean(tokenData.refresh_token),
    refreshToken: tokenData.refresh_token ?? null,
  });
}