import DOMPurify from 'dompurify';
import { CancelToken } from 'axios';
import {
  isMultiModelMultiTest,
  getTestsArg,
  getModelsArg,
  getIdArg,
} from '../helpers';

class PlotHelpers {
  // =====================================================
  // CANCEL TOKEN MANAGEMENT
  // =====================================================
  static cancelFunctions = {
    singlePlot: () => {},
    multiPlot: () => {},
    overlay: () => {},
  };

  /**
   * Creates a new cancel token and stores the cancel function
   *
   * @param {string} key - 'singlePlot' | 'multiPlot' | 'overlay'
   * @returns {Object} Axios CancelToken
   */
  static createCancelToken(key) {
    // Cancel any existing request of this type
    this.cancelFunctions[key]();

    // Create new token
    return new CancelToken((c) => {
      this.cancelFunctions[key] = c;
    });
  }

  /**
   * Cancels a specific request type
   */
  static cancelRequest(key) {
    if (this.cancelFunctions[key]) {
      this.cancelFunctions[key]();
      this.cancelFunctions[key] = () => {};
    }
  }

  /**
   * Cancels all ongoing requests
   */
  static cancelAllRequests() {
    Object.keys(this.cancelFunctions).forEach((key) => {
      this.cancelRequest(key);
    });
  }

  // =====================================================
  // PLOT METADATA CONVERSION
  // =====================================================

  /**
   * Convert getPlots API response into a flat array of plot metadata.
   *
   * @param {Object} plots - Response from getPlots API
   *   Shape: { [plotID]: { displayName, plotType, models?, ... } }
   *
   * @returns {Array<Object>} Array of plot metadata
   */
  static convertGetPlotsTypeToListStudiesType(plots) {
    if (!plots || typeof plots !== 'object') {
      console.warn(
        'convertGetPlotsTypeToListStudiesType: Invalid input',
        plots,
      );
      return [];
    }

    return Object.entries(plots).map(([plotID, plotObj]) => ({
      plotID,
      plotDisplay: plotObj.displayName || plotID,
      plotType: plotObj.plotType || ['singleFeature'],
      models: plotObj.models || null,
      ...plotObj,
    }));
  }

  // =====================================================
  // PLOT ARGUMENTS CALCULATION
  // =====================================================

  /**
   * Build modelsArg, testsArg, and idArg for a given plot.
   */
  static buildPlotArgs({
    plot,
    differentialModelIds,
    differentialTestIds,
    differentialTest,
    differentialModelsAndTests,
    multiModelMappingFirstKey,
    differentialModel,
    differentialTestIdsCommon,
    differentialPlotDescriptions,
    multiModelMappingArrays,
    featureId,
  }) {
    if (!plot || !plot.plotType) {
      console.error('buildPlotArgs: Invalid plot object', plot);
      return { modelsArg: [], testsArg: [], idArg: null, modelIdsOverride: [] };
    }

    // 1) Determine which models to use
    const plotMetadataSpecificPlot =
      differentialPlotDescriptions?.[plot.plotID] || {};

    const designatedModels = plotMetadataSpecificPlot.models || null;

    const designatedModelsMultiModelExists =
      designatedModels &&
      designatedModels !== 'all' &&
      Array.isArray(designatedModels) &&
      designatedModels.includes(differentialModel);

    const differentialModelIdsOverride = designatedModelsMultiModelExists
      ? designatedModels
      : differentialModelIds;

    // 2) Determine tests
    const isMultiModelMultiTestVar = isMultiModelMultiTest(plot.plotType);
    const testIdNotCommon =
      !differentialTestIdsCommon ||
      !differentialTestIdsCommon.includes(differentialTest);

    let testsArg = [];

    if (isMultiModelMultiTestVar && testIdNotCommon) {
      testsArg = [];
    } else {
      testsArg = getTestsArg(
        plot.plotType,
        differentialModelIdsOverride,
        differentialTestIds,
        differentialTest,
        differentialModelsAndTests,
        multiModelMappingFirstKey,
        differentialModel,
        differentialTestIdsCommon,
      );
    }

    // 3) Models arg
    const modelsArg = getModelsArg(
      plot.plotType,
      differentialModelIdsOverride,
      differentialTestIds,
      differentialModel,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      differentialTestIdsCommon,
    );

    // 4) ID arg (handles multi-model mapping)
    const idArg = getIdArg(
      plot.plotType,
      differentialModelIdsOverride,
      differentialTestIds,
      differentialTest,
      differentialModelsAndTests,
      differentialModel,
      multiModelMappingArrays,
      featureId,
    );

    return {
      modelsArg,
      testsArg,
      idArg,
      modelIdsOverride: differentialModelIdsOverride,
    };
  }

