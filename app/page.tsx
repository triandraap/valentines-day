"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

const TAPS_REQUIRED = 25;

const QUESTIONS = [
  "Even it’s hard, do you still want to go through this with me?",
  "If we could start over, would you still choose me?",
  "With everything we’re going through, do you still believe in this relationship?",
  "Are you happy going through this with me?",
  "On the tough days, would you still choose me?"
];

const LOVE_NOTES = [
  {
    title: "First Lean",
    caption: "Foto pertama kita, kamu bahkan ga sadar lagi difoto, dan aku diem-diem nyender di bahu kamu terus aku foto, like it’s the safest place ever. No pose, no setting, just a random moment. Dari situ aku mulai ngerasa, maybe this is not just a moment… mungkin ini awal dari sesuatu yang nggak pernah aku cari, tapi selalu aku butuhkan.",
    image:
      "/images/1.jpeg",
  },
  {
    title: "The Smile",
    caption: "Pertama kali kamu kirim selfie ke aku, dan rasanya beda aja. Bukan soal fotonya, tapi karena kamu mau share versi kamu yang sesimple itu ke aku. Senyumnya natural, tapi cukup buat bikin hari aku langsung bagus. Mungkin buat kamu ini cuma foto biasa, tapi buat aku… ini moment kecil yang berarti banget.",
    image:
      "/images/2.jpeg",
  },
  {
    title: "Simple Things",
    caption: "Waktu itu kita lagi capek banget habis kerja, muka juga udah kelihatan capek. Kamu mau beli Recheese buat papahmu, dan aku cuma nganterin kamu ke tempat yang kamu mau. Ga ada yang spesial sebenarnya, cuma momen kecil di hari yang panjang. Tapi justru dari hal sesederhana itu aku ngerasa senang banget bisa ada di situ, nemenin kamu.",
    image:
      "/images/3.jpg",
  },
  {
    title: "Goofy, Always",
    caption: "Kadang kamu suka ngelakuin hal-hal konyol yang ga kamu sadari lucunya. Waktu itu kamu pakai sweater gombrongku karena kedinginan, lengannya kepanjangan, gayanya juga ga jelas, tapi kamu pede aja berdiri disitu. Aku sengaja videoin dan foto karena kamu gemas banget.",
    image:
      "/images/4.jpg",
  },
  {
    title: "First Bite, First Us",
    caption: "Pertama kali kita makan berdua, karena kamu lagi pengen banget makan pancong. Sesederhana itu alasannya, tapi buat aku rasanya beda. Kita bikin video timelapse, ngobrol ga jelas, ketawa-ketawa kecil, dan cuma duduk lama tanpa buru-buru. Malam itu ga mewah, tapi justru karena itu aku senang banget.",
    image:
      "/images/5.jpg",
  },
  {
    title: "On My Lap",
    caption: "Kalau kita lagi shift bareng dan kamu mulai ngantuk, biasanya kamu bakal tidur di pahaku. Aku yang jagain kamu sambil sesekali fotoin, karena muka kamu kalau lagi tidur selalu kelihatan tenang dan gemes banget.",
    image:
      "/images/6.jpg",
  },
];

