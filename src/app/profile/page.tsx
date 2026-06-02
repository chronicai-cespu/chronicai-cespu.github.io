
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
import { User, ShieldCheck, Pill, Stethoscope, Save, FileText, Activity, Loader2, FlaskConical, Mail, Phone, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit-actions';

export default function ProfilePage() {
  const { userProfile, setUserProfile, role, assignedCode, isLoading } = useHealth();
  const { toast } = useToast();
  const router = useRouter();

  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        router.push('/login');
      } else if (userProfile) {
        setEditProfile(userProfile);
      }
    }
  }, [userProfile, role, isLoading, router]);

  const handleSaveProfile = async () => {
    if (editProfile && userProfile) {
      setUserProfile(editProfile);
      
      // Registo de auditoria para auto-atualização do perfil
      await logAuditAction({
        userId: userProfile.id,
        userName: userProfile.name,
        userRole: userProfile.role,
        actionType: 'ATUALIZAÇÃO_PERFIL_SAÚDE',
        targetId: userProfile.id,
        targetName: userProfile.name,
        details: 'O paciente atualizou o seu questionário de saúde e biometria.'
      });

      toast({ title: "Perfil Atualizado", description: "As suas informações foram guardadas com segurança." });
    }
  };

  const toggleDisease = (disease: string) => {
    if (!editProfile) return;
    const current = editProfile.chronicDiseases || [];
    if (current.includes(disease)) {
      setEditProfile({ ...editProfile, chronicDiseases: current.filter(d => d !== disease) });
    } else {
      setEditProfile({ ...editProfile, chronicDiseases: [...current, disease] });
    }
  };

  if (isLoading || !editProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A carregar perfil...</p>
      </div>
    );
  }

  // Visualização de Perfil para Investigadores ou Admins
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
            
            <div className="pt-6 border-t mt-6">
              <Badge variant="outline" className={cn("text-xs py-1 px-4", role === 'admin' ? "border-destructive text-destructive" : "border-primary text-primary")}>
                Papel de Utilizador: {role?.toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Para alterar os seus dados de contacto ou e-mail, por favor utilize o formulário de contacto ou contacte o suporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questionário de Saúde para Pacientes
  const ages = Array.from({ length: 93 }, (_, i) => i + 18);
  const weights = Array.from({ length: 151 }, (_, i) => i + 40);
  const heights = Array.from({ length: 101 }, (_, i) => i + 130);
  
  const educationLevels = [
    "Sem escolaridade",
    "Ensino Básico (1º ciclo)",
    "Ensino Básico (2º ciclo)",
    "Ensino Básico (3º ciclo)",
    "Ensino Secundário",
    "Ensino Superior (Licenciatura)",
    "Pós-graduação / Mestrado",
    "Doutoramento"
  ];
  const householdSizes = [
    "Mora sozinho(a)",
    "2 pessoas",
    "3 pessoas",
    "4 pessoas",
    "5 ou mais pessoas"
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
          <User className="h-8 w-8 text-primary" /> Questionário de Saúde
        </h1>
        <p className="text-muted-foreground text-lg italic">"A sua saúde é o seu maior bem. Vamos cuidar dela juntos."</p>
      </header>

      <div className="grid gap-8">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Identificação e Dados Pessoais
            </CardTitle>
            <CardDescription>Informação básica para o seu registo de saúde.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} className="h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento (DD/MM/AAAA)</Label>
              <Input id="birthDate" value={editProfile.birthDate} onChange={e => setEditProfile({ ...editProfile, birthDate: e.target.value })} className="h-12" placeholder="DD/MM/AAAA" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Select value={editProfile.age?.toString() || ""} onValueChange={v => setEditProfile({ ...editProfile, age: parseInt(v) })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolha a idade..." />
                </SelectTrigger>
                <SelectContent>
                  {ages.map(age => (
                    <SelectItem key={age} value={age.toString()}>{age} anos</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
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
              <Label htmlFor="activity">Nível de Atividade Física (Autocuidado)</Label>
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
              <Checkbox 
                id="motivation" 
                checked={editProfile.motivationToChange} 
                onCheckedChange={(checked) => setEditProfile({ ...editProfile, motivationToChange: checked === true })}
              />
              <Label htmlFor="motivation" className="text-sm font-medium leading-none cursor-pointer">
                Tem motivação para mudança de hábitos e estilo de vida?
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="bg-accent/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-accent-foreground" /> Condições Crónicas e Farmacoterapêutica
            </CardTitle>
            <CardDescription>Selecione as suas condições para receber apoio personalizado.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-wrap gap-3">
              {['Diabetes', 'Hipertensão', 'Colesterol'].map(disease => (
                <Badge 
                  key={disease} 
                  variant={editProfile.chronicDiseases?.includes(disease) ? "default" : "outline"}
                  className={cn(
                    "px-6 py-3 text-base cursor-pointer transition-all rounded-full",
                    editProfile.chronicDiseases?.includes(disease) 
                      ? "bg-primary text-white scale-105 shadow-md" 
                      : "hover:bg-primary/10 border-2"
                  )}
                  onClick={() => toggleDisease(disease)}
                >
                  {disease}
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="others">Outras Doenças ou Observações Importantes</Label>
              <Textarea 
                id="others" 
                placeholder="Descreva outras condições ou detalhes importantes que o assistente deva saber..." 
                className="min-h-[120px] bg-white text-base"
                value={editProfile.otherConditions || ""}
                onChange={e => setEditProfile({...editProfile, otherConditions: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 px-8 py-6 flex justify-end">
            <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 rounded-full px-10 h-14 text-xl shadow-lg transition-all hover:scale-105">
              <Save className="mr-2 h-6 w-6" /> Guardar Perfil de Saúde
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
