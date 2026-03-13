"use client"

import { useState } from 'react';
import { useHealth } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartPulse, Activity, Scale, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function LogsPage() {
  const { logs, addLog } = useHealth();
  const { toast } = useToast();
  
  const [bp, setBp] = useState('');
  const [activity, setActivity] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = (type: 'bp' | 'activity' | 'weight') => {
    let value = '';
    if (type === 'bp') value = bp;
    if (type === 'activity') value = activity;
    if (type === 'weight') value = weight;

    if (!value) {
      toast({ title: "Error", description: "Please enter a value.", variant: "destructive" });
      return;
    }

    addLog({ type, value, notes });
    
    // Clear form
    setBp('');
    setActivity('');
    setWeight('');
    setNotes('');

    toast({
      title: "Success",
      description: `${type.toUpperCase()} log added successfully!`,
      variant: "default",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" /> Health Logger
        </h1>
        <p className="text-muted-foreground text-lg">Record your daily measurements and activities to stay on track.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Logging Forms */}
        <div className="md:col-span-7 space-y-6">
          <Card className="shadow-lg border-none overflow-hidden">
            <Tabs defaultValue="bp" className="w-full">
              <TabsList className="w-full h-16 rounded-none bg-muted grid grid-cols-3">
                <TabsTrigger value="bp" className="data-[state=active]:bg-white h-full text-lg gap-2">
                  <HeartPulse className="w-5 h-5" /> Vitals
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white h-full text-lg gap-2">
                  <Activity className="w-5 h-5" /> Activity
                </TabsTrigger>
                <TabsTrigger value="weight" className="data-[state=active]:bg-white h-full text-lg gap-2">
                  <Scale className="w-5 h-5" /> Weight
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="bp" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="bp" className="text-lg">Blood Pressure (mmHg)</Label>
                    <Input 
                      id="bp" 
                      placeholder="e.g. 120/80" 
                      className="h-14 text-xl"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">Format: Systolic/Diastolic</p>
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('bp')} />
                </TabsContent>

                <TabsContent value="activity" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="activity" className="text-lg">Exercise Description</Label>
                    <Input 
                      id="activity" 
                      placeholder="e.g. 20 min walk in the park" 
                      className="h-14 text-xl"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    />
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('activity')} />
                </TabsContent>

                <TabsContent value="weight" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-lg">Body Weight (lbs/kg)</Label>
                    <Input 
                      id="weight" 
                      placeholder="e.g. 175 lbs" 
                      className="h-14 text-xl"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('weight')} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Recent History Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-md border-none h-full bg-secondary/5">
            <CardHeader className="border-b bg-white rounded-t-lg">
              <CardTitle className="text-xl">Today's Logs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-secondary/10">
                      <div className={cn(
                        "p-2 rounded-lg",
                        log.type === 'bp' ? "bg-red-50 text-red-500" : 
                        log.type === 'activity' ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                      )}>
                        {log.type === 'bp' ? <HeartPulse className="w-5 h-5" /> : 
                         log.type === 'activity' ? <Activity className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-lg">{log.value}</p>
                          <span className="text-xs text-muted-foreground">{format(log.timestamp, 'h:mm a')}</span>
                        </div>
                        {log.notes && <p className="text-sm text-muted-foreground italic mt-1">"{log.notes}"</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground italic">No logs recorded today yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LogFields({ notes, setNotes, onLog }: { notes: string, setNotes: (v: string) => void, onLog: () => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          placeholder="How are you feeling? Any symptoms?" 
          className="min-h-[100px] text-lg"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button 
        onClick={onLog} 
        className="w-full h-14 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-lg"
      >
        <CheckCircle2 className="mr-2 h-6 w-6" /> Save Entry
      </Button>
    </div>
  );
}