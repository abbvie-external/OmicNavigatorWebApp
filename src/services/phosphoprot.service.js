import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
window.jQuery = $;
require('opencpu.js/opencpu-0.5.js');
class PhosphoprotService {
  constructor() {
    this.ocpuUrl = '***REMOVED***/ocpu/library/OmicAnalyzer/R';
  }

  setUrl() {
    window.ocpu.seturl(this.ocpuUrl);
  }

  setUrlAlt() {
    window.ocpu.seturl(this.ocpuUrlAlt);
  }

  // ocpuRPC(name, paramsObj, handleError) {
  //   return new Promise(function(resolve, reject) {
  //     window.ocpu
  //       .rpc(name, paramsObj, function(session) {
  //         resolve(session);
  //       })
  //       .catch(error => {
  //         toast.error(`${error.statusText}: ${error.responseText}`);
  //         if (handleError !== undefined) {
  //           handleError(false);
  //         }
  //         console.log(`${error.statusText}: ${error.responseText}`);
  //       });
  //   });
  // }

  async ocpuRPCUnbox(method, obj, handleError, cancelToken) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          const url = session.getLoc() + 'R/.val/json?auto_unbox=true';
          axios
            .get(url, {
              params: { digits: 10 },
              responseType: 'text',
              cancelToken,
              timeout: 15000,
            })
            .then(response => resolve(response.data))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
              } else {
                toast.error(`${thrown.message}`);
                if (handleError !== undefined) {
                  handleError(false);
                }
                console.log(`${thrown.message}`);
              }
            });
        })
        // you can use this function instead, if don't need the cancelToken
        // .call(method, obj, function(session) {
        //   session
        //     .getObject('.val', 'digits=10')
        //     .then(response => resolve(response));
        // })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
          console.log(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async listStudies() {
    this.setUrl();
    const promise = this.ocpuRPCUnbox('listStudies', {});
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async ocpuDataCall(method, obj, handleError, cancelToken) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          const url = session.getLoc() + 'R/.val/json?auto_unbox=true';
          axios
            .get(url, {
              params: { digits: 10 },
              responseType: 'text',
              cancelToken,
              timeout: 15000,
            })
            .then(response => resolve(response.data))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
              } else {
                toast.error(`${thrown.message}`);
                if (handleError !== undefined) {
                  handleError(false);
                }
                console.log(`${thrown.message}`);
              }
            });
        })
        // you can use this function instead, if don't need the cancelToken
        // .call(method, obj, function(session) {
        //   session
        //     .getObject('.val', 'digits=10')
        //     .then(response => resolve(response));
        // })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
          console.log(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async ocpuDataCallAlt(method, obj, handleError, cancelToken) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          const url = session.getLoc() + 'R/.val/json?auto_unbox=true';
          axios
            .get(url, {
              responseType: 'text',
              cancelToken,
              timeout: 15000,
            })
            .then(response => resolve(response.data))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
              } else {
                toast.error(`${thrown.message}`);
                if (handleError !== undefined) {
                  handleError(false);
                }
                console.log(`${thrown.message}`);
              }
            });
        })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
          console.log(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async getResultsTable(study, model, test, errorCb, cancelToken) {
    this.setUrl();
    const obj = { study: study, modelID: model, testID: test };
    const promise = this.ocpuDataCall(
      'getResultsTable',
      obj,
      errorCb,
      cancelToken,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getEnrichmentsTable(
    study,
    model,
    annotation,
    valueType,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const obj = {
      study: study,
      modelID: model,
      annotationID: annotation,
      type: valueType,
    };

    const promise = this.ocpuDataCall(
      'getEnrichmentsTable',
      obj,
      errorCb,
      cancelToken,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  postToPhosphositePlus(obj, url) {
    var mapForm = document.createElement('form');
    mapForm.target = '_blank';
    mapForm.method = 'POST'; // or "post" if appropriate
    mapForm.action = url;
    Object.keys(obj).forEach(function(param) {
      var mapInput = document.createElement('input');
      mapInput.type = 'hidden';
      mapInput.name = param;
      mapInput.setAttribute('value', obj[param]);
      mapForm.appendChild(mapInput);
    });
    document.body.appendChild(mapForm);
    mapForm.submit();
  }

  async getSiteData(id, study, errorCb) {
    const promise = this.ocpuRPCUnbox(
      'sitedata',
      { idmult: id, study: study },
      errorCb,
    );
    const siteDataFromPromise = await promise;
    return siteDataFromPromise;
  }

  async getProteinData(id, study, errorCb) {
    const promise = this.ocpuRPCUnbox('proteindata', { id: id, study: study });
    const proteinDataFromPromise = await promise;
    return proteinDataFromPromise;
  }

  async ocpuPlotCall(plottype, obj, handleError, cancelToken) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(plottype, obj, function(session) {
          axios
            .get(session.getLoc() + 'graphics/1/svg', {
              responseType: 'text',
              cancelToken,
              timeout: 15000,
            })
            .then(response => resolve(response))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
              } else {
                toast.error(`${thrown.message}`);
                if (handleError !== undefined) {
                  handleError(false);
                }
                console.log(`${thrown.message}`);
              }
            });
        })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
          console.log(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async plotStudy(study, model, id, plottype, errorCb, cancelToken) {
    this.setUrl();
    const promise = this.ocpuPlotCall(
      'plotStudy',
      { study: study, modelID: model, featureID: id, plotID: plottype },
      errorCb,
      cancelToken,
    );
    //const svgMarkupFromPromise = await promise;
    return promise;
  }

  async getDatabaseInfo(study, test, errorCb, cancelToken) {
    this.setUrl();
    const promise = this.ocpuDataCallAlt(
      'getDatabases',
      {
        study: study,
        database: test,
      },
      errorCb,
      cancelToken,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getBarcodeData(
    study,
    model,
    annotation,
    test,
    term,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuDataCallAlt(
      'getBarcodeData',
      {
        study: study,
        model: model,
        database: annotation,
        test: test,
        term: term,
      },
      errorCb,
      cancelToken,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getEnrichmentsIntersection(
    study,
    modelID,
    annotationID,
    mustTests,
    notTests,
    sigValue,
    operator,
    type,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall(
      'getEnrichmentsIntersection',
      {
        study: study,
        modelID: modelID,
        annotationID: annotationID,
        mustTests: mustTests,
        notTests: notTests,
        sigValue: sigValue,
        operator: operator,
        type: type,
      },
      errorCb,
      cancelToken,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  //async getEnrichmentMultisetPlot(
  async getEnrichmentsUpset(
    study,
    modelID,
    annotationID,
    sigValue,
    operator,
    type,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuPlotCall(
      'getEnrichmentsUpset',
      {
        study: study,
        modelID: modelID,
        annotationID: annotationID,
        sigValue: sigValue,
        operator: operator,
        type: type,
      },
      errorCb,
      cancelToken,
    );
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
  }

  async getResultsIntersection(
    study,
    modelID,
    anchor,
    mustTests,
    notTests,
    sigValue,
    operator,
    column,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall(
      'getResultsIntersection',
      {
        study: study,
        modelID: modelID,
        anchor: anchor,
        mustTests: mustTests,
        notTests: notTests,
        sigValue: sigValue,
        operator: operator,
        column: column,
      },
      errorCb,
      cancelToken,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getResultsUpset(
    study,
    modelID,
    sigValue,
    operator,
    column,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuPlotCall(
      'getResultsUpset',
      {
        study: study,
        modelID: modelID,
        sigValue: sigValue,
        operator: operator,
        column: column,
      },
      errorCb,
      cancelToken,
    );
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
  }

  async getEnrichmentsNetwork(
    enrichmentStudy,
    enrichmentModel,
    enrichmentAnnotation,
    errorCb,
  ) {
    this.setUrl();
    const promise = this.ocpuRPCUnbox(
      'getEnrichmentsNetwork',
      {
        study: enrichmentStudy,
        model: enrichmentModel,
        annotation: enrichmentAnnotation,
      },
      errorCb,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }
}

export const phosphoprotService = new PhosphoprotService();
