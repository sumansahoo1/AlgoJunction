import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.io.*;

class Solution {
    public int romanToInt(String s) {
        // Your code goes here
        
        return 0;
    }
    public static void main(String[] args) {
        Solution solution = new Solution();

        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
            String line;
            while ((line = br.readLine()) != null) {
                // Remove any surrounding quotes from the input
                String input = line.replaceAll("^"|"$", "");
                int result = solution.romanToInt(input);
                System.out.println(result);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}