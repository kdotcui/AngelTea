'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
} from 'lucide-react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type Status = 'idle' | 'recording' | 'processing';

export default function VoiceOrderingSection() {
  const HISTORY_LIMIT = 8;
  const t = useTranslations('voice');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [hasMicSupport, setHasMicSupport] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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
    };
  }, [audioUrl]);

  const statusLabel = useMemo(() => {
    if (!hasMicSupport) return t('status_no_mic');
    if (status === 'recording') return t('status_recording');
    if (status === 'processing') return t('status_processing');
    return t('status_ready');
  }, [status, hasMicSupport, t]);

  const startRecording = async () => {
    if (!hasMicSupport || status !== 'idle') return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
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
        void sendToApi(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('error_generic');
      setError(message || t('error_generic'));
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

      const res = await fetch('/api/voice', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const { transcript: heard, replyText, audio } = data;
      setTranscript(heard || '');
      setReply(replyText || '');
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
          </div>

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
        </CardContent>
      </Card>
    </section>
  );
}
