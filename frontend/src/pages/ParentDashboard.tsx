import { DashboardLayout } from '@/components/DashboardLayout';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter, TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

const API_BASE_URL = "https://notenest-backend-epgq.onrender.com";

export default function ParentDashboard() {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	
	const user = JSON.parse(localStorage.getItem('parent_user') || '{}');
	const userName = user.name || 'Parent';
	const role = user.role || 'parent';
	const childId = user.child_id;
	const childName = user.child_name || 'Your Child';

	useEffect(() => {
		if (childId) {
			setLoading(true);
			fetch(`${API_BASE_URL}/notes/?owner_id=${childId}`)
				.then((res) => res.json())
				.then((data) => setNotes(data))
				.catch(() => setNotes([]))
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
		}
	}, [childId]);

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

	if (loading) return <Loader />;

	return (
		<DashboardLayout
			role={role}
			userName={userName}
			// folders/tags if you want to show them
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