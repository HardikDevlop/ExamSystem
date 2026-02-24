/**
 * Route path constants - use these for navigation and redirects
 */
export const USER_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EXAM: (id) => `/exam/${id}`,
  RESULT: (examId) => `/result?examId=${examId}`,
};

export const ADMIN_PATHS = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  CREATE_EXAM: '/admin/create-exam',
  ASSIGN: '/admin/assign',
  RESPONSES: '/admin/responses',
};
