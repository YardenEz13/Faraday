// client/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { getStudentDashboard, getStudentAssignments } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import MathProblemUI from "../components/MathProblemUI";
import { format } from "date-fns";

function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, assignmentsResponse] = await Promise.all([
        getStudentDashboard(),
        getStudentAssignments()
      ]);
      setDashboardData(dashboardResponse.data);
      setAssignments(assignmentsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleNewAssignment = (newAssignment) => {
    setAssignments(prev => [...prev, newAssignment]);
    setSelectedAssignment(newAssignment);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const pendingAssignments = assignments.filter(a => !a.isCompleted);
  const completedAssignments = assignments.filter(a => a.isCompleted);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {dashboardData?.student?.username}</p>
              <p><strong>Email:</strong> {dashboardData?.student?.email}</p>
              <p><strong>Math Level:</strong> {dashboardData?.student?.mathLevel?.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignment */}
        {selectedAssignment && (
          <div className="md:col-span-2">
            <MathProblemUI
              assignment={selectedAssignment}
              studentLevel={dashboardData?.student?.mathLevel || 1.0}
              onSubmit={async (answer) => {
                // Your submit logic here
                // After submission, refresh the assignments
                await fetchDashboardData();
              }}
              onNewAssignment={handleNewAssignment}
            />
          </div>
        )}

        {/* Pending Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From: {assignment.teacher.username}
                    </p>
                  </div>
                ))
              ) : (
                <p>No pending assignments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedAssignments.length > 0 ? (
                completedAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-4 border rounded-lg ${
                      assignment.isSurrendered 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <span className={`text-sm px-2 py-1 rounded ${
                        assignment.isSurrendered
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      }`}>
                        {assignment.isSurrendered ? 'Surrendered' : 'Completed'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>From:</strong> {assignment.teacher.username}</p>
                      <p><strong>Completed on:</strong> {format(new Date(assignment.updatedAt), 'MMM dd, yyyy')}</p>
                      <p><strong>Your Answer:</strong> {assignment.studentAnswer}</p>
                      <p><strong>Correct Solution:</strong> {assignment.solution}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No completed assignments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StudentDashboard;
