import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Users, Clock } from 'lucide-react';
import type { Match } from '../types';

interface CourtMatchCardProps {
  match: Match;
  scoreEntry: string;
  onSetScoreEntry: (score: string) => void;
  onSetResult: (winner: 'A' | 'B') => void;
}

const CourtMatchCard: React.FC<CourtMatchCardProps> = ({
  match,
  scoreEntry,
  onSetScoreEntry,
  onSetResult,
}) => {
  const isCompleted = match.status === 'Completed';
  const isInGame = match.status === 'IN-GAME';
  const isScheduled = match.status === 'Scheduled';

  const getStatusColor = () => {
    if (isCompleted) return 'bg-gray-100 border-gray-300';
    if (isInGame) return 'bg-blue-50 border-blue-300';
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusIndicator = () => {
    if (isCompleted) return 'bg-gray-400';
    if (isInGame) return 'bg-blue-500 animate-pulse';
    return 'bg-gray-300';
  };

  const getTeamStyles = (team: 'A' | 'B') => {
    const isWinner = isCompleted && match.winner === team;
    const isLoser = isCompleted && match.winner && match.winner !== team;
    
    return {
      container: `relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isWinner 
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' 
          : isLoser
          ? 'border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 opacity-60'
          : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'
      }`,
      header: `flex items-center gap-2 mb-3 ${
        isLoser ? 'opacity-70' : ''
      }`,
      indicator: `w-3 h-3 rounded-full ${
        isWinner 
          ? 'bg-green-500' 
          : isLoser
          ? 'bg-gray-400'
          : 'bg-blue-500'
      }`,
      teamName: `font-bold text-sm ${
        isLoser ? 'text-gray-500' : 'text-gray-800'
      }`,
      playerContainer: `space-y-2 ${
        isLoser ? 'opacity-60' : ''
      }`,
      playerAvatar: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isWinner
          ? 'bg-green-200 text-green-800'
          : isLoser
          ? 'bg-gray-200 text-gray-500'
          : 'bg-blue-200 text-blue-800'
      }`,
      playerName: `text-sm font-medium ${
        isLoser ? 'text-gray-500' : 'text-gray-700'
      }`,
      playerSkill: `text-xs ${
        isLoser ? 'text-gray-400' : 'text-gray-500'
      }`
    };
  };

  const teamAStyles = getTeamStyles('A');
  const teamBStyles = getTeamStyles('B');
  console.log(match);
  return (
    <div className={`relative rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${getStatusColor()}`}>
      {/* Court Header */}
      <div className="relative p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStatusIndicator()}`}></div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{match.courtName}</h3>
              <p className="text-xs text-gray-500">Court Match</p>
            </div>
          </div>
          <Badge 
            variant={isCompleted ? "secondary" : isInGame ? "default" : "outline"}
            className="text-xs font-medium"
          >
            {match.status}
          </Badge>
        </div>
        
        {/* Court Net Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Court Body */}
      <div className="p-4">
        {/* Teams Section - Court Layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Team A - Left Side of Court */}
          <div className={teamAStyles.container}>
            {/* Winner Badge */}
            {isCompleted && match.winner === 'A' && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  WINNER
                </div>
              </div>
            )}
            
            <div className={teamAStyles.header}>
              <div className={teamAStyles.indicator}></div>
              <h4 className={teamAStyles.teamName}>
                Team A {match.teamAName && `(${match.teamAName})`}
              </h4>
            </div>
            
            <div className={teamAStyles.playerContainer}>
              {match.teamA.map((player, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={teamAStyles.playerAvatar}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={teamAStyles.playerName}>
                      {player.name}
                    </div>
                    <div className={teamAStyles.playerSkill}>
                      {player.skillLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team B - Right Side of Court */}
          <div className={teamBStyles.container}>
            {/* Winner Badge */}
            {isCompleted && match.winner === 'B' && (
              <div className="absolute -top-2 -left-2 z-10">
                <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  WINNER
                </div>
              </div>
            )}
            
            <div className={teamBStyles.header}>
              <div className={teamBStyles.indicator}></div>
              <h4 className={teamBStyles.teamName}>
                Team B {match.teamBName && `(${match.teamBName})`}
              </h4>
            </div>
            
            <div className={teamBStyles.playerContainer}>
              {match.teamB.map((player, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={teamBStyles.playerAvatar}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={teamBStyles.playerName}>
                      {player.name}
                    </div>
                    <div className={teamBStyles.playerSkill}>
                      {player.skillLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Court Center Line */}
        <div className="relative mb-4">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white px-2 text-xs text-gray-500 font-medium">VS</div>
          </div>
        </div>

        {/* Match Controls or Results */}
        {isScheduled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Match Scheduled</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Input
                className="h-9 w-32"
                placeholder="Enter score"
                value={scoreEntry}
                onChange={(e) => onSetScoreEntry(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onSetResult('A')}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  Team A Wins
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onSetResult('B')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Team B Wins
                </Button>
              </div>
            </div>
          </div>
        ) : isInGame ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-600">Match in Progress</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Input
                className="h-9 w-32"
                placeholder="Enter score"
                value={scoreEntry}
                onChange={(e) => onSetScoreEntry(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onSetResult('A')}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  Team A Wins
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onSetResult('B')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Team B Wins
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-800">Match Complete</span>
              </div>
              {match.score && (
                <div className="bg-white px-3 py-1 rounded-full border border-green-200">
                  <span className="text-lg font-bold text-green-800">{match.score}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-700 font-semibold">Winner</div>
                <div className="text-green-800 font-bold">
                  {match.winner === 'A' ? (match.teamAName || 'Team A') : (match.teamBName || 'Team B')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-semibold">Runner-up</div>
                <div className="text-gray-500">
                  {match.winner === 'A' ? (match.teamBName || 'Team B') : (match.teamAName || 'Team A')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourtMatchCard;
