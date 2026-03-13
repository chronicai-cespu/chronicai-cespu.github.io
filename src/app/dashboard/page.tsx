"use client"

import { useHealth } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Pill, History, AlertCircle, PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Dashboard() {
  const { userProfile, logs, meds } = useHealth();

  const recentLogs = logs.slice(0, 3);
  const nextMed = meds[0]; // Simulation

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-secondary">Good morning, {userProfile.name}</h1>
          <p className="text-muted-foreground text-lg">Here is your health overview for today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/logs">
              <PlusCircle className="mr-2 h-4 w-4" /> Log Entry
            </Link>
          </Button>
          <Button asChild className="rounded-full bg-primary">
            <Link href="/chat">
              <MessageCircle className="mr-2 h-4 w-4" /> Ask AI
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="md:col-span-1 shadow-md border-none">
          <CardHeader className="bg-primary/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Conditions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {userProfile.chronicDiseases.map(d => (
                  <Badge key={d} variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">{d}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Concerns</p>
              <p className="mt-1 text-sm">{userProfile.recentHealthConcerns}</p>
            </div>
            <Button asChild variant="link" className="p-0 h-auto text-primary">
              <Link href="/profile">Edit Profile <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Vital Stats Card */}
        <Card className="md:col-span-1 shadow-md border-none">
          <CardHeader className="bg-accent/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <HeartPulse className="h-5 w-5" /> Recent Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {logs.find(l => l.type === 'bp') ? (
              <div className="text-center py-4">
                <span className="text-4xl font-bold text-secondary">
                  {logs.find(l => l.type === 'bp')?.value}
                </span>
                <p className="text-muted-foreground mt-2">Last Blood Pressure Reading</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recorded {format(logs.find(l => l.type === 'bp')!.timestamp, 'MMM d, h:mm a')}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No readings logged yet.</div>
            )}
            <Button asChild className="w-full mt-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/logs">Log New Vital</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Medication Card */}
        <Card className="md:col-span-1 shadow-md border-none">
          <CardHeader className="bg-secondary/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Pill className="h-5 w-5" /> Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {meds.length > 0 ? (
              <div className="space-y-3">
                {meds.slice(0, 2).map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-bold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.dosage} • {m.frequency}</p>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No medications listed.</p>
            )}
            <Button asChild variant="outline" className="w-full rounded-full border-secondary text-secondary hover:bg-secondary/5">
              <Link href="/profile">Manage Medications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="shadow-md border-none">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" /> Recent Activity Log
            </CardTitle>
            <Button asChild variant="link" className="text-primary">
              <Link href="/logs">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentLogs.map((log, idx) => (
              <div key={log.id} className={cn(
                "flex items-center justify-between p-4 rounded-lg",
                idx % 2 === 0 ? "bg-white" : "bg-transparent"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    log.type === 'bp' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  )}>
                    {log.type === 'bp' ? <HeartPulse className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold">{log.value}</p>
                    <p className="text-sm text-muted-foreground capitalize">{log.type} Log • {log.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{format(log.timestamp, 'MMM d')}</p>
                  <p className="text-xs text-muted-foreground">{format(log.timestamp, 'h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { MessageCircle, User, HeartPulse as HeartPulseIcon } from 'lucide-react';