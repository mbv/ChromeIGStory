import React, { Component } from 'react';
import {connect} from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {Tabs, Tab} from 'material-ui/Tabs';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import CircularProgress from 'material-ui/CircularProgress';

import StoryTrayItem from './StoryTrayItem';

import FriendsTab from './friends/FriendsTab';
import ExploreTab from './explore/ExploreTab';

import InstagramApi from '../../../../../utils/InstagramApi';
import {renderToolbar, getStorySlide, onStoryAuthorUsernameClicked, getTimeElapsed} from '../../../../../utils/Utils';
import Story from '../../../../../utils/Story';

import {
  TAB_TEXT_COLOR_DARK_GRAY,
  TAB_TEXT_COLOR_LIGHT_GRAY,
  TAB_BACKGROUND_COLOR_WHITE
} from '../../../../../utils/Constants';

import "../../../../../node_modules/react-image-gallery/styles/css/image-gallery.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storyTrayItems: '',
      currentTabIndex: 0,
      isLoadingTray: false,
    }
  }
  
  handleTabChange = (value) => {
    this.setState({currentTabIndex: value});
  };
  
  render() {
    if(this.state.isLoadingTray) {
      return (
        <LinearProgress mode="indeterminate" />
      )
    }
    
    const styles = {
      appBar: {
        backgroundColor: 'white',
        boxShadow: '0 5px 5px -5px rgba(0, 0, 0, 0.118), 5px 0 5px -5px rgba(0, 0, 0, 0.118), -5px 0 5px -5px rgba(0, 0, 0, 0.118)',
        flexDirection: 'row'
      },
      tabs: {
        position: 'fixed',
        width: '55%',
        marginTop: '56px'
      },
      tabItemContainerStyle: {
        flexDirection: 'row',
        boxShadow: '0 5px 5px -5px rgba(0, 0, 0, 0.118), 5px 0 5px -5px rgba(0, 0, 0, 0.118), -5px 0 5px -5px rgba(0, 0, 0, 0.118)'
      },
      defaultTab: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        color: TAB_TEXT_COLOR_DARK_GRAY
      },
      activeTab: {
        backgroundColor: TAB_BACKGROUND_COLOR_WHITE,
        color: TAB_TEXT_COLOR_LIGHT_GRAY
      }
    };
    
    styles.tab = [];
    styles.tab[0] = styles.activeTab;
    styles.tab[1] = styles.activeTab;
    styles.tab[this.state.currentTabIndex] = Object.assign({}, styles.tab[this.state.currentTabIndex], styles.defaultTab);
    
    const toolbarActionsGroup = (
      <ToolbarGroup lastChild={true} style={{flexDirection: 'row'}}>
      </ToolbarGroup>
    );
    
    return (
      <div style={{width: '100%'}}>
        {renderToolbar(toolbarActionsGroup)}
        <Tabs
          value={this.state.currentTabIndex}
          onChange={this.handleTabChange}
          tabItemContainerStyle={styles.tabItemContainerStyle}>
          <Tab value={0} style={styles.tab[0]} label="Friends">
            <FriendsTab/>
          </Tab>
          <Tab value={1} style={styles.tab[1]} label="Explore">
            <ExploreTab/>
          </Tab>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories,
    exploreStories: state.stories.exploreStories,
  };
};

export default connect(mapStateToProps)(App);