import { db } from "@/db";
import { payments, students } from "@/db/schema";
import { INSCRIPTION_FEE } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const demo = [
  { firstName: "Awa", lastName: "Diallo", birthDate: "2014-03-14", classLevel: "6e", paid: true },
  { firstName: "Moussa", lastName: "Ndiaye", birthDate: "2014-07-22", classLevel: "6e", paid: true },
  { firstName: "Fatou", lastName: "Sow", birthDate: "2014-11-05", classLevel: "6e", paid: false },
  { firstName: "Ibrahima", lastName: "Ba", birthDate: "2013-01-30", classLevel: "5e", paid: true },
  { firstName: "Mariama", lastName: "Kane", birthDate: "2013-05-18", classLevel: "5e", paid: true },
  { firstName: "Cheikh", lastName: "Fall", birthDate: "2013-09-09", classLevel: "5e", paid: false },
  { firstName: "Ndeye", lastName: "Gueye", birthDate: "2012-02-25", classLevel: "4e", paid: true },
  { firstName: "Abdoulaye", lastName: "Sy", birthDate: "2012-12-01", classLevel: "4e", paid: true },
  { firstName: "Khady", lastName: "Diop", birthDate: "2011-08-17", classLevel: "3e", paid: true },
  { firstName: "Ousmane", lastName: "Mbaye", birthDate: "2011-04-11", classLevel: "3e", paid: false },
  { firstName: "Aminata", lastName: "Touré", birthDate: "2011-10-28", classLevel: "3e", paid: true },
];

export async function POST() {
  const existing = await db.select().from(students);
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, seeded: false, count: existing.length });
  }

  for (const item of demo) {
    const [row] = await db
      .insert(students)
      .values({
        firstName: item.firstName,
        lastName: item.lastName,
        birthDate: item.birthDate,
        classLevel: item.classLevel,
        registrationFee: INSCRIPTION_FEE,
        monthlyFee: 0,
        enrollmentDate: "2026-09-08",
        status: "actif",
      })
      .returning();

    if (item.paid) {
      await db.insert(payments).values({
        studentId: row.id,
        type: "inscription",
        amount: INSCRIPTION_FEE,
        paidDate: "2026-09-08",
        method: "Espèces",
        note: "Inscription",
      });
    }
  }

  return NextResponse.json({ ok: true, seeded: true, count: demo.length });
}
