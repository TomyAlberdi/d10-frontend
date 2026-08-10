import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface StockLogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const StockLogPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: StockLogPaginationProps) => {
  const isFirst = page <= 0 || disabled;
  const isLast = page >= totalPages - 1 || disabled;

  return (
    <Pagination className="mt-auto shrink-0 py-2 border-t">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isFirst) onPageChange(page - 1);
            }}
            aria-disabled={isFirst}
            className={
              isFirst ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
            text=""
          />
        </PaginationItem>
        <PaginationItem>
          <span className="text-sm">
            {page + 1} de {totalPages || 1}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isLast) onPageChange(page + 1);
            }}
            aria-disabled={isLast}
            className={
              isLast ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
            text=""
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default StockLogPagination;
