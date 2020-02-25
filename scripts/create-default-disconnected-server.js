const Express = require('express');
const { join } = require('path');
const { ManifestManager } = require('../node_modules/@sitecore-jss/sitecore-jss-dev-tools/dist/manifest-manager');
const { createDisconnectedDictionaryService } = require('../node_modules/@sitecore-jss/sitecore-jss-dev-tools/dist/disconnected-server/dictionary-service');
const { createDisconnectedLayoutService } = require('./layout-service');
const { createGraphQLService } = require('jss-disconnected-graphql');

function createDefaultDisconnectedServer(options) {
    let app = options.server;

    if (!app) {
        app = Express();
    }

    // backwards compatibility with fix for #80
    // for GA the appRoot was expected to be $app/scripts
    // which didn't make sense. This allows both sane app roots
    // and GA-style app roots to keep working.
    if (options.appRoot.endsWith('scripts')) {
        options.appRoot = join(options.appRoot, '..');
    }

    // further backwards compatibility for #80
    // allows apps with GA watch path of '../data' (relative to /scripts)
    // to keep working even with appRoot now relative to the actual app root
    // We do this by stripping '../' from path leads, making the path './data' instead - theoretically, the chance of
    // wanting to actually escape from the app root entirely otherwise is awfully low.
    options.watchPaths = options.watchPaths.map(path => path.startsWith('../') ? path.substring(1) : path);

    // the manifest manager maintains the state of the disconnected manifest data during the course of the dev run
    // it provides file watching services, and language switching capabilities
    const manifestManager = new ManifestManager({
        appName: options.appName,
        rootPath: options.appRoot,
        watchOnlySourceFiles: options.watchPaths,
        requireArg: options.requireArg,
        sourceFiles: options.sourceFiles,
    });

    return manifestManager
        .getManifest(options.language)
        .then((manifest) => {
            if (options.onManifestCreated) {
                options.onManifestCreated(manifest);
            }

            // creates a fake version of the Sitecore Layout Service that is powered by your disconnected manifest file
            const layoutService = createDisconnectedLayoutService({
                manifest,
                manifestLanguageChangeCallback: manifestManager.getManifest,
                customizeContext: options.customizeContext,
                customizeRoute: options.customizeRoute,
                customizeRendering: options.customizeRendering,
            });

            const graphqlService = createGraphQLService({
                manifest
            });

            // creates a fake version of the Sitecore Dictionary Service that is powered by your disconnected manifest file
            const dictionaryService = createDisconnectedDictionaryService({
                manifest,
                manifestLanguageChangeCallback: manifestManager.getManifest,
            });

            // set up live reloading of the manifest when any manifest source file is changed
            manifestManager.setManifestUpdatedCallback((newManifest) => {
                layoutService.updateManifest(newManifest);
                dictionaryService.updateManifest(newManifest);
                graphqlService.updateManifest(newManifest);
                if (options.onManifestUpdated) {
                    options.onManifestUpdated(newManifest);
                }
            });

            // attach our disconnected service mocking middleware to webpack dev server
            app.use('/assets', Express.static(join(options.appRoot, 'assets')));
            app.use('/data/media', Express.static(join(options.appRoot, 'data/media')));

            const graphQLEndpoint = options.graphQLEndpoint || '/api/' + options.appName;
            app.use(graphQLEndpoint, graphqlService.middleware);

            app.post('/echo', (req, res) => {
                console.log(req.body);
                res.json(req.body);
            })

            app.use('/sitecore/api/layout/render', layoutService.middleware);
            app.use('/sitecore/api/jss/dictionary/:appName/:language', dictionaryService.middleware);

            if (options.afterMiddlewareRegistered) {
                options.afterMiddlewareRegistered(app);
            }

            if (options.port) {
                app.listen(options.port, () => {
                    if (options.onListening) {
                        options.onListening();
                    } else {
                        console.log(`JSS Disconnected-mode Proxy is listening on port ${options.port}. (PID: ${process.pid})`);
                    }
                });
            }
        })
        .catch((error) => {
            if (options.onError) {
                options.onError(error);
            } else {
                console.error(error);
                process.exit(1);
            }
        });
}

module.exports = {
    createDefaultDisconnectedServer
}