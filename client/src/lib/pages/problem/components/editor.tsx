import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { Moon, Sun } from "lucide-react";
import { useSelector } from 'react-redux'
import { RootState } from "@/store";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProgressComponent } from "@/lib/component/progress";
import { ResetIcon } from "@radix-ui/react-icons";
import { Box, Dialog, Flex } from "@radix-ui/themes";


type Checked = DropdownMenuCheckboxItemProps["checked"];


export const Editor = () => {

  const [checked, setChecked] = React.useState<Checked>(true);
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [value, setValue] = React.useState(`System.out.println("helloworld");`);



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
      if (localStorage.getItem(id!)) {
        setValue(localStorage.getItem(id!)!)
      }
      else {
        setValue(question.code)
      }
      setLoading(false);
    }
  }
    , [id, question])


  return (
    <>
      {loading ? (
        <ProgressComponent datafetched={datafetched} />
      ) : (
        <div className="grow flex flex-col justify-end border-[1px] border-black rounded-md m-2">
          <div className="flex items-center justify-between p-1 border-b-[1px] border-black w-full h-fit">
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
                  checked={checked}
                  onClick={() => {
                    setChecked(true);
                  }}
                >
                  Java
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem disabled>C++</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem disabled>Python</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Box className="flex gap-1">
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="default"> <ResetIcon className="h-4 w-4" /></Button>
                </Dialog.Trigger>

                <Dialog.Content>
                  <Dialog.Title>Are you sure?</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Your current code will be discarded and reset to the default code!
                  </Dialog.Description>
                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="default" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                      <Button variant={"destructive"} onClick={
                        () => {
                          id?localStorage.removeItem(id):null;
                          setValue(question?.code ?? "");
                        }
                      }>Okay</Button>
                    </Dialog.Close>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
              <Button
                variant="default"
                className=""
                onClick={() => {
                  theme == "dark" ? setTheme("light") : setTheme("dark");
                }}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </Box>
          </div>
          <div className="flex-grow">
          <CodeMirror
            value={value}
            height="83vh"
            width="100%"
            minWidth="20vw"
            maxWidth="50vw"
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
