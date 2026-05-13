import { useState } from "react";
import { useProjectStore } from "../../store/project.store.js";
import {
  inviteProjectMemberApi,
  removeProjectMemberApi,
} from "../../api/project.api.js";
import Modal from "../ui/Modal.jsx";
import MemberList from "./MemberList.jsx";
import InviteMemberModal from "./InviteMemberModal.jsx";
import { useAuthStore } from "../../store/auth.store.js";

export default function ProjectMembersModal({ isOpen, onClose }) {
  const activeProject = useProjectStore((s) => s.activeProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const user = useAuthStore((s) => s.user);
  const [showInvite, setShowInvite] = useState(false);

  const members = activeProject?.members ?? [];
  const currentUserMember = members.find((m) => m.user.id === user?.id);
  const currentUserRole = currentUserMember?.role ?? "MEMBER";

  const handleInvite = async ({ email, role }) => {
    const { data } = await inviteProjectMemberApi(activeProject.id, {
      email,
      role,
    });
    const updated = {
      ...activeProject,
      members: [...members, data.member],
    };
    updateProject(activeProject.id, updated);
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;

    try {
      await removeProjectMemberApi(activeProject.id, userId);
      const updated = {
        ...activeProject,
        members: members.filter((m) => m.user.id !== userId),
      };
      updateProject(activeProject.id, updated);
    } catch (err) {
      console.error("Failed to remove project member", err);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${activeProject?.name} — Members`}
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
        title="Invite to project"
      />
    </>
  );
}
