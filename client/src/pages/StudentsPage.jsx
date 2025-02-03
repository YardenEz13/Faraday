import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "react-hot-toast";
import { getStudents } from '../services/api';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
        setStudents([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Students Statistics</h1>
      </div>

      <Card className="border-primary/20 dark:border-primary/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-semibold">Student Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Math Level</TableHead>
                <TableHead className="font-semibold">Total Assignments</TableHead>
                <TableHead className="font-semibold">Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{student.username}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <span className="bg-primary/10 dark:bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Level {student.level?.toFixed(1) || '1.0'}
                    </span>
                  </TableCell>
                  <TableCell>{student.assignments?.length || 0}</TableCell>
                  <TableCell>
                    <span className="text-green-600 dark:text-green-400">
                      {student.assignments?.filter(a => a.isCompleted)?.length || 0}
                    </span>
                    {' / '}
                    {student.assignments?.length || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 