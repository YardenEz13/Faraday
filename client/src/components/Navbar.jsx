import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";

function Navbar() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-foreground text-lg font-semibold">
              Faraday
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <ThemeToggle />
            
            {token ? (
              <>
                {userRole === "teacher" && (
                  <>
                    <Link to="/dashboard/teacher" className="text-foreground hover:text-primary">
                      Dashboard
                    </Link>
                    <Link to="/students" className="text-foreground hover:text-primary">
                      Students
                    </Link>
                  </>
                )}
                {userRole === "student" && (
                  <>
                    <Link to="/dashboard/student" className="text-foreground hover:text-primary">
                      Dashboard
                    </Link>
                    <Link to="/practice" className="text-foreground hover:text-primary">
                      Practice
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userRole");
                    window.location.href = "/";
                  }}
                  className="text-foreground hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="text-foreground hover:text-primary">
                  Login
                </Link>
                <Link to="/register" className="text-foreground hover:text-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
