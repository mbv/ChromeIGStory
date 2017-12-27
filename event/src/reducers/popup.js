const initialState = {
  currentStoryItem: null,
  isFullPopup: false,
  isCookiesValid: true,
  cookies: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CURRENT_STORY_ITEM':
    return {
      ...state,
      currentStoryItem: action.currentStoryItem
    }
    case 'SET_IS_FULL_POPUP':
    return {
      ...state,
      isFullPopup: action.isFullPopup
    }
    case 'SET_COOKIES':
    return {
      ...state,
      cookies: action.cookies
    }
    case 'SET_COOKIES_VALID':
    return {
      ...state,
      isCookiesValid: action.isCookiesValid
    }
    default:
    return state;
  }
};
