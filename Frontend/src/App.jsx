import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import Hosts from './pages/Hosts';
import VisitRequests from './pages/VisitRequests';
import EntryExit from './pages/EntryExit';
import History from './pages/History';
import './App.css';

const pageTitles = {
  '/': 'Dashboard',
  '/visitors': 'Visitors Management',
  '/hosts': 'Hosts Management',
  '/visit-requests': 'Visit Requests',
  '/entry-exit': 'Entry/Exit Management',
  '/history': 'Visit History'
};

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2><i className="fas fa-user-shield"></i> VAMS</h2>
          <p>Visitor Access Management</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="fas fa-tachometer-alt"></i> Dashboard</NavLink></li>
            <li><NavLink to="/visitors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="fas fa-users"></i> Visitors</NavLink></li>
            <li><NavLink to="/hosts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="fas fa-user-tie"></i> Hosts</NavLink></li>
            <li><NavLink to="/visit-requests" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="fas fa-clipboard-list"></i> Visit Requests</NavLink></li>
            <li><NavLink to="/entry-exit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="fas fa-door-open"></i> Entry/Exit</NavLink></li>
            <li><NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="fas fa-history"></i> Visit History</NavLink></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>{pageTitles[location.pathname] || 'Dashboard'}</h1>
          </div>
          <div className="header-right">
            <div className="current-time">
              {currentTime.toLocaleString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/hosts" element={<Hosts />} />
            <Route path="/visit-requests" element={<VisitRequests />} />
            <Route path="/entry-exit" element={<EntryExit />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;