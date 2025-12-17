import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StylePreset, StylePresetName, stylePresets } from '@/styles/presets';

interface StyleContextType {
  currentStyle: StylePresetName;
  styles: StylePreset;
  setStyle: (style: StylePresetName) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export function StyleProvider({ children, defaultStyle = 'premium' }: { children: ReactNode; defaultStyle?: StylePresetName }) {
  const [currentStyle, setCurrentStyle] = useState<StylePresetName>(defaultStyle);

  const value: StyleContextType = {
    currentStyle,
    styles: stylePresets[currentStyle],
    setStyle: setCurrentStyle,
  };

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  );
}

export function useStylePreset(): StyleContextType {
  const context = useContext(StyleContext);
  if (!context) {
    // Return default premium styles if not in provider
    return {
      currentStyle: 'premium',
      styles: stylePresets.premium,
      setStyle: () => {},
    };
  }
  return context;
}
