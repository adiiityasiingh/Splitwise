import { User, Group, Expense } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Diana Wilson',
    email: 'diana@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'Eve Brown',
    email: 'eve@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face'
  }
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Goa Trip',
    description: 'Beach vacation with friends',
    users: [mockUsers[0], mockUsers[1], mockUsers[2]],
    totalExpenses: 0,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Weekend Trip',
    description: 'Mountain getaway',
    users: [mockUsers[0], mockUsers[3], mockUsers[4]],
    totalExpenses: 0,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Office Lunch',
    description: 'Team lunch expenses',
    users: [mockUsers[1], mockUsers[2], mockUsers[3]],
    totalExpenses: 0,
    createdAt: new Date('2024-01-25')
  }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    groupId: '1',
    description: 'Hotel booking',
    amount: 3000,
    paidBy: '1',
    splitType: 'equal',
    splits: [
      { userId: '1', amount: 1000 },
      { userId: '2', amount: 1000 },
      { userId: '3', amount: 1000 }
    ],
    createdAt: new Date('2024-01-16'),
    category: 'Accommodation'
  },
  {
    id: '2',
    groupId: '1',
    description: 'Dinner at restaurant',
    amount: 1500,
    paidBy: '2',
    splitType: 'percentage',
    splits: [
      { userId: '1', amount: 600, percentage: 40 },
      { userId: '2', amount: 450, percentage: 30 },
      { userId: '3', amount: 450, percentage: 30 }
    ],
    createdAt: new Date('2024-01-17'),
    category: 'Food'
  },
  {
    id: '3',
    groupId: '2',
    description: 'Car rental',
    amount: 2400,
    paidBy: '4',
    splitType: 'equal',
    splits: [
      { userId: '1', amount: 800 },
      { userId: '4', amount: 800 },
      { userId: '5', amount: 800 }
    ],
    createdAt: new Date('2024-01-21'),
    category: 'Transportation'
  },
  {
    id: '4',
    groupId: '3',
    description: 'Team lunch',
    amount: 900,
    paidBy: '2',
    splitType: 'equal',
    splits: [
      { userId: '2', amount: 300 },
      { userId: '3', amount: 300 },
      { userId: '4', amount: 300 }
    ],
    createdAt: new Date('2024-01-26'),
    category: 'Food'
  }
];

// Calculate total expenses for groups
mockGroups.forEach(group => {
  group.totalExpenses = mockExpenses
    .filter(expense => expense.groupId === group.id)
    .reduce((total, expense) => total + expense.amount, 0);
});