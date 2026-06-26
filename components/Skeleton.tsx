// Skeletons de carga (sustituyen el texto "Cargando…").

export function SkeletonCard() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-6 w-12" />
      </div>
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton mt-2 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}
