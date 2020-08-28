import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
window.jQuery = $;
require('opencpu.js/opencpu-0.5.js');
class PhosphoprotService {
  constructor() {
    this.ocpuUrl = '***REMOVED***/ocpu/library/OmicAnalyzer/R';
    //this.ocpuUrl = 'http://localhost:5656/ocpu/library/OmicAnalyzer/R';  //<-- comment out before building production
  }

  setUrl() {
    if (process.env.NODE_ENV === 'development') {
      window.ocpu.seturl(this.ocpuUrl);
    }
  }

  setUrlAlt() {
    window.ocpu.seturl(this.ocpuUrlAlt);
  }

  async ocpuRPCUnbox(method, obj, timeoutLength, handleError, cancelToken) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          const url = session.getLoc() + 'R/.val/json?auto_unbox=true';
          axios
            .get(url, {
              params: { digits: 10 },
              responseType: 'text',
              cancelToken,
              timeout: timeoutLength,
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
        // instead of line 26-35, you can use this function instead, if don't need the cancelToken
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
    const promise = this.ocpuRPCUnbox('listStudies', {}, 15000);
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async ocpuDataCall(method, obj, handleError, cancelToken, params) {
    const paramsObj = params ? { digits: 10 } : {};
    return new Promise(function(resolve, reject) {
      window.ocpu
        // you can use this function instead, if don't need Axios cancelToken
        // .call(method, obj, function(session) {
        //   session
        //     .getObject('.val', 'digits=10')
        //     .then(response => resolve(response));
        // })
        .call(method, obj, function(session) {
          const url = session.getLoc() + 'R/.val/json?auto_unbox=true';
          axios
            .get(url, {
              params: paramsObj,
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
      true,
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
      true,
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
      15000,
      errorCb,
    );
    const siteDataFromPromise = await promise;
    return siteDataFromPromise;
  }

  async getProteinData(id, study, errorCb) {
    const promise = this.ocpuRPCUnbox(
      'proteindata',
      { id: id, study: study },
      15000,
      errorCb,
    );
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

  async getBarcodeData(
    study,
    model,
    test,
    annotation,
    term,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall(
      'getBarcodeData',
      {
        study: study,
        modelID: model,
        testID: test,
        annotationID: annotation,
        termID: term,
      },
      errorCb,
      cancelToken,
      false,
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
      true,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getEnrichmentsUpset(
    study,
    modelID,
    annotationID,
    sigValue,
    operator,
    type,
    tests,
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
        tests: tests,
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
      true,
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
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuRPCUnbox(
      'getEnrichmentsNetwork',
      {
        study: enrichmentStudy,
        model: enrichmentModel,
        annotation: enrichmentAnnotation,
      },
      45000,
      errorCb,
      cancelToken,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }

  async getNodeFeatures(
    enrichmentStudy,
    enrichmentAnnotation,
    term,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall(
      'getNodeFeatures',
      {
        study: enrichmentStudy,
        annotationID: enrichmentAnnotation,
        termID: term,
      },
      errorCb,
      cancelToken,
      false,
    );
    const featuresFromPromise = await promise;
    return featuresFromPromise;
  }

  async getLinkFeatures(
    enrichmentStudy,
    enrichmentAnnotation,
    term1,
    term2,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall(
      'getLinkFeatures',
      {
        study: enrichmentStudy,
        annotationID: enrichmentAnnotation,
        termID1: term1,
        termID2: term2,
      },
      errorCb,
      cancelToken,
      false,
    );
    const featuresFromPromise = await promise;
    return featuresFromPromise;
  }

  async getMetaFeaturesTable(
    differentialStudy,
    differentialModel,
    feature,
    errorCb,
  ) {
    this.setUrl();
    const promise = this.ocpuRPCUnbox(
      'getMetaFeaturesTable',
      {
        study: differentialStudy,
        model: differentialModel,
        featureID: feature,
      },
      15000,
      errorCb,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }
}

export const phosphoprotService = new PhosphoprotService();
