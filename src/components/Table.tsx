"use client";

import { ApiService } from "@/utils/apiService";
import { debounce } from "@/utils/helper";
import { useState, useEffect, useRef, useCallback, JSX, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

type Row = {
  id: number;
  name: string;
  city: string;
  country: string;
  alias: string[]; // Array of strings
  regions: string[]; // Array of strings
  coordinates: [number, number]; // Tuple with two numbers (latitude, longitude)
  province: string;
  timezone: string;
  unlocs: string[]; // Array of strings
  code: string;
};

type EditableColumns = keyof Pick<Row, 'name' | 'country' | 'city' | 'code'>;

type DataTableType = {
  apiUrl: string;
  columns: {
    label: string;
    accessor: string;
    render?: (
      row: any,
      handleEdit: (row: any) => void,
      handleDelete: (id: string) => void
    ) => React.ReactNode;
  }[];
};

export default function DataTable({ apiUrl, columns }: DataTableType) {
  const myApiService = useMemo(() => new ApiService(apiUrl),[apiUrl]);
  const totalPages = useRef<number>(0);
  const [data, setData] = useState<Row[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.accessor)
  );

  const selectedKeys = useMemo(() => Object.keys(edit ?? {} as EditableColumns), [edit]);

  const fetchData = async (query?: string) => {
    try {
      const params = {
        q: query ?? searchQuery,
        _sort: sortField || "",
        _order: sortOrder,
        _page: currentPage.toString(),
        _limit: "10",
      };
      const response = await myApiService.get<Row[]>("/",params, true);
      console.log(response,"RES")
      totalPages.current = response.totalRecords??0  / 10
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const debounced = useCallback(debounce(fetchData, 500), [
    sortField,
    sortOrder,
    currentPage,
  ]);
  useEffect(() => {
    fetchData();
  }, [sortField, sortOrder, currentPage]);

  useEffect(() => {
    debounced(searchQuery);
  }, [searchQuery]);

  const handleSort = (field: string) => {
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleEdit = (row: Row) => {
    setEdit({
      name:row.name,
      city:row.city,
      country: row.country,
      code:row.code
    });
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      await myApiService.delete(`/${id}`)
      fetchData(); // Refresh the table after deleting
    }
  };

  return (
    <div className="w-full p-4 shadow-lg rounded-lg bg-gray-100 text-black">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 mb-3 border rounded-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Column Visibility Toggle */}
      <div className="mb-3">
        {columns?.map((col) => (
          <label key={col.accessor} className="mr-3">
            <input
              type="checkbox"
              checked={visibleColumns.includes(col.accessor)}
              onChange={() => toggleColumn(col.accessor)}
              className="mr-1"
            />
            {col.label}
          </label>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-md">
          <thead>
            <tr className="bg-gray-100 text-black">
              {columns
                .filter((col) => visibleColumns.includes(col.accessor))
                .map((col) => (
                  <th
                    key={col.accessor}
                    onClick={() => handleSort(col.accessor)}
                    className="px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center">
                      {col.label}
                      {sortField === col.accessor ? (
                        sortOrder === "asc" ? (
                          <FaSortUp className="ml-1" />
                        ) : (
                          <FaSortDown className="ml-1" />
                        )
                      ) : (
                        <FaSort className="ml-1 text-gray-400 text-black" />
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data?.length > 0 ? (
              data?.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {columns
                    .filter((col) => visibleColumns.includes(col.accessor))
                    .map((col) => (
                      <td key={col.accessor} className="px-4 py-2">
                        {row[col.accessor as keyof Row]}
                        {col.render
                          ? col.render(row, handleEdit, handleDelete)
                          : row[col.accessor as keyof Row]}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        {/* Start Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          Start
        </button>

        {/* Previous Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {Array.from({ length: Math.min(5, totalPages.current) }, (_, i) => {
          const pageNumber = Math.max(1, currentPage - 2) + i;
          return pageNumber <= totalPages.current ? (
            <button
              key={pageNumber}
              className={`px-3 py-1 rounded-md ${
                currentPage === pageNumber
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ) : null;
        })}

        {/* Next Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages.current))
          }
          disabled={currentPage === totalPages.current}
        >
          Next
        </button>

        {/* End Button */}
        <button
          className="px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
          onClick={() => setCurrentPage(totalPages.current)}
          disabled={currentPage === totalPages.current}
        >
          End
        </button>
      </div>

      <p className="text-center">
        Page {currentPage} of {totalPages.current}
      </p>

      {edit && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Edit Row</h2>
            <form>
              {selectedKeys?.map((col) => (
                <div key={col} className="mb-3">
                  <label className="block font-medium">{col}</label>
                  <input
                    type="text"
                    name={col}
                    value={edit[col]}
                    onChange={(e) => {setEdit({...edit,[col]:e.target.value})}}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={()=> setEdit(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleEdit}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
