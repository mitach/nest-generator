import { useState, useCallback } from 'react';

export const useExpandableSection = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const isExpanded = useCallback((section: string) => {
    return expandedSections[section] || false;
  }, [expandedSections]);

  return {
    toggleSection,
    isExpanded
  };
};