import React from 'react'

export default function RoleGuard({ role, children, fallback = null }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!user || !user.role) {
    return fallback
  }

  // Accept single role or array of roles
  const allowedRoles = Array.isArray(role) ? role : [role]
  const userRole = user.role?.name

  if (allowedRoles.includes(userRole)) {
    return children
  }

  return fallback
}
