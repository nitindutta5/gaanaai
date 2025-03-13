"use client"
import DataTable from "@/components/Table";

export default function Home() {
  let tableColums = [
    { label: "Id", accessor: "id" },
    { label: "Name", accessor: "name" },
    { label: "City", accessor: "city" },
    { label: "Country", accessor: "country" },
    { label: "Timezone", accessor: "timezone" },
    {
      label: "Actions",
      accessor: "actions",
      render: (row: any, handleEdit: (row: any) => void, handleDelete: (id: string) => void) => (
        <div className="flex space-x-2">
          <button className="text-blue-500" onClick={() => handleEdit(row)}>Edit</button>
          <button className="text-red-500 border-2" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <DataTable
        columns={tableColums}
        apiUrl="http://localhost:3001/locations"
      />
    </div>
  );
}
