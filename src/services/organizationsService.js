import { http } from "@/lib/http";
import { API } from "@/constants/api";

// organizations
export async function listOrganizations() {
  const { data } = await http.get(API.ORGS);
  return data; // array
}

export async function createOrganization(payload) {
  const { data } = await http.post(API.ORGS, payload);
  return data;
}

export async function getOrganization(id) {
  const { data } = await http.get(API.ORG_ID(id));
  return data;
}

export async function updateOrganization(id, payload, method = "put") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.ORG_ID(id), payload);
  return data;
}

export async function deleteOrganization(id) {
  await http.delete(API.ORG_ID(id));
}

// memberships
export async function listOrganizationMemberships() {
  const { data } = await http.get(API.ORG_MEMBERSHIPS);
  return data; // array
}

export async function createOrganizationMembership(payload) {
  const { data } = await http.post(API.ORG_MEMBERSHIPS, payload);
  return data;
}

export async function getOrganizationMembership(id) {
  const { data } = await http.get(API.ORG_MEMBERSHIP_ID(id));
  return data;
}

export async function updateOrganizationMembership(id, payload, method = "put") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.ORG_MEMBERSHIP_ID(id), payload);
  return data;
}

export async function deleteOrganizationMembership(id) {
  await http.delete(API.ORG_MEMBERSHIP_ID(id));
}
