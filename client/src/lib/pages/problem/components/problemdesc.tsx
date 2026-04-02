import { Badge } from "@/components/ui/badge"
import { useSelector } from 'react-redux'
import { RootState } from "@/store";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProgressComponent } from "@/lib/component/progress";
import { Example } from "@/lib/utils";


export const ProblemDesc = () => {

    const { id } = useParams();

    const questionlist = useSelector((state: RootState) => state.queslist.value);
    const question = questionlist.find((question) => question.id === Number(id));

    const [loading, setLoading] = useState(true);
    const [datafetched] = useState(false);



    useEffect(() => {
        if (!question) {
            setLoading(true);
        }
        else {
            setLoading(false);
        }
    }
        , [question])

    return (
        <>
            {loading ? (
                <ProgressComponent datafetched={datafetched} />
            ) : (
                <div className="grow p-5 border-[1px] border-black rounded-md m-2 mb-0 overflow-auto">
                    <h1 className="scroll-m-20 text-xl font-bold tracking-tight">{question?.qName}</h1>
                    <div className="scroll-m-20 text-sm font-semibold tracking-tight">
                        <Badge className='cursor-default'>{question?.qDifficulty}</Badge>
                    </div>
                    <p className="leading-7 [&:not(:first-child)]:mt-6">{question?.qDescription}</p>
                    <h2 className="mt-10 scroll-m-20 border-b pb-2 text-lg font-semibold tracking-tight transition-colors first:mt-0">
                        Examples
                    </h2>

                    {question?.examples.map((example: Example, index: number) => (
                        <div key={index}>
                            <p>Example {index + 1}</p>
                            <blockquote className="my-2 border-l-2 pl-6">
                                <h3 className="scroll-m-20 font-semibold tracking-tight">Input:</h3>
                                <p>{example.input}</p>
                                <h3 className="scroll-m-20 font-semibold tracking-tight">Output:</h3>
                                <p>{example.output}</p>
                            </blockquote>
                        </div>
                    ))}
                    <h2 className="mt-10 scroll-m-20 border-b pb-2 text-lg font-semibold tracking-tight transition-colors first:mt-0">
                        Constraints
                    </h2>
                    <p className="">{question?.constraints}</p>

                </div>
            )
            }
        </>
    );
}

