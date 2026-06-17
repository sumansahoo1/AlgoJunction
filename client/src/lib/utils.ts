import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Example {
  input: string;
  output: string;
}

export interface TestCaseResult {
  input: string;
  output: string | null;
  expectedOutput: string | null;
  error: string | null;
  success: boolean;
}

interface Submission {
  submitted: boolean;
  code: string;
  cases: TestCaseResult[];
}

export interface Question {
  id: number;
  qName: string;
  qDifficulty: string;
  qDescription: string;
  examples: Example[];
  inputs: Example[];
  constraints: string;
  code: string;
  run: boolean;
  submission: Submission;
}