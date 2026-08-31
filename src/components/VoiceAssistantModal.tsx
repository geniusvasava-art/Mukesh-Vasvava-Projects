import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle,
  Camera,
  HeartPulse,
  Flame,
  BookmarkPlus,
  Play,
  Square,
  Radio,
} from 'lucide-react';
import { voiceService } from '../services/voiceAssistant';
import { askNutritionist } from '../services/api';
import { MealAnalysisResult } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMeal: MealAnalysisResult | null;
  onTriggerCapture?: () => void;
  onGoToTab?: (tab: 'scanner' | 'analyzer' | 'reduction' | 'journal' | 'guide') => void;
  onLogMeal?: () => void;
  onApplySwaps?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  activeMeal,
  onTriggerCapture,
  onGoToTab,
  onLogMeal,
  onApplySwaps,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Tap the microphone to speak');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; id: string }>
  >([]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, statusText]);

  // Initial welcome greeting when modal opens
  useEffect(() => {
    if (isOpen) {
      if (conversation.length === 0) {
        const welcomeText = activeMeal
          ? `Voice assistant ready! I have analyzed "${activeMeal.mealName}" (${activeMeal.totalMacros.calories} kcal). You can say "Read nutrition summary", "How to cut calories", or ask any question.`
          : `Voice assistant active. You can say "Capture food", "Open nutrition guide", or ask any diet question!`;

        setConversation([
          {
            id: 'welcome',
            sender: 'assistant',
            text: welcomeText,
          },
        ]);

        if (voiceService.isTTSAvailable()) {
          voiceService.speak(welcomeText, () => setIsSpeaking(false));
          setIsSpeaking(true);
        }
      }
    } else {
      stopListening();
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
  }, [isOpen, activeMeal]);

  // Process completed voice input
  const processVoiceInput = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsListening(false);
    setTranscript('');
    setIsProcessing(true);
    setStatusText('Processing your voice request...');

    const userMessage = spokenText.trim();
    setConversation((prev) => [
      ...prev,
      { id: 'user-' + Date.now(), sender: 'user', text: userMessage },
    ]);

    // Check for direct voice commands
    const command = voiceService.parseCommand(userMessage);

    if (command.action === 'capture' && onTriggerCapture) {
      const reply = "Taking photo and analyzing food portion right now!";
      handleAssistantResponse(reply);
      setTimeout(() => {
        onTriggerCapture();
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (command.action === 'summary') {
      if (activeMeal) {
        const reply = `Your ${activeMeal.mealName} contains approximately ${activeMeal.totalMacros.calories} calories, ${activeMeal.totalMacros.proteinGrams} grams of protein, ${activeMeal.totalMacros.carbsGrams} grams of carbohydrates, and ${activeMeal.totalMacros.fatGrams} grams of fat. The overall health grade is ${activeMeal.healthRating.nutriGrade}.`;
        handleAssistantResponse(reply);
        if (onGoToTab) onGoToTab('analyzer');
      } else {
        const reply = "No food has been scanned yet. Say 'Capture photo' to scan a meal or select a sample dish.";
        handleAssistantResponse(reply);
      }
      setIsProcessing(false);
      return;
    }

    if (command.action === 'reduce') {
      if (activeMeal && activeMeal.reductionSuggestions.length > 0) {
        const topSwap = activeMeal.reductionSuggestions[0];
        const reply = `You can save ${activeMeal.reducedPreset.calorieSavingsTotal} total calories! The top recommended swap is "${topSwap.title}", saving ${topSwap.caloriesSaved} calories: ${topSwap.explanation}`;
        handleAssistantResponse(reply);
        if (onGoToTab) onGoToTab('reduction');
      } else if (activeMeal) {
        const reply = "This meal is already very lean and nutrient-dense!";
        handleAssistantResponse(reply);
      } else {
        const reply = "Please scan a food item first, and I will find low-calorie swaps for you.";
        handleAssistantResponse(reply);
      }
      setIsProcessing(false);
      return;
    }

    if (command.action === 'log' && onLogMeal) {
      if (activeMeal) {
        onLogMeal();
        const reply = `I have logged ${activeMeal.mealName} (${activeMeal.totalMacros.calories} kcal) into your daily journal!`;
        handleAssistantResponse(reply);
        if (onGoToTab) onGoToTab('journal');
      } else {
        const reply = "You haven't scanned a meal yet to log.";
        handleAssistantResponse(reply);
      }
      setIsProcessing(false);
      return;
    }

    if (command.action === 'help') {
      const reply =
        "You can give hands-free commands like: 'Capture photo', 'Read nutrition summary', 'How to reduce calories', 'Log this meal', or ask any general nutrition question.";
      handleAssistantResponse(reply);
      setIsProcessing(false);
      return;
    }

    // Default: Query AI Nutritionist with meal context
    try {
      const reply = await askNutritionist(userMessage, activeMeal);
      handleAssistantResponse(reply);
    } catch (err: any) {
      const errorReply = "I couldn't process that query right now. Please try asking again.";
      handleAssistantResponse(errorReply);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssistantResponse = (text: string) => {
    setConversation((prev) => [
      ...prev,
      { id: 'bot-' + Date.now(), sender: 'assistant', text },
    ]);
    setStatusText('Ready');
    if (voiceService.isTTSAvailable()) {
      setIsSpeaking(true);
      voiceService.speak(text, () => {
        setIsSpeaking(false);
      });
    }
  };

  // Start voice recognition
  const startListening = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);

    if (!voiceService.isSpeechRecognitionAvailable()) {
      setStatusText('Speech recognition is not supported in this browser. Try Chrome/Edge or use keyboard.');
      return;
    }

    try {
      const recognition = voiceService.createRecognition(
        (recognizedText, isFinal) => {
          setTranscript(recognizedText);
          setStatusText(`Hearing: "${recognizedText}"`);
          if (isFinal) {
            processVoiceInput(recognizedText);
          }
        },
        (errorMsg) => {
          setStatusText(errorMsg);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        setStatusText('Listening... Speak now!');
      }
    } catch (err) {
      console.warn('Recognition start error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        processVoiceInput(transcript);
      } else {
        setStatusText('Stopped listening');
      }
    } else {
      startListening();
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const lastBotMsg = [...conversation].reverse().find((m) => m.sender === 'assistant');
      if (lastBotMsg) {
        setIsSpeaking(true);
        voiceService.speak(lastBotMsg.text, () => setIsSpeaking(false));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Radio className="w-5 h-5 animate-pulse text-slate-950" />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping border-2 border-slate-900" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">AI Voice Nutritionist</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  Voice Assist Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hands-free voice commands & spoken nutritional guidance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isSpeaking
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isSpeaking ? 'Mute AI Voice' : 'Play last answer'}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-96 scrollbar-thin">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 whitespace-pre-line shadow-inner'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>AI Nutritionist is formulating spoken advice...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Waveform / Live Speech Audio Visualizer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Animated Waveform Bars */}
            <div className="flex items-center space-x-1 h-6">
              {[40, 70, 90, 60, 100, 50, 80, 45].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isListening
                      ? 'bg-rose-500 animate-pulse'
                      : isSpeaking
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isListening || isSpeaking ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                    animationDelay: `${i * 75}ms`,
                  }}
                />
              ))}
            </div>

            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {transcript ? `"${transcript}"` : statusText}
              </p>
              <p className="text-[10px] text-slate-500">
                {isListening ? 'Speak naturally...' : 'Ready for voice query or command'}
              </p>
            </div>
          </div>

          {/* Central Big Mic Toggle Button */}
          <button
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-14 h-14 rounded-2xl font-bold shadow-xl transition-all transform active:scale-95 cursor-pointer shrink-0 ml-3 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25'
            }`}
            title={isListening ? 'Tap to submit voice' : 'Tap to start speaking'}
          >
            {isListening ? <Mic className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        {/* Quick Voice Command Chips */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-slate-300">
          <span className="text-[10px] font-bold uppercase text-slate-500 mr-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Try saying:
          </span>
          {[
            'Read nutrition summary',
            'How to cut calories',
            'Take a photo',
            'Is this keto-friendly?',
            'Log this meal',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => processVoiceInput(prompt)}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition cursor-pointer"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
