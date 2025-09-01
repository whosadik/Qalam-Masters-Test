// src/services/organizationsService.js
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

// --- helpers -------------------------------------------------

// фильтруем пустые строки/undefined/null
const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

// нормализация полей под OpenAPI (website/phone/…)
// ВАЖНО: в OpenAPI поля называются postal_zip (string) и social_link (string, uri)
const normalizeOrgPayload = (raw = {}) => {
  const website = raw.website?.trim()
    ? /^https?:\/\//i.test(raw.website)
      ? raw.website.trim()
      : `https://${raw.website.trim()}`
    : raw.website;

  const head_phone = raw.head_phone
    ? (() => {
        const digits = String(raw.head_phone).replace(/\s+/g, "");
        return /^\+/.test(digits) ? digits : `+${digits}`;
      })()
    : raw.head_phone;

  // ДЕРЖИМСЯ СХЕМЫ:
  // - postal_zip (string) — оставляем как есть
  // - social_link (string, uri) — одна строка (если прислали массив — возьмём первую непустую)
  let social_link = raw.social_link;
  if (!social_link && Array.isArray(raw.social_links)) {
    const first = raw.social_links.find(
      (x) => typeof x === "string" && x.trim()
    );
    if (first) social_link = first;
  }
  if (social_link && !/^https?:\/\//i.test(social_link)) {
    social_link = `https://${String(social_link).trim()}`;
  }

  return clean({
    title: raw.title?.trim(),
    description: raw.description?.trim(),
    head_name: raw.head_name?.trim(),
    head_phone,
    head_email: raw.head_email?.trim(),
    address: raw.address?.trim(),
    bin: raw.bin?.trim(),
    website,
    country: raw.country?.trim(),
    city: raw.city?.trim(),
    postal_zip: raw.postal_zip?.trim(), // имя поля как в OpenAPI
    social_link, // одиночная строка, а не массив
    // НЕ отправляем служебные поля: is_verified, created_by, rating, etc.
  });
};

// вытаскиваем ошибки DRF в удобочитаемую строку
const extractDRFError = (err) => {
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return err.message || "Bad Request";
  try {
    const parts = [];
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
      else if (typeof v === "string") parts.push(`${k}: ${v}`);
      else parts.push(`${k}: ${JSON.stringify(v)}`);
    }
    return parts.join(" | ");
  } catch {
    return JSON.stringify(data);
  }
};

// allowlist для query в списках (по OpenAPI: search, page, page_size, ordering)
const normalizeListParams = (params = {}) => {
  const out = {};
  const { search, page, page_size, ordering } = params;
  if (search) out.search = search;
  if (page) out.page = page;
  if (page_size) out.page_size = page_size;
  if (ordering) out.ordering = ordering;
  return out;
};

// --- organizations -------------------------------------------

export async function listOrganizations(params = {}) {
  const query = normalizeListParams(params);
  const { data } = await http.get(API.ORGS, { params: query });
  // бэк отдаёт пагинацию {count, results, ...} — возвращаем как есть
  return data;
}

export async function createOrganization(payloadRaw) {
  const payload = normalizeOrgPayload(payloadRaw);
  try {
    const { data } = await http.post(API.ORGS, payload);
    return data; // { id, title, ... }
  } catch (err) {
    err.displayMessage = extractDRFError(err);
    throw err;
  }
}

export async function getOrganization(id) {
  const { data } = await http.get(API.ORG_ID(id));
  return data;
}

export async function updateOrganization(id, payloadRaw, method = "patch") {
  const payload = normalizeOrgPayload(payloadRaw);
  const fn = method === "put" ? http.put : http.patch;
  try {
    const { data } = await fn(API.ORG_ID(id), payload);
    return data;
  } catch (err) {
    err.displayMessage = extractDRFError(err);
    throw err;
  }
}

export async function deleteOrganization(id) {
  await http.delete(API.ORG_ID(id));
}

// --- memberships ---------------------------------------------

export async function listOrganizationMemberships(params = {}) {
  const query = normalizeListParams(params);
  const { data } = await http.get(API.ORG_MEMBERSHIPS, { params: query });
  return data; // пагинация
}

export async function createOrganizationMembership(payload) {
  try {
    const { data } = await http.post(API.ORG_MEMBERSHIPS, payload);
    return data;
  } catch (err) {
    err.displayMessage = extractDRFError(err);
    throw err;
  }
}

export async function getOrganizationMembership(id) {
  const { data } = await http.get(API.ORG_MEMBERSHIP_ID(id));
  return data;
}

export async function updateOrganizationMembership(
  id,
  payload,
  method = "put"
) {
  const fn = method === "put" ? http.put : http.patch;
  try {
    const { data } = await fn(API.ORG_MEMBERSHIP_ID(id), payload);
    return data;
  } catch (err) {
    err.displayMessage = extractDRFError(err);
    throw err;
  }
}

export async function deleteOrganizationMembership(id) {
  await http.delete(API.ORG_MEMBERSHIP_ID(id));
}
