import { StylePresetName } from "@/styles/presets";

export const styleVariants: Record<StylePresetName, {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    headingSize: string;
  };
  spacing: {
    sectionPadding: string;
    elementSpacing: string;
  };
  borders: {
    radius: string;
    width: string;
  };
  effects: {
    shadow: string;
    hover: string;
  };
}> = {
  premium: {
    colors: {
      primary: "217 33% 17%",      // Slate dark
      secondary: "189 95% 43%",     // Cyan
      accent: "264 83% 62%",        // Purple
      background: "222 47% 11%",    // Dark slate
      foreground: "0 0% 100%",      // White
      muted: "220 13% 95%",         // Light gray
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      headingSize: "1.1",
    },
    spacing: {
      sectionPadding: "5rem",
      elementSpacing: "2rem",
    },
    borders: {
      radius: "1rem",
      width: "1px",
    },
    effects: {
      shadow: "0 10px 30px -10px rgb(6 182 212 / 0.3)",
      hover: "translateY(-4px)",
    },
  },
  
  minimal: {
    colors: {
      primary: "0 0% 10%",          // Almost black
      secondary: "0 0% 40%",        // Medium gray
      accent: "0 0% 30%",           // Gray
      background: "0 0% 100%",      // White
      foreground: "0 0% 10%",       // Almost black
      muted: "0 0% 96%",            // Off-white
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "500",
      headingSize: "1.0",
    },
    spacing: {
      sectionPadding: "4rem",
      elementSpacing: "2rem",
    },
    borders: {
      radius: "0.5rem",
      width: "1px",
    },
    effects: {
      shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      hover: "opacity: 0.9",
    },
  },
  
  bold: {
    colors: {
      primary: "0 0% 0%",           // Black
      secondary: "48 96% 53%",      // Bright yellow
      accent: "48 96% 53%",         // Yellow
      background: "0 0% 0%",        // Black
      foreground: "0 0% 100%",      // White
      muted: "0 0% 15%",            // Dark gray
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "900",
      headingSize: "1.3",
    },
    spacing: {
      sectionPadding: "6rem",
      elementSpacing: "2.5rem",
    },
    borders: {
      radius: "0rem",
      width: "2px",
    },
    effects: {
      shadow: "0 0 40px rgb(250 204 21 / 0.4)",
      hover: "translateY(-4px) scale(1.02)",
    },
  },
  
  elegant: {
    colors: {
      primary: "25 40% 35%",        // Warm brown
      secondary: "36 33% 75%",      // Warm beige
      accent: "36 55% 50%",         // Amber
      background: "43 13% 98%",     // Cream
      foreground: "25 20% 25%",     // Warm brown
      muted: "43 13% 90%",          // Light cream
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      headingWeight: "400",
      headingSize: "1.05",
    },
    spacing: {
      sectionPadding: "5rem",
      elementSpacing: "2.5rem",
    },
    borders: {
      radius: "0.25rem",
      width: "1px",
    },
    effects: {
      shadow: "0 4px 20px rgb(0 0 0 / 0.08)",
      hover: "translateY(-2px)",
    },
  },
};
