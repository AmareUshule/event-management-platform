export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mockAuth: true, // Set to false when connecting to real backend
  appVersion: '1.0.0',
  
  // Mock users for development
  mockUsers: [
    {
      username: 'amare.ushule',
      password: 'demo123',
      fullName: 'Amare Ushule',
      email: 'amare.ushule@eep.com',
      department: 'Information Technology',
      roles: ['ADMIN', 'EVENT_CREATOR']
    },
    {
      username: 'selam.tesfaye',
      password: 'demo123',
      fullName: 'Selam Tesfaye',
      email: 'selam.tesfaye@eep.com',
      department: 'Human Resources',
      roles: ['EVENT_CREATOR', 'HR_MANAGER']
    }
  ]
};