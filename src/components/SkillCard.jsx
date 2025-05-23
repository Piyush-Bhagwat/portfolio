import React from "react";
import Reveal from "./Reveal";

const SkillCard = ({ img, name }) => {
    return (
        <div className="skill-box box">
            <Reveal>
                <div className="image">
                    <img loading="lazy" src={img} alt={`${name}-logo`} />
                </div>
                <div className="name">{name}</div>
            </Reveal>
        </div>
    );
};

export default SkillCard;
