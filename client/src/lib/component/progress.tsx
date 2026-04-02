import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

export function ProgressComponent({ datafetched }: { datafetched: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (datafetched) {
      setProgress(100);
    } else {
      simulateDataFetching();
    }
  }, [datafetched]);

  const simulateDataFetching = async () => {
    for (let i = 0; i < 80; i++) {
      await new Promise((resolve) => setTimeout(resolve, 17));
      setProgress(i);
    }
  };

  return (
    <main className="w-full h-fit flex items-start justify-center">
      <Progress max={100} value={progress} className="w-[100%] h-[2px] " />
    </main>
  );
}
