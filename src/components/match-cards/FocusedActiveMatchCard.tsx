import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  level?: string;
  status: "In-Game" | "Resting" | "Ready" | "Reserve" | "Waitlist";
  user?: {
    id: string;
    userName: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo?: string;
      skill?: {
        id: number;
        description: string;
      };
      upload?: {
        id: string;
        fileName: string;
        filePath: string;
      };
    };
  };
  email?: string;
  contactNo?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Rejected';
  skillLevel?: string;
  matchCount?: number;
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


const FocusedActiveMatchCard: React.FC<FocusedActiveMatchCardProps> = ({ court }) => {
  const tlAbstractRef = useRef<HTMLImageElement>(null);
  const trAbstractRef = useRef<HTMLImageElement>(null);
  const teamUpRef = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const pickleRef = useRef<HTMLImageElement>(null);
  const teamACardsRef = useRef<HTMLDivElement>(null);
  const teamBCardsRef = useRef<HTMLDivElement>(null);
  const go8PowerRef = useRef<HTMLImageElement>(null);
  const courtInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Set initial states
    gsap.set(tlAbstractRef.current, {
      x: '-100%',
      opacity: 0
    });
    
    gsap.set(trAbstractRef.current, {
      x: '100%',
      opacity: 0
    });

    gsap.set(teamUpRef.current, {
      y: '-100%',
      opacity: 0
    });

    gsap.set([logoRef.current, pickleRef.current], {
      opacity: 0
    });

    gsap.set([teamACardsRef.current, teamBCardsRef.current], {
      y: '100%',
      opacity: 0
    });

    gsap.set(go8PowerRef.current, {
      y: '100%',
      opacity: 0
    });

    gsap.set(courtInfoRef.current, {
      y: '50px',
      opacity: 0
    });

    // Animation sequence
    tl
      // 1. TL and TR abstract slide in from opposite sides
      .to(tlAbstractRef.current, {
        x: '0%',
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      })
      .to(trAbstractRef.current, {
        x: '0%',
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.8')
      // 2. Team up falls from top
      .to(teamUpRef.current, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'bounce.out'
      }, '-=0.4')
      // 3. Logo and pickle fade in
      .to([logoRef.current, pickleRef.current], {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.2')
      // 3.5. Court info slides up
      .to(courtInfoRef.current, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.1')
      // 4. Team A and B cards slide up from bottom
      .to([teamACardsRef.current, teamBCardsRef.current], {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.1
      }, '-=0.3')
      // 5. Go8Power slides in from bottom at the end
      .to(go8PowerRef.current, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.2');

  }, []);

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center shadow-2xl transition-all duration-500 scale-100 z-20 rounded-none ring-8 ring-green-400/30 ring-opacity-50"
      style={{
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        margin: '0',
        backgroundImage: 'url(/matchupbg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay with blend mode to merge with background */}
 
      
      <img ref={tlAbstractRef} src="/TLabstract.png" className='absolute top-0 left-0 w-[20%] h-[55%] object-fill h-32 z-20' alt="" />
      <img ref={trAbstractRef} src="/TRabstract.png" className='absolute top-0 right-0 w-[20%] h-[55%] object-fill h-32 z-20' alt="" />
      <div className='flex flex-1 flex-col justify-center items-center'>
        <div className='flex flex-nowrap gap-[30%] justify-center items-center  w-full'>
          <img ref={logoRef} src="/logo.png" className='z-50 w-40' alt="" />
          <img ref={pickleRef} src="/pickle.jpg"className='z-50 w-40 rounded-full' alt="" />
        </div>
        <img ref={teamUpRef} src="/teamup.png" className='z-50' alt="" />
        {/* Court Information */}
        <div ref={courtInfoRef} className="mt-4 z-50 text-center">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-green-400/50">
            <h2 className="text-3xl font-bold text-white mb-2">
              {court.name}
            </h2>
            <div className="flex items-center justify-center gap-4 text-lg">
              <span className={`px-4 py-2 rounded-full font-semibold ${
                court.status === 'Open' ? 'bg-green-500 text-white' :
                court.status === 'In-Game' ? 'bg-blue-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {court.status}
              </span>
              <span className="text-gray-300">
                Capacity: {court.capacity}
              </span>
            </div>
            {court.startTime && court.endTime && (
              <div className="mt-2 text-gray-300">
                <span className="text-sm">
                  {new Date(court.startTime).toLocaleTimeString()} - {new Date(court.endTime).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-1 relative justify-center gap-64 w-full items-center'>
        {/* Team A */}
        <div ref={teamACardsRef} className='flex flex-nowrap gap-4'>
        <div
         className='p-4 py-3 z-50 relative'
          style={{
            minHeight: '350px',
            width: '350px',
            maxWidth: '350px',
            height: '350px',
            margin: '0',
            backgroundImage: 'url(/card.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img src={court.teamA[0]?.avatar || '/default_avatar.png'} className='w-full rounded-4xl h-full object-cover' />
          {/* Player Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-4xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                {court.teamA[0]?.name || 'Unknown Player'}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm text-gray-300">
                  {court.teamA[0]?.level || 'Intermediate'}
                </span>
                {court.teamA[0]?.matchCount && court.teamA[0].matchCount > 0 && (
                  <span className="bg-white/20 px-1 rounded text-xs">
                    {court.teamA[0].matchCount}
                  </span>
                )}
           
              </div>
              {court.teamA[0]?.email && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamA[0].email}
                </p>
              )}
              {court.teamA[0]?.contactNo && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamA[0].contactNo}
                </p>
              )}
            </div>
          </div>
        </div>
        <div
         className='p-4 py-3 z-50 relative'
          style={{
            minHeight: '350px',
            width: '350px',
            maxWidth: '350px',
            height: '350px',
            margin: '0',
            backgroundImage: 'url(/card.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img src={court.teamA[1]?.avatar || '/default_avatar.png'} className='w-full rounded-4xl h-full object-cover' />
          {/* Player Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-4xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                {court.teamA[1]?.name || 'Unknown Player'}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm text-gray-300">
                  {court.teamA[1]?.level || 'Intermediate'}
                </span>
                {court.teamA[1]?.matchCount && court.teamA[1].matchCount > 0 && (
                  <span className="bg-white/20 px-1 rounded text-xs">
                    {court.teamA[1].matchCount}
                  </span>
                )}
           
              </div>
              {court.teamA[1]?.email && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamA[1].email}
                </p>
              )}
              {court.teamA[1]?.contactNo && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamA[1].contactNo}
                </p>
              )}
            </div>
          </div>
        </div>
        </div>
        <div className='z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <img src="/versus.png" className='w-full z-50 h-full object-cover' />
        </div>
        {/* Team b */}
        <div ref={teamBCardsRef} className='flex flex-nowrap gap-4'>
        <div
         className='p-4 py-3 z-40 relative'
          style={{
            minHeight: '350px',
            width: '350px',
            maxWidth: '350px',
            height: '350px',
            margin: '0',
            backgroundImage: 'url(/card.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img src={court.teamB[0]?.avatar || '/default_avatar.png'} className='w-full rounded-4xl h-full object-cover' />
          {/* Player Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-4xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                {court.teamB[0]?.name || 'Unknown Player'}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm text-gray-300">
                  {court.teamB[0]?.level || 'Intermediate'}
                </span>
                {court.teamB[0]?.matchCount && court.teamB[0].matchCount > 0 && (
                  <span className="bg-white/20 px-1 rounded text-xs">
                    {court.teamB[0].matchCount}
                  </span>
                )}
       
              </div>
              {court.teamB[0]?.email && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamB[0].email}
                </p>
              )}
              {court.teamB[0]?.contactNo && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamB[0].contactNo}
                </p>
              )}
            </div>
          </div>
        </div>
        <div
         className='p-4 py-3 z-50 relative'
          style={{
            minHeight: '350px',
            width: '350px',
            maxWidth: '350px',
            height: '350px',
            margin: '0',
            backgroundImage: 'url(/card.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img src={court.teamB[1]?.avatar || '/default_avatar.png'} className='w-full rounded-4xl h-full object-cover' />
          {/* Player Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-4xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                {court.teamB[1]?.name || 'Unknown Player'}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm text-gray-300">
                  {court.teamB[1]?.level || 'Intermediate'}
                </span>
                {court.teamB[1]?.matchCount && court.teamB[1].matchCount > 0 && (
                  <span className="bg-white/20 px-1 rounded text-xs">
                    {court.teamB[1].matchCount}
                  </span>
                )}
    
              </div>
              {court.teamB[1]?.email && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamB[1].email}
                </p>
              )}
              {court.teamB[1]?.contactNo && (
                <p className="text-xs text-gray-400 truncate">
                  {court.teamB[1].contactNo}
                </p>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
      <div>
        <img ref={go8PowerRef} src="/go8power.png" alt="" />
      </div>
    </div>
  );
};

export default FocusedActiveMatchCard;



