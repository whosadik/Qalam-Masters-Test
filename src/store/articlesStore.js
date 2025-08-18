let _articles = [
  {
    id: 101,
    title: "Прогноз климата методами ML",
    journal: "Международный журнал экологических исследований",
    category: "Экология",
    submittedDate: "18.08.2025",
    plagiarism: { originality: 91.2, matches: 8.8, topSource: 4.1 },
    files: { article: null, attachments: [] }, // заполни из своей формы
    status: "Submitted",
    notes: [],
    section: "Экологические науки",
    keywords: ["ML","климат","прогноз"],
  },
  // добавляй по мере надобности
];

export const articlesStore = {
  async listForScreening() {
    return _articles.filter(
      (a) => a.status === "Submitted" || a.status === "Initial Screening"
    );
  },

  async listByStatus(status) {
    return _articles.filter((a) => a.status === status);
  },

  async setStatus(id, status, payload = {}) {
    _articles = _articles.map((a) =>
      a.id === id ? { ...a, status, ...payload } : a
    );
    return _articles.find((a) => a.id === id);
  },

  async addNote(id, note) {
    _articles = _articles.map((a) =>
      a.id === id ? { ...a, notes: [ ...(a.notes || []), note ] } : a
    );
    return _articles.find((a) => a.id === id);
  },

  // --- новое: добавить/обновить рецензии ---
  async addReview(id, review) {
    _articles = _articles.map((a) =>
      a.id === id ? { ...a, reviews: [ ...(a.reviews || []), review ] } : a
    );
    return _articles.find((a) => a.id === id);
  },

  // --- новое: сформировать «готово к решению» ---
  async moveToDecision(id) {
    return this.setStatus(id, "Decision Pending");
  },

  // --- новое: зафиксировать решение ---
  async setDecision(id, decision, payload = {}) {
    // decision: 'accept' | 'minor' | 'major' | 'reject'
    const map = {
      accept: "Accepted",
      minor: "Revision Requested",
      major: "Revision Requested",
      reject: "Rejected",
    };
    const next = map[decision] || "Decision Pending";
    return this.setStatus(id, next, {
      decision,
      ...payload, // например { revisionType: 'minor'|'major', deadline: '2025-09-01' }
    });
  },
};