import React from "react";
import { useEffect, useState } from "react";
import { getStudentStatistics } from "../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

function StudentStatisticsTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudentStatistics();
        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-bold uppercase">Name</TableHead>
            <TableHead className="text-xs font-bold uppercase">Email</TableHead>
            <TableHead className="text-xs font-bold uppercase text-center">Level</TableHead>
            <TableHead className="text-xs font-bold uppercase text-center">Progress</TableHead>
            <TableHead className="text-xs font-bold uppercase text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">{student.username}</TableCell>
              <TableCell className="text-muted-foreground">{student.email}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Level {Number(student.mathLevel || 1.0).toFixed(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 items-center">
                  <Progress 
                    value={Number(student.completionRate || 0)} 
                    className="h-2 w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    {student.completedAssignments || 0} / {student.totalAssignments || 0} completed
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={student.lastActive ? "success" : "secondary"}
                  className={`${
                    student.lastActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}
                >
                  {student.lastActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default StudentStatisticsTable; 