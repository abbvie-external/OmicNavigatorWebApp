import React, { Component } from 'react';
import { Modal, Button } from 'semantic-ui-react';

class Terms extends Component {
  state = {
    terms: null,
    termsOpen: false,
  };

  componentDidMount() {
    this.getTerms();
  }

  async getTerms() {
    try {
      let terms = await this.fetchTerms();
      this.setState({
        terms: terms,
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  async fetchTerms() {
    let response = await fetch('/terms.html');
    // read response stream as text
    let textData = await response.text();
    if (textData.includes('OmicNavigator')) {
      return textData;
    } else return null;
  }

  toggleTerms = bool => {
    this.setState({
      termsOpen: bool,
    });
  };

  getTermsButton = () => {
    const { terms } = this.state;
    const self = this;
    return (
      <>
        <Button
          className="CursorPointer"
          id="TermsButton"
          name="file"
          onClick={() => self.toggleTerms(true)}
        >
          View Terms
        </Button>
        <Modal
          size="small"
          closeOnDimmerClick={true}
          closeOnEscape={true}
          closeIcon
          centered={false}
          open={self.state.termsOpen}
          onOpen={() => self.toggleTerms(true)}
          onClose={() => self.toggleTerms(false)}
        >
          <Modal.Header>Terms &#38; Conditions</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <div dangerouslySetInnerHTML={{ __html: terms }} />
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </>
    );
  };

  render() {
    const { terms } = this.state;
    const termsButton = this.getTermsButton();
    return <>{terms && <span id="TermsButtonContainer">{termsButton}</span>}</>;
  }
}

export default Terms;
