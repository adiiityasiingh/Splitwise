import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import axios from 'axios';

export default function CreateGroupForm() {
  const navigate = useNavigate();
  const { users } = useExpenseContext();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Use the backend logic: convert selectedUsers to comma-separated string for compatibility
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use the backend logic: convert selectedUsers to array of ints
    const ids = selectedUsers.map(id => parseInt(id));
    if (!groupName.trim()) {
      setErrors({ name: 'Group name is required' });
      return;
    }
    if (ids.length < 2) {
      setErrors({ users: 'Please select at least 2 members' });
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/groups", {
        name,
        user_ids: ids
      });
      alert(`Group created with ID ${res.data.group_id || res.data.id}`);
      navigate('/groups');
    } catch (err: any) {
      setErrors({ api: err.response?.data?.detail || 'Error creating group' });
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    if (errors.users) {
      setErrors(prev => ({ ...prev, users: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/groups"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Group</h1>
          <p className="text-gray-600 mt-1">Set up a group to track shared expenses</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Goa Trip, Weekend Getaway"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Members * (minimum 2)
            </label>
            {errors.users && (
              <p className="mb-2 text-sm text-red-600">{errors.users}</p>
            )}

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected members:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <div
                        key={userId}
                        className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{user.name}</span>
                        <button
                          type="button"
                          onClick={() => handleUserToggle(userId)}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Available Users */}
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {users.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedUsers.includes(user.id) ? 'bg-emerald-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
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

          {/* API Error */}
          {errors.api && (
            <p className="text-red-600">{errors.api}</p>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/groups"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};