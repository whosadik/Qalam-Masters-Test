// src/store/articlesStore.js

// ЕДИНЫЕ СТАТУСЫ (должны совпадать с /constants/articleStatus)
const STAT = {
  SUBMITTED: "Submitted",
  INITIAL_SCREENING: "Initial Screening",
  REVIEWER_ASSIGNMENT: "Reviewer Assignment",
  IN_REVIEW: "In Review",
  DECISION_PENDING: "Decision Pending",
  RETURNED_TO_AUTHOR: "Returned to Author",
  ACCEPTED: "Accepted",
  REVISION_REQUESTED: "Revision Requested",
  REJECTED: "Rejected",
};

// --- начальные статьи (демо) ---
let _articles = [
  {
    id: 101,
    title: "Прогноз климата методами ML",
    journal: "Международный журнал экологических исследований",
    category: "Экология",
    section: "Экологические науки",
    submittedDate: "18.08.2025",
    keywords: ["ML", "климат", "прогноз"],
    files: { article: null, attachments: [] },
    plagiarism: { originality: 91.2, matches: 8.8, topSource: 4.1 },
    status: STAT.SUBMITTED,
    notes: [],
    // review: { assignments: [...], reviews: [...] } — появится позже
  },
];

// --- единая база рецензентов в localStorage ---
const KEY_REVIEWERS = "qalamReviewers";
function loadReviewers() {
  try {
    return JSON.parse(localStorage.getItem(KEY_REVIEWERS) || "[]");
  } catch {
    return [];
  }
}
function saveReviewers(arr) {
  localStorage.setItem(KEY_REVIEWERS, JSON.stringify(arr));
}
let _reviewers = loadReviewers();
if (!_reviewers.length) {
  _reviewers = [
    {
      id: "rv-1",
      name: "Ы. Фафыв",
      email: "y@example.com",
      active: true,
      fields: ["Гуманитарные"],
      workload: 0,
      about: "ывафыва",
    },
    {
      id: "rv-2",
      name: "И. Ким",
      email: "kim@example.com",
      active: true,
      fields: ["Экология", "ML"],
      workload: 2,
      about: "экология, ML",
    },
    {
      id: "rv-3",
      name: "С. Нурлыбек",
      email: "sn@example.com",
      active: false,
      fields: ["История"],
      workload: 1,
      about: "история наук",
    },
  ];
  saveReviewers(_reviewers);
}

