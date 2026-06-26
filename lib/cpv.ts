// Diccionario CPV (Common Procurement Vocabulary) → nombre legible.
// Incluye las divisiones (2 dígitos) para cubrir cualquier código, y algunos códigos
// específicos frecuentes en TI/datos. Fallback: división; si no, el propio código.

const DIVISIONS: Record<string, string> = {
  "03": "Agricultura, ganadería y pesca",
  "09": "Petróleo, combustibles y electricidad",
  "14": "Minería y metales",
  "15": "Alimentación y bebidas",
  "18": "Ropa y calzado",
  "22": "Impresos y productos relacionados",
  "24": "Productos químicos",
  "30": "Equipos de oficina e informática",
  "31": "Maquinaria y material eléctrico",
  "32": "Equipos de radio, TV y telecomunicaciones",
  "33": "Equipos médicos y farmacéuticos",
  "34": "Equipos de transporte",
  "35": "Equipos de seguridad y defensa",
  "38": "Equipos de laboratorio y óptica",
  "39": "Mobiliario",
  "42": "Maquinaria industrial",
  "44": "Materiales de construcción",
  "45": "Trabajos de construcción",
  "48": "Software y sistemas de información",
  "50": "Reparación y mantenimiento",
  "51": "Servicios de instalación",
  "55": "Hostelería y restauración",
  "60": "Servicios de transporte",
  "64": "Correos y telecomunicaciones",
  "65": "Servicios públicos (agua, energía)",
  "66": "Servicios financieros y seguros",
  "71": "Arquitectura e ingeniería",
  "72": "Servicios TI: consultoría, desarrollo y soporte",
  "73": "Investigación y desarrollo (I+D)",
  "75": "Servicios de administración pública",
  "79": "Servicios a empresas: derecho, marketing, consultoría",
  "80": "Enseñanza y formación",
  "85": "Salud y asistencia social",
  "90": "Saneamiento y medio ambiente",
  "92": "Ocio, cultura y deporte",
  "98": "Otros servicios",
};

const CODES: Record<string, string> = {
  "72000000": "Servicios TI (consultoría, desarrollo, internet, soporte)",
  "72200000": "Programación de software y consultoría",
  "72300000": "Servicios de datos",
  "72400000": "Servicios de internet",
  "72500000": "Servicios informáticos",
  "72600000": "Soporte y consultoría informática",
  "48000000": "Paquetes de software y sistemas de información",
  "48600000": "Bases de datos y sistemas operativos",
  "48800000": "Sistemas de información y servidores",
  "30200000": "Equipos y material informático",
  "79400000": "Consultoría de negocios y gestión",
};

export function cpvLabel(code: string): string {
  const c = (code || "").trim();
  if (CODES[c]) return `${c} · ${CODES[c]}`;
  const div = DIVISIONS[c.slice(0, 2)];
  return div ? `${c} · ${div}` : c;
}
