import { useState } from 'react';
import axios from 'axios';

export default function AddExpenseForm({ groupId, users }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [splits, setSplits] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      description,
      amount: parseFloat(amount),
      paid_by: parseInt(paidBy),
      split_type: splitType,
      splits: splitType === 'EQUAL' 
        ? users.map(u => ({ user_id: u.id })) 
        : splits
    };
    await axios.post(`http://localhost:8000/groups/${groupId}/expenses`, payload);
    alert('Expense added');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="border rounded p-2 w-full" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input className="border rounded p-2 w-full" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <select className="border rounded p-2 w-full" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
        <option value="">Who paid?</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <select className="border rounded p-2 w-full" value={splitType} onChange={e => setSplitType(e.target.value)}>
        <option value="EQUAL">Equal</option>
        <option value="PERCENTAGE">Percentage</option>
      </select>
      {splitType === 'PERCENTAGE' && users.map(u => (
        <input
          key={u.id}
          className="border rounded p-2 w-full"
          type="number"
          placeholder={`${u.name}'s %`}
          onChange={e => {
            const updated = splits.filter(s => s.user_id !== u.id);
            setSplits([...updated, { user_id: u.id, percentage: parseFloat(e.target.value) }]);
          }}
        />
      ))}
      <button className="bg-emerald-600 text-white rounded p-2">Add Expense</button>
    </form>
  );
}
