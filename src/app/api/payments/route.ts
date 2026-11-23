import { db } from "@/db";
import { payments } from "@/db/schema";
import { INSCRIPTION_FEE } from "@/lib/utils";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(payments).orderBy(desc(payments.paidDate), desc(payments.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.studentId) {
    return NextResponse.json({ error: "Élève requis" }, { status: 400 });
  }

  const [row] = await db
    .insert(payments)
    .values({
      studentId: Number(body.studentId),
      type: "inscription",
      amount: INSCRIPTION_FEE,
      monthLabel: null,
      paidDate: body.paidDate || new Date().toISOString().slice(0, 10),
      method: "Espèces",
      note: "Inscription",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
