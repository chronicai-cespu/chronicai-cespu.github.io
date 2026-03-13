"use client"

import { useState } from 'react';
import { useHealth } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, ShieldCheck, Pill, Stethoscope, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { userProfile, setUserProfile, meds, addMed } = useHealth();
  const { toast } = useToast();

  const [editProfile, setEditProfile] = useState(userProfile);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');

  const handleSaveProfile = () => {
    setUserProfile(editProfile);
    toast({ title: "Profile Updated", description: "Your health information has been securely saved." });
  };

  const handleAddMed = () => {
    if (!newMedName) return;
    addMed({ name: newMedName, dosage: newMedDose, frequency: 'As needed' });
    setNewMedName('');
    setNewMedDose('');
    toast({ title: "Medication Added", description: `${newMedName} added to your list.` });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
          <User className="h-8 w-8 text-primary" /> My Health Profile
        </h1>
        <p className="text-muted-foreground text-lg">Manage your personal information, chronic conditions, and medications.</p>
      </header>

      <div className="grid gap-8">
        {/* Personal Info */}
        <Card className="shadow-md border-none">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="text-xl">Basic Information</CardTitle>
            <CardDescription>This helps our AI provide more accurate guidance.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={editProfile.name} onChange={e => setEditProfile({...editProfile, name: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={editProfile.age} onChange={e => setEditProfile({...editProfile, age: parseInt(e.target.value)})} className="h-12" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="concerns">Recent Health Concerns</Label>
              <Textarea id="concerns" value={editProfile.recentHealthConcerns} onChange={e => setEditProfile({...editProfile, recentHealthConcerns: e.target.value})} className="min-h-[100px]" />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 px-8 py-4 flex justify-end">
            <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 rounded-full px-8">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Clinical Info */}
        <Card className="shadow-md border-none">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-secondary" /> Medical Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <Label>Chronic Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {editProfile.chronicDiseases.map(disease => (
                  <Badge key={disease} variant="secondary" className="px-3 py-1 text-sm bg-secondary/10 text-secondary border-secondary/20 flex items-center gap-2">
                    {disease} <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" />
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="rounded-full h-8 border-dashed">
                  <Plus className="h-4 w-4 mr-1" /> Add Condition
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Known Allergies</Label>
              <div className="flex flex-wrap gap-2">
                {editProfile.allergies.map(allergy => (
                  <Badge key={allergy} variant="outline" className="px-3 py-1 text-sm border-red-200 text-red-600 bg-red-50">
                    {allergy}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="rounded-full h-8 border-dashed">
                  <Plus className="h-4 w-4 mr-1" /> Add Allergy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medication List */}
        <Card className="shadow-md border-none">
          <CardHeader className="bg-accent/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Pill className="h-5 w-5 text-accent-foreground" /> My Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              {meds.map(med => (
                <div key={med.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-muted/10 transition-colors">
                  <div>
                    <p className="font-bold text-lg">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t grid md:grid-cols-7 gap-4 items-end">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input id="med-name" placeholder="e.g. Aspirin" value={newMedName} onChange={e => setNewMedName(e.target.value)} />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="med-dose">Dosage</Label>
                <Input id="med-dose" placeholder="e.g. 81mg" value={newMedDose} onChange={e => setNewMedDose(e.target.value)} />
              </div>
              <div className="md:col-span-1">
                <Button onClick={handleAddMed} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <div className="bg-green-50 p-6 rounded-2xl flex items-center gap-4 border border-green-100">
          <div className="bg-green-100 p-3 rounded-full text-green-700">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Your Data is Secure</h3>
            <p className="text-sm text-green-700">All health information is stored securely and used only to personalize your health journey with ChronicAI.</p>
          </div>
        </div>
      </div>
    </div>
  );
}