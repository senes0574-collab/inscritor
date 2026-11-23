import { db } from "@/db";
import { settings } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function ensureSettings() {
  const rows = await db.select().from(settings);
  if (rows.length === 0) {
    const [row] = await db.insert(settings).values({}).returning();
    return row;
  }
  return rows[0];
}

export async function GET() {
  const row = await ensureSettings();
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const current = await ensureSettings();
  const [row] = await db
    .update(settings)
    .set({
      schoolName: body.schoolName ?? current.schoolName,
      defaultRegistrationFee: Number(body.defaultRegistrationFee ?? current.defaultRegistrationFee),
      defaultMonthlyFee: Number(body.defaultMonthlyFee ?? current.defaultMonthlyFee),
    })
    .returning();
  return NextResponse.json(row);
}
