"use client";

import type { ComponentPropsWithoutRef } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MermaidBlock } from "@/components/MermaidBlock";

/** Renderiza markdown (con tablas GFM + diagramas Mermaid) con estilo del tema oscuro. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children: code, ...props }: ComponentPropsWithoutRef<"code">) {
            if (/\blanguage-mermaid\b/.test(className || "")) {
              return <MermaidBlock code={String(code).trim()} />;
            }
            return (
              <code className={className} {...props}>
                {code}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
