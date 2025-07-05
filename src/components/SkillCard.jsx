import React from "react";
import Reveal from "./Reveal";
import SymbolLayers from "./ui/SymbolLayers";
import SymbolLayer from "./ui/SymbolLayer";
import { FaCode } from "react-icons/fa6";

const SkillCard = ({ img, name }) => {
    return (
        <div className="skill-box box">
            <SymbolLayer symbol={<FaCode />} depth={40 * Math.random() + 20} symbolCount={5} symbolSize={20}/>
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
