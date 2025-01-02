import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssignment, submitAssignmentAnswer } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

function AssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await getAssignment(id);
        setAssignment(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await submitAssignmentAnswer(id, answer);
      
      // Make sure we handle the response data correctly
      if (response && response.data) {
        const { isCorrect, message, newLevel } = response.data;
        
        if (isCorrect) {
          toast.success(message || 'Correct answer! Well done!');
          // Refresh the assignment data or redirect
          navigate('/student-dashboard');
        } else {
          toast.error(message || 'Incorrect answer. Try again!');
          setAnswer(''); // Clear the answer field
        }

        // Update the student's level if provided
        if (newLevel) {
          setCurrentLevel(newLevel);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description:</h3>
              <p>{assignment.description}</p>
            </div>

            {assignment.isCompleted ? (
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-100">
                  Assignment Completed!
                </h3>
                <p className="text-green-700 dark:text-green-200">
                  Your answer: {assignment.studentAnswer}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Answer:
                  </label>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer here..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={handleSubmit}>Submit Answer</Button>
                {feedback && (
                  <div className={`p-4 rounded-lg ${
                    feedback.isCorrect 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                  }`}>
                    {feedback.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssignmentPage; 