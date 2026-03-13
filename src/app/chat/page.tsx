
"use client"

import { useState, useRef, useEffect } from 'react';
import { useHealth } from '@/components/health-context';
import { aiHealthAssistantAdvice, AiHealthAssistantAdviceOutput } from '@/ai/flows/ai-health-assistant-advice-flow';
import { urgentCareGuidance, UrgentCareGuidanceOutput } from '@/ai/flows/urgent-care-guidance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Bot, Loader2, Sparkles, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppLogo } from '@/components/app-logo';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  isUrgent?: boolean;
  recommendations?: string[];
  disclaimer?: string;
};

export default function ChatPage() {
  const { userProfile } = useHealth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Olá ${userProfile.name}. Sou o seu Assistente de Saúde. Como se sente hoje? Estou aqui para o ouvir com paciência e respeito. Pode contar-me sobre os seus sintomas ou dúvidas sobre a sua saúde.`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const urgentCheck: UrgentCareGuidanceOutput = await urgentCareGuidance({ symptoms: userMsg });

      if (urgentCheck.isUrgent) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: urgentCheck.guidance,
          isUrgent: true
        }]);
      } else {
        const response: AiHealthAssistantAdviceOutput = await aiHealthAssistantAdvice({
          question: userMsg,
          userProfile: {
            age: userProfile.age,
            gender: userProfile.gender,
            chronicDiseases: userProfile.chronicDiseases,
            medications: userProfile.medications,
            allergies: userProfile.allergies,
            recentHealthConcerns: userProfile.recentHealthConcerns,
          }
        });

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.advice,
          recommendations: response.recommendations,
          disclaimer: response.disclaimer
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Lamento, ocorreu um erro na ligação. Se tiver uma preocupação urgente, por favor ligue para o SNS 24 (808 24 24 24) ou 112."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      <div className="bg-primary/5 py-4 px-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <AppLogo className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Assistente ChronicAI</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Disponível para aconselhamento PT-PT
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-xs text-muted-foreground max-w-xs text-right">
          Em caso de emergência, ligue 112 ou 808 24 24 24.
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex w-full gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                msg.role === 'user' ? "bg-secondary text-white" : "bg-white text-primary border"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={cn(
                "flex flex-col space-y-2 max-w-[85%]",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                {msg.isUrgent && (
                  <Alert variant="destructive" className="mb-2 bg-destructive/10 border-destructive/20 animate-pulse">
                    <PhoneCall className="h-5 w-5" />
                    <AlertTitle className="font-bold">Ação Necessária Imediata</AlertTitle>
                    <AlertDescription>Siga as instruções de emergência abaixo.</AlertDescription>
                  </Alert>
                )}

                <div className={cn(
                  "p-4 rounded-2xl text-lg shadow-sm whitespace-pre-wrap leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-secondary text-white rounded-tr-none" 
                    : "bg-white text-foreground border rounded-tl-none",
                  msg.isUrgent && "border-destructive border-2 bg-destructive/5"
                )}>
                  {msg.content}
                </div>

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl w-full">
                    <h4 className="font-bold text-sm mb-2 text-accent-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Sugestões de Bem-estar:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-accent-foreground">
                      {msg.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.disclaimer && (
                  <p className="text-[10px] text-muted-foreground italic max-w-xs mt-1">
                    {msg.disclaimer}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-primary border flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground italic">O assistente está a analisar com cuidado...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 md:p-8 bg-card border-t">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva como se sente ou faça uma pergunta..."
            className="flex-1 h-14 text-lg rounded-full px-6 border-2 focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shrink-0"
            disabled={isLoading}
          >
            <Send className="w-6 h-6" />
          </Button>
        </form>
      </div>
    </div>
  );
}
