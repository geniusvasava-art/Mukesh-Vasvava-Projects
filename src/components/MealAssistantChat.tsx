import React, { useState, useRef } from 'react';
import { Send, Sparkles, Bot, User, Loader2, MessageSquare, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { MealAnalysisResult } from '../types';
import { askNutritionist } from '../services/api';
import { voiceService } from '../services/voiceAssistant';

interface MealAssistantChatProps {
  meal: MealAnalysisResult | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const MealAssistantChat: React.FC<MealAssistantChatProps> = ({ meal }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: meal
        ? `Hello! I'm your AI Nutritionist. I've reviewed your "${meal.mealName}" (${meal.totalMacros.calories} kcal). Feel free to ask me for custom recipe swaps, meal prep advice, or restaurant ordering tips to lower calories further!`
        : `Hello! I'm your AI Nutritionist. Ask me any questions on estimating food portions, cutting hidden calories, or making healthy swaps.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      voiceService.speak(text, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  const toggleMicListening = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceListening(false);
      return;
    }

    if (!voiceService.isSpeechRecognitionAvailable()) {
      alert('Speech recognition is not supported in this browser environment. Try Chrome or Edge.');
      return;
    }

    try {
      const recognition = voiceService.createRecognition(
        (transcript, isFinal) => {
          setInputQuery(transcript);
          if (isFinal) {
            setIsVoiceListening(false);
          }
        },
        () => {
          setIsVoiceListening(false);
        },
        () => {
          setIsVoiceListening(false);
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsVoiceListening(true);
      }
    } catch (e) {
      console.warn('Voice mic error:', e);
      setIsVoiceListening(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const reply = await askNutritionist(userText, meal);
      const botMsgId = 'bot-' + Date.now();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      // If speech synthesis is active, optionally speak first sentence
      if (voiceService.isTTSAvailable()) {
        handleSpeakMessage(botMsgId, reply);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: "I couldn't process that query right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'How do I order this meal at a restaurant with 300 fewer calories?',
    'What is the highest-protein low-calorie swap for this dish?',
    'How does this meal fit into an intermittent fasting window?',
  ];

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ask AI Nutritionist</h3>
            <p className="text-[11px] text-slate-400">
              Personalized low-calorie coaching & culinary guidance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-slate-800">
            Gemini 3.7 Vision + Voice
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] relative group ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 whitespace-pre-line'
              }`}
            >
              {msg.text}
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/40">
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleSpeakMessage(msg.id, msg.text)}
                    className={`flex items-center space-x-1 text-[10px] transition cursor-pointer ${
                      speakingMsgId === msg.id
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Read answer aloud"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>
                )}
                <span
                  className={`text-[9px] font-mono ml-auto ${
                    msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>AI Nutritionist formulating advice...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputQuery(q);
            }}
            className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 transition"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Chat Input Bar with Voice Mic */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2">
        <button
          type="button"
          onClick={toggleMicListening}
          className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
            isVoiceListening
              ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/25'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700'
          }`}
          title={isVoiceListening ? 'Listening... click to finish' : 'Click to speak question'}
        >
          {isVoiceListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={isVoiceListening ? 'Listening to your voice...' : 'Ask a calorie reduction question or click mic...'}
          className={`flex-1 bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition ${
            isVoiceListening ? 'border-rose-500 shadow-inner' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

