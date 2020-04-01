/*
  When the app runs in disconnected mode, and Sitecore is not present, we need to give
  the app copies of the Sitecore APIs it depends on (layout service, dictionary service, content service)
  to talk to so that the app can run using the locally defined disconnected data.

  This is accomplished by spinning up a small Express server that mocks the APIs, and then
  telling the dev server to proxy requests to the API paths to this express instance.
*/

/* eslint-disable no-console */
require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');
const { createDefaultDisconnectedServer } = require('./create-default-disconnected-server');
const config = require('../package.json').config;

const touchToReloadFilePath = 'src/temp/config.js';

const proxyOptions = {
  appRoot: path.join(__dirname, '..'),
  appName: config.appName,
  watchPaths: ['./data'],
  language: config.language,
  port: process.env.PROXY_PORT || 3042,
  onManifestUpdated: (manifest) => {
    // if we can resolve the config file, we can alter it to force reloading the app automatically
    // instead of waiting for a manual reload. We must materially alter the _contents_ of the file to trigger
    // an actual reload, so we append "// reloadnow" to the file each time. This will not cause a problem,
    // since every build regenerates the config file from scratch and it's ignored from source control.
    if (fs.existsSync(touchToReloadFilePath)) {
      const currentFileContents = fs.readFileSync(touchToReloadFilePath, 'utf8');
      const newFileContents = `${currentFileContents}\n// reloadnow`;
      fs.writeFileSync(touchToReloadFilePath, newFileContents, 'utf8');

      console.log('Manifest data updated. Reloading the browser.');
    } else {
      console.log('Manifest data updated. Refresh the browser to see latest content!');
    }
  },
  customizeRendering: async (route, rendering, rawManifestRendering, currentManifest) => {
    const { dataSource } = rawManifestRendering;

    if (dataSource) {
      const { template } = dataSource;

      if (template) {
        const foundRendering = currentManifest.renderings.find(rendering => rendering.name === template);

        if (foundRendering && foundRendering.graphQLQuery) {
          const variables = {
            datasource: dataSource.name,
            contextItem: route.itemId
          }

          const endpointAddress = `http://localhost:3042${config.graphQLEndpointPath}`;

          const rawResponse = await fetch(endpointAddress, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ variables, query: foundRendering.graphQLQuery })
          });

          const data = await rawResponse.json();

          if (data.errors) {
            data.errors.forEach(error => {
              console.log(error.message);
            })
          }

          rendering.fields.data = data.data;
        }
      }
    }

    return rendering;
  }
};

// Need to customize something that the proxy options don't support?
// createDefaultDisconnectedServer() is a boilerplate that you can copy from
// and customize the middleware registrations within as you see fit.
// See https://github.com/Sitecore/jss/blob/master/packages/sitecore-jss-dev-tools/src/disconnected-server/create-default-disconnected-server.ts
createDefaultDisconnectedServer(proxyOptions);
