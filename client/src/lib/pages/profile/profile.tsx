import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Avatar } from '@radix-ui/themes';
import { Card, CardContent } from '@/components/ui/card';

import { Header } from '@/lib/component/Header';
import SubmissionComponent from './components/SubmissionComponent';
import ContributionGraph from './components/ContributionGraph';
import ProgressStats from './components/ProgressStats';

const ProfilePage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState(true);

    const [submissionGraphData, setSubmissionGraphData] = React.useState<{ date: string; count: number }[] | null>(null);
    const [submissions, setSubmissions] = React.useState<{ quesName: string; submissionTime: string }[]>([]);
    const [solvedques, setSolvedQues] = React.useState(0);
    const [totalques, setTotalQues] = React.useState(0);

    useEffect(() => {

        if (localStorage.getItem("token") == null || localStorage.getItem("username") == null || localStorage.getItem("email") == null || localStorage.getItem("photoURL") == null) {
            navigate('/signin', { replace: true });
        }

        async function fetchQuestions() {
            try {
                setLoading(true);
                // Define your query parameters
                const queryParams = {
                    username: localStorage.getItem("username"),
                    email: localStorage.getItem("email"),
                };

                // Construct the URL with query parameters
                const url = new URL(import.meta.env.VITE_BACKEND_URL + "/profile");
                (Object.keys(queryParams) as Array<keyof typeof queryParams>).forEach(key => url.searchParams.append(key, queryParams[key]?.toString() ?? ""));
                const response = await axios.get(url.toString());
                // console.log(response.data);
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
                    alert('Too many requests. Please try again later.');
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
            {loading ? <div className="w-screen h-screen flex justify-center items-center">Loading...</div> :
                (!localStorage.getItem("username")) ? null :
                    <main className="w-screen h-full min-h-screen flex bg-gray-100">
                        <div className='flex flex-col items-center py-10 gap-2 w-1/4'>
                            <Avatar src={localStorage.getItem("photoURL") ?? ""} radius="full" size="6" fallback="skdfn" />
                            <text className='text-2xl font-bold'>{JSON.parse(localStorage.getItem('username') ?? "").toString()}</text>
                            <div className="cursor-pointer font-semibold p-2 rounded-md w-1/2 text-center bg-red-400 text-white hover:bg-red-500 hover:shadow-md"
                                onClick={() => {
                                    console.log("Sign Out");
                                    localStorage.removeItem("username");
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("email");
                                    localStorage.removeItem("photoURL");
                                    navigate("/signin", { replace: true });
                                }}> Logout</div>
                        </div>
                        <div className='flex flex-col gap-2 py-10 w-3/4'>

                            <Card className="w-60 bg-white shadow-md">
                                <CardContent className="p-4">
                                    <ProgressStats solved={solvedques} total={totalques} />
                                    {/* <Box label="Solved" queCompleted={solvedques} totalQues={totalques} />
                                <Box label="Medium" queCompleted={3} totalQues={8} />
                                <Box label="Hard" queCompleted={2} totalQues={5} /> */}
                                </CardContent>
                            </Card>

                            <div className='flex justify-start'>
                                {submissionGraphData && <ContributionGraph value={submissionGraphData} />}
                            </div>
                            <div className='flex flex-col gap-2 '>
                                <text className='text-lg font-bold'>Submissions</text>
                                <div className='flex flex-col gap-2 pr-4'>
                                    {submissions.length > 0 ? (
                                        submissions
                                            .sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime())
                                            .map((item, index) => {
                                                return <SubmissionComponent key={index} description={item.quesName} date={item.submissionTime} />
                                            })
                                    ) : (
                                        <text className='text-gray-400'>No submissions yet</text>
                                    )}
                                </div>
                            </div>

                        </div>
                    </main>}
        </>
    );
};

export default ProfilePage;