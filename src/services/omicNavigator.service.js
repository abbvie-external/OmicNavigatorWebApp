import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-toastify';
import('opencpu.js/opencpu-0.5.js');
window.jQuery = $;

class OmicNavigatorService {
  constructor() {
    this.baseUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_DEVSERVER
        : window.location.origin;
    this.url = `${this.baseUrl}/ocpu/library/OmicNavigator/R`;
    this.staticUrl = `${this.baseUrl}/ocpu/library/OmicNavigator/www`;
    this.timeoutLength = 240000;
  }

  async axiosPost(method, obj, params, handleError, cancelToken) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    return new Promise(function (resolve, reject) {
      const axiosPostUrl = `${self.url}/${method}/json?auto_unbox=true&na="string"`;
      axios
        .post(axiosPostUrl, obj, {
          params: paramsObj,
          cancelToken,
          timeout: self.timeoutLength,
        })
        .then((response) => resolve(response.data))
        .catch(function (error) {
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

  async getPlotUrl(method, obj, handleError, cancelToken) {
    const self = this;
    const axiosPostUrl = `${self.url}/${method}`;
    try {
      const { data } = await axios.post(axiosPostUrl, obj, {
        cancelToken,
        timeout: self.timeoutLength,
      });
      const splitUrls = data.split('/ocpu/');
      const graphics = splitUrls.filter((u) => u.includes('graphics'));
      const graphicsUrl = `/ocpu/${graphics}`;
      const url = `${self.baseUrl}${graphicsUrl}/svg`;
      return url;
    } catch (error) {
      if (!axios.isCancel(error)) {
        if (handleError != null) {
          handleError(false);
        }
        return `Error: ${error.response.data}`;
      }
    }
  }

  async axiosPostPlotly(method, obj, params, handleError, cancelToken) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    const axiosPostUrl = `${self.url}/${method}/json?auto_unbox=true`;
    try {
      const { data } = await axios.post(axiosPostUrl, obj, {
        params: paramsObj,
        cancelToken,
        timeout: self.timeoutLength,
      });
      return data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.log(`failed to retrieve plot for ${method} with payload:`);
        if (handleError != null) {
          handleError(false);
        }
        return `Error: ${error.response.data}`;
      }
    }
  }

  async ocpuPlotCall(method, obj, handleError, cancelToken) {
    const self = this;
    return new Promise(function (resolve, reject) {
      window.ocpu
        .call(method, obj, function (session) {
          const sessionUrls = session.output || null;
          if (!sessionUrls) resolve([]);
          const graphicsUrl = sessionUrls.filter((u) => u.includes('graphics'));
          // graphics = ["/ocpu/tmp/tempid/graphics/1"]
          if (!graphicsUrl.length) resolve([]);
          const url = `${self.baseUrl}${graphicsUrl}/svg`;
          axios
            .get(url, {
              responseType: 'text', // needed for SVG
              cancelToken,
              timeout: self.timeoutLength,
            })
            .then((response) => resolve(response))
            .catch(function (thrown) {
              if (!axios.isCancel(thrown)) {
                if (handleError != null) {
                  handleError(false);
                }
                return `Error: ${error.response.data}`;
              }
            });
        })
        .catch((error) => {
          if (handleError != null) {
            handleError(false);
          }
          return `Error: ${error.response.data}`;
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
        );
        this[cacheKey] = dataFromPlotly;
        return dataFromPlotly;
      } else {
        const promise = this.getPlotUrl('plotStudy', obj, errorCb, cancelToken);
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
      );
      return data;
    } else {
      const promise = this.ocpuPlotCall('plotStudy', obj, errorCb, cancelToken);
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
    );
    function timeoutResolver(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          reject(true);
        }, ms);
      });
    }
    try {
      await Promise.race([promise, timeoutResolver(10000)]);
      this[cacheKey] = promise;
      return promise;
    } catch (err) {
      return `Error: ${error.response.data}`;
      // return err;
    }
  }

  async ocpuRPCOutput(method, obj) {
    return new Promise(function (resolve, reject) {
      window.ocpu.rpc(method, obj, function (output) {
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
    const promise = this.axiosPost('listStudies', {}, true, null, null, 60000);
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async getResultsStudies() {
    const promise = this.axiosPost(
      'getResultsStudies',
      {},
      true,
      null,
      null,
      25000,
    );
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async getEnrichmentsStudies() {
    const promise = this.axiosPost(
      'getEnrichmentsStudies',
      {},
      true,
      null,
      null,
      25000,
    );
    const studiesFromPromise = await promise;
    return studiesFromPromise;
  }

  async getStudyMeta(study, cancelToken) {
    const cacheKey = `getStudyMeta_${study}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getStudyMeta',
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
        // if (axios.isCancel) {
        // }
      }
    }
  }

  async getResultsModels(study, cancelToken) {
    const cacheKey = `getResultsModels_${study}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getResultsModels',
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
        // if (axios.isCancel) {
        // }
      }
    }
  }

  async getEnrichmentsModels(study, cancelToken) {
    const cacheKey = `getEnrichmentsModels_${study}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getEnrichmentsModels',
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
        // if (axios.isCancel) {
        // }
      }
    }
  }

  async getResultsTests(study, model, cancelToken) {
    const cacheKey = `getResultsTests_${study}-${model}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getResultsTests',
          {
            study,
            model,
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
        }
      }
    }
  }

  async getEnrichmentsAnnotations(study, model, cancelToken) {
    const cacheKey = `getEnrichmentsAnnotations_${study}_${model}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getEnrichmentsAnnotations',
          {
            study,
            modelID: model,
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
        }
      }
    }
  }

  async getHasAnnotationTerms(study, annotationID, cancelToken) {
    const cacheKey = `getHasAnnotationTerms_${study}_${annotationID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getHasAnnotationTerms',
          {
            study,
            annotationID,
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
        }
      }
    }
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

  async getResultsTable(
    study,
    modelID,
    testID,
    annotationID,
    termID,
    errorCb,
    cancelToken,
  ) {
    const cacheKey = `getResultsTable_${study}_${modelID}_${testID}_${annotationID}_${termID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const obj = { study, modelID, testID, annotationID, termID };
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
      const promise = this.getPlotUrl(
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
      const promise = this.getPlotUrl(
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
        // if (axios.isCancel) {
        // console.log('multi-model mapping cancelled')
        // }
      }
    }
  }

  async getAllTests(study, cancelToken) {
    const cacheKey = `getAllTests_${study}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getTests',
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
        }
      }
    }
  }

  async getPlotDescriptions(study, model, cancelToken) {
    const cacheKey = `getPlots_${study}_${model}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      try {
        const promise = this.axiosPost(
          'getPlots',
          {
            study,
            model,
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
        }
      }
    }
  }
}

export const omicNavigatorService = new OmicNavigatorService();
