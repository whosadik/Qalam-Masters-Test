import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

export async function listJournals({ search, ordering, page, page_size } = {}) {
  const url = withParams(API.JOURNALS, { search, ordering, page, page_size });
  const { data } = await http.get(url);
  return data; // {count, results, next, previous}
}

export async function createJournal(payload) {
  const { data } = await http.post(API.JOURNALS, payload);
  return data;
}

export async function getJournal(id) {
  const { data } = await http.get(API.JOURNAL_ID(id));
  return data;
}

export async function updateJournal(id, payload, method = "put") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.JOURNAL_ID(id), payload);
  return data;
}

export async function deleteJournal(id) {
  await http.delete(API.JOURNAL_ID(id));
}

// memberships
export async function listJournalMemberships() {
  const { data } = await http.get(API.JOURNAL_MEMBERSHIPS);
  return data; // array
}

export async function createJournalMembership(payload) {
  const { data } = await http.post(API.JOURNAL_MEMBERSHIPS, payload);
  return data;
}

export async function getJournalMembership(id) {
  const { data } = await http.get(API.JOURNAL_MEMBERSHIP_ID(id));
  return data;
}

export async function updateJournalMembership(id, payload, method = "put") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.JOURNAL_MEMBERSHIP_ID(id), payload);
  return data;
}

export async function deleteJournalMembership(id) {
  await http.delete(API.JOURNAL_MEMBERSHIP_ID(id));
}
