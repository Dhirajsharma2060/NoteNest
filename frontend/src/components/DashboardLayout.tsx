import { ReactNode, useState } from 'react';
import { Menu, X, Plus, Search, Bell, Settings, User } from 'lucide-react';
import nestnoteLogo from '@/assets/nestnote-logo.png';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth'; // added import

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'child' | 'parent';
  userName?: string;
  // new props
  folders?: { name: string; count?: number }[];
  tags?: string[];
  onNewNote?: () => void; // add onNewNote prop
}

export const DashboardLayout = ({ children, role, userName = 'User', folders = [], tags = [], onNewNote }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    // window.location.href = '/'; // Not needed if logout already redirects
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-lighter/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <img src={nestnoteLogo} alt="NoteNest" className="w-8 h-8" />
              <h1 className="text-xl font-heading font-bold text-foreground">
                NoteNest
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2 rounded-xl border border-border bg-white/70 focus:ring-2 focus:ring-primary focus:border-transparent"
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

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden`}>
          <div className="h-[calc(100vh-5rem)] bg-white/60 backdrop-blur-sm border-r border-border/50 p-6">
            {/* Replace hardcoded left pane with dynamic content */}
            <div className="space-y-6">
              {role === 'child' && (
                <Button className="btn-primary w-full" onClick={onNewNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              )}

              {/* Folders */}
              {folders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-foreground">Folders</h3>
                  <div className="space-y-2">
                    {folders.map((f) => (
                      <div key={f.name} className="p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded bg-primary-light" />
                          <span className="font-medium">{f.name}</span>
                          {typeof f.count === 'number' && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">{f.count}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <button key={t} className="px-3 py-1 bg-primary-lighter text-primary text-sm rounded-full cursor-pointer hover:bg-primary-light transition-colors">
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};