import React, { Component } from 'react';
import { Accordion, Loader, Dimmer, Message } from 'semantic-ui-react';
// import _ from 'lodash';

class DifferentialAccordion extends Component {
  state = {
    isAccordionReady: false,
  };

  componentDidMount() {
    this.setState({
      isAccordionReady: true,
    });
  }

  getPeptideNestedItems = itemsObjItemsArray => {
    const itemsObjItemsArrayText = itemsObjItemsArray.map(c => {
      return `${c.text}`;
    });
    if (itemsObjItemsArrayText) {
      return itemsObjItemsArrayText;
    } else return [];
  };

  getPeptideContent = itemsObj => {
    const PeptidePanelsArray = itemsObj.map(b => {
      return {
        key: `${b.key}`,
        title: `${b.text}`,
        content: `${this.getPeptideNestedItems(b.items)}`,
      };
    });
    const PeptideContent = <Accordion.Accordion panels={PeptidePanelsArray} />;
    if (PeptideContent) {
      return PeptideContent;
    } else return [];
  };

  getRootPanels = () => {
    if (this.props.treeData) {
      const treeDataArray = this.props.treeData;
      const rootPanels = treeDataArray.map(a => {
        return {
          key: `${a.key}`,
          title: `${a.text}`,
          content: { content: this.getPeptideContent(a.items) },
        };
      });
      return rootPanels;
    } else return [];
  };

  getAccordion = () => {
    if (this.props.treeData.length !== 0) {
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
    } else {
      return (
        <Message
          className="NoDataMessage"
          icon="question mark"
          header="No Data Available"
          // content="add description/instructions"
        />
      );
    }
  };

  render() {
    const { isProteinDataLoaded } = this.props;
    if (!isProteinDataLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Data Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      const Accordion = this.getAccordion();
      return <div className="">{Accordion}</div>;
    }
  }
}

export default DifferentialAccordion;
