import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Code2, Shield, Sparkles, LineChart, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.15, ease: "easeOut" }
  }
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const code = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[]{ seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`;

const features = [
  {
    icon: Code2,
    title: "Real-World Coding Challenges",
    description: "Tackle an extensive library of DSA problems crafted to boost your problem-solving skills and prepare you for technical interviews."
  },
  {
    icon: Shield,
    title: "Secure, Isolated Environment",
    description: "Practice confidently with Docker-based isolation, ensuring a distraction-free and safe coding space."
  },
  {
    icon: Sparkles,
    title: "Intuitive Interface",
    description: "Enjoy a smooth, responsive experience designed to make learning efficient and enjoyable."
  },
  {
    icon: LineChart,
    title: "Seamless Progress Tracking",
    description: "Log in effortlessly and keep track of your achievements over time, helping you stay motivated and see your growth."
  },
  {
    icon: Zap,
    title: "Built for Performance",
    description: "Our platform is optimized to provide a fast and seamless experience, letting you focus fully on coding without delays."
  }
];

const steps = [
  {
    title: "Select Your Challenge",
    description: "From simple algorithms to complex data structures, find problems that fit your level."
  },
  {
    title: "Code in a Realistic Environment",
    description: "Practice in a safe, Docker-based system that isolates your work and keeps it secure."
  },
  {
    title: "See Results Instantly",
    description: "Get immediate feedback on your solutions, analyze your progress, and keep advancing."
  }
];

const Landing = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token") != null || localStorage.getItem("username") != null || localStorage.getItem("email") != null || localStorage.getItem("photoURL") != null) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-slate-200/60 dark:bg-slate-800/30 blur-3xl" />
        </div>

        <div className="absolute top-4 right-4 z-20">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 px-6 pt-24 pb-32 container mx-auto"
        >
          <motion.div variants={containerVariants} className="text-center max-w-4xl mx-auto">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Master Data Structures & Algorithms
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-500 dark:text-slate-400 mb-8"
            >
              Practice, learn, and grow with real coding problems in a secure,
              professional-grade environment.
            </motion.p>
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/home")}>
                Start Solving Now
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/signin")}>
                Sign In
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-20 max-w-2xl mx-auto"
          >
            <div className="rounded-lg overflow-hidden shadow-2xl border">
              <div className="bg-slate-800 dark:bg-slate-700 px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-400 text-xs ml-2 font-mono">Solution.java</span>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 text-slate-300 text-sm leading-relaxed p-4 overflow-x-auto font-mono">
                <code>{code}</code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Features ─── */}
      <section className="bg-slate-50 dark:bg-slate-900/50 px-6 py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="container mx-auto max-w-6xl"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Why Choose AlgoJunction?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-950 rounded-xl border p-6"
              >
                <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="px-6 py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="container mx-auto max-w-5xl"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xl font-bold mb-5">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-32 border-t">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="container mx-auto max-w-3xl text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Get Started with AlgoJunction Today
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-500 dark:text-slate-400 mb-10"
          >
            Join a community of learners, boost your skills, and make your code count.
          </motion.p>
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/home")}>
              Start Solving Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/signin")}>
              Browse Problems
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
