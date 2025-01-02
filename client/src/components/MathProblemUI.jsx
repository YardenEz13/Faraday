import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { toast } from "react-hot-toast";
import { submitPracticeAnswer, getAssignmentHint, surrenderAssignment } from "../services/api";

function MathProblemUI({ question, topic, onComplete }) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hint, setHint] = useState(null);
  const [isGettingHint, setIsGettingHint] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      setIsSubmitting(true);
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
          if (onComplete) {
            onComplete(data.points);
          }
        } else {
          toast.error(data.message || "Incorrect. Try again!");
          setAnswer("");
        }
      } else {
        throw new Error("Invalid response format");
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
      setHint(question.hints[0]);
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
      if (onComplete) {
        onComplete(0, true);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{question.topic || topic}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-lg font-medium">{question.question}</div>
          
          {hint && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-medium">Hint: {hint}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer"
              disabled={isSubmitting}
            />
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Checking..." : "Submit Answer"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGetHint}
                disabled={isGettingHint || hint || !question.hints?.length}
                className="flex-1"
              >
                {isGettingHint ? "Getting Hint..." : hint ? "Hint Shown" : "Get Hint"}
              </Button>
              
              <Button
                type="button"
                variant="destructive"
                onClick={handleSurrender}
                className="flex-1"
              >
                Skip Question
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default MathProblemUI; 