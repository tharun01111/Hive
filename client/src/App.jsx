import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useAuthStore } from "./store/auth.store.js";
import { getMeApi, refreshApi } from "./api/auth.api.js";
import { initSocket } from "./socket/socket.js";
import { watchSystemTheme } from "./utils/theme.js";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import WorkspacePage from "./pages/workspace/WorkspacePage.jsx";
import ProjectPage from "./pages/project/ProjectPage.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const LandingGate = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />;
};

export default function App() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);
  const bootstrapped = useRef(false);

  useEffect(() => {
    // Guard against double execution — runs once intentionally
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      try {
        const { data: refreshData } = await refreshApi();
        setAccessToken(refreshData.accessToken);
        const { data } = await getMeApi();
        setAuth(data.user, refreshData.accessToken);
      } catch {
        logout();
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stop = watchSystemTheme(() => {});
    return stop;
  }, []);

  useEffect(() => {
    if (accessToken) {
      initSocket(accessToken);
    }
  }, [accessToken]);

  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/" element={<LandingGate />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:workspaceId"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MotionConfig>
  );
}
