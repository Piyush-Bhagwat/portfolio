import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/public/HomePage";
import ProjectsPage from "./pages/public/ProjectsPage";
import BlogsPage from "./pages/public/BlogsPage";
import BlogPostPage from "./pages/public/BlogPostPage";
import Dashboard from "./pages/Dashboard";
import { BrutalistShowcase } from "./components/brutalist";
import { PublicNavbar, PublicFooter } from "./components/layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/admin/Login";
import Overview from "./pages/admin/Overview";
import ProfileCMS from "./pages/admin/ProfileCMS";
import SkillsCMS from "./pages/admin/SkillsCMS";
import ExperienceCMS from "./pages/admin/ExperienceCMS";
import ProjectsCMS from "./pages/admin/ProjectsCMS";
import BlogsCMS from "./pages/admin/BlogsCMS";
import BlogEditor from "./pages/admin/BlogEditor";

const MainContent = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    if (isAdminRoute) {
        return (
            <Routes>
                <Route path="/admin/login" element={<Login />} />
                <Route
                    path="/admin"
                    element={<ProtectedRoute redirectTo="/admin/login" />}
                >
                    <Route element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/overview" replace />} />
                        <Route path="overview" element={<Overview />} />
                        <Route path="profile" element={<ProfileCMS />} />
                        <Route path="projects" element={<ProjectsCMS />} />
                        <Route path="skills" element={<SkillsCMS />} />
                        <Route path="experience" element={<ExperienceCMS />} />
                        <Route path="blogs" element={<BlogsCMS />} />
                        <Route path="blogs/new" element={<BlogEditor />} />
                        <Route path="blogs/edit/:id" element={<BlogEditor />} />
                    </Route>
                </Route>
            </Routes>
        );
    }

    return (
        <div className="app min-h-screen bg-[#f4f7f4] dark:bg-black text-[#0f1a14] dark:text-zinc-100 font-mono flex flex-col justify-between selection:bg-emerald-600 dark:selection:bg-terminal-green selection:text-white dark:selection:text-black transition-colors duration-150">
            <PublicNavbar />

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/blogs" element={<BlogsPage />} />
                    <Route path="/blogs/:slug" element={<BlogPostPage />} />
                    <Route path="/manage" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/v2-preview" element={<BrutalistShowcase />} />
                </Routes>
            </main>

            <PublicFooter />
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <MainContent />
        </BrowserRouter>
    );
};

export { MainContent };
export default App;
