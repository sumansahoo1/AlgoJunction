import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-provider";

export const Header = () => {
    const username = localStorage.getItem("username");
    const parsedUsername = username ? JSON.parse(username) : null;
    const firstName = parsedUsername ? parsedUsername.toString().split(" ")[0] : null;
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="flex flex-row items-center justify-between px-5 py-3 border-b h-16">
            <h1
                className="scroll-m-20 text-2xl font-extrabold tracking-tight cursor-pointer"
                onClick={() => { navigate("/home"); }}
            >
                AlgoJunction
            </h1>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {!username ? (
                    <Button variant="default" onClick={() => { navigate("/signin"); }}>
                        Sign In
                    </Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={localStorage.getItem("photoURL") ?? ""} />
                                <AvatarFallback>{firstName?.charAt(0) ?? "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden sm:inline">{firstName}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { navigate("/profile"); }}>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    localStorage.removeItem("username");
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("email");
                                    localStorage.removeItem("photoURL");
                                    navigate("/", { replace: true });
                                }}
                                className="text-red-500 focus:text-red-500"
                            >
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </nav>
    );
};
