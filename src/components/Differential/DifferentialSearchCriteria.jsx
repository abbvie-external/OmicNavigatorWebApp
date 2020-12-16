import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Select,
  Icon,
  Popup,
  Divider,
  Radio,
  Transition,
} from 'semantic-ui-react';
import { CancelToken } from 'axios';
import DOMPurify from 'dompurify';
import '../Shared/SearchCriteria.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialMultisetFilters from './DifferentialMultisetFilters';

let cancelRequestGetReportLinkDifferential = () => {};
let cancelRequestPSCGetResultsTable = () => {};
let cancelRequestMultisetInferenceData = () => {};
let cancelRequestInferenceMultisetPlot = () => {};
class DifferentialSearchCriteria extends Component {
  state = {
    differentialStudies: [],
    differentialStudyHrefVisible: false,
    differentialStudyHref: '',
    differentialStudyReportTooltip:
      'Select a study and model to view Analysis Details',
    differentialModels: [],
    differentialTests: [],
    differentialModelTooltip: '',
    differentialTestTooltip: '',
    differentialStudiesDisabled: true,
    differentialModelsDisabled: true,
    differentialTestsDisabled: true,
    uAnchorP: '',
    selectedColP: [],
    selectedOperatorP: [
      {
        key: '<',
        text: '<',
        value: '<',
      },
    ],
    sigValueP: [0.05],
    reloadPlotP: true,
    uSettingsP: {
      defaultselectedColP: [],
      defaultselectedOperatorP: {
        key: '<',
        text: '<',
        value: '<',
      },
      defaultSigValueP: [0.05],
      useAnchorP: true,
      hoveredFilter: -1,
      mustP: [],
      notP: [],
      displayMetaDataP: true,
      templateName: 'differential-multiset',
      numElementsP: 0,
      maxElementsP: 0,
      indexFiltersP: [0],
      metaSvgP: '',
      heightScalarP: 1,
      thresholdOperatorP: [
        {
          key: '<',
          text: '<',
          value: '<',
        },
        {
          key: '>',
          text: '>',
          value: '>',
        },
        {
          key: '|<|',
          text: '|<|',
          value: '|<|',
        },
        {
          key: '|>|',
          text: '|>|',
          value: '|>|',
        },
      ],
    },
    multisetFiltersVisibleDifferential: false,
    activateMultisetFiltersP: false,
    uDataP: [],
    initialRenderP: true,
    // loadingDifferentialMultisetFilters: false,
  };

