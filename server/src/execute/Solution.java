import java.util.*;
    import java.io.*;
    
    class Solution {
        // Function to find the length of the longest substring without repeating characters
        public int lengthOfLongestSubstring(String s) {
            // Write your code here
    
            return 5;
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
    