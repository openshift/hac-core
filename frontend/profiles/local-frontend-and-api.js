const SECTION = '';
const APP_ID = 'hac';
const FRONTEND_PORT = 8002;
const API_PORT = 3000;
const routes = {};

routes[`/beta/${SECTION ? `/${SECTION}` : ''}${APP_ID}`] = {
  host: `http://localhost:${FRONTEND_PORT}`,
};
routes[`/${SECTION ? `/${SECTION}` : ''}${APP_ID}`] = {
  host: `http://localhost:${FRONTEND_PORT}`,
};
routes[`/beta/apps/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };

routes[`/api/${APP_ID}`] = { host: `http://localhost:${API_PORT}` };

// You have to run local config https://github.com/RedHatInsights/cloud-services-config#testing-your-changes-locally
routes['/config'] = { host: 'http://localhost:8889' };

module.exports = { routes };
