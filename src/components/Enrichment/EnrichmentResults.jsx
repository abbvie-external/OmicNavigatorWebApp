import React, { Component } from 'react';
import { Popup, Icon } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from '../Transitions/SearchingAlt';
import './EnrichmentResults.scss';
import _ from 'lodash';
import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap
} from '../utility/selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class EnrichmentResults extends Component {
  static defaultProps = {
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    enrichmentView: 'table'
  };

  constructor(props) {
    super(props);
    this.state = {
      annotationData: [],
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      plotType: [],
      imageInfo: {
        key: null,
        title: '',
        svg: []
      },
      currentSVGs: [],
      isTestSelected: false,
      isTestDataLoaded: false,
      barcodeSettings: {
        barcodeData: [],
        chartSize: { height: '200', width: '960' },
        lineID: '',
        statLabel: {},
        statistic: '',
        logFC: '',
        highLabel: {},
        lowLabel: {},
        highStat: null,
        enableBrush: false
      }
    };
  }

  componentDidMount() {}

  showPhosphositePlus = dataItem => {
    return function() {
      var protein = (dataItem.Description
        ? dataItem.Description
        : dataItem.MajorityProteinIDsHGNC
      ).split(';')[0];
      let param = { queryId: -1, from: 0, searchStr: protein };
      phosphoprotService.postToPhosphositePlus(
        param,
        'https://www.phosphosite.org/proteinSearchSubmitAction.action'
      );
    };
  };

  getTableHelpers = (testSelectedTransitionCb, showBarcodePlotCb) => {
    let addParams = {};

    addParams.barcodeData = (
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      dataItem,
      test
    ) => {
      let self = this;
      return function() {
        debugger;
        testSelectedTransitionCb(true);
        let xLargest = 0;
        let imageInfo = { key: '', title: '', svg: [] };
        phosphoprotService
          .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
          .then(annotationDataResponse => {
            const annotationDataParsed = JSON.parse(annotationDataResponse);
            self.setState({
              annotationData: annotationDataParsed
            });
            dataItem.Annotation = _.find(annotationDataParsed, {
              Description: dataItem.Description
            }).Key;
            let term = dataItem.Annotation;
            debugger;
            self.setState({
              imageInfo: {
                ...self.state.imageInfo,
                key: `${test} : ${dataItem.Description}`,
                title: `${test} : ${dataItem.Description}`
              },
              enrichmentNameLoaded: true
            });

            phosphoprotService
              .getBarcodeData(
                enrichmentStudy + 'plots',
                enrichmentModel,
                enrichmentAnnotation,
                test,
                dataItem.Annotation
              )
              .then(barcodeDataResponse => {
                let BardcodeInfoObj = JSON.parse(barcodeDataResponse['object']);
                let highest = barcodeDataResponse['highest'][0];
                // if (!this.state.modelsToRenderViolin.includes(this.enrichmentModel)){
                //   this.setState({ sizeVal = '0%' )};
                // } else {
                //   this.setState({ sizeVal = '50%')};
                // }

                showBarcodePlotCb(dataItem, BardcodeInfoObj, test, highest);
              });
            // });
          });
      };
    };

    addParams.getLink = (enrichmentStudy, enrichmentAnnotation, dataItem) => {
      return function() {
        // phosphoprotService
        //   .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
        //   .then(annotationDataResponse => {
        //     const annotationData = JSON.parse(annotationDataResponse);
        dataItem.Annotation = _.find(this.state.annotationData, {
          Description: dataItem.Description
        }).Key;
        const database = enrichmentAnnotation;
        if (database === 'REACTOME') {
          window.open(
            'https://reactome.org/content/detail/' + dataItem.Annotation,
            '_blank'
          );
        } else if (database.substring(0, 2) === 'GO') {
          window.open(
            'http://amigo.geneontology.org/amigo/term/' + dataItem.Annotation,
            '_blank'
          );
        } else if (database.substring(0, 4) === 'msig') {
          window.open(
            'http://software.broadinstitute.org/gsea/msigdb/cards/' +
              dataItem.Annotation,
            '_blank'
          );
        } else if (database === 'PSP') {
          this.showPhosphositePlus('', dataItem);
        }
        // });
      };
    };

    return addParams;
  };

  // setHeight(e) {
  //   let bHeight = e;
  //   let splitterHeight = this.dialogHeight - 77;
  //   let height = (100 - Math.ceil(((splitterHeight - bHeight) / splitterHeight) * 100) - 1.35);
  //   this.s = height.toString() + "%";
  // }

  calculateHeight() {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    return h;
  }

  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    return w;
  }

  // sizeChange(event) {
  //   let splitter = document.getElementById('left-splitter');
  //   if (event.substring(0, 2) > 50) {
  //     console.log('over')
  //     splitter.setAttribute('class', 'show-y-scroll');
  //   } else {
  //     console.log('under')
  //     splitter.setAttribute('class', 'hide-y-scroll')
  //   }
  // }

  showBarcodePlot = (dataItem, barcode, test, highest) => {
    let containerWidth = this.calculateWidth() * 0.95;
    let containerHeight = this.calculateHeight() * 0.95;
    this.setState({
      isTestDataLoaded: true,
      barcodeSettings: {
        barcodeData: barcode,
        chartSize: { height: 330, width: containerWidth - 500 },
        lineID: '',
        statLabel: barcode[0].statLabel,
        statistic: 'statistic',
        logFC: 'logFC',
        highLabel: barcode[0].highLabel,
        lowLabel: barcode[0].lowLabel,
        highStat: highest,
        enableBrush: true
      }
    });
  };

  backToTable = () => {
    this.setState({
      isTestSelected: false,
      enrichmentNameLoaded: false
    });
    // push url prop for selected back to ''
    // this.props.onSearchCriteriaChange(
    //   {
    //     enrichmentStudy: this.props.enrichmentStudy || '',
    //     enrichmentModel: this.props.enrichmentModel || '',
    //     enrichmentAnnotation: this.props.enrichmentAnnotation || '',
    //   },
    //   false
    // );
  };

  testSelectedTransition = bool => {
    this.setState({
      isTestSelected: bool
    });
  };

  // enrichmentViewChange(choice) {
  //   return evt => {
  //     this.props.onEnrichmentViewChange({
  //       enrichmentView: choice
  //     });
  //   };
  // };

  render() {
    const { enrichmentResults, enrichmentColumns } = this.props;
    // const rows = this.props.enrichmentResults.length;
    const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(
      this.testSelectedTransition,
      this.showBarcodePlot
    );

    const IconPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    const enrichmentViewToggle = (
      <div className="TableVsNetworkToggle">
        <Popup
          trigger={
            <Icon
              name="table"
              size="large"
              color="orange"
              bordered
              className="TableVsNetworkButtons"
              inverted={this.props.enrichmentView === 'table'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'table'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Table"
        />
        <Popup
          trigger={
            <Icon
              name="chart pie"
              size="large"
              color="orange"
              bordered
              className="TableVsNetworkButtons"
              inverted={this.props.enrichmentView === 'network'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'network'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Network Graph"
        />
      </div>
    );

    if (!this.state.isTestSelected) {
      return (
        <div>
          {enrichmentViewToggle}
          <EZGrid
            data={enrichmentResults}
            columnsConfig={enrichmentColumns}
            // totalRows={rows}
            // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={100}
            exportBaseName="Enrichment_Analysis"
            quickViews={quickViews}
            disableGeneralSearch
            disableGrouping
            disableColumnVisibilityToggle
            height="75vh"
            additionalTemplateInfo={additionalTemplateInfo}
            // extraHeaderItem={enrichmentViewToggle}
          />
        </div>
      );
    } else if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div>
          <SearchingAlt />
        </div>
      );
    } else {
      return (
        <div>
          <SplitPanesContainer
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
          ></SplitPanesContainer>
        </div>
      );
    }
  }
}

export default withRouter(EnrichmentResults);
