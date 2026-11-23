import { db } from "@/db";
import { payments, students } from "@/db/schema";
import { RegisterApp, type PaymentRow, type StudentRow } from "@/components/register";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [studentRows, paymentRows] = await Promise.all([
    db.select().from(students).orderBy(asc(students.lastName), asc(students.firstName)),
    db.select().from(payments),
  ]);

  const initialStudents: StudentRow[] = studentRows.map((student) => ({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    birthDate: student.birthDate,
    classLevel: student.classLevel,
    registrationFee: student.registrationFee,
  }));

  const initialPayments: PaymentRow[] = paymentRows
    .filter((payment) => payment.type === "inscription")
    .map((payment) => ({
      id: payment.id,
      studentId: payment.studentId,
      type: payment.type,
      amount: payment.amount,
    }));

  return <RegisterApp initialStudents={initialStudents} initialPayments={initialPayments} />;
}
