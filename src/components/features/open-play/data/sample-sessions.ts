import type { Level, OpenPlaySession, ParticipantStatus } from "../types";

const people = [
  ["Alice Johnson", "Intermediate", 1],
  ["Bob Smith", "Beginner", 2],
  ["Carol Davis", "Advanced", 3],
  ["David Lee", "Intermediate", 4],
  ["Ivy Turner", "Beginner", 5],
  ["Jack Miller", "Advanced", 6],
  ["Kate Alvarez", "Intermediate", 7],
  ["Liam Chen", "Intermediate", 8],
  ["Mia Patel", "Beginner", 9],
  ["Noah Garcia", "Advanced", 10],
  ["Owen Brooks", "Intermediate", 11],
  ["Pia Ramos", "Advanced", 12],
  ["Quinn Reyes", "Beginner", 13],
  ["Rhea Santos", "Intermediate", 14],
  ["Sam Wong", "Advanced", 15],
  ["Tara Singh", "Intermediate", 16],
] as const;

// 16 athlete-themed photos (square-cropped); swap any links as you like.
const ATHLETE_PHOTOS = [
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=240&h=240&q=60", // tennis
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&h=240&q=60", // basketball
  "https://images.unsplash.com/photo-1521417531735-1fdf5b0c9cde?auto=format&fit=crop&w=240&h=240&q=60", // running
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=240&h=240&q=60", // tennis (repeat okay)
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1521417531735-1fdf5b0c9cde?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1521417531735-1fdf5b0c9cde?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1521417531735-1fdf5b0c9cde?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1521417531735-1fdf5b0c9cde?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=240&h=240&q=60",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=240&h=240&q=60",
];

function makePlayers(status: ParticipantStatus[] = ["Ready", "Resting", "Reserve"]) {
  return people.map(([name, lvl, idx]) => {
    const i = (idx as number) - 1; // zero-based
    return {
      id: `u${idx}`,
      name,
      level: lvl as Level,
      status: status[(idx as number) % status.length],
      avatarUrl: ATHLETE_PHOTOS[i % ATHLETE_PHOTOS.length],
    };
  });
}

export const SAMPLE_SESSIONS: OpenPlaySession[] = [
  {
    id: "op-1",
    title: "Pickleball Open Play",
    when: "Fri • 7:00–9:00 PM",
    location: "Court A",
    level: ["Beginner", "Intermediate"],
    rules: "Games to 11, win by 2.",
    format: "Rolling queue, doubles preferred.",
    participants: makePlayers(["Ready", "Resting", "Reserve"]).slice(0, 12),
  },
  {
    id: "op-2",
    title: "Tennis Rally Night",
    when: "Sat • 9:00–11:00 AM",
    location: "Court 3",
    level: ["Intermediate", "Advanced"],
    rules: "First to 4 games, no-ad.",
    format: "Singles or doubles based on turnout.",
    participants: makePlayers(["Ready", "Resting"]).slice(6, 16),
  },
];
