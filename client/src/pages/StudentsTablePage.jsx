import React from "react";
import StudentStatisticsTable from "../components/StudentStatisticsTable";
import { Card, CardContent } from "../components/ui/card";
import { BookOpen, GraduationCap, Trophy } from "lucide-react";

function StudentsTablePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Students Performance Overview
        </h1>
        <p className="text-muted-foreground">
          Track your students' progress and achievements in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Students</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Level</p>
              <h3 className="text-2xl font-bold">3.5</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <h3 className="text-2xl font-bold">78%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Detailed Statistics</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive view of all students' performance metrics
            </p>
          </div>
          <StudentStatisticsTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentsTablePage; 