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
import PublicationTerms from "./pages/PublicationTerms";

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
import EditorialWorkflow from "@/pages/moderator/journals/EditorialWorkflow";
import EditorialCouncil from "@/pages/moderator/journals/EditorialCouncil";

import ArticlePage from "@/pages/ArticlePage";
import JournalArticles from "./pages/moderator/JournalArticles";
import RequireAuth from "@/auth/RequireAuth"; // <— важное
import ArticleScreening from "./pages/moderator/ArticleScreening";
import JournalTeam from "@/pages/moderator/JournalTeam";
import ArticleAdmin from "./pages/moderator/ArticleAdmin";
import RequireEditorialRole from "@/routes/RequireEditorialRole";
import ArticleView from "@/pages/ArticleView";
import EditArticlePage from "./pages/EditArticlePage";
import RequireRole from "@/auth/RequireRole";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import AppHomeSwitch from "@/routes/AppHomeSwitch";
import Forbidden from "./pages/Forbidden";
import SecretaryDashboard from "@/pages/secretary/SecretaryDashboard";
import EditorDashboard from "./pages/editor/EditorDashboard";
import ChiefEditorDashboard from "./pages/chief/ChiefEditorDashboard";
import ReviewerDashboard from "./pages/reviewer/ReviewerDashboard";
import ProofreaderDashboard from "./pages/proofreader/ProofreaderDashboard";
import IssuesList from "@/pages/journal/IssuesList";
import IssueTocPage from "@/pages/journal/IssueTocPage";
import VerifyEmailNotice from "@/pages/Login/VerifyEmailNotice";
import VerifyResult from "@/pages/Login/VerifyResult";
import OnboardingCreateOrg from "./pages/onboarding/OnboardingCreateOrg";
import OnboardingJoinOrg from "./pages/onboarding/OnboardingJoinOrg";
import ContactsPage from "./pages/ContactsPage";
import JournalsPublicPage from "./pages/JournalsPublicPage";
import NewsUpdatesPage from "./pages/NewsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import PublicOffer from "./pages/PublicOffer";
import PaymentAndRefund from "./pages/PaymentAndRefund";

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
      <Route path="/login/verify-email" element={<VerifyEmailNotice />} />
      <Route path="/login/verify-result" element={<VerifyResult />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/for-journals" element={<PublicationTerms />} />
      <Route path="/onboarding/create-org" element={<OnboardingCreateOrg />} />
      <Route path="/onboarding/join-org" element={<OnboardingJoinOrg />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/journals" element={<JournalsPublicPage />} />
      <Route path="/journals/:jid" element={<JournalView />} />
      <Route path="/news" element={<NewsUpdatesPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/public-offer" element={<PublicOffer />} />
      <Route path="/payment-and-refund" element={<PaymentAndRefund />} />
      {/* если зашли на несуществующий публичный путь */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

function PrivateRoutes() {
  // Оборачиваем целиком «дашбордную» часть одним RequireAuth
  return (
    <RequireAuth>
      <DashboardLayout>
        <Routes>
          <Route path="/app" element={<AppHomeSwitch />} />
          <Route path="/author-dashboard" element={<AuthorDashboard />} />
          <Route path="/editorial-profile" element={<EditorialProfile />} />
          <Route
            path="/editorial-board-dashboard"
            element={<EditorialBoardDashboard />}
          />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/author-profile" element={<AuthorProfile />} />
          <Route path="/reviewer-profile" element={<ReviewerProfile />} />
          <Route path="/submit-article" element={<SubmitArticle />} />

          <Route path="/moderator" element={<ModeratorDashboard />} />
          <Route
            path="/moderator/organizations"
            element={<OrganizationList />}
          />
          <Route
            path="/moderator/organizations/new"
            element={<OrganizationCreate />}
          />
          <Route
            path="/moderator/organizations/:id"
            element={<OrganizationView />}
          />
          <Route
            path="/moderator/organizations/:id/edit"
            element={<OrganizationEdit />}
          />
          <Route
            path="/moderator/organizations/:id/add-journal"
            element={<AddJournal />}
          />

          <Route path="/moderator/journals/:jid" element={<JournalView />} />
          <Route
            path="/moderator/journals/:jid/settings"
            element={<JournalSettings />}
          />
          <Route
            path="/moderator/journals/:jid/reviewers"
            element={<Reviewers />}
          />
          <Route
            path="/moderator/journals/:jid/editorial"
            element={<EditorialBoard />}
          />
          <Route
            path="/moderator/journals/:jid/reviewer"
            element={<ReviewerDashboard />}
          />
          <Route
            path="/moderator/journals/:jid/workflow"
            element={<EditorialWorkflow />}
          />
          <Route
            path="/moderator/journals/:jid/council"
            element={<EditorialCouncil />}
          />

          <Route path="/journals/:jid" element={<JournalView />} />

          <Route
            path="/moderator/journals/:jid/articles"
            element={<JournalArticles />}
          />
          <Route
            path="/moderator/articles/:aid/screening"
            element={<ArticleScreening />}
          />
          <Route
            path="/moderator/journals/:id/team"
            element={<JournalTeam />}
          />
          <Route
            path="/moderator/journals/:jid/articles/:aid"
            element={
              <RequireEditorialRole>
                <ArticleAdmin />
              </RequireEditorialRole>
            }
          />
          <Route path="/articles/:id" element={<ArticleView />} />
          <Route path="/articles/:id/edit" element={<EditArticlePage />} />
          <Route
            path="/manager"
            element={
              <RequireRole roles={["manager"]}>
                <ManagerDashboard />
              </RequireRole>
            }
          />

          <Route path="/secretary" element={<SecretaryDashboard />} />
          <Route path="/editorial" element={<EditorDashboard />} />
          <Route path="/chief_editorial" element={<ChiefEditorDashboard />} />
          <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
          <Route
            path="/proofreafer-dashboard"
            element={<ProofreaderDashboard />}
          />
          <Route path="/journals/:jid/issues" element={<IssuesList />} />
          <Route path="/journals/:jid/issues/:iid" element={<IssueTocPage />} />

          {/* несуществующие приватные пути — на /app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
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
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const stripBase = (p) =>
    base && p.startsWith(base) ? p.slice(base.length) || "/" : p;
  const pathname = stripBase(location.pathname);

  const publicPaths = new Set([
    "/",
    "/about-journal",
    "/editorial-board",
    "/author-info",
    "/for-journals",
    "/requirements",
    "/login",
    "/register",
    "/login/verify-email",
    "/login/verify-result",
    "/onboarding/create-org",
    "/onboarding/join-org",
    "/contacts",
    "/journals",
    "/journals/:jid",
    "/news",
    "/privacy",
    "/public-offer",
    "/payment-and-refund",
    "/403",
  ]);

  const isPublic = publicPaths.has(pathname);
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
