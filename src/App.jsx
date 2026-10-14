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
import ModulePlaceholder from "./pages/admin/ModulePlaceholder";

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
                        <Route
                            path="profile"
                            element={
                                <ModulePlaceholder
                                    title="Profile & Bio CMS"
                                    day="Day 3"
                                    description="Manage personal headline, multi-paragraph bio, location, and Cloudinary avatar."
                                />
                            }
                        />
                        <Route
                            path="projects"
                            element={
                                <ModulePlaceholder
                                    title="Projects & Case Studies CMS"
                                    day="Day 4"
                                    description="Manage dynamic projects, technical case studies, problem solving Q&A, and project media."
                                />
                            }
                        />
                        <Route
                            path="skills"
                            element={
                                <ModulePlaceholder
                                    title="Skills & Stack CMS"
                                    day="Day 3"
                                    description="Categorize and reorder frontend, backend, database skills with Cloudinary icons."
                                />
                            }
                        />
                        <Route
                            path="experience"
                            element={
                                <ModulePlaceholder
                                    title="Work Experience CMS"
                                    day="Day 3"
                                    description="Manage career milestones, roles, companies, and date ranges."
                                />
                            }
                        />
                        <Route
                            path="blogs"
                            element={
                                <ModulePlaceholder
                                    title="Technical Blogs CMS"
                                    day="Day 5"
                                    description="Split-pane Markdown authoring editor with real-time preview and Cloudinary asset pipeline."
                                />
                            }
                        />
                        <Route
                            path="blogs/new"
                            element={
                                <ModulePlaceholder
                                    title="New Technical Blog"
                                    day="Day 5"
                                    description="Create a new technical article using the split Markdown editor."
                                />
                            }
                        />
                    </Route>
                </Route>
            </Routes>
        );
    }

    return (
        <div className="app">
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

export default App;
