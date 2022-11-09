import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
window.jQuery = $;
require('opencpu.js/opencpu-0.5.js');
class OmicNavigatorService {
  constructor() {
    this.baseUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_DEVSERVER
        : window.location.origin;
    this.url = `${this.baseUrl}/ocpu/library/OmicNavigator/R`;
    this.staticUrl = `${this.baseUrl}/ocpu/library/OmicNavigator/www`;
  }

  async axiosPost(method, obj, params, handleError, cancelToken, timeout) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    return new Promise(function(resolve, reject) {
      const axiosPostUrl = `${self.url}/${method}/json?auto_unbox=true&na="string"`;
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
              method !== 'getFavicons' &&
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

  setUrl() {
    if (process.env.NODE_ENV === 'development') {
      window.ocpu.seturl(this.url);
    }
  }

  async axiosPostPlot(method, obj, handleError, cancelToken, timeout) {
    const self = this;
    const axiosPostUrl = `${self.url}/${method}`;
    try {
      const { data } = await axios.post(axiosPostUrl, obj, {
        responseType: 'text',
        cancelToken,
        timeout,
      });
      const splitUrls = data.split('/ocpu/');
      const graphics = splitUrls.filter(u => u.includes('graphics'));
      const graphicsUrl = `/ocpu/${graphics}`;
      const url = `${self.baseUrl}${graphicsUrl}/svg`;
      return url;
    } catch (error) {
      // DEV - what methods should we not throw errors/toasts for?
      if (method === 'getResultsUpset' || method === 'plotStudy') {
        console.log(`failed to retrieve plot for ${method} with payload:`);
        console.info(obj);
      } else if (!axios.isCancel(error)) {
        toast.error(`${error.message}`);
        if (handleError != null) {
          handleError(false);
        } else {
          throw error;
        }
      }
    }
  }

  async axiosPostPlotly(
    method,
    obj,
    params,
    handleError,
    cancelToken,
    timeout,
  ) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    const axiosPostUrl = `${self.url}/${method}/json?auto_unbox=true`;
    try {
      const { data } = await axios.post(axiosPostUrl, obj, {
        params: paramsObj,
        responseType: 'text',
        cancelToken,
        timeout,
      });
      return data;
    } catch (error) {
      if (method === 'getResultsUpset' || method === 'plotStudy') {
        console.log(`failed to retrieve plot for ${method} with payload:`);
        console.info(obj);
      } else if (!axios.isCancel(error)) {
        toast.error(`${error.message}`);
        if (handleError != null) {
          handleError(false);
        } else {
          throw error;
        }
      }
    }
  }

  async ocpuPlotCall(method, obj, handleError, cancelToken, timeout) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(method, obj, function(session) {
          axios
            .get(session.getLoc() + 'graphics/1/svg', {
              responseType: 'text',
              cancelToken,
              timeout,
            })
            .then(response => resolve(response))
            .catch(function(thrown) {
              if (!axios.isCancel(thrown)) {
                toast.error(`${thrown.message}`);
                if (handleError != null) {
                  handleError(false);
                }
              }
            });
        })
        .catch(error => {
          toast.error(`${error.statusText}: ${error.responseText}`);
          if (handleError != null) {
            handleError(false);
          }
        });
    });
  }

  async plotStudyReturnSvgUrl(
    study,
    modelID,
    featureID,
    plotID,
    plotType,
    testID,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const timeoutLength = 60000;
    const cacheKey = `plotStudy_${study}_${modelID}_${testID}_${featureID}_${plotID}_${plotType}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const obj = {
        study,
        modelID,
        featureID,
        plotID,
        testID,
      };
      if (plotType.includes('plotly')) {
        const dataFromPlotly = await this.axiosPostPlotly(
          'plotStudy',
          obj,
          null,
          errorCb,
          cancelToken,
          timeoutLength,
        );
        this[cacheKey] = dataFromPlotly;
        return dataFromPlotly;
      } else {
        const promise = this.axiosPostPlot(
          'plotStudy',
          obj,
          errorCb,
          cancelToken,
          timeoutLength,
        );
        const dataFromPromise = await promise;
        this[cacheKey] = dataFromPromise;
        return dataFromPromise;
      }
    }
  }

  async plotStudyReturnSvg(
    study,
    modelID,
    featureID,
    plotID,
    plotType,
    testID,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const timeoutLength = 60000;
    const obj = {
      study,
      modelID,
      featureID,
      plotID,
      testID,
    };
    if (plotType.includes('plotly')) {
      const data = await this.axiosPostPlotly(
        'plotStudy',
        obj,
        null,
        errorCb,
        cancelToken,
        timeoutLength,
      );
      return data;
    } else {
      const promise = this.ocpuPlotCall(
        'plotStudy',
        obj,
        errorCb,
        cancelToken,
        timeoutLength,
      );
      const dataFromPromise = await promise;
      return dataFromPromise;
    }
  }

  async plotStudyReturnSvgWithTimeoutResolver(
    study,
    modelID,
    featureID,
    plotID,
    testID,
    errorCb,
    cancelToken,
  ) {
    this.setUrl();
    const timeoutLength = 240000;
    const cacheKey = `plotStudyMultifeature_${study}_${modelID}_${testID}_${featureID}_${plotID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    }
    const promise = this.ocpuPlotCall(
      'plotStudy',
      {
        study,
        modelID,
        featureID,
        plotID,
        testID,
      },
      errorCb,
      cancelToken,
      timeoutLength,
    );
    function timeoutResolver(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(function() {
          reject(true);
        }, ms);
      });
    }
    try {
      await Promise.race([promise, timeoutResolver(10000)]);
      this[cacheKey] = promise;
      return promise;
    } catch (err) {
      return err;
    }
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

  async listStudies() {
    const promise = this.axiosPost('listStudies', {}, true, null, null, 25000);
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async getReportLink(study, modelID, errorCb, cancelToken) {
    const cacheKey = `getReportLink_${study}_${modelID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const obj = { study, modelID };
      const promise = this.axiosPost(
        'getReportLink',
        obj,
        false,
        errorCb,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getResultsTable(study, modelID, testID, errorCb, cancelToken) {
    const cacheKey = `getResultsTable_${study}_${modelID}_${testID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const obj = { study, modelID, testID };
      const promise = this.axiosPost(
        'getResultsTable',
        obj,
        true,
        errorCb,
        cancelToken,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getMetaFeatures(study, model) {
    const cacheKey = `getMetaFeatures_${study}_${model}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getMetaFeatures',
        {
          study,
          model,
        },
        false,
        null,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getMetaFeaturesTable(study, model, featureID, errorCb) {
    const cacheKey = `getMetaFeaturesTable_${study}_${model}_${featureID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getMetaFeaturesTable',
        {
          study,
          model,
          featureID,
        },
        true,
        errorCb,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getResultsLinkouts(study, modelID) {
    const cacheKey = `getResultsLinkouts${study}_${modelID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getResultsLinkouts',
        {
          study,
          modelID,
        },
        false,
        null,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getMultisetCols(study, modelID) {
    const cacheKey = `getMultisetCols${study}_${modelID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getUpsetCols',
        {
          study,
          modelID,
        },
        false,
        null,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getEnrichmentsLinkouts(study, annotationID) {
    const cacheKey = `getEnrichmentsLinkouts${study}_${annotationID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getEnrichmentsLinkouts',
        {
          study,
          annotationID,
        },
        false,
        null,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
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
    const promise = this.axiosPost(
      'getResultsIntersection',
      {
        study,
        modelID,
        anchor,
        mustTests,
        notTests,
        sigValue,
        operator,
        column,
      },
      true,
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
    const promise = this.axiosPost(
      'getEnrichmentsIntersection',
      {
        study,
        modelID,
        annotationID,
        mustTests,
        notTests,
        sigValue,
        operator,
        type,
      },
      true,
      errorCb,
      cancelToken,
      25000,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getResultsMultiset(
    study,
    modelID,
    sigValue,
    operator,
    column,
    errorCb,
    cancelToken,
  ) {
    const cacheKey = `getResultsMultiset_${study}_${modelID}_${sigValue}_${operator}_${column}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      this.setUrl();
      const promise = this.axiosPostPlot(
        'getResultsUpset',
        {
          study,
          modelID,
          sigValue,
          operator,
          column,
        },
        errorCb,
        cancelToken,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getEnrichmentsMultiset(
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
    const cacheKey = `getEnrichmentsMultiset_${study}_${modelID}_${annotationID}_${sigValue}_${operator}_${type}_${tests}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      this.setUrl();
      const promise = this.axiosPostPlot(
        'getEnrichmentsUpset',
        {
          study,
          modelID,
          annotationID,
          sigValue,
          operator,
          type,
          tests,
        },
        errorCb,
        cancelToken,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getEnrichmentsNetwork(study, model, annotation, errorCb, cancelToken) {
    const promise = this.axiosPost(
      'getEnrichmentsNetwork',
      {
        study,
        model,
        annotation,
      },
      true,
      errorCb,
      cancelToken,
      45000,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async getNodeFeatures(study, annotationID, termID, errorCb, cancelToken) {
    // uncomment cache when fix display issue
    // const cacheKey = `getNodeFeatures_${study}_${annotationID}_${termID}`;
    // if (this[cacheKey] != null) {
    //   return this[cacheKey];
    // } else {
    const promise = this.axiosPost(
      'getNodeFeatures',
      {
        study,
        annotationID,
        termID,
      },
      false,
      errorCb,
      cancelToken,
      25000,
    );
    const dataFromPromise = await promise;
    // this[cacheKey] = dataFromPromise;
    return dataFromPromise;
    // }
  }

  async getLinkFeatures(
    study,
    annotationID,
    termID1,
    termID2,
    errorCb,
    cancelToken,
  ) {
    const cacheKey = `getLinkFeatures_${study}_${annotationID}_${termID1}_${termID2}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getLinkFeatures',
        {
          study,
          annotationID,
          termID1,
          termID2,
        },
        false,
        errorCb,
        cancelToken,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getBarcodes(study, modelID) {
    const cacheKey = `getBarcodes_${study}_${modelID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getBarcodes',
        {
          study,
          modelID,
        },
        false,
        null,
        null,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getBarcodeData(
    study,
    modelID,
    testID,
    annotationID,
    termID,
    errorCb,
    cancelToken,
  ) {
    const cacheKey = `getBarcodeData_${study}_${modelID}_${testID}_${annotationID}_${termID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.axiosPost(
        'getBarcodeData',
        {
          study,
          modelID,
          testID,
          annotationID,
          termID,
        },
        false,
        errorCb,
        cancelToken,
        25000,
      );
      const dataFromPromise = await promise;
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
  }

  async getFavicons(differentialResultsLinkouts, errorCb, cancelToken) {
    const promise = this.axiosPost(
      'getFavicons',
      {
        linkouts: differentialResultsLinkouts,
      },
      false,
      errorCb,
      cancelToken,
      25000,
    );
    const dataFromPromise = await promise;
    return dataFromPromise;
  }

  async fetchTerms() {
    const self = this;
    let response = await fetch(`${self.staticUrl}/terms.html`);
    // read response stream as text
    let textData = await response.text();
    if (response.status === 200) {
      return textData;
    } else {
      return null;
    }
  }

  async getMapping(study, cancelToken) {
    const cacheKey = `getMapping_${study}}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getMapping',
          {
            study,
          },
          false,
          null,
          cancelToken,
          25000,
        );
        const dataFromPromise = await promise;
        this[cacheKey] = dataFromPromise;
        return dataFromPromise;
      } catch {
        if (axios.isCancel) {
          // console.log('multi-model mapping cancelled')
        }
      }
    }
  }
}

export const omicNavigatorService = new OmicNavigatorService();
