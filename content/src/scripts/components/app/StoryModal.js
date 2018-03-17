import React, { Component } from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import StoryContainer from './StoryContainer';
import {closeStoryModal} from '../../utils/ContentUtils';

class StoryModal extends Component {
  handleStoryModalClose = () => {
    closeStoryModal();
  };
  
  render() {
    return (
      <Dialog
        open={this.props.isStoryModalOpen}
        onRequestClose={() => closeStoryModal()}
        bodyStyle={{padding: '0px'}}
        contentStyle={{height: '100vh', width: '56.2vh', transform: 'initial', marginTop: '-16px'}}
        autoDetectWindowHeight={false}>
        <StoryContainer/>
      </Dialog>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isStoryModalOpen: state.content.isStoryModalOpen
  };
};

export default connect(mapStateToProps)(StoryModal);