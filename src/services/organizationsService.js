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

//нормализация полей под API (сайт/телефон) + очистка + МАППИНГ ИМЁН
const normalizeOrgPayload = (raw = {}) => {
  const website =
    raw.website && !/^https?:\/\//i.test(raw.website)
      ? `https://${raw.website.trim()}`
      : raw.website?.trim();

  const head_phone = raw.head_phone
    ? (() => {
       const digits = String(raw.head_phone).replace(/\s+/g, "");
        return /^\+/.test(digits) ? digits : `+${digits}`;
      })()
    : raw.head_phone;
     // маппинг UI → API:
        // - postal_zip (UI) -> postal_code (API)
          // - social_link (UI, строка) -> social_links (API, массив)
          const postal_code = raw.postal_zip?.trim();
          const social_links =
            typeof raw.social_link === "string" && raw.social_link.trim()
              ? [raw.social_link.trim()]
              : Array.isArray(raw.social_links)
              ? raw.social_links
              : [];

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
   postal_code,
   social_links,
    // НИКОГДА не отправляем служебные поля типа is_verified, created_by и т.п. из клиентской формы
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

// --- organizations -------------------------------------------

export async function listOrganizations(params = {}) {
  // params: { search, page, page_size, ... }
  const { data } = await http.get(API.ORGS, { params });
  return data; // оставляем как есть (если пагинация — придёт {count, results, ...})
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
  const { data } = await http.get(API.ORG_MEMBERSHIPS, { params });
  return data;
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

export async function updateOrganizationMembership(id, payload, method = "put") {
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
