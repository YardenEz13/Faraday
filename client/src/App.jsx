import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/theme-provider";
import { AuthProvider } from "./providers/auth";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import Navbar from "./components/layout/Navbar";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <AppRoutes />
            <Toaster position="top-center" reverseOrder={false} />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
