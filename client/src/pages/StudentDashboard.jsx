// client/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, isValid } from "date-fns";
import { getStudentDashboard } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-hot-toast";
import { Zap, ClockIcon, CheckCircle, BookOpen, GraduationCap, Trophy, Brain } from "lucide-react";

function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getStudentDashboard();
      console.log('Dashboard data:', response.data);
      
      // Get student data and assignments from the response
      const { student, assignments: assignmentsData = [] } = response.data || {};
      setStudentData(student);
      
      // Filter out assignments with invalid dates and sort by due date
      const validAssignments = assignmentsData
        .filter(assignment => {
          const date = new Date(assignment.dueDate);
          return isValid(date) && date.getFullYear() >= 2000;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      setAssignments(validAssignments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Error loading dashboard');
      setAssignments([]);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available';
      
      const date = new Date(dateString);
      
      if (!isValid(date) || date.getFullYear() < 2000 || date.getFullYear() > 2100) {
        return 'Coming soon';
      }
      
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Coming soon';
    }
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.isCompleted).length;
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  // Separate assignments into active and completed
  const activeAssignments = assignments.filter(a => !a.isCompleted);
  const completedAssignmentsList = assignments.filter(a => a.isCompleted);

  const EmptyState = () => (
    <Card className="text-center p-6 border-primary/20 dark:border-primary/20">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">No Assignments Yet</h2>
        <p className="text-muted-foreground">
          You don't have any assignments at the moment.
          <br />
          Check back later for new assignments.
        </p>
      </div>
    </Card>
  );

  const AssignmentCard = ({ assignment }) => (
    <Card className="border-primary/20 dark:border-primary/20">
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Due: {formatDate(assignment.dueDate)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground line-clamp-2">
          {assignment.description}
        </p>
        <div className="flex justify-between items-center">
          <Button 
            asChild
            variant="outline"
            className="hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
          >
            <Link to={`/assignment/${assignment._id}`}>
              {assignment.isCompleted ? 'View Assignment' : 'Start Assignment'}
            </Link>
          </Button>
          {assignment.isCompleted && (
            <span className="text-green-600 dark:text-green-400 font-medium">Completed ✓</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto p-6">
        {/* Header with Student Info */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary animate-float" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                My Assignments
              </h1>
            </div>
            <Button 
              asChild
              variant="outline"
              className="hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
            >
              <Link to="/practice/student">
                <Brain className="w-4 h-4 mr-2" />
                Practice
              </Link>
            </Button>
          </div>

          {/* Student Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="p-4 border-primary/20 dark:border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Math Level</p>
                  <p className="text-2xl font-semibold">{studentData?.level || 1}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-primary/20 dark:border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-semibold">{completionRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-primary/20 dark:border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                  <p className="text-2xl font-semibold">
                    <span className="text-green-600 dark:text-green-400">{completedAssignments}</span>
                    {' / '}
                    {totalAssignments}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Active Assignments Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Active Assignments</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeAssignments.length > 0 ? (
                  activeAssignments.map((assignment) => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    No active assignments
                  </div>
                )}
              </div>
            </div>

            {/* Completed Assignments Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Assignment History</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedAssignmentsList.length > 0 ? (
                  completedAssignmentsList.map((assignment) => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    No completed assignments
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
