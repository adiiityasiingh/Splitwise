import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';

const Groups: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/groups')
      .then(res => setGroups(res.data))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-1">Manage your expense groups</p>
        </div>
        <Link
          to="/create-group"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Link>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {/* If you have createdAt, otherwise remove this line */}
                    {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                {group.description && (
                  <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {group.users?.length ?? 0} member{(group.users?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(group.total_expenses ?? 0)}
                  </span>
                </div>

                {/* Member Avatars - you may need to fetch user details separately */}
                {/* <div className="flex items-center justify-between">
                  ...avatars...
                </div> */}
                  
                <Link
                  to={`/groups/${group.id}`}
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  View details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first group to start tracking shared expenses
          </p>
          <Link
            to="/create-group"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Link>
        </div>
      )}
    </div>
  );
};

export default Groups;