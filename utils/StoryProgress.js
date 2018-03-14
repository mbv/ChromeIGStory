import React, { Component } from 'react';

class StoryProgress extends Component {
  render () {
    const styles = {
      container: {
        display: 'flex',
        flexDirection: 'row'
      },
      progressLine: {
        flex: 1,
        height: '2px',
        marginLeft: 4,
        marginRight: 4
      }
    };
    var progressComponents = [];
    for(var i = 0; i < this.props.storyLength; i++) {
      var backgroundColor = (i === this.props.activeSlide) ? 'white' : "#ADADAD";
      progressComponents.push(<div key={i} style={Object.assign({}, styles.progressLine, {backgroundColor: backgroundColor})} />)
    }
    return (
      <div style={Object.assign({}, styles.container, this.props.style)}>
        {progressComponents}
      </div>
    );
  }
}

export default StoryProgress;