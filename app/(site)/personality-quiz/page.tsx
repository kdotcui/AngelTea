'use client';
import { useMemo, useState, useEffect } from 'react';
import { QUIZ_STATEMENTS } from '@/lib/quiz/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PersonalityQuizPage() {
  const statements = useMemo(() => QUIZ_STATEMENTS, []);
  const [answers, setAnswers] = useState<number[]>(
    Array.from({ length: statements.length }, () => 50)
  );
  const [dairy, setDairy] = useState<'flex' | 'avoid' | 'ok'>('flex');
  const [caffeine, setCaffeine] = useState<'any' | 'low' | 'avoid'>('any');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when results are shown
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  const handleChange = (idx: number, value: number) => {
    setAnswers((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        answers: statements.map((s, i) => ({
          statement: s,
          score: answers[i],
        })),
        constraints: { dairy, caffeine, allergens },
      };
      const res = await fetch('/api/personality-quiz/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setResult(data);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header - Only show when NOT showing results */}
        {!result && (
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Find Your Perfect Drink
            </h1>
            <p className="text-gray-600">
              Answer these questions to get personalized recommendations
            </p>
          </div>
        )}

        {/* Quiz */}
        {!result && (
          <div className="space-y-8">
            {/* Questions */}
            {statements.map((s, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-primary">
                      Question {i + 1} of {statements.length}
                    </span>
                    <h3 className="text-base font-medium text-gray-900 mt-1.5 leading-relaxed">
                      {s}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { v: 100, label: 'Strongly Agree', emoji: '😊' },
                      { v: 75, label: 'Agree', emoji: '🙂' },
                      { v: 50, label: 'Neutral', emoji: '😐' },
                      { v: 25, label: 'Disagree', emoji: '🙁' },
                      { v: 0, label: 'Strongly Disagree', emoji: '😔' },
                    ].map((opt) => (
                      <label
                        key={opt.v}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all border-2 ${
                          answers[i] === opt.v
                            ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                            : 'bg-white border-gray-100 hover:border-primary/30 text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${i}`}
                          value={opt.v}
                          checked={answers[i] === opt.v}
                          onChange={() => handleChange(i, opt.v)}
                          className="sr-only"
                        />
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="font-medium text-sm flex-1">
                          {opt.label}
                        </span>
                        {answers[i] === opt.v && (
                          <svg
                            className="w-5 h-5"
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
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Preferences */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-5">
                  Dietary Preferences
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      Dairy
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['flex', 'avoid', 'ok'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDairy(opt)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 text-center ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      Caffeine
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['any', 'low', 'avoid'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCaffeine(opt)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 text-center ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      Allergens
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
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 text-center ${
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

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 text-base font-semibold rounded-xl shadow-sm disabled:opacity-90"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Finding Your Perfect Match...
                </span>
              ) : (
                'Get My Recommendations'
              )}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result &&
          Array.isArray(result?.recommendations) &&
          result.recommendations.length > 0 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Perfect Matches
                </h2>
                <p className="text-gray-600">
                  Personalized recommendations based on your answers
                </p>
              </div>

              <div className="space-y-4">
                {result.recommendations.map((r: any, idx: number) => (
                  <Card
                    key={idx}
                    className="border-0 shadow-sm overflow-hidden"
                  >
                    <div className="h-1 bg-gradient-to-r from-primary to-accent" />
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {r.display_name ?? r.id}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {typeof r?.params?.sweetness_pct === 'number' && (
                          <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                            {r.params.sweetness_pct}% Sweet
                          </span>
                        )}
                        {typeof r?.params?.ice_pct === 'number' && (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {r.params.ice_pct}% Ice
                          </span>
                        )}
                        {r?.params?.milk && r.params.milk !== 'none' && (
                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                            {r.params.milk === 'non_dairy'
                              ? 'Non-dairy'
                              : 'Dairy'}
                          </span>
                        )}
                        {r?.params?.caffeine &&
                          r.params.caffeine !== 'none' && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                              {r.params.caffeine === 'standard_tea'
                                ? 'Tea'
                                : r.params.caffeine}
                            </span>
                          )}
                        {Array.isArray(r?.params?.toppings) &&
                          r.params.toppings.length > 0 && (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              + {r.params.toppings.join(', ')}
                            </span>
                          )}
                      </div>

                      {Array.isArray(r?.why) && r.why.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Why this matches you:
                          </p>
                          <ul className="space-y-1.5">
                            {r.why.map((w: string, i2: number) => (
                              <li
                                key={i2}
                                className="flex gap-2 text-sm text-gray-700"
                              >
                                <span className="text-primary mt-0.5">•</span>
                                <span className="leading-relaxed">{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="w-full h-12 border-2"
              >
                Take Quiz Again
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
