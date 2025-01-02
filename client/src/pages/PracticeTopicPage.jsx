import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Lightbulb, Trophy, Zap, Heart } from "lucide-react";
import confetti from 'canvas-confetti';
import { getNextQuestion } from '../services/api';
import MathProblemUI from '../components/MathProblemUI';

function PracticeTopicPage() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topic) {
      navigate('/practice');
      return;
    }
    fetchNextQuestion();
  }, [topic, navigate]);

  const fetchNextQuestion = async () => {
    try {
      setError(null);
      const response = await getNextQuestion(topic.toLowerCase());
      if (response.data) {
        setQuestion(response.data);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Failed to load question. Please try again.');
    }
  };

  const handleComplete = (points, surrendered = false) => {
    if (!surrendered) {
      // Celebration animation for correct answers
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setStreak(prev => prev + 1);
      setProgress(prev => Math.min(100, prev + points));
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      
      if (lives <= 1) {
        // Game over logic
        setTimeout(() => {
          setLives(3);
          setProgress(0);
        }, 2000);
      }
    }
    
    // Fetch next question after delay
    setTimeout(fetchNextQuestion, 1500);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchNextQuestion}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="animate-pulse">Loading question...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Level {Math.floor(progress / 20) + 1}
          </Badge>
          <Progress value={progress % 20 * 5} className="w-24" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${lives > 0 ? 'text-red-500' : 'text-gray-300'}`} />
            <span className="font-bold">{lives}</span>
          </div>
        </div>
      </div>

      <MathProblemUI
        question={question}
        topic={topic}
        onComplete={handleComplete}
      />

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="bg-primary/5">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Best Streak</div>
            <div className="text-2xl font-bold">{streak}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Points</div>
            <div className="text-2xl font-bold">{progress * 10}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Mastery</div>
            <div className="text-2xl font-bold">{progress}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PracticeTopicPage; 