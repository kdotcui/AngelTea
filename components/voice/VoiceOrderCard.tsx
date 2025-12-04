'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, StopCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type VoiceOrderCardProps = {
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  featureLabels: string[];
  copy: {
    statusIdle: string;
    statusRecording: string;
    statusProcessing: string;
    permissionDenied: string;
    errorGeneric: string;
    textPlaceholder: string;
    sendText: string;
    assistantLabel: string;
    youLabel: string;
    stopLabel: string;
    unavailable: string;
  };
};

export default function VoiceOrderCard({
  badge,
  title,
  description,
  ctaLabel,
  featureLabels,
  copy,
}: VoiceOrderCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState(copy.statusIdle);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isUnavailable, setIsUnavailable] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const resetAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
  };

  const handleStartRecording = async () => {
    if (isUnavailable) {
      setError(copy.unavailable);
      return;
    }
    setError('');
    resetAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        sendAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus(copy.statusRecording);
    } catch (err) {
      setError(copy.permissionDenied);
      setStatus(copy.statusIdle);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setStatus(copy.statusProcessing);
  };

  const sendAudio = async (blob: Blob) => {
    setIsSending(true);
    setError('');
    setStatus(copy.statusProcessing);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');
      const res = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503 || (data?.error || '').includes('Voice agent disabled')) {
          setIsUnavailable(true);
          throw new Error(copy.unavailable);
        }
        throw new Error(data?.error || copy.errorGeneric);
      }
      setTranscript(data.transcription || '');
      setAssistantReply(data.text || '');
      setAudioUrl(typeof data.audio === 'string' ? data.audio : null);
      setStatus(copy.statusIdle);
    } catch (err: any) {
      setError(err?.message || copy.errorGeneric);
      setStatus(copy.statusIdle);
    } finally {
      setIsSending(false);
    }
  };

  const sendText = async () => {
    const text = inputText.trim();
    if (!text) return;
    setIsSending(true);
    setError('');
    setStatus(copy.statusProcessing);
    resetAudio();
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503 || (data?.error || '').includes('Voice agent disabled')) {
          setIsUnavailable(true);
          throw new Error(copy.unavailable);
        }
        throw new Error(data?.error || copy.errorGeneric);
      }
      setTranscript(data.transcription || text);
      setAssistantReply(data.text || '');
      setAudioUrl(typeof data.audio === 'string' ? data.audio : null);
      setStatus(copy.statusIdle);
      setInputText('');
    } catch (err: any) {
      setError(err?.message || copy.errorGeneric);
      setStatus(copy.statusIdle);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{badge}</Badge>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {status}
          </div>
        </div>
        <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          {description}
        </CardDescription>
        <div className="grid gap-3 sm:grid-cols-3">
          {featureLabels.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-primary/15 bg-white/70 p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mic className="size-4 text-primary" />
                <span>{feature}</span>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isSending || isUnavailable}
          >
            {isRecording ? (
              <>
                <StopCircle className="mr-2 size-4" />
                {copy.stopLabel}
              </>
            ) : (
              <>
                <Mic className="mr-2 size-4" />
                {ctaLabel}
              </>
            )}
          </Button>
          <div className="text-sm text-muted-foreground">
            {isSending ? copy.statusProcessing : status}
          </div>
        </div>

        <div className="rounded-lg border bg-white/70 p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {copy.youLabel}
          </div>
          <textarea
            className="w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            rows={3}
            placeholder={copy.textPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={sendText}
              disabled={isSending || !inputText.trim()}
            >
              <Send className="mr-2 size-4" />
              {copy.sendText}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-white/70 p-4 shadow-sm space-y-2">
          <div className="text-xs font-medium text-muted-foreground">{copy.youLabel}</div>
          <div className="text-sm">{transcript || '—'}</div>
          <Separator className="my-3" />
          <div className="text-xs font-medium text-muted-foreground">{copy.assistantLabel}</div>
          <div className="text-sm">{assistantReply || '—'}</div>
          {audioUrl && (
            <audio controls className="mt-3 w-full" src={audioUrl} />
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
