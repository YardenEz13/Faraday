import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { HelpCircle, ArrowLeft, Calculator as CalculatorIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import confetti from 'canvas-confetti';
import { getPracticeQuestion, submitPracticeAnswer } from '../services/api';
import { PracticeRewards } from '../components/PracticeRewards';
import { Calculator } from '../components/Calculator';
import { useTranslation } from 'react-i18next';
import { TOPICS_CONFIG } from '../config/topics';

const DIFFICULTY_LEVELS = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
};

function AdaptivePracticePage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [currentDifficulty, setCurrentDifficulty] = useState(DIFFICULTY_LEVELS.EASY);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [streak, setStreak] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hint, setHint] = useState("");
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [topicLevel, setTopicLevel] = useState(1);
  const [mathLevel, setMathLevel] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const toastConfig = {
    duration: 3000,
    position: 'top-center',
    className: 'bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg text-lg',
    style: {
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: isRTL ? 'Yarden' : 'Inter'
    }
  };

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        scalar: 1.2,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 }
    });

    fire(0.2, {
      spread: 60,
      origin: { x: 0.5, y: 0.7 }
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      origin: { x: 0.8, y: 0.7 }
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      origin: { x: 0.5, y: 0.7 }
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 }
    });
  };

  useEffect(() => {
    if (!TOPICS_CONFIG[topicId]) {
      toast.error(t('practice.messages.invalidTopic'), toastConfig);
      navigate("/practice");
      return;
    }
    generateNewProblem();
  }, [topicId]);

  const generateNewProblem = async () => {
    setIsLoading(true);
    setShowSolution(false);
    setUserAnswer("");
    setHintsUsed(0);
    setHint("");

    try {
      const response = await getPracticeQuestion(topicId, { difficulty: currentDifficulty });
      setCurrentProblem(response);
    } catch (error) {
      console.error('Error getting new question:', error);
      toast.error(t('practice.errorGettingQuestion'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (currentProblem?.hints?.length > hintsUsed) {
      setHintsUsed(prev => prev + 1);
      setHint(currentProblem.hints[hintsUsed]);
    }
  };

  const showCalculationAnimation = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 2000);
  };

  const handleSubmit = async () => {
    if (!userAnswer) {
      toast.error(t('practice.messages.enterAnswer'), toastConfig);
      return;
    }

    setIsLoading(true);
    showCalculationAnimation();
    
    try {
      const response = await submitPracticeAnswer({
        topic: topicId,
        answer: userAnswer
      });
      
      if (response.success) {
        toast.success(
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span>{t('practice.messages.correct')}</span>
          </div>,
          {
            ...toastConfig,
            duration: 2000,
            icon: '🎯'
          }
        );
        fireConfetti();
        setStreak(prev => prev + 1);
        if (streak > 0 && streak % 3 === 0) {
          setRewards(prev => [...prev, { type: 'streak', count: streak, points: 10 }]);
          setTimeout(() => {
            toast.success(t('practice.rewards.streak', { count: streak, points: 10 }), toastConfig);
          }, 1000);
        }
        setShowSolution(false);
        generateNewProblem();
      } else {
        toast.error(t('practice.messages.incorrect'), {
          ...toastConfig,
          className: 'bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg'
        });
        setStreak(0);
        setShowSolution(true);
        if (response.solution) {
          setCurrentProblem(prev => ({
            ...prev,
            solution: {
              steps: response.solution.steps || [],
              final_answers: response.solution.final_answers
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(t('practice.messages.errorCheckingAnswer'), toastConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSolution = () => {
    if (!showSolution || !currentProblem?.solution) return null;
    
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md space-y-3">
        <h3 className={`text-base font-semibold text-green-700 dark:text-green-300 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('practice.questions.solution')}
        </h3>
        <div className="space-y-3">
          {currentProblem.solution.steps?.map((step, index) => (
            <div key={index} className={`text-sm text-green-700 dark:text-green-300 ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="font-medium">שלב {index + 1}:</span>
              <div className="mt-1">{step}</div>
            </div>
          ))}
          <div className={`text-sm font-medium text-green-700 dark:text-green-300 mt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className="font-bold">{t('practice.questions.finalAnswer')}:</span> {' '}
            <span className="font-mono bg-green-100 dark:bg-green-800/40 px-2 py-1 rounded">
              {Array.isArray(currentProblem.solution.final_answers) 
                ? currentProblem.solution.final_answers.join(', ')
                : typeof currentProblem.solution.final_answers === 'object'
                  ? Object.entries(currentProblem.solution.final_answers)
                      .map(([key, value]) => `${key}=${value}`)
                      .join(', ')
                  : currentProblem.solution.final_answers}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCalculatorAnimation = () => {
    if (!isCalculating) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ 
            opacity: 1,
            scale: [0.5, 1.2, 1.2, 1.2, 0.8],
            y: [50, 0, -20, -20, -50],
            rotate: [0, -10, 10, -10, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.2, 0.4, 0.6, 1],
            ease: "easeInOut"
          }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="relative flex flex-col items-center gap-4">
            <Calculator className="w-32 h-32 text-primary animate-pulse" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1, 1, 0.8],
                y: [0, -20, -20, -40]
              }}
              transition={{ duration: 2 }}
              className="text-3xl font-mono text-primary font-bold absolute -top-2"
            >
              {userAnswer}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-4"
            >
              {t('practice.calculating')}...
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${isRTL ? 'font-yarden' : 'font-inter'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center gap-2 mb-4 sm:mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant="outline" 
          className="shrink-0"
          onClick={() => navigate('/practice')}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t('common.back')}
        </Button>
        <h1 className={`text-lg sm:text-2xl font-bold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('practice.adaptivePractice')}
        </h1>
        <Button
          variant="outline"
          className="ml-auto shrink-0"
          onClick={() => setShowCalculator(true)}
        >
          <CalculatorIcon className="w-4 h-4 mr-2" />
          {t('calculator.open')}
        </Button>
      </div>

      <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      <AnimatePresence>
        {renderCalculatorAnimation()}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-6">
        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6">
            {currentProblem ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className={`text-base sm:text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('practice.questions.title')}
                  </h2>
                  <p className={`text-sm sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                    {currentProblem.description}
                  </p>
                </div>
                
                <div className="bg-muted p-3 sm:p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-sm sm:text-base overflow-x-auto" dir="ltr">
                    {currentProblem.equation}
                  </pre>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium block ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('practice.questions.answer')}
                    </label>
                    <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                      <Input
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={t('practice.equationPlaceholder')}
                        disabled={showSolution}
                        dir="ltr"
                        className="font-mono"
                      />
                      <Button
                        onClick={handleGetHint}
                        variant="outline"
                        disabled={isGettingHint || hint}
                        className="w-full sm:w-auto"
                      >
                        {isGettingHint ? t('common.loading') : t('practice.getHint')}
                      </Button>
                    </div>
                  </div>

                  <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <Button
                      variant="outline"
                      onClick={generateNewProblem}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {t('practice.questions.skip')}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !userAnswer}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? t('practice.checking') : t('practice.questions.submit')}
                    </Button>
                  </div>

                  {hint && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('practice.hint', { number: hintsUsed })}
                      </p>
                      <p className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{hint}</p>
                    </div>
                  )}

                  {renderSolution()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('practice.questions.loading')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {rewards.length > 0 && (
          <div className="space-y-2">
            {rewards.map((reward, index) => (
              <Card key={index} className="border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <p className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {reward.message}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdaptivePracticePage; 