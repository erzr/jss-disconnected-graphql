
# Disconnected Mode GraphQL for Sitecore JSS
Love working in disconnected mode but miss GraphQL functionality? Same. This project is an effort to try to bring some compatible level for GraphQL functionality to disconnected mode without forcing you to mock out JSON for the requests. This package will hook into manifest change events and build a schema that contains a lot of the same fields as you would get in connected mode GraphQL.

Read more about this project [here](https://www.adamlamarre.com/disconnected-mode-graphql-for-sitecore-jss/).

## Getting Started
* `npm install https://github.com/erzr/jss-disconnected-graphql.git`
* Copy the scripts located in the [scripts](https://github.com/erzr/jss-disconnected-graphql/tree/master/scripts) directory of this repository to your application `scripts` directory. If you have not changed `disconnected-mode-proxy.js`, choose overwrite when prompted. Otherwise, diff and merge the changes into your existing file.
* Open `src/setupProxy.js`, add the following line in the `isDisconnected` condition:
```
app.use(proxy(config.graphQLEndpoint, { target: proxyUrl }));
```
* Navigate to `http://localhost:3000/api/appName`, where `appName` is the name of your JSS application, check `graphQLEndpointPath` at `src/temp/config.js` if you are unsure.
* Enjoy!
