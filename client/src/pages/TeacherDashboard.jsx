import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherDashboard, deleteAssignment } from "../services/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { toast } from "react-hot-toast";
import { Users, Trash2, GraduationCap, BookOpen } from "lucide-react";
import StudentSearch from '../components/StudentSearch';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getTeacherDashboard();
      console.log('Teacher dashboard response:', response.data);
      
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
        setStudents([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Error loading dashboard');
      setStudents([]);
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      fetchDashboard();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleStudentAdded = () => {
    // Trigger a refresh of the dashboard data
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">My Students</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 text-center border-primary/20 dark:border-primary/20">
              <p className="text-muted-foreground mb-4">No students found. Add new students to get started.</p>
            </Card>
          </div>
          
          {/* Student search sidebar */}
          <div className="lg:col-span-1">
            <StudentSearch onStudentAdded={handleStudentAdded} />
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalAssignments = students.reduce((sum, student) => sum + (student.assignments?.length || 0), 0);
  const completedAssignments = students.reduce((sum, student) => 
    sum + (student.assignments?.filter(a => a.isCompleted)?.length || 0), 0);
  const averageLevel = students.reduce((sum, student) => sum + (student.level || 1), 0) / students.length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">My Students</h1>
        </div>
        <Button asChild>
          <Link to="/students/add">Add New Students</Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-4 border-primary/20 dark:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-semibold">{students.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-primary/20 dark:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Level</p>
              <p className="text-2xl font-semibold">{averageLevel.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-primary/20 dark:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assignments Completed</p>
              <p className="text-2xl font-semibold">
                <span className="text-green-600 dark:text-green-400">{completedAssignments}</span>
                {' / '}
                {totalAssignments}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - student cards */}
        <div className="lg:col-span-2 space-y-6">
          {students.map((student) => (
            <Card key={student.id || Math.random()} className="p-6 border-primary/20 dark:border-primary/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{student.username || 'Student'}</h2>
                  <p className="text-muted-foreground">{student.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  asChild
                  className="hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
                >
                  <Link to={`/assignment/create/${student.id}`}>
                    Assign Homework
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                  <span className="text-primary">Level {student.level || 1}</span>
                </div>
                <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                  <span className="text-primary">Progress: {student.progress || 0}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Recent Assignments</h3>
                {Array.isArray(student.assignments) && student.assignments.length > 0 ? (
                  <div className="space-y-2">
                    {student.assignments.map((assignment) => (
                      <div key={assignment.id || Math.random()} className="flex justify-between items-center p-3 bg-muted/50 hover:bg-muted/70 rounded-lg transition-colors">
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Invalid Date'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            {assignment.isCompleted ? (
                              <span className="text-green-600 dark:text-green-400">Completed</span>
                            ) : (
                              <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No recent assignments</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Student search sidebar */}
        <div className="lg:col-span-1">
          <StudentSearch onStudentAdded={handleStudentAdded} />
        </div>
      </div>
    </div>
  );
}
