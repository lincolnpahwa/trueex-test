/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import ApiClient from './helpers/ApiClient.js';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';

import getRoutes from './routes';

const client = new ApiClient();
const _browserHistory = useScroll(() => browserHistory)();
const dest = document.getElementById('content');
const store = createStore(_browserHistory, client, window.__data);
const history = syncHistoryWithStore(_browserHistory, store);

function reconnect() {
  setTimeout(function() {
      console.log('retrying...')
      global.socket = initSocket();
    }, 3000)
}

function initSocket() {
  let socket = io('', {path: '/ws', reconnection: false});
  
  socket.on('connect', () => {
    console.log('socket connected');
  })
  socket.on('disconnect',() => {
    
    socket = undefined;

    reconnect();
  });

  socket.on('connect_error', () => {
    reconnect();
  })
  return socket;
}

global.socket = initSocket();

const component = (
  <Router
    render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
      } history={history}>
    {getRoutes(store)}
  </Router>
);

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);
