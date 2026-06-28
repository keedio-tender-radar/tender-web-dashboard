"use client";

import { useEffect, useState } from "react";

import { api, type Profile } from "@/lib/api";

type ListKey =
  | "keywords_positive"
  | "keywords_negative"
  | "cpv_preferred"
  | "cpv_excluded"
  | "areas"
  | "team";

const FIELDS: { key: ListKey; label: string; hint: string }[] = [
  { key: "keywords_positive", label: "Keywords positivas", hint: "encaje técnico (suben el score)" },
  { key: "keywords_negative", label: "Keywords negativas", hint: "descartan (bajan el score)" },
  { key: "cpv_preferred", label: "CPV preferidos", hint: "prefijos, p. ej. 72, 48" },
  { key: "cpv_excluded", label: "CPV excluidos", hint: "prefijos o códigos a descartar" },
  { key: "areas", label: "Áreas Keedio", hint: "informativo" },
  { key: "team", label: "Equipo propuesto", hint: "roles para el organigrama de la oferta" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch((e) => setError(String(e)));
  }, []);

  function setField(key: ListKey, value: string) {
    if (!profile) return;
    setProfile({ ...profile, [key]: value.split(",").map((s) => s.trim()).filter(Boolean) });
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      setProfile(await api.updateProfile(profile));
      setMsg("Perfil guardado. Se aplica en la próxima ingesta/análisis (sin redeploy).");
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Perfil Keedio</h1>
        <p className="text-neutral-400">
          Ajusta keywords y CPV que guían el filtrado y el scoring. Sin redeploy: la ingesta y el
          análisis leen este perfil en cada ejecución.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}
      {msg && <p className="rounded-lg bg-green-950 p-3 text-sm text-green-200">{msg}</p>}

      {!profile ? (
        <p className="text-neutral-500">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                {f.label} <span className="text-neutral-500">— {f.hint}</span>
              </label>
              <textarea
                value={profile[f.key].join(", ")}
                onChange={(e) => setField(f.key, e.target.value)}
                rows={2}
                className="rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Duración del proyecto (meses){" "}
              <span className="text-neutral-500">— para el cronograma de la oferta</span>
            </label>
            <input
              type="number"
              min={1}
              max={36}
              value={profile.project_months}
              onChange={(e) =>
                setProfile({ ...profile, project_months: Number(e.target.value) || 1 })
              }
              className="w-32 rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Coste por hora (€){" "}
                <span className="text-neutral-500">— estimación del plan</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={profile.hourly_rate}
                onChange={(e) =>
                  setProfile({ ...profile, hourly_rate: Number(e.target.value) || 1 })
                }
                className="w-32 rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Margen comercial{" "}
                <span className="text-neutral-500">— 0–1 (0.2 = 20%)</span>
              </label>
              <input
                type="number"
                min={0}
                max={0.9}
                step={0.05}
                value={profile.margin}
                onChange={(e) => setProfile({ ...profile, margin: Number(e.target.value) || 0 })}
                className="w-32 rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="self-start rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar perfil"}
          </button>
        </div>
      )}
    </section>
  );
}
