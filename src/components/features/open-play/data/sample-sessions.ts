import type { Level, OpenPlaySession, Participant, ParticipantStatus } from "../types";

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

const ATHLETE_PHOTOS = [
  "https://img.freepik.com/premium-psd/smiling-athlete-with-arms-crossed-against-black-isolated-background_176841-89124.jpg?w=2000", // tennis
  "https://png.pngtree.com/png-vector/20240913/ourlarge/pngtree-fitness-coach-png-image_12910594.png", // basketball
  "https://img.freepik.com/premium-psd/close-up-portrait-attractive-cheerful-content-powerful-guy-demonstrating-biceps-protein-isolated-light-grey-color-isolated-background_176841-89689.jpg?w=996", // running
  "https://st2.depositphotos.com/3258807/7831/i/950/depositphotos_78312054-stock-photo-solid-man-with-crossed-arms.jpg", // tennis (repeat okay)
  "https://d2gg9evh47fn9z.cloudfront.net/800px_COLOURBOX6437105.jpg",
  "https://images.freeimages.com/images/premium/previews/1657/16575334-portrait-of-businesswoman-with-crossed-arms.jpg",
];

function makePlayers(status: ParticipantStatus[] = ["Ready", "Resting", "Reserve"]) {
  return people.map(([name, lvl, idx]) => {
    const i = (idx as number) - 1; // zero-based
    const currentStatus = status[(idx as number) % status.length];
    
    return {
      id: `u${idx}`,
      name,
      level: lvl as Level,
      status: currentStatus,
      avatarUrl: ATHLETE_PHOTOS[i % ATHLETE_PHOTOS.length],
      paymentStatus: currentStatus === "Waitlist" ? "Pending" : "Paid",
      isApproved: currentStatus !== "Waitlist",
      waitlistReason: currentStatus === "Waitlist" ? 
        (idx % 3 === 0 ? "Payment pending" : 
         idx % 3 === 1 ? "Registration incomplete" : 
         "Awaiting admin approval") : undefined,
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
    participants: makePlayers(["Ready", "Resting", "Reserve"]) as Participant[],
  },
  {
    id: "op-2",
    title: "Tennis Rally Night",
    when: "Sat • 9:00–11:00 AM",
    location: "Court 3",
    level: ["Intermediate", "Advanced"],
    rules: "First to 4 games, no-ad.",
    format: "Singles or doubles based on turnout.",
    participants: makePlayers(["Ready", "Resting", "Reserve"]) as Participant[],
  },
];
