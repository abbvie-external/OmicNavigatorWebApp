import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
// import networkDataOld from './networkDataOld.json';
// import networkDataNew from './networkDataNew.json';
window.jQuery = $;
require('opencpu.js/opencpu-0.5.js');
// const ocpu = require('opencpu.js/opencpu-0.5.js');
// let getPlotCancel = () => {};
class PhosphoprotService {
  constructor() {
    // this.ocpuUrl = 'http://10.239.9.49/ocpu/library/PhosphoProt/R';
    this.ocpuUrl = 'http://10.239.9.76/ocpu/library/PhosphoProt/R';
    // this.ocpuUrlAlt = 'http://localhost:5656/ocpu/library/PhosphoProt/R'
    // this.ocpuUrlAlt = 'http://localhost:1234/v1'
  }

  setUrl() {
    window.ocpu.seturl(this.ocpuUrl);
  }

  setUrlAlt() {
    window.ocpu.seturl(this.ocpuUrlAlt);
  }

  ocpuRPC(name, paramsObj) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .rpc(name, paramsObj, function(session) {
          resolve(session);
        })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async getStudies() {
    this.setUrl();
    const promise = this.ocpuRPC('getStudies', {});
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async getModelNames(rName, study) {
    this.setUrl();
    const promise = this.ocpuRPC(rName, { study: study });
    const modelsFromPromise = await promise;
    return modelsFromPromise;
  }

  ocpuDataCall(method, obj, handleError) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          session
            .getObject('.val', 'digits=10')
            .then(response => resolve(response));
        })
        .catch(error => {
          // toast.error('Failed to retrieve data, please try again.');
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
        });
    });
  }

  ocpuDataCallAlt(method, obj) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          session.getObject('.val').then(response => resolve(response));
        })
        .catch(error => {
          // toast.error('Failed to retrieve data, please try again.');
          toast.error(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async getTestData(model, test, study) {
    this.setUrl();
    const obj = { testCategory: model, test: test, study: study };
    const promise = this.ocpuDataCall('getInferenceResults', obj);
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getAnnotationData(model, test, study, type, errorCb) {
    const handleError =
      errorCb ||
      function() {
        return undefined;
      };
    this.setUrl();
    const obj = {
      model: model,
      database: test,
      study: study,
      type: type
    };
    const promise = this.ocpuDataCall('getEnrichmentResults', obj, handleError);
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

  async getSiteData(id, study) {
    const promise = this.ocpuRPC('sitedata', { idmult: id, study: study });
    const siteDataFromPromise = await promise;
    return siteDataFromPromise;
  }

  async getProteinData(id, study) {
    const promise = this.ocpuRPC('proteindata', { id: id, study: study });
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
              cancelToken
            })
            .then(response => resolve(response));
        })
        .catch(error => {
          // toast.error('Failed to retrieve plot, please try again.');
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
        });
    });
  }

  async getPlot(id, plottype, study, proteinSelectedError, cancelToken) {
    // getPlotCancel();
    this.setUrl();
    const handleError =
      proteinSelectedError ||
      function() {
        return undefined;
      };
    const promise = this.ocpuPlotCall(
      plottype,
      { idmult: id, study: study },
      handleError,
      cancelToken
    );
    //const svgMarkupFromPromise = await promise;
    return promise;
  }

  async getDatabaseInfo(study, test) {
    this.setUrl();
    const promise = this.ocpuDataCallAlt('getDatabases', {
      study: study,
      database: test
    });
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getBarcodeData(study, model, annotation, test, term) {
    this.setUrl();
    const promise = this.ocpuDataCallAlt('getBarcodeData', {
      study: study,
      model: model,
      database: annotation,
      test: test,
      term: term
    });
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getMultisetEnrichmentData(
    testCategory,
    mustTest,
    notTest,
    study,
    sigValue,
    annotation,
    operator,
    pValType
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall('getEnrichmentIntersection', {
      testCategory: testCategory,
      mustTests: mustTest,
      notTests: notTest,
      study: study,
      sigValue: sigValue,
      annotation: annotation,
      operator: operator,
      pValType: pValType
    });
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getEnrichmentMultisetPlot(
    sigVal,
    testCategory,
    study,
    annotation,
    operator,
    pValType,
    errorCb
  ) {
    this.setUrl();
    const handleError =
      errorCb ||
      function() {
        return undefined;
      };
    const promise = this.ocpuPlotCall(
      'EnrichmentUpsetPlot',
      {
        sigValue: sigVal,
        testCategory: testCategory,
        study: study,
        annotation: annotation,
        operator: operator,
        pValType: pValType
      },
      handleError
    );
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
  }

  async getMultisetInferenceData(
    testCategory,
    mustTest,
    notTest,
    study,
    sigValue,
    anchor,
    operator,
    column
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall('getInferenceIntersection', {
      testCategory: testCategory,
      anchor: anchor,
      mustTests: mustTest,
      notTests: notTest,
      study: study,
      sigValue: sigValue,
      operator: operator,
      column: column
    });
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getInferenceMultisetPlot(
    sigVal,
    operator,
    column,
    testCategory,
    study,
    errorCb
  ) {
    this.setUrl();
    const handleError =
      errorCb ||
      function() {
        return undefined;
      };
    const promise = this.ocpuPlotCall(
      'InferenceUpsetPlot',
      {
        sigValue: sigVal,
        testCategory: testCategory,
        study: study,
        operator: operator,
        column: column
      },
      handleError
    );
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
  }

  async getEnrichmentNetwork(
    enrichmentModel,
    enrichmentAnnotation,
    tests,
    pValueType,
    enrichmentStudy
  ) {
    this.setUrl();
    const promise = this.ocpuRPC('getCytoscapeEM', {
      model: enrichmentModel,
      db: enrichmentAnnotation,
      tests: tests,
      q: pValueType,
      study: enrichmentStudy,
      isDev: false
    });
    const nodesFromPromise = await promise;
    return nodesFromPromise;
    // return networkDataOld;
  }
}

export const phosphoprotService = new PhosphoprotService();
