import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import FullScreenSplash from "@/components/FullScreenSplash";

import HomePage from "./pages/HomePage";
import AuthorDashboard from "./pages/AuthorDashboard";
import EditorialProfile from "./pages/EditorialProfile";
import EditorialBoardDashboard from "./pages/EditorialBoardDashboard";
import EditorChiefDashboard from "./pages/EditorChiefDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorProfile from "./pages/AuthorProfile";
import ReviewerProfile from "./pages/ReviewerProfile";
import SubmitArticle from "./pages/SubmitArticle";
import AboutJournal from "./pages/AboutJournal";
import AuthorInfo from "./pages/AuthorInfo";
import DashboardLayout from "./components/layout/DashboardLayout";
import RequirementsPage from "./pages/RequirementsPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";

import OrganizationList from "@/pages/moderator/organizations/OrganizationList";
import OrganizationCreate from "@/pages/moderator/organizations/OrganizationCreate";
import OrganizationView from "@/pages/moderator/organizations/OrganizationView";
import OrganizationEdit from "@/pages/moderator/organizations/OrganizationEdit";
import ModeratorDashboard from "@/pages/moderator/ModeratorDashboard";
import AddJournal from "@/pages/moderator/journals/AddJournal";
import JournalView from "@/pages/moderator/journals/JournalView";
import JournalSettings from "@/pages/moderator/journals/JournalSettings";
import Reviewers from "@/pages/moderator/journals/Reviewers";
import EditorialBoard from "@/pages/moderator/journals/EditorialBoard";
import ReviewerDashboard from "@/pages/moderator/journals/ReviewerDashboard";
import EditorialWorkflow from "@/pages/moderator/journals/EditorialWorkflow";
import EditorialCouncil from "@/pages/moderator/journals/EditorialCouncil";

import ArticlePage from "@/pages/ArticlePage";
import InitialScreeningPage from "@/pages/editorial/InitialScreeningPage";

import RequireAuth from "@/auth/RequireAuth"; // <— важное

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about-journal" element={<AboutJournal />} />
      <Route path="/editorial-board" element={<EditorialBoard />} />
      <Route path="/author-info" element={<AuthorInfo />} />
      <Route path="/requirements" element={<RequirementsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* если зашли на несуществующий публичный путь */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PrivateRoutes() {
  // Оборачиваем целиком «дашбордную» часть одним RequireAuth
  return (
    <RequireAuth>
      <DashboardLayout>
        <Routes>
          <Route path="/author-dashboard" element={<AuthorDashboard />} />
          <Route path="/editorial-profile" element={<EditorialProfile />} />
          <Route
            path="/editorial-board-dashboard"
            element={<EditorialBoardDashboard />}
          />
          <Route
            path="/editor-chief-dashboard"
            element={<EditorChiefDashboard />}
          />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/author-profile" element={<AuthorProfile />} />
          <Route path="/reviewer-profile" element={<ReviewerProfile />} />
          <Route path="/submit-article" element={<SubmitArticle />} />

          <Route path="/moderator" element={<ModeratorDashboard />} />
          <Route path="/moderator/organizations" element={<OrganizationList />} />
          <Route path="/moderator/organizations/new" element={<OrganizationCreate />} />
          <Route path="/moderator/organizations/:id" element={<OrganizationView />} />
          <Route path="/moderator/organizations/:id/edit" element={<OrganizationEdit />} />
          <Route path="/moderator/organizations/:id/add-journal" element={<AddJournal />} />

          <Route path="/moderator/journals/:jid" element={<JournalView />} />
          <Route path="/moderator/journals/:jid/settings" element={<JournalSettings />} />
          <Route path="/moderator/journals/:jid/reviewers" element={<Reviewers />} />
          <Route path="/moderator/journals/:jid/editorial" element={<EditorialBoard />} />
          <Route path="/moderator/journals/:jid/reviewer" element={<ReviewerDashboard />} />
          <Route path="/moderator/journals/:jid/workflow" element={<EditorialWorkflow />} />
          <Route path="/moderator/journals/:jid/council" element={<EditorialCouncil />} />

          <Route path="/journals/:jid" element={<JournalView />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          <Route path="/editorial/screening" element={<InitialScreeningPage />} />

          {/* несуществующие приватные пути — на дашборд */}
          <Route path="*" element={<Navigate to="/author-dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </RequireAuth>
  );
}

function AppContent() {
  // Выбираем набор роутов по «публичности» текущего пути
  const location = useLocation();
  const { booted } = useAuth();             
  if (!booted) return <FullScreenSplash />;  

  const publicPaths = new Set([
    "/",
    "/about-journal",
    "/editorial-board",
    "/author-info",
    "/publication-terms",
    "/requirements",
    "/login",
    "/register",
  ]);

  const isPublic = publicPaths.has(location.pathname);
  return isPublic ? <PublicRoutes /> : <PrivateRoutes />;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}
