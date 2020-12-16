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
    // this.addEventListener('fetch' => {
    //   var stream = new ReadableStream({
    //     start(controller) {
    //       if (/* there's more data */) {
    //         controller.enqueue(/* your data here */);
    //       } else {
    //         controller.close();
    //       }
    //     });
    //   });

    //   var response = new Response(stream, {
    //     headers: {'content-type': /* your content-type here */}
    //   });
    //   respondWith(response);
    // });
  }

  async axiosPost(method, obj, params, handleError, cancelToken, timeout) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    return new Promise(function(resolve, reject) {
      const axiosPostUrl = `${self.url}/${method}/json?auto_unbox=true`;
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

  setUrl() {
    if (process.env.NODE_ENV === 'development') {
      window.ocpu.seturl(this.ocpuUrlProd);
    }
  }

  async axiosPostPlot(
    plottype,
    obj,
    params,
    handleError,
    cancelToken,
    timeout,
  ) {
    const paramsObj = params ? { digits: 10 } : {};
    const self = this;
    return new Promise(function(resolve, reject) {
      const axiosPostUrl = `${self.url}/${plottype}/graphics/1/svg`;
      // const axiosPostUrl = `${self.url}/${plottype}/graphics/R/plotStudy`;
      axios
        .post(axiosPostUrl, obj, {
          params: paramsObj,
          responseType: 'text',
          cancelToken,
          timeout,
        })
        // .then(response => resolve(response))
        .then(response => {
          console.log(response);
          resolve(response.data);
        })
        .catch(function(error) {
          if (!axios.isCancel(error)) {
            toast.error(`${error.message}`);
          }
          if (handleError != null) {
            handleError(false);
          }
        });
    });
  }

  async ocpuPlotCall(plottype, obj, handleError, cancelToken, timeout) {
    return new Promise(function(resolve, reject) {
      window.ocpu
        .call(plottype, obj, function(session) {
          axios
            // if we want to call plot with dimensions...in progress
            // .get(session.getLoc() + `graphics/1/svg?width=${dynamicWidth}&height={dynamicHeight}`, {
            .get(session.getLoc() + 'graphics/1/svg', {
              responseType: 'text',
              cancelToken,
              timeout,
            })
            .then(response => resolve(response))
            .catch(function(thrown) {
              if (axios.isCancel(thrown)) {
              } else {
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
    // current implementation
    // const cacheKey = `getResultsTable_${study}_${modelID}_${testID}`;
    // if (this[cacheKey] != null) {
    //   return this[cacheKey];
    // } else {
    // const obj = { study, modelID, testID };
    // const promise = this.axiosPost(
    //   'getResultsTable',
    //   obj,
    //   true,
    //   errorCb,
    //   cancelToken,
    //   25000,
    // );
    // const dataFromPromise = await promise;
    // this[cacheKey] = dataFromPromise;
    // return dataFromPromise;
    //}

    // readable stream
    const obj = { study, modelID, testID };
    const fetchUrl = `${this.url}/getResultsTable/json?auto_unbox=true`;

    // fetch(fetchUrl, {
    //   method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //   mode: 'cors', // no-cors, *cors, same-origin
    //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //   credentials: 'same-origin', // include, *same-origin, omit
    //   headers: {
    //     'Content-Type': 'application/json'
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   redirect: 'follow', // manual, *follow, error
    //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //   body: JSON.stringify(obj) // body data type must match "Content-Type" header
    // })
    // .then(response => {
    //   const reader = response.body.getReader();
    //   return new ReadableStream({
    //     start(controller) {
    //       return pump();
    //       function pump() {
    //         return reader.read().then(({ done, value }) => {
    //           // When no more data needs to be consumed, close the stream
    //           if (done) {
    //               controller.close();
    //               return;
    //           }
    //           // Enqueue the next data chunk into our target stream
    //           controller.enqueue(value);
    //           return pump();
    //         });
    //       }
    //     }
    //   })
    // })
    // // .then(stream => new Response(stream))
    // .then(stream => {
    //   debugger;
    //   return new Response(stream)
    //   // return new Response(stream, { headers: { "Content-Type": "text/html" } });
    // })
    // // .then(response => {
    // //   debugger;
    // //   const json = response.json();
    // //   if (json != null) {
    // //     if (json.length > 0) {
    // //       return json;
    // //     }
    // //   }
    // // })
    // .then(response => response)
    // // .then(response => response.blob())
    // // .then(blob => URL.createObjectURL(blob))
    // // .then(url => console.log(image.src = url))
    // .catch(err => console.error(err));

    // const fetchResponse = await fetch(fetchUrl, {
    //   method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //   mode: 'cors', // no-cors, *cors, same-origin
    //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //   credentials: 'same-origin', // include, *same-origin, omit
    //   headers: {
    //     'Content-Type': 'application/json'
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   redirect: 'follow', // manual, *follow, error
    //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //   body: JSON.stringify(obj) // body data type must match "Content-Type" header
    // });
    // const response = await fetchResponse;
    // // const responseJSON = await fetchResponse.json();
    // const reader = response.body.getReader();
    // const stream = new ReadableStream({
    //   start(controller) {
    //     const chunkys = [];
    //     // The following function handles each data chunk
    //     function push() {
    //       // "done" is a Boolean and value a "Uint8Array"
    //       reader.read().then(({ done, value }) => {
    //         // Is there no more data to read?
    //         if (done) {
    //           // Tell the browser that we have finished sending data
    //           controller.close();
    //           return chunkys;
    //         }
    //         // Get the data and send it to the browser via the controller
    //         controller.enqueue(value);
    //         push();
    //           chunkys.push(value);
    //         // getResultsTable(null, null, null, null, null, chunk)
    //       });
    //     };
    //     push();
    //     if (chunkys.length > 1) {
    //       debugger;
    //       return chunkys;
    //     }
    //   }
    // });
    // debugger;
    // // return chunkys;
    // return new Response(stream, { headers: { "Content-Type": "text/html" } });

    const response = this.fetchReadableStream(fetchUrl, obj);
    const tableData = await response;
    // const tableData = await response;
    // debugger;
    if (tableData != null) {
      const dataFromPromise = tableData.json();
      if (dataFromPromise !== undefined) {
        return dataFromPromise;
      }
    }

    // simple fetch
    // this.postData(fetchUrl, obj)
    // .then(data => {
    //   debugger;
    //   console.log(data); // JSON data parsed by `data.json()` call
    // });
  }

  // async readAllChunks(readableStream) {
  //   const reader = readableStream.getReader();
  //   const chunkys = [];
  //   let done, value;
  //   while (!done) {
  //     ({ value, done } = await reader.read());
  //     if (done) {
  //       return chunkys;
  //     }
  //     debugger;
  //     chunkys.push(value);
  //     return chunkys;
  //   }
  // }

  async fetchReadableStream(url = '', data = {}) {
    const fetchResponse = fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    const response = await fetchResponse;
    // const responseJSON = response.json();
    // return responseJSON;
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        // let chunkys = [];
        // The following function handles each data chunk
        function push() {
          // "done" is a Boolean and value a "Uint8Array"
          reader.read().then(({ done, value }) => {
            // Is there no more data to read?
            if (done) {
              // Tell the browser that we have finished sending data
              controller.close();
              // return chunkys;
            }
            // Get the data and send it to the browser via the controller
            controller.enqueue(value);
            push();
            // chunkys.push(value);
            // getResultsTable(null, null, null, null, null, chunk)
          });
        }
        push();
        // debugger;
        // return chunks;
      },
    });
    // debugger;
    // return chunks;
    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // fetch(url, {
  //   method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //   mode: 'cors', // no-cors, *cors, same-origin
  //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  //   credentials: 'same-origin', // include, *same-origin, omit
  //   headers: {
  //     'Content-Type': 'application/json'
  //     // 'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   redirect: 'follow', // manual, *follow, error
  //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  //   body: JSON.stringify(data) // body data type must match "Content-Type" header
  // })
  // .then(response => {
  // const reader = response.body.getReader();
  // return new ReadableStream({
  //   start(controller) {
  //     return pump();
  //     function pump() {
  //       return reader.read().then(({ done, value }) => {
  //         // When no more data needs to be consumed, close the stream
  //         if (done) {
  //             controller.close();
  //             return;
  //         }
  //         // Enqueue the next data chunk into our target stream
  //         controller.enqueue(value);
  //         return pump();
  //       });
  //     }
  //   }
  // })
  // })
  // .then(stream => new Response(stream))
  // .then(response => {
  //   debugger;
  //   return response;
  // })
  // .then(response => response)
  // .then(response => response.blob())
  // .then(blob => URL.createObjectURL(blob))
  // .then(url => console.log(image.src = url))
  // .catch(err => console.error(err));

  // const stream = new ReadableStream({
  //   start(controller) {
  //     const chunkys = [];
  //     // The following function handles each data chunk
  //     function push() {
  //       // "done" is a Boolean and value a "Uint8Array"
  //       reader.read().then(({ done, value }) => {
  //         // Is there no more data to read?
  //         if (done) {
  //           // Tell the browser that we have finished sending data
  //           controller.close();
  //           return chunkys;
  //         }
  //         // Get the data and send it to the browser via the controller
  //         controller.enqueue(value);
  //         push();
  //         // chunkys.push(value);
  //         // if (chunkys.length > 0) {
  //         //   debugger;
  //         //   return chunkys;
  //         // }
  //         // getResultsTable(null, null, null, null, null, chunk)
  //       });
  //     };
  //     console.log(chunkys);
  //     push();
  //     // if (chunkys.length > 0) {
  //     //   debugger;
  //     //   return chunkys;
  //     // }
  //     // return chunkys;
  //   }
  // })
  // // return new Response(stream, { headers: { "Content-Type": "text/html" } });
  // .then(stream => new Response(stream))
  // // .then(response => response)
  // .then(response => {
  //   debugger;
  //   return response;
  // })
  // // return chunkys;
  //};

  //const chunkys = this.readAllChunks(response.body);
  // const paul = await chunkys;
  //return chunkys;
  // async function readAllChunks(readableStream) {
  //   const reader = readableStream.getReader();
  //   const chunkys = [];

  //   let done, value;
  //   while (!done) {
  //     ({ value, done } = await reader.read());
  //     if (done) {
  //       return chunkys;
  //     }
  //     chunkys.push(value);
  //   }
  // }

  //await readAllChunks(response.body));
  // const reader = rb.getReader();
  // const chunkys = [];
  // debugger;
  // const { value, done } = reader.read();

  // if (done) {
  //   console.log("The stream was already closed!");
  // } else {
  //   console.log(value);
  //   chunkys.push(value);
  // }
  // return chunkys;

  //   const reader = rs.getReader();

  //   return new ReadableStream({
  //     async start(controller) {
  //       while (true) {
  //         const { done, value } = await reader.read();

  //         // When no more data needs to be consumed, break the reading
  //         if (done) {
  //           break;
  //         }

  //         // Enqueue the next data chunk into our target stream
  //         controller.enqueue(value);
  //       }

  //       // Close the stream
  //       controller.close();
  //       reader.releaseLock();
  //     }
  //   })
  // })
  // Create a new response out of the stream
  // .then(rs => new Response(rs))
  // Create an object URL for the response
  // .then(response => {
  //   debugger;
  //   return response;
  // })
  // .catch(console.error);
  // })
  //}

  async postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  async getEnrichmentsTable(
    study,
    modelID,
    annotationID,
    type,
    errorCb,
    cancelToken,
  ) {
    const cacheKey = `getEnrichmentsTable_${study}_${modelID}_${annotationID}_${type}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const obj = {
        study,
        modelID,
        annotationID,
        type,
      };
      const promise = this.axiosPost(
        'getEnrichmentsTable',
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

  async plotStudy(study, modelID, featureID, plotID, errorCb, cancelToken) {
    this.setUrl();
    const cacheKey = `plotStudy_${study}_${modelID}_${featureID}_${plotID}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const promise = this.ocpuPlotCall(
        'plotStudy',
        {
          study,
          modelID,
          featureID,
          plotID,
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
    const cacheKey = `getResultsIntersection_${study}_${modelID}_${anchor}_${mustTests}_${notTests}_${sigValue}_${operator}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
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
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
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
    const cacheKey = `getEnrichmentsIntersection_${study}_${modelID}_${annotationID}_${mustTests}_${notTests}_${sigValue}_${operator}_${type}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
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
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
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
    const cacheKey = `getResultsUpset_${study}_${modelID}_${sigValue}_${operator}_${column}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      this.setUrl();
      const promise = this.ocpuPlotCall(
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
    const cacheKey = `getEnrichmentsUpset_${study}_${modelID}_${annotationID}_${sigValue}_${operator}_${type}_${tests}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      this.setUrl();
      const promise = this.ocpuPlotCall(
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
    const cacheKey = `getEnrichmentsNetwork_${study}_${model}_${annotation}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
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
      this[cacheKey] = dataFromPromise;
      return dataFromPromise;
    }
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
}

export const omicNavigatorService = new OmicNavigatorService();
