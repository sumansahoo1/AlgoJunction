import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Example {
  input: string;
  output: string;
}

interface Submission {
  submitted: boolean;
  cases: Example[];
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