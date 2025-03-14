"use client";

import { ApiService } from "@/utils/apiService";
import { debounce } from "@/utils/helper";
import { useState, useEffect, useRef, useCallback, JSX, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import Pagination from "./Pagination";

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

type EditableColumns = keyof Pick<
  Row,
  "name" | "country" | "city" | "code" | "id"
>;

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
  const myApiService = useMemo(() => new ApiService(apiUrl), [apiUrl]);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const selectedKeys = useMemo(
    () => Object.keys(edit ?? ({} as EditableColumns)),
    [edit]
  );

  const fetchData = async (query?: string) => {
    try {
      const params = {
        q: query ?? searchQuery,
        _sort: sortField || "",
        _order: sortOrder,
        _page: query ? "1" : currentPage.toString(),
        _limit: "10",
      };
      const response = await myApiService.get<Row[]>("", params, true);
      totalPages.current = Math.floor((response.totalRecords as number) / 10);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again later.");
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
    setEdit(row);
  };

  const addUpdate = async () => {
    let data = { ...edit };

    if (data.coordinates) {
      data.coordinates = data.coordinates.split(",");
    }

    try {
      if (edit.id) {
        await myApiService.put(`/${edit.id}`, data);
      } else {
        await myApiService.post("", data); // Creates a new record
      }

      fetchData(); // Refresh table
      setEdit(null);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      await myApiService.delete(`/${id}`);
      fetchData(); // Refresh the table after deleting
    }
  };

  const handleColumnEdit = (e: any, col: string) => {
    let val = e.target.value;
    if (typeof val === "string") {
      setEdit({ ...edit, [col]: e.target.value });
    } else if (
      Array.isArray(edit[col]) &&
      edit[col].every((item) => typeof item === "string")
    ) {
      setEdit({ ...edit, [col]: val.split(",").map((v: any) => v.trim()) }); // Convert comma-separated string to array of strings
    } else if (
      Array.isArray(edit[col]) &&
      edit[col].every((item) => typeof item === "number")
    ) {
      setEdit({
        ...edit,
        [col]: val.split(",").map((v: any) => Number(v.trim()) || 0),
      }); // Convert comma-separated string to array of numbers
    }
  };
  const columnsToRender = useMemo(
    () => columns.filter((col) => visibleColumns.includes(col.accessor)),
    [columns, visibleColumns]
  );

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
      <button
        className="mb-3 px-4 py-2 bg-green-700 text-white rounded-md"
        onClick={() =>
          setEdit({
            name: "",
            country: "",
            city: "",
            code: "",
            coordinates: "",
            province: "",
            timezone: "",
            id: undefined,
          })
        }
      >
        Create New
      </button>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-md">
          <thead>
            <tr className="bg-gray-100 text-black border-b-2">
              {columnsToRender.map((col) => (
                <th
                  key={col.accessor}
                  onClick={() => handleSort(col.accessor)}
                  className="px-4 py-2 cursor-pointer"
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.accessor !== "actions" ? (
                      sortField === col.accessor ? (
                        sortOrder === "asc" ? (
                          <FaSortUp className="ml-1" />
                        ) : (
                          <FaSortDown className="ml-1" />
                        )
                      ) : (
                        <FaSort className="ml-1 text-gray-400 text-black" />
                      )
                    ) : null}
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
      <Pagination
        totalPages={totalPages.current}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {edit && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 overflow-auto">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">
              Edit Row {edit["id"]}
            </h2>
            <form>
              {selectedKeys?.map((col) =>
                col === "id" ? null : (
                  <div key={col} className="mb-3">
                    <label className="block font-medium">{col}</label>
                    <input
                      type="text"
                      name={col}
                      value={
                        Array.isArray(edit[col])
                          ? edit[col].join(", ")
                          : edit[col]
                      }
                      onChange={(e) => handleColumnEdit(e, col)}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                )
              )}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setEdit(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={addUpdate}
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
