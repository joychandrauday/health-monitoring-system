import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const TablePagination = ({ totalPage }: { totalPage: number }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const pathname = usePathname();

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      router.push(`${pathname}?page=${currentPage - 1}`);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPage) {
      setCurrentPage(currentPage + 1);
      router.push(`${pathname}?page=${currentPage + 1}`);
    }
  };

  // Helper function to generate page numbers (with ellipsis when necessary)
  const renderPageNumbers = () => {
    const pages = [];
    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      if (currentPage > 2) pages.push(currentPage - 1);
      pages.push(currentPage);
      if (currentPage < totalPage - 1) pages.push(currentPage + 1);
      if (currentPage < totalPage - 2) pages.push('...');
      pages.push(totalPage);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <Button
        onClick={handlePrev}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
      >
        <ArrowLeft size={18} />
      </Button>
      
      {/* Page Numbers */}
      {renderPageNumbers().map((page, index) => (
        <Button
          key={index}
          onClick={() => {
            if (page !== '...') {
              setCurrentPage(page as number);
              router.push(`${pathname}?page=${page}`);
            }
          }}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all 
                      ${currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
        >
          {page}
        </Button>
      ))}

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPage}
        variant="outline"
        size="sm"
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
      >
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};

export default TablePagination;
