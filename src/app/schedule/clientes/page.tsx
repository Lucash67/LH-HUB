function PlaceholderModule({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">{blurb}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-[#7C3CFF]/25 bg-[#1a1c24]/60 px-4 py-10 text-center text-sm text-[#A0A0A0]">
        Módulo reservado — implementação na próxima fase do MVP.
      </div>
    </div>
  );
}

export default function ScheduleClientesPage() {
  return (
    <PlaceholderModule
      title="Clientes"
      blurb="Clientes da organização (nome, WhatsApp, histórico de atendimentos)."
    />
  );
}
