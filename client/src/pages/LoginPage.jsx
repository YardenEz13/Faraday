// client/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "react-hot-toast";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "../components/ui/theme-toggle";

export default function LoginPage() {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData);
      if (!result.success) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isRTL = i18n.language === 'he';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-500/80 dark:from-teal-500/20 via-emerald-500/80 dark:via-emerald-500/20 to-green-500/80 dark:to-green-500/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-teal-500/50 dark:bg-teal-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-emerald-500/50 dark:bg-emerald-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 top-48 left-48 bg-green-500/50 dark:bg-green-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 w-[350px] relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1 
          }}
          className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-8 h-8 text-teal-500 dark:text-teal-400" />
        </motion.div>

        <Card className="w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-xl border-white/20 dark:border-gray-700/20 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
          <CardHeader>
            <CardTitle className={`text-2xl ${isRTL ? 'font-yarden' : 'font-inter'} text-${isRTL ? 'right' : 'left'} transition-all duration-300 text-center`}>
              {t('auth.login')}
            </CardTitle>
            <CardDescription className={`${isRTL ? 'font-yarden' : 'font-inter'} text-${isRTL ? 'right' : 'left'} transition-all duration-300 text-center`}>
              {t('auth.loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label 
                  htmlFor="email" 
                  className={`${isRTL ? 'font-yarden' : 'font-inter'} text-${isRTL ? 'right' : 'left'} block transition-all duration-300`}
                >
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full ${isRTL ? 'font-yarden' : 'font-inter'} transition-all duration-300 bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900`}
                  dir="ltr"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label 
                  htmlFor="password" 
                  className={`${isRTL ? 'font-yarden' : 'font-inter'} text-${isRTL ? 'right' : 'left'} block transition-all duration-300`}
                >
                  {t('auth.password')}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full ${isRTL ? 'font-yarden' : 'font-inter'} transition-all duration-300 bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900`}
                  dir="ltr"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  type="submit" 
                  className={`w-full ${isRTL ? 'font-yarden' : 'font-inter'} transition-all duration-300 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white dark:from-teal-600 dark:to-emerald-600 dark:hover:from-teal-500 dark:hover:to-emerald-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('auth.loggingIn')}
                    </span>
                  ) : (
                    t('auth.login')
                  )}
                </Button>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'} transition-all duration-300`}
              >
                {t('auth.noAccount')}{" "}
                <Link to="/register" className="text-teal-500 dark:text-teal-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline font-medium transition-colors duration-200">
                  {t('auth.registerHere')}
                </Link>
              </motion.p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
