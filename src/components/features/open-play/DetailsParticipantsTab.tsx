/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Participant } from "@/components/features/open-play/types";
import { getStatusString } from "@/components/features/open-play/types";
import AddPlayerModal, { type PlayerFormData } from "@/components/features/open-play/AddPlayerModal";
import {
  Users,
  Trophy,
  UserCheck,
  UserX,
  UserLock,
  UserPlus,
  CheckCircle,
  RotateCcw,
  Play,
  Pause,
} from "lucide-react";

interface DetailsParticipantsTabProps {
  session: any; // Raw session data from API
  participants: Participant[];
  occurrence?: any;
  readyList: Participant[];
  restingList: Participant[];
  reserveList: Participant[];
  waitlistList: Participant[];
  courts: any[];
  addPlayerOpen: boolean;
  setAddPlayerOpen: (open: boolean) => void;
  isUpdatingStatus: Set<string>;
  onUpdateStatus: (participantId: string, status: any) => Promise<void>;
  onRemoveFromAllTeams: (participantId: string) => void;
  onApproveWaitlistParticipant: (participantId: string, targetStatus: "READY" | "RESERVE") => void;
  onRejectWaitlistParticipant: (participantId: string) => void;
  onAddPlayer: (playerData: PlayerFormData) => Promise<void>;
  onPlayerAddSuccess: () => Promise<void>;
  onPlayerAddError: (error: any) => void;
  isAddingPlayer: boolean;
  onSwitchToGameTab: () => void;
}

