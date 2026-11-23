import { db } from "@/db";
import { payments, students } from "@/db/schema";
import { INSCRIPTION_FEE, isClassLevel } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student] = await db.select().from(students).where(eq(students.id, Number(id)));
  if (!student) return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  const pays = await db.select().from(payments).where(eq(payments.studentId, Number(id)));
  return NextResponse.json({ student, payments: pays });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const classLevel = String(body.classLevel ?? "");
  const birthDate = String(body.birthDate ?? "");

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 });
  }
  if (!isClassLevel(classLevel)) {
    return NextResponse.json({ error: "Classe invalide" }, { status: 400 });
  }
  if (!birthDate) {
    return NextResponse.json({ error: "Date de naissance requise" }, { status: 400 });
  }

  const [row] = await db
    .update(students)
    .set({
      firstName,
      lastName,
      birthDate,
      classLevel,
      registrationFee: INSCRIPTION_FEE,
      monthlyFee: 0,
    })
    .where(eq(students.id, Number(id)))
    .returning();

  if (!row) return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(payments).where(eq(payments.studentId, Number(id)));
  await db.delete(students).where(eq(students.id, Number(id)));
  return NextResponse.json({ ok: true });
}
