"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Pencil, Search, Trash2, X } from "lucide-react";
import {
  CLASS_LABELS,
  CLASSES,
  type ClassLevel,
  INSCRIPTION_FEE,
  calcAge,
  formatDate,
  formatFCFA,
} from "@/lib/utils";

export type StudentRow = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  classLevel: string;
  registrationFee: number;
};

export type PaymentRow = {
  id: number;
  studentId: number;
  type: string;
  amount: number;
};

type FormState = {
  firstName: string;
  lastName: string;
  classLevel: ClassLevel;
  birthDate: string;
  paid: boolean;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  classLevel: "6e",
  birthDate: "",
  paid: true,
};

export function RegisterApp({
  initialStudents,
  initialPayments,
}: {
  initialStudents: StudentRow[];
  initialPayments: PaymentRow[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [payments, setPayments] = useState(initialPayments);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Tous" | ClassLevel>("Tous");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const paidIds = useMemo(() => {
    const ids = new Set<number>();
    for (const payment of payments) {
      if (payment.type === "inscription") ids.add(payment.studentId);
    }
    return ids;
  }, [payments]);

  const refresh = async () => {
    const [studentRes, paymentRes] = await Promise.all([fetch("/api/students"), fetch("/api/payments")]);
    const nextStudents = (await studentRes.json()) as StudentRow[];
    const nextPayments = (await paymentRes.json()) as PaymentRow[];
    setStudents(nextStudents);
    setPayments(nextPayments);
  };

  const filtered = students
    .filter((student) => filter === "Tous" || student.classLevel === filter)
    .filter((student) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return `${student.firstName} ${student.lastName}`.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const classOrder = CLASSES.indexOf(a.classLevel as ClassLevel) - CLASSES.indexOf(b.classLevel as ClassLevel);
      if (classOrder !== 0) return classOrder;
      return a.lastName.localeCompare(b.lastName, "fr") || a.firstName.localeCompare(b.firstName, "fr");
    });

  const paidCount = students.filter((student) => paidIds.has(student.id)).length;
  const waitingCount = students.length - paidCount;

  const syncPayment = async (studentId: number, paid: boolean) => {
    const existing = payments.filter((payment) => payment.studentId === studentId && payment.type === "inscription");
    if (paid && existing.length === 0) {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, type: "inscription", amount: INSCRIPTION_FEE }),
      });
    }
    if (!paid) {
      await Promise.all(existing.map((payment) => fetch(`/api/payments/${payment.id}`, { method: "DELETE" })));
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Indiquez le prénom et le nom.");
      return;
    }
    if (!form.birthDate) {
      setError("Indiquez la date de naissance.");
      return;
    }

    setSaving(true);
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      classLevel: form.classLevel,
      birthDate: form.birthDate,
    };

    const response = await fetch(editingId ? `/api/students/${editingId}` : "/api/students", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await response.json();
    if (!response.ok) {
      setSaving(false);
      setError(saved.error || "Impossible d'enregistrer.");
      return;
    }

    await syncPayment(saved.id, form.paid);
    await refresh();
    setSaving(false);
    setEditingId(null);
    setForm((current) => ({ ...emptyForm, classLevel: current.classLevel, paid: current.paid }));
    showToast(editingId ? "Élève modifié." : `${payload.firstName} ${payload.lastName} est inscrit(e).`);
  };

  const startEdit = (student: StudentRow) => {
    setEditingId(student.id);
    setError("");
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      classLevel: (CLASSES as readonly string[]).includes(student.classLevel) ? (student.classLevel as ClassLevel) : "6e",
      birthDate: student.birthDate || "",
      paid: paidIds.has(student.id),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeStudent = async (id: number) => {
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setPendingDelete(null);
    await refresh();
    showToast("Élève supprimé.");
  };

  const togglePaid = async (student: StudentRow) => {
    await syncPayment(student.id, !paidIds.has(student.id));
    await refresh();
  };

  return (
    <div className="min-h-screen bg-[#f3faf6] text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
            <div>
              <p className="text-sm font-bold text-green-700">Cours d'informatique</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-green-950 sm:text-4xl">Inscriptor</h1>
              <p className="mt-1 text-sm text-slate-500">Registre simple, de la 6e à la 3e</p>
            </div>
          </div>
          <div className="rounded-2xl border border-green-100 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">Inscription</p>
            <p className="text-2xl font-extrabold text-green-800">{formatFCFA(INSCRIPTION_FEE)}</p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Élèves" value={String(students.length)} />
          <Stat label="Payées" value={String(paidCount)} />
          <Stat label="Encaissé" value={formatFCFA(paidCount * INSCRIPTION_FEE)} />
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[340px_1fr]">
          <form onSubmit={onSubmit} className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-green-950">{editingId ? "Modifier l'élève" : "Nouvelle inscription"}</h2>
                <p className="mt-1 text-sm text-slate-500">Seulement les informations utiles.</p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setError("");
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-green-50"
                  aria-label="Annuler la modification"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Prénom</span>
                <input
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  className={inputClass}
                  placeholder="Ex : Awa"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Nom</span>
                <input
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  className={inputClass}
                  placeholder="Ex : Diallo"
                  autoComplete="family-name"
                  required
                />
              </label>
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Classe</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {CLASSES.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, classLevel: level })}
                      className={`rounded-xl border py-3 text-center text-base font-extrabold transition ${
                        form.classLevel === level
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-green-100 bg-green-50 text-green-800 hover:border-green-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-green-700">{CLASS_LABELS[form.classLevel]}</p>
              </div>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Date de naissance</span>
                <input
                  type="date"
                  value={form.birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                  className={inputClass}
                  required
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wide text-green-700">Inscription</span>
                  <span className="text-lg font-extrabold text-green-900">{formatFCFA(INSCRIPTION_FEE)}</span>
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-green-800">
                  <input
                    type="checkbox"
                    checked={form.paid}
                    onChange={(event) => setForm({ ...form, paid: event.target.checked })}
                    className="h-4 w-4 accent-green-600"
                  />
                  Déjà payée
                </span>
              </label>
            </div>

            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Inscrire l'élève"}
            </button>
          </form>

          <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un prénom ou un nom"
                  className="w-full rounded-xl border border-green-100 bg-green-50/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-sm text-slate-500">
                {waitingCount} en attente
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(["Tous", ...CLASSES] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    filter === item ? "bg-green-600 text-white" : "bg-green-50 text-green-800 hover:bg-green-100"
                  }`}
                >
                  {item === "Tous" ? "Toutes les classes" : item}
                </button>
              ))}
            </div>

            <div className="mt-4 divide-y divide-green-50">
              {filtered.map((student) => {
                const paid = paidIds.has(student.id);
                const age = calcAge(student.birthDate);
                return (
                  <article key={student.id} className={`py-4 ${editingId === student.id ? "-mx-2 rounded-2xl bg-green-50/80 px-2" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-600 text-sm font-extrabold text-white">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">{student.classLevel}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {formatDate(student.birthDate)}
                          {age !== null ? ` · ${age} ans` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => togglePaid(student)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                              paid ? "bg-green-100 text-green-800" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {paid ? <Check size={13} /> : null}
                            {paid ? `Payée · ${formatFCFA(INSCRIPTION_FEE)}` : `En attente · ${formatFCFA(INSCRIPTION_FEE)}`}
                          </button>
                          <button type="button" onClick={() => startEdit(student)} className="rounded-lg p-2 text-slate-500 hover:bg-green-50" aria-label={`Modifier ${student.firstName} ${student.lastName}`}>
                            <Pencil size={16} />
                          </button>
                          {pendingDelete === student.id ? (
                            <span className="flex items-center gap-1">
                              <button type="button" onClick={() => removeStudent(student.id)} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white">
                                Confirmer
                              </button>
                              <button type="button" onClick={() => setPendingDelete(null)} className="rounded-lg px-2 py-1.5 text-xs text-slate-500">
                                Annuler
                              </button>
                            </span>
                          ) : (
                            <button type="button" onClick={() => setPendingDelete(student.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Supprimer ${student.firstName} ${student.lastName}`}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-12 text-center text-sm text-slate-400">
                  {students.length === 0 ? "Aucun élève pour le moment. Utilisez le formulaire pour inscrire le premier." : "Aucun élève ne correspond à la recherche."}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white px-3 py-3 shadow-sm sm:px-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-green-950 sm:text-lg">{value}</p>
    </div>
  );
}

const inputClass = "mt-1.5 w-full rounded-xl border border-green-100 bg-green-50/50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500";
