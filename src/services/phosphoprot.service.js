import $ from 'jquery';
window.jQuery = $;
const ocpu = require('opencpu.js/opencpu-0.5.js');

class PhosphoprotService {
  constructor() {
    // this.ocpuUrl = "***REMOVED***/ocpu/library/***REMOVED***/R"
    // this.ocpuUrl = "http://localhost:5656/ocpu/library/PhosphoProt/R"
    this.ocpuUrl = 'http://10.239.9.76/ocpu/library/PhosphoProt/R';
  }

  setUrl() {
    if (window.location.host === 'localhost:3000') {
      window.ocpu.seturl(this.ocpuUrl);
    }
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

  ocpuCall(method, obj) {
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
    const promise = this.ocpuCall(rName, obj);
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

  // getProteinData(id, study) {
  //   function getData(fn) {
  //     ocpu.rpc("proteindata", { "id": id, "study": study }, function (session) {
  //       fn(session)
  //     })
  //   }
  // }

  // getSiteData(id, study) {
  //   function getData(fn) {
  //     ocpu.rpc("sitedata", { "idmult": id, "study": study }, function (session) {
  //       fn(session)
  //     })
  //   }
  // }

  // getPlot(id, plottype, study) {
  //   function getData(fn) {
  //     var self = this
  //     ocpu.call(plottype, { idmult: id, "study": study }, function (session) {
  //       var tester = session.getLoc()
  //       self.getGraphic(tester + 'graphics/1/svg').subscribe(result => fn(result))

  //     })
  //   }
  // }

  // getGraphic(path) {
  //   return this._http.get(path, { responseType: 'text' });
  // }
}

export const phosphoprotService = new PhosphoprotService();
