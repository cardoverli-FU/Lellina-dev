import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Lellina",
    tagline: "Galz for Galz",
    status: "ok",
    time: new Date().toISOString(),
  });
}