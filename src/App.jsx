import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import AuthorDashboard from "./pages/AuthorDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import EditorialProfile from "./pages/EditorialProfile";
import EditorialBoardDashboard from "./pages/EditorialBoardDashboard";
import EditorChiefDashboard from "./pages/EditorChiefDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorProfile from "./pages/AuthorProfile";
import ReviewerProfile from "./pages/ReviewerProfile";
import SubmitArticle from "./pages/SubmitArticle";
import AboutJournal from "./pages/AboutJournal";
import EditorialBoard from "./pages/EditorialBoard";
import AuthorInfo from "./pages/AuthorInfo";
import PublicationTerms from "./pages/PublicationTerms";
import DashboardLayout from "./components/layout/DashboardLayout";
import RequirementsPage from "./pages/RequirementsPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";

function AppContent() {
  const location = useLocation();
  const pagesWithoutDashboard = [
    "/",
    "/about-journal",
    "/editorial-board",
    "/author-info",
    "/publication-terms",
    "/requirements",
    "/login",
    "/register",
  ];
  const shouldUseDashboard = !pagesWithoutDashboard.includes(location.pathname);

  if (!shouldUseDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about-journal" element={<AboutJournal />} />
          <Route path="/editorial-board" element={<EditorialBoard />} />
          <Route path="/author-info" element={<AuthorInfo />} />
          <Route path="/publication-terms" element={<PublicationTerms />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/author-dashboard" element={<AuthorDashboard />} />
        <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
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
      </Routes>
    </DashboardLayout>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
