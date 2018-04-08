import React, {Component} from 'react';
import {connect} from 'react-redux';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {ListItem} from 'material-ui/List';
import {Tabs, Tab} from 'material-ui/Tabs';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import VisibilityOnIcon from 'material-ui/svg-icons/action/visibility';
import VisibilityOffIcon from 'material-ui/svg-icons/action/visibility-off';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import LiveTvIcon from 'material-ui/svg-icons/notification/live-tv';
import PlaceIcon from 'material-ui/svg-icons/maps/place';
import ErrorIcon from 'material-ui/svg-icons/alert/error';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';

import StoryContainer from './StoryContainer';
import FriendsTab from '../friends/FriendsTab';
import ExploreTab from '../explore/ExploreTab';
import LiveTab from '../live/LiveTab';
import LocationsTab from '../locations/LocationsTab';

import Story from '../../../../../utils/Story';
import LiveVideo from '../../../../../utils/LiveVideo';
import SearchPage from '../search/SearchPage';
import InstagramApi from '../../../../../utils/InstagramApi';
import {renderToolbar, toggleAnonymousStoryViews} from '../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../utils/AnalyticsUtil';
import $ from 'jquery';

import "../../../../../node_modules/react-image-gallery/styles/css/image-gallery.css";

import {
  TAB_TEXT_COLOR_DARK_GRAY,
  TAB_TEXT_COLOR_LIGHT_GRAY,
  TAB_BACKGROUND_COLOR_WHITE,
  POPUP_CONTAINER_WIDTH,
  POPUP_CONTAINER_HEIGHT
} from '../../../../../utils/Constants';