const starPositions = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index * 13) % 100}%`,
  top: `${(index * 23) % 100}%`,
  size: 2 + (index % 3),
  delay: index * 0.4,
}));

// Tambahan: tipe untuk ripple
type Ripple = {
  id: number;
  x: number;
  y: number;
};

// URL musik latar & sfx tap (bebas kamu ganti)
const BG_MUSIC_URL =
  "/sound/backsound-sky.mp3";
const TAP_SFX_URL =
  "/sound/mouse-click.mp3";

type ShootingStar = {
  id: number;
  x: number;
  y: number;
  duration: number;
};

export default function Home() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const [tapCount, setTapCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0); // // 0: moon tap, 1: notes, 2: letter, 3: quiet sky

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ripple state
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  // Shooting star state
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const shootingStarId = useRef(0);

  // Audio refs
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const tapAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [bgMuted, setBgMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);

  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);

  const showQuestions = questionIndex < QUESTIONS.length;

  useEffect(() => {
    if (currentSlide !== 3) {
      // kalau bukan di slide 3, kosongkan bintang jatuh
      setShootingStars([]);
      return;
    }

    let cancelled = false;

    const spawnStar = () => {
      if (cancelled) return;

      // posisi awal random di bagian atas layar
      const startX = Math.random() * window.innerWidth * 0.8;
      const startY = Math.random() * window.innerHeight * 0.4;

      const duration = 1500 + Math.random() * 2500; // 1.5 - 4 detik
      const id = shootingStarId.current++;

      setShootingStars((prev) => [
        ...prev,
        { id, x: startX, y: startY, duration },
      ]);

      // hapus star setelah animasi selesai
      window.setTimeout(() => {
        setShootingStars((prev) => prev.filter((s) => s.id !== id));
      }, duration);

      // jadwal star berikutnya
      const nextDelay = 2000 + Math.random() * 3000; // 2 - 5 detik
      window.setTimeout(spawnStar, nextDelay);
    };

    spawnStar();

    return () => {
      cancelled = true;
      setShootingStars([]);
    };
  }, [currentSlide]);

  const handleYes = () => {
    setNotification(null);
    setQuestionIndex((prev) => prev + 1);
  };

  const handleNo = () => {
    setNotification("Kok no sih, kamu ga sayang ya :(");
    // Hilangkan notif setelah 1.5 detik
    setTimeout(() => {
      setNotification(null);
    }, 1500);
  };

  const ensureBackgroundMusic = () => {
    const el = bgAudioRef.current;
    if (!el) return;

    // tandai sudah pernah start
    if (!audioStarted) {
      setAudioStarted(true);
    }

    // kalau tidak di-mute, pastikan play
    if (!bgMuted) {
      el.play().catch(() => undefined);
    }
  };

  const playTapSfx = () => {
    if (sfxMuted) return; // kalau SFX mute, jangan bunyi

    const el = tapAudioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => undefined);
  };

  const handleToggleBgMute = () => {
    setBgMuted((prev) => {
      const next = !prev;
      const el = bgAudioRef.current;
      if (el) {
        el.muted = next;
        // kalau di-unmute dan sudah pernah start, pastikan lagu jalan lagi
        if (!next && audioStarted) {
          el.play().catch(() => undefined);
        }
      }
      return next;
    });
  };

  const handleToggleSfxMute = () => {
    setSfxMuted((prev) => !prev);
  };

  const handleTap = (event: React.MouseEvent<HTMLDivElement>) => {
    // debug kalau mau: console.log("TAP", event.clientX, event.clientY);
    console.log("TAP", event.clientX, event.clientY);
    // Efek lucu + sound selalu jalan tiap tap
    ensureBackgroundMusic();
    playTapSfx();

    // Hitung posisi ripple relatif ke container luar
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const id = rippleId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    // Game tap cuma aktif di slide bulan
    if (showQuestions || currentSlide !== 0) return;

    setTapCount((prev) => {
      const next = prev + 1;

      if (next >= TAPS_REQUIRED && !isTransitioning) {
        // Mulai animasi transisi
        setIsTransitioning(true);
      
        // Setelah animasi selesai (durasi 700ms), pindah slide
        window.setTimeout(() => {
          setCurrentSlide(1);
          setIsTransitioning(false);
        }, 700); // harus sama dengan durasi animasi CSS
      }
    
      return next;
      
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0D17] text-white" onClick={handleTap}>
      {/* Latar belakang bintang */}
      <div className="starfield" />

      {starPositions.map((star, index) => (
        <span
          key={`star-${index}`}
          className="absolute rounded-full bg-[#FFD88A] opacity-80"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: `starTwinkle 6s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Bintang jatuh */}
      <div className="pointer-events-none absolute inset-0 z-[15]">
        {shootingStars.map((star) => (
          <span
            key={star.id}
            className="shooting-star"
            style={{
              left: star.x,
              top: star.y,
              animationDuration: `${star.duration}ms`,
            }}
          />
        ))}
      </div>

      {/* Lapisan untuk ripple tap */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="tap-ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        ))}
      </div>

      {/* Overlay warp luar angkasa saat transisi */}
      {isTransitioning && <div className="space-warp-overlay" />}

      {/* Audio tersembunyi */}
      <audio
        ref={bgAudioRef}
        src={BG_MUSIC_URL}
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={tapAudioRef}
        src={TAP_SFX_URL}
        preload="auto"
        style={{ display: "none" }}
      />

      {/* Tombol mute/unmute di pojok kanan atas */}
      <div className="fixed top-3 right-3 z-30 flex flex-col gap-2 text-[10px] sm:text-xs">
        <button
          type="button"
          onClick={handleToggleBgMute}
          className="rounded-full border border-white/40 bg-black/40 px-3 py-1 text-white/70 shadow-sm backdrop-blur-sm transition hover:border-[#FFD88A] hover:text-[#FFD88A]"
        >
          BGM: {bgMuted ? "Off" : "On"}
        </button>
        <button
          type="button"
          onClick={handleToggleSfxMute}
          className="rounded-full border border-white/40 bg-black/40 px-3 py-1 text-white/70 shadow-sm backdrop-blur-sm transition hover:border-[#FFD88A] hover:text-[#FFD88A]"
        >
          SFX: {sfxMuted ? "Off" : "On"}
        </button>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* MODAL LOVE NOTE */}
        {selectedNoteIndex !== null && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#0B0D17]/90 p-4 text-left shadow-[0_30px_60px_rgba(0,0,0,0.7)] backdrop-blur">
              <button
                type="button"
                onClick={() => setSelectedNoteIndex(null)}
                className="absolute right-3 top-3 rounded-full border border-white/30 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70 transition hover:border-[#FFD88A]/70 hover:text-[#FFD88A]"
              >
                Close
              </button>
        
              <h2 className="heading-font mb-3 text-xl font-semibold text-white">
                {LOVE_NOTES[selectedNoteIndex].title}
              </h2>
        
              <div className="mb-3 w-full overflow-hidden rounded-xl">
                <img
                  src={LOVE_NOTES[selectedNoteIndex].image}
                  alt={LOVE_NOTES[selectedNoteIndex].title}
                  className="h-auto w-full max-h-[60vh] object-contain"
                />
              </div>
        
              <p className="text-sm leading-relaxed text-white/75">
                {LOVE_NOTES[selectedNoteIndex].caption}
              </p>
            </div>
          </div>
        )}

        {showQuestions ? (
          // ======== BAGIAN PERTANYAAN ========
          <section className="flex flex-col items-center gap-6 max-w-xl animate-[fadeInUp_0.4s_ease-out]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#FFD88A]">
              Hi DARA!
            </p>

            <h1 className="heading-font text-xl font-semibold leading-snug text-white sm:text-3xl">
              Hopefully there is no pressure to answer this.
            </h1>

            <p className="text-white/70 text-xs mb-5">
              Only one answer is allowed — the universe insists it's “yes.”
            </p>

            <div className="question-card w-full rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
              <p className="mb-4 text-xs font-medium text-white/50 uppercase tracking-[0.25em]">
                {questionIndex + 1} / {QUESTIONS.length}
              </p>

              <p className="text-base font-medium text-white/90 mb-6 sm:text-3xl">
                {QUESTIONS[questionIndex]}
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={handleYes}
                  className="rounded-full bg-[#FFD88A] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0B0D17] shadow-[0_10px_20px_rgba(255,216,138,0.4)] transition hover:scale-[1.03]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleNo}
                  className="rounded-full border border-white/40 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-[#FFD88A]/70 hover:text-[#FFD88A]"
                >
                  No
                </button>
              </div>

              {notification && (
                <p className="mt-4 text-[8px] sm:text-[11px] uppercase tracking-[0.25em] text-[#FFD88A]">
                  {notification}
                </p>
              )}
            </div>
          </section>
        ) : currentSlide === 0 ? (

          <section className={`soft-fade-in flex flex-col items-center gap-6 ${
            isTransitioning ? "slide-out-right" : "soft-fade-in"
            }`}>
            <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#FFD88A]">
              HI DARA!
            </p>

            <h1 className="heading-font text-2xl font-semibold leading-tight text-white sm:text-3xl">
              My Favorite Person in the Universe
            </h1>

            <p className="max-w-2xl text-sm text-white/70 sm:text-base mb-4">
              For the one who lights up my every orbit.
            </p>

            <div className="moon-drop relative flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
              {/* Orbit luar */}
              <div className="absolute inset-0 animate-[orbitSpin_30s_linear_infinite] rounded-full border border-white/10" />
              {/* Orbit dalam */}
              <div className="absolute inset-4 animate-[orbitSpin_18s_linear_infinite] rounded-full border border-white/5" />
              {/* Bulan */}
              <div className="moon-surface relative h-36 w-36 rounded-full sm:h-44 sm:w-44">
                <div className="absolute left-6 top-8 h-6 w-6 rounded-full bg-[#d19a6a]/60" />
                <div className="absolute right-8 top-12 h-4 w-4 rounded-full bg-[#c58a5f]/60" />
                <div className="absolute bottom-8 left-12 h-5 w-5 rounded-full bg-[#c58a5f]/60" />
              </div>
            </div>

              {/* Counter tap */}
            <div className="mt-2 flex flex-col items-center gap-2 text-xs text-white/65 sm:text-sm">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 mb-5">
                <span className="h-2 w-2 rounded-full bg-[#FFD88A]" />
                <span>
                  {tapCount}/{TAPS_REQUIRED}
                </span>
              </div>
              <p className="text-[11px] text-white/40">
                Tap bintangnya!
              </p>
            </div>
          </section>
        ) : currentSlide === 1 ? (
          // ======== SLIDE 2: SETELAH 25 TAP ========
          <section className="flex w-full max-w-5xl flex-col items-center gap-6 animate-[fadeInUp_0.7s_ease-out_forwards]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#FFD88A]">
              About You & Us
            </p>

            <h1 className="heading-font text-3xl font-semibold leading-snug text-white sm:text-4xl">
              Little Moments ✨
            </h1>

            <p className="max-w-2xl text-sm text-white/65 sm:text-base">
              Setiap kotak menyimpan pesan kecil tentang bagaimana kamu membuat semestaku terasa lebih indah.
            </p>

            <div className="mt-4 grid w-full items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LOVE_NOTES.map((note, index) => (
                <div
                  key={note.title}
                  className="h-full animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedNoteIndex(index)}
                    className="love-note group relative flex h-52 w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 text-left shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm transition hover:border-[#FFD88A]/70 hover:bg-white/10"
                  >
                    <div className="relative mb-6 h-32 w-full overflow-hidden rounded-xl">
                      <img
                        src={note.image}
                        alt={note.title}
                        className="h-full w-full object-cover filter grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                    <span className="block mt-0 text-sm font-semibold text-white">
                      {note.title}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* TOMBOL KE SLIDE 3 */}
            <button
              type="button"
              onClick={() => setCurrentSlide(2)}
              className="mt-6 rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-[#FFD88A]/70 hover:text-[#FFD88A]"
            >
              I Love U
            </button>
          </section>
        ) : currentSlide === 2 ? (
          // ======== SLIDE 3: SURAT BERTEMA SPACE ========
          <section className="flex w-full max-w-3xl flex-col items-center gap-6 animate-[fadeInUp_0.7s_ease-out_forwards]">
            <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#FFD88A]">
              A Little Letter
            </p>

            <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 text-left shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-md">
              {/* dekorasi kecil biar berasa space */}
              <div className="pointer-events-none absolute -left-10 top-6 h-20 w-20 rounded-full bg-gradient-to-br from-[#FFD88A]/40 via-transparent to-[#F4B4C4]/40 blur-2xl" />
              <div className="pointer-events-none absolute -right-8 bottom-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#F4B4C4]/30 via-transparent to-[#CFA9FF]/40 blur-2xl" />

              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Dear Dara,
              </p>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Hubungan kita ga pernah gampang. Banyak hal yang harus kita lewatin, 
                banyak capeknya, banyak pikirannya, bahkan kadang rasanya kayak dunia nggak pernah benar-benar berpihak ke kita. 
                Ada momen kita sama-sama lelah, salah paham, atau cuma diam karena bingung harus mulai dari mana. 
                Tapi anehnya, di tengah semua berat itu, aku ga pernah benar-benar pengen pergi”.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Aku tahu ini ga ringan, dan mungkin ga selalu indah. 
                Tapi setiap kali aku lihat kamu, aku selalu ngerasa kalau semua usaha itu masih layak diperjuangkan. 
                Kita mungkin ga sempurna, jalannya juga ga mulus, tapi selama kita masih mau bertahan dan belajar satu sama lain, 
                aku percaya hubungan ini bukan cuma tentang bertahan… tapi tentang tumbuh bareng, pelan-pelan.
              </p>

              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#FFD88A]">
                With a sky full of tiny wishes,
              </p>
              <p className="mt-1 text-sm font-semibold text-white/90">Someone who&apos;s very fond of you</p>
            </div>

            {/* TOMBOL KE SLIDE 4 (LANGIT HENING + BINTANG JATUH) */}
            <button
              type="button"
              onClick={() => setCurrentSlide(3)}
              className="mt-4 rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60 opacity-40 transition hover:border-[#FFD88A]/70 hover:text-[#FFD88A] hover:opacity-90"
            >
              Continue to the quiet sky
            </button>
          </section>
        ) : (
          // ======== SLIDE 3: HENING, BULAN + BINTANG JATUH ========
          <section className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
              <div className="absolute inset-0 animate-[orbitSpin_30s_linear_infinite] rounded-full border border-white/10" />
              <div className="absolute inset-4 animate-[orbitSpin_18s_linear_infinite] rounded-full border border-white/5" />
              <div className="moon-surface relative h-36 w-36 rounded-full sm:h-44 sm:w-44">
                <div className="absolute left-6 top-8 h-6 w-6 rounded-full bg-[#d19a6a]/60" />
                <div className="absolute right-8 top-12 h-4 w-4 rounded-full bg-[#c58a5f]/60" />
                <div className="absolute bottom-8 left-12 h-5 w-5 rounded-full bg-[#c58a5f]/60" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentSlide(1)}
              className="mt-4 rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40 opacity-20 transition hover:border-[#FFD88A]/60 hover:bg-black/40 hover:text-[#FFD88A] hover:opacity-80"
            >
            Back
            </button>
            {/* Kalau mau benar-benar hening, tidak usah pakai teks */}
            {/* <p className="mt-4 text-xs text-white/40 sm:text-sm">
              Just us, under a quiet sky.
            </p> */}
          </section>
          )}
        </main>
    </div>
  );
}