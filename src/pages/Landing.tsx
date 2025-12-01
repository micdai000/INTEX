import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ellaLogo from "@/assets/ella-logo.png";
import { Sparkles, Users, Calendar, TrendingUp } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-ella-cream">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={ellaLogo} alt="Ella Rises Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-ella-charcoal">Ella Rises</h1>
                <p className="text-xs text-muted-foreground">Empowering Women in STEAM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Empowering the rising generation</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-ella-charcoal leading-tight">
            Inviting Young Women to{" "}
            <span className="text-primary">Pursue Higher Education</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering women through mentoring, creative workshops, and leadership opportunities 
            that build both technical competence and artistic confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 shadow-soft">
                Join Our Programs
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border/40 hover:shadow-soft transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-ella-charcoal">Participant Management</h3>
            <p className="text-muted-foreground">
              Track participant progress, milestones, and engagement across all programs.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-card border border-border/40 hover:shadow-soft transition-shadow">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-ella-charcoal">Event Coordination</h3>
            <p className="text-muted-foreground">
              Organize workshops, STEAM programs, and cultural events with ease.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-card border border-border/40 hover:shadow-soft transition-shadow">
            <div className="h-12 w-12 rounded-full bg-ella-pink/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-ella-pink" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-ella-charcoal">Impact Analytics</h3>
            <p className="text-muted-foreground">
              Measure program effectiveness through surveys, milestones, and success metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-ella-charcoal">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ella Rises empowers the rising generation of women to pursue higher education 
              and embrace their heritage through mentoring, creative workshops, and leadership 
              opportunities that build both technical competence and artistic confidence.
            </p>
            <div className="pt-4">
              <Link to="/register">
                <Button size="lg" variant="default">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={ellaLogo} alt="Ella Rises Logo" className="h-10 w-10" />
              <div>
                <p className="font-semibold text-ella-charcoal">Ella Rises</p>
                <p className="text-sm text-muted-foreground">© 2025 All rights reserved</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Programs</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
