import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserBalances({ userId }) {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/users/${userId}/balances`).then(res => setBalances(res.data));
  }, [userId]);

  return (
    <div>
      <h2 className="font-bold">Your Balances</h2>
      {balances.map((b, i) => (
        <p key={i}>{b.group_name}: You owe {b.to} ₹{b.amount}</p>
      ))}
    </div>
  );
}
