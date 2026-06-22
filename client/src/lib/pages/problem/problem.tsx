import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Header } from "../../component/Header";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "@/store";
import { addQues } from "@/lib/features/questions/questions";
import { addTotalQues } from "@/lib/features/totalques/totalques";
import { toast } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { Skeleton } from "@/components/ui/skeleton";

import { ProblemDesc } from "./components/problemdesc";
import { Editor } from "./components/editor";
import { Console } from "./components/console";
import Error from "../error/error";

export const Problem = () => {
  const [loading, setLoading] = useState(true);
  const [errorRoute, setErrorRoute] = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const consoleRef = useRef<ImperativePanelHandle>(null);

  const toggleConsole = () => {
    const panel = consoleRef.current;
    if (panel?.isCollapsed()) {
      panel?.expand();
    } else {
      panel?.collapse();
    }
  };

  const navigate = useNavigate();
  const { id } = useParams();

  const questionlist = useSelector((state: RootState) => state.queslist.value);
  const dispatch = useDispatch();
  const question = questionlist.find((q) => q.id === Number(id));
  const totalques = useSelector((state: RootState) => state.totalques.value);

  useEffect(() => {
    const fetchtotalques = async () => {
      if (totalques) return totalques;
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/totalquestions`
      );
      dispatch(addTotalQues(response.data['total']));
      return response.data['total'];
    };

    const init = async () => {
      if (!localStorage.getItem("idToken") || !localStorage.getItem("username")) {
        navigate("/signin", { replace: true });
        return;
      }

      if (!question) {
        try {
          const total = await fetchtotalques();
          setLoading(false);
          if (Number(id) < 1 || Number(id) > total) {
            setErrorRoute(true);
          } else {
            setErrorRoute(false);
            const response = await axios.get(
              import.meta.env.VITE_BACKEND_URL + `/question/${id}`
            );
            dispatch(addQues(response.data));
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 429) {
            toast.error('Too many requests. Please try again later.');
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    init();
  }, [id, question, dispatch, totalques, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      {errorRoute ? (
        <Error />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <aside className="flex flex-col gap-1 px-1 py-2 border-r w-12 shrink-0 items-center">
            {Array.from({ length: totalques }, (_, i) => i + 1).map((i) => (
              <Link to={`/problem/${i}`} key={i}>
                <button
                  className={`w-8 h-8 text-sm rounded-md border ${
                    i === Number(id)
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {i}
                </button>
              </Link>
            ))}
          </aside>

          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full overflow-auto p-4">
                    <ProblemDesc />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel ref={consoleRef} collapsible collapsedSize={6} defaultSize={30} minSize={6} onCollapse={() => setConsoleCollapsed(true)} onExpand={() => setConsoleCollapsed(false)}>
                  <Console collapsed={consoleCollapsed} onToggle={toggleConsole} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <Editor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};
