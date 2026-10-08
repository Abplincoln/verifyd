import { useState } from 'react';
import type { ActivePage } from './types/document';
import { WalletProvider } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { IssueDocumentPage } from './pages/IssueDocumentPage';
import { VerifyDocumentPage } from './pages/VerifyDocumentPage';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Top Navigation */}
        <Navbar activePage={activePage} onNavigate={setActivePage} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activePage === 'home' && <HomePage onNavigate={setActivePage} />}
          {activePage === 'issue' && <IssueDocumentPage onNavigate={setActivePage} />}
          {activePage === 'verify' && <VerifyDocumentPage onNavigate={setActivePage} />}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </WalletProvider>
  );
}

export default App;
