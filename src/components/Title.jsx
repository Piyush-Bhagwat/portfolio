import React from "react";

const Title = ({text}) => {
    return (
        <div className="title">
            <div className="line"></div>
            <h1>{text}</h1>
        </div>
    );
};

export default Title;
