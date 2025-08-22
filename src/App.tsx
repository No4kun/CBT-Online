import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import ColumnMethod from './pages/ColumnMethod';
import BehaviorRecord from './pages/BehaviorRecord';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-primary-50">
        <Header />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/column-method" element={<ColumnMethod />} />
            <Route path="/behavior-record" element={<BehaviorRecord />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
