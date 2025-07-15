import Link from "next/link";

const Sidebar = () => {
  return (
    <nav
      className="w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-8 gap-4 shadow-md"
      aria-label="Sidebar Navigation"
    >
      <Link
        href="/"
        className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
        tabIndex={0}
        aria-label="Home"
      >
        Home
      </Link>
      <Link
        href="/playground"
        className="w-full text-left px-4 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-600 dark:text-blue-300 font-medium"
        tabIndex={0}
        aria-label="Go to Playground"
      >
        Playground
      </Link>
      <Link
        href="/dashboards"
        className="w-full text-left px-4 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-600 dark:text-blue-300 font-medium"
        tabIndex={0}
        aria-label="Go to API Key Dashboard"
      >
        API Key Dashboard
      </Link>
    </nav>
  );
};

export default Sidebar; 