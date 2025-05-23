import React, { useContext, useEffect } from "react";
import myIMG from "../images/myIMG.jpg";
import Title from "../components/Title";
import reactIMG from "../images/react.png";
import SkillCard from "../components/SkillCard";
import htmlIMG from "../images/htmlcss.png";
import gitIMG from "../images/github.png";
import fireIMG from "../images/fire.png";
import mongoIMG from "../images/monDB.png";
import nodeIMG from "../images/node.png";
import jsIMG from "../images/js.png";
import vueIMG from "../images/vue.png";
import { context } from "../context/context";
import ProjectCard from "../components/ProjectCard";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";

const HomePage = () => {
    const { projects } = useContext(context);

    const renderProjects = () => {
        return (
            <>
                {projects?.slice(0, 6).map((item) => {
                    return <ProjectCard project={item} />;
                })}
            </>
        );
    };
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main>
            <section className="hero alternate">
                <div className="left">
                    <Reveal>
                        <h1>
                            Hey I am{" "}
                            <span className="highlight">Piyush Bhagwat</span>,
                            An <span className="highlight">Abnormal</span>{" "}
                            webdeveloper. I love to make minmal website like
                            this :)
                        </h1>
                    </Reveal>
                    <Reveal>
                        <div className="socials">
                            <a
                                target="_blank"
                                href="https://www.instagram.com/ab_nrmal/"
                            >
                                <i class="fa-brands fa-instagram"></i>
                            </a>
                            <a
                                target="_blank"
                                href="https://www.linkedin.com/in/piyush-bhagwat/"
                            >
                                <i class="fa-brands fa-linkedin"></i>
                            </a>
                            <a
                                target="_blank"
                                href="https://www.facebook.com/profile.php?id=100085488072819"
                            >
                                <i class="fa-brands fa-facebook"></i>
                            </a>
                            <a
                                target="_blank"
                                href="https://x.com/PiyushBhagwat11"
                            >
                                <i class="fa-brands fa-twitter"></i>
                            </a>
                        </div>
                    </Reveal>

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
                </div>

                <div className="right">
                    <img src={myIMG} alt="photo of Piyush" />
                </div>
            </section>

            <section className="about" id="about">
                <Title text="About Me" />

                <Reveal>
                    <div className="content">
                        <p>
                            Hi, I'm Piyush Bhawgat! I'm a well-rounded{" "}
                            <span className="highlight">Web Developer</span>with
                            a passion for crafting clean and{" "}
                            <span className="highlight">minimal</span> websites.
                            I've tackled numerous projects throughout my career,
                            wielding my expertise in both{" "}
                            <span className="highlight">
                                frontend and backend development
                            </span>
                            . I'm always eager to learn and explore new
                            technologies, constantly pushing the boundaries of
                            what's possible on the web. When I'm not coding, you
                            might find me getting creative through{" "}
                            <span className="highlight">art.</span>
                        </p>
                    </div>
                </Reveal>
            </section>

            <section className="skills">
                <Title text="My Skills" />

                <div className="content">
                    <SkillCard img={reactIMG} name="React JS" />
                    <SkillCard img={jsIMG} name="JavaScript" />
                    <SkillCard img={vueIMG} name="Vue JS" />
                    <SkillCard img={fireIMG} name="Firebase" />
                    <SkillCard img={htmlIMG} name="HTML + CSS" />
                    <SkillCard img={nodeIMG} name="Node JS" />
                    <SkillCard img={mongoIMG} name="Mongo DB" />
                    <SkillCard img={gitIMG} name="GIT github" />
                </div>
            </section>

            <section className="projects alternate">
                <Title text="My Projects" />

                <div className="content">{renderProjects()}</div>
                <div className="btn cta">
                    <Link to="/projects">Portfolio</Link>
                </div>
            </section>
        </main>
    );
};

export default HomePage;
