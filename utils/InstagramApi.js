import {
  API_BASE,
  FEED_API,
  TAG_FEED_API,
  LOCATION_FEED_API,
  EXPLORE_API,
  TOP_LIVE_API,
  LIVE_API,
  HIGHLIGHTS_API,
  SEEN_API,
  SIG_KEY,
  SIG_KEY_VERSION
} from './Constants';

import JSONbig from 'json-bigint';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import moment from 'moment';

// fetch a particular user's story
function getStory(userId, callback) {
  return fetch(`${FEED_API}user/${userId}/story/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch the stories for particular user ids
function getReelsMedia(userIds, callback) {
  var requestBody = {
    user_ids: userIds
  };
  
  var params = {
    signed_body: getSignedRequestBody(requestBody),
    ig_sig_key_version: SIG_KEY_VERSION
  }
  
  return new Promise(function(resolve, reject) {
    fetch(`${FEED_API}reels_media/`, {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: searchParams(params)
    })
    .then(checkStatus)
    .then(parseText)
    .then(parseBigJSON)
    .then(callback)
    .catch(function(e) {
      reject(e);
    });
  });
}

// fetch a particular user's story highlights
function getHighlights(userId, callback) {
  return fetch(`${HIGHLIGHTS_API}${userId}/highlights_tray/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch the story for a particular hashtag
function getHashtagStory(hashtag, callback) {
  return fetch(`${TAG_FEED_API}${hashtag}/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response["story"];
  }).then(callback);
}

// fetch the story for a particular location
function getLocationStory(locationId, callback) {
  return fetch(`${LOCATION_FEED_API}${locationId}/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response["story"];
  }).then(callback);
}

// fetch a particular user's information by their id
function getUserInfo(userId, callback) {
  return fetch(`${API_BASE}users/${userId}/info/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// search for a query and return the top results for each category
function topSearch(query, callback) {
  return fetch(`${API_BASE}fbsearch/topsearch/?&q=${query}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// search for a particular user by username
function searchForUser(username, callback) {
  return fetch(`${API_BASE}users/search/?&q=${username}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response.users;
  }).then(callback);
}

// search for a particular location by name
function searchForLocation(location, callback) {
  return fetch(`${API_BASE}fbsearch/places/?query=${location}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response.items;
  }).then(callback);
}

// search for a particular hashtag by name
function searchForHashtag(hashtag, callback) {
  return fetch(`${API_BASE}tags/search/?q=${hashtag}`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then((response) => {
    return response.results;
  }).then(callback);
}

// fetch the requesting user's story tray for their friends' stories
function getFriendStories(callback) {
  return fetch(`${FEED_API}reels_tray/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseText)
  .then(parseBigJSON)
  .then(callback);
}

// fetch the requesting user's explore feed
function getExploreFeed(callback) {
  return fetch(EXPLORE_API, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseText)
  .then(parseBigJSON)
  .then((response) => {
    return response;
  }).then(callback);
}

// parse the suggested stories from the explore feed
function getExploreStories(exploreFeed, callback) {
  return exploreFeed["items"][0]["stories"];
}

// fetch the top live videos
function getTopLiveVideos(callback) {
  return fetch(TOP_LIVE_API, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseText)
  .then(parseBigJSON)
  .then(callback);
}

// fetch the comments for a live video
function getLiveVideoComments(id, timestamp, callback) {
  var LIVE_API_URL = `${LIVE_API}${id}/get_comment/`;
  if(timestamp != null) {
    LIVE_API_URL = LIVE_API_URL + `?last_comment_ts=${timestamp}`;
  }
  return fetch(LIVE_API_URL, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

// fetch the comments for a post-live video
function getLiveVideoReplayComments(id, timestamp, callback) {
  var LIVE_API_URL = `${LIVE_API}${id}/get_post_live_comments/?starting_offset=${timestamp}&encoding_tag=instagram_dash_remuxed`;
  return fetch(LIVE_API_URL, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseText)
  .then(parseBigJSON)
  .then(callback);
}

// fetch the information for a particular live video
function getLiveVideoInfo(id, callback) {
  return fetch(`${LIVE_API}${id}/info/`, {
    accept: 'application/json',
    credentials: 'include'
  }).then(checkStatus)
  .then(parseText)
  .then(parseBigJSON)
  .then(callback);
}

// fetch a particular user's information
function getUserByUsername(username) {
  return new Promise(function(resolve, reject) {
    fetch(`https://www.instagram.com/${username}/?__a=1`)
    .then(res => res.json())
    .then(user => resolve(user))
    .catch(function(e) {
      console.log(e);
      reject(e);
    });
  });
}

function setStorySeen(storyItem, callback) {
  var params = {
    reelMediaId: storyItem.pk,
    reelMediaOwnerId: storyItem.user.pk,
    reelId: storyItem.user.pk,
    reelMediaTakenAt: storyItem.taken_at,
    viewSeenAt: moment().unix()
  }
  
  return new Promise(function(resolve, reject) {
    fetch(SEEN_API, {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: searchParams(params)
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(callback)
    .catch(function(e) {
      reject(e);
    });
  });
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error);
    throw error;
  }
}

function parseBigJSON(text) {
    return JSONbig.parse(text);
}

function parseText(response) {
  return response.text();
}

function parseJSON(response) {
  return response.json();
}

function getSignedRequestBody(requestBody) {
  var signature = hmacSHA256(JSON.stringify(requestBody), SIG_KEY);
  return signature + "." + JSON.stringify(requestBody);
}

function searchParams(params) {
  return Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
}

const InstagramApi = {
  getStory,
  getReelsMedia,
  getHighlights,
  getHashtagStory,
  getLocationStory,
  getFriendStories,
  getExploreFeed,
  getExploreStories,
  getTopLiveVideos,
  getLiveVideoInfo,
  getLiveVideoComments,
  getLiveVideoReplayComments,
  getUserInfo,
  getUserByUsername,
  setStorySeen,
  searchForUser,
  searchForHashtag,
  searchForLocation
};

export default InstagramApi;