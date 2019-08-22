import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Tab, Menu } from 'semantic-ui-react';
import PepplotContainer from './Pepplot';
import EnrichmentContainer from './Enrichment';

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: { activeIndex: 1 }
    };
  }

  componentDidMount() {}

  handleTabChange = (e, { activeIndex }) => {
    this.setState({ activeIndex });
  };

  render() {
    const { activeIndex } = this.state;
    const panes = [
      {
        menuItem: (
          <Menu.Item key="1" disabled className="LogoElement">
            <img
              alt="Phosphoproteomic Analyzer"
              src="/icon.png"
              className="LogoImage"
            />
          </Menu.Item>
        )
      },
      {
        menuItem: (
          <Menu.Item key="2" header disabled className="Title">
            <b>Phosphoproteomic</b>&nbsp;
            <span className="TitleTextStyle">Analyzer</span>
          </Menu.Item>
        )
      },
      {
        menuItem: 'Differential Phosophate Analysis',
        pane: (
          <Tab.Pane key="3" className="">
            <Grid>
              <PepplotContainer props />
            </Grid>
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Enrichment Analysis',
        pane: (
          <Tab.Pane key="4" className="">
            <Grid>
              <EnrichmentContainer props />
            </Grid>
          </Tab.Pane>
        )
      }
    ];

    return (
      <Tab
        onTabChange={this.handleTabChange}
        panes={panes}
        activeIndex={activeIndex}
        defaultActiveIndex={2}
        renderActiveOnly={false}
        menu={{
          secondary: true,
          pointing: true,
          inverted: true,
          className: 'MenuContainer'
        }}
      />
    );
  }
}

export default withRouter(Tabs);
// export default Tabs;
