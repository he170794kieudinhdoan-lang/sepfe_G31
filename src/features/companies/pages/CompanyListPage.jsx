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
    <>
      <h1 className="text-2xl font-bold mb-6">Danh sách công ty</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên công ty"
            value={keywordForm}
            onChange={(e) => {
              setKeywordForm(e.target.value);
              setPage(1);
            }}
            className="pl-9 rounded-xl bg-white shadow-sm"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-10! border-gray-200 bg-white focus:bg-gray transition-colors">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortByMap).map(([key, lable]) => (
              <SelectItem key={key} value={key} className="cursor-pointer">
                {lable}
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
    </>
  );
};
