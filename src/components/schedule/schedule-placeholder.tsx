export function SchedulePlaceholder({
  title,
  blurb,
}: {
  title: string;
  blurb: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-[#A0A0A0]">{blurb}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-[#7C3CFF]/25 bg-[#151922]/80 px-4 py-10 text-center text-sm text-[#A0A0A0]">
        Módulo reservado — entra nas próximas fases do MVP.
      </div>
    </div>
  );
}
