import { useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/auth";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import Navbar from "./components/layout/Navbar";
import "./i18n";  // Import i18n configuration
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "./context/theme-provider";

function App() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    // Set HTML dir attribute
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    // Add/remove RTL class from document
    document.documentElement.classList.toggle('rtl', isRTL);
  }, [isRTL]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <div className={`min-h-screen bg-background ${isRTL ? 'rtl rtl-font' : 'ltr ltr-font'}`}>
            <Navbar/>
            <AppRoutes />
            <Toaster 
              position="top-center"
              toastOptions={{
                className: isRTL ? 'rtl-font' : 'ltr-font',
                style: {
                  direction: isRTL ? 'rtl' : 'ltr',
                },
              }}
            />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
