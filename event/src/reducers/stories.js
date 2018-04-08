const initialState = {
  friendStories: {
    tray: [],
    broadcasts: []
  },
  exploreStories: {
    tray: [],
    top_live: []
  },
  locationStories: [],
  topLiveVideos: [],
  viewStoriesAnonymously: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_FRIEND_STORIES':
    return {
      ...state,
      friendStories: action.friendStories
    }
    case 'SET_EXPLORE_STORIES':
    return {
      ...state,
      exploreStories: action.exploreStories
    }
    case 'SET_TOP_LIVE_VIDEOS':
    return {
      ...state,
      topLiveVideos: action.topLiveVideos
    }
    case 'SET_VIEW_STORIES_ANONYMOUSLY':
    return {
      ...state,
      viewStoriesAnonymously: action.viewStoriesAnonymously
    }
    default:
    return state;
  }
};
