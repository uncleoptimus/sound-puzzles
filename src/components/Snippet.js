import React from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from "../ItemTypes";
import AudioCanvas from "./AudioCanvas";

const snippetSource = {
  beginDrag(props) {
    return {
      id: props.details.id,
      index: props.index
    };
  }
};

const snippetTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // console.log(dragIndex, hoverIndex, props.moveSnippet);
    

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get horizontalmiddle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the left
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging left
    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return;
    }

    // Dragging right
    if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
      return;
    }

    // Time to actually perform the action
    props.moveSnippet(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

/**
 * Specifies the props to inject into your component.
 */
// function collect(connect, monitor) {
//   return {
//     connectDragSource: connect.dragSource(),
//     connectDropTarget: connect.dropTarget(),
//     isDragging: monitor.isDragging()
//   };
// }


class Snippet extends React.Component {
  render () {
    // console.log(this.props);
    // const { details, isPlaying } = this.props;
    const { details, isPlaying, isDragging, connectDragSource, connectDropTarget } = this.props;

    const snippetStyle = {
      // backgroundColor: isDragging ? 'red' : details.color
      backgroundColor: details.color,
      flexBasis: details.length * 50,
      flexShrink: 1
    }

    let audioCanvas = null;

    if (isPlaying) {
      audioCanvas = <AudioCanvas snippetAction={this.props.snippetAction} color={details.color}/>
    }

    return connectDragSource(connectDropTarget(
      <li 
        className={`sp-snippet ${isDragging ? "dragging" : ""} ${isPlaying ? "playing" : "not-playing"}`}
        onClick={() => this.props.playSnippet(details)} 
        style={snippetStyle}
      >
        {audioCanvas}
      </li>
    ));
  }
}

export default DragSource(ItemTypes.SNIPPET, snippetSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(
  DropTarget(ItemTypes.SNIPPET, snippetTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  }))(Snippet)
);