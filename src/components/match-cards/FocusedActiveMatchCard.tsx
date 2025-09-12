import React from 'react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  level: string;
  status: "In-Game" | "Resting" | "Ready" | "Reserve" | "Waitlist";
}

interface Court {
  id: string;
  name: string;
  capacity: number;
  status: "Open" | "In-Game" | "Closed";
  teamA: Participant[];
  teamB: Participant[];
  teamAName?: string;
  teamBName?: string;
  startTime?: string;
  endTime?: string;
  score?: string;
  winner?: "A" | "B";
}

interface FocusedActiveMatchCardProps {
  court: Court;
  focusedCourtId: string | null;
  onFocus: (courtId: string) => void;
}


const FocusedActiveMatchCard: React.FC<FocusedActiveMatchCardProps> = () => {
  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center shadow-2xl transition-all duration-500 scale-100 z-20 rounded-none ring-8 ring-green-400/30 ring-opacity-50"
      style={{
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        margin: '0',
        backgroundImage: 'url(/matchup.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
    </div>
  );
};

export default FocusedActiveMatchCard;



// className="relative w-full h-full bg-[#be5832] flex flex-col justify-center items-center shadow-2xl transition-all duration-500 scale-100 z-20 rounded-none ring-8 ring-green-400/30 ring-opacity-50"
// style={{
//   minHeight: '100vh',
//   width: '100vw',
//   maxWidth: '100vw',
//   height: '100vh',
//   margin: '0'
// }}
// >

// <div className="flex-1 w-full  flex items-center justify-center p-6">
//   <div className="w-full flex flex-nowrap items-center items-center overflow-hidden h-full relative">
  
//     <div className="flex flex-1 bg-[#645955] gap-6 h-full justify-between z-50 items-center">
//       {court.teamA.map((player, index) => (
//         <div key={player.id} className="text-center relative w-full h-80">
//           <Avatar className="border-4 border-white shadow-2xl h-64 w-64">
//             <AvatarImage src={player.avatar} />
//             <AvatarFallback className="font-bold bg-white/20 text-4xl">
//               {player.initials}
//             </AvatarFallback>
//           </Avatar>
          
//           <div className="bg-black/95 absolute bottom-0 w-max min-w-72 inset-x-0 mx-auto left-0 right-0 backdrop-blur-sm rounded-lg px-4 py-3 mt-3 border border-white/40 shadow-xl z-40">
//             <div className="font-black uppercase tracking-wide text-white text-2xl">
//               PLAYER {index + 1}
//             </div>
//             <div className="text-white/90 mt-1 font-semibold text-lg">
//               {player.name}
//             </div>
//             <div className="text-white/70 mt-1 text-base">
//               {player.level}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//     <div className=" z-50">
//       <div className="w-[400px] h-[400px] relative flex items-center justify-center">
//         <Canvas
//           camera={{ position: [0, 0, 200], fov: 75 }}
//         >
//           <ambientLight intensity={0.6} />
//           <directionalLight position={[10, 10, 5]} intensity={1.2} />
//           <pointLight position={[-10, -10, -5]} intensity={0.8} />
//           <pointLight position={[0, 0, 10]} intensity={0.5} color="#ffffff" />
//           <Environment preset="studio" />
//           <Suspense fallback={<VSModelFallback />}>
//             <VSModel />
//           </Suspense>
    
//         </Canvas>
//       </div>
//        {court.startTime && (
//         <div className="bg-gradient-to-r from-green-600/90 to-blue-600/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-xl mt-8 border border-white/30">
//           <div className="flex items-center gap-4">
//             <Clock className="h-6 w-6 text-white" />
//             <div>
//               <div className="text-lg text-white opacity-90 font-semibold">Start Time</div>
//               <div className="text-2xl font-bold text-white">{court.startTime}</div>
//             </div>
//           </div>
//         </div>
//       )} 
//     </div>

//     <div className="flex flex-1 bg-[#645955] gap-6 h-full justify-between z-50 items-center">
//       {court.teamB.map((player, index) => (
//         <div key={player.id} className="text-center relative w-full h-80">
//           <Avatar className="border-4 border-white shadow-2xl h-64 w-64">
//             <AvatarImage src={player.avatar} />
//             <AvatarFallback className="font-bold bg-white/20 text-4xl">
//               {player.initials}
//             </AvatarFallback>
//           </Avatar>
          
//           <div className="bg-black/95 absolute bottom-0 w-max min-w-72 inset-x-0 mx-auto left-0 right-0 backdrop-blur-sm rounded-lg px-4 py-3 mt-3 border border-white/40 shadow-xl z-40">
//             <div className="font-black uppercase tracking-wide text-white text-2xl">
//               PLAYER {index + 1}
//             </div>
//             <div className="text-white/90 mt-1 font-semibold text-lg">
//               {player.name}
//             </div>
//             <div className="text-white/70 mt-1 text-base">
//               {player.level}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// </div>
//  <div className="absolute top-3 right-3 z-50">
//   <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
//     <div className="w-2 h-2 bg-white rounded-full"></div>
//     IN-GAME
//   </div>
// </div> 
// </div> 