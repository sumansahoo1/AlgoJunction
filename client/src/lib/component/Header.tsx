import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

export const Header = () => {
    const username = localStorage.getItem("username");
    const parsedUsername = username ? JSON.parse(username) : null;
    const firstName = parsedUsername ? parsedUsername.toString().split(" ")[0] : null;

    const navigate = useNavigate();

    return (
        <nav className="flex flex-row items-center justify-between px-5 py-3 border-[1px] border-black h-[10vh]">
            <h1
                className="scroll-m-20 text-2xl font-extrabold tracking-tight cursor-pointer"
                onClick={() => {
                    navigate("/home");
                }}
            >
                AlgoJunction
            </h1>
            {!username ?
                <Button variant="surface" color="red" size={"3"} onClick={() => {
                    navigate("/signin");
                }}>
                    Sign In
                </Button>
                : <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center justify-center">
                        <Avatar>
                            <AvatarImage src={localStorage.getItem("photoURL") ?? ""} />
                            <AvatarFallback>P</AvatarFallback>
                        </Avatar>&nbsp;
                        <p className="font-medium">{firstName}</p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                                navigate("/profile");
                            }}
                        >
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                console.log("Sign Out");
                                localStorage.removeItem("username");
                                localStorage.removeItem("token");
                                localStorage.removeItem("email");
                                localStorage.removeItem("photoURL");
                                navigate("/", {replace: true});
                            }}
                            className="bg-red-500 text-white rounded-md"
                        >
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>}
        </nav>
    )
}