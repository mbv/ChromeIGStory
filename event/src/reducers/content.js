const initialState = {
  currentStoryObject: null,
  isStoryModalOpen: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CURRENT_CONTENT_STORY_OBJECT':
    return {
      ...state,
      currentStoryObject: action.currentStoryObject
    }
    case 'SET_IS_STORY_MODAL_OPEN':
    return {
      ...state,
      isStoryModalOpen: action.isStoryModalOpen
    }
    default:
    return state;
  }
};
