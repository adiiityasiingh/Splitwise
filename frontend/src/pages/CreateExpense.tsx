import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import { Split, SplitType } from '../types';

const CreateExpense: React.FC = () => {
  const navigate = useNavigate();
  const { id: groupId } = useParams<{ id: string }>();
  const { getGroupById, addExpense } = useExpenseContext();
  
  const group = getGroupById(groupId!);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [percentageSplits, setPercentageSplits] = useState<{ [userId: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    'Food',
    'Transportation',
    'Accommodation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Other'
  ];

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }
    
    if (splitType === 'percentage') {
      const totalPercentage = Object.values(percentageSplits)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        newErrors.percentages = 'Percentages must add up to 100%';
      }
      
      // Check if all members have percentages
      const hasAllPercentages = group.users.every(user => 
        percentageSplits[user.id] && parseFloat(percentageSplits[user.id]) > 0
      );
      
      if (!hasAllPercentages) {
        newErrors.percentages = 'Please set percentages for all members';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePercentageChange = (userId: string, value: string) => {
    setPercentageSplits(prev => ({
      ...prev,
      [userId]: value
    }));
    
    if (errors.percentages) {
      setErrors(prev => ({ ...prev, percentages: '' }));
    }
  };

  const calculateSplits = (): Split[] => {
    const amountNum = parseFloat(amount);
    
    if (splitType === 'equal') {
      const splitAmount = amountNum / group.users.length;
      return group.users.map(user => ({
        userId: user.id,
        amount: Math.round(splitAmount * 100) / 100
      }));
    } else {
      return group.users.map(user => {
        const percentage = parseFloat(percentageSplits[user.id]) || 0;
        return {
          userId: user.id,
          amount: Math.round((amountNum * percentage / 100) * 100) / 100,
          percentage
        };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const splits = calculateSplits();
    
    addExpense({
      groupId: groupId!,
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitType,
      splits,
      category: category || 'Other'
    });
    
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/groups/${groupId}`}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
          <p className="text-gray-600 mt-1">Add a new expense to {group.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Dinner at restaurant"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Amount and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount * (₹)
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid by *
            </label>
            {errors.paidBy && (
              <p className="mb-2 text-sm text-red-600">{errors.paidBy}</p>
            )}
            <div className="space-y-2">
              {group.users.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                    paidBy === user.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paidBy"
                    value={user.id}
                    checked={paidBy === user.id}
                    onChange={(e) => {
                      setPaidBy(e.target.value);
                      if (errors.paidBy) setErrors(prev => ({ ...prev, paidBy: '' }));
                    }}
                    className="text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  />
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-4 border rounded-md cursor-pointer ${
                splitType === 'equal' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="splitType"
                  value="equal"
                  checked={splitType === 'equal'}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                  className="sr-only"
                />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Split Equally</p>
                  <p className="text-sm text-gray-600">Divide equally among all members</p>
                </div>
              </label>

              <label className={`flex items-center justify-center p-4 border rounded-md cursor-pointer ${
                splitType === 'percentage' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="splitType"
                  value="percentage"
                  checked={splitType === 'percentage'}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                  className="sr-only"
                />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Split by Percentage</p>
                  <p className="text-sm text-gray-600">Set custom percentages</p>
                </div>
              </label>
            </div>
          </div>

          {/* Percentage Splits */}
          {splitType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Percentages (must total 100%)
              </label>
              {errors.percentages && (
                <p className="mb-2 text-sm text-red-600">{errors.percentages}</p>
              )}
              <div className="space-y-3">
                {group.users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={percentageSplits[user.id] || ''}
                        onChange={(e) => handlePercentageChange(user.id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                ))}
                <div className="text-right text-sm text-gray-600">
                  Total: {Object.values(percentageSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="font-medium text-gray-900 mb-3">Split Preview</h3>
              <div className="space-y-2">
                {group.users.map((user) => {
                  const splitAmount = splitType === 'equal' 
                    ? parseFloat(amount) / group.users.length
                    : (parseFloat(amount) * (parseFloat(percentageSplits[user.id]) || 0) / 100);
                  
                  return (
                    <div key={user.id} className="flex justify-between text-sm">
                      <span>{user.name}</span>
                      <span>₹{splitAmount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to={`/groups/${groupId}`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpense;