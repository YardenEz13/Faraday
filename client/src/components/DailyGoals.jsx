import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Target, Award, Zap } from "lucide-react";

export function DailyGoals({ goals }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Daily Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {goal.type === 'practice' && <Zap className="w-4 h-4 text-yellow-500" />}
                {goal.type === 'mastery' && <Award className="w-4 h-4 text-purple-500" />}
                <span className="text-sm font-medium">{goal.description}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {goal.current}/{goal.target}
              </span>
            </div>
            <Progress value={(goal.current / goal.target) * 100} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 