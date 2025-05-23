import React, { createContext, useEffect, useState } from "react";
import {getProjects } from "../db/firebase.db";

export const context = createContext(null);

const ContextProvider = (props) => {
    const [projects, setProjects] = useState(null);

    let pData;
    useEffect(() => {
        const fetchData = async () => {
            pData = await getProjects();
            setProjects(pData);
        };

        fetchData();
    }, []);

    const val = { projects };
    return <context.Provider value={val}>{props.children}</context.Provider>;
};

export default ContextProvider;
