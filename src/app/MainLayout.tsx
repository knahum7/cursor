import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-end items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <UserMenu />
        </header>
        <main className="flex-1 p-8 pb-20 flex flex-col items-center justify-center">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 