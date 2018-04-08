import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Instagram API POST request signing variables
export const SIG_KEY = "0443b39a54b05f064a4917a3d1da4d6524a3fb0878eacabf1424515051674daa";
export const SIG_KEY_VERSION = "4";

// Instagram API endpoints
export const API_BASE = "https://i.instagram.com/api/v1/";
export const FEED_API = API_BASE + "feed/";
export const TAG_FEED_API = FEED_API + "tag/";
export const LOCATION_FEED_API = FEED_API + "location/";
export const EXPLORE_API = API_BASE + "discover/explore/";
export const TOP_LIVE_API = API_BASE + "discover/top_live/";
export const LIVE_API = API_BASE + "live/";
export const HIGHLIGHTS_API = API_BASE + "highlights/";
export const SEEN_API = "https://www.instagram.com/stories/reel/seen";

// Instagram website class names
export const INSTAGRAM_MAIN_CONTAINER_CLASS_NAME = "_8fi2q";
export const INSTAGRAM_PROFILE_ARTICLE_CONTAINER_CLASS_NAME = "_mesn5";
export const INSTAGRAM_HASHTAG_ARTICLE_CONTAINER_CLASS_NAME = "_jzhdd";
export const INSTAGRAM_LOCATION_ARTICLE_CONTAINER_CLASS_NAME = "_m558i";

export const INSTAGRAM_FEED_CONTAINER_CLASS_NAME = "_owark";
export const INSTAGRAM_FEED_CLASS_NAME = "_d4oao";
export const INSTAGRAM_LOCATION_FEED_CLASS_NAME = "_5b1eb";
export const INSTAGRAM_HASHTAG_FEED_CLASS_NAME = "_j5dqo";
export const INSTAGRAM_HASHTAG_NAME_CLASS_NAME = "_kwqc3";
export const INSTAGRAM_USER_IMAGE_CONTAINER_HOLDER_CLASS_NAME = "_b0acm";
export const INSTAGRAM_USER_IMAGE_CONTAINER_CLASS_NAME = "_82odm";
export const INSTAGRAM_USER_IMAGE_CLASS_NAME = "_9bt3u";
export const INSTAGRAM_USER_USERNAME_CLASS_NAME = "_rf3jb notranslate";
export const INSTAGRAM_NATIVE_STORIES_CONTAINER_CLASS_NAME = "_11dqz";
export const INSTAGRAM_NATIVE_STORIES_LIST_CONTAINER_CLASS_NAME = "_havey";

// UI colors
export const TAB_TEXT_COLOR_GREEN = "#5DBA99";
export const TAB_TEXT_COLOR_LIGHT_GRAY = "#999999";
export const TAB_TEXT_COLOR_DARK_GRAY = "#262626";
export const TAB_BACKGROUND_COLOR_WHITE = "#ffffff";

// UI dimensions 
export const TAB_CONTAINER_HEIGHT = 490;
export const POPUP_CONTAINER_WIDTH = 800;
export const POPUP_CONTAINER_HEIGHT = 600;

export const SENTRY_TOKEN = null;
export const MIXPANEL_TOKEN = null;
export const AMPLITUDE_TOKEN = null;

export const muiTheme = getMuiTheme({
  palette: {
    primary1Color: TAB_TEXT_COLOR_DARK_GRAY,
    accent1Color: TAB_TEXT_COLOR_LIGHT_GRAY
  },
});