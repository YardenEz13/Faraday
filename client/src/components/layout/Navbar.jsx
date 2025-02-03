import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../providers/auth";
import { Zap } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-colors group">
            <Zap className="w-6 h-6 text-primary animate-float group-hover:scale-110 transition-transform" />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Faraday
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user.role === 'teacher' ? (
              <>
                <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                  <Link to="/dashboard/teacher">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                  <Link to="/students">Students</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                  <Link to="/assignment/create">יצירת מטלה</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                  <Link to="/dashboard/student">My Assignments</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={logout}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 