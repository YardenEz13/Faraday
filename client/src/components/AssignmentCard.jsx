import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';

export function AssignmentCard({ assignment, isHovered, onMouseEnter, onMouseLeave }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const getLocalizedTitle = (title) => {
    if (typeof title === 'string') return title;
    return title?.[i18n.language] || title?.en || title?.he || t('common.untitled');
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PP');
    } catch (error) {
      return t('dashboard.dateNotAvailable');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 dark:bg-green-500/20';
      case 'late':
        return 'bg-red-500/10 text-red-500 dark:bg-red-500/20';
      case 'active':
        return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative"
    >
      <Card className={`overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-lg' : 'shadow-md'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(assignment.status)}`}>
              {t(`dashboard.${assignment.status}`)}
            </Badge>
            {assignment.dueDate && (
              <span className="text-sm text-muted-foreground">
                {t('common.dueDate')}: {formatDate(assignment.dueDate)}
              </span>
            )}
          </div>
          <CardTitle className={`text-xl ${isRTL ? 'font-yarden' : 'font-inter'}`}>
            {getLocalizedTitle(assignment.title)}
          </CardTitle>
          {assignment.description && (
            <CardDescription className={isRTL ? 'font-yarden' : 'font-inter'}>
              {assignment.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              {assignment.grade && (
                <p className="text-sm text-muted-foreground">
                  {t('common.grade')}: {assignment.grade}
                </p>
              )}
            </div>
            <Link to={`/assignments/${assignment._id}`}>
              <Button>
                {t('assignments.viewAssignment')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 