const DetailsParticipantsTab: React.FC<DetailsParticipantsTabProps> = ({
  session,
  participants,
  occurrence,
  readyList,
  restingList,
  reserveList,
  waitlistList,
  courts,
  addPlayerOpen,
  setAddPlayerOpen,
  isUpdatingStatus,
  onUpdateStatus,
  onRemoveFromAllTeams,
  onApproveWaitlistParticipant,
  onAddPlayer,
  onPlayerAddSuccess,
  onPlayerAddError,
  isAddingPlayer,
  onSwitchToGameTab,
}) => {
  console.log(occurrence)
  function getStatusIcon(status: string) {
    switch (status) {
      case "READY":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "IN-GAME":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "RESTING":
        return <Pause className="h-4 w-4 text-orange-600" />;
      case "RESERVE":
        return <RotateCcw className="h-4 w-4 text-gray-600" />;
      case "WAITLIST":
        return <UserLock className="h-4 w-4 text-yellow-600" />;
      case "PENDING":
        return <UserLock className="h-4 w-4 text-orange-600" />;
      case "ONGOING":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <UserX className="h-4 w-4 text-red-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "READY":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN-GAME":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESTING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "RESERVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "WAITLIST":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "ONGOING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Session Info Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Session Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Rules</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {session.rules || session.description || "Standard club rules apply."}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Format</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {session.format || "Open queue and court rotation."}
                  </p>
                </div>
              </div>
            </div>

            {/* Participants Management */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Participants</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      <span>Total: {participants.length}</span>
                    </div>
                    <Button
                      onClick={() => setAddPlayerOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Player
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{readyList.length}</div>
                    <div className="text-xs text-gray-600">Ready</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {participants.filter((p) => getStatusString(p.status) === "IN-GAME").length}
                    </div>
                    <div className="text-xs text-gray-600">In Game</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{restingList.length}</div>
                    <div className="text-xs text-gray-600">Resting</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{reserveList.length}</div>
                    <div className="text-xs text-gray-600">Reserve</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{waitlistList.length}</div>
                    <div className="text-xs text-gray-600">Waitlist</div>
                  </div>
                </div>
              </div>

              {/* Waitlist Section */}
              {/* {waitlistList.length > 0 && (
                <div className="p-6 border-b bg-yellow-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <UserLock className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800">
                        Waitlist ({waitlistList.length})
                      </h3>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-400">
                        Payment Required
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          waitlistList.forEach((p) =>
                            onApproveWaitlistParticipant(p.id, "RESERVE")
                          );
                        }}
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Approve All as Reserve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          waitlistList.forEach((p) =>
                            onApproveWaitlistParticipant(p.id, "READY")
                          );
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve All as Ready
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {waitlistList.map((participant) => {
                      return (
                      <div
                        key={participant.id}
                        className="p-4 bg-white rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={participant.avatar || '/default_avatar.png'} />
                            
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{participant?.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {participant.level ?? 'Veteran'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectWaitlistParticipant(participant.id)}
                              className="text-red-700 border-red-300 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onApproveWaitlistParticipant(participant.id, "RESERVE")
                              }
                              className="text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Approve as Reserve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                onApproveWaitlistParticipant(participant.id, "READY")
                              }
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve as Ready
                            </Button>
                          </div>
                        </div>
                        {participant.waitlistReason && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-4 border-yellow-400">
                            <span className="font-medium">Reason:</span>{" "}
                            {participant.waitlistReason}
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                </div>
              )} */}

              {/* All Participants */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">All Participants</h3>
                  <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-lg">
                    💡 Click buttons to change player status: Ready • Resting • Waitlist • Reserve • Reject (IN-GAME and Endgame status cannot be changed)
                  </div>
                </div>
                <div className="space-y-3">
                    {participants.map((participant) => {
                      console.log(participant)
                      return(
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.avatar || '/default_avatar.png'} />
                        
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {participant?.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {participant.level ?? 'Beginner'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(getStatusString(participant.status ?? participant.status?.description))}
                              <span className="text-xs text-gray-600">{getStatusString(participant.status ?? participant.status?.description)}</span>
                            </div>
                            {participant.gamesPlayed !== undefined && (
                              <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 bg-blue-50">
                                {participant.gamesPlayed} games
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(getStatusString(participant.status ?? participant.status?.description))}>
                          {getStatusString(participant.status ?? participant.status?.description)}
                        </Badge>
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Ready Button - Show if not already Ready, not Endgame, and not IN-GAME */}
                          {!["READY"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["ENDGAME"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["IN-GAME"].includes(getStatusString(participant.status ?? participant.status?.description)) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  console.log(`Ready button clicked for participant ${participant.id}`);
                                  onRemoveFromAllTeams(participant.id);
                                  await onUpdateStatus(participant.id, "READY");
                                }}
                                disabled={isUpdatingStatus.has(participant.id)}
                                className="text-green-700 border-green-300 hover:bg-green-50"
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                {isUpdatingStatus.has(participant.id) ? "Updating..." : "Ready"}
                              </Button>
                            )}
                          
                          {/* Resting Button - Show if not already Resting, not Endgame, and not IN-GAME */}
                          {!["REST", "RESTING"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["ENDGAME"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["IN-GAME"].includes(getStatusString(participant.status ?? participant.status?.description)) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  console.log(`Resting button clicked for participant ${participant.id}`);
                                  onRemoveFromAllTeams(participant.id);
                                  await onUpdateStatus(participant.id, "RESTING");
                                }}
                                disabled={isUpdatingStatus.has(participant.id)}
                                className="text-orange-700 border-orange-300 hover:bg-orange-50"
                              >
                                <Pause className="h-3 w-3 mr-1" />
                                {isUpdatingStatus.has(participant.id) ? "Updating..." : "Resting"}
                              </Button>
                            )}
                          
                          {/* Waitlist Button - Show if not already Waitlist, not Endgame, and not IN-GAME */}
                          {!["WAITLIST"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["ENDGAME"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["IN-GAME"].includes(getStatusString(participant.status ?? participant.status?.description)) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  console.log(`Waitlist button clicked for participant ${participant.id}`);
                                  onRemoveFromAllTeams(participant.id);
                                  await onUpdateStatus(participant.id, "WAITLIST");
                                }}
                                disabled={isUpdatingStatus.has(participant.id)}
                                className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                              >
                                <UserLock className="h-3 w-3 mr-1" />
                                {isUpdatingStatus.has(participant.id) ? "Updating..." : "Waitlist"}
                              </Button>
                            )}
                          
                          {/* Reserve Button - Show if not already Reserve, not Endgame, and not IN-GAME */}
                          {!["RESERVE"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["ENDGAME"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["IN-GAME"].includes(getStatusString(participant.status ?? participant.status?.description)) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  console.log(`Reserve button clicked for participant ${participant.id}`);
                                  onRemoveFromAllTeams(participant.id);
                                  await onUpdateStatus(participant.id, "RESERVE");
                                }}
                                disabled={isUpdatingStatus.has(participant.id)}
                                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                {isUpdatingStatus.has(participant.id) ? "Updating..." : "Reserve"}
                              </Button>
                            )}
                          
                          {/* Reject Button - Show if not already Rejected, not Endgame, and not IN-GAME */}
                          {!["REJECTED"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["ENDGAME"].includes(getStatusString(participant.status ?? participant.status?.description)) &&
                            !["IN-GAME"].includes(getStatusString(participant.status ?? participant.status?.description)) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  console.log(`Reject button clicked for participant ${participant.id}`);
                                  onRemoveFromAllTeams(participant.id);
                                  await onUpdateStatus(participant.id, "REJECTED");
                                }}
                                disabled={isUpdatingStatus.has(participant.id)}
                                className="text-red-700 border-red-300 hover:bg-red-50"
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                {isUpdatingStatus.has(participant.id) ? "Updating..." : "Reject"}
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  )})}
                    {participants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No participants yet.</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Participants</span>
                  <span className="font-semibold">{participants.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Courts</span>
                  <span className="font-semibold">
                    {courts.filter((c) => c.status === "Open").length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Games</span>
                  <span className="font-semibold">
                    {courts.filter((c) => c.status === "In-Game").length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Waitlist</span>
                  <span className="font-semibold text-yellow-600">{waitlistList.length}</span>
                </div>
                <Separator />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {waitlistList.length > 0 && (
                  <>
                    <Button
                      onClick={() => {
                        waitlistList.forEach((p) => onApproveWaitlistParticipant(p.id, "READY"));
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve All as Ready
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        waitlistList.forEach((p) => onApproveWaitlistParticipant(p.id, "RESERVE"));
                      }}
                      className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Approve All as Reserve
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={onSwitchToGameTab} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Manage Games
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Player Modal */}
      <AddPlayerModal
        open={addPlayerOpen}
        onOpenChange={setAddPlayerOpen}
        sessionTitle={session.sessionName || session.title}
        onAddPlayer={onAddPlayer}
        onSuccess={onPlayerAddSuccess}
        onError={onPlayerAddError}
        isLoading={isAddingPlayer}
      />
    </div>
  );
};

export default DetailsParticipantsTab;
