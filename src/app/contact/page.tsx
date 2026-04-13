
"use client"

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, User, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Validação simples para números com pelo menos 9 dígitos
    return /^\d{9,}$/.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { name, email, phone, subject, message } = formData;

    // Validação: Pelo menos um método de contacto válido deve ser fornecido
    const isEmailValid = email.trim() !== '' && validateEmail(email);
    const isPhoneValid = phone.trim() !== '' && validatePhone(phone);

    if (!isEmailValid && !isPhoneValid) {
      toast({
        variant: "destructive",
        title: "Dados de Contacto Necessários",
        description: "Por favor, introduza um E-mail ou um Telefone válido para que possamos responder.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!db) throw new Error("Erro de ligação à base de dados.");

      const contactRef = collection(db, 'contact_messages');
      addDocumentNonBlocking(contactRef, {
        name,
        email: isEmailValid ? email : null,
        phone: isPhoneValid ? phone : null,
        subject,
        message,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Mensagem Enviada",
        description: "Agradecemos o seu contacto. Responderemos o mais breve possível.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Envio",
        description: "Não foi possível enviar a mensagem. Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <Link href="/" className="inline-flex items-center text-primary hover:underline font-bold gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar à Página Inicial
        </Link>

        <Card className="shadow-xl border-none">
          <CardHeader className="text-center space-y-4 bg-primary/5 rounded-t-lg pb-10">
            <div className="flex justify-center mt-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
                <AppLogo className="w-10 h-10" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">Formulário de Contacto</CardTitle>
            <CardDescription className="text-lg">
              Utilize o formulário abaixo para nos enviar as suas dúvidas, sugestões ou feedback.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Nome Completo
                  </Label>
                  <Input 
                    id="name" 
                    required 
                    className="h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> E-mail
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    className="h-12"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> Telefone
                  </Label>
                  <Input 
                    id="phone" 
                    className="h-12"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="9XXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Assunto
                  </Label>
                  <Input 
                    id="subject" 
                    required 
                    className="h-12"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea 
                  id="message" 
                  required 
                  className="min-h-[150px] text-base"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 px-8 py-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-primary hover:bg-primary/90 rounded-full px-10 h-14 text-xl shadow-lg transition-all hover:scale-105"
              >
                {isSubmitting ? "A enviar..." : (
                  <>
                    <Send className="mr-2 h-6 w-6" /> Enviar Mensagem
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-muted-foreground text-sm pt-4">
          <p>Também pode contactar-nos diretamente através do e-mail:</p>
          <a href="mailto:chronicai.cespu@gmail.com" className="text-primary font-bold hover:underline">
            chronicai.cespu@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