const tabNames = ["Friends", "Explore", "Live", "Locations"];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabIndex: 0,
      currentStory: null,
      isFriendsTabLoading: true,
      isExploreTabLoading: true,
      isLiveTabLoading: true,
      isFullPopup: false
    }
  }

  handleTabChange = (value) => {
    this.setState({currentTabIndex: value});
    AnalyticsUtil.track(tabNames[value] + " Tab Selected");
  };
  
  setSearchActive() {
    this.props.dispatch({
      type: 'SET_IS_SEARCH_ACTIVE',
      isSearchActive: true
    });
  }

  componentDidMount() {
    this.setSearchActive();
    
    if(this.props.isFullPopup) {
      AnalyticsUtil.track("Popout Opened");
      this.setState({isFullPopup: true});
    } else {
      AnalyticsUtil.track("Popup Opened");
    }

    // fetch all the data from the Instagram API and dispatch it to the store
    InstagramApi.getFriendStories((friendStoriesResponse) => this.loadFriendsStoryTray(friendStoriesResponse));
    InstagramApi.getExploreFeed((exploreStoriesResponse) => this.loadExploreStoryTray(InstagramApi.getExploreStories(exploreStoriesResponse)));
    InstagramApi.getTopLiveVideos((topLiveVideosResponse) => this.loadTopLiveVideos(topLiveVideosResponse));
  }
  
  loadFriendsStoryTray(friendStoriesResponse) {
    var unfetchedTrayItemIds = [];
    
    // TODO: implement functionality to fetch all stories which don't have any items
    // friendStoriesResponse.tray.forEach(function(trayItem, index) {
    //   var tempTrayItem = this.props.stories.friendStories.tray.find(tempTrayItem => tempTrayItem.id === trayItem.id);
    //   if(tempTrayItem === undefined) {
    //     unfetchedTrayItemIds.push(trayItem.id.toString());
    //   } else {
    //     if(!tempTrayItem.items) {
    //       unfetchedTrayItemIds.push(tempTrayItem.id.toString());
    //     }
    //   }
    // }.bind(this));  
    
    this.props.dispatch({
      type: 'SET_FRIEND_STORIES',
      friendStories: friendStoriesResponse
    });
    
    // fetch all stories which dont have any items; unused for now
    if(unfetchedTrayItemIds.length > 0) {
      InstagramApi.getReelsMedia(unfetchedTrayItemIds, (stories) => {
        var tempfriendStoriesResponse = friendStoriesResponse;
        tempfriendStoriesResponse.tray = stories.reels_media;
        this.props.dispatch({
          type: 'SET_FRIEND_STORIES',
          friendStories: tempfriendStoriesResponse
        });
      });
    }

    this.setState({isFriendsTabLoading: false});
  }

  loadExploreStoryTray(exploreStoriesResponse) {
    this.props.dispatch({
      type: 'SET_EXPLORE_STORIES',
      exploreStories: exploreStoriesResponse
    });
    this.setState({isExploreTabLoading: false});
  }

  loadTopLiveVideos(topLiveVideosResponse) {
    this.props.dispatch({
      type: 'SET_TOP_LIVE_VIDEOS',
      topLiveVideos: topLiveVideosResponse.broadcasts
    });
    this.setState({isLiveTabLoading: false});
  }
  
  handleSnackbarRequestClose() {
    this.props.dispatch({
      type: 'SET_IS_SNACKBAR_ACTIVE',
      isSnackbarActive: false
    });
  }

  render() {
    const styles = {
      popupContainer: {
        minWidth: POPUP_CONTAINER_WIDTH + 'px',
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        margin: '0px',
        overflow: 'hidden'
      },
      appBar: {
        position: 'fixed',
        width: '55%',
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
        zIndex: 1
      },
      bottomNavigation: {
        width: '55%',
        position: 'absolute',
        bottom: '0px',
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
      },
      tabs: {
        marginTop: '5px'
      },
      friendsStoriesList: {
        width: '55%',
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        float: 'left',
        overflowY: 'auto'
      },
      friendsStoryContainer: {
        minHeight: POPUP_CONTAINER_HEIGHT + 'px',
        marginLeft: '55%'
      },
      loadingIndicator: {
        position: 'sticky',
        display: 'block',
        margin: 'auto auto',
        top: '50%',
        left: '50%',
        transform: 'translate(0%, -50%)'
      }
    };
    
    const toolbarActionsGroup = (
      <ToolbarGroup lastChild={true}>
        <IconButton
          tooltip={"Anonymous Viewing " + ((this.props.viewStoriesAnonymously) ? "Enabled" : "Disabled")}
          tooltipPosition="bottom-center"
          onClick={() => toggleAnonymousStoryViews((viewStoriesAnonymously) => {
            this.props.dispatch({
              type: 'SET_VIEW_STORIES_ANONYMOUSLY',
              viewStoriesAnonymously: viewStoriesAnonymously
            });
          })}>
          {(this.props.viewStoriesAnonymously) ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
        </IconButton>
      {!this.props.isSearchActive &&
        <IconButton
        tooltip="Search"
        tooltipPosition="bottom-center"
        onClick={()=> {
          this.setSearchActive();
          AnalyticsUtil.track("Search Button Clicked");
        }}>
        <ActionSearchIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>
        </IconButton>
      }
      {!this.state.isFullPopup &&
        <IconButton
        tooltip="Popout"
        tooltipPosition="bottom-center"
        onClick={()=> {
          this.props.dispatch({type: 'launch-popup'});
          AnalyticsUtil.track("Popout Button Clicked");
        }}>
        <OpenInNewIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>
        </IconButton>
      }
      </ToolbarGroup>
    );

    var currentTab;
    switch(this.state.currentTabIndex) {
      case 0:
      currentTab = (
        <FriendsTab isLoading={this.state.isFriendsTabLoading}/>
      );
      break;
      case 1:
      currentTab = (
        <ExploreTab isLoading={this.state.isExploreTabLoading}/>
      );
      break;
      case 2:
      currentTab = (
        <LiveTab isLoading={this.state.isLiveTabLoading}/>
      );
      break;
      case 3:
      currentTab = (
        <LocationsTab isLoading={this.state.isLiveTabLoading}/>
      );
      break;
    }
    
    if(!this.props.isCookiesValid) {
      return (
        <div style={styles.popupContainer}>
        {renderToolbar()}
        <div className="center-div" style={{width: '100%', fontSize: '22px', textAlign: 'center'}}>
        <ErrorIcon color={TAB_TEXT_COLOR_DARK_GRAY} style={{width: '48px', height: '48px'}}/>
        <p>There was a problem with your Instagram session.</p>
        <p>Make sure you are signed into Instagram and try again.</p>
        <RaisedButton label="Open Instagram" onClick={()=> window.open('https://www.instagram.com/')}/>
        </div>
        </div>
      );
    }

    return (
      <div style={styles.popupContainer}>
        <div style={styles.friendsStoriesList}>
          {renderToolbar(toolbarActionsGroup)}
          <div
            style={styles.tabs}
            className="tabs-container">
            {currentTab}
          </div>
          <BottomNavigation selectedIndex={this.state.currentTabIndex} style={styles.bottomNavigation}>
            <BottomNavigationItem
              label="Friends"
              icon={<PeopleIcon/>}
              onTouchTap={() => this.handleTabChange(0)}
              />
            <BottomNavigationItem
              label="Explore"
              icon={<ActionExploreIcon/>}
              onTouchTap={() => this.handleTabChange(1)}
              />
            <BottomNavigationItem
              label="Top Live"
              icon={<LiveTvIcon/>}
              onTouchTap={() => this.handleTabChange(2)}
              />
            <BottomNavigationItem
              label="Locations"
              icon={<PlaceIcon/>}
              onTouchTap={() => this.handleTabChange(3)}
              />
          </BottomNavigation>
          
        </div>
        
        <div style={styles.friendsStoryContainer}>
          {!this.props.isSearchActive && <StoryContainer isSnackbarActive={this.props.isSnackbarActive} />}
          {this.props.isSearchActive && <SearchPage/>}
          <Snackbar
            open={this.props.isSnackbarActive}
            autoHideDuration={3000}
            onRequestClose={() => this.handleSnackbarRequestClose()}
            message="No story available"/>
        </div>
        
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stories: state.stories,
    isFullPopup: state.popup.isFullPopup,
    isSnackbarActive: state.popup.isSnackbarActive,
    isSearchActive: state.popup.isSearchActive,
    viewStoriesAnonymously: state.stories.viewStoriesAnonymously,
    isCookiesValid: state.popup.isCookiesValid
  };
};

export default connect(mapStateToProps)(App);
