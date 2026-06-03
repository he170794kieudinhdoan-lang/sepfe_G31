import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Timer,
  Wallet,
  Users,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterPopoverField } from '@/features/jobs/components/FilterPopoverField';
import {
  OccupationSectorPickerPanel,
  findSectorOccupationLabels,
  getOccupationSummary,
} from '@/features/jobs/components/OccupationSectorPickerPanel';
import {
  LocationPickerPanel,
  getLocationSummary,
} from '@/features/jobs/components/LocationPickerPanel';
import {
  useGetProvinces,
  useGetWards,
  useGetSectorsWithOccupations,
} from '@/features/jobs/api/useJobs';

const WORKING_SHIFTS = [
  { value: 'MORNING', label: 'Ca sáng' },
  { value: 'AFTERNOON', label: 'Ca chiều' },
  { value: 'NIGHT', label: 'Ca đêm' },
  { value: 'FULL_DAY', label: 'Cả ngày' },
  { value: 'FLEXIBLE', label: 'Linh hoạt' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const SALARY_RANGES = [
  { value: '', label: 'Tất cả mức lương' },
  { value: 'under7', label: 'Dưới 7 triệu' },
  { value: '7to10', label: '7 – 10 triệu' },
  { value: '10to15', label: '10 – 15 triệu' },
  { value: 'over15', label: 'Trên 15 triệu' },
];

function JobSearchFilterPanelComponent({
  isMobile = false,
  occupationSummary,
  locationSummary,
  appliedSectorId,
  appliedOccupationId,
  appliedProvince,
  appliedProvinceCode,
  appliedDistrict,
  onApplyOccupation,
  onApplyLocation,
  onClearOccupation,
  onClearLocation,
  workingShift,
  onWorkingShiftChange,
  salaryRange,
  onSalaryRangeChange,
  genderRequirement,
  onGenderRequirementChange,
  hasActiveFilters,
  onClearAll,
}) {
  const [occPopoverOpen, setOccPopoverOpen] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);

  const [draftSectorId, setDraftSectorId] = useState(appliedSectorId);
  const [draftOccupationId, setDraftOccupationId] = useState(appliedOccupationId);
  const [draftProvince, setDraftProvince] = useState(appliedProvince);
  const [draftProvinceCode, setDraftProvinceCode] = useState(appliedProvinceCode);
  const [draftDistrict, setDraftDistrict] = useState(appliedDistrict);

  const { data: provincesData } = useGetProvinces();
  const { data: sectorsData = [] } = useGetSectorsWithOccupations();
  const { data: draftCommunesData } = useGetWards(draftProvinceCode);

  const syncOccupationDraftFromApplied = useCallback(() => {
    setDraftSectorId(appliedSectorId);
    setDraftOccupationId(appliedOccupationId);
  }, [appliedSectorId, appliedOccupationId]);

  const syncLocationDraftFromApplied = useCallback(() => {
    setDraftProvince(appliedProvince);
    setDraftProvinceCode(appliedProvinceCode);
    setDraftDistrict(appliedDistrict);
  }, [appliedProvince, appliedProvinceCode, appliedDistrict]);

  useEffect(() => {
    if (occPopoverOpen || locationPopoverOpen) return;
    syncOccupationDraftFromApplied();
    syncLocationDraftFromApplied();
  }, [
    appliedSectorId,
    appliedOccupationId,
    appliedProvince,
    appliedProvinceCode,
    appliedDistrict,
    occPopoverOpen,
    locationPopoverOpen,
    syncOccupationDraftFromApplied,
    syncLocationDraftFromApplied,
  ]);

  const draftOccupationSummary = getOccupationSummary(
    findSectorOccupationLabels(sectorsData, {
      sectorId: draftSectorId,
      occupationId: draftOccupationId,
    }),
  );

  const draftLocationSummary = useMemo(
    () =>
      getLocationSummary({
        provinces: provincesData?.provinces || [],
        communes: draftCommunesData?.communes || [],
        provinceCode: draftProvinceCode,
        province: draftProvince,
        district: draftDistrict,
      }),
    [
      provincesData,
      draftCommunesData,
      draftProvinceCode,
      draftProvince,
      draftDistrict,
    ],
  );

  const handleOccPopoverOpenChange = (open) => {
    if (open) {
      syncOccupationDraftFromApplied();
    } else {
      syncOccupationDraftFromApplied();
    }
    setOccPopoverOpen(open);
  };

  const handleLocationPopoverOpenChange = (open) => {
    if (open) {
      syncLocationDraftFromApplied();
    } else {
      syncLocationDraftFromApplied();
    }
    setLocationPopoverOpen(open);
  };

  const applyOccupationDraft = () => {
    onApplyOccupation({
      sectorId: draftSectorId,
      occupationId: draftOccupationId,
    });
    setOccPopoverOpen(false);
  };

  const cancelOccupationDraft = () => {
    syncOccupationDraftFromApplied();
    setOccPopoverOpen(false);
  };

  const applyLocationDraft = () => {
    onApplyLocation({
      province: draftProvince,
      provinceCode: draftProvinceCode,
      district: draftDistrict,
    });
    setLocationPopoverOpen(false);
  };

  const cancelLocationDraft = () => {
    syncLocationDraftFromApplied();
    setLocationPopoverOpen(false);
  };

  const handleDraftSectorChange = (id) => {
    if (String(draftSectorId) === String(id)) {
      setDraftSectorId('');
      setDraftOccupationId('');
    } else {
      setDraftSectorId(String(id));
      setDraftOccupationId('');
    }
  };

  const handleDraftOccupationChange = (id) => {
    setDraftOccupationId(
      String(draftOccupationId) === String(id) ? '' : String(id),
    );
  };

  const pickerLayout = isMobile ? 'vertical' : 'horizontal';

  return (
    <div className="space-y-5">
      <FilterPopoverField
        icon={Briefcase}
        title="Ngành nghề & Nghề nghiệp"
        value={occupationSummary}
        placeholder="Chọn ngành / nghề"
        onClear={occupationSummary ? onClearOccupation : undefined}
        mobile={isMobile}
        side={isMobile ? 'bottom' : 'right'}
        open={isMobile ? undefined : occPopoverOpen}
        onOpenChange={isMobile ? undefined : handleOccPopoverOpenChange}
        onApply={applyOccupationDraft}
        onCancel={cancelOccupationDraft}
        draftHint={
          draftOccupationSummary
            ? `Đang chọn: ${draftOccupationSummary}`
            : 'Chọn ngành và nghề, sau đó bấm Áp dụng'
        }
      >
        <OccupationSectorPickerPanel
          sectors={sectorsData}
          sectorId={draftSectorId}
          onSectorChange={handleDraftSectorChange}
          occupationId={draftOccupationId}
          onOccupationChange={handleDraftOccupationChange}
          layout={pickerLayout}
          heightClass={isMobile ? undefined : 'h-[320px]'}
        />
      </FilterPopoverField>

      <FilterPopoverField
        icon={MapPin}
        title="Khu vực"
        value={locationSummary}
        placeholder="Chọn tỉnh, phường/xã"
        onClear={locationSummary ? onClearLocation : undefined}
        mobile={isMobile}
        side={isMobile ? 'bottom' : 'right'}
        open={isMobile ? undefined : locationPopoverOpen}
        onOpenChange={isMobile ? undefined : handleLocationPopoverOpenChange}
        onApply={applyLocationDraft}
        onCancel={cancelLocationDraft}
        draftHint={
          draftLocationSummary
            ? `Đang chọn: ${draftLocationSummary}`
            : 'Chọn tỉnh và phường/xã, sau đó bấm Áp dụng'
        }
      >
        <LocationPickerPanel
          provinces={provincesData?.provinces || []}
          communes={draftCommunesData?.communes || []}
          provinceCode={draftProvinceCode}
          province={draftProvince}
          district={draftDistrict}
          onProvinceSelect={(item) => {
            if (!item) {
              setDraftProvince('');
              setDraftProvinceCode('');
              setDraftDistrict('');
              return;
            }
            setDraftProvince(item.normalized);
            setDraftProvinceCode(item.code);
            setDraftDistrict('');
          }}
          onDistrictSelect={(item) => {
            setDraftDistrict(item?.normalized || '');
          }}
          layout={pickerLayout}
          heightClass={isMobile ? undefined : 'h-[320px]'}
        />
      </FilterPopoverField>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Timer className="h-3.5 w-3.5" /> Ca làm việc
        </label>
        <div className="flex flex-wrap gap-2">
          {WORKING_SHIFTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() =>
                onWorkingShiftChange(workingShift === s.value ? '' : s.value)
              }
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                workingShift === s.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-hover hover:bg-primary-muted'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Wallet className="h-3.5 w-3.5" /> Mức lương
        </label>
        <div className="space-y-1.5">
          {SALARY_RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() =>
                onSalaryRangeChange(salaryRange === r.value ? '' : r.value)
              }
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                salaryRange === r.value
                  ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20'
                  : 'text-gray-600 hover:bg-primary-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Users className="h-3.5 w-3.5" /> Giới tính yêu cầu
        </label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g.value || 'all'}
              type="button"
              onClick={() =>
                onGenderRequirementChange(
                  genderRequirement === g.value ? '' : g.value,
                )
              }
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                genderRequirement === g.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-hover hover:bg-primary-muted'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          className="w-full rounded-xl text-sm text-muted-foreground hover:text-destructive"
          onClick={onClearAll}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Xóa tất cả bộ lọc
        </Button>
      ) : null}
    </div>
  );
}

export const JobSearchFilterPanel = memo(JobSearchFilterPanelComponent);
