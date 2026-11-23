export function hasPermission(profile, permission) {
  return Array.isArray(profile?.permissoes) && profile.permissoes.includes(permission);
}

export function getPermissionApiRoute(permission) {
  const [baseRoute] = permission.split(":");
  return `/api/${baseRoute}`;
}
