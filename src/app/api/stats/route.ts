import { db } from "@/db";
import { students, payments } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const allStudents = await db.select().from(students);
  const allPayments = await db.select().from(payments);

  const totalStudents = allStudents.length;
  const inscriptionPayments = allPayments.filter((p) => p.type === "inscription");
  const monthlyPayments = allPayments.filter((p) => p.type === "mensualite");

  const totalInscription = inscriptionPayments.reduce((s, p) => s + p.amount, 0);
  const totalMonthly = monthlyPayments.reduce((s, p) => s + p.amount, 0);

  // Inscription impayée
  const paidInscriptionIds = new Set(inscriptionPayments.map((p) => p.studentId));
  const unpaidInscription = allStudents.filter((s) => !paidInscriptionIds.has(s.id));
  const unpaidInscriptionAmount = unpaidInscription.reduce((s, st) => s + st.registrationFee, 0);

  // Par classe
  const byClass: Record<string, { count: number; collected: number }> = {};
  for (const s of allStudents) {
    if (!byClass[s.classLevel]) byClass[s.classLevel] = { count: 0, collected: 0 };
    byClass[s.classLevel].count++;
  }
  for (const p of allPayments) {
    const st = allStudents.find((s) => s.id === p.studentId);
    if (st) byClass[st.classLevel].collected += p.amount;
  }

  // Par mois (mensualités)
  const byMonth: Record<string, number> = {};
  for (const p of monthlyPayments) {
    if (!p.monthLabel) continue;
    byMonth[p.monthLabel] = (byMonth[p.monthLabel] ?? 0) + p.amount;
  }
  const months = Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));

  const recent = [...allPayments]
    .sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime() || b.id - a.id)
    .slice(0, 8)
    .map((p) => {
      const st = allStudents.find((s) => s.id === p.studentId);
      return { ...p, studentName: st ? `${st.firstName} ${st.lastName}` : "—", classLevel: st?.classLevel ?? "" };
    });

  return NextResponse.json({
    totalStudents,
    totalInscription,
    totalMonthly,
    totalCollected: totalInscription + totalMonthly,
    unpaidInscriptionCount: unpaidInscription.length,
    unpaidInscriptionAmount,
    byClass,
    months,
    recent,
    unpaidInscription: unpaidInscription.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      classLevel: s.classLevel,
      registrationFee: s.registrationFee,
    })),
  });
}
