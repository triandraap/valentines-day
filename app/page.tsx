"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Music, Volume2, VolumeX } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { toast, Toaster } from 'sonner';

// Generate random stars
type Star = { id: number; x: number; y: number; size: number; delay: number; duration: number };
const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));
};

const questions = [
  "Do you believe in love at first sight?",
  "Will you be my Valentine?",
  "Do you think we're meant to be?",
  "Can I make you smile today?"
];

export default function App() {
  const [stars] = useState(() => generateStars(50));
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [tapCount, setTapCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([false, false, false, false]);
  const [flippedPhotos, setFlippedPhotos] = useState<boolean[]>([false, false, false, false, false]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context and background music
  useEffect(() => {
    const AudioContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    audioContextRef.current = AudioContextCtor ? new AudioContextCtor() : null;
    
    // Create background music element with a romantic piano track
    const bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-romantic-love-11.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    backgroundMusicRef.current = bgMusic;

    return () => {
      audioContextRef.current?.close();
      bgMusic.pause();
    };
  }, []);

  // Play tap sound effect
  const playTapSound = () => {
    if (!audioContextRef.current || isMuted) return;
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const toggleMusic = () => {
    if (!backgroundMusicRef.current) return;
    
    if (isMusicPlaying) {
      backgroundMusicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      backgroundMusicRef.current.play().catch(err => console.log('Audio play failed:', err));
      setIsMusicPlaying(true);
    }
  };

  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e 
      ? ((e.touches[0].clientX - rect.left) / rect.width) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;
    
    // Play tap sound
    playTapSound();
    
    const newHeart = { id: Date.now(), x };
    setFloatingHearts(prev => [...prev, newHeart]);
    
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 3000);

    // Increment tap count
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Move to next slide after 25 taps
    if (newTapCount >= 25 && currentSlide === 1) {
      setTimeout(() => {
        setCurrentSlide(2);
        setTapCount(0);
      }, 500);
    }
  };

  const handleYes = (index: number) => {
    const newAnswered = [...answeredQuestions];
    newAnswered[index] = true;
    setAnsweredQuestions(newAnswered);
    
    // Play tap sound
    playTapSound();
    
    // Check if all questions are answered
    if (newAnswered.every(a => a)) {
      setTimeout(() => {
        setCurrentSlide(1);
      }, 1200);
    }
  };

  const handleNo = () => {
    // Play tap sound
    playTapSound();
    
    const messages = [
      "Oops! That's not the right answer 💔",
      "Try again! Only 'Yes' will work 💕",
      "Come on, you know you want to say yes! 💝",
      "The heart wants what it wants... and it's 'Yes'! 💗",
      "Nice try, but only 'Yes' opens the door to love! 💖"
    ];
    
    toast.error(messages[Math.floor(Math.random() * messages.length)], {
      duration: 3000,
      className: 'bg-pink-500/90 text-white border-pink-300',
    });
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Music control button */}
      {currentSlide > 0 && (
        <motion.button
          className="fixed top-4 right-4 z-50 bg-pink-500/20 backdrop-blur-md rounded-full p-3 text-pink-200 hover:bg-pink-500/30 transition-colors"
          onClick={toggleMusic}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isMusicPlaying ? <Music className="w-5 h-5" /> : <Music className="w-5 h-5 opacity-50" />}
        </motion.button>
      )}

      {/* Mute button */}
      {currentSlide > 0 && (
        <motion.button
          className="fixed top-4 right-20 z-50 bg-pink-500/20 backdrop-blur-md rounded-full p-3 text-pink-200 hover:bg-pink-500/30 transition-colors"
          onClick={() => setIsMuted(!isMuted)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
      )}

      {/* Tap counter (only on second slide) */}
      {currentSlide === 1 && (
        <motion.div
          className="fixed top-4 left-4 z-50 bg-pink-500/20 backdrop-blur-md rounded-full px-4 py-2 text-pink-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3 }}
        >
          <span className="text-sm font-light">{tapCount}/25</span>
          <Heart className="w-4 h-4 inline-block ml-2 fill-current" />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentSlide === 0 ? (
          <motion.div
            key="slide0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="relative w-full min-h-screen"
          >
            <QuestionSlide 
              stars={stars}
              questions={questions}
              answeredQuestions={answeredQuestions}
              handleYes={handleYes}
              handleNo={handleNo}
            />
          </motion.div>
        ) : currentSlide === 1 ? (
          <motion.div
            key="slide1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="relative w-full min-h-screen"
          >
            <FirstSlide 
              stars={stars} 
              floatingHearts={floatingHearts} 
              handleTap={handleTap}
              tapCount={tapCount}
            />
          </motion.div>
        ) : (
          <motion.div
            key="slide2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full min-h-screen"
          >
            <SecondSlide 
              stars={stars} 
              flippedPhotos={flippedPhotos}
              setFlippedPhotos={setFlippedPhotos}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionSlide({
  stars,
  questions,
  answeredQuestions,
  handleYes,
  handleNo,
}: {
  stars: Star[];
  questions: string[];
  answeredQuestions: boolean[];
  handleYes: (index: number) => void;
  handleNo: () => void;
}) {
  return (
    <div className="relative w-full min-h-screen bg-linear-to-b from-[#0a0e27] via-[#1a1132] to-[#2d1b3d] overflow-hidden">
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart className="w-16 h-16 text-pink-400 fill-pink-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-serif text-pink-100 mb-2">
            Before We Begin...
          </h1>
          <p className="text-sm text-pink-300/70">
            Answer these questions from your heart
          </p>
        </motion.div>

        {/* Questions */}
        <div className="w-full max-w-md space-y-4">
          {questions.map((question, index) => {
            // Show question if it's the first one, or if all previous questions are answered
            const shouldShow = index === 0 || answeredQuestions.slice(0, index).every(a => a);
            
            if (!shouldShow) return null;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`bg-pink-500/10 backdrop-blur-md rounded-2xl p-5 border-2 transition-all duration-500 ${
                  answeredQuestions[index]
                    ? 'border-pink-400/60 bg-pink-500/20'
                    : 'border-pink-300/20'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-pink-400/20 flex items-center justify-center text-pink-200 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-pink-100 text-base leading-relaxed flex-1">
                    {question}
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleYes(index)}
                    disabled={answeredQuestions[index]}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      answeredQuestions[index]
                        ? 'bg-pink-500/50 text-white cursor-default'
                        : 'bg-pink-500/30 text-pink-100 hover:bg-pink-500/40 active:scale-95'
                    }`}
                    whileHover={!answeredQuestions[index] ? { scale: 1.05 } : {}}
                    whileTap={!answeredQuestions[index] ? { scale: 0.95 } : {}}
                  >
                    {answeredQuestions[index] ? '✓ Yes' : 'Yes'}
                  </motion.button>

                  <motion.button
                    onClick={handleNo}
                    disabled={answeredQuestions[index]}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      answeredQuestions[index]
                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-500/30 text-pink-200 hover:bg-red-500/30 active:scale-95'
                    }`}
                    whileHover={!answeredQuestions[index] ? { scale: 1.05 } : {}}
                    whileTap={!answeredQuestions[index] ? { scale: 0.95 } : {}}
                  >
                    No
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {answeredQuestions.map((answered, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  answered ? 'bg-pink-400' : 'bg-pink-300/30'
                }`}
                animate={answered ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <p className="text-xs text-pink-300/60">
            {answeredQuestions.filter(a => a).length} of {questions.length} answered
          </p>
        </motion.div>

        {/* Hint */}
        {!answeredQuestions.every(a => a) && (
          <motion.p
            className="mt-6 text-xs text-pink-300/40 text-center italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            Hint: Only &quot;Yes&quot; will unlock the magic ✨
          </motion.p>
        )}

        {/* All answered celebration */}
        {answeredQuestions.every(a => a) && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-pink-200 text-lg font-light">
              Perfect! Get ready for something magical... 💕
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#2d1b3d] to-transparent pointer-events-none" />
    </div>
  );
}

function FirstSlide({ 
  stars, 
  floatingHearts, 
  handleTap,
  tapCount 
}: { 
  stars: Star[]; 
  floatingHearts: Array<{ id: number; x: number }>;
  handleTap: (e: React.TouchEvent | React.MouseEvent) => void;
  tapCount: number;
}) {
  return (
    <div 
      className="relative w-full min-h-screen bg-linear-to-b from-[#0a0e27] via-[#1a1132] to-[#2d1b3d] overflow-hidden"
      onTouchStart={handleTap}
      onClick={handleTap}
    >
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Glowing Moon */}
      <motion.div
        className="absolute top-20 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <motion.div
          className="relative w-32 h-32"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Moon glow */}
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-yellow-100 to-orange-200 blur-2xl opacity-50" />
          
          {/* Moon body */}
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-yellow-50 via-yellow-100 to-orange-100 shadow-2xl">
            {/* Craters */}
            <div className="absolute top-6 left-8 w-6 h-6 rounded-full bg-yellow-200/30" />
            <div className="absolute top-14 right-10 w-4 h-4 rounded-full bg-yellow-200/20" />
            <div className="absolute bottom-8 left-12 w-5 h-5 rounded-full bg-yellow-200/25" />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating hearts from taps */}
      {floatingHearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute bottom-0 text-pink-400"
          style={{ left: `${heart.x}%` }}
          initial={{ y: 0, opacity: 1, scale: 0 }}
          animate={{ 
            y: -400, 
            opacity: 0,
            scale: [0, 1, 0.8],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          <motion.h1 
            className="text-5xl mb-4 font-serif text-pink-100 leading-tight"
            animate={{
              textShadow: [
                "0 0 20px rgba(255, 182, 193, 0.5)",
                "0 0 30px rgba(255, 182, 193, 0.8)",
                "0 0 20px rgba(255, 182, 193, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Happy
            <br />
            Valentine&apos;s Day
          </motion.h1>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 0.3,
            }}
          >
            <Heart className="w-10 h-10 text-rose-300 fill-rose-300" />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 0.6,
            }}
          >
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
          </motion.div>
        </motion.div>

        <motion.p
          className="text-xl text-pink-200/90 max-w-xs leading-relaxed font-light italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
        >
          Under the stars and moonlight,
          <br />
          love shines brightest tonight
        </motion.p>

        <motion.div
          className="mt-12 text-sm text-pink-300/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1.5 }}
        >
          Tap anywhere to spread the love ✨
        </motion.div>

        {/* Progress indicator */}
        {tapCount > 0 && tapCount < 25 && (
          <motion.div
            className="mt-6 text-xs text-pink-300/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Keep tapping... something magical awaits! 💫
          </motion.div>
        )}

        {/* Decorative shooting star */}
        <motion.div
          className="absolute top-40 right-10 w-1 h-1 bg-white rounded-full"
          animate={{
            x: [-100, 200],
            y: [0, 150],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeOut",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent blur-sm h-px w-12 -rotate-45" />
        </motion.div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#2d1b3d] to-transparent pointer-events-none" />
    </div>
  );
}

const CASCADING_HEARTS_COUNT = 20;
const FLOATING_SPARKLES_COUNT = 8;
function getFloatingSparklesConfig() {
  return Array.from({ length: FLOATING_SPARKLES_COUNT }, () => ({
    left: 20 + Math.random() * 60,
    top: 20 + Math.random() * 60,
  }));
}
const FLOATING_SPARKLES_CONFIG = getFloatingSparklesConfig();

function getCascadingHeartsConfig() {
  return Array.from({ length: CASCADING_HEARTS_COUNT }, () => ({
    left: Math.random() * 100,
    duration: Math.random() * 3 + 4,
    repeatDelay: Math.random() * 2,
  }));
}

function SecondSlide({ 
  stars, 
  flippedPhotos, 
  setFlippedPhotos 
}: { 
  stars: Star[];
  flippedPhotos: boolean[];
  setFlippedPhotos: React.Dispatch<React.SetStateAction<boolean[]>>;
}) {
  const cascadingHeartsConfig = useMemo(() => getCascadingHeartsConfig(), []);
  const handleFlipPhoto = (index: number) => {
    const newFlipped = [...flippedPhotos];
    newFlipped[index] = !newFlipped[index];
    setFlippedPhotos(newFlipped);
  };
  return (
    <div className="relative w-full min-h-screen bg-linear-to-b from-[#2d1b3d] via-[#4a1942] to-[#1a0a2e] overflow-hidden">
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Cascading hearts animation */}
      <div className="absolute inset-0 overflow-hidden">
        {cascadingHeartsConfig.map((heart, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400"
            style={{
              left: `${heart.left}%`,
              top: -20,
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: window.innerHeight + 50,
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: heart.duration,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: heart.repeatDelay,
            }}
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            className="mb-8"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart className="w-24 h-24 text-rose-400 fill-rose-400 mx-auto" />
          </motion.div>

          <motion.h1 
            className="text-4xl mb-6 font-serif text-pink-100 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            You Did It!
          </motion.h1>

          <motion.p
            className="text-2xl text-pink-200/90 max-w-sm leading-relaxed font-light mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            Your love has unlocked
            <br />
            this secret message
          </motion.p>

          <motion.div
            className="bg-pink-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-pink-300/20 max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <p className="text-lg text-pink-100/80 italic leading-relaxed">
              &quot;In every tap, a heartbeat.
              <br />
              In every moment, magic.
              <br />
              In every love, forever.&quot;
            </p>
          </motion.div>

          <motion.div
            className="mt-10 text-sm text-pink-300/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1.5 }}
          >
            💝 Happy Valentine&apos;s Day 💝
          </motion.div>
        </motion.div>

        {/* Love Memories Vertical Section */}
        <div className="relative z-10 w-full px-6 py-20 space-y-16">
          {[
            {
              src: "/images/andra.png",
              caption: "The first time we laughed together 🌙"
            },
            {
              src: "https://via.placeholder.com/400x600/2d1b3d/ffffff?text=Memory+2",
              caption: "The night we talked until morning ✨"
            },
            {
              src: "https://via.placeholder.com/400x600/4a1942/ffffff?text=Memory+3",
              caption: "Every moment with you feels magical 💫"
            }
          ].map((photo, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ImageWithFallback
                  src={photo.src}
                  alt="Love memory"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
              
              <p className="mt-4 text-pink-200/80 text-sm italic max-w-xs leading-relaxed">
                {photo.caption}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Floating sparkles */}
        {FLOATING_SPARKLES_CONFIG.map((sparkle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-200 rounded-full"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              repeatDelay: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}