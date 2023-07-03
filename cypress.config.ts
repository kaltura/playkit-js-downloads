import {defineConfig} from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  fileServerFolder: 'cypress/public',
  e2e: {
    watchForFileChanges: false
  }
});
