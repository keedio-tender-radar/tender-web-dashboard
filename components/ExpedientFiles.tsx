"use client";

import { useEffect, useRef, useState } from "react";

import { Download, Folder, Trash2, Upload } from "lucide-react";

import { api, type ExpedientFile } from "@/lib/api";
import { toast } from "@/components/Toaster";

const FOLDERS = [
  "00_originales",
  "01_analisis",
  "02_borradores_oferta",
  "03_administrativo",
  "04_tecnico",
  "05_economico",
  "99_presentacion",
];

function fmtSize(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1000) return `${Math.round(n / 1000)} KB`;
  return `${n} B`;
}

export function ExpedientFiles({ tenderId }: { tenderId: string }) {
  const [files, setFiles] = useState<ExpedientFile[]>([]);
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const r = await api.listDocuments(tenderId);
      setFiles(r.files);
      setConfigured(r.configured);
    } catch {
      setFiles([]);
    }
  }
  useEffect(() => {
    load();
  }, [tenderId]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      await api.uploadDocument(tenderId, folder, f);
      toast(`Subido a ${folder}`);
      await load();
    } catch (err) {
      toast(String(err), "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDelete(docId: string) {
    if (!window.confirm("¿Borrar este fichero del expediente?")) return;
    try {
      await api.deleteDocument(tenderId, docId);
      await load();
    } catch (err) {
      toast(String(err), "error");
    }
  }

  const count = (fld: string) => files.filter((f) => f.folder === fld).length;
  const inFolder = files.filter((f) => f.folder === folder);

  return (
    <div className="flex flex-col gap-3">
      {!configured && (
        <p className="text-xs text-amber-400">
          Almacenamiento no configurado — la subida de ficheros no está disponible.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {FOLDERS.map((fld) => {
          const active = folder === fld;
          const n = count(fld);
          return (
            <button
              key={fld}
              onClick={() => setFolder(fld)}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
                active
                  ? "border-brand bg-brand/10 text-white"
                  : "border-[var(--border)] bg-[#0b1020] text-neutral-300 hover:border-brand"
              }`}
            >
              <Folder className="h-3.5 w-3.5 text-neutral-500" /> {fld}
              {n > 0 && (
                <span className="tnum rounded-full bg-brand/20 px-1.5 text-[11px] text-brand">
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-neutral-300">{folder}</p>
        <label
          className={`flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs ${
            configured ? "cursor-pointer hover:border-brand" : "cursor-not-allowed opacity-50"
          }`}
        >
          <Upload className="h-3.5 w-3.5" /> {busy ? "Subiendo…" : "Subir fichero"}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onUpload}
            disabled={busy || !configured}
          />
        </label>
      </div>

      {inFolder.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Carpeta vacía. Sube un fichero, o pulsa «Preparar paquete» para que se rellene sola.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {inFolder.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
            >
              <span className="truncate text-neutral-100">{f.filename}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="tnum text-xs text-neutral-500">{fmtSize(f.size)}</span>
                <a
                  href={api.documentDownloadUrl(tenderId, f.id)}
                  className="text-neutral-400 hover:text-brand"
                  title="Descargar"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => onDelete(f.id)}
                  className="text-neutral-500 hover:text-rose-400"
                  title="Borrar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
