import React, { useContext, useEffect, useState } from "react";
import { context } from "../context/context";
import ProjectCard from "../components/ProjectCard";
import Title from "../components/Title";
import { addProject } from "../db/firebase.db";

const Dashboard = () => {
    const { projects } = useContext(context);
    const [formVisible, setFormVisible] = useState(false);

    const [formData, setFormData] = useState({
        disc: "",
        title: "",
        tags: "",
        link: "",
        date: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const renderProjects = () => {
        return (
            <>
                {projects?.map((item) => {
                    return <ProjectCard isEditable={true} project={item} />;
                })}
            </>
        );
    };
    return (
        <div>
            <section className="projects">
                <Title text="My Projects" />
                <button
                    onClick={() => setFormVisible((p) => !p)}
                    className="btn"
                >
                    Add project
                </button>
                {formVisible && (
                    <div className="addForm">
                        Title:{" "}
                        <input
                            name="title"
                            onChange={handleChange}
                            value={formData.title}
                            type="text"
                        />
                        Description:{" "}
                        <textarea
                            rows={10}
                            name="disc"
                            onChange={handleChange}
                            value={formData.desc}
                            cols={30}
                        ></textarea>
                        Link:
                        <input
                            type="text"
                            onChange={handleChange}
                            name="link"
                            value={formData.link}
                        />
                        Image: <input type="file" />
                        tags(comma):{" "}
                        <input
                            name="tags"
                            onChange={handleChange}
                            value={formData.tags}
                            type="text"
                        />
                        Date:{" "}
                        <input type="date" value={formData.date} onChange={handleChange} name="date" />
                        <button className="btn"  onClick={()=>addProject(formData)}> Add </button>
                    </div>
                )}
                <div className="content">{renderProjects()}</div>
            </section>
        </div>
    );
};

export default Dashboard;
