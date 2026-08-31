// Voice Assistant utility with Speech-to-Text (STT) and Text-to-Speech (TTS)

export interface VoiceCommandMatch {
  action: 'capture' | 'summary' | 'reduce' | 'log' | 'help' | 'general';
  confidence: number;
  transcript: string;
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isVoiceSupported: boolean = false;
  private isRecognitionSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.isVoiceSupported = true;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isRecognitionSupported = Boolean(SpeechRecognition);
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer warm natural English voices (e.g. Google UK/US, Samantha, Daniel, Natural)
    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Zira'))
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    if (naturalVoice) {
      this.selectedVoice = naturalVoice;
    }
  }

  public isSpeechRecognitionAvailable(): boolean {
    return this.isRecognitionSupported;
  }

  public isTTSAvailable(): boolean {
    return this.isVoiceSupported;
  }

  public speak(text: string, onEnd?: () => void, rate = 1.0, pitch = 1.0) {
    if (!this.synth) return;
    this.stopSpeaking();

    // Clean markdown asterisks and code tokens for speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/-\s+/g, ', ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }

  /**
   * Parse user speech for quick hands-free voice commands
   */
  public parseCommand(rawSpeech: string): VoiceCommandMatch {
    const text = rawSpeech.toLowerCase().trim();

    if (
      text.includes('capture') ||
      text.includes('take photo') ||
      text.includes('take a photo') ||
      text.includes('take picture') ||
      text.includes('take a picture') ||
      text.includes('scan food') ||
      text.includes('snap photo') ||
      text.includes('cheese') ||
      text.includes('analyze plate')
    ) {
      return { action: 'capture', confidence: 0.95, transcript: rawSpeech };
    }

    if (
      text.includes('how many calories') ||
      text.includes('nutrition summary') ||
      text.includes('tell me the calories') ||
      text.includes('what is the nutrition') ||
      text.includes('read macros') ||
      text.includes('protein count') ||
      text.includes('calorie breakdown')
    ) {
      return { action: 'summary', confidence: 0.9, transcript: rawSpeech };
    }

    if (
      text.includes('reduce calories') ||
      text.includes('cut calories') ||
      text.includes('how to cut calories') ||
      text.includes('make this healthier') ||
      text.includes('lower calories') ||
      text.includes('reduction suggestions') ||
      text.includes('healthy swaps')
    ) {
      return { action: 'reduce', confidence: 0.9, transcript: rawSpeech };
    }

    if (
      text.includes('log meal') ||
      text.includes('save meal') ||
      text.includes('add to journal') ||
      text.includes('record meal') ||
      text.includes('log to journal')
    ) {
      return { action: 'log', confidence: 0.9, transcript: rawSpeech };
    }

    if (
      text.includes('what can you do') ||
      text.includes('help') ||
      text.includes('voice commands') ||
      text.includes('what commands')
    ) {
      return { action: 'help', confidence: 0.9, transcript: rawSpeech };
    }

    return { action: 'general', confidence: 0.5, transcript: rawSpeech };
  }

  /**
   * Start a single or continuous Speech Recognition listener
   */
  public createRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onEnd?: () => void,
    continuous = false
  ): any {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          onResult(final.trim(), true);
        } else if (interim) {
          onResult(interim.trim(), false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (onError) {
          if (event.error === 'not-allowed') {
            onError('Microphone permission was denied. Please allow microphone access.');
          } else if (event.error === 'no-speech') {
            // benign
          } else {
            onError(`Voice error: ${event.error}`);
          }
        }
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      return recognition;
    } catch (err: any) {
      if (onError) onError(err?.message || 'Failed to initialize speech recognition');
      return null;
    }
  }
}

export const voiceService = new VoiceService();
