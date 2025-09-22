import { ReactNode } from 'react';
import { Calendar, Tag, CheckSquare, FileText, MoreVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  title: string;
  content: string;
  type: 'note' | 'checklist';
  tags?: string[];
  date: string;
  color?: 'yellow' | 'green' | 'blue' | 'white';
  isReadOnly?: boolean;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const NoteCard = ({ 
  title, 
  content, 
  type, 
  tags = [], 
  date, 
  color = 'white', 
  isReadOnly = false,
  className = '',
  onEdit,
  onDelete,
}: NoteCardProps) => {
  const cardColorClass = {
    yellow: 'note-card-yellow',
    green: 'note-card-green', 
    blue: 'note-card-blue',
    white: 'note-card'
  }[color];

  return (
    <div className={`${cardColorClass} group ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {type === 'checklist' ? (
            <CheckSquare className="w-5 h-5 text-primary" />
          ) : (
            <FileText className="w-5 h-5 text-primary" />
          )}
          <h3 className="font-heading font-semibold text-foreground line-clamp-1">
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isReadOnly && (
            <div className="flex items-center px-2 py-1 bg-muted/50 rounded-full">
              <Eye className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Read Only</span>
            </div>
          )}

          {/* Dropdown menu trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="btn-ghost-nest p-2 h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {type === 'checklist' ? (
        <div className="space-y-2">
          {content.split('\n').slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary rounded bg-white"></div>
              <span className="text-sm text-foreground line-clamp-1">{item}</span>
            </div>
          ))}
          {content.split('\n').length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{content.split('\n').length - 3} more items
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-foreground line-clamp-3">
          {content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>

        {tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3 text-muted-foreground" />
            <div className="flex space-x-1">
              {tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-primary-lighter text-primary text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};