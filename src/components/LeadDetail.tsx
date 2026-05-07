import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  MoreVertical,
  ChevronRight,
  User,
  Bot,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { leadService, type Lead, type Message } from '../services/leadService';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lead.id) return;
    const path = `leads/${lead.id}/messages`;
    const q = query(collection(db, path), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data()) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [lead.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !lead.id || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await leadService.getAIResponse(lead.id, messages, userMessage);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'HOT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'WARM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Detail Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-card z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-tight uppercase">{lead.name}</h2>
              <span className="text-[10px] font-mono text-zinc-600">ID: {lead.id?.slice(-8)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[9px] font-bold uppercase py-0 px-1.5 h-4 bg-zinc-800 border-border">{lead.status}</Badge>
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">{lead.email || 'NO_EMAIL_PROVIDED'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="text-zinc-500 rounded-md bg-zinc-900 border-border w-8 h-8">
            <Phone className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="text-zinc-500 rounded-md bg-zinc-900 border-border w-8 h-8">
            <Mail className="w-3.5 h-3.5" />
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-md h-8 text-[11px] font-bold px-4">
            PROPOSE_CALL
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col border-r border-border bg-zinc-950">
          <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center py-4">
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-600 bg-zinc-900/50 inline-block px-4 py-1 rounded border border-border">
                  Frequency Established • {new Date(lead.createdAt?.seconds * 1000).toLocaleDateString()}
                </p>
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border border-border ${msg.role === 'assistant' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[85%] rounded-lg p-3 text-[12px] leading-relaxed shadow-sm font-medium ${
                    msg.role === 'assistant' ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'bg-blue-600 text-white border border-blue-500'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-500 text-white rounded-md flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 animate-pulse">
                    <div className="flex gap-1.5">
                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-zinc-900/30 border-t border-border">
            <form onSubmit={handleSendMessage} className="relative max-w-2xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type response to simulate lead interaction..."
                className="pr-12 h-11 bg-black border-border rounded-lg text-xs placeholder:text-zinc-600 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="absolute right-1 top-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md w-9 h-9"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
            <div className="flex justify-center items-center gap-2 mt-3 opacity-30">
               <div className="h-px bg-zinc-700 flex-1" />
               <span className="text-[8px] font-mono uppercase tracking-[0.3em] whitespace-nowrap">Neural_Processing_Active</span>
               <div className="h-px bg-zinc-700 flex-1" />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-72 bg-card p-5 space-y-8 overflow-auto border-l border-border">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-3 bg-blue-500" />
              <h3 className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Logic_Quantization</h3>
            </div>
            
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-12 h-12 text-blue-500" />
               </div>
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-3">
                   <div className="flex flex-col">
                     <span className="text-zinc-600 text-[9px] uppercase font-black tracking-tighter">Confidence_Score</span>
                     <span className="text-2xl font-black font-mono tracking-tighter text-white">{lead.score}%</span>
                   </div>
                   <Badge className={`text-[10px] font-bold rounded-sm border ${getTierColor(lead.scoreTier)}`}>
                     {lead.scoreTier}
                   </Badge>
                 </div>
                 <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-border">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lead.score}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" 
                   />
                 </div>
               </div>
            </div>
          </section>

          <section>
             <h3 className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-3">AI_OBSERVATION</h3>
             <div className="p-3 bg-zinc-900/50 border border-border rounded-lg text-[11px] leading-relaxed italic text-zinc-400 font-medium">
               "{lead.summary || 'Awaiting further interaction for synthesis.'}"
             </div>
          </section>

          <section>
             <h3 className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-4">Meta_Attributes</h3>
             <div className="space-y-4">
               {[
                 { label: 'Origin', value: lead.source },
                 { label: 'Comms_Link', value: lead.phone },
                 { label: 'Unix_Epoch', value: lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleString() : 'N/A' },
               ].map((item, i) => (
                 <div key={i}>
                   <span className="text-[9px] text-zinc-600 uppercase font-black block mb-0.5">{item.label}</span>
                   <span className="text-xs font-mono text-zinc-300 font-medium tracking-tight bg-zinc-900 px-1 border border-border/50 rounded">{item.value}</span>
                 </div>
               ))}
             </div>
          </section>

          <section className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full text-zinc-500 border-dashed border-zinc-700 h-9 text-[10px] font-black uppercase hover:border-zinc-500">
              <MoreVertical className="w-3 h-3 mr-2" />
              Modify_Tags
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
};
