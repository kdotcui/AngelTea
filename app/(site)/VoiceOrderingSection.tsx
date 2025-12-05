'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Square,
  Volume2,
  RefreshCw,
} from 'lucide-react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type OrderSummary = {
  items: {
    name: string;
    size: string;
    qty: number;
    sugar: string;
    ice: string;
    toppings: string[];
    unit_price: number;
    line_total: number;
  }[];
  total: number;
};

type Status = 'idle' | 'recording' | 'processing';

export default function VoiceOrderingSection() {
  const HISTORY_LIMIT = 8;
  const DISPLAY_HISTORY = 4;
  const MAX_DURATION_MS = 10000;
  const t = useTranslations('voice');
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [volume, setVolume] = useState(0);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    []
  );
  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      typeof MediaRecorder !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia;
    setHasMicSupport(supported);
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      analyserRef.current?.disconnect();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [audioUrl]);

  const statusLabel = useMemo(() => {
    if (!hasMicSupport) return t('status_no_mic');
    if (status === 'recording') return t('status_recording');
    if (status === 'processing') return t('status_processing');
    return t('status_ready');
  }, [status, hasMicSupport, t]);

  const startMeters = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      // Rough volume approximation
      const norm = dataArray.reduce((sum, v) => sum + Math.abs(v - 128), 0) / dataArray.length;
      setVolume(Math.min(1, norm / 50));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const startRecording = async () => {
    if (!hasMicSupport || status !== 'idle') return;
    setError(null);
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      if (!mimeType) {
        setError(t('error_no_format'));
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      audioCtxRef.current = audioCtx;

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        analyserRef.current?.disconnect();
        audioCtxRef.current?.close().catch(() => {});
        analyserRef.current = null;
        audioCtxRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        lastBlobRef.current = blob;
        setElapsedMs(0);
        setVolume(0);
        void sendToApi(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
      setElapsedMs(0);
      startMeters();
      timerRef.current = setInterval(() => {
        setElapsedMs((ms) => {
          const next = ms + 200;
          if (next >= MAX_DURATION_MS) {
            stopRecording();
          }
          return next;
        });
      }, 200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('error_generic');
      if (message.toLowerCase().includes('denied') || message.toLowerCase().includes('permission')) {
        setError(t('error_permission'));
      } else {
        setError(message || t('error_generic'));
      }
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (status !== 'recording') return;
    mediaRecorderRef.current?.stop();
    setStatus('processing');
  };

  const sendToApi = async (blob: Blob) => {
    setStatus('processing');
    try {
      const form = new FormData();
      const safeHistory = history.slice(-HISTORY_LIMIT);
      form.append('audio', blob, 'voice.webm');
      form.append('history', JSON.stringify(safeHistory));
      form.append('locale', locale);

      const res = await fetch('/api/voice', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 413) {
          throw new Error(t('error_too_large'));
        }
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const { transcript: heard, replyText, audio, order } = data;
      setTranscript(heard || '');
      setReply(replyText || '');
      setOrderSummary(order?.items ? order : null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audio) {
        const url = `data:audio/mpeg;base64,${audio}`;
        setAudioUrl(url);
      } else {
        setAudioUrl(null);
      }
      setHistory((prev) => [
        ...prev.slice(-(HISTORY_LIMIT - 2)),
        { role: 'user', content: heard || '' },
        { role: 'assistant', content: replyText || '' },
      ]);
      setStatus('idle');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('error_generic');
      setError(message || t('error_generic'));
      setStatus('idle');
    }
  };

  const retryLast = () => {
    if (status !== 'idle') return;
    const blob = lastBlobRef.current;
    if (!blob) {
      setError(t('error_no_previous'));
      return;
    }
    sendToApi(blob);
  };

  const playAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
      setError(t('error_audio'));
    });
  };

  const resetSession = () => {
    setHistory([]);
    setTranscript('');
    setReply('');
    setElapsedMs(0);
    setVolume(0);
    setOrderSummary(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setError(null);
    setStatus('idle');
  };

  const voiceFeatures = [
    t('feature_1'),
    t('feature_2'),
    t('feature_3'),
  ];

  return (
    <section id="voice" className="mx-auto max-w-6xl scroll-mt-24">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{t('badge')}</Badge>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {statusLabel}
            </span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t('title')}</h2>
            <p className="text-muted-foreground max-w-3xl">
              {t('description')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {voiceFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-lg border border-primary/15 bg-white/70 p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mic className="size-4 text-primary" />
                  <span>{feature}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={status === 'recording' ? stopRecording : startRecording}
              disabled={!hasMicSupport || status === 'processing'}
            >
              {status === 'recording' ? (
                <>
                  <Square className="mr-2 size-4" />
                  {t('cta_stop')}
                </>
              ) : status === 'processing' ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('status_processing')}
                </>
              ) : (
                <>
                  <Mic className="mr-2 size-4" />
                  {t('cta_primary')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={playAudio}
              disabled={!audioUrl || status === 'recording' || status === 'processing'}
            >
              <Volume2 className="mr-2 size-4" />
              {t('play_audio')}
            </Button>
            <Button
              variant="ghost"
              onClick={resetSession}
              disabled={status !== 'idle'}
            >
              <RotateCcw className="mr-2 size-4" />
              {t('reset')}
            </Button>
            <Button
              variant="ghost"
              onClick={retryLast}
              disabled={status !== 'idle'}
            >
              <RefreshCw className="mr-2 size-4" />
              {t('retry')}
            </Button>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-20 rounded-full bg-muted">
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, Math.max(5, volume * 100))}%` }}
                />
              </div>
              <span>{Math.floor(elapsedMs / 1000)}s</span>
            </div>
            <span className="text-xs">{t('hint_timeout')}</span>
          </div>
          <div className="text-xs text-muted-foreground">{t('privacy_note')}</div>

          {!hasMicSupport && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4" />
              <span>{t('status_no_mic')}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mic className="size-4 text-primary" />
                {t('heard_label')}
              </div>
              <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                {transcript || t('placeholder_transcript')}
              </p>
            </div>

            <div className="rounded-lg border bg-white/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Play className="size-4 text-primary" />
                {t('reply_label')}
              </div>
              <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                {reply || t('placeholder_reply')}
              </p>
              {audioUrl && (
                <audio
                  className="mt-3 w-full"
                  controls
                  src={audioUrl}
                  preload="metadata"
                />
              )}
            </div>
          </div>

          {orderSummary && (
            <div className="rounded-lg border bg-white/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mic className="size-4 text-primary" />
                {t('order_title')}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {orderSummary.items.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="rounded-md bg-muted/40 p-2">
                    <div className="font-semibold text-foreground">
                      {item.qty}× {item.name} ({item.size})
                    </div>
                    <div className="text-xs">
                      {item.sugar} • {item.ice}
                    </div>
                    <div className="text-xs">
                      {t('order_toppings')}:{' '}
                      {item.toppings.length ? item.toppings.join(', ') : t('order_none')}
                    </div>
                    <div className="text-xs">
                      {formatCurrency(item.line_total)} ({formatCurrency(item.unit_price)} ea)
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between text-sm font-semibold text-foreground">
                <span>{t('order_total')}</span>
                <span>{formatCurrency(orderSummary.total)}</span>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mic className="size-4 text-primary" />
              {t('history_label')}
            </div>
            {history.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {history.slice(-DISPLAY_HISTORY).map((msg, idx) => (
                  <li key={`${msg.role}-${idx}`} className="flex gap-2">
                    <span className="font-semibold text-primary">
                      {msg.role === 'user' ? t('history_user') : t('history_agent')}:
                    </span>
                    <span className="line-clamp-2">{msg.content}</span>
                  </li>
                ))}
                {history.length > DISPLAY_HISTORY && (
                  <li className="text-xs text-muted-foreground">
                    {t('history_truncated')}
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('history_empty')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
