// TEMPORARY verification harness — removed after hero mobile checks.
import { HeroSection } from "@/components/sections/HeroSection";
export default function HeroHarness() {
  const raw = localStorage.getItem("heroHarness");
  if (!raw) return <div>no content</div>;
  const content = JSON.parse(raw);
  return <div className="live-preview-container"><HeroSection content={content} onUpdate={() => {}} isEditing={false} /></div>;
}
