import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { useSelector } from 'react-redux'
import { RootState } from "@/store";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme/theme-provider";

export const Editor = () => {

  const [value, setValue] = useState(`System.out.println("helloworld");`);

  const { id } = useParams();

  const questionlist = useSelector((state: RootState) => state.queslist.value);
  const question = questionlist.find((question) => question.id === Number(id));

  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (!question) {
      setLoading(true);
    }
    else {
      if (localStorage.getItem(id!)) {
        setValue(localStorage.getItem(id!)!)
      }
      else {
        setValue(question.code)
      }
      setLoading(false);
    }
  }, [id, question])

  return (
    <>
      {loading ? (
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={"sm"} className="h-8">
                  Java
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Languages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={true}
                  onCheckedChange={() => {}}
                >
                  Java
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem disabled>C++</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem disabled>Python</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex gap-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost"><RotateCcw className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your current code will be discarded and reset to the default code!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      id ? localStorage.removeItem(id) : null;
                      setValue(question?.code ?? "");
                    }}>Okay</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={value}
              height="100%"
              extensions={[java()]}
              theme={theme}
              onChange={(value) => {
                localStorage.setItem(id!, value);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