export const articlesStore = {
  // ----------- БАЗОВОЕ ----------
  async getById(id) {
    return _articles.find((a) => String(a.id) === String(id));
  },
  async setStatus(id, status, payload = {}) {
    _articles = _articles.map((a) =>
      a.id === id ? { ...a, status, ...payload } : a
    );
    return _articles.find((a) => a.id === id);
  },
  async addNote(id, note) {
    _articles = _articles.map((a) =>
      a.id === id ? { ...a, notes: [...(a.notes || []), note] } : a
    );
    return _articles.find((a) => a.id === id);
  },

  // ----------- ОЧЕРЕДИ/СПИСКИ ----------
  async listForScreening() {
    return _articles.filter(
      (a) => a.status === STAT.SUBMITTED || a.status === STAT.INITIAL_SCREENING
    );
  },
  async listByStatus(status) {
    return _articles.filter((a) => a.status === status);
  },

  // ----------- АНТИПЛАГИАТ (мок) ----------
  async runPlagiarism(id) {
    const originality = Math.round(75 + Math.random() * 25); // 75–100
    const matches = 100 - originality;
    const reportUrl = `https://report.example.com/${id}-${Date.now()}`;

    _articles = _articles.map((a) =>
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

    return _articles.find((a) => a.id === id);
  },

  // ----------- РЕЦЕНЗЕНТЫ (единая база) ----------
  async listReviewers() {
    _reviewers = loadReviewers();
    return [..._reviewers].sort(
      (a, b) => b.active - a.active || (a.workload || 0) - (b.workload || 0)
    );
  },
  async getReviewerById(id) {
    _reviewers = loadReviewers();
    return _reviewers.find((r) => String(r.id) === String(id));
  },
  async addReviewer({ name, email, fields = [], active = true }) {
    _reviewers = loadReviewers();
    const id = `rv-${Date.now()}`;
    const rec = { id, name, email, fields, active, workload: 0 };
    _reviewers.push(rec);
    saveReviewers(_reviewers);
    return rec;
  },
  async updateReviewer(id, patch) {
    _reviewers = loadReviewers().map((r) =>
      r.id === id ? { ...r, ...patch } : r
    );
    saveReviewers(_reviewers);
    return this.getReviewerById(id);
  },
  async deleteReviewer(id) {
    _reviewers = loadReviewers().filter((r) => r.id !== id);
    saveReviewers(_reviewers);
  },
  async searchReviewers(q) {
    const s = (q || "").toLowerCase();
    const list = await this.listReviewers();
    if (!s) return list;
    return list.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(s) ||
        (p.email || "").toLowerCase().includes(s) ||
        (p.fields || []).join(",").toLowerCase().includes(s)
    );
  },

  // ----------- НАЗНАЧЕНИЕ РЕЦЕНЗЕНТОВ ----------
  async assignReviewers(articleId, reviewers, deadline) {
    if (
      !Array.isArray(reviewers) ||
      reviewers.length < 1 ||
      reviewers.length > 2
    ) {
      throw new Error("Нужно выбрать 1–2 рецензента");
    }

    // +нагрузка рецензентам
    _reviewers = loadReviewers();
    reviewers.forEach((r) => {
      const i = _reviewers.findIndex((x) => x.id === r.id);
      if (i >= 0) _reviewers[i].workload = (_reviewers[i].workload || 0) + 1;
    });
    saveReviewers(_reviewers);

    // прикрепляем к статье
    _articles = _articles.map((a) => {
      if (a.id !== articleId) return a;
      const prev = a.review?.assignments || [];
      return {
        ...a,
        review: {
          ...(a.review || {}),
          assignments: [
            ...prev,
            ...reviewers.map((r) => ({
              reviewerId: r.id,
              name: r.name,
              email: r.email,
              invitedAt: new Date().toISOString(),
              deadline,
              status: "invited",
            })),
          ],
        },
        // можно оставить на этапе назначения:
        // status: STAT.REVIEWER_ASSIGNMENT,
        // а в работу перевести после акцепта. Либо сразу:
        status: STAT.IN_REVIEW,
      };
    });

    await this.addNote(articleId, { type: "assignment", reviewers, deadline });
    return _articles.find((a) => a.id === articleId);
  },

  // отклик рецензента
  async markInvitation(
    articleId,
    reviewerId,
    status /* invited|accepted|declined|submitted */
  ) {
    _articles = _articles.map((a) => {
      if (a.id !== articleId) return a;
      const as = (a.review?.assignments || []).map((x) =>
        x.reviewerId === reviewerId ? { ...x, status } : x
      );
      return { ...a, review: { ...(a.review || {}), assignments: as } };
    });
    return _articles.find((a) => a.id === articleId);
  },
  async acceptInvite(articleId, reviewerId) {
    return this.markInvitation(articleId, reviewerId, "accepted");
  },
  async declineInvite(articleId, reviewerId) {
    return this.markInvitation(articleId, reviewerId, "declined");
  },

  // задания/история для кабинета рецензента
  async listAssignmentsForReviewer(reviewerId) {
    const res = [];
    for (const a of _articles) {
      const mine = (a.review?.assignments || []).find(
        (x) => x.reviewerId === reviewerId && x.status !== "submitted"
      );
      if (mine) res.push({ article: a, assignment: mine });
    }
    return res;
  },
  async listReviewsByReviewer(reviewerId) {
    const res = [];
    for (const a of _articles) {
      const rev = (a.review?.reviews || []).find(
        (r) => r.reviewerId === reviewerId
      );
      if (rev) res.push({ article: a, review: rev });
    }
    return res;
  },

  // отправка рецензии
  async submitReview(
    articleId,
    reviewerId,
    review /* {novelty, validity, style, errorsQuality, commentForAuthors, confidentialNote, recommendation, score} */
  ) {
    let updated = null;
    _articles = _articles.map((a) => {
      if (a.id !== articleId) return a;
      const next = { ...a };
      next.review = next.review || {};
      next.review.reviews = next.review.reviews || [];
      next.review.reviews.push({
        reviewerId,
        submittedAt: new Date().toISOString(),
        ...review,
      });
      next.review.assignments = (next.review.assignments || []).map((x) =>
        x.reviewerId === reviewerId ? { ...x, status: "submitted" } : x
      );
      updated = next;
      return next;
    });
    await this.addNote(articleId, { type: "review", reviewerId, review });
    return updated;
  },

  // ----------- РЕШЕНИЕ ----------
  async moveToDecision(id) {
    return this.setStatus(id, STAT.DECISION_PENDING);
  },
  async setDecision(
    id,
    decision /* 'accept' | 'minor' | 'major' | 'reject' */,
    payload = {}
  ) {
    const next =
      {
        accept: STAT.ACCEPTED,
        minor: STAT.REVISION_REQUESTED,
        major: STAT.REVISION_REQUESTED,
        reject: STAT.REJECTED,
      }[decision] || STAT.DECISION_PENDING;

    return this.setStatus(id, next, {
      decision,
      ...payload, // напр.: { revisionType: 'minor'|'major', deadline: '2025-09-01' }
    });
  },
};
