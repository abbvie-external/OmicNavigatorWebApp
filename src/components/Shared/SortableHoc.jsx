import React, { Component } from 'react';
import './SortableHoc.scss';
import { Label } from 'semantic-ui-react';
import {
  sortableContainer,
  sortableElement
  //   sortableHandle
} from 'react-sortable-hoc';
import arrayMove from 'array-move';

// const DragHandle = sortableHandle(() => <span>::</span>);
const SortableItem = sortableElement(props => (
  <li className="NetworkGraphSortableLink">
    {/* <DragHandle /> */}
    <Label color="blue" size="small" key={`label-${props.value}`}>
      {props.sortIndex}) {props.value}
    </Label>
  </li>
));

const SortableContainer = sortableContainer(({ children }) => {
  return <ul>{children}</ul>;
});

class SortableHoc extends Component {
  state = {
    items: ['Significance', 'Edge Count', 'Node Count']
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ items }) => ({
      items: arrayMove(items, oldIndex, newIndex)
    }));
  };

  render() {
    const { items } = this.state;

    return (
      <SortableContainer
        onSortEnd={this.onSortEnd}
        // useDragHandle
        helperClass="SortableHelper"
        id="NetworkGraphSortableContainer"
      >
        {/* Sort By */}
        {items.map((value, index) => (
          <SortableItem
            key={`item-${value}`}
            index={index}
            sortIndex={index}
            value={value}
            className="SortableItem NoSelect"
          />
        ))}
      </SortableContainer>
    );
  }
}

export default SortableHoc;
