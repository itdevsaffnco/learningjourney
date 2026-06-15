export function useRole() {
  try {
    const userJSON = localStorage.getItem('user')
    const user = userJSON ? JSON.parse(userJSON) : {}

    // Try to get role from different possible locations
    let userRole = user.role?.name || user.role || null

    // Fallback: try to get from window or other sources
    if (!userRole && typeof window !== 'undefined') {
      // Try to extract from user object if role is at root level
      if (user && typeof user === 'object') {
        userRole = Object.keys(user).find(key =>
          user[key] === 'Admin' || user[key] === 'Trainer' || user[key] === 'Staff'
        ) ? user[Object.keys(user).find(key =>
          user[key] === 'Admin' || user[key] === 'Trainer' || user[key] === 'Staff'
        )] : null
      }
    }

    // Debug log (remove in production)
    console.log('[useRole] User Role:', userRole, 'Full User:', user)

    // Explicit role checks
    const isAdmin = userRole === 'Admin'
    const isTrainer = userRole === 'Trainer'
    const isStaff = userRole === 'Staff'

    return {
      user,
      role: userRole,
      isAdmin: () => isAdmin,
      isTrainer: () => isTrainer,
      isStaff: () => isStaff,
      hasPermission: (role) => {
        if (Array.isArray(role)) {
          return role.includes(userRole)
        }
        return role === userRole
      }
    }
  } catch (error) {
    console.error('[useRole] Error parsing user:', error)
    return {
      user: {},
      role: null,
      isAdmin: () => false,
      isTrainer: () => false,
      isStaff: () => false,
      hasPermission: () => false
    }
  }
}
