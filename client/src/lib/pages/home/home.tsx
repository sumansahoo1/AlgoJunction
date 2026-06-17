import React, { useEffect, useState } from 'react';
import { Header } from '../../component/Header';
import axios from 'axios';
import { Question } from '@/lib/utils';
import { Table } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {

    const [questions, setQuestions] = useState<Question[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + "/questionlist"
                );
                setQuestions(response.data);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    alert('Too many requests. Please try again later.');
                } else {
                    console.log("error fetching");
                    console.error(error);
                }
            }
        }
        fetchQuestions();
    }, []);

    const handleCellClick = (id: number) => {
        navigate(`/problem/${id}`);
    }

    return (
        <div>
            <Header />
            <main className='p-10'>
                <Table.Root variant="surface" className=''>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Sl No</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Difficulty</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {questions.map((question) => (
                            <Table.Row key={question.id}>
                                <Table.RowHeaderCell>{question.id}</Table.RowHeaderCell>
                                <Table.Cell ><p className='cursor-pointer w-fit max-w-96 font-medium hover:underline hover:text-orange-500 truncate' onClick={() => handleCellClick(question.id)}>{question.qName}</p></Table.Cell>
                                <Table.Cell>
                                    <div className={`cursor-default rounded-md w-fit px-2 ${question.qDifficulty.toLowerCase() === 'easy' ? 'bg-green-100 text-green-600' :
                                        question.qDifficulty.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {question.qDifficulty}
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}

                    </Table.Body>
                </Table.Root>
            </main>
        </div>
    );
};

export default HomePage;
