// src/acl/permissions.js
export const ROLE = {
  CHIEF: "chief_editor",
  EDITOR: "editor",
  MANAGER: "manager",
  PROOF: "proofreader",
  SECR: "secretary",
  REVIEWER: "reviewer",
};

export const PERMISSIONS = {
  INVITE_MEMBERS: [ROLE.CHIEF, ROLE.MANAGER, ROLE.EDITOR],
  ASSIGN_REVIEWERS: [ROLE.CHIEF, ROLE.EDITOR, ROLE.MANAGER],
  SET_STATUS: [ROLE.CHIEF, ROLE.EDITOR, ROLE.MANAGER],
  EDIT_JOURNAL: [ROLE.CHIEF, ROLE.MANAGER],
};

export function can(userRoles = [], action) {
  const allowed = PERMISSIONS[action] || [];
  return userRoles.some((r) => allowed.includes(r));
}
