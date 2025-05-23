import React, { useContext, useEffect } from "react";
import { context } from "../context/context";
import Title from "../components/Title";
import ProjectCard from "../components/ProjectCard";

const ProjectPage = () => {
    const { projects } = useContext(context);
    useEffect(()=>{
        window.scrollTo(0, 0);
      },[])


    const renderProjects = () => {
        return (
            <>
                {projects?.map((item) => {
                    return <ProjectCard project={item} />;
                })}
            </>
        );
    };
    return (
        <section className="projects">
            <Title text="My Projects" />

            <div className="content">{renderProjects()}</div>
        </section>
    );
};

export default ProjectPage;
