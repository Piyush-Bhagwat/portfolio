import { db, storage as store } from "../services/firebase.js";
import {
    doc,
    getDocs,
    collection,
    deleteDoc,
} from "firebase/firestore";

const projectRef = collection(db, "projects");

const getProjects = async () => {
    const dat = await getDocs(projectRef);
    const data = [];

    dat.docs.map((doc) => {
        data.push({ ...doc.data(), id: doc.id });
    });
    return data;
};

const deleteProject = async (id) => {
    await deleteDoc(doc(db, "projects", id));
};

const addProject = async (data) => {
    const tagStr = data.tags;
    console.log(tagStr);
    
    const tagArr = tagStr.split(",");
    data.tags = tagArr.map((tag) => tag.trim());
    console.log(data);
};

export { getProjects, deleteProject, addProject, db, store };
