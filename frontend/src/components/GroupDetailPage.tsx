import AddExpenseForm from "./AddExpenseForm";
import GroupBalances from "./GroupBalances";
import { useExpenseContext } from "../context/ExpenseContext";

export default function GroupDetailPage({ groupId }) {
  const { groups } = useExpenseContext();
  const group = groups.find(g => g.id === groupId);

  if (!group) return <p>Group not found</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{group.name}</h1>
      <AddExpenseForm groupId={groupId} users={group.users} />
      <GroupBalances groupId={groupId} />
    </div>
  );
}
