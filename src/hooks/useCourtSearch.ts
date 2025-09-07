import { useState, useMemo } from 'react';
import type { Court } from '@/types/court.types';

export const useCourtSearch = (courts: Court[]) => {
  const [query, setQuery] = useState("");

  const filteredCourts = useMemo(() => {
    if (!query.trim()) {
      return courts;
    }
    
    const searchTerm = query.toLowerCase();
    return courts.filter((court) =>
      [court.name, court.status, court.location].some((field) =>
        field.toLowerCase().includes(searchTerm)
      )
    );
  }, [courts, query]);

  const clearSearch = () => setQuery("");

  return {
    query,
    setQuery,
    filteredCourts,
    clearSearch,
  };
};
