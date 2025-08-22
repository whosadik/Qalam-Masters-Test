// src/lib/paths.js
export const path = {
  moderator: "/moderator",
  orgNew: "/moderator/organizations/new",
  org(id = 1) {
    return `/moderator/organizations/${id}`;
  },
  orgEdit(id = 1) {
    return `/moderator/organizations/${id}/edit`;
  },
  journalNew(orgId = 1) {
    return `/moderator/organizations/${orgId}/add-journal`;
  },
  journal(jid) {
    return `/moderator/journals/${jid}`;
  },
  journalSettings(jid) {
    return `/moderator/journals/${jid}/settings`;
  },
  journalReviewers(jid) {
    return `/moderator/journals/${jid}/reviewers`;
  },
  journalEditorial(jid) {
    return `/moderator/journals/${jid}/editorial`;
  },
};
