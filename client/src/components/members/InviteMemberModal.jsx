import { useState } from "react";
import Modal from "../ui/Modal.jsx";

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  title = "Invite member",
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      await onInvite({ email: email.trim().toLowerCase(), role });
      setEmail("");
      setRole("MEMBER");
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="teammate@example.com"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Role
          </label>
          <div className="flex gap-2">
            {["MEMBER", "ADMIN"].map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-3 rounded-notion text-sm font-medium border transition-colors ${
                  role === r
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                {r === "ADMIN" ? "Admin" : "Member"}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1.5">
            {role === "ADMIN"
              ? "Admins can manage members, projects and settings"
              : "Members can view and contribute to projects"}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-notion">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn-primary"
          >
            {loading ? "Inviting..." : "Send invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
