
export interface BoxProps {
    label: string;
    queCompleted: number;
    totalQues: number;
}
const Box = ({label, queCompleted, totalQues, }: BoxProps) => {
    return (
        <main className="bg-white w-52 h-40 rounded-xl p-5 gap-2 flex flex-col justify-start items-center">
            <text className="font-semibold text-gray-600">{label}</text>
            <div className="text-5xl font-extrabold">{queCompleted}/{totalQues}</div>
        </main>
    );
}

export default Box;