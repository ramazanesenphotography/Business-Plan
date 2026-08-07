export default function UserToast({ message, type, onClose }) {
  return (
    <div className={`admin-toast ${type}`}>
      <span>{message}</span>
      <button type="button" onClick={onClose}>×</button>
    </div>
  );
}
