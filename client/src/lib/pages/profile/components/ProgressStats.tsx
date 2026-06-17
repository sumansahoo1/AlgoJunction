import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Check } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProgressStatsProps {
    solved: number;
    total: number;
}

const ProgressStats = ({ solved, total }: ProgressStatsProps) => {
    const remaining = total - solved;

    const data = {
        datasets: [{
            data: [solved, remaining],
            backgroundColor: [
                '#4ade80',
                '#facc15',
            ],
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }],
    };

    const options = {
        cutout: '80%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
    };

    return (
        <div className='flex flex-col place-content-center'>
            <div className="relative w-32 h-32 mx-auto">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-gray-800 dark:text-slate-100">{solved}</span>
                    <span className="text-l text-gray-500 dark:text-slate-400">/{total}</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className="text-green-400 flex items-center justify-center">
                    <Check size={20} />
                    Solved
                </p>
                <p className="text-yellow-400 flex items-center justify-center">
                    <Check size={20} />
                    Remaining
                </p>

            </div>
        </div>
    );
};

export default ProgressStats;