  componentDidMount() {
    this.setState({
      differentialStudiesDisabled: false,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.allStudiesMetadata !== prevProps.allStudiesMetadata ||
      this.props.differentialStudy !== prevProps.differentialStudy
    ) {
      this.populateDropdowns();
    }
    // if (this.props.multisetPlotAvailableDifferential !== prevProps.multisetPlotAvailableDifferential) {
    //   this.forceUpdate();
    // }
  }

  populateDropdowns = () => {
    const {
      allStudiesMetadata,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      onSearchCriteriaChangeDifferential,
      onSearchTransitionDifferential,
    } = this.props;
    const studies = allStudiesMetadata.map(study => {
      const studyName = study.name;
      return {
        key: `${studyName}Differential`,
        text: studyName,
        value: studyName,
      };
    });
    this.setState({
      differentialStudies: studies,
    });
    if (differentialStudy !== '') {
      // loop through allStudiesMetadata to find the object with the name matching differentialStudy
      const allStudiesMetadataCopy = [...allStudiesMetadata];
      const differentialStudyData = allStudiesMetadataCopy.find(
        study => study.name === differentialStudy,
      );
      const differentialModelsAndTestsVar =
        differentialStudyData?.results || [];
      this.props.onSetStudyModelTestMetadata(
        differentialStudyData,
        differentialModelsAndTestsVar,
      );
      const differentialModelsMapped = differentialModelsAndTestsVar.map(
        result => {
          return {
            key: `${result.modelID}Differential`,
            text: result.modelID,
            value: result.modelID,
          };
        },
      );

      this.setState({
        differentialModelsDisabled: false,
        differentialModels: differentialModelsMapped,
      });
      this.getReportLink(differentialStudy, 'default');
      if (differentialModel !== '') {
        this.props.onDoMetaFeaturesExist(differentialStudy, differentialModel);
        this.props.onGetResultsLinkouts(differentialStudy, differentialModel);
        this.props.onHandlePlotTypesDifferential(differentialModel);
        const differentialModelWithTests = differentialModelsAndTestsVar.find(
          model => model.modelID === differentialModel,
        );
        const differentialModelTooltip =
          differentialModelWithTests?.modelDisplay || '';
        this.setState({
          differentialModelTooltip: differentialModelTooltip,
        });
        const differentialTestsMetadataVar =
          differentialModelWithTests?.tests || [];
        const differentialTestsMapped = differentialTestsMetadataVar.map(
          test => {
            return {
              key: `${test.testID}Differential`,
              text: test.testID,
              value: test.testID,
            };
          },
        );
        const uDataPMapped = differentialTestsMetadataVar.map(t => t.testID);
        this.setState({
          differentialTestsDisabled: false,
          differentialTests: differentialTestsMapped,
          uDataP: uDataPMapped,
        });
        this.props.onSetTestsMetadata(differentialTestsMetadataVar);
        this.getReportLink(differentialStudy, differentialModel);
        if (differentialTest !== '') {
          onSearchTransitionDifferential(true);
          // omicNavigatorService
          //   .getResultsTable(
          //     differentialStudy,
          //     differentialModel,
          //     differentialTest,
          //     onSearchTransitionDifferential,
          //   )
          //   .then(getResultsTableData => {
          //     // debugger;
          //     // getResultsTableData = getResultsTableData.json();
          //     if (getResultsTableData != null) {
          //       if (getResultsTableData.length > 0) {
          //         this.handleGetResultsTableData(
          //           getResultsTableData,
          //           true,
          //           true,
          //           differentialTest,
          //         );
          //       }
          //     }
          //   })
          //   .catch(error => {
          //     console.error('Error during getResultsTable', error);
          //   });

          const self = this;
          const obj = {
            study: differentialStudy,
            modelID: differentialModel,
            testID: differentialTest,
          };
          const fetchUrl = `***REMOVED***/ocpu/library/OmicNavigator/R/getResultsTable/json?auto_unbox=true`;
          const fetchResponse = fetch(fetchUrl, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            // mode: 'cors', // no-cors, *cors, same-origin
            // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            // credentials: 'same-origin', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json',
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(obj), // body data type must match "Content-Type" header
          })
            // .then(response => response.json())
            //   .then(response => response.text())
            //   .then(transform);

            // function transform(str) {
            //   debugger;
            //   let data = str.split('\n').map(i => i.split(','));
            //   let headers = data.shift();
            //   let output = data.map(d => {
            //     let obj = {};
            //     headers.map((h, i) => (obj[headers[i]] = d[i]));
            //     return obj;
            //   });
            //   console.log(output);
            //   JSON.stringify(output)
            // }
            // .then(response => response.json())
            // .then(responseJSON => {
            //   if (responseJSON != null) {
            //     if (responseJSON.length > 0) {
            //       self.handleGetResultsTableData(
            //         responseJSON,
            //         true,
            //         true,
            //         differentialTest,
            //       );
            //     }
            //   }
            // });
            .then(response => {
              const reader = response.body.getReader();
              let streamedResults = [];
              return new ReadableStream({
                start(controller) {
                  return pump();
                  function pump() {
                    return reader.read().then(({ done, value }) => {
                      // When no more data needs to be consumed, close the stream
                      if (done) {
                        controller.close();
                        return;
                      }
                      // Enqueue the next data chunk into our target stream
                      controller.enqueue(value);
                      streamedResults.push(value);
                      // console.log(value);
                      console.log(streamedResults);
                      // console.log(
                      //   JSON.parse(
                      //     String.fromCharCode.apply(
                      //       null,
                      //       new Uint8Array(value),
                      //     ),
                      //   ),
                      // );
                      // JSON.stringify(Array.from(new Uint8Array(value)));
                      // function Decodeuint8arr(uint8array) {
                      //   return new TextDecoder('utf-8').decode(uint8array);
                      // }
                      // const streamedResultsDecoded = Decodeuint8arr(
                      //   streamedResults,
                      // );
                      // self.handleGetResultsTableData(
                      //   streamedResultsDecoded,
                      //   true,
                      //   true,
                      //   differentialTest,
                      // );
                      // ReadableStream.pipeTo(
                      //   new WritableStream({
                      //     write(streamedResults) {
                      //       self.handleGetResultsTableData(
                      //         streamedResults,
                      //         true,
                      //         true,
                      //         differentialTest,
                      //       );
                      //       console.log('Chunk received', streamedResults);
                      //     },
                      //     close() {
                      //       console.log('All data successfully read!');
                      //     },
                      //     abort(e) {
                      //       console.error('Something went wrong!', e);
                      //     },
                      //   }),
                      // );
                      return pump();
                    });
                  }
                },
              });
            })
            // .then(stream => new Response(stream))
            .then(stream => {
              return new Response(stream);
              // return new Response(stream, { headers: { "Content-Type": "text/html" } });
            })
            .then(streamResponse => streamResponse.json())
            .then(streamJson => {
              if (streamJson != null) {
                if (streamJson.length > 0) {
                  self.handleGetResultsTableData(
                    streamJson,
                    true,
                    true,
                    differentialTest,
                  );
                }
              }
            })
            .catch(err => console.error(err));
          onSearchCriteriaChangeDifferential(
            {
              differentialStudy: differentialStudy,
              differentialModel: differentialModel,
              differentialTest: differentialTest,
              differentialFeature: differentialFeature,
            },
            false,
          );
          const differentialTestMeta = differentialTestsMetadataVar.find(
            test => test.testID === differentialTest,
          );
          const differentialTestTooltip =
            differentialTestMeta?.testDisplay || '';
          this.setState({
            differentialTestTooltip,
            uAnchorP: differentialTest,
          });
        }
      }
    }
  };

