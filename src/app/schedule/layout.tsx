import { ScheduleShell } from "@/components/schedule/schedule-shell";

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <ScheduleShell>{children}</ScheduleShell>;
}
