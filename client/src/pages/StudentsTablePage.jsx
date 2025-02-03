import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { toast } from "react-hot-toast";
import { getStudents, deleteAssignment } from '../services/api';
import { Trash2 } from 'lucide-react';

export default function StudentsTablePage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students data');
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      // Refresh the students data
      fetchStudents();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Students Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Math Level</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.username}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.mathLevel?.toFixed(1) || '1.0'}</TableCell>
                  <TableCell>{student.assignments?.length || 0}</TableCell>
                  <TableCell>{student.assignments?.filter(a => a.isCompleted)?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {student.assignments?.map((assignment) => (
                        <Button
                          key={assignment.id}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
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