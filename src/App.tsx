import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  TrendingUp, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Phone,
  Mail,
  Filter,
  LogOut,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from './components/ui/tabs';
import { Toaster, toast } from 'sonner';
import { leadService, type Lead, type Message, QUALIFICATION_SYSTEM_INSTRUCTION } from './services/leadService';
import { LeadDetail } from './components/LeadDetail';
import { NewLeadDialog } from './components/NewLeadDialog';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const path = "leads";
    const q = query(collection(db, path), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(leadData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      toast.error("Auth failed. Check console.");
      console.error(error);
    }
  };

  const handleLogout = () => signOut(auth);

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    booked: leads.filter(l => l.status === 'BOOKED').length,
    avgScore: leads.length ? Math.round(leads.reduce((acc, l) => acc + (l.score || 0), 0) / leads.length) : 0,
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'HOT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'WARM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center font-mono">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Authenticating_Session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 z-10 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto flex items-center justify-center font-black italic text-4xl text-white shadow-[0_0_40px_-10px_#3b82f6]">
              A
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase pt-4">AURALEAD_AI</h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Neural Lead Qualification Engine</p>
          </div>

          <div className="bg-card border-2 border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
               <Zap className="w-24 h-24 text-blue-500" />
            </div>
            
            <div className="space-y-6 relative">
              <div className="text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-border flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase text-white/90">SECURE_ACCESS</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Enterprise Grade Encryption Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-border flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase text-white/90">HEURISTIC_DASHBOARD</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Real-time Frequency Analysis</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-black italic tracking-tighter text-lg rounded-xl transition-all active:scale-[0.98]"
              >
                INITIALIZE_SESSION
              </Button>
              
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                By entering, you agree to the terminal_protocols v2.4.0
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden text-foreground selection:bg-blue-500 selection:text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="h-[60px] border-b border-border flex items-center px-6 justify-between shrink-0 bg-background/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center font-black italic text-lg text-white">
            A
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold tracking-tighter text-lg">AURALEAD_AI</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border border-border px-1.5 rounded">v2.4.0</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Gemini_Instance_Live</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">HubSpot_Sync_Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">SMS_Gateway_Ready</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[240px] bg-card border-r border-border flex flex-col shrink-0">
          <div className="p-4 flex flex-col gap-1">
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'leads', icon: Users, label: 'Lead Management' },
              { id: 'automations', icon: Settings, label: 'AI Prompt Engineer' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-zinc-800 text-white shadow-inner' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${activeTab === item.id ? 'text-blue-500' : ''}`} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 flex flex-col gap-4">
            <div className="p-3 bg-zinc-900 border border-border rounded-lg space-y-2">
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">System Status</div>
               <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400">Server Uptime</span>
                  <span className="font-mono text-emerald-500">99.98%</span>
               </div>
            </div>
            
            <div className="flex items-center gap-3 p-1 group">
              <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border border-border overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  'AD'
                )}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-bold truncate max-w-[100px]">{user.displayName || 'Admin_User'}</span>
                <span className="text-[9px] text-blue-500 uppercase font-bold tracking-tighter">Enterprise Mode</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="w-7 h-7 rounded-md text-zinc-500 hover:text-white hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 max-w-7xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Leads (24h)', value: stats.total, sub: '+12.4% vs prev', icon: Users, color: 'text-blue-500' },
                    { label: 'Qualified %', value: `${stats.avgScore}%`, sub: '+3.2% optimization', icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Avg Resp. Time', value: '1.8s', sub: 'Target: <2.0s', icon: Clock, color: 'text-amber-500' },
                    { label: 'Appointments', value: stats.booked, sub: '78% Booking Rate', icon: Calendar, color: 'text-blue-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-5 rounded-lg">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-2xl font-black font-mono tracking-tighter">{stat.value}</h3>
                        <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
                      </div>
                      <p className={`text-[9px] mt-2 font-bold ${stat.sub.includes('+') ? 'text-emerald-500' : 'text-zinc-500'}`}>{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-zinc-900/50">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[11px] font-bold tracking-tight uppercase">Active Qualifications</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Real-time Feed</span>
                    </div>
                    
                    <Table>
                      <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-border">
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500 h-10">Lead Name</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500 h-10">Channel</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500 h-10">Scoring</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500 h-10 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={4} className="text-center py-20 text-zinc-600 text-xs italic">
                               No leads detected in frequency range.
                             </TableCell>
                           </TableRow>
                        ) : (
                          leads.slice(0, 8).map((lead) => (
                            <TableRow 
                              key={lead.id} 
                              className="border-border hover:bg-zinc-900/30 cursor-pointer" 
                              onClick={() => { setSelectedLead(lead); setActiveTab('leads'); }}
                            >
                              <TableCell className="py-3">
                                <span className="font-bold text-xs">{lead.name}</span>
                              </TableCell>
                              <TableCell className="py-3">
                                <span className="text-[10px] font-mono uppercase bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-border">
                                  {lead.source}
                                </span>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge className={`text-[9px] font-bold rounded px-2 py-0.5 border ${getTierColor(lead.scoreTier)}`}>
                                  {lead.score} — {lead.scoreTier}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right py-3">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                                   {lead.status === 'BOOKED' ? 'Appointment' : 'Analyze_Thread'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-card border-border shadow-none">
                      <CardHeader className="p-4 border-b border-border">
                        <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">System Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="font-mono text-[10px] space-y-2 text-zinc-400">
                          <div className="flex gap-2">
                             <span className="text-zinc-600 shrink-0">[14:22:01]</span>
                             <span>Webhook received from FB_ADS</span>
                          </div>
                          <div className="flex gap-2">
                             <span className="text-zinc-600 shrink-0">[14:22:03]</span>
                             <span>AI Assistant instance initialized</span>
                          </div>
                          <div className="flex gap-2">
                             <span className="text-zinc-600 shrink-0">[14:22:08]</span>
                             <span className="text-emerald-500">Lead scoring computed: 92/100</span>
                          </div>
                          <div className="flex gap-2">
                             <span className="text-zinc-600 shrink-0">[14:22:12]</span>
                             <span>SMS response dispatched</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-600/5 border-blue-500/20 shadow-none relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <TrendingUp className="w-16 h-16 text-blue-500" />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs uppercase tracking-widest text-blue-500">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                         <div className="text-3xl font-black font-mono">18.4%</div>
                         <div className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">
                            +4.1% Since Patch 2.3.9
                         </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex -m-6"
              >
                <div className={`flex flex-col border-r border-border transition-all duration-300 bg-background ${selectedLead ? 'w-[400px]' : 'w-full'}`}>
                  <div className="p-6 border-b border-border flex justify-between items-center bg-card/50">
                    <div>
                      <h2 className="text-xl font-black tracking-tighter">LEAD_FLOW</h2>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">{leads.length} records in queue</p>
                    </div>
                    <Button onClick={() => setIsNewLeadOpen(true)} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-md font-bold text-[11px] gap-2 h-8">
                      <Plus className="w-3 h-3" />
                      NEW_RECORD
                    </Button>
                  </div>
                  
                  <div className="p-4 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <Input className="pl-9 h-9 bg-zinc-900 border-border text-[12px] placeholder:text-zinc-600" placeholder="Search data points..." />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="divide-y divide-border">
                      {leads.map((lead) => (
                        <div 
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-5 hover:bg-zinc-900/50 cursor-pointer transition-all border-l-2 ${selectedLead?.id === lead.id ? 'bg-zinc-900 border-l-blue-500' : 'border-l-transparent'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm leading-tight tracking-tight">{lead.name}</span>
                              <span className="text-[10px] font-mono text-zinc-600 mt-0.5 uppercase tracking-tighter font-bold">{lead.source}</span>
                            </div>
                            <Badge className={`text-[8px] font-bold rounded-sm border ${getTierColor(lead.scoreTier)}`}>
                              {lead.scoreTier}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mb-3">
                            {lead.summary || "Awaiting AI categorization..."}
                          </p>
                          <div className="flex items-center gap-4 text-zinc-600 uppercase font-bold text-[9px] tracking-tighter font-mono">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span>Last: 2m ago</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" />
                              <span>{Math.floor(Math.random() * 20)} Logs</span>
                            </div>
                            <div className="ml-auto text-blue-500/50">
                               ID: {lead.id?.slice(-4)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex-1 bg-zinc-950">
                  {selectedLead ? (
                    <LeadDetail 
                      lead={selectedLead} 
                      onClose={() => setSelectedLead(null)} 
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                       <MessageSquare className="w-16 h-16 mb-6 opacity-5" strokeWidth={1} />
                       <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30">Selection Required</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'automations' && (
              <div className="max-w-4xl mx-auto space-y-6">
                 <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">AI_PROMPT_ENGINEER</h1>
                    <p className="text-xs text-zinc-500 font-mono">Control the heuristic parameters of the qualification logic.</p>
                 </div>
                 <Card className="bg-card border-border shadow-none border-2">
                   <CardHeader className="border-b border-border bg-zinc-900/50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest">Base Instruction Patch</CardTitle>
                        <Badge variant="outline" className="text-[9px] font-mono">GEMINI-FLASH-3.0</Badge>
                      </div>
                   </CardHeader>
                   <CardContent className="p-6 space-y-6">
                     <div className="relative group">
                       <div className="absolute -inset-1 bg-blue-500/10 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                       <textarea 
                        className="relative w-full h-[400px] p-6 bg-black border border-border rounded-xl font-mono text-[12px] leading-relaxed text-blue-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all scrollbar-hide"
                        defaultValue={QUALIFICATION_SYSTEM_INSTRUCTION}
                       />
                     </div>
                     <div className="flex justify-between items-center gap-4">
                       <div className="text-[10px] font-mono text-zinc-600">
                          LAST_DEPLOY: 2024-05-06 23:48:47
                       </div>
                       <div className="flex gap-3">
                         <Button variant="outline" className="text-zinc-400 border-border h-9 px-4 text-xs font-bold">DISCARD</Button>
                         <Button className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-6 text-xs font-black italic tracking-tighter">COMMIT_AND_SYNC</Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <NewLeadDialog 
        open={isNewLeadOpen} 
        onClose={() => setIsNewLeadOpen(false)} 
        onSuccess={() => setIsNewLeadOpen(false)}
      />
    </div>
  );
};

export default App;
