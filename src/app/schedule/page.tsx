import { SCHEDULE_COPY } from "@/constants/schedule-brand";

export default function ScheduleHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C3CFF]">
          Início
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {SCHEDULE_COPY.homeHint}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
          Fundação do OMNI Schedule pronta. Os indicadores do dia entram nas próximas
          entregas — Business permanece intacto.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Agendamentos hoje", value: "—" },
          { label: "Valor previsto", value: "—" },
          { label: "Próximo atendimento", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#7C3CFF]/20 bg-[#1a1c24] p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A0A0A0]">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-[#7C3CFF]/25 bg-[#1a1c24]/60 px-4 py-6 text-sm text-[#A0A0A0]">
        Próximo: organização → serviços → equipe → horários → agenda → booking público.
      </div>
    </div>
  );
}
