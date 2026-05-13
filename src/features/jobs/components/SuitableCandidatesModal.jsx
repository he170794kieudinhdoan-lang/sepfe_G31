import React, { useState } from 'react';
import { Modal } from '@/shared/components/Overlay/Modal';
import { Input } from '@/shared/components/Form/Input';
import { Button } from '@/shared/components/Button/Button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/Pagination/pagination';
import { Search, Loader2 } from 'lucide-react';
import { useSuitableApplications } from '../api/useJobs';

export const SuitableCandidatesModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const limit = 10;

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useSuitableApplications(
    isOpen ? jobId : null,
    page,
    limit,
    debouncedSearch
  );

  const applications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        onClose();
        setSearch('');
        setDebouncedSearch('');
        setPage(1);
      }}
      title={`Ứng viên phù hợp cho "${jobTitle || 'Tin tuyển dụng'}"`}
      description="Danh sách ứng viên đã ở trạng thái Phù hợp, sẽ được gửi lời mời khi bạn tạo ca phỏng vấn."
      variant="custom"
      contentClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm font-semibold text-slate-800">
            Tổng cộng: <span className="text-primary text-lg">{total}</span> ứng viên
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo tên, email, sđt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Đã có lỗi xảy ra khi tải dữ liệu.
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 border-dashed bg-slate-50 py-12 text-center">
            <p className="text-slate-500">Không tìm thấy ứng viên phù hợp nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {app.user?.avatar ? (
                    <img
                      src={app.user.avatar}
                      alt={app.user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
                      {(app.user?.fullName || 'W').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-semibold text-slate-900">
                    {app.user?.fullName}
                  </h4>
                  <p className="truncate text-sm text-slate-500">
                    {app.user?.email} • {app.user?.phone || 'Chưa có SĐT'}
                  </p>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center pb-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          href="#"
                          isActive={page === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
