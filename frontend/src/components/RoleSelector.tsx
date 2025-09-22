import { User, Users } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'child' | 'parent' | null;
  onRoleSelect: (role: 'child' | 'parent') => void;
}

export const RoleSelector = ({ selectedRole, onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-center text-foreground">
        I am a...
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => onRoleSelect('child')}
          className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedRole === 'child'
              ? 'border-primary bg-primary-lighter/50 shadow-soft'
              : 'border-border hover:border-primary/50 hover:shadow-soft'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              selectedRole === 'child' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-foreground">Child</h4>
              <p className="text-sm text-muted-foreground">Create and organize your notes</p>
            </div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onRoleSelect('parent')}
          className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedRole === 'parent'
              ? 'border-accent bg-accent-lighter/50 shadow-soft'
              : 'border-border hover:border-accent/50 hover:shadow-soft'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              selectedRole === 'parent' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-foreground">Parent</h4>
              <p className="text-sm text-muted-foreground">View and monitor your child's notes</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};