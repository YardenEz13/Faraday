import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, HelpCircle, BookOpen, Brain, Sparkles, Target, Award, CheckCircle, Calculator, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAssignment, submitAssignmentAnswer, getAssignmentHint, submitAssignment } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Calculator as CalculatorComponent } from "../components/Calculator";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

function AssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  const [assignment, setAssignment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hint, setHint] = useState(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [progress, setProgress] = useState({
    currentQuestion: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    grade: 0
  });
  const [canSubmitEarly, setCanSubmitEarly] = useState(false);

  useEffect(() => {
    console.log('Assignment ID from URL:', id);
    if (!id) {
      console.error('No assignment ID provided');
      toast.error(t('assignments.invalidId'));
      navigate('/assignments');
      return;
    }
    fetchAssignment();
  }, [id, navigate, t]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignment(id);
      
      console.log('Fetching assignment with ID:', id);
      console.log('Assignment response:', response);
      
      if (!response) {
        console.error('No assignment found');
        toast.error(t('assignments.notFound'));
        
        return;
      }
      
      // Set the current question from the questions array
      const currentQ = response.questions?.length ? 
        response.questions[response.currentQuestionIndex || 0] :
        // Handle old format assignments
        {
          equation: response.equation,
          solution: response.solution,
          hints: response.hints,
          description: response.description,
          studentAnswer: response.studentAnswer,
          isCorrect: response.isCompleted
        };
      
      console.log('Current question:', currentQ);
      
      setAssignment(response);
      setCurrentQuestion(currentQ);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error(t('assignments.errorFetching'));
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

  // Get the display title based on the current language
  const displayTitle = assignment?.title?.[i18n.language] || assignment?.title?.en || assignment?.title?.he || t('untitled');

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      toast.error(t('pleaseEnterAnswer'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate answer format for probability questions
      if (currentQuestion?.equation?.includes('P(')) {
        const numValue = parseFloat(userAnswer);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
          toast.error(t('practice.probabilityInputFormat'));
          return;
        }
      }

      const response = await submitAssignmentAnswer(id, userAnswer.trim());
      console.log('Submit response:', response);
      
      if (response.isCorrect) {
        fireConfetti();
        toast.success(t('practice.messages.correct'));
        setShowSolution(true);
        
        // Update progress
        setProgress(response.progress);
        setCanSubmitEarly(response.canSubmitEarly);
        
        // Update current question with solution
        if (response.solution) {
          setCurrentQuestion(prev => ({
            ...prev,
            solution: response.solution
          }));
        }

        // Check if assignment is completed
        if (response.isCompleted) {
          toast.success(t('assignments.completed'), {
            duration: 5000
          });
          
          setTimeout(() => {
            navigate('/assignments');
          }, 3000);
          
          return;
        }

        // Move to next question after delay
        if (response.nextQuestion) {
          setTimeout(() => {
            setCurrentQuestion(response.nextQuestion);
            setShowSolution(false);
            setUserAnswer('');
            setHint(null);
          }, 2000);
        }
      } else {
        toast.error(t('practice.incorrect'));
        setUserAnswer('');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = error.response?.data?.message || t('assignments.errorSubmitting');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      const response = await submitAssignment(id);
      console.log('Assignment submit response:', response);
      
      toast.success(t('assignments.submitted'), {
        duration: 5000
      });
      
      setTimeout(() => {
        navigate('/assignments');
      }, 3000);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(t('assignments.errorSubmitting'));
    }
  };

  const handleGetHint = async () => {
    try {
      setIsGettingHint(true);
      const response = await getAssignmentHint(id);
      console.log('Hint response:', response);
      
      // Handle both response formats
      const hintData = response.data?.data || response.data;
      if (!hintData || !hintData.hint) {
        throw new Error('Invalid hint data received');
      }

      setHint({
        text: hintData.hint,
        number: hintData.hintNumber || 1,
        total: hintData.totalHints || 1
      });
      toast.success(t('practice.hintReceived'));
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error(t('assignments.errorGettingHint'));
    } finally {
      setIsGettingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Floating Calculator Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={pulseAnimation}
            initial="initial"
            animate="animate"
            className="p-3 rounded-full bg-primary/10 backdrop-blur-sm shadow-lg cursor-pointer hover:bg-primary/20 transition-colors duration-300"
            onClick={() => setShowCalculator(true)}
          >
            <Calculator className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>

        {/* Calculator Modal */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCalculator(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <CalculatorComponent isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignment Header */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div
              variants={floatingAnimation}
              initial="initial"
              animate="animate"
              className="shrink-0"
            >
              <div className="relative">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
            <h1 className={`text-lg sm:text-2xl font-bold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
              {displayTitle}
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t('assignments.progress', { 
                  current: progress.currentQuestion,
                  total: progress.totalQuestions
                })}
              </span>
              <span className="text-sm font-medium text-primary">
                {t('assignments.grade')}: {progress.grade}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(progress.currentQuestion / progress.totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {currentQuestion && (
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className={`text-base sm:text-lg text-foreground ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
                  {currentQuestion.description}
                </CardTitle>
                <CardDescription className={`whitespace-pre-wrap font-mono text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                  {currentQuestion.equation}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isRTL ? 'text-right font-yarden block' : 'text-left font-inter'}`}>
                      {t('practice.yourAnswer')}
                    </Label>
                    <Input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={t('practice.enterAnswer')}
                      className={`bg-background ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}
                      disabled={isSubmitting || showSolution}
                    />
                  </div>

                  <div className={`flex flex-col sm:flex-row gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <Button
                      type="submit"
                      disabled={isSubmitting || showSolution}
                      className={`w-full sm:w-auto ${isRTL ? 'sm:ml-auto' : 'sm:mr-auto'}`}
                    >
                      {isSubmitting ? t('submitting') : t('submit')}
                    </Button>
                    
                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetHint}
                        disabled={isGettingHint || hint || showSolution}
                        className="w-full sm:w-auto"
                      >
                        {isGettingHint ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            {t('gettingHint')}
                          </div>
                        ) : hint ? (
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            {t('hintShown')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            {t('getHint')}
                          </div>
                        )}
                      </Button>
                      
                     
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AssignmentPage; 