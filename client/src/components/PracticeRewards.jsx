import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Trophy, Star, Target, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

export function PracticeRewards({ rewards }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg"
    >
      <div className="flex flex-col gap-3">
        {rewards.map((reward, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-2 p-2 bg-primary/10 rounded-md"
          >
            {reward.type === 'streak' && <Zap className="text-yellow-500" />}
            {reward.type === 'mastery' && <Star className="text-purple-500" />}
            {reward.type === 'achievement' && <Trophy className="text-orange-500" />}
            {reward.type === 'level' && <Target className="text-blue-500" />}
            <span className="font-medium">{reward.message}</span>
            {reward.points && (
              <span className="text-sm text-primary">+{reward.points} points</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 