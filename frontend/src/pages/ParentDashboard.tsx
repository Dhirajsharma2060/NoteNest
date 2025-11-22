import { DashboardLayout } from '@/components/DashboardLayout';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter, TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Loader from '@/components/Loader';
import { authenticatedFetch } from '@/lib/auth';
import { toast } from '@/components/ui/sonner'; // or '@/components/ui/toast' if you use that

// const API_BASE_URL = "https://notenest-backend-epgq.onrender.com";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function ParentDashboard() {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pollInterval, setPollInterval] = useState(60000); // Start with 60s
	const [errorCount, setErrorCount] = useState(0);
	const [showError, setShowError] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const pollingRef = useRef<NodeJS.Timeout | null>(null);
	
	const user = JSON.parse(localStorage.getItem('parent_user') || '{}');
	const userName = user.name || 'Parent';
	const role = user.role || 'parent';
	const childId = user.child_id;
	const childName = user.child_name || 'Your Child';

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;

		const fetchNotes = async () => {
			if (isPaused) return;

			try {
				setLoading(true);
				const response = await authenticatedFetch(`${API_BASE_URL}/notes/?owner_id=${childId}`);
				if (response.ok) {
					const data = await response.json();
					setNotes(Array.isArray(data) ? data : []);
					setErrorCount(0);
					setShowError(false);
					setPollInterval(60000);
				} else {
					setNotes([]);
					setErrorCount((c) => c + 1);
					setPollInterval((prev) => Math.min(prev * 2, 15 * 60000));
				}
			} catch (error) {
				setNotes([]);
				setErrorCount((c) => c + 1);
				setPollInterval((prev) => Math.min(prev * 2, 15 * 60000));
			} finally {
				setLoading(false);

				// Pause polling after 10 errors
				if (errorCount + 1 >= 10) {
					setIsPaused(true);
					toast({
						title: "Temporary Connection Issue",
						description: "We're having trouble updating your dashboard. We'll try again soon.",
						variant: "destructive",
					});
					timeoutId = setTimeout(() => {
						setIsPaused(false);
						setErrorCount(0);
						setPollInterval(15 * 60000); // Resume with max interval
						fetchNotes();
					}, 30 * 60000); // Pause for 30 minutes
				} else {
					timeoutId = setTimeout(fetchNotes, pollInterval);
				}
			}
		};

		if (childId && !isPaused) {
			fetchNotes();
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [childId, pollInterval, isPaused, errorCount]);

	useEffect(() => {
		if (errorCount >= 3 && !showError) {
			toast({
				title: "Connection Issue",
				description: "Unable to fetch notes. Please check your internet connection or try again later.",
				variant: "destructive",
			});
			setShowError(true);
		}
	}, [errorCount, showError]);

	// Dynamic stats
	const totalNotes = notes.length;
	const thisWeekNotes = notes.filter((n) => {
		const noteDate = new Date(n.created_at);
		const now = new Date();
		const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
		return noteDate >= weekAgo;
	}).length;
	const categories = Array.from(new Set(notes.map((n) => n.folder || 'Uncategorized')));

	// Dynamic insights (example: most active subject)
	const subjectCounts = notes.reduce((acc, n) => {
		const folder = n.folder || 'Uncategorized';
		acc[folder] = (acc[folder] || 0) + 1;
		return acc;
	}, {});
	const mostActiveSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

	// Calculate folders and tags from notes
	const folders = Array.from(
		notes.reduce((m, n) => {
			const key = n.folder || 'All Notes';
			m.set(key, (m.get(key) || 0) + 1);
			return m;
		}, new Map<string, number>())
	).map(([name, count]) => ({ name, count }));

	const tags = Array.from(
		notes.reduce((s, n) => {
			(n.tags || []).forEach((t: string) => s.add(t));
			return s;
		}, new Set<string>())
	);

	// Additional stats
	const avgNotesPerDay = (thisWeekNotes / 7).toFixed(1);

	const getWritingStreak = () => {
	  let streak = 0;
	  const today = new Date();
	  for (let i = 0; i < 30; i++) {
	    const checkDate = new Date(today);
	    checkDate.setDate(today.getDate() - i);
	    const hasNote = notes.some(note => {
	      const noteDate = new Date(note.created_at);
	      return noteDate.toDateString() === checkDate.toDateString();
	    });
	    if (hasNote) {
	      streak++;
	    } else {
	      break;
	    }
	  }
	  return streak;
	};
	const writingStreak = getWritingStreak();

	const tagCounts = notes.reduce((acc, n) => {
	  (n.tags || []).forEach(tag => {
	    acc[tag] = (acc[tag] || 0) + 1;
	  });
	  return acc;
	}, {});
	const mostUsedTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

	const longestNote = Math.max(...notes.map(n => n.content.split(' ').length), 0);

	const lastWeekNotes = notes.filter((n) => {
	  const noteDate = new Date(n.created_at);
	  const now = new Date();
	  const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
	  const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
	  return noteDate >= twoWeeksAgo && noteDate < oneWeekAgo;
	}).length;
	const weeklyGrowth = lastWeekNotes > 0 ? Math.round(((thisWeekNotes - lastWeekNotes) / lastWeekNotes) * 100) : 0;

	const dailyActivity = Array.from({ length: 7 }, (_, i) => {
	  const checkDate = new Date();
	  checkDate.setDate(checkDate.getDate() - (6 - i));
	  return notes.filter(note => {
	    const noteDate = new Date(note.created_at);
	    return noteDate.toDateString() === checkDate.toDateString();
	  }).length;
	});

	const getEncouragingMessage = () => {
	  const messages = [
	    `${childName} wrote ${thisWeekNotes} notes this week! Great creativity! 🎨`,
	    `Keep up the wonderful writing habit! ${writingStreak} days in a row! ✨`,
	    `${childName} is exploring ${categories.length} different subjects. Amazing curiosity! 🌟`,
	    `Your child's longest note this week was ${longestNote} words. Impressive! 📝`,
	    `${childName} is building great writing skills with consistent practice! 💪`
	  ];
	  return messages[Math.floor(Math.random() * messages.length)];
	};

	if (loading) return <Loader />;

	return (
		<DashboardLayout
			role={role}
			userName={userName}
			folders={folders}
			tags={tags}
			// No onNewNote prop for parent
		>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-heading font-bold text-foreground mb-2">
							{childName}'s Notes 👨‍👩‍👧‍👦
						</h1>
						<p className="text-muted-foreground">
							Monitoring your child's learning journey
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
										? 'bg-accent text-white'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<Grid className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded-lg transition-colors ${
									viewMode === 'list'
										? 'bg-accent text-white'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<List className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Notes</p>
								<p className="text-2xl font-heading font-bold text-foreground">
									{totalNotes}
								</p>
							</div>
							<div className="p-3 bg-primary-lighter rounded-xl">
								<TrendingUp className="w-6 h-6 text-primary" />
							</div>
						</div>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">This Week</p>
								<p className="text-2xl font-heading font-bold text-foreground">
									{thisWeekNotes}
								</p>
							</div>
							<div className="p-3 bg-secondary-lighter rounded-xl">
								<Calendar className="w-6 h-6 text-secondary-foreground" />
							</div>
						</div>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Categories</p>
								<p className="text-2xl font-heading font-bold text-foreground">
									{categories.length}
								</p>
							</div>
							<div className="p-3 bg-accent-lighter rounded-xl">
								<Filter className="w-6 h-6 text-accent" />
							</div>
						</div>
					</div>
				</div>

				{/* Notes Grid */}
				<div
					className={`grid gap-6 ${
						viewMode === 'grid'
							? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
							: 'grid-cols-1'
					}`}
				>
					{notes.map((note) => (
						<NoteCard
							key={note.id}
							title={note.title}
							content={note.content}
							type={note.is_checklist ? 'checklist' : 'note'}
							tags={note.tags || []}
							date={new Date(note.created_at).toLocaleDateString()}
							color="yellow"
							isReadOnly={true}
							className="cursor-pointer hover:scale-105 transition-transform"
						/>
					))}
				</div>

				{/* Insights Section */}
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
					<h3 className="text-lg font-heading font-semibold text-foreground mb-4">
						Weekly Insights
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-primary-lighter/50 rounded-xl">
							<span className="text-sm text-foreground">
								Most active subject
							</span>
							<span className="font-medium text-primary">
								{mostActiveSubject}
							</span>
						</div>
						{/* Add more dynamic insights here if needed */}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}