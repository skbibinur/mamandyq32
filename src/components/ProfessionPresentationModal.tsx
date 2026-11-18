import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Briefcase,
  Captions,
  Check,
  Compass,
  Download,
  Headphones,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import { requestProfessionPresentation } from '../services/aiClient';
import { computeSlideTimeRanges } from '../utils/careerLogic';
import type {
  EducationProgramItem,
  PresentationSlideTheme,
  PresentationVoice,
  ProfessionPresentation,
} from '../types/career';

interface ProfessionPresentationModalProps {
  program: EducationProgramItem | null;
  isInCompare: boolean;
  onToggleCompare: (code: string) => void;
  onAskCounselor?: (program: EducationProgramItem) => void;
  onClose: () => void;
}

const VOICE_OPTIONS: Array<{ id: PresentationVoice; label: string }> = [
  { id: 'Kore', label: 'Kore · Айқын' },
  { id: 'Puck', label: 'Puck · Серпінді' },
  { id: 'Zephyr', label: 'Zephyr · Жұмсақ' },
];

const PLAYBACK_RATES = [0.9, 1.0, 1.15, 1.25];

function getThemeVisuals(theme: PresentationSlideTheme) {
  switch (theme) {
    case 'overview':
      return {
        glow: 'from-[#4F8FEA]/25 via-[#4F8FEA]/10 to-transparent',
        accentText: 'text-[#8EC0FF]',
        accentBorder: 'border-[#4F8FEA]/45',
        accentBg: 'bg-[#4F8FEA]/20',
        barColor: 'bg-[#4F8FEA]',
        Icon: Briefcase,
      };
    case 'subjects':
      return {
        glow: 'from-[#F4B942]/20 via-[#4F8FEA]/10 to-transparent',
        accentText: 'text-[#F4B942]',
        accentBorder: 'border-[#F4B942]/45',
        accentBg: 'bg-[#F4B942]/15',
        barColor: 'bg-[#F4B942]',
        Icon: BookOpen,
      };
    case 'skills':
      return {
        glow: 'from-[#4F8FEA]/25 via-[#355284]/25 to-transparent',
        accentText: 'text-[#A8CDFF]',
        accentBorder: 'border-[#4F8FEA]/45',
        accentBg: 'bg-[#4F8FEA]/20',
        barColor: 'bg-[#4F8FEA]',
        Icon: Wrench,
      };
    case 'future':
    default:
      return {
        glow: 'from-[#F4B942]/25 via-[#F4B942]/10 to-transparent',
        accentText: 'text-[#F4B942]',
        accentBorder: 'border-[#F4B942]/45',
        accentBg: 'bg-[#F4B942]/15',
        barColor: 'bg-[#F4B942]',
        Icon: Compass,
      };
  }
}

