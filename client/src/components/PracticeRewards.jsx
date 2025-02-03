import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Trophy, Star, Target, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

export function PracticeRewards({ rewards }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 p-4 bg-background rounded-lg shadow-lg dark:shadow-primary/20 transition-colors duration-300"
    >
      <div className="flex flex-col gap-3">
        {rewards.map((reward, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-2 p-2 bg-primary/10 dark:bg-primary/20 rounded-md transition-colors duration-300"
          >
            {reward.type === 'streak' && <Zap className="text-yellow-500 dark:text-yellow-400" />}
            {reward.type === 'mastery' && <Star className="text-purple-500 dark:text-purple-400" />}
            {reward.type === 'achievement' && <Trophy className="text-orange-500 dark:text-orange-400" />}
            {reward.type === 'level' && <Target className="text-blue-500 dark:text-blue-400" />}
            <span className="font-medium text-foreground transition-colors duration-300">{reward.message}</span>
            {reward.points && (
              <span className="text-sm text-primary dark:text-primary/90 transition-colors duration-300">+{reward.points} points</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 