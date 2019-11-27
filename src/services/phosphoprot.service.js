import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
window.jQuery = $;
const ocpu = require('opencpu.js/opencpu-0.5.js');

class PhosphoprotService {
  constructor() {
    this.ocpuUrl = 'http://10.239.9.49/ocpu/library/PhosphoProt/R';
  }

  setUrl() {
    window.ocpu.seturl(this.ocpuUrl);
  }

  ocpuRPC(name, paramsObj) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .rpc(name, paramsObj, function(session) {
          resolve(session);
        })
        .catch(error => {
          toast.error('Failed to retrieve data, please try again.');
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

  ocpuDataCall(method, obj) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          session
            .getObject('.val', 'digits=10')
            .then(response => resolve(response));
        })
        .catch(error => {
          toast.error('Failed to retrieve data, please try again.');
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
          toast.error('Failed to retrieve data, please try again.');
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

  async getAnnotationData(model, test, study, type) {
    this.setUrl();
    const obj = {
      testCategory: model,
      annotation: test,
      study: study,
      type: type
    };
    const promise = this.ocpuDataCall('getEnrichmentResults', obj);
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

  async ocpuPlotCall(plottype, obj) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(plottype, obj, function(session) {
          axios
            .get(session.getLoc() + 'graphics/1/svg', { responseType: 'text' })
            .then(response => resolve(response));
        })
        .catch(error => {
          toast.error('Failed to create plot, please try again.');
        });
    });
  }

  async getPlot(id, plottype, study) {
    this.setUrl();
    const promise = this.ocpuPlotCall(plottype, { idmult: id, study: study });
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
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

  async getEnrichmentMap() {
    try {
      const response = await axios.get('networkData.json');
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getMultisetEnrichmentData(
    testCategory,
    mustTest,
    notTest,
    study,
    sigValue,
    annotation,
    operator
  ) {
    this.setUrl();
    const promise = this.ocpuDataCall('getEnrichmentIntersection', {
      testCategory: testCategory,
      mustTests: mustTest,
      notTests: notTest,
      study: study,
      sigValue: sigValue,
      annotation: annotation,
      operator: operator
    });
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getEnrichmentMultisetPlot(
    sigVal,
    testCategory,
    study,
    annotation,
    operator
  ) {
    this.setUrl();
    const promise = this.ocpuPlotCall('EnrichmentUpsetPlot', {
      sigValue: sigVal,
      testCategory: testCategory,
      study: study,
      annotation: annotation,
      operator: operator
    });
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

  async getInferenceMultisetPlot(sigVal, testCategory, study) {
    this.setUrl();
    const promise = this.ocpuPlotCall('InferenceUpsetPlot', {
      sigValue: sigVal,
      testCategory: testCategory,
      study: study
    });
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
  }
}

export const phosphoprotService = new PhosphoprotService();
