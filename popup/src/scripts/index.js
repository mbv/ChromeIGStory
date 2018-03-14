import React from 'react';
import {render} from 'react-dom';
import App from './components/app/App';
import {Store} from 'react-chrome-redux';
import {Provider} from 'react-redux';
import Raven from 'raven-js';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AnalyticsUtil from '../../../utils/AnalyticsUtil';
import {SENTRY_TOKEN, muiTheme} from '../../../utils/Constants';

export const proxyStore = new Store({
  portName: 'chrome-ig-story'
});

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

if(SENTRY_TOKEN !== null) {
  Raven.config(SENTRY_TOKEN).install();
  window.addEventListener('unhandledrejection', event => {
    Raven.captureException(event.reason);
  });
}

// wait for the store to connect to the background page
proxyStore.ready().then(() => {
  var cookies = proxyStore.getState().popup.cookies;
  AnalyticsUtil.initializeMixpanel(cookies);
  AnalyticsUtil.initializeAmplitude(cookies);
  render(
    <Provider store={proxyStore}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <App/>
      </MuiThemeProvider>  
    </Provider>
    , document.getElementById('app'));
  });