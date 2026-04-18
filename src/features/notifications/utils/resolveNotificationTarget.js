/**
 * Maps notification `link` values from the API to in-app routes.
 * Backend sometimes uses paths that do not exist in the SPA (e.g. /admin/companies/:id).
 */
export function resolveNotificationTarget(rawUrl) {
  if (rawUrl == null) return null;
  const s = String(rawUrl).trim();
  if (!s) return null;

  if (/^https?:\/\//i.test(s)) {
    return { kind: 'external', href: s };
  }

  const path = s.startsWith('/') ? s : `/${s}`;
  const hashIdx = path.indexOf('#');
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : '';
  const pathname = hashIdx >= 0 ? path.slice(0, hashIdx) : path;

  const adminCompanies = /^\/admin\/companies\/(\d+)\/?$/.exec(pathname);
  if (adminCompanies) {
    return { kind: 'internal', to: `/manager?companyId=${adminCompanies[1]}` };
  }

  const campaigns = /^\/campaigns\/(\d+)\/?$/.exec(pathname);
  if (campaigns) {
    return { kind: 'internal', to: `/employer?campaignId=${campaigns[1]}` };
  }

  const inv = /^\/interview-invitations\/(\d+)\/?$/.exec(pathname);
  if (inv) {
    return {
      kind: 'internal',
      to: `/interview-invitations?invitationId=${inv[1]}`,
    };
  }

  return { kind: 'internal', to: `${pathname}${hash}` };
}
