import type { MetaFunction } from "@remix-run/node";
import LearningInterface from "~/components/LearningInterface"; // Import the new component
import { Link } from "@remix-run/react";
import { ArrowLeft } from 'lucide-react'; // Icon for back button

export const meta: MetaFunction = () => {
  return [
    { title: "MorseMuse - Learn Letters" },
    { name: "description", content: "Learn Morse code letters with MorseMuse." },
  ];
};

export default function LearnLetters() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8 relative">
       {/* Back Button */}
       <Link
         to="/"
         className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
         aria-label="Back to Home"
       >
         <ArrowLeft size={16} className="mr-1" />
         Home
       </Link>

      <LearningInterface />
    </div>
  );
}
