import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
window.jQuery = $;
require('opencpu.js/opencpu-0.5.js');
class OmicNavigatorService {
  constructor() {
    this.ocpuUrlDev = '***REMOVED***/ocpu/library/OmicNavigator/R';
    this.ocpuUrlProd = '***REMOVED***/ocpu/library/OmicNavigator/R';
    this.baseUrl =
      process.env.NODE_ENV === 'development'
        ? '***REMOVED***'
        : window.location.origin;
    this.url = `${this.baseUrl}/ocpu/library/OmicNavigator/R`;
  }

  setUrl() {
    if (process.env.NODE_ENV === 'development') {
      window.ocpu.seturl(this.ocpuUrlProd);
    }
  }

  async axiosPost(method, obj, params, handleError, cancelToken, timeout) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    return new Promise(function(resolve, reject) {
      const axiosPostUrl = `${self.url}/${method}/json?auto_unbox=true`;
      console.log(axiosPostUrl);
      axios
        .post(axiosPostUrl, obj, {
          params: paramsObj,
          responseType: 'text',
          cancelToken,
          timeout,
        })
        .then(response => resolve(response.data))
        .catch(function(error) {
          if (!axios.isCancel(error)) {
            if (
              method !== 'getReportLink' &&
              method !== 'getMetaFeaturesTable'
            ) {
              toast.error(`${error.message}`);
            }
            if (handleError != null) {
              handleError(false);
            }
          }
        });
    });
  }

  async ocpuCallAxiosGet(
    method,
    obj,
    params,
    handleError,
    cancelToken,
    timeout,
  ) {
    const paramsObj = params ? { digits: 10 } : {};
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          const url = session.getLoc() + 'R/.val/json?auto_unbox=true';
          axios
            .get(url, {
              params: paramsObj,
              responseType: 'text',
              cancelToken,
              timeout,
            })
            .then(response => resolve(response.data))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
                // console.log('Request canceled', thrown.message);
              } else {
                toast.error(`${thrown.message}`);
                // console.log(`${thrown.message}`);
                if (handleError != null) {
                  handleError(false);
                }
              }
            });
        })
        .catch(error => {
          if (method !== 'getReportLink' && method !== 'getMetaFeaturesTable') {
            toast.error(`${error.statusText}: ${error.responseText}`);
            // console.log(`${error.statusText}: ${error.responseText}`);
          }
          if (handleError != null) {
            handleError(false);
          }
        });
    });
  }

  async ocpuRPCOutput(method, obj) {
    return new Promise(function(resolve, reject) {
      window.ocpu.rpc(method, obj, function(output) {
        resolve(output);
      });
    });
  }

  async getPackageVersion() {
    const promise = this.axiosPost(
      'getPackageVersion',
      {},
      null,
      null,
      null,
      25000,
    );
    const versionFromPromise = await promise;
    return versionFromPromise;
  }

  async getReportLink(study, model, errorCb, cancelToken) {
    // this.setUrl();
    const obj = { study: study, modelID: model };
    // const promise = this.ocpuCallAxiosGet(
    const promise = this.axiosPost(
      'getReportLink',
      obj,
      false,
      errorCb,
      null,
      25000,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async listStudies() {
    // this.setUrl();
    const promise = this.axiosPost('listStudies', {}, true, null, null, 25000);
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async getResultsTable(study, model, test, errorCb, cancelToken) {
    // this.setUrl();
    const obj = { study: study, modelID: model, testID: test };
    // const promise = this.ocpuRPCOutput('getResultsTable', obj);
    const promise = this.axiosPost(
      'getResultsTable',
      obj,
      true,
      errorCb,
      cancelToken,
      25000,
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
    // this.setUrl();
    const obj = {
      study: study,
      modelID: model,
      annotationID: annotation,
      type: valueType,
    };

    const promise = this.axiosPost(
      'getEnrichmentsTable',
      obj,
      true,
      errorCb,
      cancelToken,
      25000,
    );
    // const promise = this.ocpuRPCOutput(
    //   'getEnrichmentsTable',
    //   obj,
    // );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getProteinData(id, study, errorCb) {
    const promise = this.axiosPost(
      'proteindata',
      {
        id: id,
        study: study,
      },
      true,
      errorCb,
      null,
      25000,
    );
    const proteinDataFromPromise = await promise;
    return proteinDataFromPromise;
  }

  async ocpuPlotCall(plottype, obj, handleError, cancelToken) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(plottype, obj, function(session) {
          axios
            // if we want to call plot with dimensions...in progress
            // .get(session.getLoc() + `graphics/1/svg?width=${dynamicWidth}&height={dynamicHeight}`, {
            .get(session.getLoc() + 'graphics/1/svg', {
              responseType: 'text',
              cancelToken,
              timeout: 25000,
            })
            .then(response => resolve(response))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
                // console.log('Request canceled', thrown.message);
              } else {
                toast.error(`${thrown.message}`);
                if (handleError !== undefined) {
                  handleError(false);
                }
                // console.log(`${thrown.message}`);
              }
            });
        })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError !== undefined) {
            handleError(false);
          }
          // console.log(`${error.statusText}: ${error.responseText}`);
        });
    });
  }

  async plotStudy(study, model, id, plottype, errorCb, cancelToken) {
    // this.setUrl();
    const promise = this.ocpuPlotCall(
      'plotStudy',
      {
        study: study,
        modelID: model,
        featureID: id,
        plotID: plottype,
      },
      errorCb,
      cancelToken,
    );
    //const svgMarkupFromPromise = await promise;
    return promise;
  }

  async getBarcodes(study, model) {
    // this.setUrl();
    const promise = this.axiosPost(
      'getBarcodes',
      {
        study: study,
        modelID: model,
      },
      false,
      null,
      null,
      25000,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
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
    // this.setUrl();
    const promise = this.axiosPost(
      'getBarcodeData',
      {
        study: study,
        modelID: model,
        testID: test,
        annotationID: annotation,
        termID: term,
      },
      false,
      errorCb,
      cancelToken,
      25000,
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
    // this.setUrl();
    const promise = this.axiosPost(
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
      true,
      errorCb,
      cancelToken,
      25000,
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
    // this.setUrl();
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
    // this.setUrl();
    const promise = this.axiosPost(
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
      true,
      errorCb,
      cancelToken,
      25000,
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
    // this.setUrl();
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
    // this.setUrl();
    const promise = this.axiosPost(
      'getEnrichmentsNetwork',
      {
        study: enrichmentStudy,
        model: enrichmentModel,
        annotation: enrichmentAnnotation,
      },
      true,
      errorCb,
      cancelToken,
      45000,
    );
    // const promise = this.ocpuRPCOutput(
    //   'getEnrichmentsNetwork',
    //   {
    //     study: enrichmentStudy,
    //     model: enrichmentModel,
    //     annotation: enrichmentAnnotation,
    //   },
    // );
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
    // this.setUrl();
    const promise = this.axiosPost(
      'getNodeFeatures',
      {
        study: enrichmentStudy,
        annotationID: enrichmentAnnotation,
        termID: term,
      },
      false,
      errorCb,
      cancelToken,
      25000,
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
    // this.setUrl();
    const promise = this.axiosPost(
      'getLinkFeatures',
      {
        study: enrichmentStudy,
        annotationID: enrichmentAnnotation,
        termID1: term1,
        termID2: term2,
      },
      false,
      errorCb,
      cancelToken,
      25000,
    );
    const featuresFromPromise = await promise;
    return featuresFromPromise;
  }

  async getMetaFeatures(differentialStudy, differentialModel) {
    this.setUrl();
    const promise = this.ocpuCallAxiosGet(
      'getMetaFeatures',
      {
        study: differentialStudy,
        model: differentialModel,
      },
      false,
      null,
      null,
      25000,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }

  async getMetaFeaturesTable(
    differentialStudy,
    differentialModel,
    feature,
    errorCb,
  ) {
    // this.setUrl();
    const promise = this.axiosPost(
      'getMetaFeaturesTable',
      {
        study: differentialStudy,
        model: differentialModel,
        featureID: feature,
      },
      true,
      errorCb,
      null,
      25000,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }

  async getResultsLinkouts(differentialStudy, differentialModel) {
    this.setUrl();
    const promise = this.ocpuCallAxiosGet(
      'getResultsLinkouts',
      {
        study: differentialStudy,
        modelID: differentialModel,
      },
      false,
      null,
      null,
      25000,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }

  async getEnrichmentsLinkouts(enrichmentStudy, enrichmentAnnotation) {
    this.setUrl();
    const promise = this.ocpuCallAxiosGet(
      'getEnrichmentsLinkouts',
      {
        study: enrichmentStudy,
        annotationID: enrichmentAnnotation,
      },
      false,
      null,
      null,
      25000,
    );
    const nodesFromPromise = await promise;
    return nodesFromPromise;
  }
}

export const omicNavigatorService = new OmicNavigatorService();
