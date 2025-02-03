import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { toast } from "react-hot-toast";
import { submitPracticeAnswer, getAssignmentHint, surrenderAssignment, submitAssignmentAnswer } from "../services/api";
import { Lightbulb, Sparkles, Brain, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>{data.message || "Correct! Assignment completed!"}</span>
            </motion.div>
          ));
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
            toast.custom((t) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                <span>{data.message || "Correct! Well done!"}</span>
              </motion.div>
            ));
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
          await surrenderAssignment(assignment.id);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="card-hover bg-gradient-to-br from-background to-primary/5 border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-primary/10 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary animate-float" />
            <CardTitle className="text-lg sm:text-2xl font-bold text-gradient">
              {assignment ? assignment.title : question?.topic || topic}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <motion.div 
              className="text-base sm:text-xl font-medium glass-effect p-4 sm:p-6 rounded-lg shadow-inner"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {assignment ? assignment.description : question?.question}
            </motion.div>
            
            <AnimatePresence>
              {hint && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 sm:p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500 animate-pulse-subtle" />
                    <p className="font-semibold text-yellow-600 text-sm sm:text-base">Hint</p>
                  </div>
                  <p className="text-sm sm:text-base text-yellow-700">{hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  disabled={isSubmitting}
                  className="text-base sm:text-lg py-6 sm:py-8 px-4 sm:px-6 bg-white/50 dark:bg-gray-900/50 border-primary/20 focus:border-primary/50 transition-all font-mono shadow-inner"
                />
                {isSubmitting && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-lg py-6 sm:py-8 text-base sm:text-lg font-semibold transition-all btn-bounce flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetHint}
                    disabled={isGettingHint || hint || (!question?.hints?.length && !assignment)}
                    className="w-full border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-700 font-medium text-sm sm:text-base py-4 sm:py-5 btn-bounce"
                  >
                    {isGettingHint ? (
                      <div className="animate-pulse">Getting Hint...</div>
                    ) : hint ? (
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 shrink-0" />
                        <span>Hint Shown</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 shrink-0" />
                        <span>Get Hint</span>
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSurrender}
                    className="w-full border-red-500/50 hover:bg-red-500/10 text-red-600 font-medium text-sm sm:text-base py-4 sm:py-5 btn-bounce"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MathProblemUI; 