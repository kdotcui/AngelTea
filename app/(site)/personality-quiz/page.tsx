'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { QUIZ_QUESTIONS } from '@/lib/quiz/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DrinkPersonality = {
  drinkName: string;
  personalityAnalysis: string;
  drinkMatch: string;
  vibes: string[];
};

type DrinkParams = {
  sweetness_pct?: number;
  ice_pct?: number;
  milk?: string;
  caffeine?: string;
  toppings?: string[];
};

type DrinkRecommendation = {
  id: string;
  display_name: string;
  params: DrinkParams;
  why: string[];
};

type QuizResult = {
  drinkPersonality: DrinkPersonality;
  recommendations: DrinkRecommendation[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export default function PersonalityQuizPage() {
  const questions = useMemo(() => QUIZ_QUESTIONS, []);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    Array.from({ length: questions.length }, () => -1)
  );
  const [dairy, setDairy] = useState<'flex' | 'avoid' | 'ok'>('flex');
  const [caffeine, setCaffeine] = useState<'any' | 'low' | 'avoid'>('any');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [imageLoading, setImageLoading] = useState(false);

  const totalSteps = questions.length + 1; // questions + preferences
  const isPreferencesStep = currentStep === questions.length;
  const canGoNext = isPreferencesStep || answers[currentStep] !== -1;
  const canGoPrev = currentStep > 0 && !loading;

  // Scroll to top when results are shown
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  const handleAnswer = (value: number) => {
    setAnswers((prev) => prev.map((v, i) => (i === currentStep ? value : v)));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        answers: questions.map((q, i) => ({
          situation: q.situation,
          response: q.responses[answers[i]],
          responseIndex: answers[i],
        })),
        constraints: { dairy, caffeine, allergens },
      };
      const res = await fetch('/api/personality-quiz/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: QuizResult = await res.json();
      if (!res.ok)
        throw new Error(
          'error' in data ? String(data.error) : 'Request failed'
        );
      setResult(data);

      // Generate server-side image
      if (data.drinkPersonality) {
        setImageLoading(true);
        try {
          const imageRes = await fetch('/api/personality-quiz/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              drinkName: data.drinkPersonality.drinkName,
              personalityAnalysis: data.drinkPersonality.personalityAnalysis,
              drinkMatch: data.drinkPersonality.drinkMatch,
              vibes: data.drinkPersonality.vibes || [],
            }),
          });

          if (imageRes.ok) {
            const blob = await imageRes.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedImageUrl(url);
          }
        } finally {
          setImageLoading(false);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImageUrl || !result) return;

    try {
      const link = document.createElement('a');
      link.download = `angel-tea-${result.drinkPersonality.drinkName
        .replace(/\s+/g, '-')
        .toLowerCase()}.png`;
      link.href = generatedImageUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert(
        'Sorry, there was an error downloading the image. Please try again!'
      );
    }
  };

  const handleShare = async () => {
    if (!result || !generatedImageUrl) return;

    try {
      // Fetch the blob from the generated image URL
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();

      const file = new File([blob], 'angel-tea-match.png', {
        type: 'image/png',
      });
      const shareText = `I'm a ${result.drinkPersonality.drinkName}! 🧋✨\n\nFind your Angel Tea match: ${window.location.origin}/personality-quiz`;

      // Check if Web Share API supports files
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My Angel Tea Match',
          text: shareText,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback to text-only share
        await navigator.share({
          title: 'My Angel Tea Match',
          text: shareText,
        });
      } else {
        // Desktop fallback - download image
        downloadImage();
      }
    } catch (err) {
      // User cancelled or error - offer download
      if (err instanceof Error && err.name !== 'AbortError') {
        downloadImage();
      }
    }
  };

  // Start Screen
  if (!started && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-0 shadow-xl">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                What&apos;s Your Boba Personality?
              </h1>
              <p className="text-gray-600 text-lg">
                Discover which Angel Tea drink matches your unique vibe
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-sm text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-medium text-gray-900">
                    Personalized Results
                  </div>
                  <div className="text-gray-600">
                    Get a drink that matches your personality
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <div className="font-medium text-gray-900">Quick & Fun</div>
                  <div className="text-gray-600">
                    Just {questions.length} situations, 2 minutes
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-medium text-gray-900">
                    Discover Something New
                  </div>
                  <div className="text-gray-600">
                    Find your perfect boba match
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStarted(true)}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .share-card-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          overflow-x: hidden;
          padding: 0 10px;
        }
        .share-card-container {
          width: 540px;
          height: 960px;
          flex-shrink: 0;
        }
        @media (max-width: 560px) {
          .share-card-wrapper {
            padding: 0;
          }
          .share-card-container {
            transform: scale(calc(100vw / 540));
            transform-origin: top center;
          }
        }
      `}</style>
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Quiz */}
        {!result && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Question {currentStep + 1} of {totalSteps}
                </span>
                <span>
                  {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question or Preferences */}
            {!isPreferencesStep ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {questions[currentStep].situation}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {questions[currentStep].responses.map((response, idx) => (
                      <label
                        key={idx}
                        className={`block px-5 py-4 rounded-xl cursor-pointer transition-all border-2 ${
                          answers[currentStep] === idx
                            ? 'bg-primary border-primary text-primary-foreground shadow-md'
                            : 'bg-white border-gray-200 hover:border-primary/40 hover:shadow-sm text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={idx}
                          checked={answers[currentStep] === idx}
                          onChange={() => handleAnswer(idx)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <span className="font-medium flex-1">{response}</span>
                          {answers[currentStep] === idx && (
                            <svg
                              className="w-6 h-6 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    Last step!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Tell us about your preferences
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Dairy
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['flex', 'avoid', 'ok'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setDairy(opt)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 text-center ${
                              dairy === opt
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {opt === 'flex'
                              ? 'Any'
                              : opt === 'avoid'
                              ? 'Avoid'
                              : 'OK'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Caffeine
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['any', 'low', 'avoid'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setCaffeine(opt)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 text-center ${
                              caffeine === opt
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {opt === 'any'
                              ? 'Any'
                              : opt === 'low'
                              ? 'Low'
                              : 'None'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Allergens (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['coconut', 'milk', 'peanut', 'soy'].map((tag) => {
                          const active = allergens.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() =>
                                setAllergens((prev) =>
                                  active
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag]
                                )
                              }
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 text-center ${
                                active
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrev}
                disabled={!canGoPrev}
                variant="outline"
                className="flex-1 h-12"
              >
                ← Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isPreferencesStep && !canGoNext}
                className="flex-1 h-12"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Matching...
                  </span>
                ) : currentStep === totalSteps - 1 ? (
                  'Get My Results →'
                ) : (
                  'Next →'
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && result.drinkPersonality && (
          <div className="space-y-6">
            {/* Server-Generated Image */}
            {imageLoading ? (
              <div
                className="w-full flex justify-center items-center mb-6"
                style={{ minHeight: '400px' }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 font-medium">
                    Creating your personalized match card...
                  </p>
                </div>
              </div>
            ) : generatedImageUrl ? (
              <div className="w-full flex justify-center mb-6">
                <img
                  src={generatedImageUrl}
                  alt={`You are a ${result.drinkPersonality.drinkName}!`}
                  className="rounded-3xl shadow-2xl max-w-full h-auto"
                  style={{ width: '540px', maxWidth: '100%' }}
                />
              </div>
            ) : null}

            {/* Shareable Card - Container for responsive display - HIDDEN */}
            <div
              className="share-card-wrapper"
              style={{ marginBottom: '24px', display: 'none' }}
            >
              <div
                ref={shareCardRef}
                className="share-card-container relative overflow-hidden rounded-3xl shadow-2xl"
                style={{
                  background:
                    'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 30%, #FFF5E6 70%, #FFE4B5 100%)',
                }}
              >
                {/* Decorative Clouds */}
                <div className="absolute top-8 left-4 w-24 h-12 bg-white/60 rounded-full blur-xl" />
                <div className="absolute top-16 right-8 w-32 h-14 bg-white/50 rounded-full blur-xl" />
                <div className="absolute top-24 left-16 w-20 h-10 bg-white/70 rounded-full blur-lg" />
                <div className="absolute bottom-32 right-4 w-28 h-12 bg-white/40 rounded-full blur-xl" />
                <div className="absolute bottom-40 left-8 w-24 h-10 bg-white/50 rounded-full blur-lg" />

                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '48px',
                    color: '#1f2937',
                    boxSizing: 'border-box',
                    width: '540px',
                  }}
                >
                  {/* Logo & Header */}
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <img
                        src="/angeltealogo.png"
                        alt="Angel Tea"
                        style={{ height: '64px', width: 'auto' }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6a4c9c',
                      }}
                    >
                      2025 Personality Match
                    </div>
                  </div>

                  {/* Main Result */}
                  <div
                    style={{
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      paddingTop: '48px',
                      paddingBottom: '48px',
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h1
                        style={{
                          fontSize: '42px',
                          fontWeight: '700',
                          lineHeight: '1.2',
                          color: '#111827',
                          marginBottom: '24px',
                        }}
                      >
                        You are a
                      </h1>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '16px 32px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <h2
                          style={{
                            fontSize: '36px',
                            fontWeight: '900',
                            color: '#6a4c9c',
                            margin: '0',
                          }}
                        >
                          {result.drinkPersonality.drinkName}
                        </h2>
                      </div>
                    </div>

                    {/* Personality Analysis */}
                    <div
                      style={{
                        padding: '0 32px',
                        marginBottom: '24px',
                        maxWidth: '450px',
                        margin: '0 auto 24px',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          lineHeight: '1.6',
                          color: '#111827',
                          textAlign: 'center',
                          marginBottom: '16px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {result.drinkPersonality.personalityAnalysis}
                      </p>
                      <p
                        style={{
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#374151',
                          textAlign: 'center',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {result.drinkPersonality.drinkMatch}
                      </p>
                    </div>

                    {/* Vibes */}
                    {result.drinkPersonality.vibes &&
                      result.drinkPersonality.vibes.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '12px',
                            paddingTop: '16px',
                          }}
                        >
                          {result.drinkPersonality.vibes.map(
                            (vibe: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  padding: '8px 20px',
                                  backgroundColor: 'rgba(106, 76, 156, 0.2)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: '9999px',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  color: '#6a4c9c',
                                  border: '1px solid rgba(106, 76, 156, 0.3)',
                                }}
                              >
                                {vibe}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: 'center' }}>
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b7280',
                      }}
                    >
                      Find your match at Angel Tea
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotional Text */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Tag us <span className="text-primary font-bold">@AngelTeaOfficial</span> for a special{' '}
                  <span className="text-accent font-bold">10% off</span> your next order! 🎉
                </p>
                <p className="text-sm text-gray-600">
                  Share your personality match on social media and don&apos;t forget to tag us!
                </p>
              </CardContent>
            </Card>

            {/* Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleShare}
                className="h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share Image
              </Button>
              <Button
                onClick={downloadImage}
                variant="outline"
                className="h-14 text-lg font-semibold border-2"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Save Image
              </Button>
            </div>

            <Button
              onClick={() => {
                setResult(null);
                setStarted(false);
                setCurrentStep(0);
                setAnswers(Array.from({ length: questions.length }, () => -1));
              }}
              variant="ghost"
              className="w-full h-12 font-semibold"
            >
              Retake Quiz
            </Button>

            {/* Additional Recommendations - Collapsed section */}
            {result.recommendations && result.recommendations.length > 1 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    More drinks you&apos;ll love ✨
                  </h3>

                  <div className="space-y-4">
                    {result.recommendations.slice(1).map((r, idx) => (
                      <div
                        key={idx}
                        className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {r.display_name ?? r.id}
                        </h4>

                        {Array.isArray(r?.why) && r.why.length > 0 && (
                          <div className="space-y-1">
                            {r.why.map((reason, i) => (
                              <p
                                key={i}
                                className={`text-sm leading-relaxed ${
                                  i === 0
                                    ? 'text-gray-700 font-medium'
                                    : 'text-gray-600'
                                }`}
                              >
                                {reason}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggested Toppings Section */}
            {result.recommendations && result.recommendations.length > 0 && (
              <>
                {(() => {
                  const allToppings: string[] = [];
                  result.recommendations.forEach((rec) => {
                    if (
                      rec.params?.toppings &&
                      Array.isArray(rec.params.toppings)
                    ) {
                      allToppings.push(...rec.params.toppings);
                    }
                  });
                  const uniqueToppings = Array.from(new Set(allToppings));

                  if (uniqueToppings.length === 0) return null;

                  return (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Perfect toppings for you 🧋
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {uniqueToppings.map((topping, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                            >
                              {topping}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
