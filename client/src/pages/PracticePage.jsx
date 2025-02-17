import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { Brain, Calculator, ChevronRight, Sigma, Triangle, ArrowUpRight, Infinity, LineChart, Box, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const topics = [
  { 
    id: 'equations',
    icon: Calculator,
    color: 'text-teal-500',
    gradient: 'from-teal-500/10 to-transparent'
  },
  { 
    id: 'trigonometry',
    icon: Triangle,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-transparent'
  },
  { 
    id: 'vectors',
    icon: ArrowUpRight,
    color: 'text-green-500',
    gradient: 'from-green-500/10 to-transparent'
  },
  { 
    id: 'complex',
    icon: Infinity,
    color: 'text-teal-600',
    gradient: 'from-teal-600/10 to-transparent'
  },
  { 
    id: 'calculus',
    icon: LineChart,
    color: 'text-emerald-600',
    gradient: 'from-emerald-600/10 to-transparent'
  },
  { 
    id: 'sequences',
    icon: Sigma,
    color: 'text-green-600',
    gradient: 'from-green-600/10 to-transparent'
  },
  { 
    id: 'geometry',
    icon: Box,
    color: 'text-teal-500',
    gradient: 'from-teal-500/10 to-transparent'
  },
  { 
    id: 'probability',
    icon: Percent,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-transparent'
  }
];

export default function PracticePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const navigate = useNavigate();
  const [hoveredTopic, setHoveredTopic] = useState(null);

  const handleTopicClick = (topicId) => {
    navigate(`/practice/${topicId}`);
  };

  return (
    <div className="relative min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isRTL ? 'font-yarden' : 'font-inter'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Brain className="w-8 h-8 text-teal-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              {t('practice.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('practice.description')}</p>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {topics.map((topic) => {
              const TopicIcon = topic.icon;
              const isHovered = hoveredTopic === topic.id;

              return (
                <motion.div
                  key={topic.id}
                  variants={item}
                  layout
                  whileHover={{ 
                    scale: 1.03,
                    transition: { type: "spring", stiffness: 300, damping: 10 }
                  }}
                  onHoverStart={() => setHoveredTopic(topic.id)}
                  onHoverEnd={() => setHoveredTopic(null)}
                  onClick={() => handleTopicClick(topic.id)}
                  className="cursor-pointer group"
                >
                  <Card className={`relative overflow-hidden border-primary/20 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-300`}>
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <CardHeader className="relative">
                      <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <motion.div 
                          className={`p-2 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${topic.color} group-hover:scale-110 transition-transform duration-300`}
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <TopicIcon className="w-5 h-5" />
                        </motion.div>
                        <span className="group-hover:text-primary transition-colors duration-300">
                          {t(`practice.topics.${topic.id}.title`)}
                        </span>
                      </CardTitle>
                      <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                        {t(`practice.topics.${topic.id}.description`)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative pb-4">
                      <motion.div
                        animate={{ 
                          x: isHovered ? (isRTL ? -5 : 5) : 0,
                          transition: { type: "spring", stiffness: 300, damping: 10 }
                        }}
                        className={`flex items-center gap-1 text-sm ${topic.color} ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <span>{t('practice.start')}</span>
                        <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform duration-300`} />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
