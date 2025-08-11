import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import EmailListsPage from './pages/EmailListsPage';
import HomePage from './pages/HomePage';
import SmtpConfigPage from './pages/SmtpConfigPage';
import StatisticsPage from './pages/StatisticsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/lists" element={<EmailListsPage />} />
                    <Route path="/smtp" element={<SmtpConfigPage />} />
                    <Route path="/stats" element={<StatisticsPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
