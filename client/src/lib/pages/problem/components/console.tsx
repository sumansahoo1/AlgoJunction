import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { useDispatch, useSelector } from 'react-redux'
import { addSubmission } from "@/lib/features/questions/questions";
import { RootState } from "@/store";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TestCaseResult } from "@/lib/utils";
import { toast } from "sonner";

interface ConsoleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Console = ({ collapsed, onToggle }: ConsoleProps) => {

  const { id } = useParams();

  const questionlist = useSelector((state: RootState) => state.queslist.value);
  const question = questionlist.find((question) => question.id === Number(id));
  const dispatch = useDispatch();

  useEffect(() => {
    setCaseno(0);
  }, [question])

  const [caseno, setCaseno] = useState(0);
  const [running, setRunning] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);

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

      const rawResults: Array<{ index: number; output: string | null; expectedOutput: string | null; error: string | null; success: boolean }> = response.data;

      const cases: TestCaseResult[] = rawResults.map((item) => ({
        input: question?.examples[item.index]?.input ?? "",
        output: item.output,
        expectedOutput: item.expectedOutput ?? null,
        error: item.error,
        success: item.success,
      }));

      const allSameError = rawResults.length > 0 &&
        rawResults.every((r) => r.error !== null && r.error === rawResults[0].error);
      setCompilationError(allSameError ? rawResults[0].error : null);

      if (!collapsed) {
        setCaseno(rawResults.length > 0 ? 1 : 0);
      }

      dispatch(addSubmission({
        id: Number(question?.id),
        code: localStorage.getItem(String(id)) ?? question?.code ?? "",
        cases,
      }));

      setRunning(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast.error('Too many submissions. Please wait a minute before trying again.');
      } else {
        console.error("Error running code:", error);
      }
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {running ? (
        <Progress className="w-full h-[2px] absolute top-0 left-0 rounded-none" />
      ) : null}

      <div className="flex items-center justify-between px-2 py-1.5 shrink-0">
        <Button variant="ghost" size="sm" className="gap-1" onClick={onToggle}>
          Console
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
        <Button size="sm" disabled={running} onClick={handleRun}>
          Run
        </Button>
      </div>

      {collapsed ? null : (
        <div className="flex-1 overflow-auto px-2 pb-2">
          {compilationError && (
            <div className="w-full bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-md p-3 mb-2">
              <p className="text-red-700 dark:text-red-400 font-semibold text-sm">Compilation Error</p>
              <pre className="text-red-600 dark:text-red-300 text-xs mt-1 whitespace-pre-wrap break-all">
                {compilationError}
              </pre>
            </div>
          )}
          <Tabs value={String(caseno || "")} onValueChange={(v) => setCaseno(Number(v))}>
            <div className="flex justify-between items-center">
              <TabsList>
                {question?.examples.map((_, index) => (
                  <TabsTrigger
                    key={index}
                    value={String(index + 1)}
                  >
                    Case {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="px-4">
                {question?.submission &&
                  !running &&
                  caseno > 0 ? (
                    question.submission.cases[caseno - 1]?.success ? (
                      <CheckCircle2 className="text-green-400" />
                    ) : (
                      <XCircle className="text-red-400" />
                    )
                  ) : null}
              </div>
            </div>

            {caseno > 0 ? (
              <TabsContent value={String(caseno)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Input</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      {question?.examples[caseno - 1]?.input ?? ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="expected-output" className="font-semibold">
                        Expected Output
                      </Label>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {(() => {
                          const caseResult = question?.submission?.cases[caseno - 1];
                          return caseResult?.expectedOutput ?? question?.examples[caseno - 1]?.output ?? "";
                        })()}
                      </p>
                    </div>
                    {question?.submission && (
                      <div className="space-y-1">
                        <Label htmlFor="output" className="font-semibold">
                          Output
                        </Label>
                        {(() => {
                          const caseResult = question.submission.cases[caseno - 1];
                          if (caseResult?.error) {
                            return (
                              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-2 mt-1">
                                <p className="text-red-700 dark:text-red-400 text-xs font-medium">Error</p>
                                <pre className="text-red-600 dark:text-red-300 text-xs mt-0.5 whitespace-pre-wrap break-all">
                                  {caseResult.error}
                                </pre>
                              </div>
                            );
                          }
                          return (
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                              {caseResult?.output ?? ""}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      )}
    </div>
  );
};
