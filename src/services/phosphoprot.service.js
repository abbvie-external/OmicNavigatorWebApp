import $ from 'jquery';
import axios from 'axios';
window.jQuery = $;
const ocpu = require('opencpu.js/opencpu-0.5.js');

class PhosphoprotService {
  constructor() {
    // this.ocpuUrl = "***REMOVED***/ocpu/library/***REMOVED***/R"
    // this.ocpuUrl = "http://localhost:5656/ocpu/library/PhosphoProt/R"
    this.ocpuUrl = 'http://10.239.9.76/ocpu/library/PhosphoProt/R';
  }

  setUrl() {
    //if (window.location.host === 'localhost:3000') {
      window.ocpu.seturl(this.ocpuUrl);
    //}
  }

  ocpuRPC(name, paramsObj) {
    return new Promise(function(resolve, reject) {
      window.ocpu.rpc(name, paramsObj, function(session) {
        resolve(session);
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
      window.ocpu.call(method, obj, function(session) {
        session
          .getObject('.val', 'digits=10')
          .then(response => resolve(response));
      });
    });
  }

  async getTestData(tab, rName, model, test, study) {
    this.setUrl();
    const dynamicKey = tab === 'pepplot' ? 'test' : 'annotation';
    const obj = { testCategory: model, [dynamicKey]: test, study: study };
    const promise = this.ocpuDataCall(rName, obj);
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
      window.ocpu.call(plottype, obj, function(session) {
        axios
          .get(session.getLoc() + 'graphics/1/svg', { responseType: 'text' })
          .then(response => resolve(response));
      });
    });
  }

  async getPlot(id, plottype, study) {
    this.setUrl();
    const promise = this.ocpuPlotCall(plottype, { idmult: id, study: study });
    const svgMarkupFromPromise = await promise;
    return svgMarkupFromPromise;
  }
}

export const phosphoprotService = new PhosphoprotService();
