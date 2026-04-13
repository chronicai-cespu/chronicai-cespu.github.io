
"use client"

import { useState } from 'react';
import { useHealth, UserProfile } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ShieldCheck, Pill, Stethoscope, Save, FileText, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { userProfile, setUserProfile } = useHealth();
  const { toast } = useToast();

  const [editProfile, setEditProfile] = useState<UserProfile>(userProfile || {
    name: '',
    age: 0,
    birthDate: '',
    gender: '',
    education: '',
    householdSize: '',
    healthUnit: '',
    weight: 0,
    height: 0,
    alcoholFreq: '',
    tobaccoFreq: '',
    physicalActivityLevel: '',
    motivationToChange: false,
    chronicDiseases: [],
    otherConditions: ''
  });

  const handleSaveProfile = () => {
    setUserProfile(editProfile);
    toast({ title: "Perfil Atualizado", description: "As suas informações de saúde foram guardadas com segurança." });
  };

  const toggleDisease = (disease: string) => {
    const current = editProfile.chronicDiseases;
    if (current.includes(disease)) {
      setEditProfile({ ...editProfile, chronicDiseases: current.filter(d => d !== disease) });
    } else {
      setEditProfile({ ...editProfile, chronicDiseases: [...current, disease] });
    }
  };

  // Helper ranges for dropdowns
  const ages = Array.from({ length: 93 }, (_, i) => i + 18); // 18 to 110
  const weights = Array.from({ length: 151 }, (_, i) => i + 40); // 40 to 190 kg
  const heights = Array.from({ length: 101 }, (_, i) => i + 130); // 130 to 230 cm
  const durations = Array.from({ length: 51 }, (_, i) => i); // 0 to 50 years
  
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
        {/* Identificação e Registo */}
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
              <Select value={editProfile.age.toString()} onValueChange={v => setEditProfile({ ...editProfile, age: parseInt(v) })}>
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

        {/* Biometria e Hábitos */}
        <Card className="shadow-md border-none">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" /> Biometria e Estilo de Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Select value={editProfile.weight.toString()} onValueChange={v => setEditProfile({ ...editProfile, weight: parseInt(v) })}>
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
              <Select value={editProfile.height.toString()} onValueChange={v => setEditProfile({ ...editProfile, height: parseInt(v) })}>
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

        {/* Patologias Crónicas */}
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
                  variant={editProfile.chronicDiseases.includes(disease) ? "default" : "outline"}
                  className={cn(
                    "px-6 py-3 text-base cursor-pointer transition-all rounded-full",
                    editProfile.chronicDiseases.includes(disease) 
                      ? "bg-primary text-white scale-105 shadow-md" 
                      : "hover:bg-primary/10 border-2"
                  )}
                  onClick={() => toggleDisease(disease)}
                >
                  {disease}
                </Badge>
              ))}
            </div>

            {/* Campos Dinâmicos por Doença */}
            {editProfile.chronicDiseases.includes('Diabetes') && (
              <div className="space-y-4 p-6 border-l-4 border-primary bg-primary/5 rounded-r-xl animate-in slide-in-from-left duration-300">
                <h4 className="font-bold text-primary flex items-center gap-2 text-lg"><Activity className="w-5 h-5" /> Diabetes</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Duração da doença (anos)</Label>
                    <Select 
                      value={editProfile.diabetesInfo?.duration || "0"} 
                      onValueChange={v => setEditProfile({...editProfile, diabetesInfo: { ...editProfile.diabetesInfo!, duration: v }})}
                    >
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Selecione os anos..." />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map(d => (
                          <SelectItem key={d} value={d.toString()}>{d} {d === 1 ? 'ano' : 'anos'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="insulin" 
                      checked={editProfile.diabetesInfo?.insulinDependent}
                      onCheckedChange={checked => setEditProfile({...editProfile, diabetesInfo: { ...editProfile.diabetesInfo!, insulinDependent: checked === true }})}
                    />
                    <Label htmlFor="insulin" className="text-sm font-medium cursor-pointer">Dependente de Insulina?</Label>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Medicação Habitual</Label>
                    <Input 
                      placeholder="ex: Metformina, Januvia" 
                      className="h-12 bg-white"
                      value={editProfile.diabetesInfo?.meds}
                      onChange={e => setEditProfile({...editProfile, diabetesInfo: { ...editProfile.diabetesInfo!, meds: e.target.value }})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Sintomatologia mais frequente</Label>
                    <Input 
                      placeholder="ex: formigueiro nos pés, sede excessiva" 
                      className="h-12 bg-white"
                      value={editProfile.diabetesInfo?.symptoms?.join(', ')}
                      onChange={e => setEditProfile({...editProfile, diabetesInfo: { ...editProfile.diabetesInfo!, symptoms: e.target.value.split(',').map(s => s.trim()) }})}
                    />
                  </div>
                </div>
              </div>
            )}

            {editProfile.chronicDiseases.includes('Hipertensão') && (
              <div className="space-y-4 p-6 border-l-4 border-secondary bg-secondary/5 rounded-r-xl animate-in slide-in-from-left duration-300">
                <h4 className="font-bold text-secondary flex items-center gap-2 text-lg"><Activity className="w-5 h-5" /> Hipertensão</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Valores mais elevados registados (mmHg)</Label>
                    <Input 
                      placeholder="ex: 160/100"
                      className="h-12 bg-white"
                      value={editProfile.hypertensionInfo?.highestReading}
                      onChange={e => setEditProfile({...editProfile, hypertensionInfo: { ...editProfile.hypertensionInfo!, highestReading: e.target.value }})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valores habituais</Label>
                    <Input 
                      placeholder="ex: 135/85"
                      className="h-12 bg-white"
                      value={editProfile.hypertensionInfo?.regularReading}
                      onChange={e => setEditProfile({...editProfile, hypertensionInfo: { ...editProfile.hypertensionInfo!, regularReading: e.target.value }})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Medicação Habitual</Label>
                    <Input 
                      placeholder="ex: Enalapril, Lisinopril"
                      className="h-12 bg-white"
                      value={editProfile.hypertensionInfo?.meds}
                      onChange={e => setEditProfile({...editProfile, hypertensionInfo: { ...editProfile.hypertensionInfo!, meds: e.target.value }})}
                    />
                  </div>
                </div>
              </div>
            )}

            {editProfile.chronicDiseases.includes('Colesterol') && (
              <div className="space-y-4 p-6 border-l-4 border-accent bg-accent/5 rounded-r-xl animate-in slide-in-from-left duration-300">
                <h4 className="font-bold text-accent-foreground flex items-center gap-2 text-lg"><Activity className="w-5 h-5" /> Colesterol</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Valor Total mais elevado (mg/dL)</Label>
                    <Input 
                      placeholder="ex: 240"
                      className="h-12 bg-white"
                      value={editProfile.cholesterolInfo?.highestReading}
                      onChange={e => setEditProfile({...editProfile, cholesterolInfo: { ...editProfile.cholesterolInfo!, highestReading: e.target.value }})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="triglycerides" 
                      checked={editProfile.cholesterolInfo?.highTriglycerides}
                      onCheckedChange={checked => setEditProfile({...editProfile, cholesterolInfo: { ...editProfile.cholesterolInfo!, highTriglycerides: checked === true }})}
                    />
                    <Label htmlFor="triglycerides" className="text-sm font-medium cursor-pointer">Triglicéridos elevados?</Label>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Medicação Habitual</Label>
                    <Input 
                      placeholder="ex: Atorvastatina, Sinvastatina"
                      className="h-12 bg-white"
                      value={editProfile.cholesterolInfo?.meds}
                      onChange={e => setEditProfile({...editProfile, cholesterolInfo: { ...editProfile.cholesterolInfo!, meds: e.target.value }})}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="others">Outras Doenças ou Observações Importantes</Label>
              <Textarea 
                id="others" 
                placeholder="Descreva outras condições ou detalhes importantes que o assistente deva saber..." 
                className="min-h-[120px] bg-white text-base"
                value={editProfile.otherConditions}
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

        {/* Security & Privacy */}
        <div className="bg-green-50 p-6 rounded-2xl flex items-center gap-6 border border-green-100 shadow-sm">
          <div className="bg-green-100 p-4 rounded-full text-green-700">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-lg">Privacidade e Segurança</h3>
            <p className="text-base text-green-700">Os seus dados clínicos são encriptados e usados exclusivamente para personalizar o seu apoio com IA.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
