
"use client"

import { useState, useEffect } from 'react';
import { useHealth, UserProfile } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ShieldCheck, Pill, Stethoscope, Save, FileText, Activity, Loader2, FlaskConical, Mail, Phone, Hash, Calendar, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit-actions';
import { updateUser } from '@/lib/user-actions';

export default function ProfilePage() {
  const { userProfile, setUserProfile, role, assignedCode, isLoading } = useHealth();
  const { toast } = useToast();
  const router = useRouter();

  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        router.push('/login');
      } else if (userProfile) {
        setEditProfile(userProfile);
      }
    }
  }, [userProfile, role, isLoading, router]);

  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return null;
    const parts = birthDateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    
    const today = new Date();
    const birthDate = new Date(year, month, day);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleBirthDateChange = (value: string) => {
    if (!editProfile) return;
    
    let formatted = value.replace(/\D/g, '').slice(0, 8);
    if (formatted.length >= 2 && formatted.length < 4) {
      formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
    } else if (formatted.length >= 4) {
      formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}/${formatted.slice(4)}`;
    }
    
    const newAge = calculateAge(formatted);
    setEditProfile({ 
      ...editProfile, 
      birthDate: formatted,
      age: newAge !== null ? newAge : editProfile.age
    });
  };

  const validateForm = () => {
    if (!editProfile) return false;
    
    const requiredFields = [
      { field: 'name', label: 'Nome Completo' },
      { field: 'birthDate', label: 'Data de Nascimento' },
      { field: 'gender', label: 'Género' },
      { field: 'weight', label: 'Peso' },
      { field: 'height', label: 'Altura' },
      { field: 'alcoholFreq', label: 'Consumo de Álcool' },
      { field: 'tobaccoFreq', label: 'Consumo de Tabaco' },
      { field: 'physicalActivityLevel', label: 'Nível de Atividade Física' },
    ];

    for (const item of requiredFields) {
      if (!editProfile[item.field as keyof UserProfile]) {
        toast({ 
          variant: "destructive", 
          title: "Campo Obrigatório", 
          description: `Por favor, preencha o campo: ${item.label}` 
        });
        return false;
      }
    }

    if (!editProfile.chronicDiseases || editProfile.chronicDiseases.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Condições Crónicas", 
        description: "Por favor, selecione pelo menos uma condição." 
      });
      return false;
    }

    if (editProfile.chronicDiseases.includes('Outra') && !editProfile.otherConditions?.trim()) {
      toast({
        variant: "destructive",
        title: "Especificação Necessária",
        description: "Por favor, indique qual é a outra doença no campo de texto."
      });
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    if (editProfile && userProfile) {
      setIsSaving(true);
      try {
        await updateUser(userProfile.id, editProfile);
        setUserProfile(editProfile);
        
        await logAuditAction({
          userId: userProfile.id,
          userName: userProfile.name,
          userRole: userProfile.role,
          actionType: 'ATUALIZAÇÃO_PERFIL_SAÚDE',
          targetId: userProfile.id,
          targetName: userProfile.name,
          details: 'O paciente completou/atualizou o seu questionário de saúde obrigatório.'
        });

        toast({ title: "Perfil Atualizado", description: "As suas informações foram guardadas com sucesso." });
        router.push('/dashboard');
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Erro ao Guardar", 
          description: "Não foi possível gravar os dados." 
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const toggleDisease = (disease: string) => {
    if (!editProfile) return;
    let current = editProfile.chronicDiseases || [];
    
    if (disease === 'Nenhuma') {
      // Se selecionar 'Nenhuma', limpa todas as outras
      if (current.includes('Nenhuma')) {
        current = [];
      } else {
        current = ['Nenhuma'];
      }
    } else {
      // Se selecionar qualquer outra doença, remove 'Nenhuma'
      if (current.includes(disease)) {
        current = current.filter(d => d !== disease);
      } else {
        // Remove 'Nenhuma' se estiver presente
        current = current.filter(d => d !== 'Nenhuma');
        current.push(disease);
      }
    }
    
    setEditProfile({ ...editProfile, chronicDiseases: current });
  };

  if (isLoading || !editProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A carregar perfil...</p>
      </div>
    );
  }

  if (role === 'researcher' || role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-secondary flex items-center gap-3">
            {role === 'researcher' ? <FlaskConical className="h-8 w-8 text-primary" /> : <ShieldCheck className="h-8 w-8 text-destructive" />}
            Perfil de {role === 'researcher' ? 'Investigador' : 'Administrador'}
          </h1>
          <p className="text-muted-foreground text-lg">Os seus dados de acesso ao sistema ChronicAI.</p>
        </header>

        <Card className="shadow-lg border-none">
          <CardHeader className={cn("bg-muted/30 rounded-t-lg border-b", role === 'admin' ? "border-destructive/20" : "border-primary/20")}>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Informação Pessoal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Nome Completo</Label>
                <p className="text-xl font-bold">{editProfile.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Hash className="w-4 h-4" /> Código do Utilizador</Label>
                <p className="text-xl font-mono font-bold text-primary">{assignedCode}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Endereço de E-mail</Label>
                <p className="text-lg">{editProfile.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Contacto Telefónico</Label>
                <p className="text-lg">{editProfile.mobileNumber || 'Não indicado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weights = Array.from({ length: 151 }, (_, i) => i + 40);
  const heights = Array.from({ length: 101 }, (_, i) => i + 130);
  
  const educationLevels = ["Sem escolaridade", "Ensino Básico (1º ciclo)", "Ensino Básico (2º ciclo)", "Ensino Básico (3º ciclo)", "Ensino Secundário", "Ensino Superior (Licenciatura)", "Pós-graduação / Mestrado", "Doutoramento"];
  const householdSizes = ["Mora sozinho(a)", "2 pessoas", "3 pessoas", "4 pessoas", "5 ou mais pessoas"];

  const isProfileIncomplete = !userProfile?.birthDate;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 pb-24">
      <header>
        {isProfileIncomplete && (
          <div className="mb-6 p-4 bg-orange-100 border-l-4 border-orange-500 text-orange-800 flex items-center gap-3 rounded-r-lg">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <p className="font-bold">Atenção: Deve preencher o seu questionário de saúde para desbloquear as funcionalidades da aplicação.</p>
          </div>
        )}
        <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
          <User className="h-8 w-8 text-primary" /> Questionário de Saúde
        </h1>
        <p className="text-muted-foreground text-lg italic">Complete os seus dados para receber o melhor acompanhamento.</p>
      </header>

      <div className="grid gap-8">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Identificação e Dados Pessoais
            </CardTitle>
            <CardDescription>Estes dados são fundamentais para o seu acompanhamento clínico.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} className="h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento (DD/MM/AAAA)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input id="birthDate" value={editProfile.birthDate || ''} onChange={e => handleBirthDateChange(e.target.value)} className="h-12 pl-10" placeholder="DD/MM/AAAA" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Idade (Calculada automaticamente)</Label>
              <Input id="age" value={editProfile.age ? `${editProfile.age} anos` : 'A aguardar data...'} disabled className="h-12 bg-muted/50 font-bold" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select value={editProfile.gender} onValueChange={v => setEditProfile({ ...editProfile, gender: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Escolaridade</Label>
              <Select value={editProfile.education} onValueChange={v => setEditProfile({ ...editProfile, education: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o nível..." />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="household">Agregado Familiar</Label>
              <Select value={editProfile.householdSize} onValueChange={v => setEditProfile({ ...editProfile, householdSize: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o tamanho..." />
                </SelectTrigger>
                <SelectContent>
                  {householdSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="healthunit">Unidade de Saúde / Local</Label>
              <Input id="healthunit" value={editProfile.healthUnit} onChange={e => setEditProfile({ ...editProfile, healthUnit: e.target.value })} className="h-12" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" /> Biometria e Estilo de Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Select value={editProfile.weight?.toString() || ""} onValueChange={v => setEditProfile({ ...editProfile, weight: parseInt(v) })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolha o peso..." />
                </SelectTrigger>
                <SelectContent>
                  {weights.map(w => (
                    <SelectItem key={w} value={w.toString()}>{w} kg</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Select value={editProfile.height?.toString() || ""} onValueChange={v => setEditProfile({ ...editProfile, height: parseInt(v) })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolha a altura..." />
                </SelectTrigger>
                <SelectContent>
                  {heights.map(h => (
                    <SelectItem key={h} value={h.toString()}>{h} cm</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alcohol">Consumo de Álcool</Label>
              <Select value={editProfile.alcoholFreq} onValueChange={v => setEditProfile({ ...editProfile, alcoholFreq: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Frequência..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nunca">Nunca</SelectItem>
                  <SelectItem value="Ocasional">Ocasional</SelectItem>
                  <SelectItem value="Frequente">Frequente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tobacco">Consumo de Tabaco</Label>
              <Select value={editProfile.tobaccoFreq} onValueChange={v => setEditProfile({ ...editProfile, tobaccoFreq: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Frequência..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Não fumador">Não fumador</SelectItem>
                  <SelectItem value="Ex-fumador">Ex-fumador</SelectItem>
                  <SelectItem value="Fumador">Fumador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity">Nível de Atividade Física</Label>
              <Select value={editProfile.physicalActivityLevel} onValueChange={v => setEditProfile({ ...editProfile, physicalActivityLevel: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nula">Nula / Muito Baixa</SelectItem>
                  <SelectItem value="Baixa">Baixa (Caminhadas ocasionais)</SelectItem>
                  <SelectItem value="Moderada">Moderada (3x por semana)</SelectItem>
                  <SelectItem value="Alta">Alta (Diária)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="motivation" checked={editProfile.motivationToChange} onCheckedChange={(checked) => setEditProfile({ ...editProfile, motivationToChange: checked === true })} />
              <Label htmlFor="motivation" className="text-sm font-medium leading-none cursor-pointer">Tem motivação para mudança de hábitos?</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="bg-accent/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-accent-foreground" /> Condições Crónicas e Farmacoterapêutica
            </CardTitle>
            <CardDescription>Selecione as suas condições e indique a medicação que toma habitualmente.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="font-bold">Patologias Existentes:</Label>
              <div className="flex flex-wrap gap-3">
                {['Diabetes', 'Hipertensão', 'Colesterol', 'Outra', 'Nenhuma'].map(disease => (
                  <Badge 
                    key={disease} 
                    variant={editProfile.chronicDiseases?.includes(disease) ? "default" : "outline"} 
                    className={cn(
                      "px-6 py-3 text-base cursor-pointer transition-all rounded-full border-2", 
                      editProfile.chronicDiseases?.includes(disease) 
                        ? "bg-primary text-white scale-105 shadow-md border-primary" 
                        : "hover:bg-primary/10"
                    )} 
                    onClick={() => toggleDisease(disease)}
                  >
                    {disease}
                  </Badge>
                ))}
              </div>
            </div>

            {(editProfile.chronicDiseases?.includes('Outra') || editProfile.otherConditions) && !editProfile.chronicDiseases?.includes('Nenhuma') && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="others" className="font-bold">Indique qual a outra doença/condição:</Label>
                <Textarea id="others" placeholder="Escreva aqui o nome da condição específica..." className="min-h-[100px] bg-white text-base border-2" value={editProfile.otherConditions || ""} onChange={e => setEditProfile({...editProfile, otherConditions: e.target.value})} />
              </div>
            )}

            <div className="space-y-3 pt-4 border-t">
              <Label htmlFor="medication" className="font-bold flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" /> Medicação Habitual e Farmacoterapêutica:
              </Label>
              <Textarea 
                id="medication" 
                placeholder="Liste os medicamentos que toma, doses e horários (ex: Ben-u-ron 500mg ao pequeno-almoço)..." 
                className="min-h-[150px] bg-white text-base border-2"
                value={editProfile.medicationDescription || ""}
                onChange={e => setEditProfile({...editProfile, medicationDescription: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 px-8 py-6 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary hover:bg-primary/90 rounded-full px-10 h-14 text-xl shadow-lg transition-all hover:scale-105">
              {isSaving ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <Save className="mr-2 h-6 w-6" />}
              Guardar Perfil de Saúde
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
