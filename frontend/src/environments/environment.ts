export const environment = {
  production: true,
  /** Same OAuth 2.0 Web Client ID as backend `GOOGLE_CLIENT_ID` / `app.google.client-id` */
  googleClientId: '',
  backendBaseUrl: 'http://localhost:8087',
  backendContextPath: '/elif',
  communityApiBaseUrl: 'http://localhost:8087/elif/api/community',
  communityMessagesApiUrl: 'http://localhost:8087/elif/api/community/messages',
  communityGifsApiUrl: 'http://localhost:8087/elif/api/community/gifs',
  communityAgentApiUrl: 'http://localhost:8095',
  notificationsApiUrl: 'http://localhost:8087/elif/api/notifications',
  marketplaceReclamationApiUrl: 'http://localhost:8087/elif/api/reclamations',
  userApiUrl: 'http://localhost:8087/elif/user',
  communityWsUrl: 'ws://localhost:8087/elif/ws-community'
};
