// src/lib/storage.js
const ORG_KEY = "myOrg";
const JOURNALS_KEY = "myOrgJournals";
const reviewersKey = (jid) => `jr_${jid}_reviewers`;

export const storage = {
  // org
  getOrg() {
    try {
      return JSON.parse(localStorage.getItem(ORG_KEY) || "null");
    } catch {
      return null;
    }
  },
  setOrg(org) {
    localStorage.setItem(ORG_KEY, JSON.stringify(org));
  },

  // journals
  getJournals() {
    try {
      return JSON.parse(localStorage.getItem(JOURNALS_KEY) || "[]");
    } catch {
      return [];
    }
  },
  setJournals(arr) {
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(arr));
  },
  updateJournal(jid, patch) {
    const list = this.getJournals();
    const i = list.findIndex((j) => String(j.id) === String(jid));
    if (i >= 0) list[i] = { ...list[i], ...patch };
    else list.push({ id: jid, ...patch });
    this.setJournals(list);
    return list[i >= 0 ? i : list.length - 1];
  },
  getJournal(jid) {
    return this.getJournals().find((j) => String(j.id) === String(jid)) || null;
  },

  // reviewers
  getReviewers(jid) {
    try {
      return JSON.parse(localStorage.getItem(reviewersKey(jid)) || "[]");
    } catch {
      return [];
    }
  },
  setReviewers(jid, arr) {
    localStorage.setItem(reviewersKey(jid), JSON.stringify(arr));
  },
};
