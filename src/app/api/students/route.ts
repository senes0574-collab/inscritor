import { db } from "@/db";
import { students } from "@/db/schema";
import { INSCRIPTION_FEE, isClassLevel } from "@/lib/utils";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(students)
    .orderBy(asc(students.classLevel), asc(students.lastName), asc(students.firstName));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
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
    .insert(students)
    .values({
      firstName,
      lastName,
      birthDate,
      classLevel,
      registrationFee: INSCRIPTION_FEE,
      monthlyFee: 0,
      enrollmentDate: new Date().toISOString().slice(0, 10),
      status: "actif",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
