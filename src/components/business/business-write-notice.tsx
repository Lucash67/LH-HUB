interface BusinessWriteNoticeProps {
  message: string;
}

export function BusinessWriteNotice({ message }: BusinessWriteNoticeProps) {
  return (
    <div className="rounded-xl border border-[#7C3CFF]/30 bg-gradient-to-r from-[#7C3CFF]/10 to-[#0CD4FF]/5 px-4 py-3 text-sm text-text-secondary">
      {message}
    </div>
  );
}
