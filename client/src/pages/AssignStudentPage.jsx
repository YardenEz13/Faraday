import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getUnassignedStudents, assignStudentToTeacher } from '../services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { useNavigate } from 'react-router-dom';

function AssignStudentPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch unassigned students when component mounts
    const fetchUnassignedStudents = async () => {
      try {
        const response = await getUnassignedStudents();
        setStudents(response.data);
      } catch (error) {
        toast.error('Failed to fetch students');
        console.error('Error fetching students:', error);
      }
    };

    fetchUnassignedStudents();
  }, []);

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    setIsLoading(true);
    try {
      await assignStudentToTeacher(user.id, selectedStudent);
      
      toast.success('Student assigned successfully!');
      // Remove the assigned student from the list
      setStudents(students.filter(student => student.id !== selectedStudent));
      setSelectedStudent('');
      
      // Navigate back to dashboard after successful assignment
      navigate('/dashboard/teacher');
    } catch (error) {
      toast.error('Failed to assign student');
      console.error('Error assigning student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Assign Student</CardTitle>
          <CardDescription>
            Select a student to assign to your class
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select
              value={selectedStudent}
              onValueChange={setSelectedStudent}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAssignStudent}
            disabled={!selectedStudent || isLoading}
            className="w-full"
          >
            {isLoading ? "Assigning..." : "Assign Student"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssignStudentPage; 