import React from "react";
import { Trophy } from "lucide-react";
import CourtMatchCard from "./CourtMatchCard";
import type { Match } from "../types";

interface CompletedMatchesSectionProps {
  matches: Match[];
  scoreEntry: Record<string, string>;
  onSetScoreEntry: (matchId: string, score: string) => void;
  onSetResult: (matchId: string, winner: 'A' | 'B') => void;
}

const CompletedMatchesSection: React.FC<CompletedMatchesSectionProps> = ({
  matches,
  scoreEntry,
  onSetScoreEntry,
  onSetResult,
}) => {
  // Filter only completed matches
  const completedMatches = matches.filter(match => match.status === 'Completed');
  console.log('completedMatches', completedMatches);
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Completed Matches</h2>
          <p className="text-sm text-gray-600">Match results and final scores</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">
              {completedMatches.length} Completed
            </span>
          </div>
        </div>
      </div>

      {completedMatches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Completed Matches</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Complete matches on the courts above to see the results here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedMatches.map((match) => (
            <CourtMatchCard
              key={match.id}
              match={match}
              scoreEntry={scoreEntry[match.id] ?? ""}
              onSetScoreEntry={(score) => onSetScoreEntry(match.id, score)}
              onSetResult={(winner) => onSetResult(match.id, winner)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedMatchesSection;
