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
            className="object-cover brightness-50"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="relative z-10 px-4 max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline leading-tight">
            Manage Your Health with <span className="text-primary">ChronicAI</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto">
            A compassionate health companion designed for seniors. Track vitals, manage medications, and chat with AI for personalized advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-10 h-14 rounded-full bg-primary hover:bg-primary/90">
              <Link href="/dashboard">Go to My Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 h-14 rounded-full bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20">
              <Link href="/chat">Chat with Assistant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Why Choose ChronicAI?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We combine easy-to-use logging tools with advanced AI to help you live a healthier, more independent life.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<HeartPulse className="w-10 h-10 text-primary" />}
              title="Vitals Tracking"
              description="Easily log your blood pressure, activity, and weight with simple, large touch targets."
            />
            <FeatureCard 
              icon={<Sparkles className="w-10 h-10 text-accent-foreground" />}
              title="AI Health Advice"
              description="Get personalized recommendations and answers to your health questions instantly."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-secondary" />}
              title="Urgent Care Gateway"
              description="Our assistant can recognize critical symptoms and guide you to immediate help when needed."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to take control of your health?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join thousands of seniors who are managing their chronic conditions with confidence.
          </p>
          <Button asChild size="lg" className="rounded-full px-12 h-14 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/profile">Set Up Your Profile</Link>
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-card border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2024 ChronicAI Health. All rights reserved.</p>
          <p className="text-sm">Medical Disclaimer: ChronicAI provides informational advice and is not a substitute for professional medical consultation.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-card">
      <CardContent className="pt-10 pb-10 px-8 text-center">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}