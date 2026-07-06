import Link from "next/link";

export const metadata = { title: "Aviso legal y privacidad · Keedio Tender Radar" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-lg font-semibold text-neutral-100">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-neutral-300">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-7">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Aviso legal y privacidad</h1>
        <p className="mt-1 text-neutral-400">
          Herramienta interna de inteligencia de contratación pública de Keedio.
        </p>
      </div>

      <Section title="Naturaleza y uso">
        <p>
          Keedio Tender Radar es una herramienta de uso <strong>interno</strong> de Keedio para la
          detección, análisis y preparación de ofertas de contratación pública. El acceso está
          restringido al personal autorizado y su contenido es <strong>confidencial</strong>.
        </p>
      </Section>

      <Section title="Confidencialidad">
        <p>
          La plataforma almacena <strong>borradores de oferta, expedientes y decisiones de negocio
          de Keedio</strong> (información competitiva sensible). Queda prohibida su divulgación,
          copia o uso fuera del ámbito autorizado. Los documentos generados incluyen la marca de
          confidencialidad correspondiente.
        </p>
      </Section>

      <Section title="Origen y tratamiento de los datos">
        <p>
          Los datos de licitaciones y adjudicaciones proceden de <strong>fuentes públicas
          oficiales</strong> (PLACSP, TED y portales de contratación autonómicos). Pueden incluir
          nombres de órganos de contratación y de adjudicatarios, que en algunos casos son personas
          físicas (autónomos). Estos datos se tratan con la única finalidad de análisis de mercado
          y decisión de negocio, y no se ceden a terceros.
        </p>
      </Section>

      <Section title="Política de retención">
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Licitaciones, scores, decisiones y expedientes:</strong> se conservan mientras
            tengan valor operativo o histórico para Keedio.
          </li>
          <li>
            <strong>Registros de ejecución (observabilidad):</strong> 90 días.
          </li>
          <li>
            <strong>Instantáneas diarias del radar:</strong> 365 días.
          </li>
          <li>
            <strong>Copias de seguridad:</strong> 30 días de histórico.
          </li>
        </ul>
        <p>La retención se aplica automáticamente; los datos operativos nunca se purgan por edad.</p>
      </Section>

      <Section title="Derechos y contacto">
        <p>
          Para cualquier consulta sobre el tratamiento de datos o para ejercer los derechos que
          correspondan, contacta con el responsable interno de la herramienta en Keedio.
        </p>
      </Section>

      <p className="border-t border-[var(--border)] pt-4 text-xs text-neutral-500">
        <Link href="/" className="hover:text-brand">
          ← Volver al radar
        </Link>
      </p>
    </div>
  );
}
