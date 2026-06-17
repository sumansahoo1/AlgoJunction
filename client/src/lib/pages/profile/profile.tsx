import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

import { Header } from '@/lib/component/Header';
import SubmissionComponent from './components/SubmissionComponent';
import ContributionGraph from './components/ContributionGraph';
import ProgressStats from './components/ProgressStats';
import { toast } from 'sonner';

const ProfilePage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [submissionGraphData, setSubmissionGraphData] = useState<{ date: string; count: number }[] | null>(null);
    const [submissions, setSubmissions] = useState<{ quesName: string; submissionTime: string; status: string }[]>([]);
    const [solvedques, setSolvedQues] = useState(0);
    const [totalques, setTotalQues] = useState(0);

    useEffect(() => {

        if (localStorage.getItem("token") == null || localStorage.getItem("username") == null || localStorage.getItem("email") == null || localStorage.getItem("photoURL") == null) {
            navigate('/signin', { replace: true });
        }

        async function fetchQuestions() {
            try {
                setLoading(true);
                const queryParams = {
                    username: localStorage.getItem("username"),
                    email: localStorage.getItem("email"),
                };

                const url = new URL(import.meta.env.VITE_BACKEND_URL + "/profile");
                (Object.keys(queryParams) as Array<keyof typeof queryParams>).forEach(key => url.searchParams.append(key, queryParams[key]?.toString() ?? ""));
                const response = await axios.get(url.toString());
                const data = response.data;

                const dateCounts = data.dates.reduce((acc: { [key: string]: number }, date: string) => {
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});

                const newValues = Object.entries(dateCounts).map(([date, count]) => ({ date, count: Number(count) }));

                setSubmissionGraphData(newValues);

                setSubmissions(data.submissions);

                setSolvedQues(data.solvedques);
                setTotalQues(data.totalques);

            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    toast.error('Too many requests. Please try again later.');
                } else {
                    console.log("Error fetching");
                    console.error(error);
                }
            }
            finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [navigate]);

    return (
        <>
            <Header />
            {loading ? (
                <main className="w-screen h-full min-h-screen flex">
                    <div className='flex flex-col items-center py-10 gap-2 w-1/4'>
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-1/2" />
                    </div>
                    <div className='flex flex-col gap-2 py-10 w-3/4'>
                        <Skeleton className="h-32 w-60" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </main>
            ) : (
                !localStorage.getItem("username") ? null :
                    <main className="w-screen h-full min-h-screen flex">
                        <div className='flex flex-col items-center py-10 gap-2 w-1/4'>
                            <Avatar className="h-24 w-24 text-2xl">
                                <AvatarImage src={localStorage.getItem("photoURL") ?? ""} />
                                <AvatarFallback>{(localStorage.getItem("username") ?? "U")[0]}</AvatarFallback>
                            </Avatar>
                            <p className='text-2xl font-bold'>{JSON.parse(localStorage.getItem('username') ?? "").toString()}</p>
                            <Button variant="destructive" className="w-1/2"
                                onClick={() => {
                                    localStorage.removeItem("username");
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("email");
                                    localStorage.removeItem("photoURL");
                                    navigate("/signin", { replace: true });
                                }}>
                                Logout
                            </Button>
                        </div>
                        <div className='flex flex-col gap-2 py-10 w-3/4'>

                            <Card className="w-60 shadow-md">
                                <CardContent className="p-4">
                                    <ProgressStats solved={solvedques} total={totalques} />
                                </CardContent>
                            </Card>

                            <div className='flex justify-start'>
                                {submissionGraphData && <ContributionGraph value={submissionGraphData} />}
                            </div>
                            <div className='flex flex-col gap-2 '>
                                <p className='text-lg font-bold'>Submissions</p>
                                <div className='flex flex-col gap-2 pr-4'>
                                    {submissions.length > 0 ? (
                                        submissions
                                            .sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime())
                                            .map((item, index) => {
                                                return <SubmissionComponent key={index} description={item.quesName} date={item.submissionTime} status={item.status} />
                                            })
                                    ) : (
                                        <p className='text-slate-500 dark:text-slate-400'>No submissions yet</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </main>
            )}
        </>
    );
};

export default ProfilePage;
