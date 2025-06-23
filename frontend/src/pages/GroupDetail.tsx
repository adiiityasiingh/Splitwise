import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Receipt, Users, ArrowLeft, DollarSign } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getGroupById, getExpensesByGroupId, getGroupBalances, users } = useExpenseContext();
  
  if (!id) return null;
  
  const group = getGroupById(id);
  const expenses = getExpensesByGroupId(id);
  const groupBalances = getGroupBalances(id);
  
  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Group not found</h2>
        <Link to="/groups" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">
          Back to Groups
        </Link>
      </div>
    );
  }

  const getUserById = (userId: string) => users.find(user => user.id === userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/groups"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 mt-1">{group.description}</p>
          )}
        </div>
        <Link
          to={`/groups/${id}/add-expense`}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Link>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-md">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(group.totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balances */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Balances</h2>
          </div>
          <div className="p-6">
            {groupBalances && groupBalances.owedRelationships.length > 0 ? (
              <div className="space-y-4">
                {groupBalances.owedRelationships.map((relationship, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getUserById(relationship.from)?.avatar}
                        alt={relationship.fromName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-900">
                        <span className="font-medium">{relationship.fromName}</span> owes{' '}
                        <span className="font-medium">{relationship.toName}</span>
                      </span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(relationship.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">All settled up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          </div>
          <div className="p-6">
            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((expense) => {
                    const paidByUser = getUserById(expense.paidBy);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={paidByUser?.avatar}
                            alt={paidByUser?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{expense.description}</p>
                            <p className="text-sm text-gray-600">
                              Paid by {paidByUser?.name} • {expense.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No expenses yet</p>
                <Link
                  to={`/groups/${id}/add-expense`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Add the first expense
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.users.map((user) => {
              const balance = groupBalances?.balances.find(b => b.userId === user.id);
              return (
                <div key={user.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {balance && (
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        balance.amount > 0 ? 'text-green-600' : balance.amount < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {balance.amount > 0 && '+'}
                        {formatCurrency(Math.abs(balance.amount))}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;