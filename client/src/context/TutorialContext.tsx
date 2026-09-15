import React, { createContext, useContext, useState } from 'react';

interface TutorialContextType {
  isTutorialOpen: boolean;
  openTutorial: (sectionIndex?: number) => void;
  closeTutorial: () => void;
  initialSection: number;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [initialSection, setInitialSection] = useState(0);

  const openTutorial = (sectionIndex = 0) => {
    setInitialSection(sectionIndex);
    setIsTutorialOpen(true);
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
  };

  return (
    <TutorialContext.Provider value={{ isTutorialOpen, openTutorial, closeTutorial, initialSection }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
