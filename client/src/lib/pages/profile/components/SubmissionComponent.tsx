export interface SubmissionComponentProps {
    description: string;
    date: string;
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


const SubmissionComponent = ({ description, date}: SubmissionComponentProps) => {
    return (
        <div className="bg-white rounded-md shadow-sm p-5 flex justify-between items-center">
            <div className="text-sm font-medium">{description}</div>
            <div className="text-sm">{calculateDaysinWords(date)}</div>
        </div>
    );
}

export default SubmissionComponent;