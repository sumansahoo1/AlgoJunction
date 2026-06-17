import { SignInCard } from "./components/signInCard";

export const SignIn = () => {
  return (
    <section className="w-screen h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        AlgoJunction
      </h1>
      <SignInCard />
    </section>
  );
};
