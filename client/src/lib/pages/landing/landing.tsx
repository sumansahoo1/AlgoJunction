import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {


    const navigate = useNavigate();

    useEffect(() => {

        if (localStorage.getItem("token") != null || localStorage.getItem("username") != null || localStorage.getItem("email") != null || localStorage.getItem("photoURL") != null) {
            navigate("/home",);
        }
    }, [navigate]);


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const features = [
        {
            title: "Real-World Coding Challenges",
            description: "Tackle an extensive library of DSA problems crafted to boost your problem-solving skills and prepare you for technical interviews."
        },
        {
            title: "Secure, Isolated Coding Environment",
            description: "Practice confidently with Docker-based isolation, ensuring a distraction-free and safe coding space."
        },
        {
            title: "Intuitive Interface",
            description: "Enjoy a smooth, responsive experience designed to make learning efficient and enjoyable."
        },
        {
            title: "Seamless Progress Tracking",
            description: "Log in effortlessly and keep track of your achievements over time, helping you stay motivated and see your growth."
        },
        {
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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden"
        >
            {/* Floating background elements */}
            <motion.div
                className="fixed top-10 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-300/40 to-indigo-300/40 rounded-full filter blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 15,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />
            <motion.div
                className="fixed bottom-0 left-[5%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-300/40 to-pink-300/40 rounded-full filter blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 18,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />
            <motion.div
                className="fixed top-[40%] left-[20%] w-[400px] h-[400px] bg-gradient-to-bl from-indigo-200/30 to-blue-300/30 rounded-full filter blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 20,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />
            <motion.div
                className="fixed top-[20%] left-[50%] w-[300px] h-[300px] bg-gradient-to-tr from-purple-200/30 via-indigo-300/30 to-blue-200/30 rounded-full filter blur-3xl"
                animate={{
                    scale: [1.2, 0.8, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 12,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />
            {/* Main Content */}
            <div className="relative z-10 px-6 pt-20 pb-32 container mx-auto">
                {/* Hero Section */}
                <motion.div variants={containerVariants} className="text-center max-w-4xl mx-auto">
                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6"
                    >
                        AlgoJunction: Master Data Structures & Algorithms with Confidence
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-2xl text-gray-700 mb-8"
                    >
                        Sharpen Your Coding Skills in a Secure, Real-World Environment
                    </motion.p>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-gray-600 max-w-3xl mx-auto"
                    >
                        At AlgoJunction, we're dedicated to helping developers like you conquer data structures
                        and algorithms with hands-on practice in a professional-grade, Docker-powered environment.
                    </motion.p>
                </motion.div>

                {/* Features Section */}
                <motion.div variants={containerVariants} className="mt-32 max-w-4xl mx-auto">
                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl font-bold text-center mb-12"
                    >
                        Why Choose AlgoJunction?
                    </motion.h2>

                    <div className="space-y-4">
                        <Accordion.Root type="multiple" className="space-y-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-gradient-to-r from-white to-indigo-50/30 rounded-lg shadow-sm border border-indigo-50"
                                >
                                    <Accordion.Item value={`item-${index + 1}`}>
                                        <Accordion.Header>
                                            <Accordion.Trigger className="w-full px-6 py-4 flex justify-between items-center text-lg font-medium text-gray-800 hover:text-indigo-600">
                                                {feature.title}
                                                <motion.div
                                                    whileHover={{ rotate: 180 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                                                </motion.div>
                                            </Accordion.Trigger>
                                        </Accordion.Header>
                                        <Accordion.Content className="px-6 pb-4 text-gray-600">
                                            {feature.description}
                                        </Accordion.Content>
                                    </Accordion.Item>
                                </motion.div>
                            ))}
                        </Accordion.Root>
                    </div>
                </motion.div>

                {/* How it Works Section */}
                <motion.div
                    variants={containerVariants}
                    className="mt-32 max-w-4xl mx-auto"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl font-bold text-center mb-12"
                    >
                        How It Works
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-lg shadow-sm border border-blue-100"
                            >
                                <div className="text-3xl font-bold text-indigo-600 mb-4">{index + 1}</div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    variants={containerVariants}
                    className="mt-32 text-center max-w-4xl mx-auto"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl font-bold mb-6"
                    >
                        Get Started with AlgoJunction Today
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-gray-600 mb-12"
                    >
                        Join a community of learners, boost your skills, and make your code count.
                    </motion.p>
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = "/home"}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-xl font-semibold rounded-full shadow-lg hover:from-indigo-700 hover:to-blue-600 transition duration-300"
                    >
                        Start Solving Now
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Landing;