function base64ToWavBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ProfessionPresentationModal({
  program,
  isInCompare,
  onToggleCompare,
  onAskCounselor,
  onClose,
}: ProfessionPresentationModalProps) {
  const [voiceName, setVoiceName] = useState<PresentationVoice>('Kore');
  const [presentation, setPresentation] = useState<ProfessionPresentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingVoice, setIsSwitchingVoice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentTimerRef = useRef<number | null>(null);

  // Clean up object URLs on audio change/unmount
  useEffect(() => {
    if (!presentation?.audioBase64) {
      setAudioUrl(null);
      return;
    }
    const url = base64ToWavBlobUrl(
      presentation.audioBase64,
      presentation.audioMimeType || 'audio/wav'
    );
    setAudioUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [presentation?.audioBase64, presentation?.audioMimeType]);

  // Body scroll lock & Escape key handler
  useEffect(() => {
    if (!program) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [program, onClose]);

  // Fetch initial presentation when program opens
  useEffect(() => {
    if (!program) {
      setPresentation(null);
      setError(null);
      setIsPlaying(false);
      setActiveSlideIdx(0);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);
      setActiveSlideIdx(0);
      setCurrentTime(0);
      setDuration(0);

      try {
        const res = await requestProfessionPresentation({
          programCode: program.code,
          voiceName,
        });
        if (!cancelled) {
          setPresentation(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Мамандық презентациясын жасау кезінде қате туындады.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // Intentionally only trigger full load when program code changes; voice changes handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program?.code]);

  // Sync playbackRate & mute to <audio>
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;
    }
  }, [playbackRate, isMuted, audioUrl]);

  const slideTimeRanges = useMemo(
    () => computeSlideTimeRanges(presentation?.slides ?? []),
    [presentation?.slides]
  );

  // Silent fallback auto-advance only when audioBase64 is unavailable
  useEffect(() => {
    if (silentTimerRef.current) {
      window.clearInterval(silentTimerRef.current);
      silentTimerRef.current = null;
    }

    if (!isPlaying || audioUrl || !presentation?.slides.length) {
      return;
    }

    const slideCount = presentation.slides.length;
    silentTimerRef.current = window.setInterval(() => {
      setActiveSlideIdx((prev) => {
        if (prev + 1 >= slideCount) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 6500);

    return () => {
      if (silentTimerRef.current) {
        window.clearInterval(silentTimerRef.current);
      }
    };
  }, [isPlaying, audioUrl, presentation?.slides.length]);

  if (!program) return null;

  const handleRetryFull = async () => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    try {
      const res = await requestProfessionPresentation({
        programCode: program.code,
        voiceName,
        forceRefresh: true,
      });
      setPresentation(res);
      setActiveSlideIdx(0);
      setCurrentTime(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Мамандық презентациясын жасау кезінде қате туындады.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceChange = async (nextVoice: PresentationVoice) => {
    setVoiceName(nextVoice);
    if (!presentation) return;

    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsSwitchingVoice(true);
    try {
      const audioRes = await requestProfessionPresentation({
        programCode: program.code,
        voiceName: nextVoice,
        audioOnly: true,
        scriptOverride: presentation.fullNarrationScript,
      });
      setPresentation((prev) =>
        prev
          ? {
              ...prev,
              voiceName: nextVoice,
              audioBase64: audioRes.audioBase64,
              audioMimeType: audioRes.audioMimeType,
              audioError: audioRes.audioError,
            }
          : prev
      );
      setCurrentTime(0);
      setActiveSlideIdx(0);
    } catch (err) {
      setPresentation((prev) =>
        prev
          ? {
              ...prev,
              audioError:
                err instanceof Error ? err.message : 'Дауысты жаңарту сәтсіз аяқталды.',
            }
          : prev
      );
    } finally {
      setIsSwitchingVoice(false);
    }
  };

  const handleTogglePlay = async () => {
    if (!presentation?.slides.length) return;

    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      }
      return;
    }

    setIsPlaying((prev) => !prev);
  };

  const handleJumpToSlide = (index: number) => {
    if (!presentation?.slides.length) return;
    const clamped = Math.max(0, Math.min(index, presentation.slides.length - 1));
    setActiveSlideIdx(clamped);

    if (audioUrl && audioRef.current && duration > 0 && slideTimeRanges[clamped]) {
      const targetTime = slideTimeRanges[clamped].startRatio * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleReplay = async () => {
    setActiveSlideIdx(0);
    setCurrentTime(0);
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    const t = el.currentTime;
    const d = el.duration;
    setCurrentTime(t);

    if (Number.isFinite(d) && d > 0 && slideTimeRanges.length > 0) {
      const ratio = t / d;
      const idx = slideTimeRanges.findIndex(
        (range) => ratio >= range.startRatio && ratio < range.endRatio
      );
      if (idx !== -1 && idx !== activeSlideIdx) {
        setActiveSlideIdx(idx);
      }
    }
  };

  const handleCyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(nextRate);
  };

  const slides = presentation?.slides ?? [];
  const activeSlide = slides[activeSlideIdx] ?? slides[0];
  const themeStyle = getThemeVisuals(activeSlide?.theme ?? 'overview');
  const SlideIcon = themeStyle.Icon;

  const progressPercentage =
    duration > 0
      ? Math.min(100, Math.round((currentTime / duration) * 100))
      : slides.length > 0
        ? Math.round(((activeSlideIdx + 1) / slides.length) * 100)
        : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2D4E]/80 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white border border-[#DCE4EE] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#DCE4EE] flex items-start justify-between gap-4 bg-[#F5F7FA] shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#4F8FEA]">
              <span>{program.code}</span>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                ·
              </span>
              <span className="font-sans font-semibold text-[#546E7A]">{program.category}</span>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                ·
              </span>
              <span className="font-sans font-semibold text-[#243B64]">
                {program.subject1 === program.subject2
                  ? program.subject1
                  : `${program.subject1} + ${program.subject2}`}
              </span>
            </div>
            <h2
              id="presentation-modal-title"
              className="text-base sm:text-xl font-extrabold text-[#243B64] mt-1 line-clamp-2 sm:truncate"
            >
              {program.title} — AI презентация және аудио-сипаттама
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Терезені жабу"
            className="w-10 h-10 rounded-xl border border-[#DCE4EE] bg-white text-[#546E7A] hover:text-[#243B64] hover:bg-[#EEF4FC] inline-flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {isLoading ? (
            <div className="rounded-2xl bg-[#243B64] text-white p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[320px] space-y-5 border border-[#355284]">
              <div className="w-14 h-14 rounded-2xl bg-[#1B2D4E] border border-[#4F8FEA]/45 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-[#F4B942] animate-spin" aria-hidden="true" />
              </div>
              <div className="space-y-2 max-w-md">
                <p className="text-base sm:text-lg font-bold text-white">
                  AI мамандық презентациясын және қазақша аудио-сипаттаманы дайындауда...
                </p>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  1-кезең: 4 слайдты құрылымды сценарий құрылады. 2-кезең: дауыстық баяндау
                  синтезделеді. Бұл әдетте 5–10 секунд алады.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 text-center space-y-4">
              <p className="text-base font-bold text-rose-950">
                Презентацияны жасау сәтсіз аяқталды
              </p>
              <p className="text-sm text-rose-800 max-w-lg mx-auto">{error}</p>
              <button
                type="button"
                onClick={handleRetryFull}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-rose-700 text-white text-sm font-semibold hover:bg-rose-800 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Қайталап көру</span>
              </button>
            </div>
          ) : presentation && activeSlide ? (
            <>
              {/* Voice & Mode Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-[#546E7A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F4B942] shrink-0" aria-hidden="true" />
                  <span>{presentation.introHook}</span>
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor="tts-voice-select" className="text-xs font-medium text-[#546E7A]">
                    Диктор дауысы:
                  </label>
                  <select
                    id="tts-voice-select"
                    value={voiceName}
                    disabled={isSwitchingVoice}
                    onChange={(e) => handleVoiceChange(e.target.value as PresentationVoice)}
                    className="px-2.5 py-1.5 min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#263238] focus:outline-none focus:border-[#4F8FEA] disabled:opacity-60"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Animated Video-Presentation Viewport */}
              <div className="relative rounded-2xl bg-[#243B64] text-white overflow-hidden border border-[#355284] shadow-lg">
                {/* Ambient Theme Glow + Subtle Grid */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${themeStyle.glow} transition-colors duration-500`}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(79,143,234,0.45) 1px, transparent 0)',
                    backgroundSize: '22px 22px',
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 p-4 sm:p-8 flex flex-col justify-between min-h-[250px] sm:min-h-[340px] gap-4 sm:gap-6">
                  {/* Top Stage Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-lg ${themeStyle.accentBg} border ${themeStyle.accentBorder} inline-flex items-center justify-center`}
                      >
                        <SlideIcon className={`w-4 h-4 ${themeStyle.accentText}`} aria-hidden="true" />
                      </span>
                      <span className={`font-mono text-xs font-bold uppercase tracking-wide ${themeStyle.accentText}`}>
                        {activeSlide.chapterLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isPlaying && (
                        <div
                          className="flex items-end gap-0.5 h-4"
                          aria-label="Аудио ойнатылуда"
                        >
                          <span className="w-1 bg-[#4F8FEA] rounded-full animate-bounce h-3" />
                          <span
                            className="w-1 bg-[#F4B942] rounded-full animate-bounce h-4"
                            style={{ animationDelay: '0.15s' }}
                          />
                          <span
                            className="w-1 bg-white rounded-full animate-bounce h-2.5"
                            style={{ animationDelay: '0.3s' }}
                          />
                        </div>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-[#1B2D4E] border border-[#355284] font-mono text-xs font-semibold text-white tabular-nums">
                        {activeSlideIdx + 1} / {slides.length}
                      </span>
                    </div>
                  </div>

                  {/* Animated Slide Body */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="space-y-4 my-auto"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${themeStyle.accentBg} ${themeStyle.accentBorder} ${themeStyle.accentText}`}
                        >
                          {activeSlide.highlightMetric}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight max-w-2xl">
                        {activeSlide.headline}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {activeSlide.keyPoints.map((point, idx) => (
                          <div
                            key={`${activeSlide.id}-pt-${idx}`}
                            className="rounded-xl bg-[#1B2D4E]/85 border border-[#355284] p-3 text-xs sm:text-sm text-[#F5F7FA] leading-snug flex items-start gap-2"
                          >
                            <span
                              className={`font-mono text-[11px] font-bold mt-0.5 shrink-0 ${themeStyle.accentText}`}
                            >
                              0{idx + 1}
                            </span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Live Synchronized Subtitle Bar */}
                  {showSubtitles && (
                    <div className="rounded-xl bg-[#1B2D4E]/95 border border-[#355284] px-4 py-3 text-xs sm:text-sm text-[#F5F7FA] leading-relaxed">
                      {activeSlide.narration}
                    </div>
                  )}
                </div>

                {/* Hidden HTML5 Audio Element */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const d = e.currentTarget.duration;
                      if (Number.isFinite(d)) {
                        setDuration(d);
                      }
                    }}
                    onTimeUpdate={handleAudioTimeUpdate}
                    onEnded={() => {
                      setIsPlaying(false);
                      setCurrentTime(0);
                      setActiveSlideIdx(0);
                    }}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                )}
              </div>

              {/* Audio Warning Banner if TTS failed while slides succeeded */}
              {presentation.audioError && (
                <div className="p-3.5 rounded-xl bg-[#FFF9EB] border border-[#F4B942]/60 text-xs sm:text-sm text-[#263238] flex flex-wrap items-center justify-between gap-3">
                  <span>{presentation.audioError}</span>
                  <button
                    type="button"
                    disabled={isSwitchingVoice}
                    onClick={() => handleVoiceChange(voiceName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#243B64] text-white text-xs font-semibold hover:bg-[#1C2F51] cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Аудионы қайта жасау</span>
                  </button>
                </div>
              )}

              {/* Interactive Timeline & Player Controls */}
              <div className="rounded-2xl bg-[#F5F7FA] border border-[#DCE4EE] p-4 space-y-3.5">
                {/* Segmented Chapter Progress */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Слайд бөлімдері">
                    {slides.map((s, idx) => {
                      const isCurrent = idx === activeSlideIdx;
                      const isPast = idx < activeSlideIdx;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleJumpToSlide(idx)}
                          aria-current={isCurrent ? 'step' : undefined}
                          className="group text-left cursor-pointer focus:outline-none"
                        >
                          <div className="h-2 rounded-full bg-[#DCE4EE] overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isCurrent
                                  ? 'bg-[#4F8FEA] w-full'
                                  : isPast
                                    ? 'bg-[#243B64] w-full'
                                    : 'bg-transparent w-0'
                              }`}
                            />
                          </div>
                          <p
                            className={`mt-1 text-[11px] font-semibold truncate ${
                              isCurrent
                                ? 'text-[#243B64] font-bold'
                                : 'text-[#546E7A] group-hover:text-[#243B64]'
                            }`}
                          >
                            {idx + 1}. {s.headline}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Control Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleJumpToSlide(activeSlideIdx - 1)}
                      disabled={activeSlideIdx === 0}
                      aria-label="Алдыңғы слайд"
                      className="w-10 h-10 rounded-xl border border-[#CBD5E1] bg-white text-[#243B64] hover:bg-[#EEF4FC] disabled:opacity-40 inline-flex items-center justify-center cursor-pointer"
                    >
                      <SkipBack className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      disabled={isSwitchingVoice}
                      className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#F4B942] text-[#243B64] text-xs sm:text-sm font-bold hover:bg-[#E5A932] disabled:opacity-60 cursor-pointer"
                    >
                      {isSwitchingVoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Play className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>
                        {isSwitchingVoice
                          ? 'Дыбыс жасалуда...'
                          : isPlaying
                            ? 'Кідірту'
                            : audioUrl
                              ? 'Тыңдау және көру'
                              : 'Слайдты ойнату'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleJumpToSlide(activeSlideIdx + 1)}
                      disabled={activeSlideIdx >= slides.length - 1}
                      aria-label="Келесі слайд"
                      className="w-10 h-10 rounded-xl border border-[#CBD5E1] bg-white text-[#243B64] hover:bg-[#EEF4FC] disabled:opacity-40 inline-flex items-center justify-center cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={handleReplay}
                      aria-label="Басынан ойнату"
                      title="Басынан ойнату"
                      className="w-10 h-10 rounded-xl border border-[#CBD5E1] bg-white text-[#243B64] hover:bg-[#EEF4FC] inline-flex items-center justify-center cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[#546E7A] tabular-nums px-2">
                      {audioUrl
                        ? `${formatSeconds(currentTime)} / ${formatSeconds(duration)}`
                        : `${progressPercentage}%`}
                    </span>

                    {audioUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsMuted((m) => !m)}
                          aria-label={isMuted ? 'Дыбысты қосу' : 'Дыбысты өшіру'}
                          className="w-9 h-9 rounded-lg border border-[#CBD5E1] bg-white text-[#243B64] hover:bg-[#EEF4FC] inline-flex items-center justify-center cursor-pointer"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-rose-600" aria-hidden="true" />
                          ) : (
                            <Volume2 className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleCyclePlaybackRate}
                          aria-label="Ойнату жылдамдығы"
                          className="px-2.5 py-1.5 min-h-[36px] rounded-lg border border-[#CBD5E1] bg-white font-mono text-xs font-bold text-[#243B64] hover:bg-[#EEF4FC] cursor-pointer"
                        >
                          {playbackRate}x
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowSubtitles((s) => !s)}
                      aria-pressed={showSubtitles}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold cursor-pointer ${
                        showSubtitles
                          ? 'bg-[#243B64] text-white border-[#243B64]'
                          : 'bg-white text-[#263238] border-[#CBD5E1] hover:bg-[#EEF4FC]'
                      }`}
                    >
                      <Captions className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Субтитр</span>
                    </button>

                    {audioUrl && (
                      <a
                        href={audioUrl}
                        download={`${program.code}-audio-sipattama.wav`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-[#4F8FEA]/40 bg-[#EEF4FC] text-[#243B64] text-xs font-semibold hover:bg-[#4F8FEA] hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>WAV жүктеу</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Full Chapter Transcript */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#243B64] flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#4F8FEA]" aria-hidden="true" />
                    <span>Аудио-сипаттама мәтіні мен бөлімдері</span>
                  </h3>
                  <span className="text-xs text-[#546E7A]">
                    Бөлімді бассаңыз, сәйкес слайд ашылады
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slides.map((slide, idx) => {
                    const isSelected = idx === activeSlideIdx;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => handleJumpToSlide(idx)}
                        className={`text-left rounded-xl p-3.5 border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EEF4FC] border-[#4F8FEA]'
                            : 'bg-white border-[#DCE4EE] hover:border-[#4F8FEA]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#4F8FEA]">
                            {slide.chapterLabel}
                          </span>
                          {isSelected && (
                            <span className="text-[11px] font-bold text-[#243B64] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F4B942]" aria-hidden="true" />
                              Белсенді
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#243B64] mt-1">{slide.headline}</p>
                        <p className="text-xs text-[#546E7A] mt-1 leading-relaxed">
                          {slide.narration}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#DCE4EE] bg-[#F5F7FA] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#546E7A]">
            AI генерациялаған бағдарлаушы сипаттама · Шешімді өзіңіз зерттеп қабылдаңыз
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onToggleCompare(program.code)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isInCompare
                  ? 'bg-[#FFF9EB] text-[#243B64] border border-[#F4B942]'
                  : 'bg-white text-[#263238] border border-[#CBD5E1] hover:bg-[#EEF4FC]'
              }`}
            >
              {isInCompare ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Салыстыруда</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Салыстыруға қосу</span>
                </>
              )}
            </button>

            {onAskCounselor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskCounselor(program);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#243B64] text-white text-xs sm:text-sm font-semibold hover:bg-[#1C2F51] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>AI кеңесшіден сұрау</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
