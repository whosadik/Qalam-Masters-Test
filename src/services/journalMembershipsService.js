// src/services/journalMembershipsService.js
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

// === Список участников журнала (с фильтром journalId) ===
export async function listJournalMembers(
  journalId,
  { page_size = 200, page = 1 } = {}
) {
  try {
    const url = withParams(API.JOURNAL_MEMBERSHIPS, {
      journal: Number(journalId), // <-- фильтр по журналу
      page_size,
      page,
    });

    const { data } = await http.get(url);

    let results = [];
    if (Array.isArray(data?.results)) results = data.results;
    else if (Array.isArray(data)) results = data;

    // страховка: вдруг бэк отдаёт всех — фильтруем ещё раз на фронте
    return results.filter((m) => Number(m.journal) === Number(journalId));
  } catch (e) {
    console.error("Ошибка загрузки участников журнала:", e);
    return [];
  }
}


export async function listMyJournalMemberships({ page_size = 300, page = 1 } = {}) {
  try {
    const url = withParams(API.JOURNAL_MEMBERSHIPS, {
      mine: true,       // <- бэк уже поддерживает (ты это используешь в EditorDashboard)
      page_size,
      page,
    });
    const { data } = await http.get(url);
    return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Ошибка загрузки моих ролей в журналах:", e?.response?.data || e);
    return [];
  }
}
// === Добавить участника ===
export async function addJournalMember({ user, journal, role }) {
  const { data } = await http.post(API.JOURNAL_MEMBERSHIPS, {
    user: Number(user),
    journal: Number(journal),
    role: String(role),
  });
  return data;
}

// === Обновить роль участника ===
export async function updateJournalMemberRole(id, role) {
  const { data } = await http.patch(API.JOURNAL_MEMBERSHIP_ID(id), {
    role: String(role),
  });
  return data;
}

// === Удалить участника ===
export async function removeJournalMember(id) {
  await http.delete(API.JOURNAL_MEMBERSHIP_ID(id));
}

