import React, { useEffect, useState } from "react";
import "./style/main.style.css";
import "./style/mobile.style.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/Home.page";
import ProjectPage from "./pages/Project.page";
import Dashboard from "./pages/Dashboard";

const App = () => {
    const [navOpen, setNavOpen] = useState(false);
    return (
        <BrowserRouter>
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
                        <nav className={navOpen && "nav-open"}>
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
                                    <a href="/#about">About</a>
                                </li>
                            </ul>
                        </nav>
                        <btn className="btn cta">
                            <a href="mailto:piyushbhagwat5@example.com?subject=Website Inquiry">
                                Contact Me
                            </a>
                        </btn>
                    </div>
                </header>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<ProjectPage />} />
                    <Route path="/manage" element={<Dashboard />} />
                </Routes>

                <section className="action">
                    <h1>Have a project in mind? Let's get to work. 🤝</h1>
                    <div className="control">
                        <btn className="btn cta">
                            <a href="mailto:piyushbhagwat5@example.com?subject=Website Inquiry">
                                Say Hello
                            </a>
                        </btn>

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
        </BrowserRouter>
    );
};

export default App;
