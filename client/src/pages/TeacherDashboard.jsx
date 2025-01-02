import React, { useEffect, useState } from "react";
import { getTeacherDashboard, getUnassignedStudents, assignStudent, sendAssignmentToStudent, generateAssignmentWithAI, getTeacherAssignments, deleteAssignment } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";
import StudentStatisticsTable from "../components/StudentStatisticsTable";

function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    solution: '',
    dueDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, unassignedResponse, assignmentsResponse] = await Promise.all([
        getTeacherDashboard(),
        getUnassignedStudents(),
        getTeacherAssignments()
      ]);
      setDashboardData(dashboardResponse.data);
      setUnassignedStudents(unassignedResponse.data);
      setTeacherAssignments(assignmentsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAssignStudent = async (studentId) => {
    try {
      await assignStudent(studentId);
      // Refresh dashboard data after assigning student
      fetchDashboardData();
    } catch (error) {
      console.error('Error assigning student:', error);
      alert(error.response?.data?.error || 'Failed to assign student');
    }
  };

  const handleSendAssignment = async (studentId) => {
    try {
      await sendAssignmentToStudent(studentId, assignment);
      alert('Assignment sent successfully!');
      setAssignment({ title: '', description: '', solution: '', dueDate: '' }); // Reset form
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error sending assignment:', error);
      alert(error.response?.data?.error || 'Failed to send assignment');
    }
  };

  const handleGenerateAssignment = async () => {
    if (!prompt.trim()) {
      alert('Please enter a description for the assignment');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateAssignmentWithAI(prompt);
      console.log("AI Response:", response.data); // For debugging

      if (response.data.title && response.data.description && response.data.solution) {
        setAssignment({
          ...assignment,
          title: response.data.title,
          description: response.data.description,
          solution: response.data.solution,
        });
      } else {
        throw new Error('Incomplete assignment generation');
      }
    } catch (error) {
      console.error('Error generating assignment:', error);
      alert('Failed to generate assignment. Please try again or create the assignment manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(assignmentId);
        // Refresh the assignments list
        fetchDashboardData();
        alert('Assignment deleted successfully');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  if (!dashboardData?.teacher) return <div className="flex items-center justify-center min-h-screen">No teacher data available</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {dashboardData.teacher.username}</p>
              <p><strong>Email:</strong> {dashboardData.teacher.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.teacher.students?.length > 0 ? (
              <ul className="space-y-4">
                {dashboardData.teacher.students.map((student) => (
                  <li key={student.id} className="p-4 border rounded">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p><strong>Name:</strong> {student.username}</p>
                        <p><strong>Email:</strong> {student.email}</p>
                      </div>
                      <Button
                        onClick={() => setSelectedStudent(student.id === selectedStudent ? null : student.id)}
                        variant="outline"
                        size="sm"
                      >
                        {student.id === selectedStudent ? 'Cancel' : 'Assign Homework'}
                      </Button>
                    </div>
                    
                    {selectedStudent === student.id && (
                      <div className="space-y-4 mt-4 p-4 bg-muted rounded">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Generate Assignment with AI</label>
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Enter the topic or type of question (e.g., 'Pythagorean theorem', 'Addition of fractions', 'Linear equations')"
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleGenerateAssignment}
                              disabled={isGenerating}
                              variant="secondary"
                            >
                              {isGenerating ? 'Generating...' : 'Generate'}
                            </Button>
                          </div>
                        </div>

                        <Input
                          placeholder="Assignment Title"
                          value={assignment.title}
                          onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                          className="w-full"
                        />
                        <Textarea
                          placeholder="Assignment Description"
                          value={assignment.description}
                          onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                          className="w-full min-h-[150px]"
                        />
                        <Textarea
                          placeholder="Correct Answer/Solution"
                          value={assignment.solution}
                          onChange={(e) => setAssignment({ ...assignment, solution: e.target.value })}
                          className="w-full"
                        />
                        <Input
                          type="date"
                          value={assignment.dueDate}
                          onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
                          className="w-full"
                        />
                        <Button
                          onClick={() => handleSendAssignment(student.id)}
                          className="w-full"
                        >
                          Send Assignment
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No students assigned yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Students</CardTitle>
          </CardHeader>
          <CardContent>
            {unassignedStudents.length > 0 ? (
              <ul className="space-y-2">
                {unassignedStudents.map((student) => (
                  <li key={student.id} className="p-2 border rounded flex justify-between items-center">
                    <div>
                      <p><strong>Name:</strong> {student.username}</p>
                      <p><strong>Email:</strong> {student.email}</p>
                    </div>
                    <Button 
                      onClick={() => handleAssignStudent(student.id)}
                      size="sm"
                    >
                      Assign
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No unassigned students available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments Status</CardTitle>
          </CardHeader>
          <CardContent>
            {teacherAssignments.length > 0 ? (
              <div className="space-y-4">
                {teacherAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-4 border rounded-lg ${
                      assignment.isCompleted 
                        ? 'border-green-500 dark:border-green-700' 
                        : 'border-yellow-500 dark:border-yellow-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm px-2 py-1 rounded ${
                          assignment.isCompleted
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}>
                          {assignment.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Student:</strong> {assignment.student.username}</p>
                      <p><strong>Due Date:</strong> {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</p>
                      {assignment.isCompleted && (
                        <>
                          <p><strong>Student's Answer:</strong> {assignment.studentAnswer}</p>
                          <p><strong>Correct Solution:</strong> {assignment.solution}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No assignments yet</p>
            )}
          </CardContent>
        </Card>

        <div className="col-span-2">
          <StudentStatisticsTable />
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
