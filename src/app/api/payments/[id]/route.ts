import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(payments).where(eq(payments.id, Number(id)));
  return NextResponse.json({ ok: true });
}
