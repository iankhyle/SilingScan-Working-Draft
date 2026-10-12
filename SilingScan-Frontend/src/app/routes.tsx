import {
  Outlet,
  Route,
  Routes,
} from "react-router";
import { AccessGate } from "./access-gate";
import { Layout } from "../components/refine-ui/layout/layout";
import AdminPage from "../pages/admin";
import AdvisoriesPage from "../pages/advisories";
import CropsPage from "../pages/crops";
import Dashboard from "../pages/dashboard";
import GuidancePage from "../pages/guidance";
import HistoryPage from "../pages/history";
import LoginPage from "../pages/login";
import ResearchPage from "../pages/research";
import ResultPage from "../pages/result";
import SignupPage from "../pages/signup";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        element={
          <AccessGate
            allowedRoles={[
              "farmer",
              "researcher",
              "agriculturist",
              "admin",
            ]}
          >
            <Layout>
              <Outlet />
            </Layout>
          </AccessGate>
        }
      >
        <Route
          path="/"
          element={
            <AccessGate allowedRoles={["farmer", "researcher"]}>
              <Dashboard />
            </AccessGate>
          }
        />
        <Route
          path="/crops"
          element={
            <AccessGate allowedRoles={["farmer"]}>
              <CropsPage />
            </AccessGate>
          }
        />
        <Route
          path="/research"
          element={
            <AccessGate allowedRoles={["researcher"]}>
              <ResearchPage />
            </AccessGate>
          }
        />
        <Route
          path="/advisories"
          element={
            <AccessGate
              allowedRoles={[
                "farmer",
                "researcher",
                "agriculturist",
                "admin",
              ]}
            >
              <AdvisoriesPage />
            </AccessGate>
          }
        />
        <Route
          path="/admin"
          element={
            <AccessGate allowedRoles={["admin"]}>
              <AdminPage />
            </AccessGate>
          }
        />
        <Route
          path="/history"
          element={
            <AccessGate
              allowedRoles={[
                "farmer",
                "researcher",
                "agriculturist",
                "admin",
              ]}
            >
              <HistoryPage />
            </AccessGate>
          }
        />
        <Route
          path="/result"
          element={
            <AccessGate allowedRoles={["farmer", "researcher"]}>
              <ResultPage />
            </AccessGate>
          }
        />
        <Route
          path="/guidance"
          element={
            <AccessGate allowedRoles={["farmer", "researcher"]}>
              <GuidancePage />
            </AccessGate>
          }
        />
      </Route>
    </Routes>
  );
}
