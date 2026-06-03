import { useMemo, useState } from 'react';
import { Check, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { normalizeLocationName } from '@/shared/utils/location';

export function LocationPickerPanel({
  provinces = [],
  communes = [],
  provinceCode,
  province,
  district,
  onProvinceSelect,
  onDistrictSelect,
  className,
  heightClass = 'h-[360px]',
  layout = 'horizontal',
}) {
  const [provinceQuery, setProvinceQuery] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');

  const filteredProvinces = useMemo(() => {
    const q = provinceQuery.trim().toLowerCase();
    if (!q) return provinces;
    return provinces.filter((p) => p.name?.toLowerCase().includes(q));
  }, [provinces, provinceQuery]);

  const filteredCommunes = useMemo(() => {
    const q = districtQuery.trim().toLowerCase();
    if (!q) return communes;
    return communes.filter((c) => c.name?.toLowerCase().includes(q));
  }, [communes, districtQuery]);

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
            Tỉnh / Thành phố
          </h4>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={provinceQuery}
              onChange={(e) => setProvinceQuery(e.target.value)}
              placeholder="Tìm tỉnh/thành..."
              className="h-8 pl-8 text-xs rounded-lg border-slate-200"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar min-h-0">
          {filteredProvinces.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              Không tìm thấy tỉnh/thành
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredProvinces.map((item) => {
                const normalized = normalizeLocationName(item.name);
                const selected =
                  provinceCode === item.code || province === normalized;
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={cn(
                      'w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between gap-2',
                      selected
                        ? 'bg-primary-muted text-primary font-semibold'
                        : 'hover:bg-slate-50 text-slate-600',
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (selected) {
                        onProvinceSelect(null);
                      } else {
                        onProvinceSelect({
                          code: item.code,
                          name: item.name,
                          normalized,
                        });
                      }
                      setDistrictQuery('');
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
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
            Phường / Xã
          </h4>
          {provinceCode ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={districtQuery}
                onChange={(e) => setDistrictQuery(e.target.value)}
                placeholder="Tìm phường/xã..."
                className="h-8 pl-8 text-xs rounded-lg border-slate-200 bg-white"
              />
            </div>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar min-h-0">
          {provinceCode ? (
            filteredCommunes.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-400">
                Không tìm thấy phường/xã
              </p>
            ) : (
              <div className="space-y-0.5">
                {filteredCommunes.map((item) => {
                  const normalized = normalizeLocationName(item.name);
                  const selected = district === normalized;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      className={cn(
                        'w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between gap-2',
                        selected
                          ? 'bg-primary-muted text-primary font-semibold'
                          : 'hover:bg-slate-50 text-slate-600',
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onDistrictSelect(
                          selected
                            ? null
                            : { name: item.name, normalized },
                        );
                      }}
                    >
                      <span className="truncate">{item.name}</span>
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                Chọn tỉnh/thành phố trước
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function getLocationSummary({ provinces = [], communes = [], provinceCode, province, district }) {
  if (!province && !district) return '';

  const provinceItem = provinces.find(
    (p) => p.code === provinceCode || normalizeLocationName(p.name) === province,
  );
  const provinceLabel = provinceItem?.name || province;

  if (!district) return provinceLabel;

  const communeItem = communes.find(
    (c) => normalizeLocationName(c.name) === district,
  );
  const districtLabel = communeItem?.name || district;
  return `${districtLabel}, ${provinceLabel}`;
}
