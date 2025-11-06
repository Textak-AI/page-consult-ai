import { SectionSelector } from "@/components/builder/SectionSelector";
import { useNavigate } from "react-router-dom";

export default function SectionSelectorDemo() {
  const navigate = useNavigate();

  const handleContinue = (selectedVariant: number) => {
    console.log("Selected variant:", selectedVariant);
    // Navigate to next step or show success message
    alert(`Hero variant ${selectedVariant} selected! Ready to build the next section.`);
  };

  return (
    <SectionSelector
      userHeadline="Transform Your Business Online"
      userSubheadline="Professional landing pages that convert visitors into customers"
      onContinue={handleContinue}
    />
  );
}
