import { useEffect, useState } from 'react';
import { Header } from '../../component/Header';
import axios from 'axios';
import { Question } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
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

const HomePage = () => {

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const response = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + "/questionlist"
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
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="w-28">Difficulty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : questions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-slate-500 dark:text-slate-400 py-8">
                                        No problems available yet.
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
