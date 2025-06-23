import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
import CreateExpense from './pages/CreateExpense';
import Balances from './pages/Balances';
import { ExpenseProvider } from './context/ExpenseContext';

function App() {
  return (
    <ExpenseProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/groups/:id/add-expense" element={<CreateExpense />} />
            <Route path="/balances" element={<Balances />} />
          </Routes>
        </Layout>
      </Router>
    </ExpenseProvider>
  );
}

export default App;