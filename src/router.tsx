import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { bootstrapMocks } from "./mocks/bootstrap";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AthletesListPage } from "./pages/AthletesListPage";
import { AthletePage } from "./pages/AthletePage";
import { TeamsListPage } from "./pages/TeamsListPage";
import { TeamPage } from "./pages/TeamPage";
import { NewMatchPage } from "./pages/NewMatchPage";
import { LiveMatchPage } from "./pages/LiveMatchPage";
import { MatchRecapPage } from "./pages/MatchRecapPage";
import { ActionsConfigPage } from "./pages/ActionsConfigPage";
import { useTeamsStore } from "./stores/useTeamsStore";

function Protected({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

function AnalystOnly({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "team_viewer") return <Navigate to="/team-home" replace />;
  return <>{children}</>;
}

function TeamHome() {
  const user = useAuthStore((s) => s.user);
  const teamsMap = useTeamsStore((s) => s.teams);
  const firstTeamId = Object.values(teamsMap).sort((a, b) => a.name.localeCompare(b.name, "it"))[0]?.id;
  const teamId = user?.teamId ?? firstTeamId;
  if (!teamId) return <Navigate to="/login" replace />;
  return <Navigate to={`/teams/${teamId}`} replace />;
}

export function AppRouter() {
  useEffect(() => {
    bootstrapMocks();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/match/live/:id"
        element={
          <Protected>
            <LiveMatchPage />
          </Protected>
        }
      />

      <Route
        path="/"
        element={
          <Protected>
            <AppShell breadcrumbs={<b>Dashboard</b>}>
              <AnalystOnly>
                <DashboardPage />
              </AnalystOnly>
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/athletes"
        element={
          <Protected>
            <AppShell breadcrumbs={<><Link to="/" className="hover:text-white">Home</Link> / <b>Atleti</b></>}>
              <AnalystOnly>
                <AthletesListPage />
              </AnalystOnly>
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/athletes/:id"
        element={
          <Protected>
            <AppShell breadcrumbs={<><Link to="/athletes" className="hover:text-white">Atleti</Link> / <b>Profilo</b></>}>
              <AnalystOnly>
                <AthletePage />
              </AnalystOnly>
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/teams"
        element={
          <Protected>
            <AppShell breadcrumbs={<><Link to="/" className="hover:text-white">Home</Link> / <b>Squadre</b></>}>
              <AnalystOnly>
                <TeamsListPage />
              </AnalystOnly>
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/teams/:id"
        element={
          <Protected>
            <AppShell breadcrumbs={<><Link to="/teams" className="hover:text-white">Squadre</Link> / <b>Dettaglio</b></>}>
              <TeamPage />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/team-home"
        element={
          <Protected>
            <TeamHome />
          </Protected>
        }
      />
      <Route
        path="/match/new"
        element={
          <Protected>
            <AppShell breadcrumbs={<b>Nuovo Match</b>}>
              <AnalystOnly>
                <NewMatchPage />
              </AnalystOnly>
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/match/:id/recap"
        element={
          <Protected>
            <AppShell breadcrumbs={<><Link to="/" className="hover:text-white">Match</Link> / <b>Recap</b></>}>
              <MatchRecapPage />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/settings/actions"
        element={
          <Protected>
            <AppShell breadcrumbs={<><span>Configurazione</span> / <b>Azioni</b></>}>
              <AnalystOnly>
                <ActionsConfigPage />
              </AnalystOnly>
            </AppShell>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
