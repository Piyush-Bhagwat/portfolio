import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { motion } from "framer-motion";
import {
  HeroTile,
  StatusTile,
  SocialsTile,
  SkillsTile,
  LatestBlogTile,
  FeaturedProjectsTile,
} from "../../components/home";
import { CaseStudyModal } from "../../components/project";
import { DEFAULT_PROFILE } from "../admin/ProfileCMS.jsx";
import { DEFAULT_SKILLS } from "../admin/SkillsCMS.jsx";
import { DEFAULT_PROJECTS } from "../admin/ProjectsCMS.jsx";
import { SAMPLE_INITIAL_POST } from "../admin/BlogsCMS.jsx";

const bentoContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const bentoTileVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * HomePage - Public Bento-Grid Developer Portfolio Architecture
 * Neo-Brutalist modular bento showcase connecting dynamic Firestore data
 * with subtle framer-motion entrance animations and tactile micro-interactions.
 */
export default function HomePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [latestBlog, setLatestBlog] = useState(SAMPLE_INITIAL_POST);
  const [selectedCaseStudyProject, setSelectedCaseStudyProject] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch Profile
    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, "site_config", "profile");
        const snap = await getDoc(profileRef);
        if (snap.exists() && isMounted) {
          const profileData = snap.data();
          const rawAvatarUrl = profileData.avatar_url;
          const validAvatarUrl =
            !rawAvatarUrl || rawAvatarUrl.includes("myIMG-czvx6SJz") || rawAvatarUrl.startsWith("/assets/")
              ? DEFAULT_PROFILE.avatar_url
              : rawAvatarUrl;
          setProfile({ ...DEFAULT_PROFILE, ...profileData, avatar_url: validAvatarUrl });
        }
      } catch (err) {
        console.error("Error fetching homepage profile:", err);
      }
    };

    // Fetch Skills
    const fetchSkills = async () => {
      try {
        const skillsRef = collection(db, "skills");
        const q = query(skillsRef, orderBy("order", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error fetching homepage skills:", err);
      }
    };

    // Fetch Projects
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("order", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error fetching homepage projects:", err);
      }
    };

    // Fetch Latest Published Blog
    const fetchLatestBlog = async () => {
      try {
        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, where("published", "==", true), limit(3));
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          // Sort by published_at or created_at desc
          loaded.sort((a, b) => {
            const timeA = a.published_at?.seconds || a.created_at?.seconds || 0;
            const timeB = b.published_at?.seconds || b.created_at?.seconds || 0;
            return timeB - timeA;
          });
          if (loaded.length > 0) {
            setLatestBlog(loaded[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching homepage latest blog:", err);
      }
    };

    fetchProfile();
    fetchSkills();
    fetchProjects();
    fetchLatestBlog();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Bento Grid Layout (1-col mobile, 2-col tablet, 4-col desktop) */}
        <motion.div
          variants={bentoContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* Tile 1: Hero Profile (2x2) */}
          <motion.div
            variants={bentoTileVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col"
          >
            <HeroTile
              profile={profile}
              className="h-full"
            />
          </motion.div>

          {/* Tile 2: Status & Real-Time IST Telemetry (1x1) */}
          <motion.div
            variants={bentoTileVariants}
            className="col-span-1 flex flex-col"
          >
            <StatusTile
              profile={profile}
              className="h-full"
            />
          </motion.div>

          {/* Tile 3: Verified Social Channels & Resume Dock (1x1) */}
          <motion.div
            variants={bentoTileVariants}
            className="col-span-1 flex flex-col"
          >
            <SocialsTile
              profile={profile}
              className="h-full"
            />
          </motion.div>

          {/* Tile 4: Integrated Tech Stack Matrix (2x1) */}
          <motion.div
            variants={bentoTileVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col"
          >
            <SkillsTile
              skills={skills}
              className="h-full"
            />
          </motion.div>

          {/* Tile 5: Latest Technical Publication Feature (Wide / 4-col or 2-col) */}
          <motion.div
            variants={bentoTileVariants}
            className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col"
          >
            <LatestBlogTile
              post={latestBlog}
              className="h-full"
            />
          </motion.div>

          {/* Tile 6: Featured Projects Spotlight & Case Studies (Wide / 4-col) */}
          <motion.div
            variants={bentoTileVariants}
            className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col"
          >
            <FeaturedProjectsTile
              projects={projects}
              onOpenCaseStudy={setSelectedCaseStudyProject}
              className="h-full"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Case Study Drawer Modal */}
      {selectedCaseStudyProject && (
        <CaseStudyModal
          project={selectedCaseStudyProject}
          onClose={() => setSelectedCaseStudyProject(null)}
        />
      )}
    </div>
  );
}
