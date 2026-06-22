// DEPRECATED: Questions are now stored in MongoDB (Question model).
// This file is retained only as the data source for the one-time seed script
// (scripts/seedQuestions.js). Do not add new questions here — use the admin
// API (POST /admin/questions) or MongoDB Atlas UI instead.
export const questions = [
  {
    id: 1,
    qName: "Two Sum",
    qDifficulty: "Easy",
    qDescription:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    qAssumptions:
      "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0, 1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1, 2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0, 1]",
      },
    ],
    inputs: [
      {
        input: "4 2 7 11 15 9",
        expectedOutput: "[0, 1]",
      },
      {
        input: "3 3 2 4 6",
        expectedOutput: "[1, 2]",
      },
      {
        input: "2 3 3 6",
        expectedOutput: "[0, 1]",
      },
    ],
    constraints:
      "2 <= nums.length <= 10^3, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9, Only one valid answer exists.",
    code: `
    import java.util.*;
    import java.io.*;
    
    class Solution {
        // Function to find indices of two numbers in the array that add up to the target
        public int[] twoSum(int[] nums, int target) {
            // Your code goes here
    
            return new int[]{0, 0};
        }
    
        public static void main(String[] args) {
            Solution solution = new Solution();
    
            try {
                FileInputStream fileInputStream = new FileInputStream("./inputs/input.txt");
                Scanner scanner = new Scanner(fileInputStream);
    
                int arrayLength = scanner.nextInt();
    
                int[] nums = new int[arrayLength];
    
                for (int i = 0; i < arrayLength; i++) {
                    nums[i] = scanner.nextInt();
                }
    
                int target = scanner.nextInt();
    
                int[] result = solution.twoSum(nums, target);
    
                System.out.println(Arrays.toString(result));
    
                // Close the scanner
                scanner.close();
    
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }
    }    
  `,
  },
  {
    id: 2,
    qName: "Longest Substring Without Repeating Characters",
    qDifficulty: "Medium",
    qDescription:
      "Given a string s, find the length of the longest substring without repeating characters.",
    qAssumptions:
      "You may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
      },
      {
        input: 's = "bbbbb"',
        output: "1",
      },
      {
        input: 's = "pwwkew"',
        output: "3",
      },
    ],
    inputs: [
      {
        input: "abcabcbb",
        expectedOutput: "3",
      },
      {
        input: "bbbbb",
        expectedOutput: "1",
      },
      {
        input: "pwwkew",
        expectedOutput: "3",
      },
    ],
    constraints:
      "0 <= s.length <= 5 * 104, s consists of English letters, digits, symbols and spaces.",
    code: `import java.util.*;
    import java.io.*;
    
    class Solution {
        // Function to find the length of the longest substring without repeating characters
        public int lengthOfLongestSubstring(String s) {
            // Write your code here
    
            return 0;
        }
    
        public static void main(String[] args) {
            Solution solution = new Solution();
    
            try {
                FileInputStream fileInputStream = new FileInputStream("./inputs/input.txt");
                Scanner scanner = new Scanner(fileInputStream);
    
                String input = scanner.next();
    
                int result = solution.lengthOfLongestSubstring(input);
    
                System.out.println(result);
    
                // Close the scanner
                scanner.close();
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }
    }
    `,
  },
  {
    id: 3,
    qName: "Median of Two Sorted Arrays",
    qDifficulty: "Hard",
    qDescription:
      " Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    qAssumptions:
      "Follow up: The overall run time complexity should be O(log (m+n)).",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
      },
      {
        input: "nums1 = [0,0], nums2 = [0,0]",
        output: "0.00000",
      },
    ],
    inputs: [
      {
        input: "2 1 3 1 2",
        expectedOutput: "2.0",
      },
      {
        input: "2 1 2 2 0 0",
        expectedOutput: "2.5",
      },
      {
        input: "2 0 0 2 0 0",
        expectedOutput: "0.0",
      }
    ],
    constraints:
      "nums1.length == m, nums2.length == n, 0 <= m <= 1000, 0 <= n <= 1000, 1 <= m + n <= 2000, -106 <= nums1[i], nums2[i] <= 106",
    code: `import java.util.*;
    import java.io.*;
    
    class Solution {
        // Function to find the median of two sorted arrays
        public double findMedianSortedArrays(int[] nums1, int[] nums2) {
            // Write your code here
    
            return 0.0;
        }
    
        public static void main(String[] args) {
            Solution solution = new Solution();
    
            try {
                FileInputStream fileInputStream = new FileInputStream("./inputs/input.txt");
                Scanner scanner = new Scanner(fileInputStream);
    
                int m = scanner.nextInt();
    
                int[] nums1 = new int[m];
                for (int i = 0; i < m; i++) {
                    nums1[i] = scanner.nextInt();
                }
    
                int n = scanner.nextInt();
    
                int[] nums2 = new int[n];
                for (int i = 0; i < n; i++) {
                    nums2[i] = scanner.nextInt();
                }
    
                double result = solution.findMedianSortedArrays(nums1, nums2);
    
                System.out.println(result);
    
                // Close the scanner
                scanner.close();
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }
    }
    `,
  },
  {
    "id": 4,
    "qName": "Valid Parentheses",
    "qDifficulty": "Easy",
    "qDescription": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    "qAssumptions": "An input string is valid if:\n\nOpen brackets must be closed by the same type of brackets.\nOpen brackets must be closed in the correct order.",
    "examples": [
      {
        "input": "s = '()'",
        "output": "true"
      },
      {
        "input": "s = '()[]{}'",
        "output": "true"
      },
      {
        "input": "s = '(]'",
        "output": "false"
      },
      {
        "input": "s = '([)]'",
        "output": "false"
      },
      {
        "input": "s = '{[]}'",
        "output": "true"
      }
    ],
    "inputs": [
      {
        "input": "'()'",
        "expectedOutput": "true"
      },
      {
        "input": "'()[]{}'",
        "expectedOutput": "true"
      },
      {
        "input": "'(]'",
        "expectedOutput": "false"
      },
      {
        "input": "'([)]'",
        "expectedOutput": "false"
      },
      {
        "input": "'{[]}'",
        "expectedOutput": "true"
      }
    ],
    "constraints": "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'.",
    "code": "import java.util.*;\nimport java.io.*;\n\nclass Solution {\n    // Function to check if the input string of parentheses is valid\n    public boolean isValid(String s) {\n        // Your code goes here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Solution solution = new Solution();\n\n        try {\n            FileInputStream fileInputStream = new FileInputStream(\"./inputs/input.txt\");\n            Scanner scanner = new Scanner(fileInputStream);\n\n            String input = scanner.next();\n\n            // Remove surrounding single quotes from the input\n            String s = input.replaceAll(\"^'|'$\", \"\");\n\n            boolean result = solution.isValid(s);\n\n            System.out.println(result);\n\n            // Close the scanner\n            scanner.close();\n        } catch (FileNotFoundException e) {\n            e.printStackTrace();\n        }\n    }\n}"
  },
