import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ellaLogo from "@/assets/ella-logo.png";
import { Heart, Target, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-ella-cream">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={ellaLogo} alt="Ella Rises Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-ella-charcoal">Ella Rises</h1>
                <p className="text-xs text-muted-foreground">Empowering Women in STEAM</p>
              </div>
            </Link>
            <Link to="/">
              <Button variant="ghost">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-ella-charcoal">About Ella Rises</h1>
            <p className="text-xl text-muted-foreground">
              Empowering the rising generation of women through education and cultural connection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                Inviting young women to pursue higher education and embrace their heritage
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Our Approach</h3>
              <p className="text-sm text-muted-foreground">
                Culturally rooted programs combining STEAM education with artistic expression
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-ella-pink/10 flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-ella-pink" />
              </div>
              <h3 className="font-semibold text-lg">Our Community</h3>
              <p className="text-sm text-muted-foreground">
                Building confidence through mentoring, workshops, and leadership opportunities
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-ella-charcoal mb-4">What We Do</h2>
            <p className="text-muted-foreground mb-6">
              Ella Rises aims to empower the rising generation of women to pursue higher education 
              and embrace their heritage through mentoring, creative workshops, and leadership 
              opportunities that build both technical competence and artistic confidence.
            </p>

            <h2 className="text-2xl font-bold text-ella-charcoal mb-4 mt-8">STEAM Programs</h2>
            <p className="text-muted-foreground mb-6">
              Leaders work together with partnerships at UVU and BYU to provide STEAM (science, 
              technology, engineering, arts, and math) programs to encourage women to pursue their 
              interests in these fields. Our programs combine technical skill-building with cultural 
              awareness and artistic expression.
            </p>

            <h2 className="text-2xl font-bold text-ella-charcoal mb-4 mt-8">Measuring Impact</h2>
            <p className="text-muted-foreground mb-6">
              We use post-event surveys to measure program effectiveness, tracking satisfaction, 
              usefulness, and recommendation scores. We also monitor milestones achieved by 
              participants - key indicators of long-term success including STEAM field major 
              graduation rates and post-college job placement.
            </p>
          </div>

          <div className="text-center space-y-4 pt-8">
            <h2 className="text-2xl font-bold text-ella-charcoal">Ready to Join?</h2>
            <p className="text-muted-foreground mb-6">
              Become part of a community dedicated to empowering the next generation of women leaders.
            </p>
            <Link to="/register">
              <Button size="lg">Get Started Today</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
