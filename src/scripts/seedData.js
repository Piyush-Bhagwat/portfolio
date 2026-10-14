import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase.js";

/**
 * Initial canonical seed data for V1 -> V2 migration
 */
export const SEED_PROFILE = {
  name: "Piyush Bhagwat",
  role: "Full Stack Developer & UI Craftsman",
  tagline: "Hey I am Piyush Bhagwat, An Abnormal webdeveloper. I love to make minimal website like this :)",
  bio_paragraphs: [
    "Hi, I'm Piyush Bhagwat! I'm a well-rounded Web Developer with a passion for crafting clean and minimal websites.",
    "I've tackled numerous projects throughout my career, wielding my expertise in both frontend and backend development. I'm always eager to learn and explore new technologies, constantly pushing the boundaries of what's possible on the web.",
    "When I'm not coding, you might find me getting creative through art, contributing to open-source, or experimenting with tactile Neo-Brutalist design systems.",
  ],
  avatar_url: "/assets/myIMG-czvx6SJz.jpg",
  avatar_public_id: "",
  location: "Brahmapuri, Maharashtra, India",
  status_badge: "Available for new opportunities",
  resume_url: "https://drive.google.com/file/d/1_resume_link/view",
  socials: [
    { platform: "github", label: "GitHub", url: "https://github.com/Piyush-Bhagwat" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/piyush-bhagwat/" },
    { platform: "x", label: "X / Twitter", url: "https://x.com/PiyushBhagwat11" },
    { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/ab_nrmal/" },
  ],
};

export const SEED_SKILLS = [
  { id: "react", name: "React JS", category: "frontend", order: 1, featured: true, icon_url: "/assets/react-DWtElvao.png" },
  { id: "javascript", name: "JavaScript", category: "frontend", order: 2, featured: true, icon_url: "/assets/js-BOsfmQ8z.png" },
  { id: "vue", name: "Vue JS", category: "frontend", order: 3, featured: true, icon_url: "/assets/vue-BTF7-REL.png" },
  { id: "tailwind", name: "Tailwind CSS", category: "frontend", order: 4, featured: true, icon_url: "" },
  { id: "nodejs", name: "Node JS", category: "backend", order: 5, featured: true, icon_url: "/assets/node-D5TiUOSF.png" },
  { id: "firebase", name: "Firebase", category: "backend", order: 6, featured: true, icon_url: "/assets/fire-cQD0VNta.png" },
  { id: "mongodb", name: "MongoDB", category: "database", order: 7, featured: true, icon_url: "/assets/monDB-TDuXTxH0.png" },
  { id: "git", name: "Git & GitHub", category: "tools", order: 8, featured: true, icon_url: "/assets/github-CogvpTnx.png" },
  { id: "htmlcss", name: "HTML & CSS", category: "frontend", order: 9, featured: false, icon_url: "/assets/htmlcss-aVHLy7_8.png" },
  { id: "cloudinary", name: "Cloudinary CDN", category: "tools", order: 10, featured: false, icon_url: "" },
];

export const SEED_EXPERIENCES = [
  {
    id: "full-stack-dev",
    role: "Full Stack Developer",
    company: "Freelance & Independent Consulting",
    period: "2024 - Present",
    location: "Remote / India",
    description:
      "Architected and deployed responsive full-stack web applications, dynamic client portals, and headless CMS integrations. Designed accessible neo-brutalist user interfaces with modern micro-interactions.",
    skills_used: ["React", "Node.js", "Firebase", "Tailwind CSS", "MongoDB"],
    order: 1,
  },
  {
    id: "frontend-engineer",
    role: "Frontend Engineer",
    company: "Open Source Contributor & Indie Maker",
    period: "2023 - 2024",
    location: "Remote",
    description:
      "Crafted performance-oriented web applications, interactive dictionary tools, flashcard platforms, and reusable component libraries with modular design tokens and automated testing.",
    skills_used: ["JavaScript", "React", "Vue.js", "HTML5", "CSS3", "Git"],
    order: 2,
  },
  {
    id: "cs-degree",
    role: "B.Tech in Computer Science & Engineering",
    company: "University / Academic Milestone",
    period: "2021 - 2025",
    location: "Maharashtra, India",
    description:
      "Deep dive into Data Structures, Algorithms, Distributed Systems, Database Management, and Modern Web Engineering.",
    skills_used: ["DSA", "System Design", "Database Systems", "Software Engineering"],
    order: 3,
  },
];

/**
 * Seed profile document into `site_config/profile`
 * @param {Object} options
 * @param {boolean} [options.overwrite=false] - Force overwrite if already present
 */
export async function seedProfile(options = {}) {
  const { overwrite = false } = options;
  const docRef = doc(db, "site_config", "profile");

  try {
    if (!overwrite) {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          status: "skipped",
          message: "Profile document already exists in Firestore (site_config/profile).",
        };
      }
    }

    const payload = {
      ...SEED_PROFILE,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });
    return {
      status: "seeded",
      message: "Profile document successfully initialized in site_config/profile.",
    };
  } catch (err) {
    console.error("Error seeding profile:", err);
    return {
      status: "error",
      message: err.message || "Failed to seed profile.",
    };
  }
}

