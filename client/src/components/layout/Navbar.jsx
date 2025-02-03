import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../providers/auth";
import { HandMetal, Brain, Menu, X, Users, LayoutDashboard, University } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`container mx-auto px-4 sm:px-6 py-3 sm:py-4 ${isRTL ? 'rtl rtl-font' : 'ltr ltr-font'}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <Link to="/" className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold hover:text-primary transition-colors group">
              <HandMetal className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float group-hover:scale-110 transition-transform dark:text-green-900 text-green-900" />
              <span className="bg-gradient-to-r from-primary to-green-900 bg-clip-text text-transparent">
                Faraday
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden sm:flex items-center gap-4 flex-1 justify-center">
            {user.role === 'teacher' ? (
              <>
                <Button asChild variant="ghost" className={`text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/dashboard/teacher">
                    <LayoutDashboard className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/assignment/create">
                    <Brain className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.createAssignment')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/classes">
                    <Users className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.classes')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/students">
                    <Users className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.students')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className={`text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/dashboard/student">
                    <LayoutDashboard className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/practice">
                    <Brain className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} dark:text-green-900 text-green-900 `} />
                    {t('nav.practice')}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button 
                onClick={logout} 
                variant="ghost"
                className={`text-sm hidden sm:inline-flex transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 hover:text-white dark:hover:from-red-600 dark:hover:to-rose-600 ${isRTL ? 'font-yarden' : 'font-inter'}`}
              >
                {t('nav.logout')}
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="sm:hidden p-2 hover:bg-primary/10 rounded-md transition-colors"
            aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden py-4 space-y-3">
            {user.role === 'teacher' ? (
              <>
                <Button asChild variant="ghost" className={`w-full justify-start text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/dashboard/teacher" onClick={toggleMenu}>
                    <LayoutDashboard className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`w-full justify-start text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/assignment/create" onClick={toggleMenu}>
                    <Brain className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.createAssignment')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`w-full justify-start text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/classes" onClick={toggleMenu}>
                    <University className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.classes')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`w-full justify-start text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/students" onClick={toggleMenu}>
                    <Users className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.students')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className={`w-full justify-start text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/dashboard/student" onClick={toggleMenu}>
                    <LayoutDashboard className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={`w-full justify-start text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link to="/practice" onClick={toggleMenu}>
                    <Brain className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.practice')}
                  </Link>
                </Button>
              </>
            )}
            <div className="flex items-center gap-3 py-2 justify-end">
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
            <Button 
              onClick={() => { logout(); toggleMenu(); }}
              variant="ghost" 
              className={`w-full text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 hover:text-white dark:hover:from-red-600 dark:hover:to-rose-600 ${isRTL ? 'font-yarden' : 'font-inter'}`}
            >
              {t('nav.logout')}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
} 