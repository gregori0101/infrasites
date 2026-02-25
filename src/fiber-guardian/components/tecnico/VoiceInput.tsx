import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps { onTranscript: (text: string) => void; className?: string; }

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleListening = useCallback(() => {
    if (!isSupported) { toast.error('Reconhecimento de voz não suportado neste navegador'); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR'; recognition.continuous = true; recognition.interimResults = false;
    recognition.onresult = (event: any) => { const last = event.results[event.results.length - 1]; if (last.isFinal) onTranscript(last[0].transcript); };
    recognition.onerror = (event: any) => { console.error('Speech recognition error:', event.error); if (event.error !== 'aborted') toast.error('Erro no reconhecimento de voz'); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition; recognition.start(); setListening(true); toast.info('Ouvindo... Fale agora');
  }, [listening, isSupported, onTranscript]);

  if (!isSupported) return null;

  return (
    <Button type="button" variant={listening ? 'destructive' : 'outline'} size="icon"
      onClick={toggleListening} className={`shrink-0 ${listening ? 'animate-pulse' : ''} ${className || ''}`}
      title={listening ? 'Parar gravação' : 'Ditar por voz'}>
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  );
}
