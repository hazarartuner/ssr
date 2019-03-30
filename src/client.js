import App from 'components/App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from "react-redux";
import { configureStore } from "redux/store";
import { fromJS } from 'immutable';

const initialState = fromJS(window.__INITIAL_STATE__ || {});

const store = configureStore(initialState);

hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
