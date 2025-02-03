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
  const [consecutiveHints, setConsecutiveHints] = useState(0);

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

  const handleComplete = (points, surrendered = false, usedHint = false) => {
    if (!surrendered) {
      if (usedHint) {
        // Increase consecutive hints counter
        setConsecutiveHints(prev => prev + 1);
        // Reduce progress based on consecutive hint usage
        const hintPenalty = Math.min(10, consecutiveHints * 2); // Increases with consecutive hints, max 10 points
        setProgress(prev => Math.max(0, prev - hintPenalty));
      } else {
        // Reset consecutive hints if no hint was used
        setConsecutiveHints(0);
        // Celebration animation for correct answers without hints
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        setStreak(prev => prev + 1);
        setProgress(prev => Math.min(100, prev + points));
      }
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      setConsecutiveHints(0); // Reset consecutive hints on surrender
      
      if (lives <= 1) {
        // Game over logic
        setTimeout(() => {
          setLives(3);
          setProgress(0);
          setConsecutiveHints(0);
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
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary text-white border-none text-lg px-4 py-1">
              Level {Math.floor(progress / 20) + 1}
            </Badge>
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{streak}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${lives > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className="font-bold text-lg">{lives}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/50 p-6 rounded-xl shadow-lg border border-primary/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-primary/80">Progress to Next Level</span>
            <span className="text-lg font-bold text-primary">{progress % 20 * 5}%</span>
          </div>
          <Progress 
            value={progress % 20 * 5} 
            className="h-4 w-full bg-primary/10"
          />
          <div className="flex justify-between mt-3 text-sm text-primary/70">
            <span>Level {Math.floor(progress / 20) + 1}</span>
            <span>{20 - (progress % 20)} points to Level {Math.floor(progress / 20) + 2}</span>
          </div>
        </div>

        {consecutiveHints > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">
                Using hints {consecutiveHints} times in a row will reduce progress by {Math.min(10, consecutiveHints * 2)} points
              </span>
            </div>
          </div>
        )}
      </div>

      <MathProblemUI
        question={question}
        topic={topic}
        onComplete={handleComplete}
      />

      <div className="grid grid-cols-3 gap-4 mt-8">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-lg transform hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-sm font-medium text-primary/70">Best Streak</div>
            <div className="text-3xl font-bold text-primary mt-1">{streak}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-lg transform hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-sm font-medium text-primary/70">Total Points</div>
            <div className="text-3xl font-bold text-primary mt-1">{progress * 10}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-lg transform hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Lightbulb className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-sm font-medium text-primary/70">Mastery</div>
            <div className="text-3xl font-bold text-primary mt-1">{progress}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PracticeTopicPage; 