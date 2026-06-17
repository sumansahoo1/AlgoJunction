
export interface BoxProps {
    label: string;
    queCompleted: number;
    totalQues: number;
}
const Box = ({label, queCompleted, totalQues, }: BoxProps) => {
    return (
        <main className="bg-white dark:bg-slate-950 w-52 h-40 rounded-xl p-5 gap-2 flex flex-col justify-start items-center">
            <text className="font-semibold text-gray-600 dark:text-slate-400">{label}</text>
            <div className="text-5xl font-extrabold">{queCompleted}/{totalQues}</div>
        </main>
    );
}

export default Box;