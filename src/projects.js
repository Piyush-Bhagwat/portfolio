import lodiaHallDesktopImg from "./assets/images/lodiaHallDesktop.png";
import flashCardImg from "./assets/images/flashCard.png";
import transportationProblemImg from "./assets/images/transportationProblem.png";
import dictonaryImg from "./assets/images/dictnoary.png";
import notesPoolImg from "./assets/images/notesPool.png";
import elemtrixImg from "./assets/images/elementrix.png";

const projectInfo = [
    {
        img: notesPoolImg,
        title: "Notes Pool",
        disc: "Online Study material Saving webapp for BCA students",
        link: "https://notespool.netlify.app/",
        tags: ["React", "FireBase", "File Storage"],
    },
    {
    img: dictonaryImg,
        title: "Dictionary",
        disc: "A Dictionary WebApp made using dictionaryapi.dev",
        tags: ["React", "Front-End", "API"],
    },
    {
        img: flashCardImg,
        title: "Flash Card",
        disc: "Note Taking WebApp made using ReactJS in front end and Firebase as backend",
        tags: ["React", "FireBase", "NodeJS"],
    },
    {
        img: lodiaHallDesktopImg,
        title: "Banquet Hall",
        disc: "A Website for a Banquet hall. It was a project given by Elmentrix",
        link: "https://piyush-bhagwat.github.io/Lodia-Hall/",
        tags: ["WebDesign", "HTML", "CSS", "JS"],
    },
    {
        img: elemtrixImg,
        title: "Elemntrix Website",
        disc: "Desingned a website for Elmentrix",
        link: "https://piyush-bhagwat.github.io/ElmtrixWebsite/",
        tags: ["HTML", "CSS", "JavaScript"],
    },
    {
        img: transportationProblemImg,
        title: "Transportation Problem Solver",
        disc: "A Web App to solve the transportation problems in 5 methods. Made using plain JS.",
        link: "https://piyush-bhagwat.github.io/Transportation-Problem/",
        tags: ["Logic", "C++", "JavaScript"],
    },
];

const projectDetails = [
    {
        title: "Notes Pool",
        disc: "A Online File Storage System Made for BCA Students",
        img: notesPoolImg,
        why: `Motivated by the absence of an organized system for storing study
         materials in our educational institution, I conceived and developed a 
         web application. This initiative aimed to rectify the deficiency that 
         became particularly evident during exam periods, causing difficulties 
         in accessing essential study notes. The web app provides a reliable 
         solution by offering a centralized repository for study materials. 
         Its user-friendly interface enables easy uploading, categorization, 
         and retrieval of resources, enhancing accessibility for students. 
         Notably, the application's creation was facilitated through the use of 
         modern frameworks like ReactJS, ensuring a seamless user experience. 
         By addressing a tangible need and simplifying resource management, this 
         web application contributes to a more efficient and supportive learning 
         environment.`,
        api: [],
        learning: ["File Saving", "CORS"],
        tech: ["ReactJS", "FireBase"],
        modules: ["Tostify", "Spinners"],
        problems: [
            {
                que: "How to deploy environment variables in render.com",
                ans: `Do not add "config.env" files to GitHub, as this may expose secret 
                passwords to the public. Instead, go to render.com, where we have deployed the backend. Once there, navigate 
                to render → environment → secret files. Create a new file called "config.env" and add the contents of "config" 
                to it. Then, click "Save Changes". This way, we will be able to access environment variables without exposing 
                "config.env" to the public.`,
            },
        ],
        link: "https://notespool.netlify.app/",
    },
    {
        title: "Dictionary",
        disc: "A Dictionary webApp made using dictionaryapi.dev",
        img: dictonaryImg,
        why: `I undertook a personal challenge and successfully developed a
         dictionary web application. The primary objective was to utilize an 
         API for the construction of a website, and it was from this standpoint
        that the present concept materialized. This application provides 
        functionalities encompassing word queries, illustrative usage instances, 
        and a toggle for transitioning into a darker display mode. Importantly, 
        the comprehensive implementation was achieved through the employment 
        of ReactJS`,
        api: ["dictionaryapi.dev"],
        learning: ["APIs", "Themes", "Search History"],
        tech: ["ReactJS"],
        modules: [],
        problems: [],
        link: "https://dictinory.netlify.app/",
    },
    {
        title: "Flash Card",
        disc: "Save your notes online with Flash Card WebApp",
        img: flashCardImg,
        why: `
        I decided to make this app to see how good I was at using ReactJS. 
        I started working on it when I was still learning about React. It 
        was a bit tough since I hadn't really made any web apps before. But 
        you know what? I actually enjoyed the whole thing. In the beginning, 
        the app could only do one thing: let you write and save notes. Then, 
        as I got better, I added a new feature. This feature made it possible 
        to delete and change notes that you had already written. So now, the 
        app is even more useful than before because it can help you keep track 
        of your notes in a better way.`,
        api: [],
        learning: ["FireBase", "React"],
        tech: ["ReactJS", "FireBase"],
        modules: [],
        problems: [],
        link: "https://flashcard-75ea0.web.app/",
    },
];

export { projectInfo, projectDetails };
