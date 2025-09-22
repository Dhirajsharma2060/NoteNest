import { DashboardLayout } from '@/components/DashboardLayout';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

const API_BASE_URL = "https://notenest-backend-epgq.onrender.com";

export default function ChildDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    folder: '',
    is_checklist: false,
  });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('child_user') || '{}');
  const userId = user.id;

  // Fetch notes from backend
  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/notes/?owner_id=${userId}`)
        .then(res => res.json())
        .then(setNotes)
        .catch(() => setNotes([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchNotes = async () => {
    try {
      console.log('Fetching notes...');
      const response = await fetch(`${API_BASE_URL}/notes/?owner_id=${userId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notes data:', data);
        setNotes(data);
      } else {
        console.error('Failed to fetch notes');
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  // Create or update note
  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      owner_id: userId, // Use the actual child ID
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (editingNote) {
        // Update existing note
        const response = await fetch(`${API_BASE_URL}/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedNote = await response.json();
          setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
          setEditingNote(null);
          setShowForm(false);
          resetForm();
        } else {
          alert('Failed to update note');
        }
      } else {
        // Create new note
        const response = await fetch(`${API_BASE_URL}/notes/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const newNote = await response.json();
          setNotes([newNote, ...notes]);
          setShowForm(false);
          resetForm();
        } else {
          alert('Failed to create note');
        }
      }
    } catch (error) {
      console.error('Error submitting note:', error);
      alert('Error submitting note');
    }
  };

  // Edit note
  const handleEditNote = (note) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      tags: (note.tags || []).join(', '),
      folder: note.folder || '',
      is_checklist: note.is_checklist,
    });
    setShowForm(true);
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== id));
      } else {
        alert('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  const resetForm = () => {
    setForm({ title: '', content: '', tags: '', folder: '', is_checklist: false });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
    resetForm();
  };

  // Get user info from localStorage
  const userName = user.name || 'User';
  const role = user.role || 'child';

  // derive folders and tags from notes
  const folders = Array.from(
    notes.reduce((m, n) => {
      const key = n.folder || 'All Notes';
      m.set(key, (m.get(key) || 0) + 1);
      return m;
    }, new Map<string, number>())
  ).map(([name, count]) => ({ name, count }));

  const tags = Array.from(
    notes.reduce((s, n) => {
      (n.tags || []).forEach((t) => s.add(t));
      return s;
    }, new Set<string>())
  );

  if (loading) return <Loader />;

  return (
    <DashboardLayout
      role={role}
      userName={userName}
      folders={folders}
      tags={tags}
      onNewNote={() => setShowForm(true)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              My Notes 🐣
            </h1>
            <p className="text-muted-foreground">
              You have {notes.length} notes in your nest
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button className="btn-ghost-nest">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            <div className="flex rounded-xl border border-border bg-white/70 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Note Creation/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmitNote} className="bg-white p-6 rounded-xl shadow space-y-4">
            <h3 className="text-lg font-heading font-semibold">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            
            <input
              className="input-nest w-full"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            
            <textarea
              className="input-nest w-full h-32"
              placeholder="Content"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              required
            />
            
            <input
              className="input-nest w-full"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
            
            <input
              className="input-nest w-full"
              placeholder="Folder"
              value={form.folder}
              onChange={e => setForm(f => ({ ...f, folder: e.target.value }))}
            />
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.is_checklist}
                onChange={e => setForm(f => ({ ...f, is_checklist: e.target.checked }))}
              />
              <span>Checklist</span>
            </label>
            
            <div className="flex space-x-2">
              <Button type="submit" className="btn-primary">
                {editingNote ? 'Update' : 'Create'}
              </Button>
              <Button type="button" className="btn-ghost-nest" onClick={handleCancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Notes Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {notes.map((note) => (
            <div key={note.id} className="relative group">
              <NoteCard
                title={note.title}
                content={note.content}
                type={note.is_checklist ? 'checklist' : 'note'}
                tags={note.tags || []}
                date={new Date(note.created_at).toLocaleDateString()}
                color="yellow"
                className="cursor-pointer hover:scale-105 transition-transform"
                onEdit={() => handleEditNote(note)}        // pass handler
                onDelete={() => handleDeleteNote(note.id)} // pass handler
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notes.length === 0 && !showForm && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-lighter to-secondary-lighter rounded-full flex items-center justify-center">
              <div className="text-6xl">🐣</div>
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
              Your nest is empty!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start creating your first note and watch your ideas grow like a baby bird learning to fly.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}