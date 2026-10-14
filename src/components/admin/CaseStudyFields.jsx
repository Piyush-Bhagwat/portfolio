import { useState } from "react";
import PropTypes from "prop-types";
import { BrutalButton, TagBadge } from "../brutalist";
import {
  BookOpen,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
  Cpu,
  CheckCircle2,
} from "lucide-react";

/**
 * CaseStudyFields - Structured builder component for managing deep-dive
 * technical project case studies: motivation, tech rationale, learnings, and Q&A challenges.
 */
export default function CaseStudyFields({ value = {}, onChange }) {
  const isEnabled = Boolean(value?.enabled ?? (value?.why ? true : false));
  const why = value?.why || "";
  const techStack = Array.isArray(value?.tech_stack)
    ? value.tech_stack
    : Array.isArray(value?.tech)
    ? value.tech
    : [];
  const learnings = Array.isArray(value?.learnings)
    ? value.learnings
    : Array.isArray(value?.learning)
    ? value.learning
    : [];
  const problems = Array.isArray(value?.problems) ? value.problems : [];

  // Temporary inputs for adding items
  const [learningInput, setLearningInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techRationaleInput, setTechRationaleInput] = useState("");
  const [problemQue, setProblemQue] = useState("");
  const [problemAns, setProblemAns] = useState("");
  const [showAddProblem, setShowAddProblem] = useState(false);

  // Helper to emit changes
  const updateFields = (patch) => {
    onChange({
      enabled: isEnabled,
      why,
      tech_stack: techStack,
      learnings,
      problems,
      ...patch,
    });
  };

  const handleToggleEnabled = (e) => {
    const nextEnabled = e.target.checked;
    updateFields({ enabled: nextEnabled });
  };

  const handleWhyChange = (e) => {
    updateFields({ why: e.target.value });
  };

  // Tech stack handling
  const handleAddTech = () => {
    const name = techInput.trim();
    if (!name) return;

    const newItem = techRationaleInput.trim()
      ? { tech: name, rationale: techRationaleInput.trim() }
      : name;

    updateFields({
      tech_stack: [...techStack, newItem],
    });
    setTechInput("");
    setTechRationaleInput("");
  };

  const handleRemoveTech = (index) => {
    updateFields({
      tech_stack: techStack.filter((_, i) => i !== index),
    });
  };

  // Learnings handling
  const handleAddLearning = () => {
    const trimmed = learningInput.trim();
    if (trimmed && !learnings.includes(trimmed)) {
      updateFields({
        learnings: [...learnings, trimmed],
      });
      setLearningInput("");
    }
  };

  const handleRemoveLearning = (itemToRemove) => {
    updateFields({
      learnings: learnings.filter((item) => item !== itemToRemove),
    });
  };

  const handleKeyDownLearning = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddLearning();
    }
  };

  // Problems / Challenges Q&A handling
  const handleAddProblem = () => {
    if (!problemQue.trim() || !problemAns.trim()) return;

    updateFields({
      problems: [
        ...problems,
        {
          que: problemQue.trim(),
          ans: problemAns.trim(),
        },
      ],
    });
    setProblemQue("");
    setProblemAns("");
    setShowAddProblem(false);
  };

  const handleRemoveProblem = (index) => {
    updateFields({
      problems: problems.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-800 font-mono text-xs">
      {/* Enable Toggle Banner */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <label
            htmlFor="case-study-toggle"
            className="text-zinc-200 font-bold flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-terminal-cyan" />
            <span>Structured Case Study Builder</span>
          </label>
          <p className="text-[11px] text-zinc-400">
            Publish an in-depth technical writeup with architecture motivation, learnings, and problem-solving Q&amp;A.
          </p>
        </div>

        <label htmlFor="case-study-toggle" className="flex items-center gap-2 cursor-pointer">
          <input
            id="case-study-toggle"
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggleEnabled}
            className="w-4 h-4 text-terminal-cyan bg-zinc-900 border-zinc-700 rounded-none focus:ring-0 cursor-pointer"
          />
          <span className="text-[11px] font-bold text-terminal-cyan uppercase">
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-5 p-4 bg-zinc-900/40 border border-zinc-800">
          {/* Motivation & Problem Statement */}
          <div className="space-y-1.5">
            <label htmlFor="case-study-why" className="block text-zinc-300 font-bold flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Motivation &amp; Problem Statement (Why this was built)
            </label>
            <textarea
              id="case-study-why"
              rows={4}
              value={why}
              onChange={handleWhyChange}
              placeholder="What motivated this project? What specific gap, challenge, or learning goal did this application address?"
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-terminal-cyan p-2.5 text-zinc-100 font-mono focus:outline-none resize-y"
            />
          </div>

          {/* Tech Stack Rationale Breakdown */}
          <div className="space-y-2">
            <label className="block text-zinc-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-terminal-green" />
              Tech Stack Rationale (Frameworks &amp; why chosen)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Tech / Library (e.g. ReactJS, Cloud Firestore)"
                className="bg-zinc-950 border border-zinc-700 focus:border-terminal-cyan px-3 py-1.5 text-zinc-100 font-mono focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techRationaleInput}
                  onChange={(e) => setTechRationaleInput(e.target.value)}
                  placeholder="Why chosen (e.g. Real-time sync, zero cost)"
                  className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-terminal-cyan px-3 py-1.5 text-zinc-100 font-mono focus:outline-none"
                />
                <BrutalButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTech}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </BrutalButton>
              </div>
            </div>

            {techStack.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {techStack.map((item, idx) => {
                  const isObj = typeof item === "object" && item !== null;
                  const name = isObj ? item.tech : item;
                  const rationale = isObj ? item.rationale : "";

                  return (
                    <div
                      key={idx}
                      className="p-2 bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <TagBadge variant="terminal" size="sm">
                          {name}
                        </TagBadge>
                        {rationale && (
                          <span className="text-[11px] text-zinc-400">
                            — {rationale}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(idx)}
                        aria-label={`Remove ${name}`}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Learnings */}
          <div className="space-y-2">
            <label htmlFor="learning-input" className="block text-zinc-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-terminal-cyan" />
              Key Learnings &amp; Insights
            </label>

            <div className="flex gap-2">
              <input
                id="learning-input"
                type="text"
                value={learningInput}
                onChange={(e) => setLearningInput(e.target.value)}
                onKeyDown={handleKeyDownLearning}
                placeholder="Type a learning take-away and press Enter (e.g. CORS setup, State machines)"
                className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-terminal-cyan px-3 py-1.5 text-zinc-100 font-mono focus:outline-none"
              />
              <BrutalButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLearning}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add
              </BrutalButton>
            </div>

            {learnings.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {learnings.map((lrn) => (
                  <TagBadge
                    key={lrn}
                    variant="cyan"
                    size="sm"
                    onRemove={() => handleRemoveLearning(lrn)}
                  >
                    {lrn}
                  </TagBadge>
                ))}
              </div>
            )}
          </div>

          {/* Technical Challenges & Q&A Manager */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 font-bold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                Technical Challenges &amp; Solutions ({problems.length})
              </label>
              {!showAddProblem && (
                <BrutalButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddProblem(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Challenge Card
                </BrutalButton>
              )}
            </div>

            {/* Add Challenge Card Form */}
            {showAddProblem && (
              <div className="p-3.5 bg-zinc-950 border border-terminal-cyan space-y-3 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-terminal-cyan">New Challenge &amp; Solution</span>
                  <button
                    type="button"
                    onClick={() => setShowAddProblem(false)}
                    className="text-zinc-500 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="challenge-que" className="block text-zinc-400 text-[11px]">
                    Problem / Challenge Question *
                  </label>
                  <input
                    id="challenge-que"
                    type="text"
                    value={problemQue}
                    onChange={(e) => setProblemQue(e.target.value)}
                    placeholder="e.g. How to deploy environment variables in render.com"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-terminal-cyan px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="challenge-ans" className="block text-zinc-400 text-[11px]">
                    Technical Solution / Architecture Decision *
                  </label>
                  <textarea
                    id="challenge-ans"
                    rows={3}
                    value={problemAns}
                    onChange={(e) => setProblemAns(e.target.value)}
                    placeholder="Detail how you resolved it, preventing security leaks or performance bottlenecks..."
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-terminal-cyan p-2.5 text-zinc-100 font-mono focus:outline-none resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <BrutalButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddProblem(false)}
                  >
                    Cancel
                  </BrutalButton>
                  <BrutalButton
                    type="button"
                    variant="terminal"
                    size="sm"
                    onClick={handleAddProblem}
                    disabled={!problemQue.trim() || !problemAns.trim()}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Save Challenge
                  </BrutalButton>
                </div>
              </div>
            )}

            {/* List of existing problems */}
            {problems.length > 0 ? (
              <div className="space-y-2.5">
                {problems.map((prob, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-950 border border-zinc-800 space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px] font-bold">
                          Q#{idx + 1}
                        </span>
                        <h4 className="text-zinc-200 font-bold text-xs">{prob.que}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProblem(idx)}
                        aria-label={`Remove problem ${idx + 1}`}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pl-6 border-l-2 border-zinc-800 text-zinc-400 text-[11px] leading-relaxed">
                      <p>{prob.ans}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 italic">
                No technical challenges or solution notes recorded yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

CaseStudyFields.propTypes = {
  value: PropTypes.shape({
    enabled: PropTypes.bool,
    why: PropTypes.string,
    tech_stack: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          tech: PropTypes.string,
          rationale: PropTypes.string,
        }),
      ])
    ),
    tech: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          tech: PropTypes.string,
          rationale: PropTypes.string,
        }),
      ])
    ),
    learnings: PropTypes.arrayOf(PropTypes.string),
    learning: PropTypes.arrayOf(PropTypes.string),
    problems: PropTypes.arrayOf(
      PropTypes.shape({
        que: PropTypes.string,
        ans: PropTypes.string,
      })
    ),
  }),
  onChange: PropTypes.func.isRequired,
};
