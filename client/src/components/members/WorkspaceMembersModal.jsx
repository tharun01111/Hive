import { useState } from "react";
import { useWorkspaceStore } from "../../store/workspace.store.js";
import { inviteMemberApi, removeMemberApi } from "../../api/workspace.api.js";
import Modal from "../ui/Modal.jsx";
import MemberList from "./MemberList.jsx";
import InviteMemberModal from "./InviteMemberModal.jsx";
import { useAuthStore } from "../../store/auth.store.js";

export default function WorkspaceMembersModal({ isOpen, onClose }) {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const user = useAuthStore((s) => s.user);
  const [showInvite, setShowInvite] = useState(false);

  const members = activeWorkspace?.members ?? [];
  const currentUserMember = members.find((m) => m.user.id === user?.id);
  const currentUserRole = currentUserMember?.role ?? "MEMBER";

  const handleInvite = async ({ email, role }) => {
    const { data } = await inviteMemberApi(activeWorkspace.id, { email, role });

    // Update workspace members in store
    const updated = {
      ...activeWorkspace,
      members: [...members, data.member],
    };
    updateWorkspace(activeWorkspace.id, updated);
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the workspace?")) return;

    try {
      await removeMemberApi(activeWorkspace.id, userId);
      const updated = {
        ...activeWorkspace,
        members: members.filter((m) => m.user.id !== userId),
      };
      updateWorkspace(activeWorkspace.id, updated);
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${activeWorkspace?.name} — Members`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
            {currentUserRole === "ADMIN" && (
              <button
                onClick={() => setShowInvite(true)}
                className="btn-primary text-xs py-1.5"
              >
                Invite member
              </button>
            )}
          </div>

          <MemberList
            members={members}
            onRemove={handleRemove}
            currentUserRole={currentUserRole}
          />
        </div>
      </Modal>

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
        title="Invite to workspace"
      />
    </>
  );
}
