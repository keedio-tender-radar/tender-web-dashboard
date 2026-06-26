"use client";

import { useEffect, useState } from "react";

import { api, type Profile } from "@/lib/api";

const FIELDS: { key: keyof Profile; label: string; hint: string }[] = [
  { key: "keywords_positive", label: "Keywords positivas", hint: "encaje técnico (suben el score)" },
  { key: "keywords_negative", label: "Keywords negativas", hint: "descartan (bajan el score)" },
  { key: "cpv_preferred", label: "CPV preferidos", hint: "prefijos, p. ej. 72, 48" },
  { key: "cpv_excluded", label: "CPV excluidos", hint: "prefijos o códigos a descartar" },
  { key: "areas", label: "Áreas Keedio", hint: "informativo" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch((e) => setError(String(e)));
  }, []);

  function setField(key: keyof Profile, value: string) {
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
