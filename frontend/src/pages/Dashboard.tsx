import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Receipt, TrendingUp, ArrowRight } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { groups, expenses, currentUser, getPersonalBalance } = useExpenseContext();
  
  const personalBalance = getPersonalBalance(currentUser.id);
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your shared expenses and settle balances
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/create-group"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Group
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-md">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">You Owe</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(personalBalance.totalOwed)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Owed to You</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(personalBalance.totalOwedToYou)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Groups */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
              <Link
                to="/groups"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {groups.slice(0, 3).map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.users.length} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(group.totalExpenses)}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </Link>
            ))}
            {groups.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No groups yet</p>
                <Link
                  to="/create-group"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Create your first group
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentExpenses.map((expense) => {
              const group = groups.find(g => g.id === expense.groupId);
              return (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-600">{group?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentExpenses.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No expenses yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;