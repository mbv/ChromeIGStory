import {applyMiddleware, createStore} from 'redux';
import rootReducer from './reducers';

import {alias, wrapStore} from 'react-chrome-redux';
import ReduxThunk from 'redux-thunk';

var instagramCookies = {};
var DOMAIN_URL = "https://www.instagram.com";
var ajaxReinject = false;
const X_IG_CAPABILITIES = "3brTAw==";
const USER_AGENT_STRING_ANDROID = "Instagram 10.33.0 Android (21/4.4.4; 240dpi; 480x800; Samsung Galaxy S2 - 4.4.4 - API 21 - 480x800; en_US)";
const USER_AGENT_STRING_IOS = "Instagram 10.26.0 (iPhone7,2; iOS 10_1_1; en_US; en-US; scale=2.00; gamut=normal; 750x1334) AppleWebKit/420+";

// TODO: use aliases properly
const aliases = {
  'launch-popup': (originalAction) => {
    
    store.dispatch({
      type: 'SET_IS_FULL_POPUP',
      isFullPopup: true
    });
    
    launchPopup();
    
    return {
      type: 'launch-popup'
    };
  },
};

const middleware = [
  alias(aliases),
  ReduxThunk
];

const store = createStore(rootReducer,
  applyMiddleware(...middleware)
);

wrapStore(store, {
  portName: 'chrome-ig-story'
});

loadCookies();

applySettings();

function launchPopup() {
  chrome.tabs.create({
    url: chrome.extension.getURL('html/popup.html'),
    active: false
  }, function(tab) {
    chrome.windows.create({
      tabId: tab.id,
      type: 'popup',
      focused: true
    });
  });
}

function loadCookies() {
  getCookies(function(cookies) {
    instagramCookies = cookies;
    store.dispatch({
      type: 'SET_COOKIES',
      cookies: cookies
    });
    store.dispatch({
      type: 'SET_COOKIES_VALID',
      isCookiesValid: authCookiesValid()
    });
  });
}

// get Instagram cookies for auth
function getCookies(callback) {
  var cookieToReturn = {};
  chrome.cookies.get({url: DOMAIN_URL, name: 'ds_user_id'}, function(cookie) {
    if(cookie) { cookieToReturn.ds_user_id = cookie.value; }
    chrome.cookies.get({url: DOMAIN_URL, name: 'sessionid'}, function(cookie) {
      if(cookie) { cookieToReturn.sessionid = cookie.value; }
      chrome.cookies.get({url: DOMAIN_URL, name: 'csrftoken'}, function(cookie) {
        if(cookie) { cookieToReturn.csrftoken = cookie.value; }
        if(callback) {
          callback(cookieToReturn);
        }
      });
    });
  });
}

// send back cookies so we can check if they are available before we make requests
function sendCookies(instagramCookies) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {instagramCookies: JSON.stringify(instagramCookies)});
  });
}

function authCookiesValid() {
  return instagramCookies.ds_user_id && instagramCookies.sessionid;
}

function applySettings() {
  chrome.storage.local.get("viewStoriesAnonymously", function(items) {
    store.dispatch({
      type: 'SET_VIEW_STORIES_ANONYMOUSLY',
      viewStoriesAnonymously: (items.viewStoriesAnonymously === undefined || items.viewStoriesAnonymously) ? true : false
    });  
  });
}

// listen for the content script to send us a message so we can send back cookies
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request === "loadStories") {
      getCookies(function(cookies) {
        instagramCookies = cookies;  
        sendCookies(instagramCookies);
      });
    }
  });
  
  // listen for tab changes (i.e. AJAX request back to the home page) so we can re-inject
  chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (tab.active) {
      if(change.title) {
        ajaxReinject = true;
      }
      if(ajaxReinject && change.status == "complete") {
        ajaxReinject = false;
        sendCookies(instagramCookies);
      }
    }
  });
  
  // listen for storage changes to update the state for user settings
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];
      if(key === 'viewStoriesAnonymously') {
        store.dispatch({
          type: 'SET_VIEW_STORIES_ANONYMOUSLY',
          viewStoriesAnonymously: storageChange.newValue
        });
      }
    }
  });
  
  // listen for cookie changes so the state always has the newest cookies
  chrome.cookies.onChanged.addListener(function(changeInfo) {
    var cookie = changeInfo.cookie;
    if(cookie.domain.includes('instagram.com') && changeInfo.cause === 'overwrite') {
      if(cookie.name === 'ds_user_id' || cookie.name === 'sessionid') {
        loadCookies();
      }
    }
  });
  
  // hook into web request and modify headers before sending the request
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
      var headers = info.requestHeaders;
      var shouldInjectHeaders = true;
      
      // // if auth cookies are missing, doesn't inject them
      if(!authCookiesValid()) {
        shouldInjectHeaders = false;
      }
      
      if(shouldInjectHeaders) {
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          // don't inject headers if an internal XMLHttpRequest is made (i.e. clicking the profile tab)
          if(header.name.toLowerCase() == 'x-requested-with') {
            shouldInjectHeaders = false;
          }
        }
      }
      
      // only inject auth cookies for requests relating to the Instagram Story tray,
      // tampering with the headers on any other request will give you errors
      if(shouldInjectHeaders) {
        headers.push({name: "x-ig-capabilities", value: X_IG_CAPABILITIES});
        
        if(info.url.includes('seen')) {
          // 'seen' request requires csrftoken header
          headers.push({
            name: 'x-csrftoken',
            value: instagramCookies.csrftoken
          },
          {
            name: 'origin',
            value: 'https://www.instagram.com'
          },
          {
            name: 'referer',
            value: 'https://www.instagram.com/'
          });
        }
        
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          if(header.name.toLowerCase() == 'referer') {
            if(!header.value.startsWith("https://www.instagram.com/")) {
              shouldInjectHeaders = false;
            }
          }
          if (header.name.toLowerCase() == 'user-agent' && shouldInjectHeaders) {
            if(info.url.includes('reels_media')) {
              // use Android User Agent for POST requests that are signed with the Android SIG_KEY
              header.value = USER_AGENT_STRING_ANDROID;
            } else {
              header.value = USER_AGENT_STRING_IOS;
            }
          }
          if (header.name.toLowerCase() == 'cookie' && shouldInjectHeaders) { 
            // add auth cookies to authenticate API requests
            var cookies = header.value;
            cookies = "ds_user_id=" + instagramCookies.ds_user_id + "; sessionid=" + instagramCookies.sessionid + "; csrftoken=" + instagramCookies.csrftoken + ";";
            + cookies;
            header.value = cookies;
          }
        }
      }
      return {requestHeaders: headers};
    },
    {
      urls: [
        "*://*.instagram.com/*"
      ],
      types: ["xmlhttprequest"]
    },
    ["blocking", "requestHeaders"]
  );