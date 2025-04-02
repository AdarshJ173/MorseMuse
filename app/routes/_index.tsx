import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { BookOpen, Settings, MessageSquare, Type } from 'lucide-react'; // Example icons

export const meta: MetaFunction = () => {
  return [
    { title: "MorseMuse - Learn Morse Code" },
    { name: "description", content: "Welcome to MorseMuse. Start your journey to learn Morse code efficiently and engagingly." },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)] px-4 py-12">
      <h1 className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
        MorseMuse
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-xl">
        Unlock the timeless skill of Morse code with intuitive lessons and engaging practice.
      </p>

      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <NavButton
          to="/learn/letters"
          icon={<BookOpen size={24} />}
          title="Learn Letters"
          description="Master the basic building blocks."
        />
        <NavButton
          to="/learn/words" // <-- Link enabled
          icon={<Type size={24} />}
          title="Learn Words"
          description="Practice common words."
          disabled={false} // <-- Button enabled
        />
         <NavButton
          to="#" // Placeholder link
          icon={<MessageSquare size={24} />}
          title="Learn Phrases"
          description="Construct simple phrases."
          disabled={true}
        />
        <NavButton
          to="#" // Placeholder link
          icon={<Settings size={24} />}
          title="Settings"
          description="Adjust your preferences."
          disabled={true}
        />
      </nav>
    </div>
  );
}

// Reusable Navigation Button Component
interface NavButtonProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

function NavButton({ to, icon, title, description, disabled = false }: NavButtonProps) {
  const commonClasses = "flex flex-col items-center justify-center p-6 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105";
  const enabledClasses = "bg-white dark:bg-gray-800 hover:shadow-lg text-gray-700 dark:text-gray-200";
  const disabledClasses = "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60";

  const content = (
    <>
      <div className="mb-3 text-blue-500 dark:text-blue-400">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-center">{description}</p>
    </>
  );

  if (disabled) {
    return (
      <div className={`${commonClasses} ${disabledClasses}`}>
        {content}
      </div>
    );
  }

  return (
    <Link to={to} className={`${commonClasses} ${enabledClasses}`}>
      {content}
    </Link>
  );
}
