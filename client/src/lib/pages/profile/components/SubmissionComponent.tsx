export interface SubmissionComponentProps {
    description: string;
    date: string;
    status: string;
}

const calculateDaysinWords = (date: string) => {
    const today = new Date();
    const submissionDate = new Date(date);
    const diff = today.getTime() - submissionDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}


const SubmissionComponent = ({ description, date, status }: SubmissionComponentProps) => {
    const isAccepted = status === 'accepted';
    return (
        <div className="bg-white dark:bg-slate-950 rounded-md shadow-sm p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isAccepted ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                    {isAccepted ? 'Accepted' : 'Failed'}
                </span>
                <div className="text-sm font-medium">{description}</div>
            </div>
            <div className="text-sm">{calculateDaysinWords(date)}</div>
        </div>
    );
}

export default SubmissionComponent;