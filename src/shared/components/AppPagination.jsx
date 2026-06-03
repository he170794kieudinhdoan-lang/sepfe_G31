import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const AppPagination = ({ page, totalPage, onPageChange, className }) => {
  if (totalPage <= 1) return null;

  return (
    <Pagination className={className ?? 'justify-center mt-8'}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page - 1);
            }}
            className={`rounded-xl transition-colors hover:bg-primary/10   ${
              page <= 1 ? 'pointer-events-none opacity-50' : ''
            }`}
          ></PaginationPrevious>
        </PaginationItem>

        {/* Page Numbers */}
        {[...Array(totalPage)].map((_, i) => {
          const pageNumber = i + 1;

          if (
            pageNumber === 1 ||
            pageNumber === totalPage ||
            (pageNumber >= page - 1 && pageNumber <= page + 1)
          ) {
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNumber);
                  }}
                  isActive={page === pageNumber}
                  className={
                    page === pageNumber
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary rounded-xl font-bold transition-all shadow-sm'
                      : 'hover:bg-primary/10  rounded-xl transition-colors border-transparent'
                  }
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          } else if (pageNumber === page - 2 || pageNumber === page + 2) {
            return (
              <PaginationItem key={pageNumber}>
                <span className="px-4 py-2 text-muted-foreground">...</span>
              </PaginationItem>
            );
          }
          return null;
        })}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page + 1);
            }}
            className={`rounded-xl transition-colors hover:bg-primary/10  ${
              page >= totalPage ? 'pointer-events-none opacity-50' : ''
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
