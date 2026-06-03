import { useMemo, useState } from 'react';
import { Briefcase, Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function OccupationSectorPickerPanel({
  sectors = [],
  sectorId,
  onSectorChange,
  occupationId,
  onOccupationChange,
  className,
  heightClass = 'h-[360px]',
  layout = 'horizontal',
}) {
  const [sectorQuery, setSectorQuery] = useState('');
  const [occupationQuery, setOccupationQuery] = useState('');

  const selectedSector = sectors.find((s) => String(s.id) === String(sectorId));
  const occupations = selectedSector?.occupations || [];

  const filteredSectors = useMemo(() => {
    const q = sectorQuery.trim().toLowerCase();
    if (!q) return sectors;
    return sectors.filter((s) => s.name?.toLowerCase().includes(q));
  }, [sectors, sectorQuery]);

  const filteredOccupations = useMemo(() => {
    const q = occupationQuery.trim().toLowerCase();
    if (!q) return occupations;
    return occupations.filter((o) => o.name?.toLowerCase().includes(q));
  }, [occupations, occupationQuery]);

  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={cn(
        'flex bg-white',
        isHorizontal ? heightClass : 'flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'flex flex-col',
          isHorizontal ? 'w-[55%] border-r border-slate-100' : 'border-b border-slate-100',
          isHorizontal ? '' : 'h-[220px]',
        )}
      >
        <div className="px-3 py-2 border-b border-slate-50 space-y-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Ngành nghề
          </h4>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={sectorQuery}
              onChange={(e) => setSectorQuery(e.target.value)}
              placeholder="Tìm ngành nghề..."
              className="h-8 pl-8 text-xs rounded-lg border-slate-200"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar min-h-0">
          {filteredSectors.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              {sectors.length === 0
                ? 'Chưa có dữ liệu ngành nghề'
                : 'Không tìm thấy ngành nghề'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredSectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  className={cn(
                    'w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between gap-2',
                    String(sectorId) === String(sector.id)
                      ? 'bg-primary-muted text-primary font-semibold'
                      : 'hover:bg-slate-50 text-slate-600',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSectorChange(sector.id);
                    setOccupationQuery('');
                  }}
                >
                  <span className="truncate">{sector.name}</span>
                  {String(sectorId) === String(sector.id) && (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex flex-col bg-slate-50/30',
          isHorizontal ? 'w-[45%]' : 'h-[220px]',
        )}
      >
        <div className="px-3 py-2 border-b border-slate-100 space-y-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Nghề nghiệp
          </h4>
          {sectorId ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={occupationQuery}
                onChange={(e) => setOccupationQuery(e.target.value)}
                placeholder="Tìm nghề nghiệp..."
                className="h-8 pl-8 text-xs rounded-lg border-slate-200 bg-white"
              />
            </div>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar min-h-0">
          {sectorId ? (
            filteredOccupations.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-400">
                {occupations.length === 0
                  ? 'Ngành này chưa có nghề nghiệp'
                  : 'Không tìm thấy nghề nghiệp'}
              </p>
            ) : (
              <div className="space-y-0.5">
                {filteredOccupations.map((occupation) => (
                  <button
                    key={occupation.id}
                    type="button"
                    className={cn(
                      'w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between gap-2',
                      String(occupationId) === String(occupation.id)
                        ? 'bg-primary-muted text-primary font-semibold'
                        : 'hover:bg-slate-50 text-slate-600',
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onOccupationChange(occupation.id)}
                  >
                    <span className="truncate">{occupation.name}</span>
                    {String(occupationId) === String(occupation.id) && (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Briefcase className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                Chọn ngành nghề trước
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function findSectorOccupationLabels(sectors, { sectorId, occupationId }) {
  let sectorName = '';
  let occupationName = '';
  if (!sectors?.length) return { sectorName, occupationName };

  const sector = sectors.find((s) => String(s.id) === String(sectorId));
  if (sector) {
    sectorName = sector.name;
    const occupation = sector.occupations?.find(
      (o) => String(o.id) === String(occupationId),
    );
    if (occupation) occupationName = occupation.name;
  } else if (occupationId) {
    for (const s of sectors) {
      const occupation = s.occupations?.find(
        (o) => String(o.id) === String(occupationId),
      );
      if (occupation) {
        sectorName = s.name;
        occupationName = occupation.name;
        break;
      }
    }
  }
  return { sectorName, occupationName };
}

export function getOccupationSummary({ sectorName, occupationName }) {
  if (occupationName) {
    return sectorName ? `${occupationName} · ${sectorName}` : occupationName;
  }
  return sectorName || '';
}
