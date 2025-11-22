import { ReactNode, useState, useCallback, useMemo } from 'react';
import { Menu, X, Plus, Search, Bell, Settings, User } from 'lucide-react';
import nestnoteLogo from '@/assets/nestnote-logo.png';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'child' | 'parent';
  userName?: string;
  folders?: { name: string; count?: number }[];
  tags?: string[];
  onNewNote?: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>; // Add this prop
}

export const DashboardLayout = ({ 
  children, 
  role, 
  userName = 'User', 
  folders = [], 
  tags = [], 
  onNewNote,
  scrollContainerRef // Add this prop
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Memoize expensive operations
  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Memoize the folders rendering to prevent unnecessary re-renders
  const foldersSection = useMemo(() => {
    if (folders.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Folders</h3>
        <div className="space-y-2">
          {folders.map((f) => (
            <div 
              key={f.name} 
              className="p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors will-change-auto"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded bg-primary-light flex-shrink-0" />
                <span className="font-medium truncate">{f.name}</span>
                {typeof f.count === 'number' && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto flex-shrink-0">
                    {f.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [folders]);

  // Memoize the tags rendering
  const tagsSection = useMemo(() => {
    if (tags.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button 
              key={t} 
              className="px-3 py-1 bg-primary-lighter text-primary text-sm rounded-full cursor-pointer hover:bg-primary-light transition-colors will-change-auto"
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
    );
  }, [tags]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-lighter/20">
      {/* Header - Fixed at top */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors will-change-auto"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src={nestnoteLogo} 
                alt="NoteNest" 
                className="w-8 h-8" 
                loading="eager"
                decoding="sync"
              />
              <h1 className="text-xl font-heading font-bold text-foreground">
                NoteNest
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2 rounded-xl border border-border bg-white/70 focus:ring-2 focus:ring-primary focus:border-transparent will-change-auto"
              />
            </div>
            
            <Button size="sm" className="btn-ghost-nest">
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button size="sm" className="btn-ghost-nest" onClick={handleLogout}>
              Logout
            </Button>

            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/70 border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userName}</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                role === 'child' 
                  ? 'bg-primary-lighter text-primary' 
                  : 'bg-accent-lighter text-accent'
              }`}>
                {role}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex h-[calc(100vh-5rem)]">
        
        {/* Sidebar - Fixed */}
        <aside className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="h-full bg-white/60 backdrop-blur-sm border-r border-border/50">
            <div className="h-full overflow-y-auto p-6 space-y-6">
              {role === 'child' && (
                <Button 
                  className="btn-primary w-full will-change-auto" 
                  onClick={onNewNote}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              )}

              {foldersSection}
              {tagsSection}
            </div>
          </div>
        </aside>

        {/* Main Content - This is where the scroll happens */}
        <main className="flex-1 overflow-hidden">
          <div 
            ref={scrollContainerRef} // Apply the ref here
            className="h-full overflow-y-auto"
            style={{ 
              scrollBehavior: 'smooth'
            }}
          >
            <div className="p-6 min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};