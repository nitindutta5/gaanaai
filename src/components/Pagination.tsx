import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => {
      const pageNumber = Math.max(1, currentPage - 2) + i;
      return pageNumber <= totalPages ? pageNumber : null;
    }
  ).filter(Boolean) as number[];

  return (
    <>
      <div className="flex justify-center items-center mt-4 space-x-2">
        {/* Start Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          Start
        </button>

        {/* Previous Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            className={`px-3 py-1 rounded-md ${
              currentPage === pageNumber
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        {/* Next Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>

        {/* End Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          End
        </button>
      </div>
      <p className="text-center">
        Page {currentPage} of {totalPages}
      </p>
    </>
  );
};

export default Pagination;
