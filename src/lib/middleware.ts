import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}

export function requireAuth(request: NextRequest) {
  const auth = verifyAuth(request);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return auth;
}
