import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import FinanceBookings from './pages/FinanceBookings.jsx';
import { FiltersProvider } from './context/FiltersContext.jsx';
import { useSession } from './hooks/useSession.js';

export default function App() {
  const { owners, currentUser, canApprove } = useSession();

  return (
    <FiltersProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar currentUser={currentUser} />
          <main className="flex-1 overflow-y-auto p-6">
            <FinanceBookings canApprove={canApprove} owners={owners} />
          </main>
        </div>
      </div>
    </FiltersProvider>
  );
}
