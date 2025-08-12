import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import Navigation from "./components/Navigation"
import HomePage from "./pages/HomePage"
import AuthorDashboard from "./pages/AuthorDashboard"
import ReviewerDashboard from "./pages/ReviewerDashboard"
import EditorialProfile from "./pages/EditorialProfile"
import EditorialBoardDashboard from "./pages/EditorialBoardDashboard"
import EditorChiefDashboard from "./pages/EditorChiefDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import AuthorProfile from "./pages/AuthorProfile"
import ReviewerProfile from "./pages/ReviewerProfile"
// добавляем импорт новой страницы подачи статей
import SubmitArticle from "./pages/SubmitArticle"
import DashboardLayout from "./components/layout/DashboardLayout"

function AppContent() {
  const location = useLocation()
  const isHomePage = location.pathname === "/"

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/author-dashboard" element={<AuthorDashboard />} />
        <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
        <Route path="/editorial-profile" element={<EditorialProfile />} />
        <Route path="/editorial-board-dashboard" element={<EditorialBoardDashboard />} />
        <Route path="/editor-chief-dashboard" element={<EditorChiefDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/author-profile" element={<AuthorProfile />} />
        <Route path="/reviewer-profile" element={<ReviewerProfile />} />
        {/* добавляем маршрут для формы подачи статей */}
        <Route path="/submit-article" element={<SubmitArticle />} />
      </Routes>
    </DashboardLayout>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AppContent />
      </div>
    </Router>
  )
}

export default App
