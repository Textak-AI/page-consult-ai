import { PageStyle } from "@/contexts/EditingContext";

export const styleVariants: Record<PageStyle, {
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
  professional: {
    colors: {
      primary: "217 33% 17%",      // Navy blue
      secondary: "189 95% 43%",     // Cyan
      accent: "189 95% 43%",        // Cyan
      background: "0 0% 100%",      // White
      foreground: "217 33% 17%",    // Navy blue
      muted: "220 13% 95%",         // Light gray
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "600",
      headingSize: "1.0",           // Multiplier
    },
    spacing: {
      sectionPadding: "4rem",
      elementSpacing: "1.5rem",
    },
    borders: {
      radius: "0.5rem",
      width: "1px",
    },
    effects: {
      shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      hover: "translateY(-2px)",
    },
  },
  
  modern: {
    colors: {
      primary: "264 83% 62%",       // Purple
      secondary: "189 95% 43%",     // Cyan
      accent: "339 90% 51%",        // Hot pink
      background: "0 0% 100%",      // White
      foreground: "0 0% 10%",       // Almost black
      muted: "240 5% 96%",          // Very light gray
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
      width: "2px",
    },
    effects: {
      shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      hover: "scale(1.02)",
    },
  },
  
  bold: {
    colors: {
      primary: "0 0% 0%",           // Black
      secondary: "45 93% 47%",      // Bright yellow
      accent: "0 84% 60%",          // Red
      background: "0 0% 100%",      // White
      foreground: "0 0% 0%",        // Black
      muted: "0 0% 90%",            // Light gray
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "800",
      headingSize: "1.2",
    },
    spacing: {
      sectionPadding: "3rem",
      elementSpacing: "1.25rem",
    },
    borders: {
      radius: "0.25rem",
      width: "3px",
    },
    effects: {
      shadow: "0 20px 25px -5px rgb(0 0 0 / 0.2)",
      hover: "translateY(-4px)",
    },
  },
  
  minimal: {
    colors: {
      primary: "0 0% 20%",          // Dark gray
      secondary: "0 0% 40%",        // Medium gray
      accent: "0 0% 30%",           // Gray
      background: "0 0% 100%",      // White
      foreground: "0 0% 20%",       // Dark gray
      muted: "0 0% 96%",            // Off-white
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "300",
      headingSize: "0.95",
    },
    spacing: {
      sectionPadding: "6rem",
      elementSpacing: "3rem",
    },
    borders: {
      radius: "0rem",
      width: "0px",
    },
    effects: {
      shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      hover: "opacity: 0.8",
    },
  },
  
  elegant: {
    colors: {
      primary: "25 20% 25%",        // Warm brown
      secondary: "45 29% 64%",      // Warm beige
      accent: "25 40% 50%",         // Warm accent
      background: "43 13% 98%",     // Cream
      foreground: "25 20% 25%",     // Warm brown
      muted: "43 13% 90%",          // Light cream
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "500",
      headingSize: "1.05",
    },
    spacing: {
      sectionPadding: "5rem",
      elementSpacing: "2.5rem",
    },
    borders: {
      radius: "0.75rem",
      width: "1px",
    },
    effects: {
      shadow: "0 4px 20px rgb(0 0 0 / 0.08)",
      hover: "translateY(-3px)",
    },
  },
};
