import React, { Component } from 'react';
import { Accordion, Segment, Loader, Dimmer } from 'semantic-ui-react';
import _ from 'lodash';

class PlotAccordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAccordionReady: false
    };
    this.getAccordion = this.getAccordion.bind(this);
    this.getRootPanels = this.getRootPanels.bind(this);
  }

  componentDidMount() {
    this.setState({
      isAccordionReady: true
    });
  }

  getPeptideNestedItems(itemsObjItemsArray) {
    const itemsObjItemsArrayText = itemsObjItemsArray.map(c => {
      return `${c.text}`;
    });
    if (itemsObjItemsArrayText) {
      return itemsObjItemsArrayText;
    } else return [];
  }

  getPeptideContent(itemsObj) {
    const PeptidePanelsArray = itemsObj.map(b => {
      return {
        key: `${b.key}`,
        title: `${b.text}`,
        content: `${this.getPeptideNestedItems(b.items)}`
      };
    });
    const PeptideContent = <Accordion.Accordion panels={PeptidePanelsArray} />;
    if (PeptideContent) {
      return PeptideContent;
    } else return [];
  }

  getRootPanels() {
    if (this.props.treeData) {
      const treeDataArray = this.props.treeData;
      const rootPanels = treeDataArray.map(a => {
        return {
          key: `${a.key}`,
          title: `${a.text}`,
          content: { content: this.getPeptideContent(a.items) }
        };
      });
      return rootPanels;
    } else return [];
  }

  getAccordion() {
    const rootPanels = this.getRootPanels();
    return (
      <Accordion
        defaultActiveIndex={[0]}
        panels={rootPanels}
        exclusive={false}
        fluid
        // styled
      />
    );
  }

  render() {
    const Accordion = this.getAccordion();
    if (!this.state.isAccordionReady) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Data Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return <div className="">{Accordion}</div>;
    }
  }
}

export default PlotAccordion;
