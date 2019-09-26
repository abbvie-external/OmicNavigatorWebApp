import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Tab, Menu } from 'semantic-ui-react';
import PepplotContainer from './Pepplot';
import EnrichmentContainer from './Enrichment';
import { updateUrl } from './UrlControl';

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 2
    };
  }

  // componentDidMount() {
  //   const pathname = this.props.location.pathname;
  //   const enrichment = pathname.includes('enrichment');
  //   const tab = enrichment ? 'enrichment' : 'pepplot';
  //   this.props.history.push(tab);
  //   let index = tab === 'enrichment' ? 3 : 2;
  //   this.setState({
  //     activeIndex: index
  //   });
  // }
  componentDidMount() {
    updateUrl(this.props, this.state, 'tabInit', this.setTabIndex);
  }

  setTabIndex = tabIndex => {
    this.setState({
      activeIndex: tabIndex
    });
  };

  handleTabChange = (e, { activeIndex }) => {
    updateUrl(this.props, this.state, 'tabChange', this.setTabIndex);
  };
  // handleTabChange = (e, { activeIndex }) => {
  //   this.setState({ activeIndex });
  //   let tab = activeIndex === 3 ? 'enrichment' : 'pepplot';
  //   this.props.history.push(tab);
  // };

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
