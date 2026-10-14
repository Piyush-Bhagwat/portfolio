import { useState } from "react";
import "./style/main.style.css";
import "./style/mobile.style.css";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/Home.page";
import ProjectPage from "./pages/Project.page";
import Dashboard from "./pages/Dashboard";
import { BrutalistShowcase } from "./components/brutalist";
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
    const [navOpen, setNavOpen] = useState(false);
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
        <div className="app">
            {/* Live Deployment Notice Banner */}
            <div
                role="alert"
                className="bg-amber-400 text-black px-4 py-2.5 border-b-2 border-black font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 tracking-tight z-50 text-center shadow-sm"
            >
                <span className="inline-block w-2 h-2 bg-black rounded-full animate-ping shrink-0" />
                <span>
                    ⚠️ Website refactoring under process, expect unusual behaviour.
                </span>
            </div>
            <header>
                <div className="container">
                    <div className="logo">
                        Ab
                        {!navOpen && (
                            <button
                                className="ham"
                                onClick={() => setNavOpen(true)}
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                        )}
                    </div>
                    <nav className={navOpen ? "nav-open" : ""}>
                        <button
                            className="close"
                            onClick={() => setNavOpen(false)}
                        >
                            X
                        </button>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/projects">Projects</Link>
                            </li>
                            <li>
                                <Link to="/v2-preview" style={{ color: "#10b981", fontWeight: "bold" }}>
                                    ⚡ V2 Primitives
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin" style={{ color: "#06b6d4", fontWeight: "bold" }}>
                                    🛡️ Admin CMS
                                </Link>
                            </li>
                            <li>
                                <a href="/#about">About</a>
                            </li>
                        </ul>
                    </nav>
                    <span className="btn cta">
                        <a href="mailto:piyushbhagwat5@example.com?subject=Website Inquiry">
                            Contact Me
                        </a>
                    </span>
                </div>
            </header>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectPage />} />
                <Route path="/manage" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/v2-preview" element={<BrutalistShowcase />} />
            </Routes>

            <section className="action">
                <h1>Have a project in mind? Let&apos;s get to work. 🤝</h1>
                <div className="control">
                    <span className="btn cta">
                        <a href="mailto:piyushbhagwat5@example.com?subject=Website Inquiry">
                            Say Hello
                        </a>
                    </span>

                    <div className="btn">
                        <Link to="/projects">Portfolio</Link>
                    </div>
                </div>
            </section>

            <footer>
                <div className="box">
                    <i className="fa-solid fa-phone"></i> +91 93099861442
                </div>
                <div className="box">
                    <i className="fa-solid fa-envelope"></i>{" "}
                    piyushbhagwat5@gmail.com
                </div>
                <div className="box">
                    <i className="fa-solid fa-location-dot"></i> Brahmapuri,
                    Maharashtra, India
                </div>
            </footer>
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
