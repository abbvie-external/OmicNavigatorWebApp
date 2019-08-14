import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { client } from '../Client';
import { Grid, Menu, Button } from 'semantic-ui-react';

class TopBar extends Component {
  state = {};

  componentDidMount() {}

  render() {
    return (
      <Grid.Column className="TopBar" relaxed width={16}>
        <Menu secondary inverted size="mini">
          <Link to={{ pathname: `/` }}>
            <Menu.Item className="Title" name="Phosphoproteomic Analyzer" />
          </Link>
          <Menu.Menu position="right">
            <Menu.Item>
              <div>
                {/* <Link
                to={{
                  pathname: `/public/{{selectedStudy}}.html`,
                }}
                target="blank"
              > */}
                <Button
                  inverted
                  size="small"
                  href="public/***REMOVED***.html"
                  // rel="noopener noreferrer"
                  target="_blank"
                >
                  Study HTML
                </Button>
                {/* </Link> */}
              </div>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </Grid.Column>
    );
  }
}

export default TopBar;