  // =====================================================
  // SVG SANITIZATION
  // =====================================================

  /**
   * Sanitize and rewrite an SVG string for safe rendering.
   */
  static sanitizeStaticSvg(xml, { idBase, svgIndex, multiFeature = false }) {
    if (!xml || typeof xml !== 'string' || xml.length === 0) {
      console.warn('sanitizeStaticSvg: Invalid or empty XML');
      return '';
    }

    try {
      let updated = xml.replace(/id="/g, `id="${idBase}-${svgIndex}-`);

      updated = updated.replace(/#glyph/g, `#${idBase}-${svgIndex}-glyph`);
      updated = updated.replace(/#clip/g, `#${idBase}-${svgIndex}-clip`);

      const svgId = multiFeature
        ? `currentSVG-multifeatures-${svgIndex}`
        : `currentSVG-${idBase}-${svgIndex}`;

      updated = updated.replace(
        /<svg/g,
        `<svg preserveAspectRatio="xMinYMin meet" class="currentSVG" id="${svgId}"`,
      );

      const restrictExternalUseHref = function (node) {
        if (node.hasAttribute('xlink:href')) {
          const href = node.getAttribute('xlink:href');
          if (!href.match(/^#/)) {
            node.remove();
          }
        }
      };

      DOMPurify.addHook('afterSanitizeAttributes', restrictExternalUseHref);

      try {
        return DOMPurify.sanitize(updated, {
          ADD_TAGS: ['use'],
          ADD_ATTR: ['xlink:href'],
        });
      } finally {
        DOMPurify.removeHook('afterSanitizeAttributes');
      }
    } catch (error) {
      console.error('Error sanitizing SVG:', error);
      return '';
    }
  }

  // =====================================================
  // PLOT TYPE FILTERING
  // =====================================================

  static filterPlotsByType(plots, multiFeature = false) {
    if (!plots || !Array.isArray(plots)) {
      return [];
    }

    return plots.filter((plot) => {
      const plotTypeArray = Array.isArray(plot.plotType)
        ? plot.plotType
        : [plot.plotType];

      const hasMultiFeature = plotTypeArray.includes('multiFeature');

      return multiFeature ? hasMultiFeature : !hasMultiFeature;
    });
  }

  // =====================================================
  // PLOT DATA STRUCTURE CREATION
  // =====================================================

  static createPlotDataObject(featureId, featureIdKey, svgArray = []) {
    const isMultiple = Array.isArray(featureId);
    const count = isMultiple ? featureId.length : 1;

    return {
      key: isMultiple ? `(${count}-features)` : `${featureId}`,
      title: isMultiple
        ? `${featureIdKey} (${count} Features)`
        : `${featureIdKey} ${featureId}`,
      svg: svgArray,
    };
  }

  static createEmptyPlotData() {
    return {
      key: null,
      title: '',
      svg: [],
    };
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  static isValidPlotData(plotData) {
    return (
      plotData &&
      typeof plotData === 'object' &&
      plotData.key !== null &&
      Array.isArray(plotData.svg)
    );
  }

  static isValidPlotArray(plots) {
    return (
      plots &&
      Array.isArray(plots) &&
      plots.length > 0 &&
      plots.every((p) => p.plotID && p.plotType)
    );
  }
}

export default PlotHelpers;
