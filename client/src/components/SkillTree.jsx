import React from 'react';
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

const topics = {
  'basic': {
    name: 'Basic Arithmetic',
    subtopics: ['addition', 'subtraction', 'multiplication', 'division'],
    required: [],
  },
  'fractions': {
    name: 'Fractions',
    subtopics: ['adding-fractions', 'subtracting-fractions', 'multiplying-fractions'],
    required: ['basic'],
  },
  'algebra': {
    name: 'Basic Algebra',
    subtopics: ['equations', 'inequalities', 'linear-functions'],
    required: ['basic'],
  },
  'geometry': {
    name: 'Geometry',
    subtopics: ['angles', 'triangles', 'pythagorean'],
    required: ['basic', 'algebra'],
  }
};

export function SkillTree({ userProgress }) {
  return (
    <div className="p-6">
      <div className="relative">
        {Object.entries(topics).map(([key, topic], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="mb-8"
          >
            <Card className={`p-4 ${
              isTopicUnlocked(topic, userProgress) 
                ? 'bg-primary/5' 
                : 'bg-muted/50'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{topic.name}</h3>
                <Badge variant={
                  getTopicStatus(topic, userProgress)
                }>
                  {getTopicStatus(topic, userProgress)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topic.subtopics.map(subtopic => {
                  const progress = userProgress[subtopic] || 0;
                  return (
                    <Card key={subtopic} className="p-3">
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">
                          {formatTopicName(subtopic)}
                        </div>
                        <Progress value={progress * 100} />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(progress * 100)}% mastered
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function isTopicUnlocked(topic, progress) {
  return topic.required.every(req => 
    Object.entries(progress)
      .filter(([key]) => topics[req].subtopics.includes(key))
      .every(([_, val]) => val >= 0.7)
  );
}

function getTopicStatus(topic, progress) {
  if (!isTopicUnlocked(topic, progress)) return 'locked';
  
  const subtopicProgress = topic.subtopics
    .map(sub => progress[sub] || 0)
    .reduce((acc, val) => acc + val, 0) / topic.subtopics.length;
  
  if (subtopicProgress >= 0.9) return 'mastered';
  if (subtopicProgress >= 0.7) return 'proficient';
  if (subtopicProgress > 0) return 'in-progress';
  return 'not-started';
}

function formatTopicName(topic) {
  return topic
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 