//   {
//     "id": 5,
//     "qName": "Roman to Integer",
//     "qDifficulty": "Easy",
//     "qDescription": "Given a roman numeral, convert it to an integer.",
//     "qAssumptions": "1 <= s.length <= 15, s contains only the characters ('I', 'V', 'X', 'L', 'C', 'D', 'M'). It is guaranteed that s is a valid roman numeral in the range [1, 3999].",
//     "examples": [
//       {
//         "input": "s = 'III'",
//         "output": "3"
//       },
//       {
//         "input": "s = 'IV'",
//         "output": "4"
//       },
//       {
//         "input": "s = 'IX'",
//         "output": "9"
//       },
//       {
//         "input": "s = 'LVIII'",
//         "output": "58"
//       },
//       {
//         "input": "s = 'MCMXCIV'",
//         "output": "1994"
//       }
//     ],
//     "inputs": [
//       {
//         "input": "'III'"
//       },
//       {
//         "input": "'IV'"
//       },
//       {
//         "input": "'IX'"
//       },
//       {
//         "input": "'LVIII'"
//       },
//       {
//         "input": "'MCMXCIV'"
//       }
//     ],
//     "constraints": "1 <= s.length <= 15, s contains only the characters ('I', 'V', 'X', 'L', 'C', 'D', 'M'). It is guaranteed that s is a valid roman numeral in the range [1, 3999].",
//     "code": `import java.io.BufferedReader;
// import java.io.IOException;
// import java.io.InputStreamReader;
// import java.util.*;
// import java.io.*;

// class Solution {
//     public int romanToInt(String s) {
//         // Your code goes here
        
//         return 0;
//     }
//     public static void main(String[] args) {
//         Solution solution = new Solution();

//         try {
//             BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
//             String line;
//             while ((line = br.readLine()) != null) {
//                 // Remove any surrounding quotes from the input
//                 String input = line.replaceAll("^\"|\"$", "");
//                 int result = solution.romanToInt(input);
//                 System.out.println(result);
//             }
//         } catch (IOException e) {
//             e.printStackTrace();
//         }
//     }
// }`
//   }
];

