import React, { Component } from 'react';
import QHGrid from '../utility/QHGrid';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
import EZGrid from '../utility/EZGrid';
import ButtonActions from '../Shared/ButtonActions';
import PepplotPlot from './PepplotPlot';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import PepplotVolcanoPlot from './PepplotVolcanoPlot'
import { Popup } from 'semantic-ui-react';
import phosphosite_icon from '../../resources/phosphosite.ico';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import DOMPurify from 'dompurify';
import './PepplotVolcano.scss';
import {
    getFieldValue,
    getField,
    typeMap
  } from '../utility/selectors/QHGridSelector';

class PepplotVolcano extends Component{
    state = {
        filteredTableConfigCols: [],
        filteredTableData: [],
        itemsPerPageInformedPepplot: null,
        treeDataRaw: [],
        treeData: [],
        treeDataColumns: [],
        isSVGDataLoaded: false,
        isItemSelected: false,
        isProteinSVGLoaded: false,
        volcanoPlotRows:0,
        imageInfo: {
          key: null,
          title: '',
          svg: [],
        },
        plotType: [],
        currentSVGs: [],
        selectedFromTableData:[]
    };

    componentDidMount() {
        const ProteinSite = this.props.pepplotProteinSite || '';
        if (ProteinSite !== '') {
          const Proteins = this.props.pepplotResults;
          const Index = _.findIndex(Proteins, function(p) {
            return firstValue(p.Protein_Site) === ProteinSite;
          });
          const dataItem = Proteins[Index];
          this.getProteinPageFromUrl(
            this.getProteinData,
            this.getPlot,
            this.props.pepplotModel,
            dataItem,
          );
        }
    }
    componentDidUpdate= () => {
      if (
        this.props.tab === 'pepplot' &&
        this.props.proteinToHighlightInDiffTable !== '' &&
        this.props.proteinToHighlightInDiffTable !== undefined
      ) {
        this.pageToProtein(
          this.props.pepplotResults,
          this.props.proteinToHighlightInDiffTable,
          this.state.itemsPerPageInformed,
        );
      }
    }
    handleVolcanoPlotSelectionChange=(volcanoPlotSelectedDataArr)=>{
      this.setState({
        filteredTableData: volcanoPlotSelectedDataArr,
        volcanoPlotRows: volcanoPlotSelectedDataArr.length,
        filteredTableConfigCols: this.getConfigCols(volcanoPlotSelectedDataArr),
        selectedFromTableData: []
      })
    }
    calculateWidth() {
      var w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0,
      );
      if (w > 1199) {
        return w * 0.5;
      } else if (w < 1200 && w > 767) {
        return w * 0.4;
      } else return w * 0.8;
    }

    pageToProtein = (data, proteinToHighlight, itemsPerPage) => {
      if (this.pepplotGridRef.current !== null) {
        const Index = _.findIndex(data, function(p) {
          return p.Protein_Site === proteinToHighlight;
        });
        const pageNumber = Math.ceil(Index / itemsPerPage);
        this.pepplotGridRef.current.handlePageChange(
          {},
          { activePage: pageNumber },
        );
      }
    };

    getProteinPageFromUrl = (
      getProteinDataCb,
      getPlotCb,
      pepplotModel,
      dataItem,
    ) => {
      let imageInfo = { key: '', title: '', svg: [] };
      switch (pepplotModel) {
        case 'Differential Expression':
          imageInfo.title = 'Protein Intensity - ' + dataItem.MajorityProteinIDs;
          imageInfo.key = dataItem.MajorityProteinIDs;
          break;
        default:
          imageInfo.title = 'Phosphosite Intensity - ' + dataItem.Protein_Site;
          imageInfo.key = dataItem.Protein_Site;
      }
      getProteinDataCb(
        dataItem.id_mult ? dataItem.id_mult : dataItem.id,
        dataItem,
        getPlotCb,
        imageInfo,
      );
    };

    handleSVG = imageInfo => {
      this.setState({
        imageInfo: imageInfo,
        isProteinSVGLoaded: true,
      });
    };

    handleItemSelected = bool => {
      this.setState({
        isItemSelected: bool,
      });
    };

    getConfigCols = testData => {
        const pepResults = testData;
        const model = this.props.pepplotModel;
        let initConfigCols = [];
    
        const TableValuePopupStyle = {
          backgroundColor: '2E2E2E',
          borderBottom: '2px solid var(--color-primary)',
          color: '#FFF',
          padding: '1em',
          maxWidth: '50vw',
          fontSize: '13px',
          wordBreak: 'break-all'
        };
    
        let icon = phosphosite_icon;
        let iconText = 'PhosphoSitePlus';
    
        if (model === 'Differential Expression') {
          initConfigCols = [
            {
              title: 'MajorityProteinIDsHGNC',
              field: 'MajorityProteinIDsHGNC',
              filterable: { type: 'alphanumericFilter' },
              template: (value, item, addParams) => {
                return (
                  <div>
                    <Popup
                      trigger={
                        <span
                          className="TableCellLink"
                          onClick={addParams.showPlot(model, item)}
                        >
                          {splitValue(value)}
                        </span>
                      }
                      content={value}
                      style={TableValuePopupStyle}
                      className="TablePopupValue"
                      inverted
                      basic
                    />
                    <Popup
                      trigger={
                        <img
                          src={icon}
                          alt="Phosophosite"
                          className="ExternalSiteIcon"
                          onClick={addParams.showPhosphositePlus(item)}
                        />
                      }
                      style={TableValuePopupStyle}
                      className="TablePopupValue"
                      content={iconText}
                      inverted
                      basic
                    />
                  </div>
                );
              }
            },
            {
              title: 'MajorityProteinIDs',
              field: 'MajorityProteinIDs',
              filterable: { type: 'alphanumericFilter' },
              template: (value, item, addParams) => {
                return (
                  <Popup
                    trigger={
                      <span className="TableValue">{splitValue(value)}</span>
                    }
                    content={value}
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    inverted
                    basic
                  />
                );
              }
            }
          ];
        } else {
          initConfigCols = [
            {
              title: 'Protein_Site',
              field: 'Protein_Site',
              filterable: { type: 'alphanumericFilter' },
              template: (value, item, addParams) => {
                return (
                  <div>
                    <Popup
                      trigger={
                        <span
                          className="TableCellLink"
                          onClick={addParams.showPlot(model, item)}
                        >
                          {splitValue(value)}
                        </span>
                      }
                      style={TableValuePopupStyle}
                      className="TablePopupValue"
                      content={value}
                      inverted
                      basic
                    />
                    <Popup
                      trigger={
                        <img
                          src={icon}
                          alt="Phosophosite"
                          className="ExternalSiteIcon"
                          onClick={addParams.showPhosphositePlus(item)}
                        />
                      }
                      style={TableValuePopupStyle}
                      className="TablePopupValue"
                      content={iconText}
                      inverted
                      basic
                    />
                  </div>
                );
              }
            }
          ];
        }
        let relevantConfigCols = [
          'F',
          'logFC',
          't',
          'P_Value',
          'adj_P_Val',
          'adjPVal'
        ];
        if (pepResults.length !== 0 && pepResults.length !== undefined) {
          let orderedTestData = JSON.parse(
            JSON.stringify(pepResults[0], relevantConfigCols)
          );
    
          let relevantConfigColumns = _.map(
            _.filter(_.keys(orderedTestData), function(d) {
              return _.includes(relevantConfigCols, d);
            })
          );
    
          // // if using multi-set analysis, show set membership column
          // if (this.state.multisetQueried) {
          //   relevantConfigColumns.splice(0, 0, 'Set_Membership');
          // }
    
          const additionalConfigColumns = relevantConfigColumns.map(c => {
            return {
              title: c,
              field: c,
              type: 'number',
              filterable: { type: 'numericFilter' },
              exportTemplate: value => (value ? `${value}` : 'N/A'),
              template: (value, item, addParams) => {
                return (
                  <p>
                    <Popup
                      trigger={
                        <span className="TableValue">
                          {formatNumberForDisplay(value)}
                        </span>
                      }
                      style={TableValuePopupStyle}
                      className="TablePopupValue"
                      content={value}
                      inverted
                      basic
                    />
                  </p>
                );
              }
            };
          });
          const configCols = initConfigCols.concat(additionalConfigColumns);
          return configCols;
        }
      };    

    informItemsPerPage = items => {
        this.setState({
          itemsPerPageInformedPepplot: items
        });
    };
    getPlot = (id, plotType, pepplotStudy, imageInfo, handleSVGCb) => {
      // let self = this;
      let currentSVGs = [];
      // keep whatever dimension is less (height or width)
      // then multiply the other dimension by original svg ratio (height 595px, width 841px)
      // let PepplotPlotSVGHeight = this.calculateHeight(this);
      let PepplotPlotSVGWidth = this.calculateWidth(this);
      // if (PepplotPlotSVGHeight > PepplotPlotSVGWidth) {
      let PepplotPlotSVGHeight = PepplotPlotSVGWidth * 0.70749;
      // } else {
      //   PepplotPlotSVGWidth = PepplotPlotSVGHeight * 1.41344;
      // }
      let handleItemSelectedCb = this.handleItemSelected;
  
      _.forEach(plotType, function(plot, i) {
        phosphoprotService
          .getPlot(id, plotType[i], pepplotStudy + 'plots', handleItemSelectedCb)
          .then(svgMarkupObj => {
            let svgMarkup = svgMarkupObj.data;
            svgMarkup = svgMarkup.replace(/id="/g, 'id="' + id + '-' + i + '-');
            svgMarkup = svgMarkup.replace(
              /#glyph/g,
              '#' + id + '-' + i + '-glyph',
            );
            svgMarkup = svgMarkup.replace(/#clip/g, '#' + id + '-' + i + '-clip');
            svgMarkup = svgMarkup.replace(
              /<svg/g,
              `<svg preserveAspectRatio="xMinYMin meet" style="width:${PepplotPlotSVGWidth}px" height:${PepplotPlotSVGHeight} id="currentSVG-${id}-${i}"`,
            );
            DOMPurify.addHook('afterSanitizeAttributes', function(node) {
              if (
                node.hasAttribute('xlink:href') &&
                !node.getAttribute('xlink:href').match(/^#/)
              ) {
                node.remove();
              }
            });
            // Clean HTML string and write into our DIV
            let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
              ADD_TAGS: ['use'],
            });
            let svgInfo = { plotType: plotType[i], svg: sanitizedSVG };
  
            // we want spline plot in zero index, rather than lineplot
            // if (i === 0) {
            imageInfo.svg.push(svgInfo);
            currentSVGs.push(sanitizedSVG);
            // } else {
            // imageInfo.svg.unshift(svgInfo);
            // currentSVGs.unshift(sanitizedSVG);
            // }
            handleSVGCb(imageInfo);
          });
        // .catch(error => {
        //   toast.error('Failed to create plot, please try again.');
        // });
      });
    };

    getProteinData = (id, dataItem, getPlotCb, imageInfo) => {
      this.setState({
        imageInfo: imageInfo,
        isItemSelected: true,
        isProteinSVGLoaded: false,
        isProteinDataLoaded: false,
        treeDataRaw: [],
        treeData: [],
        treeDataColumns: [],
        currentSVGs: [],
      });
      const ProteinSiteVar = firstValue(dataItem.Protein_Site, true);
      this.props.onSearchCriteriaChange(
        {
          pepplotStudy: this.props.pepplotStudy || '',
          pepplotModel: this.props.pepplotModel || '',
          pepplotTest: this.props.pepplotTest || '',
          pepplotProteinSite: ProteinSiteVar || '',
        },
        false,
      );
      let pepplotModel = this.props.pepplotModel;
      let pepplotStudy = this.props.pepplotStudy;
      let plotType = ['splineplot'];
      switch (pepplotModel) {
        case 'DonorDifferentialPhosphorylation':
          plotType = ['dotplot'];
          break;
        case 'TreatmentDifferentialPhosphorylation':
          plotType = ['splineplot'];
          break;
        case 'Treatment and or Strain Differential Phosphorylation':
          plotType = ['StrainStimDotplot', 'StimStrainDotplot'];
          break;
        case 'Timecourse Differential Phosphorylation':
          plotType = ['splineplot', 'lineplot'];
          break;
        case 'Differential Expression':
          if (pepplotStudy === '***REMOVED***') {
            plotType = ['proteinlineplot'];
          } else {
            plotType = ['proteindotplot'];
          }
          break;
        case 'Differential Phosphorylation':
          if (pepplotStudy === '***REMOVED***') {
            plotType = ['proteinlineplot'];
          } else {
            plotType = ['proteindotplot'];
          }
          break;
        case 'No Pretreatment Timecourse Differential Phosphorylation':
          plotType = ['splineplot.modelII', 'lineplot.modelII'];
          break;
        case 'Ferrostatin Pretreatment Timecourse Differential Phosphorylation':
          plotType = ['splineplot.modelIII', 'lineplot.modelIII'];
          break;
        default:
          plotType = ['dotplot'];
      }
      const handleSVGCb = this.handleSVG;
      getPlotCb(id, plotType, pepplotStudy, imageInfo, handleSVGCb);
      if (pepplotModel !== 'Differential Expression') {
        phosphoprotService
          .getSiteData(id, pepplotStudy + 'plots')
          .then(treeDataResponse => {
            this.setState({
              treeDataRaw: treeDataResponse,
            });
            let tdCols = _.map(_.keys(treeDataResponse[0]), function(d) {
              return { key: d, field: d };
            });
            this.setState({
              treeDataColumns: tdCols,
            });
            let tD = _.map(treeDataResponse, function(d, i) {
              let entries = _.toPairs(d);
  
              entries = _.map(entries, function(e) {
                return { key: e[0], text: e[0], items: [{ text: e[1] }] };
              });
              return {
                key: i + 1,
                text: 'Peptide' + (i + 1) + '  (' + d.Modified_sequence + ')',
                items: entries,
              };
            });
            this.setState({
              treeData: tD,
              isProteinDataLoaded: true,
            });
          });
      } else {
        phosphoprotService
          .getProteinData(id, pepplotStudy + 'plots')
          .then(proteinDataResponse => {
            this.setState({
              treeDataRaw: proteinDataResponse,
            });
            let tdCols = _.map(_.keys(proteinDataResponse[0]), function(d) {
              return { key: d, field: d };
            });
            this.setState({
              treeDataColumns: tdCols,
            });
  
            let proteinData = _.map(proteinDataResponse, function(d, i) {
              var entries = _.toPairs(d);
              entries = _.map(entries, function(e) {
                return { key: e[0], text: e[0], items: [{ text: e[1] }] };
              });
              return {
                key: i + 1,
                text: 'Differential Expression Data',
                items: entries,
              };
            });
            this.setState({
              treeData: proteinData,
            });
          });
      }
    };
    getTableHelpers = (
        getProteinDataCb,
        getPlotCb,
        proteinToHighlightInDiffTable
      ) => {
        let addParams = {};
        if (proteinToHighlightInDiffTable.length > 0 && proteinToHighlightInDiffTable != null) {
          addParams.rowHighlightOther = [];
          proteinToHighlightInDiffTable.forEach(element => {
            addParams.rowHighlightOther.push(element.sample);
          });
        }
        addParams.showPhosphositePlus = dataItem => {
          return function() {
            var protein = (dataItem.Protein
              ? dataItem.Protein
              : dataItem.MajorityProteinIDsHGNC
            ).split(';')[0];
            let param = { proteinNames: protein, queryId: -1, from: 0 };
            phosphoprotService.postToPhosphositePlus(
              param,
              'https://www.phosphosite.org/proteinSearchSubmitAction.action'
            );
          };
        };
    
        addParams.showPlot = (pepplotModel, dataItem) => {
          return function() {
            let imageInfo = { key: '', title: '', svg: [] };
            switch (pepplotModel) {
              case 'Differential Expression':
                imageInfo.title =
                  'Protein Intensity - ' + dataItem.MajorityProteinIDs;
                imageInfo.key = dataItem.MajorityProteinIDs;
                break;
              default:
                imageInfo.title =
                  'Phosphosite Intensity - ' + dataItem.Protein_Site;
                imageInfo.key = dataItem.Protein_Site;
            }
            getProteinDataCb(
              dataItem.id_mult ? dataItem.id_mult : dataItem.id,
              dataItem,
              getPlotCb,
              imageInfo
            );
          };
        };
        return addParams;
      };

      handleRowClick = (event, item, index) => {
        const PreviouslyHighlighted = this.state.selectedFromTableData;
        event.stopPropagation();
        if (event.shiftKey) {
          const allTableData = _.cloneDeep(this.state.filteredTableData);
          const indexMaxProtein = _.findIndex(allTableData, function(d) {
            return d.Protein_Site === PreviouslyHighlighted[0]?.sample;
          });
          const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
          const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
          const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
          const shiftedTableDataArray = shiftedTableData.map(function(d) {
            return {
              sample: d.Protein_Site,
              id_mult: d.id_mult,
              cpm: d.F === undefined ? d.t : d.F,
            };
          });
          this.setState({selectedFromTableData: shiftedTableDataArray});
          // console.log('shift');
          // document.addEventListener('onkeydown', event => {
          //   console.log('keydown');
          //   console.log(event.code);
          // });
        } else if (event.ctrlKey) {
          console.log('control');
          const allTableData = _.cloneDeep(this.state.filteredTableData);
          let selectedTableDataArray = [];
    
          const ctrlClickedObj = allTableData[index];
          const alreadyHighlighted = PreviouslyHighlighted.some(
            d => d.sample === ctrlClickedObj.Protein_Site,
          );
          // already highlighted, remove it from array
          if (alreadyHighlighted) {
            selectedTableDataArray = PreviouslyHighlighted.filter(
              i => i.sample !== ctrlClickedObj.Protein_Site,
            );
            this.setState({selectedFromTableData: selectedTableDataArray});
          } else {
            // not yet highlighted, add it to array
            const indexMaxProtein = _.findIndex(allTableData, function(d) {
              return d.Protein_Site === PreviouslyHighlighted[0]?.sample;
            });
            // map protein to fix obj entries
            const mappedProtein = {
              sample: ctrlClickedObj.Protein_Site,
              id_mult: ctrlClickedObj.id_mult,
              cpm:
                ctrlClickedObj.F === undefined
                  ? ctrlClickedObj.t
                  : ctrlClickedObj.F,
            };
            const lowerIndexThanMax = index < indexMaxProtein ? true : false;
            if (lowerIndexThanMax) {
              // add to beginning of array if max
              PreviouslyHighlighted.unshift(mappedProtein);
            } else {
              // just add to array if not max
              PreviouslyHighlighted.push(mappedProtein);
            }
            this.setState({selectedFromTableData: PreviouslyHighlighted});
          }
        } else {
          console.log('click');
          this.setState({selectedFromTableData:[
            {
              sample: item.Protein_Site, //lineID,
              id_mult: item.id_mult,
              cpm: item.logFC, //statistic,
            },
          ]});
        }
      };

      backToTable = () => {
        this.setState({
          isItemSelected: false,
          isProteinDataLoaded: false,
          isProteinSVGLoaded: false,
        });
        this.props.onSearchCriteriaChange(
          {
            pepplotStudy: this.props.pepplotStudy || '',
            pepplotModel: this.props.pepplotModel || '',
            pepplotTest: this.props.pepplotTest || '',
            pepplotProteinSite: '',
          },
          false,
        );
      };

    render(){
        const{
            filteredTableConfigCols,
            filteredTableData,
            itemsPerPageInformedPepplot,
            volcanoPlotRows, 
            selectedFromTableData,
            isItemSelected,
            isProteinSVGLoaded
        } = this.state;
    
        const additionalTemplateInfo = this.getTableHelpers(
          this.getProteinData,
          this.getPlot,
          selectedFromTableData
        );
        if(volcanoPlotRows === 0 && !isItemSelected){
          return(
            <div className="PepplotVolcano">
              <PepplotVolcanoPlot
                {...this.state}
                {...this.props}
                handleVolcanoPlotSelectionChange={this.handleVolcanoPlotSelectionChange}
              ></PepplotVolcanoPlot>
              </div>
            )
        }else if(volcanoPlotRows !== 0 && !isItemSelected){
        return(
        <div className="PepplotVolcano">
          <PepplotVolcanoPlot
            {...this.state}
            {...this.props}
            handleVolcanoPlotSelectionChange={this.handleVolcanoPlotSelectionChange}
          ></PepplotVolcanoPlot>
          <EZGrid
              data={filteredTableData}
              totalRows={volcanoPlotRows}
              columnsConfig={filteredTableConfigCols}

              itemsPerPage={itemsPerPageInformedPepplot}
              onInformItemsPerPage={this.informItemsPerPage}

              disableGeneralSearch
              disableGrouping
              disableColumnVisibilityToggle
              exportBaseName="VolcanoPlot_Filtered_Results"
              additionalTemplateInfo={additionalTemplateInfo}
              itemsPerPage={20}
              headerAttributes={<ButtonActions />}
              onRowClick={this.handleRowClick}
            />
          </div>
        ) 
        }
        else if (isItemSelected && !isProteinSVGLoaded) {
          return (
            <div>
              <LoaderActivePlots />
            </div>
          );
        } else {
          return (
            <div>
              <PepplotPlot
                // ref={this.PepplotViewContainerRef}
                {...this.props}
                {...this.state}
                onBackToTable={this.backToTable}
              ></PepplotPlot>
            </div>
          );
        }
      }
}
export default PepplotVolcano

function firstValue(value) {
    if (value) {
      const firstValue = value.split(';')[0];
      return firstValue;
    }
}