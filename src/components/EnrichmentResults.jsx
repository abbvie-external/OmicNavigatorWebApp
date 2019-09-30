import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from './SearchingAlt';
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
    isTestSelected: false
  };

  constructor(props) {
    super(props);
    this.state = {
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
      isTestDataLoaded: false,
      barcodeData: [],
      barcodeSettings: {
        lineID: '',
        statLabel: {},
        statistic: '',
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
    addParams.getLink = (enrichmentStudy, enrichmentAnnotation, dataItem) => {
      return function() {
        phosphoprotService
          .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
          .then(annotationDataResponse => {
            const annotationData = JSON.parse(annotationDataResponse);
            dataItem.Annotation = _.find(annotationData, {
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
                'http://amigo.geneontology.org/amigo/term/' +
                  dataItem.Annotation,
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
          });
      };
    };

    addParams.barcodeData = (
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      dataItem,
      test
    ) => {
      return function() {
        testSelectedTransitionCb();
        let xLargest = 0;
        let imageInfo = { key: '', title: '', svg: [] };
        imageInfo.title = test;
        phosphoprotService
          .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
          .then(annotationDataResponse => {
            const annotationData = JSON.parse(annotationDataResponse);
            dataItem.Annotation = _.find(annotationData, {
              Description: dataItem.Description
            }).Key;
            imageInfo.title = test + ':' + dataItem.Annotation;

            phosphoprotService
              .getTestData(enrichmentModel, test, enrichmentStudy + 'plots')
              .then(testDataResponse => {
                let result = testDataResponse.map(obj => {
                  if (
                    enrichmentModel ===
                    'Treatment and/or Strain Differential Phosphorylation'
                  ) {
                    return Math.abs(obj.t);
                  } else {
                    // this.splitter.collapsedChange.emit(true);
                    return Math.abs(obj.F);
                  }
                });
                let sorted = result.slice().sort(function(a, b) {
                  return a - b;
                });
                xLargest = Math.ceil(sorted[sorted.length - 1]);
                phosphoprotService
                  .getBarcodeData(
                    enrichmentStudy + 'plots',
                    enrichmentModel,
                    enrichmentAnnotation,
                    test,
                    dataItem.Annotation
                  )
                  .then(barcodeDataResponse => {
                    let obj = JSON.parse(barcodeDataResponse[0]);
                    showBarcodePlotCb(dataItem, obj, test, xLargest);
                  });
              });
          });
      };
    };

    return addParams;
  };

  showBarcodePlot = (dataItem, barcode, test, largest) => {
    this.setState({
      isTestDataLoaded: true,
      barcodeData: barcode,
      barcodeSettings: {
        lineID: '',
        statLabel: barcode[0].statLabel,
        statistic: 'statistic',
        highLabel: barcode[0].highLabel,
        lowLabel: barcode[0].lowLabel,
        highStat: largest,
        enableBrush: true
      }
    });
  };

  testSelectedTransition = () => {
    this.setState({
      isTestSelected: true
    });
  };

  getUpsetIcon = useUpsetAnalysis => {
    if (useUpsetAnalysis === false) {
      return (
        <img className="UpsetIconImg" src="venndiagram.png" alt="Upset Icon" />
      );
    } else
      return (
        <img
          className="UpsetIconImg"
          src="venndiagramChosenAltGreen.png"
          alt="Upset Icon"
        />
      );
  };

  render() {
    const {
      enrichmentResults,
      enrichmentColumns,
      useUpsetAnalysis
    } = this.props;
    debugger;
    const upsetIconTableHeader = this.getUpsetIcon(useUpsetAnalysis);
    // const rows = this.props.enrichmentResults.length;
    const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(
      this.testSelectedTransition,
      this.showBarcodePlot
    );
    if (!this.state.isTestSelected) {
      return (
        <div>
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
            // headerAttributes={upsetIconTableHeader}
            useUpset={useUpsetAnalysis}
            extraHeaderItem={upsetIconTableHeader}
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
