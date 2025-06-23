import UserBalances from "./UserBalances";

export default function UserDashboard({ userId }) {
  return (
    <div>
      <UserBalances userId={userId} />
    </div>
  );
}
