import { User, Group, Expense, Balance, GroupBalance, OwedRelationship, PersonalBalance } from '../types';

export const calculateGroupBalances = (
  group: Group,
  expenses: Expense[],
  users: User[]
): GroupBalance => {
  const userBalances: { [userId: string]: number } = {};
  
  // Initialize balances
  group.users.forEach(user => {
    userBalances[user.id] = 0;
  });

  // Calculate what each person paid and owes
  expenses.forEach(expense => {
    // Add to payer's balance (they paid for others)
    userBalances[expense.paidBy] += expense.amount;
    
    // Subtract what each person owes
    expense.splits.forEach(split => {
      userBalances[split.userId] -= split.amount;
    });
  });

  // Convert to Balance array
  const balances: Balance[] = group.users.map(user => ({
    userId: user.id,
    userName: user.name,
    amount: userBalances[user.id]
  }));

  // Calculate owed relationships
  const owedRelationships: OwedRelationship[] = [];
  const debtors = balances.filter(b => b.amount < 0).sort((a, b) => a.amount - b.amount);
  const creditors = balances.filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debt = Math.abs(debtors[i].amount);
    const credit = creditors[j].amount;
    const settleAmount = Math.min(debt, credit);

    if (settleAmount > 0) {
      owedRelationships.push({
        from: debtors[i].userId,
        fromName: debtors[i].userName,
        to: creditors[j].userId,
        toName: creditors[j].userName,
        amount: settleAmount
      });
    }

    debtors[i].amount += settleAmount;
    creditors[j].amount -= settleAmount;

    if (Math.abs(debtors[i].amount) < 0.01) i++;
    if (Math.abs(creditors[j].amount) < 0.01) j++;
  }

  return {
    groupId: group.id,
    groupName: group.name,
    balances,
    owedRelationships
  };
};

export const calculatePersonalBalance = (
  userId: string,
  groups: Group[],
  expenses: Expense[],
  users: User[]
): PersonalBalance => {
  const userGroups = groups.filter(group => 
    group.users.some(user => user.id === userId)
  );

  const groupBalances: GroupBalance[] = [];
  let totalOwed = 0;
  let totalOwedToYou = 0;

  userGroups.forEach(group => {
    const groupExpenses = expenses.filter(expense => expense.groupId === group.id);
    const groupBalance = calculateGroupBalances(group, groupExpenses, users);
    groupBalances.push(groupBalance);

    // Calculate personal amounts for this group
    const userBalance = groupBalance.balances.find(b => b.userId === userId);
    if (userBalance) {
      if (userBalance.amount < 0) {
        totalOwed += Math.abs(userBalance.amount);
      } else {
        totalOwedToYou += userBalance.amount;
      }
    }
  });

  return {
    totalOwed,
    totalOwedToYou,
    netBalance: totalOwed - totalOwedToYou,
    groupBalances
  };
};