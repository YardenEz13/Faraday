import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { Zap } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user?.role === 'teacher') {
      navigate('/dashboard/teacher');
    } else if (user?.role === 'student') {
      navigate('/dashboard/student');
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleLogoClick} 
            className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-colors group"
          >
            <Zap className="w-6 h-6 text-primary animate-float group-hover:scale-110 transition-transform" />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Faraday
            </span>
          </button>

          <div className="flex items-center gap-4">
            {user?.role === 'teacher' && (
              <Link to="/students-table">
                <Button variant="ghost" 
                  className="hover:bg-primary/10 hover:text-primary transition-colors">
                  Students Statistics
                </Button>
              </Link>
            )}
            {user?.role === 'student' && (
              <Link to="/practice">
                <Button variant="ghost" 
                  className="hover:bg-primary/10 hover:text-primary transition-colors">
                  Practice
                </Button>
              </Link>
            )}
            {user && (
              <Button 
                variant="outline" 
                onClick={logout}
                className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 