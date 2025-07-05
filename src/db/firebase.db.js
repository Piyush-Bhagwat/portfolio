import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {
    getFirestore,
    doc,
    getDocs,
    collection,
    deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAzasoo8Y7Tt7V_n0Ct7yzR0d1APDyBJ9M",
    authDomain: "portfolio-c6f29.firebaseapp.com",
    projectId: "portfolio-c6f29",
    storageBucket: "portfolio-c6f29.appspot.com",
    messagingSenderId: "350726943938",
    appId: "1:350726943938:web:6ab5e6de3177b611ce375b",
};

const app = initializeApp(firebaseConfig);

const store = getStorage(app);
const db = getFirestore(app);

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
    data.tags = tagArr.map((tag)=>tag.trim());;
    console.log(data);
}

export { getProjects, deleteProject, addProject };
