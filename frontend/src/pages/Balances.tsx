import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Users, ArrowRight } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

const Balances: React.FC = () => {
  const { currentUser, getPersonalBalance, users } = useExpenseContext();
  
  const personalBalance = getPersonalBalance(currentUser.id);
  
  const getUserById = (userId: string) => users.find(user => user.id === userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Balances</h1>
        <p className="text-gray-600 mt-1">Overview of all your shared expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Owed to You</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(personalBalance.totalOwedToYou)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-md ${
              personalBalance.netBalance < 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                personalBalance.netBalance < 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${
                personalBalance.netBalance < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {personalBalance.netBalance < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(personalBalance.netBalance))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Balances */}
      <div className="space-y-6">
        {personalBalance.groupBalances.map((groupBalance) => (
          <div key={groupBalance.groupId} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{groupBalance.groupName}</h2>
                </div>
                <Link
                  to={`/groups/${groupBalance.groupId}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                >
                  View group
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {groupBalance.owedRelationships.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Settlement Summary</h3>
                  {groupBalance.owedRelationships
                    .filter(rel => rel.from === currentUser.id || rel.to === currentUser.id)
                    .map((relationship, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {relationship.from === currentUser.id ? (
                            <>
                              <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="text-sm text-gray-900">
                                You owe <span className="font-medium">{relationship.toName}</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <img
                                src={getUserById(relationship.from)?.avatar}
                                alt={relationship.fromName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="text-sm text-gray-900">
                                <span className="font-medium">{relationship.fromName}</span> owes you
                              </span>
                            </>
                          )}
                        </div>
                        <span className={`font-semibold ${
                          relationship.from === currentUser.id ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(relationship.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">All settled up in this group!</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {personalBalance.groupBalances.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No balances yet</h3>
            <p className="text-gray-600 mb-6">
              Join a group and add expenses to see your balances here
            </p>
            <Link
              to="/groups"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              View Groups
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Balances;