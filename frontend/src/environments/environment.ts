export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Your backend API URL
  mockAuth: true, // Use mock authentication for development
  appName: 'EEP Event Management System',
  version: '1.0.0',
  
  // Mock configuration
  mockApiDelay: 800, // Simulate network latency in ms
  tokenExpiryHours: 1,
  
  // Available roles for development testing
  availableRoles: [
    'ADMIN',
    'HR_MANAGER',
    'FINANCE_MANAGER',
    'EVENT_CREATOR',
    'EVENT_APPROVER',
    'EVENT_VIEWER',
    'REPORT_VIEWER'
  ]
};