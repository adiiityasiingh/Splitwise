import { useEffect, useState } from 'react';
import axios from 'axios';

export default function GroupBalances({ groupId }) {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/groups/${groupId}/balances`).then(res => setBalances(res.data));
  }, [groupId]);

  return (
    <div>
      <h2 className="font-bold">Group Balances</h2>
      {balances.map((b, i) => (
        <p key={i}>{b.from} owes {b.to} ₹{b.amount}</p>
      ))}
    </div>
  );
}
