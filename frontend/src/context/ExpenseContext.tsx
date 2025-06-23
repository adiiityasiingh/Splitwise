import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Expense, GroupBalance, PersonalBalance } from '../types';
import { mockUsers, mockGroups, mockExpenses } from '../services/mockData';
import { calculateGroupBalances, calculatePersonalBalance } from '../utils/balanceCalculator';

interface ExpenseContextType {
  users: User[];
  groups: Group[];
  expenses: Expense[];
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'totalExpenses'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  getGroupById: (id: string) => Group | undefined;
  getExpensesByGroupId: (groupId: string) => Expense[];
  getGroupBalances: (groupId: string) => GroupBalance | null;
  getPersonalBalance: (userId: string) => PersonalBalance;
  currentUser: User;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(mockUsers);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [currentUser] = useState<User>(mockUsers[0]); // Alice is the current user

  // Update group total expenses when expenses change
  useEffect(() => {
    setGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        totalExpenses: expenses
          .filter(expense => expense.groupId === group.id)
          .reduce((total, expense) => total + expense.amount, 0)
      }))
    );
  }, [expenses]);

  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt' | 'totalExpenses'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      totalExpenses: 0
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const getGroupById = (id: string) => groups.find(group => group.id === id);

  const getExpensesByGroupId = (groupId: string) => 
    expenses.filter(expense => expense.groupId === groupId);

  const getGroupBalances = (groupId: string): GroupBalance | null => {
    const group = getGroupById(groupId);
    if (!group) return null;
    
    const groupExpenses = getExpensesByGroupId(groupId);
    return calculateGroupBalances(group, groupExpenses, users);
  };

  const getPersonalBalance = (userId: string): PersonalBalance => {
    return calculatePersonalBalance(userId, groups, expenses, users);
  };

  const value: ExpenseContextType = {
    users,
    groups,
    expenses,
    addGroup,
    addExpense,
    getGroupById,
    getExpensesByGroupId,
    getGroupBalances,
    getPersonalBalance,
    currentUser
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};