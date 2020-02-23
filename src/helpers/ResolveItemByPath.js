// adapted from this: https://github.com/Sitecore/jss/blob/13f11cee05b7b239a0e373aa3719dac52aa1774c/packages/sitecore-jss-dev-tools/src/disconnected-server/layout-service.ts#L20
module.exports = (tree, routePath) => {
    let foundNode;

    const pathBits = routePath.split('/').filter((bit) => bit && bit.length > 0);

    if (pathBits) {
        // the home route is the first defined root route
        const homeRoute = tree;

        // no length = a request for "/", so we send the home route
        if (pathBits.length === 0) {
            foundNode = homeRoute;
        } else if (homeRoute.children) {
            // traverse the route tree searching for a matching route
            let currentRoute = homeRoute.name.toUpperCase() === pathBits[0].toUpperCase() ? homeRoute : null;

            for (let segment = 1; segment < pathBits.length; segment += 1) {
                if (!currentRoute || !currentRoute.children) {
                    return null;
                }

                currentRoute = (currentRoute.children).find(
                    (route) => route.name.toUpperCase() === pathBits[segment].toUpperCase()
                );
            }

            foundNode = currentRoute;
        }
    }
    
    return foundNode;
}