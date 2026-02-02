import { useChurchSettings } from '@/contexts/ChurchSettingsContext';

export function ReportFooter() {
  const { settings } = useChurchSettings();
  const { churchInfo } = settings;

  return (
    <div className="report-footer mt-8 border-t pt-4 text-center text-xs text-muted-foreground print:fixed print:bottom-0 print:left-0 print:right-0 print:bg-white print:py-4">
      <p className="font-medium">{churchInfo.name}</p>
      <p>{churchInfo.address}</p>
      <p className="mt-2">
        This is an official financial document. For inquiries, contact: {churchInfo.email}
      </p>
      <p className="mt-1">Page 1 of 1</p>
    </div>
  );
}
