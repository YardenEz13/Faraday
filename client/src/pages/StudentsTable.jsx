import React from "react";
import StudentStatisticsTable from "../components/StudentStatisticsTable";

function StudentsTable() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Students Overview</h1>
      <StudentStatisticsTable />
    </div>
  );
}

export default StudentsTable;
