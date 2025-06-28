export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  users: User[];
  totalExpenses: number;
  createdAt: Date;
}

export type SplitType = 'equal' | 'percentage';

export interface Split {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitType: SplitType;
  splits: Split[];
  createdAt: Date;
  category?: string;
}

export interface Balance {
  to: ReactNode;
  from: ReactNode;
  userId: string;
  userName: string;
  amount: number; // positive means they owe, negative means they are owed
}

export interface GroupBalance {
  groupId: string;
  groupName: string;
  balances: Balance[];
  owedRelationships: OwedRelationship[];
}

export interface OwedRelationship {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface PersonalBalance {
  totalOwed: number; // what you owe others
  totalOwedToYou: number; // what others owe you
  netBalance: number; // negative if you're owed money, positive if you owe money
  groupBalances: GroupBalance[];
}