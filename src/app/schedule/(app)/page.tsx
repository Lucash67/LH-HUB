export default function ScheduleHomePage() {
  return (
    <div className="space-y-4">
      <p className="max-w-xl text-sm text-[#A0A0A0]">
        Central operacional do dia. Indicadores reais entram depois do catálogo e da
        agenda.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Agendamentos hoje", value: "—" },
          { label: "Valor previsto", value: "—" },
          { label: "Próximo atendimento", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-[#151922] p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A0A0A0]">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
