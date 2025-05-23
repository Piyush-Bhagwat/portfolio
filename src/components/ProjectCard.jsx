import React from "react";
import Reveal from "./Reveal";
import { deleteProject } from "../db/firebase.db";

const ProjectCard = ({ project, isEditable }) => {
    return (
        <div className="project-card box">
            <div className="image">
                <img loading="lazy" src={project.img} alt="project-image" />
                <a target="_blank" href={project.link}>
                    <i className="fa-solid fa-arrow-right"></i>
                </a>
            </div>

            <Reveal>
                <h2>{project.title}</h2>
                <p>{project.disc}</p>
            </Reveal>

            <Reveal>
                <div className="tags">
                    {project.tags.map((tag) => (
                        <div className="tag">{tag}</div>
                    ))}
                </div>
            </Reveal>

            {isEditable === true && (
                <button onClick={() => deleteProject(project.id)}>
                    Delete
                </button>
            )}
        </div>
    );
};

export default ProjectCard;