/**
 * Seed initial skills collection
 * @param {Object} options
 * @param {boolean} [options.overwrite=false] - Force overwrite existing skills
 */
export async function seedSkills(options = {}) {
  const { overwrite = false } = options;
  const skillsCol = collection(db, "skills");

  try {
    if (!overwrite) {
      const snap = await getDocs(skillsCol);
      if (!snap.empty) {
        return {
          status: "skipped",
          count: snap.size,
          message: `Skills collection already contains ${snap.size} records.`,
        };
      }
    }

    const batch = writeBatch(db);
    SEED_SKILLS.forEach((skill) => {
      const docRef = doc(db, "skills", skill.id);
      batch.set(
        docRef,
        {
          name: skill.name,
          category: skill.category,
          order: skill.order,
          featured: skill.featured,
          icon_url: skill.icon_url || "",
          icon_public_id: skill.icon_public_id || "",
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();
    return {
      status: "seeded",
      count: SEED_SKILLS.length,
      message: `Successfully seeded ${SEED_SKILLS.length} skills into Firestore.`,
    };
  } catch (err) {
    console.error("Error seeding skills:", err);
    return {
      status: "error",
      count: 0,
      message: err.message || "Failed to seed skills collection.",
    };
  }
}

/**
 * Seed initial experiences collection
 * @param {Object} options
 * @param {boolean} [options.overwrite=false] - Force overwrite existing experiences
 */
export async function seedExperiences(options = {}) {
  const { overwrite = false } = options;
  const expCol = collection(db, "experiences");

  try {
    if (!overwrite) {
      const snap = await getDocs(expCol);
      if (!snap.empty) {
        return {
          status: "skipped",
          count: snap.size,
          message: `Experiences collection already contains ${snap.size} records.`,
        };
      }
    }

    const batch = writeBatch(db);
    SEED_EXPERIENCES.forEach((exp) => {
      const docRef = doc(db, "experiences", exp.id);
      batch.set(
        docRef,
        {
          role: exp.role,
          company: exp.company,
          period: exp.period,
          location: exp.location,
          description: exp.description,
          skills_used: exp.skills_used,
          order: exp.order,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();
    return {
      status: "seeded",
      count: SEED_EXPERIENCES.length,
      message: `Successfully seeded ${SEED_EXPERIENCES.length} career milestones.`,
    };
  } catch (err) {
    console.error("Error seeding experiences:", err);
    return {
      status: "error",
      count: 0,
      message: err.message || "Failed to seed experiences collection.",
    };
  }
}

/**
 * Master seeder: Initializes profile, skills, and experiences.
 * @param {Object} options
 * @param {boolean} [options.overwrite=false]
 */
export async function seedAllData(options = {}) {
  const profileRes = await seedProfile(options);
  const skillsRes = await seedSkills(options);
  const expRes = await seedExperiences(options);

  const hasError =
    profileRes.status === "error" ||
    skillsRes.status === "error" ||
    expRes.status === "error";

  return {
    success: !hasError,
    profile: profileRes,
    skills: skillsRes,
    experiences: expRes,
  };
}
