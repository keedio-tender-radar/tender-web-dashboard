"use client";

import { useEffect, useRef, useState } from "react";

import mermaid from "mermaid";

let initialized = false;

/** Renderiza un diagrama Mermaid a SVG en el navegador. Si la sintaxis falla, muestra el código. */
export function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
      initialized = true;
    }
    let cancelled = false;
    mermaid
      .render(idRef.current, code)
      .then(({ svg }) => !cancelled && setSvg(svg))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (failed) {
    return (
      <pre className="my-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[#0b1020] p-3 text-xs text-neutral-400">
        {code}
      </pre>
    );
  }
  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-lg border border-[var(--border)] bg-[#0b1020] p-3"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
