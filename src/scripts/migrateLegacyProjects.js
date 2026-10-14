import {
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase.js";

/**
 * Normalized representation of the 6 legacy projects from src/projects.js
 * with structured case studies, motivations, learnings, and challenge Q&A.
 */
export const LEGACY_PROJECTS = [
  {
    id: "notes-pool",
    title: "Notes Pool",
    slug: "notes-pool",
    description: "Online Study material Saving webapp for BCA students with centralized note repository.",
    tags: ["React", "FireBase", "File Storage"],
    live_url: "https://notespool.netlify.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    image_url: "",
    image_public_id: "",
    featured: true,
    date: "2024",
    order: 1,
    case_study: {
      enabled: true,
      why: "Motivated by the absence of an organized system for storing study materials in our educational institution, I conceived and developed a web application. This initiative aimed to rectify the deficiency that became particularly evident during exam periods, causing difficulties in accessing essential study notes. The web app provides a reliable solution by offering a centralized repository for study materials. Its user-friendly interface enables easy uploading, categorization, and retrieval of resources, enhancing accessibility for students. Notably, the application's creation was facilitated through the use of modern frameworks like ReactJS, ensuring a seamless user experience. By addressing a tangible need and simplifying resource management, this web application contributes to a more efficient and supportive learning environment.",
      tech_stack: ["ReactJS", "FireBase"],
      learnings: ["File Saving", "CORS Configuration"],
      problems: [
        {
          que: "How to deploy environment variables in render.com",
          ans: "Do not add \"config.env\" files to GitHub, as this may expose secret passwords to the public. Instead, go to render.com, where we have deployed the backend. Once there, navigate to render → environment → secret files. Create a new file called \"config.env\" and add the contents of \"config\" to it. Then, click \"Save Changes\". This way, we will be able to access environment variables without exposing \"config.env\" to the public.",
        },
      ],
    },
  },
  {
    id: "dictionary",
    title: "Dictionary",
    slug: "dictionary",
    description: "A Dictionary WebApp made using dictionaryapi.dev with dark mode and word history.",
    tags: ["React", "Front-End", "API"],
    live_url: "https://dictinory.netlify.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    image_url: "",
    image_public_id: "",
    featured: true,
    date: "2023",
    order: 2,
    case_study: {
      enabled: true,
      why: "I undertook a personal challenge and successfully developed a dictionary web application. The primary objective was to utilize an API for the construction of a website, and it was from this standpoint that the present concept materialized. This application provides functionalities encompassing word queries, illustrative usage instances, and a toggle for transitioning into a darker display mode. Importantly, the comprehensive implementation was achieved through the employment of ReactJS.",
      tech_stack: ["ReactJS"],
      learnings: ["APIs", "Themes", "Search History"],
      problems: [],
    },
  },
  {
    id: "flash-card",
    title: "Flash Card",
    slug: "flash-card",
    description: "Note Taking WebApp made using ReactJS in front end and Firebase as backend with real-time sync.",
    tags: ["React", "FireBase", "NodeJS"],
    live_url: "https://flashcard-75ea0.web.app/",
    github_url: "https://github.com/Piyush-Bhagwat",
    image_url: "",
    image_public_id: "",
    featured: true,
    date: "2023",
    order: 3,
    case_study: {
      enabled: true,
      why: "I decided to make this app to see how good I was at using ReactJS. I started working on it when I was still learning about React. It was a bit tough since I hadn't really made any web apps before. But you know what? I actually enjoyed the whole thing. In the beginning, the app could only do one thing: let you write and save notes. Then, as I got better, I added a new feature. This feature made it possible to delete and change notes that you had already written. So now, the app is even more useful than before because it can help you keep track of your notes in a better way.",
      tech_stack: ["ReactJS", "FireBase"],
      learnings: ["FireBase", "React"],
      problems: [],
    },
  },
  {
    id: "banquet-hall",
    title: "Banquet Hall",
    slug: "banquet-hall",
    description: "A Website for a Banquet hall. It was a project given by Elmentrix.",
    tags: ["WebDesign", "HTML", "CSS", "JS"],
    live_url: "https://piyush-bhagwat.github.io/Lodia-Hall/",
    github_url: "https://github.com/Piyush-Bhagwat/Lodia-Hall",
    image_url: "",
    image_public_id: "",
    featured: false,
    date: "2023",
    order: 4,
    case_study: {
      enabled: false,
      why: "",
      tech_stack: ["HTML", "CSS", "JavaScript"],
      learnings: [],
      problems: [],
    },
  },
  {
    id: "elementrix-website",
    title: "Elementrix Website",
    slug: "elementrix-website",
    description: "Corporate landing page and brand showcase designed for the Elementrix community.",
    tags: ["HTML", "CSS", "JavaScript"],
    live_url: "https://piyush-bhagwat.github.io/ElmtrixWebsite/",
    github_url: "https://github.com/Piyush-Bhagwat/ElmtrixWebsite",
    image_url: "",
    image_public_id: "",
    featured: false,
    date: "2023",
    order: 5,
    case_study: {
      enabled: false,
      why: "",
      tech_stack: ["HTML", "CSS", "JavaScript"],
      learnings: [],
      problems: [],
    },
  },
  {
    id: "transportation-problem-solver",
    title: "Transportation Problem Solver",
    slug: "transportation-problem-solver",
    description: "A Web App to solve the transportation problems in 5 methods. Made using plain JS.",
    tags: ["Logic", "C++", "JavaScript"],
    live_url: "https://piyush-bhagwat.github.io/Transportation-Problem/",
    github_url: "https://github.com/Piyush-Bhagwat/Transportation-Problem",
    image_url: "",
    image_public_id: "",
    featured: false,
    date: "2022",
    order: 6,
    case_study: {
      enabled: false,
      why: "",
      tech_stack: ["JavaScript", "C++", "Operations Research"],
      learnings: [],
      problems: [],
    },
  },
];

/**
 * Returns the normalized legacy projects list.
 */
export function getNormalizedLegacyProjects() {
  return LEGACY_PROJECTS;
}

/**
 * Migrates all 6 legacy projects from src/projects.js into Firestore
 * with full structured case studies and metadata.
 *
 * @param {Object} [options]
 * @param {boolean} [options.overwrite=false] - If true, overwrites existing projects
 * @returns {Promise<{ status: string, count: number, message: string }>}
 */
export async function migrateLegacyProjects(options = {}) {
  const { overwrite = false } = options;
  const projectsCol = collection(db, "projects");

  try {
    if (!overwrite) {
      const snap = await getDocs(projectsCol);
      if (!snap.empty) {
        return {
          status: "skipped",
          count: snap.size,
          message: `Projects collection already contains ${snap.size} records. Use overwrite: true to re-seed.`,
        };
      }
    }

    const batch = writeBatch(db);
    LEGACY_PROJECTS.forEach((proj) => {
      const docRef = doc(db, "projects", proj.id);
      batch.set(
        docRef,
        {
          title: proj.title,
          slug: proj.slug,
          description: proj.description,
          tags: proj.tags,
          live_url: proj.live_url,
          github_url: proj.github_url,
          image_url: proj.image_url || "",
          image_public_id: proj.image_public_id || "",
          featured: proj.featured,
          date: proj.date,
          order: proj.order,
          case_study: proj.case_study,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();

    return {
      status: "migrated",
      count: LEGACY_PROJECTS.length,
      message: `Successfully migrated ${LEGACY_PROJECTS.length} legacy projects into Firestore.`,
    };
  } catch (err) {
    console.error("Project migration error:", err);
    return {
      status: "error",
      count: 0,
      message: err.message || "Failed to migrate legacy projects into Firestore.",
    };
  }
}
