import React from 'react';
import { Route } from 'react-router';
import { App } from 'containers';

export default (store) => {
  return (
    <Route path="/" component={App}></Route>
  );
};
