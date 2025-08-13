import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ModalLayout from './components/layout/ModalLayout';
import EmailListsPage from './pages/EmailListsPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import SmtpConfigPage from './pages/SmtpConfigPage';
import StatisticsPage from './pages/StatisticsPage';

function App() {
    // Check immediately if this is a modal window
    const isModalWindow = window.location.search.includes('t=');

    console.log('App starting - isModal:', isModalWindow, 'URL:', window.location.href);
    console.log('Full location:', window.location);

    // If it's a modal window, render modal content directly
    if (isModalWindow) {
        const path = window.location.hash.replace('#', '');

        console.log('Modal mode - path:', path);
        console.log('Rendering settings page for modal');

        switch (path) {
            case '/settings':
                console.log('Rendering SettingsPage in modal');
                return (
                    <ModalLayout title="Configurações">
                        <SettingsPage />
                    </ModalLayout>
                );
            case '/smtp-config':
                return (
                    <ModalLayout title="Gerenciar SMTPs">
                        <SmtpConfigPage />
                    </ModalLayout>
                );
            case '/email-lists':
                return (
                    <ModalLayout title="Gerenciar Listas de Email">
                        <EmailListsPage />
                    </ModalLayout>
                );
            case '/statistics':
                return (
                    <ModalLayout title="Estatísticas">
                        <StatisticsPage />
                    </ModalLayout>
                );
            default:
                return (
                    <ModalLayout title="Erro">
                        <div>Página não encontrada: {path}</div>
                    </ModalLayout>
                );
        }
    }

    // Main window - render with full layout and router
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/email-lists" element={<EmailListsPage />} />
                    <Route path="/smtp-config" element={<SmtpConfigPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Legacy routes for compatibility */}
                    <Route path="/lists" element={<EmailListsPage />} />
                    <Route path="/smtp" element={<SmtpConfigPage />} />
                    <Route path="/stats" element={<StatisticsPage />} />
                </Route>
            </Routes>
        </Router>
    );
} export default App;
