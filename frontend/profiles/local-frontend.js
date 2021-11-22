const SECTION = '';
const APP_ID = 'hac';
const FRONTEND_PORT = 8002;
const routes = {};

routes[`/beta/${SECTION ? `/${SECTION}` : ''}${APP_ID}`] = {
  host: `http://localhost:${FRONTEND_PORT}`,
};
routes[`/${SECTION ? `/${SECTION}` : ''}${APP_ID}`] = {
  host: `http://localhost:${FRONTEND_PORT}`,
};
routes[`/beta/apps/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };

module.exports = { routes };
