import { pgTable, serial, text, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: date("birth_date"),
  gender: text("gender").default(""),
  classLevel: text("class_level").notNull().default("6e"),
  phone: text("phone").default(""),
  email: text("email").default(""),
  address: text("address").default(""),
  registrationFee: integer("registration_fee").notNull().default(1000),
  monthlyFee: integer("monthly_fee").notNull().default(0),
  enrollmentDate: date("enrollment_date"),
  status: text("status").notNull().default("actif"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'inscription' | 'mensualite'
  amount: integer("amount").notNull(),
  monthLabel: text("month_label"), // ex: "2025-09" pour mensualité
  paidDate: date("paid_date").notNull(),
  method: text("method").default("Espèces"),
  note: text("note").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").default("Inscriptor — Cours d'Informatique"),
  defaultRegistrationFee: integer("default_registration_fee").default(1000),
  defaultMonthlyFee: integer("default_monthly_fee").default(0),
  currency: text("currency").default("FCFA"),
  isPaid: boolean("is_paid").default(false),
});

export type Student = typeof students.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Settings = typeof settings.$inferSelect;
