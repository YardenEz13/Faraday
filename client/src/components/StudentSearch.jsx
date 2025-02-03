import React, { useState, useEffect } from 'react';
import { getUnassignedStudents, assignStudent } from '../services/api';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

const StudentSearch = ({ onStudentAdded }) => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching unassigned students...');
      const data = await getUnassignedStudents();
      console.log('Received students:', data);
      
      // Map the data to ensure we have consistent id field
      const mappedStudents = data.map(student => ({
        ...student,
        id: student.id || student._id // Use id if exists, fallback to _id
      }));
      
      console.log('Mapped students:', mappedStudents);
      setStudents(mappedStudents);
    } catch (err) {
      console.error('Error fetching students:', err.response?.data || err.message);
      toast.error('שגיאה בטעינת התלמידים');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId) => {
    try {
      console.log('Attempting to assign student:', studentId);
      await assignStudent(studentId);
      console.log('Student assigned successfully');
      
      // Remove the student from the list
      setStudents(students.filter(s => (s.id || s._id) !== studentId));
      
      // Notify parent component
      if (onStudentAdded) {
        onStudentAdded();
      }
      toast.success('התלמיד נוסף בהצלחה');
    } catch (err) {
      console.error('Error assigning student:', err.response?.data || err.message);
      toast.error('שגיאה בהוספת התלמיד');
    }
  };

  const filteredStudents = students.filter(student => 
    student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">הוספת תלמידים</h3>

      <Input
        className="mb-4"
        placeholder="חפש לפי שם או אימייל..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <div 
              key={student.id || student._id} 
              className="flex justify-between items-center p-3 bg-muted/50 hover:bg-muted/70 rounded-lg"
            >
              <div>
                <div className="font-medium">{student.username}</div>
                <div className="text-sm text-muted-foreground">{student.email}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAssignStudent(student.id || student._id)}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {searchTerm ? 'לא נמצאו תלמידים' : 'אין תלמידים זמינים'}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default StudentSearch; 