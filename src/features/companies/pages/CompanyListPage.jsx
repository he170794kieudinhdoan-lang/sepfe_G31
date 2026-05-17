import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { MOCK_COMPANIES } from '@/shared/data/mockCompanies';
import { MSG } from '@/shared/constants/messages';
import { Search, RotateCcw } from 'lucide-react';
import { CompanyCard } from '../components/CompanyCard';
import { useGetCompanies, useSearchCompanies } from '../api/useGetCompanies';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { AppPagination } from '@/shared/components/AppPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SORT_KEYS = {
  NEWEST: 'newest',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
};

export const sortByMap = {
  [SORT_KEYS.NEWEST]: 'Mới nhất',
  [SORT_KEYS.NAME_ASC]: 'Tên (A → Z)',
  [SORT_KEYS.NAME_DESC]: 'Tên (Z → A)',
};

export const CompanyListPage = () => {
  const [keywordForm, setKeywordForm] = useState('');
  const [sortBy, setSortBy] = useState(SORT_KEYS.NEWEST);
  const [page, setPage] = useState(1);
  const limit = 12;

  //const { data: company, isLoading, isError } = useGetCompanies();

  const debounceKeyword = useDebounce(keywordForm, 500);

  const searchParams = {
    keyword: debounceKeyword || undefined,
    sortBy: sortBy,
    page,
    limit,
  };

  const {
    data: companySearch,
    isLoading: searchLoading,
    isError,
    refetch,
  } = useSearchCompanies(searchParams);

  const totalPage = companySearch?.meta?.totalPage || 1;
  const companies =
    companySearch?.items || companySearch?.data || companySearch || [];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pb-16 pt-4">
      {/* Hero section */}
      <div className="bg-white rounded-[24px] p-6 sm:p-10 mb-8 border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-200/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Khám phá doanh nghiệp
          </h1>
          <p className="text-slate-500 text-[15px] mb-8">
            Tìm hiểu văn hóa và môi trường làm việc từ các nhà tuyển dụng hàng đầu
          </p>

          <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/80 p-2 max-w-xl mx-auto flex items-center transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <div className="relative flex items-center flex-1">
              <Search className="h-5 w-5 text-slate-400 absolute left-4" />
              <Input
                placeholder="Tìm công ty theo tên..."
                value={keywordForm}
                onChange={(e) => {
                  setKeywordForm(e.target.value);
                  setPage(1);
                }}
                className="border-0 shadow-none focus-visible:ring-0 text-[15px] bg-transparent h-12 pl-12 pr-4 font-medium w-full placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-[14px] font-semibold text-slate-500">
          {companies.length > 0 && `Danh sách công ty`}
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-10 rounded-[12px] border-slate-200 bg-white font-medium hover:bg-slate-50 transition-colors">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent className="rounded-[12px] border-slate-100 shadow-xl">
            {Object.entries(sortByMap).map(([key, label]) => (
              <SelectItem key={key} value={key} className="cursor-pointer rounded-lg text-[13px] font-medium">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Đã có lỗi xảy ra
          </h3>
          <p className="text-slate-500 mb-4">Không thể kết nối đến máy chủ.</p>
          <Button
            onClick={() => refetch()}
            variant="default"
            className="rounded-xl px-8 shadow-md shadow-primary/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Thử lại
          </Button>
        </div>
      ) : searchLoading ? (
        // Loading Skeletons
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-52 bg-slate-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        // Empty State
        <div className="py-12">
          <EmptyState
            title={MSG.MSG_COMPANY_NOT_FOUND}
            description="Rất tiếc, không tìm thấy công ty nào phù hợp với từ khóa của bạn."
          />
        </div>
      ) : (
        // Success Render
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>

          {/* Reusable Pagination Component */}
          <AppPagination
            page={page}
            totalPage={totalPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
