import { ReactNode } from 'react';
import nestnoteLogo from '@/assets/nestnote-logo.png';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-background to-secondary-lighter flex items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-secondary/20 rounded-full blur-xl float-animation"></div>
      <div className="absolute top-40 right-32 w-12 h-12 bg-accent/20 rounded-full blur-xl float-animation" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-32 w-20 h-20 bg-primary/20 rounded-full blur-xl float-animation" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={nestnoteLogo} 
            alt="NoteNest Logo" 
            className="w-24 h-24 mx-auto mb-4 bounce-gentle"
          />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-lg">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="note-card backdrop-blur-sm border-white/20">
          {children}
        </div>
      </div>
    </div>
  );
};