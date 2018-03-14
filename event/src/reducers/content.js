const initialState = {
  currentStoryObject: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CURRENT_CONTENT_STORY_OBJECT':
    return {
      ...state,
      currentStoryObject: action.currentStoryObject
    }
    default:
    return state;
  }
};
