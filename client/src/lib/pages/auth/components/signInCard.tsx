import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const SignInCard = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const photoURL = localStorage.getItem("photoURL");
    if (token && username && email && photoURL) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();

    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const email = result.user?.email;
        const username = result.user?.displayName;
        const photoURL = result.user?.photoURL;
        localStorage.setItem("username", JSON.stringify(username));
        localStorage.setItem("token", token!);
        localStorage.setItem("email", email!);
        localStorage.setItem("photoURL", photoURL!);
        navigate("/home", { replace: true });
      })
      .catch((error) => {
        console.error(
          "FIREBASE ERROR",
          error.code,
          error.message,
          error.email,
          error.credential
        );
      });

    console.log("google sign in");
  };

  return (
    <Card className="min-w-[320px] w-1/2 max-w-[500px]">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Sign in with Gmail or Github</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button variant="outline" className="flex items-center justify-center" onClick={handleGoogleSignIn}>
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center justify-center">
                <Icons.gitHub className="mr-2 h-4 w-4" />Github
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Building</DialogTitle>
                <DialogDescription>GitHub sign-in is coming soon!</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant="outline">Okay</Button>
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
