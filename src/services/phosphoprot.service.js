// import jQuery from './scripts/jquery-1.11.1';
import ocpu from '../scripts/opencpu-0.4';

class PhosphoprotService {
  constructor() {
    // this.ocpuUrl = "***REMOVED***/ocpu/library/***REMOVED***/R"
    // this.ocpuUrl = "http://localhost:5656/ocpu/library/PhosphoProt/R"
    this.ocpuUrl = 'http://10.239.9.76/ocpu/library/PhosphoProt/R';
  }

  getStudies() {
    this.setUrl();
    this.callRPC();
  }

  setUrl() {
    if (window.location.host == 'localhost:3000') {
      window.ocpu.seturl(this.ocpuUrl);
      console.log('url set to' + this.ocpuUrl);
    }
  }

  callRPC() {
    window.ocpu.rpc('getStudies', {}, function(session) {
      debugger;
      console.log('studies:' + session);
    });
  }

  // getStudies() {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //         if (window.location.host == "localhost:3000") {
  //             ocpu.seturl(this.ocpuUrl)
  //         }
  //         ocpu.rpc("getStudies", {}, function (session) {
  //             fn(session)
  //         })
  //     }
  //     return callbackBinder()
  // }

  //   getAnnotationData(testCategory, name, study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.call("getEnrichmentResults", { "testCategory": testCategory, "annotation": name, "study": study }, function (session) {
  //         session.getObject('.val', 'digits=10').then(response => fn(response));
  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   getEnrichmentNames(study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.rpc("EnrichmentNames", { "study": study }, function (session) {
  //         fn(session)
  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   getInferenceNames(study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.rpc("inferenceNames", { "study": study }, function (session) {
  //         fn(session)
  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   getProteinData(id, study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.rpc("proteindata", { "id": id, "study": study }, function (session) {
  //         fn(session)
  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   getSiteData(id, study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.rpc("sitedata", { "idmult": id, "study": study }, function (session) {
  //         fn(session)
  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   getPlot(id, plottype, study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       var self = this
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.call(plottype, { idmult: id, "study": study }, function (session) {
  //         var tester = session.getLoc()
  //         self.getGraphic(tester + 'graphics/1/svg').subscribe(result => fn(result))

  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   getGraphic(path) {
  //     return this._http.get(path, { responseType: 'text' });
  //   }

  //   getTestData(testCategory, test, study) {
  //     var callbackBinder = this.getData.bind(this)
  //     function getData(fn) {
  //       if (window.location.host == "localhost:4200") {
  //         ocpu.seturl(this.ocpuUrl)
  //       }
  //       ocpu.call("getInferenceResults", { "testCategory": testCategory, "test": test, "study": study }, function (session) {
  //         session.getObject('.val', 'digits=10').then(response => fn(response));
  //       })
  //     }
  //     return callbackBinder()
  //   }

  //   postToPhosphositePlus(obj, url) {
  //     var mapForm = document.createElement("form");
  //     mapForm.target = "_blank";
  //     mapForm.method = "POST"; // or "post" if appropriate
  //     mapForm.action = url;
  //     Object.keys(obj).forEach(function (param) {
  //       var mapInput = document.createElement("input");
  //       mapInput.type = "hidden";
  //       mapInput.name = param;
  //       mapInput.setAttribute("value", obj[param]);
  //       mapForm.appendChild(mapInput);
  //     });
  //     document.body.appendChild(mapForm);
  //     mapForm.submit();
  //   }
}

export const phosphoprotService = new PhosphoprotService();
