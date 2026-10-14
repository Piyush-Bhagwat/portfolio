import React from "react";
import BentoCard from "./BentoCard";
import BrutalButton from "./BrutalButton";
import TagBadge from "./TagBadge";
import TerminalBox from "./TerminalBox";
import StatusPill from "./StatusPill";
import ImageUploader from "../common/ImageUploader";
import { Terminal, ArrowRight } from "lucide-react";

export default function BrutalistShowcase() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <StatusPill status="Available for work" variant="available" />
      <BentoCard title="Project Card" subtitle="A neo-brutalist bento tile" dotPattern>
        <p className="text-sm text-zinc-300">Bento card body content</p>
        <div className="mt-4 flex gap-2">
          <TagBadge variant="terminal" dot>React</TagBadge>
          <TagBadge variant="cyan">Tailwind</TagBadge>
        </div>
      </BentoCard>
      <TerminalBox title="bash" copyText="npm run dev">
        <code>{"$ echo 'Brutalist primitives & Cloudinary verified'"}</code>
      </TerminalBox>
      <div className="flex gap-4">
        <BrutalButton variant="primary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
          Get in touch
        </BrutalButton>
        <BrutalButton variant="terminal" icon={<Terminal className="w-4 h-4" />}>
          View Projects
        </BrutalButton>
      </div>

      {/* Cloudinary Image Uploader sandbox */}
      <BentoCard title="Cloudinary Media Pipeline" subtitle="Sandboxed asset uploader">
        <ImageUploader folder="portfolio/sandbox" />
      </BentoCard>
    </div>
  );
}
