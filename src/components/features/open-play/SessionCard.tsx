/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users, Settings, UserCheck, Star, Sparkles } from "lucide-react";
import type { PlayerItem } from "@/components/player-status-panel";

type LevelTag = "Beginner" | "Intermediate" | "Advanced";

type OpenPlaySession = {
  id: string;
  title: string;
  description?: string;
  when: string;
  location: string;
  eventType?: "one-time" | "recurring" | "tournament";
  level: LevelTag[];
  participants: (PlayerItem & {
    avatar?: string;
    initials?: string;
    level?: LevelTag;
  })[];
  occurrenceId?: string;
  occurrences?: any[];
  maxParticipants?: number;
  pricePerPlayer?: number;
  sessionType?: string;
  isActive?: boolean;
  createdAt?: string;
  hub?: any;
  sport?: any;
  totalOccurrences?: number;
  isDummy?: boolean;
  isFreeJoin?: boolean;
};

interface SessionCardProps {
  session: OpenPlaySession;
  selectedSessionId?: string | null;
  onManageSession: (session: OpenPlaySession) => void;
  onOpenParticipants: (sessionId: string) => void;
}

const levelColor: Record<LevelTag, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "👤";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase() || "👤";
}

function AvatarsStrip({
  people,
  max = 4,
  size = 28,
}: {
  people: { avatar?: string; initials?: string; name: string }[];
  max?: number;
  size?: number;
}) {
  const visible = people.slice(0, max);
  const overflow = Math.max(0, people.length - visible.length);

  return (
    <div className="flex -space-x-1.5" role="list" aria-label="Participants">
      {visible.map((p, i) => (
        <Avatar
          key={`${p.name}-${i}`}
          className="ring-1 ring-white shadow-sm bg-white"
          style={{ width: size, height: size }}
          role="listitem"
          title={p.name}
        >
          {p.avatar ? (
            <AvatarImage src={p.avatar} alt={p.name} />
          ) : (
            <AvatarFallback className="text-[10px] font-semibold">
              {p.initials || initialsFromName(p.name)}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="grid place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-white shadow-sm text-[10px] font-medium"
          style={{ width: size, height: size }}
          aria-label={`${overflow} more`}
          title={`${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

const SessionCard: React.FC<SessionCardProps> = ({
  session: s,
  selectedSessionId,
  onManageSession,
  onOpenParticipants,
}) => {
  const navigate = useNavigate();

  const maxParticipants = s.maxParticipants ?? 10;
  const participantCount = s.participants?.length ?? 0;
  const isActive = s.isActive ?? participantCount > 0;
  const isFree = Boolean(s.isFreeJoin || s.pricePerPlayer === 0);
  const isFull = participantCount >= maxParticipants;
  const almostFull = !isFull && participantCount >= Math.max(2, Math.floor(maxParticipants * 0.75));

  const progress = Math.min(100, Math.round((participantCount / maxParticipants) * 100));
  const progressColor = progress >= 90 ? "bg-green-600" : progress >= 60 ? "bg-emerald-500" : progress >= 30 ? "bg-blue-500" : "bg-gray-400";

  const topLevels = useMemo(
    () => Array.from(new Set((s.participants || []).map((p) => p.level).filter(Boolean))) as LevelTag[],
    [s.participants]
  );

  const firstOccurrenceId = (s.occurrences?.[0]?.id as string | undefined) || s.occurrenceId || s.id;

  const handleCardClick = useCallback(() => {
    // For recurring sessions, use the onManageSession prop to show occurrence selector
    if (s.eventType === 'recurring' && (s as any).occurrences && (s as any).occurrences.length > 1) {
      onManageSession(s);
    } else {
      // For single sessions or recurring sessions with only one occurrence, go directly
      navigate(`/open-play/${s.id}?occurrenceId=${firstOccurrenceId}`, { state: { session: s } });
    }
  }, [navigate, s, firstOccurrenceId, onManageSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleManageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onManageSession(s);
  };

  const handleParticipantsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenParticipants(s.id);
  };

  return (
    <div
      key={s.id}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.01] hover:border-primary/40",
        "focus-within:ring-2 focus-within:ring-primary/60",
        selectedSessionId === s.id ? "ring-2 ring-primary/70 shadow-xl shadow-primary/25 scale-[1.01]" : "",
        isActive ? "border-green-200/60" : "border-border",
        s.isDummy ? "border-dashed border-orange-300 bg-orange-50/40" : ""
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open session ${s.title}`}
    >
      {/* Subtle animated accent (reduced-motion friendly) */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary/15 to-transparent motion-safe:animate-pulse/slow" />

      {/* Decorative gradient border on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 rounded-xl [mask:linear-gradient(#000,transparent_60%)] bg-gradient-to-b from-primary/10 to-transparent" />
      </div>

      {/* Status/Badges */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col items-end gap-1">
        {isFull ? (
          <Badge className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 border-red-200">Sold out</Badge>
        ) : almostFull ? (
          <Badge className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 border-orange-200">Almost full</Badge>
        ) : (
          <Badge className={cn("px-2 py-0.5 text-xs font-medium", isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-800 border-slate-200")}>
            {isActive ? "🟢 Active" : "🔵 Open"}
          </Badge>
        )}
        {isFree && <Badge className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 border-green-200">🆓 Free</Badge>}
        {participantCount >= Math.max(8, Math.floor(maxParticipants * 0.6)) && (
          <Badge className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 border-amber-200">
            <Sparkles className="inline h-3 w-3 mr-1" /> Popular
          </Badge>
        )}
      </div>

      <div className="p-3 sm:p-4 lg:p-5 space-y-3">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground/90 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {s.title}
            </h3>
          </div>

          {s.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {s.description}
            </p>
          )}

          {/* Type & Levels */}
          <div className="flex flex-wrap gap-1.5">
            {s.eventType && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] px-2 py-0.5 font-medium",
                  s.eventType === "tournament"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : s.eventType === "recurring"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                )}
              >
                {s.eventType === "tournament" ? "🏆 Tournament" : s.eventType === "recurring" ? "🔄 Recurring" : "📅 One-time"}
              </Badge>
            )}
            {(s.level || []).map((lvl) => (
              <Badge key={lvl} variant="outline" className={cn("text-[11px] px-2 py-0.5 font-medium", levelColor[lvl])}>
                {lvl}
              </Badge>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-foreground">Schedule</div>
              <div className="truncate">{s.when}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-foreground">Location</div>
              <div className="truncate">{s.location}</div>
            </div>
          </div>
        </div>

        {/* Hub */}
        {s.hub && (
          <div className="rounded-lg p-2 sm:p-2.5 border bg-blue-50/50 border-blue-200/40">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-blue-900 truncate">{s.hub.sportsHubName}</div>
                <div className="text-blue-700 truncate">{[s.hub.city, s.hub.stateProvince].filter(Boolean).join(", ")}</div>
              </div>
            </div>
          </div>
        )}

        {/* Price & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm bg-muted/30 rounded-lg p-2">
          <div className="flex items-center gap-3 flex-wrap">
            {s.eventType === "recurring" && (
              <div className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Weekly</span>
              </div>
            )}
            {s.eventType === "tournament" && (
              <div className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                <span>Single Elimination</span>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>
                Max {maxParticipants} {maxParticipants > 1 ? "players" : "player"}
              </span>
            </div>
          </div>
          <div className="font-medium text-foreground">
            {isFree ? (
              <span className="text-green-600 font-semibold">🆓 Free to join</span>
            ) : (
              <>₱{s.pricePerPlayer ?? 150} per player</>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2 border-t pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <AvatarsStrip
                people={(s.participants || []).map((p) => ({
                  avatar: (p as any).avatar,
                  initials: (p as any).initials,
                  name: p.name,
                }))}
                max={4}
                size={24}
              />
              <div className="text-xs sm:text-sm min-w-0 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-foreground">{participantCount}</span>
                  <span className="text-muted-foreground">/ {maxParticipants}</span>
                </div>
                <div className="text-muted-foreground truncate">
                  {participantCount === 0
                    ? "No participants yet"
                    : participantCount === 1
                    ? "1 participant"
                    : `${participantCount} participants`}
                </div>
              </div>
            </div>
          </div>

          {topLevels.length > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md text-amber-800">
              <Star className="h-3.5 w-3.5" />
              <span className="text-xs font-medium truncate">{topLevels.slice(0, 2).join(", ")}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-[width] duration-500", progressColor)}
              style={{ width: `${progress}%` }}
              aria-label={`Capacity used: ${progress}%`}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {participantCount < 2
              ? "Need at least 2 players"
              : almostFull
              ? "Almost full!"
              : isFull
              ? "Session is full!"
              : "Good momentum"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-primary hover:text-primary transition-colors"
            onClick={handleParticipantsClick}
            aria-label="View and manage players"
          >
            <UserCheck className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm">Players</span>
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-shadow"
            onClick={handleManageClick}
            aria-label="Edit session"
          >
            <Settings className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm">Manage</span>
          </Button>
        </div>

        {/* Footer quick stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500" : "bg-gray-400")} />
              <span className="sr-only">{isActive ? "Active" : "Inactive"}</span>
              <span aria-hidden>{isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{s.totalOccurrences ?? 0} sessions</span>
            </div>
            {s.sport?.name && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="truncate">{s.sport.name}</span>
              </div>
            )}
          </div>
          <div className="font-medium text-foreground">{s.eventType === "recurring" ? "Ongoing" : "Scheduled"}</div>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
