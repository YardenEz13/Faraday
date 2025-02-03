import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getPracticeQuestions, submitPracticeAnswer } from '@/services/api';
import { useAuth } from '@/context/auth';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

const topics = [
  { id: 'equations', name: 'practice.topics.equations.title', icon: '📐', color: 'bg-blue-100' },
  { id: 'trigonometry', name: 'practice.topics.trigonometry.title', icon: '∠', color: 'bg-pink-100' },
  { id: 'vectors', name: 'practice.topics.vectors.title', icon: '➡️', color: 'bg-green-100' },
  { id: 'complex', name: 'practice.topics.complex.title', icon: 'ℂ', color: 'bg-purple-100' },
  { id: 'calculus', name: 'practice.topics.calculus.title', icon: '∫', color: 'bg-orange-100' },
  { id: 'sequences', name: 'practice.topics.sequences.title', icon: 'Σ', color: 'bg-pink-100' },
  { id: 'geometry', name: 'practice.topics.geometry.title', icon: '△', color: 'bg-cyan-100' },
  { id: 'probability', name: 'practice.topics.probability.title', icon: '🎲', color: 'bg-yellow-100' }
];

const PracticeTopicPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    if (selectedTopic && isGameActive) {
      fetchNextQuestion();
    }
  }, [selectedTopic, difficulty, isGameActive]);

  const fetchNextQuestion = async () => {
    try {
      setIsAnswering(false);
      setShowHint(false);
      setCurrentHintIndex(0);
      const question = await getPracticeQuestions(selectedTopic, difficulty);
      setCurrentQuestion(question);
      setUserAnswer('');
      setFeedback('');
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setIsGameActive(true);
    setDifficulty(1);
    setConsecutiveCorrect(0);
    setConsecutiveIncorrect(0);
    setScore(0);
    setStreak(0);
  };

  const showNextHint = () => {
    if (currentQuestion?.hints && currentHintIndex < currentQuestion.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  const handleSubmitAnswer = async () => {
    if (isAnswering) return;
    setIsAnswering(true);

    try {
      const result = await submitPracticeAnswer(currentQuestion.id, userAnswer);
      
      if (result.isCorrect) {
        // Celebration effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setFeedback(t('practice.correct'));
        setConsecutiveCorrect(prev => prev + 1);
        setConsecutiveIncorrect(0);
        setStreak(prev => prev + 1);
        setScore(prev => prev + (10 * difficulty) - (currentHintIndex * 2));
        
        // Increase difficulty after 3 correct answers
        if (consecutiveCorrect + 1 >= 3) {
          setDifficulty(prev => Math.min(prev + 1, 10));
          setConsecutiveCorrect(0);
        }
      } else {
        setFeedback(t('practice.incorrect'));
        setConsecutiveIncorrect(prev => prev + 1);
        setConsecutiveCorrect(0);
        setStreak(0);
        
        // Decrease difficulty after 2 incorrect answers
        if (consecutiveIncorrect + 1 >= 2) {
          setDifficulty(prev => Math.max(prev - 1, 1));
          setConsecutiveIncorrect(0);
        }
      }

      // Fetch next question after a short delay
      setTimeout(() => {
        fetchNextQuestion();
        setIsAnswering(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setIsAnswering(false);
    }
  };

  if (!selectedTopic) {
    return (
      <div className="container mx-auto p-4">
        <h1 className={`text-3xl font-bold mb-8 text-center ${isRTL ? 'font-yarden' : 'font-inter'}`}>
          {t('practiceTopics.selectTopic')}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topics.map(topic => (
            <Card 
              key={topic.id} 
              className={`p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow ${topic.color}`}
              onClick={() => handleTopicSelect(topic.id)}
            >
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-2xl">{topic.icon}</span>
                <h3 className={`text-lg sm:text-xl font-semibold ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                  {t(topic.name)}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const topic = topics.find(t => t.id === selectedTopic);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className={`flex items-center gap-2 mb-4 sm:mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant="outline" 
          className="shrink-0"
          onClick={() => navigate('/practice')}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t('back')}
        </Button>
        <h1 className={`text-lg sm:text-2xl font-bold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('practice.adaptivePractice')}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card key="difficulty-card" className="p-3 sm:p-4 text-center">
          <div className={`text-base sm:text-lg font-semibold ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {t('practice.difficulty')}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold text-primary ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {difficulty}
          </div>
        </Card>
        <Card key="score-card" className="p-3 sm:p-4 text-center">
          <div className={`text-base sm:text-lg font-semibold ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {t('practice.score')}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold text-primary ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {score}
          </div>
        </Card>
        <Card key="streak-card" className="p-3 sm:p-4 text-center">
          <div className={`text-base sm:text-lg font-semibold ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {t('practice.streak')}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold text-primary ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {streak}
          </div>
        </Card>
      </div>

      <Progress value={consecutiveCorrect * 33.33} className="h-2 mb-4" />

      {currentQuestion && (
        <Card className={`p-4 sm:p-6 mb-4 sm:mb-6 ${topic.color}`}>
          <h2 className={`text-lg sm:text-2xl font-bold mb-3 sm:mb-4 ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
            {currentQuestion.title}
          </h2>
          <p className={`text-base sm:text-lg mb-3 sm:mb-4 ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
            {currentQuestion.description}
          </p>
          <div className={`text-base sm:text-xl font-mono bg-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-center ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {currentQuestion.equation}
          </div>
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t('practice.answerPlaceholder')}
              className={`w-full p-3 border rounded-lg text-base sm:text-lg ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={isAnswering}
              className={`w-full sm:w-auto text-base sm:text-lg px-4 sm:px-6 ${isRTL ? 'font-yarden' : 'font-inter'}`}
            >
              {isAnswering ? t('practice.checking') : t('practice.submit')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowHint(true);
                showNextHint();
              }}
              disabled={currentHintIndex >= (currentQuestion.hints?.length || 0) - 1}
              className={`w-full sm:w-auto ${isRTL ? 'font-yarden' : 'font-inter'}`}
            >
              {t('practice.getHint')}
            </Button>
          </div>
          
          {showHint && currentQuestion.hints && (
            <div className={`mt-4 p-3 sm:p-4 bg-yellow-50 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`font-semibold mb-2 text-sm sm:text-base ${isRTL ? 'font-yarden' : 'font-inter'}`}>
                {t('practice.hint', { number: currentHintIndex + 1 })}:
              </div>
              <div className="text-sm sm:text-base">
                {currentQuestion.hints[currentHintIndex]}
              </div>
            </div>
          )}

          {feedback && (
            <div className={`mt-4 p-3 sm:p-4 rounded-lg text-center text-base sm:text-lg font-semibold ${
              feedback === t('practice.correct') ? 'bg-green-100' : 'bg-red-100'
            } ${isRTL ? 'font-yarden' : 'font-inter'}`}>
              {feedback}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PracticeTopicPage;