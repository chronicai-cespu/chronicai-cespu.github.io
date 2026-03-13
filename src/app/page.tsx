import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AppLogo } from '@/components/app-logo';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'health-hero');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center overflow-hidden bg-[#87CEEB]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-20"
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline leading-tight text-white">
            Gira a sua Saúde com <span className="bg-gradient-to-br from-[#FFD700] to-[#FF8C00] bg-clip-text text-transparent">ChronicAI</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white font-bold max-w-2xl mx-auto">
            Um companheiro de saúde dedicado aos seniores. Monitorize sinais vitais, gira a medicação e fale com a IA para aconselhamento personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-10 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg border-none">
              <Link href="/dashboard">Ir para o Meu Painel</Link>
            </Button>
            <Button asChild size="lg" className="text-lg px-10 h-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 border-none shadow-lg">
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
              icon={<Sparkles className="w-10 h-10 text-accent" />}
              title="Conselhos com IA"
              description="Obtenha recomendações personalizadas e respostas às suas perguntas de saúde instantaneamente."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-secondary" />}
              title="Cuidados Urgentes"
              description="O nosso assistente reconhece sintomas críticos e guia-o para ajuda imediata quando necessário."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-accent/20 border-y border-accent/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-accent-foreground">Pronto para assumir o controlo da sua saúde?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Junte-se a milhares de seniores que gerem as suas condições crónicas com confiança.
          </p>
          <Button asChild size="lg" className="rounded-full px-12 h-14 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
            <Link href="/profile">Configurar o seu Perfil</Link>
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-white/80 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2 font-bold">© 2026 ChronicAI Health. Todos os direitos reservados.</p>
          <p className="text-sm">Aviso Médico: O ChronicAI fornece informações informativas e não substitui uma consulta médica profissional.</p>
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
