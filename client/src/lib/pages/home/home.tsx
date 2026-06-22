import { useEffect, useState } from 'react';
import { Header } from '../../component/Header';
import axios from 'axios';
import { Question } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const HomePage = () => {

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());

    // URL search params — the source of truth for search/filter state.
    // Enables sharing/bookmarking search results and browser back/forward.
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get('search') || '';
    const urlDifficulty = searchParams.get('difficulty') || 'all';

    // Local input state for instant typing feel (debounced before hitting URL/API)
    const [searchTerm, setSearchTerm] = useState(urlSearch);

    const navigate = useNavigate();

    // Sync local input to URL after 300ms of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (searchTerm.trim()) {
                    next.set('search', searchTerm.trim());
                } else {
                    next.delete('search');
                }
                return next;
            }, { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, setSearchParams]);

    // When the URL search param is cleared externally (e.g. Clear button),
    // keep the local input in sync
    useEffect(() => {
        if (!urlSearch) {
            setSearchTerm('');
        }
    }, [urlSearch]);

    // Fetch questions whenever URL params change (the actual API trigger)
    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (urlSearch) params.set('search', urlSearch);
                if (urlDifficulty !== 'all') params.set('difficulty', urlDifficulty);
                const queryString = params.toString();
                const response = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + "/questionlist"
                    + (queryString ? `?${queryString}` : '')
                );
                setQuestions(response.data);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    toast.error('Too many requests. Please try again later.');
                } else {
                    toast.error('Failed to load problems');
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [urlSearch, urlDifficulty]);

    useEffect(() => {
        async function fetchSolvedQuestions() {
            const idToken = localStorage.getItem("idToken");
            if (!idToken) return;

            try {
                const response = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + "/questions/solved",
                    {
                        headers: {
                            Authorization: 'Bearer ' + idToken,
                        },
                    }
                );
                setSolvedIds(new Set(response.data.solvedIds));
            } catch (error) {
                if (!axios.isAxiosError(error) || error.response?.status !== 401) {
                    console.error('Failed to fetch solved questions:', error);
                }
            }
        }
        fetchSolvedQuestions();
    }, []);

    const difficultyStyles: Record<string, string> = {
        easy: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
        medium: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
        hard: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    };

    return (
        <div>
            <Header />
            <main className='p-6 md:p-10 max-w-4xl mx-auto'>
                <h2 className="text-2xl font-bold mb-6">Problems</h2>

                {/* Search bar + difficulty filter */}
                <div className="flex gap-3 items-center mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-8"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                            </button>
                        )}
                    </div>

                    <Select value={urlDifficulty} onValueChange={(value) => {
                        setSearchParams(prev => {
                            const next = new URLSearchParams(prev);
                            if (value === 'all') {
                                next.delete('difficulty');
                            } else {
                                next.set('difficulty', value);
                            }
                            return next;
                        }, { replace: true });
                    }}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>

                    {(urlSearch || urlDifficulty !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchParams({}, { replace: true });
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-sm text-slate-500 mb-2">
                        Showing {questions.length} {questions.length === 1 ? 'problem' : 'problems'}
                    </p>
                )}

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="w-28">Difficulty</TableHead>
                                <TableHead className="w-20">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    </TableRow>
                                ))
                            ) : questions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400 py-8">
                                        {urlSearch || urlDifficulty !== 'all'
                                            ? 'No problems match your search criteria.'
                                            : 'No problems available yet.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                questions.map((question) => (
                                    <TableRow
                                        key={question.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/problem/${question.id}`)}
                                    >
                                        <TableCell className="font-medium">{question.id}</TableCell>
                                        <TableCell className="font-medium hover:text-orange-500">
                                            {question.qName}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyStyles[question.qDifficulty.toLowerCase()] ?? ''}`}>
                                                {question.qDifficulty}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {solvedIds.has(question.id) && (
                                                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950">
                                                    Solved
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
