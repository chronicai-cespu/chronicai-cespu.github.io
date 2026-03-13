import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'health-hero');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover brightness-[0.4]" /* Escurecido para melhorar contraste do texto branco */
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="relative z-10 px-4 max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline leading-tight">
            Gira a sua Saúde com <span className="text-primary-foreground brightness-125">ChronicAI</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto">
            Um companheiro de saúde dedicado aos seniores. Monitorize sinais vitais, gira a medicação e fale com a IA para aconselhamento personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-10 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/dashboard">Ir para o Meu Painel</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 h-14 rounded-full bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20">
              <Link href="/chat">Falar com o Assistente</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
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
      <section className="py-20 bg-accent/10 border-y">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para assumir o controlo da sua saúde?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Junte-se a milhares de seniores que gerem as suas condições crónicas com confiança.
          </p>
          <Button asChild size="lg" className="rounded-full px-12 h-14 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/profile">Configurar o seu Perfil</Link>
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2024 ChronicAI Health. Todos os direitos reservados.</p>
          <p className="text-sm">Aviso Médico: O ChronicAI fornece informações informativas e não substitui uma consulta médica profissional.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border shadow-md hover:shadow-lg transition-shadow bg-card">
      <CardContent className="pt-10 pb-10 px-8 text-center">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}