import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { toast } from "react-hot-toast";
import { submitPracticeAnswer, getAssignmentHint, surrenderAssignment, submitAssignmentAnswer } from "../services/api";
import { Lightbulb } from "lucide-react";

function MathProblemUI({ question, topic, onComplete, assignment }) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hint, setHint] = useState(null);
  const [isGettingHint, setIsGettingHint] = useState(false);

  // Reset hint state when question changes
  useEffect(() => {
    setHint(null);
    setAnswer("");
  }, [question?.id]); // Reset when question ID changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      setIsSubmitting(true);
      if (assignment) {
        // Handle assignment submission
        const response = await submitAssignmentAnswer(assignment.id, answer.trim());
        const data = response.data;
        
        if (data.isCorrect) {
          toast.success(data.message || "Correct! Assignment completed!");
          setAnswer("");
          if (onComplete) {
            onComplete(data.newLevel);
          }
        } else {
          toast.error(data.message || "Incorrect. Try again!");
          setAnswer("");
        }
      } else if (question && topic) {
        // Handle practice question submission
        const response = await submitPracticeAnswer(
          topic,
          question.id,
          answer.trim(),
          hint ? 1 : 0
        );
        
        const data = response.data;
        
        if (data && typeof data.correct === 'boolean') {
          if (data.correct) {
            toast.success(data.message || "Correct! Well done!");
            setAnswer("");
            setHint(null);
            if (onComplete) {
              onComplete(data.points, false, hint !== null);
            }
          } else {
            toast.error(data.message || "Incorrect. Try again!");
            setAnswer("");
          }
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    try {
      setIsGettingHint(true);
      if (assignment) {
        const response = await getAssignmentHint(assignment.id);
        setHint(response.data.hint);
      } else if (question && question.hints?.length > 0) {
        setHint(question.hints[0]);
      }
      toast.success("Hint received!");
    } catch (error) {
      console.error("Error getting hint:", error);
      toast.error("Failed to get hint. Please try again.");
    } finally {
      setIsGettingHint(false);
    }
  };

  const handleSurrender = async () => {
    if (window.confirm("Are you sure you want to surrender? You'll get a new question.")) {
      try {
        if (assignment) {
          const response = await surrenderAssignment(assignment.id);
          if (onComplete) {
            onComplete(0, true, false);
          }
        } else if (onComplete) {
          onComplete(0, true, false);
        }
      } catch (error) {
        console.error("Error surrendering:", error);
        toast.error("Failed to surrender. Please try again.");
      }
    }
  };

  // If neither question nor assignment is provided, show a message
  if (!question && !assignment) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No question available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {assignment ? assignment.title : question?.topic || topic}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-xl font-medium bg-primary/5 p-4 rounded-lg shadow-inner">
            {assignment ? assignment.description : question?.question}
          </div>
          
          {hint && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <p className="font-semibold text-yellow-600">Hint</p>
              </div>
              <p className="text-sm text-yellow-700">{hint}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                disabled={isSubmitting}
                className="text-lg py-6 px-4 bg-white/50 border-primary/20 focus:border-primary/50 transition-all"
              />
              {isSubmitting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md py-6 text-lg font-semibold transition-all"
              >
                {isSubmitting ? "Checking..." : "Submit Answer"}
              </Button>
              
              <div className="flex gap-3 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetHint}
                  disabled={isGettingHint || hint || (!question?.hints?.length && !assignment)}
                  className="flex-1 border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-700 font-medium"
                >
                  {isGettingHint ? (
                    <div className="animate-pulse">Getting Hint...</div>
                  ) : hint ? (
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Hint Shown</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Get Hint</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSurrender}
                  className="flex-1 border-red-500/50 hover:bg-red-500/10 text-red-600 font-medium"
                >
                  Skip
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default MathProblemUI; 