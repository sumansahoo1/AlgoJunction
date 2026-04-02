import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { ProgressComponent } from "../../../component/progress";

import { useDispatch, useSelector } from 'react-redux'
import { addSubmission } from "@/lib/features/questions/questions";
import { RootState } from "@/store";
import { useParams } from "react-router-dom";
import axios from "axios";


export const Console = () => {


  const { id } = useParams();

  const questionlist = useSelector((state: RootState) => state.queslist.value);
  const question = questionlist.find((question) => question.id === Number(id));
  const dispatch = useDispatch();


  const [loading, setLoading] = useState(true);
  const [datafetched] = useState(false);



  useEffect(() => {
    if (!question) {
      setLoading(true);
    }
    else {
      setLoading(false);
    }
    setCaseno(0);
  }
    , [question])

  const smallHeight = "5%";
  const largeHeight = "500px";

  const [height, setHeight] = useState(smallHeight);
  const [caseno, setCaseno] = useState(0);
  const [running, setRunning] = useState(false);

  const toggleHeight = () => {
    setHeight(height === smallHeight ? largeHeight : smallHeight);
  };

  const handleRun = async () => {

    setRunning(true);
    setHeight(largeHeight);


    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/run-java",
        {
          javaCode: localStorage.getItem(String(id)) ?? question?.code,
          quesid: question?.id,
          username: localStorage.getItem("username"),
          email: localStorage.getItem("email"),
        }
      );

      if (response.data[0].builderror) {
        dispatch(addSubmission(
          {
            id: Number(question?.id),
            code: question?.code ?? "",
            cases: response.data.map((data: { input: string; output: string; }) =>
              ({ input: data.input, output: "Compilation error" })),
          }
        ));
        setRunning(false);
        return;
      } else {
        dispatch(addSubmission(
          {
            id: Number(question?.id),
            code: question?.code ?? "",
            cases: response.data,
          }
        ));
        setRunning(false);
      }
    } catch (error) {
      console.error("Error running code:", error);
    }
  };

  return (
    <>
      {loading ? (
        <ProgressComponent datafetched={datafetched} />
      ) : (
        <div
          className="min-h-[45px] m-2 flex flex-col p-1 pt-0 border-[1px] rounded-md border-black"
          style={{
            height: height,
            alignItems: height == smallHeight ? "center" : "start",
            transition: "height 0.1s ease",
          }}
        >

          {/* this is the loading component */}
          <div className="w-full h-fit my-[0.125rem]">
            {running ? <ProgressComponent datafetched={!running} /> : null}
          </div>

          {/* this is the component holding console and run buttons */}
          <div className="w-full flex justify-between pb-2">
            <Button
              className="flex items-center justify-center h-fit"
              onClick={toggleHeight}
            >
              Console
              {height === smallHeight ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                className="h-fit"
                disabled={running}
                onClick={() => {
                  handleRun();
                }}
              >
                Run
              </Button>
            </div>
          </div>



          {height === largeHeight ? (
            <div className="mt-2 overflow-auto w-full">
              <Tabs defaultValue="account" className="">
                <div className="flex justify-between items-center ">
                  <TabsList className="flex gap-3 w-fit">
                    {question?.examples.map((_, index) => (
                      <TabsTrigger
                        key={index}
                        defaultValue={""}
                        value={String(index + 1)}
                        onClick={() => {
                          setCaseno(index + 1);
                        }}
                      >
                        Case {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="px-10">
                    {question?.submission &&
                      !running &&
                      height === largeHeight && caseno ?
                      (question.submission.cases !== null &&
                        String(question.examples[Number(caseno) - 1].output).trim() ===
                        String(question.submission.cases[Number(caseno) - 1].output).trim() ? (
                        <CheckCircle2 className="text-green-400" />
                      ) : (
                        <XCircle className="text-red-400" />
                      )) : null}
                  </div>
                </div>

                {caseno ? (
                  <TabsContent value={String(caseno)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Input</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">
                          {question?.examples[Number(caseno) - 1].input ?? ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="expected-output" className="font-semibold">
                            Expected Output
                          </Label>
                          <p className="text-gray-600 font-medium">
                            {question?.examples[Number(caseno) - 1].output ?? ""}
                          </p>
                        </div>
                        {question?.submission &&
                          <div className="space-y-1">
                            <Label htmlFor="output" className="font-semibold">
                              Output
                            </Label>
                            <p className="text-gray-600 font-medium">
                              {question?.submission.cases[Number(caseno) - 1].output ?? ""}
                            </p>
                          </div>
                        }
                      </CardContent>
                    </Card>
                  </TabsContent>
                ) : null
                }
              </Tabs>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};
