
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, HeartPulse, Sparkles, Mail, ExternalLink, ClipboardList } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AppLogo } from '@/components/app-logo';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'health-hero');
  
  // Ordem específica dos logótipos institucionais
  const logos = [
    PlaceHolderImages.find(img => img.id === 'logo-1-ditech'),
    PlaceHolderImages.find(img => img.id === 'logo-2-cespu'),
    PlaceHolderImages.find(img => img.id === 'logo-3-lasi'),
    PlaceHolderImages.find(img => img.id === 'logo-4-algoritmi'),
    PlaceHolderImages.find(img => img.id === 'logo-5-uminho')
  ].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center overflow-hidden bg-background">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-10"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="relative z-10 px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <AppLogo className="text-primary w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline leading-tight text-primary">
            Gira a sua Saúde com <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">ChronicAI</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-muted-foreground font-bold max-w-2xl mx-auto">
            Um companheiro de saúde dedicado. Monitorize sinais vitais, gira a medicação e fale com a IA para aconselhamento personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg border-none">
              <Link href="/dashboard">Ver os meus dados</Link>
            </Button>
            <Button asChild size="lg" className="text-lg px-8 h-14 rounded-full bg-accent text-white hover:bg-accent/90 border-none shadow-lg">
              <Link href="/logs" className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> Ir para os meus registos
              </Link>
            </Button>
            <Button asChild size="lg" className="text-lg px-8 h-14 rounded-full bg-secondary text-white hover:bg-secondary/90 border-none shadow-lg">
              <Link href="/chat">Falar com o Assistente</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Porquê escolher o ChronicAI?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Combinamos ferramentas de registo fáceis de usar com IA avançada para o ajudar a viver uma vida mais saudável e independente.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<HeartPulse className="w-10 h-10 text-primary" />}
              title="Sinais Vitais"
              description="Registe facilmente a sua pressão arterial, atividade e peso com botões grandes e simples."
            />
            <FeatureCard 
              icon={<Sparkles className="w-10 h-10 text-secondary" />}
              title="Conselhos com IA"
              description="Obtenha recomendações personalizadas e respostas às suas perguntas de saúde instantaneamente."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-primary" />}
              title="Cuidados Urgentes"
              description="O nosso assistente reconhece sintomas críticos e guia-o para ajuda imediata quando necessário."
            />
          </div>
        </div>
      </section>

      {/* Institutional Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary italic">Colaboração Institucional</h2>
            <div className="bg-white/50 p-8 rounded-2xl shadow-sm border border-secondary/10">
              <p className="text-lg font-bold text-primary mb-2">
                ChronicAI – Integrating Self-Care and Artificial Intelligence in Chronic Disease Management
              </p>
              <p className="text-sm text-muted-foreground font-mono mb-6">
                ChronicAI-GI2-CESPU-2025
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-5xl mx-auto text-sm sm:text-base">
                Este projeto resulta de uma colaboração estratégica entre a unidade de investigação 
                <strong> "Digital Health & Technology" (DiTech)</strong>, integrada no 
                <strong> GI2 - Gabinete para a Investigação & a Inovação</strong> da 
                <strong> CESPU - Cooperativa de Ensino Superior Politécnico e Universitário</strong>, 
                e o <strong>Intelligent Systems Associate Laboratory (LASI)</strong>, do 
                <strong> Centro Algoritmi</strong> da <strong>Universidade do Minho</strong>.
              </p>
            </div>
          </div>

          {/* Logos com dimensões uniformes */}
          <div className="grid grid-cols-2 md:grid-cols-5 items-center justify-center gap-6 md:gap-8 opacity-95 max-w-6xl mx-auto">
            {logos.map((logo, index) => (
              <div key={logo?.id || index} className="flex justify-center items-center h-28 bg-white p-4 rounded-xl shadow-sm border overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src={logo!.imageUrl} 
                    alt={logo!.description} 
                    fill 
                    className="object-contain" 
                    data-ai-hint={logo!.imageHint}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5">
              <a href="mailto:chronicai.cespu@gmail.com" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> chronicai.cespu@gmail.com
              </a>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/contact" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Formulário de Contacto
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white/80 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground space-y-4">
          <div>
            <p className="font-bold">© 2026 ChronicAI. Todos os direitos reservados.</p>
            <p className="text-xs">DiTech | CESPU & Centro Algoritmi | UMinho</p>
          </div>
          <p className="text-[10px] leading-tight max-w-2xl mx-auto italic">
            Aviso Médico: O ChronicAI fornece apenas informações informativas e conselhos de bem-estar. Não substitui o diagnóstico, tratamento ou aconselhamento por um profissional de saúde.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border shadow-md hover:shadow-lg transition-shadow bg-white">
      <CardContent className="pt-10 pb-10 px-8 text-center">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
