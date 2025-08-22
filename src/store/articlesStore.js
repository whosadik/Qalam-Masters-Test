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
let _reviewers = [
  { id: "rv-1", name: "Ы. Фафыв", email: "y@example.com", active: true, fields: ["Гуманитарные"], workload: 0, about: "ывафыва" },
  { id: "rv-2", name: "И. Ким",   email: "kim@example.com", active: true, fields: ["Экология","ML"], workload: 2, about: "экология, ML" },
  { id: "rv-3", name: "С. Нурлыбек", email: "sn@example.com", active: false, fields: ["История"], workload: 1, about: "история наук" },
  // добавляй своих
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
    async listReviewers() {
    return [..._reviewers].sort((a,b) => (b.active - a.active) || (a.workload - b.workload));
    
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
  async searchReviewers(q) {
    const s = (q || "").toLowerCase();
    if (!s) return this.listReviewers();
    return (await this.listReviewers()).filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) ||
      (p.fields||[]).join(",").toLowerCase().includes(s)
    );
  },
    async assignReviewers(articleId, reviewers, deadline) {
    if (!Array.isArray(reviewers) || reviewers.length === 0 || reviewers.length > 2) {
      throw new Error("Нужно выбрать 1–2 рецензента");
    }
    // уменьшаем «свободную нагрузку»
    reviewers.forEach(r => {
      const idx = _reviewers.findIndex(x => x.id === r.id);
      if (idx >= 0) _reviewers[idx].workload = (_reviewers[idx].workload || 0) + 1;
    });

    // привязываем к статье
    _articles = _articles.map(a => {
      if (a.id !== articleId) return a;
      return {
        ...a,
        review: {
          ...(a.review || {}),
          assignments: [
            ...(a.review?.assignments || []),
            ...reviewers.map(r => ({
              reviewerId: r.id, name: r.name, email: r.email,
              invitedAt: new Date().toISOString(),
              deadline, status: "invited",
            })),
          ],
        },
        status: "In Review", // или "Reviewer Assignment" — если хочешь ожидать акцепта
      };
    });
   await this.addNote(articleId, {
      type: "assignment",
      reviewers: reviewers.map(r => ({ id: r.id, name: r.name, email: r.email })),
      deadline,
    });

    return _articles.find(a => a.id === articleId);
  },


  /** (опционально) отметить отклик рецензента */
  async markInvitation(articleId, reviewerId, action /* 'accepted'|'declined' */) {
    _articles = _articles.map((a) => {
      if (a.id !== articleId) return a;
      const as = a.review?.assignments?.map(x =>
        x.reviewerId === reviewerId ? { ...x, status: action } : x
      );
      return { ...a, review: { ...(a.review||{}), assignments: as } };
    });
    return _articles.find((a) => a.id === articleId);
  },
    async runPlagiarism(id) {
    // имитация результатов
    const originality = Math.round(75 + Math.random() * 25); // 75–100
    const matches = 100 - originality;
    const reportUrl = `https://report.example.com/${id}-${Date.now()}`;

    _articles = _articles.map(a =>
      a.id === id
        ? {
            ...a,
            plagiarism: {
              originality,
              matches,
              topSource: Math.round(matches * 0.5 * 10) / 10,
              reportUrl,
            },
          }
        : a
    );

    await this.addNote(id, {
      type: "plagiarism_run",
      when: new Date().toISOString(),
      result: { originality, matches, reportUrl },
    });

    return _articles.find(a => a.id === id);
  },


};

