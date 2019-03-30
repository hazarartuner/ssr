import App from 'components/App';
import React from 'react';
import { StaticRouter, matchPath } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import { Provider } from "react-redux";

import routes from 'config/routes';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

import { configureStore } from "redux/store";

const store = configureStore();

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {

    Promise.resolve()
      .then(() => {
        let match = {};
        const currentRoute =
          Object.values(routes).find(route => (match = matchPath(req.url, route))) || {};
        const initialActions =
          (currentRoute.component &&
            currentRoute.component.initialActions &&
            currentRoute.component.initialActions(match)) ||
          [];

        if (initialActions && initialActions.length > 0) {
          const promises = initialActions.map(action => action(store.dispatch, store.getState));

          return Promise.all(promises);
        } else {
          return true;
        }
      }).then(() => {
        const context = {};
        const markup = renderToString(
          <Provider store={store}>
            <StaticRouter context={context} location={req.url}>
              <App />
            </StaticRouter>
          </Provider>
        );

        if (context.url) {
          res.redirect(context.url);
        } else {
          res.status(200).send(
            `<!doctype html>
                <html lang="">
                <head>
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta charset="utf-8" />
                    <title>Welcome to Razzle</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    ${
                      assets.client.css
                        ? `<link rel="stylesheet" href="${assets.client.css}">`
                        : ''
                    }
                    ${
                      process.env.NODE_ENV === 'production'
                        ? `<script src="${assets.client.js}" defer></script>`
                        : `<script src="${assets.client.js}" defer crossorigin></script>`
                    }
                </head>
                <body>
                    <div id="root">${markup}</div>
                    
                    <script>
                        window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())};
                    </script>
                </body>
            </html>`
          );
        }
    });
  });

export default server;
