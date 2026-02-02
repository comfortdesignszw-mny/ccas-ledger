import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

interface ReportLetterheadProps {
  reportTitle: string;
  reportPeriod: string;
  generatedDate: string;
}

export function ReportLetterhead({ reportTitle, reportPeriod, generatedDate }: ReportLetterheadProps) {
  const { settings, getCurrency } = useChurchSettings();
  const { churchInfo } = settings;
  const currency = getCurrency();

  return (
    <div className="report-letterhead border-b-2 border-primary pb-6 mb-6">
      {/* Church Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{churchInfo.name}</h1>
            {churchInfo.motto && (
              <p className="text-sm italic text-muted-foreground">{churchInfo.motto}</p>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div className="flex items-center justify-end gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{churchInfo.address}</span>
          </div>
          {churchInfo.phone && (
            <div className="flex items-center justify-end gap-2 mt-1">
              <Phone className="h-3.5 w-3.5" />
              <span>{churchInfo.phone}</span>
            </div>
          )}
          {churchInfo.email && (
            <div className="flex items-center justify-end gap-2 mt-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{churchInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Report Title Section */}
      <div className="mt-6 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{reportTitle}</h2>
            <p className="text-sm text-muted-foreground">Period: {reportPeriod}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Generated: {generatedDate}</p>
            <p className="text-muted-foreground">Currency: {currency.name} ({currency.symbol})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