  handleStudyChange = (evt, { name, value }) => {
    const {
      onSearchCriteriaChangeDifferential,
      onSearchCriteriaResetDifferential,
    } = this.props;
    onSearchCriteriaChangeDifferential(
      {
        [name]: value,
        differentialModel: '',
        differentialTest: '',
      },
      true,
    );
    onSearchCriteriaResetDifferential({
      isValidSearchDifferential: false,
    });
    this.setState({
      differentialStudyHrefVisible: false,
      differentialModelsDisabled: true,
      differentialTestsDisabled: true,
      differentialModelTooltip: '',
      differentialTestTooltip: '',
    });
    this.getReportLink(value, 'default');
  };

  setStudyTooltip = () => {
    if (this.props.differentialModel !== '') {
      this.setState({
        differentialStudyReportTooltip: `The model "main" from the study ${this.props.differentialStudy} does not have additional analysis details available.`,
      });
    }
  };

  getReportLink = (study, model) => {
    cancelRequestGetReportLinkDifferential();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetReportLinkDifferential = e;
    });
    omicNavigatorService
      .getReportLink(study, model, this.setStudyTooltip, cancelToken)
      .then(getReportLinkResponse => {
        if (getReportLinkResponse.length > 0) {
          const link = getReportLinkResponse.includes('http')
            ? getReportLinkResponse
            : // : `***REMOVED***/ocpu/library/${getReportLinkResponse}`;
              `${this.props.baseUrl}/ocpu/library/${getReportLinkResponse}`;
          this.setState({
            differentialStudyHrefVisible: true,
            differentialStudyHref: link,
          });
        } else {
          this.setStudyTooltip();
          this.setState({
            differentialStudyHrefVisible: false,
            differentialStudyHref: '',
          });
        }
      })
      .catch(error => {
        console.error('Error during getReportLink', error);
      });
  };

  handleModelChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      onSearchCriteriaChangeDifferential,
      onSearchCriteriaResetDifferential,
      differentialModelsAndTests,
    } = this.props;
    this.props.onHandlePlotTypesDifferential(value);
    onSearchCriteriaChangeDifferential(
      {
        differentialStudy: differentialStudy,
        [name]: value,
        differentialTest: '',
      },
      true,
    );
    onSearchCriteriaResetDifferential({
      isValidSearchDifferential: false,
    });
    const differentialModelsAndTestsCopy = [...differentialModelsAndTests];
    const differentialModelWithTests = differentialModelsAndTestsCopy.find(
      model => model.modelID === value,
    );
    const differentialModelTooltip =
      differentialModelWithTests?.modelDisplay || '';
    const differentialTestsMetadataVar =
      differentialModelWithTests?.tests || [];
    const differentialTestsMapped = differentialTestsMetadataVar.map(test => {
      return {
        key: test.testID,
        text: test.testID,
        value: test.testID,
      };
    });
    const uDataP = differentialTestsMetadataVar.map(t => t.testID);
    this.setState({
      differentialTestsDisabled: false,
      differentialTests: differentialTestsMapped,
      uDataP: uDataP,
      differentialModelTooltip: differentialModelTooltip,
      differentialTestTooltip: '',
    });
    this.props.onSetTestsMetadata(differentialTestsMetadataVar);
    this.getReportLink(differentialStudy, value);
  };

  handleTestChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      differentialModel,
      onMultisetQueriedDifferential,
      onSearchCriteriaChangeDifferential,
      onSearchTransitionDifferential,
    } = this.props;
    onSearchTransitionDifferential(true);
    onMultisetQueriedDifferential(false);
    const differentialTestMeta = this.props.differentialTestsMetadata.find(
      test => test.testID === value,
    );
    const differentialTestTooltip = differentialTestMeta?.testDisplay || '';
    this.setState({
      differentialTestTooltip: differentialTestTooltip,
      reloadPlotP: true,
      multisetFiltersVisibleDifferential: false,
      sigValP: this.state.uSettingsP.defaultSigValueP,
    });
    onSearchCriteriaChangeDifferential(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
    );
    cancelRequestPSCGetResultsTable();
    let cancelToken = new CancelToken(e => {
      cancelRequestPSCGetResultsTable = e;
    });
    // let promises =
    omicNavigatorService
      .getResultsTable(
        differentialStudy,
        differentialModel,
        value,
        onSearchTransitionDifferential,
        cancelToken,
      )
      .then(getResultsTableData => {
        // debugger;
        // getResultsTableData = getResultsTableData.json();
        if (getResultsTableData != null) {
          if (getResultsTableData.length > 0) {
            this.handleGetResultsTableData(
              getResultsTableData,
              true,
              true,
              value,
            );
          }
        }
      })
      .catch(error => {
        console.error('Error during getResultsTable', error);
      });
    // Promise.all(promises).finally(() => {
    //   debugger;
    // });
  };

  handleGetResultsTableData = (
    tableData,
    resetMultiset,
    handleMaxElements,
    differentialTest,
  ) => {
    const { onDifferentialSearchUnfiltered, onDifferentialSearch } = this.props;
    if (resetMultiset) {
      this.setState({
        uSettingsP: {
          ...this.state.uSettingsP,
          mustP: [],
          notP: [],
          maxElementsP: handleMaxElements ? tableData.length : 0,
        },
        sigValueP: [0.05],
        uAnchorP: differentialTest,
      });
    }
    onDifferentialSearchUnfiltered({ differentialResults: tableData });
    onDifferentialSearch({ differentialResults: tableData });
  };

  handleMultisetToggle = () => {
    return evt => {
      if (this.state.multisetFiltersVisibleDifferential === false) {
        // on toggle open
        this.props.onMultisetQueriedDifferential(true);
        this.props.onSearchTransitionDifferentialAlt(true);
        if (this.state.selectedColP.length === 0) {
          const uSetVP = { ...this.state.uSettingsP };
          const defaultCol = this.props.thresholdColsP[0];
          uSetVP.defaultselectedColP = defaultCol;
          this.setState({
            selectedColP: [defaultCol],
            uSettingsP: uSetVP,
          });
        }
        this.setState(
          {
            reloadPlotP: true,
            multisetFiltersVisibleDifferential: true,
          },
          function() {
            this.updateQueryDataP();
          },
        );
      } else {
        // on toggle close
        this.props.onMultisetQueriedDifferential(false);
        this.setState({
          multisetFiltersVisibleDifferential: false,
          reloadPlotP: false,
          initialRenderP: true,
        });
        const differentialTestName = 'differentialTest';
        const differentialTestVar = this.props.differentialTest;
        this.multisetTriggeredTestChange(
          differentialTestName,
          differentialTestVar,
        );
      }
    };
  };

  handleMultisetOpenErrorDifferential = () => {
    cancelRequestInferenceMultisetPlot();
    this.setState({
      multisetFiltersVisibleDifferential: false,
    });
    console.log('Error during getResultsIntersection');
  };

  handleMultisetPCloseError = () => {
    this.props.onSearchTransitionDifferentialAlt(false);
    this.props.onHandleVolcanoTableLoading(false);
    this.setState(
      {
        multisetFiltersVisibleDifferential: true,
        reloadPlotP: true,
      },
      this.updateQueryDataP(),
    );
    console.log('Error during getResultsTable');
  };

  multisetTriggeredTestChange = (name, value) => {
    const {
      differentialStudy,
      differentialModel,
      onSearchCriteriaChangeDifferential,
      onSearchTransitionDifferentialAlt,
    } = this.props;
    onSearchTransitionDifferentialAlt(true);
    onSearchCriteriaChangeDifferential(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
    );
    cancelRequestPSCGetResultsTable();
    let cancelToken = new CancelToken(e => {
      cancelRequestPSCGetResultsTable = e;
    });
    omicNavigatorService
      .getResultsTable(
        differentialStudy,
        differentialModel,
        value,
        this.handleMultisetPCloseError,
        cancelToken,
      )
      .then(getResultsTableData => {
        // debugger;
        // getResultsTableData = getResultsTableData.json();
        if (getResultsTableData != null) {
          if (getResultsTableData.length > 0) {
            this.handleGetResultsTableData(
              getResultsTableData,
              false,
              false,
              value,
            );
          }
        }
      })
      .catch(error => {
        console.error('Error during getResultsTable', error);
      });
  };

  addFilterDifferential = () => {
    this.props.onHandleVolcanoTableLoading(true);
    // this.setState({ loadingDifferentialMultisetFilters: true });
    // const uSetVP = _.cloneDeep(this.state.uSettingsP);
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...this.state.uSettingsP.indexFiltersP].concat(
      this.state.uSettingsP.indexFiltersP.length,
    );
    this.setState({
      selectedColP: [...this.state.selectedColP].concat(
        this.state.uSettingsP.defaultselectedColP,
      ),
      selectedOperatorP: [...this.state.selectedOperatorP].concat(
        this.state.uSettingsP.defaultselectedOperatorP,
      ),
      sigValueP: [...this.state.sigValueP].concat(
        this.state.uSettingsP.defaultSigValueP,
      ),
      uSettingsP: uSetVP,
    });
  };

  removeFilterDifferential = index => {
    this.props.onHandleVolcanoTableLoading(true);
    // this.setState({ loadingDifferentialMultisetFilters: true });
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...uSetVP.indexFiltersP]
      .slice(0, index)
      .concat([...uSetVP.indexFiltersP].slice(index + 1));
    for (var i = index; i < uSetVP.indexFiltersP.length; i++) {
      uSetVP.indexFiltersP[i]--;
    }
    this.setState(
      {
        selectedColP: [...this.state.selectedColP]
          .slice(0, index)
          .concat([...this.state.selectedColP].slice(index + 1)),
        selectedOperatorP: [...this.state.selectedOperatorP]
          .slice(0, index)
          .concat([...this.state.selectedOperatorP].slice(index + 1)),
        sigValueP: [...this.state.sigValueP]
          .slice(0, index)
          .concat([...this.state.sigValueP].slice(index + 1)),
        uSettingsP: uSetVP,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };
  changeHoveredFilter = index => {
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettingsP: uSetVP });
  };
  handleDropdownChange = (evt, { name, value, index }) => {
    this.props.onHandleVolcanoTableLoading(true);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState(
      {
        [name]: uSelVP,
        reloadPlotP: false,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };
  handleSigValuePInputChange = (name, value, index) => {
    if (!this.state.initialRenderP) {
      this.props.onHandleVolcanoTableLoading(true);
    }
    const uSelVP = [...this.state[name]];
    uSelVP[index] = parseFloat(value);
    this.setState(
      {
        [name]: uSelVP,
        reloadPlotP: true,
        initialRenderP: false,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };
  handleSetChange = ({ mustP, notP }) => {
    this.props.onHandleVolcanoTableLoading(true);
    const uSettingsVP = this.state.uSettingsP;
    uSettingsVP.mustP = mustP;
    uSettingsVP.notP = notP;
    this.setState(
      {
        uSettingsP: uSettingsVP,
        reloadPlotP: false,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };

  updateQueryDataP = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      onDifferentialSearch,
      onDisablePlotDifferential,
    } = this.props;
    const {
      selectedOperatorP,
      reloadPlotP,
      sigValueP,
      selectedColP,
      differentialTests,
    } = this.state;
    const eMustP = this.state.uSettingsP.mustP;
    const eNotP = this.state.uSettingsP.notP;
    cancelRequestMultisetInferenceData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetInferenceData = e;
    });
    omicNavigatorService
      .getResultsIntersection(
        differentialStudy,
        differentialModel,
        differentialTest,
        eMustP,
        eNotP,
        sigValueP,
        this.jsonToList(selectedOperatorP),
        this.jsonToList(selectedColP),
        this.handleMultisetOpenErrorDifferential,
        cancelToken,
      )
      .then(inferenceData => {
        const multisetResultsP = inferenceData;
        this.setState({
          uSettingsP: {
            ...this.state.uSettingsP,
            numElementsP: multisetResultsP.length,
            maxElementsP: this.state.uSettingsP.maxElementsP,
            mustP: eMustP,
            notP: eNotP,
          },
          activateMultisetFiltersP: true,
          reloadPlotP: false,
          // loadingDifferentialMultisetFilters: false,
        });
        onDifferentialSearch({
          differentialResults: multisetResultsP,
        });
      })
      .catch(error => {
        console.error('Error during getResultsIntersection', error);
      });
    //   const testsLength =
    //   typeof differentialTests === 'string' ? 1 : differentialTests.length;
    // if (reloadPlotP === true && testsLength > 1) {
    if (reloadPlotP === true && differentialTests.length > 1) {
      onDisablePlotDifferential();
      this.getMultisetPlot(
        sigValueP,
        differentialModel,
        differentialStudy,
        this.jsonToList(selectedOperatorP),
        this.jsonToList(selectedColP),
      );
    }
  };

  jsonToList(json) {
    var valueList = [];
    for (var i = 0; i < json.length; i++) {
      valueList.push(json[i].value);
    }
    return valueList;
  }

  getMultisetPlot(
    sigVal,
    differentialModel,
    differentialStudy,
    eOperatorP,
    eColP,
  ) {
    cancelRequestInferenceMultisetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestInferenceMultisetPlot = e;
    });
    omicNavigatorService
      .getResultsUpset(
        differentialStudy,
        differentialModel,
        sigVal,
        eOperatorP,
        eColP,
        undefined,
        cancelToken,
      )
      .then(svgMarkupRaw => {
        let svgMarkup = svgMarkupRaw.data;
        svgMarkup = svgMarkup.replace(
          /<svg/g,
          '<svg preserveAspectRatio="xMinYMid meet" id="differentialMultisetAnalysisSVG"',
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
        let svgInfo = { plotType: 'Multiset', svg: sanitizedSVG };
        // let svgInfo = { plotType: 'Multiset', svg: svgMarkup };
        this.props.onGetMultisetPlotDifferential({
          svgInfo,
        });
      })
      .catch(error => {
        console.error('Error during getResultsUpset', error);
      });
  }

  render() {
    const {
      differentialStudies,
      differentialStudyHref,
      differentialStudyHrefVisible,
      differentialModels,
      differentialModelTooltip,
      differentialTests,
      differentialTestTooltip,
      differentialStudiesDisabled,
      differentialModelsDisabled,
      differentialTestsDisabled,
      multisetFiltersVisibleDifferential,
      activateMultisetFiltersP,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      isValidSearchDifferential,
      multisetPlotAvailableDifferential,
      plotButtonActiveDifferential,
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
    };

    let studyIcon;
    let studyName = `${differentialStudy} Analysis Details`;

    if (differentialStudyHrefVisible) {
      studyIcon = (
        <Popup
          trigger={
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={differentialStudyHref}
            >
              <Icon
                name="line graph"
                size="large"
                className="StudyHtmlIcon"
                inverted
                circular
              />
            </a>
          }
          style={StudyPopupStyle}
          className="CustomTooltip"
          inverted
          basic
          position="bottom center"
          content={studyName}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        />
      );
    } else {
      studyIcon = (
        <Popup
          trigger={
            <a target="_blank" rel="noopener noreferrer" href={'/'}>
              <Icon name="line graph" size="large" circular inverted disabled />
            </a>
          }
          style={StudyPopupStyle}
          basic
          inverted
          className="CustomTooltip"
          position="bottom center"
          content={this.state.differentialStudyReportTooltip}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        />
      );
    }

    let PMultisetFilters;
    if (
      isValidSearchDifferential &&
      activateMultisetFiltersP &&
      multisetFiltersVisibleDifferential
    ) {
      PMultisetFilters = (
        <DifferentialMultisetFilters
          {...this.props}
          {...this.state}
          onHandleDropdownChange={this.handleDropdownChange}
          onHandleSigValuePInputChange={this.handleSigValuePInputChange}
          onHandleSetChange={this.handleSetChange}
          onAddFilterDifferential={this.addFilterDifferential}
          onRemoveFilterDifferential={this.removeFilterDifferential}
          onChangeHoveredFilter={this.changeHoveredFilter}
        />
      );
    }

    let PlotRadio;
    let MultisetRadio;

    if (isValidSearchDifferential) {
      PlotRadio = (
        <Transition
          visible={!multisetPlotAvailableDifferential}
          animation="flash"
          duration={1500}
        >
          <Radio
            toggle
            label="View Plot"
            className={multisetPlotAvailableDifferential ? 'ViewPlotRadio' : ''}
            checked={plotButtonActiveDifferential}
            onChange={this.props.onHandlePlotAnimationDifferential('uncover')}
            disabled={!multisetPlotAvailableDifferential}
          />
        </Transition>
      );

      MultisetRadio = (
        <React.Fragment>
          <Divider />
          <Radio
            toggle
            label="Set Analysis"
            checked={multisetFiltersVisibleDifferential}
            onChange={this.handleMultisetToggle()}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Form className="SearchCriteriaContainer">
          <Form.Field
            control={Select}
            name="differentialStudy"
            value={differentialStudy}
            options={differentialStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={differentialStudiesDisabled}
            label={{
              children: 'Study',
              htmlFor: 'form-select-control-pstudy',
            }}
            search
            searchInput={{ id: 'form-select-control-pstudy' }}
            width={13}
            selectOnBlur={false}
            selectOnNavigation={false}
          />
          <span className="StudyHtmlIconDivP">{studyIcon}</span>
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="differentialModel"
                value={differentialModel}
                options={differentialModels}
                placeholder="Select Model"
                onChange={this.handleModelChange}
                disabled={differentialModelsDisabled}
                label={{
                  children: 'Model',
                  htmlFor: 'form-select-control-pmodel',
                }}
                search
                searchInput={{ id: 'form-select-control-pmodel' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={differentialModelTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialModelTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="differentialTest"
                value={differentialTest}
                options={differentialTests}
                placeholder="Select Test"
                onChange={this.handleTestChange}
                disabled={differentialTestsDisabled}
                label={{
                  children: 'Test',
                  htmlFor: 'form-select-control-ptest',
                }}
                search
                searchInput={{ id: 'form-select-control-ptest' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={differentialTestTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialTestTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
        </Form>
        <div className="MultisetContainer">
          <div className="SliderDiv">
            <span className="MultisetRadio">{MultisetRadio}</span>
            <span className="PlotRadio">{PlotRadio}</span>
          </div>
          <div className="MultisetFiltersDiv">{PMultisetFilters}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(DifferentialSearchCriteria);
