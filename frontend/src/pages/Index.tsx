import { Link } from 'react-router-dom';
import { ArrowRight, Users, User, Heart, Star, Shield } from 'lucide-react';
import nestnoteLogo from '@/assets/nestnote-logo.png';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-background to-secondary-lighter">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-secondary/20 rounded-full blur-xl float-animation"></div>
      <div className="absolute top-40 right-32 w-12 h-12 bg-accent/20 rounded-full blur-xl float-animation" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-32 w-20 h-20 bg-primary/20 rounded-full blur-xl float-animation" style={{ animationDelay: '2s' }}></div>
      
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={nestnoteLogo} alt="NoteNest" className="w-12 h-12" />
            <span className="text-2xl font-heading font-bold text-foreground">NoteNest</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/signin">
              <Button className="btn-ghost-nest">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="btn-primary">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <img 
            src={nestnoteLogo} 
            alt="NoteNest Logo" 
            className="w-32 h-32 mx-auto mb-8 bounce-gentle"
          />
          
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Where Ideas Take Flight 🐣
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A safe, playful space for children to capture their thoughts while giving parents 
            peace of mind. Watch creativity soar in your family's digital nest.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/signup">
              <Button className="btn-primary text-lg px-8 py-4">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button className="btn-secondary text-lg px-8 py-4">
                Welcome Back
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Built for Families
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            NoteNest grows with your family, providing age-appropriate tools and 
            parental oversight without compromising creativity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* For Children */}
          <div className="note-card-child p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-lighter rounded-xl mr-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground">For Children</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-secondary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Colorful & Fun</h4>
                  <p className="text-muted-foreground">Bright sticky notes and playful animations make writing enjoyable</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Easy Organization</h4>
                  <p className="text-muted-foreground">Drag & drop notes into folders with simple, intuitive controls</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Safe Space</h4>
                  <p className="text-muted-foreground">Private environment designed with child safety in mind</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Parents */}
          <div className="note-card p-8 bg-gradient-to-br from-accent-lighter to-accent-light/50">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-accent-lighter rounded-xl mr-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground">For Parents</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-secondary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Monitor Progress</h4>
                  <p className="text-muted-foreground">Read-only access to track your child's learning journey</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Insights & Analytics</h4>
                  <p className="text-muted-foreground">Understand writing patterns and creative development</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Peace of Mind</h4>
                  <p className="text-muted-foreground">Know your child is learning in a secure environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto note-card-yellow p-12">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Ready to Build Your Nest? 🏠
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of families already using NoteNest to nurture creativity and learning.
          </p>
          <Link to="/signup">
            <Button className="btn-primary text-lg px-8 py-4">
              Create Your Family Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border/50">
        <div className="flex items-center justify-center text-muted-foreground">
          <img src={nestnoteLogo} alt="NoteNest" className="w-6 h-6 mr-2" />
          <span>© 2024 NoteNest. Made with love for families.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
