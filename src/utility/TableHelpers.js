import React, { useMemo } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';

export default function TableHelpers() {
  const additionalTemplateInfo = useMemo(() => {
    let addParams = {};
    addParams.showPhosphositePlus = dataItem => {
      return function() {
        var protein = (dataItem.Protein
          ? dataItem.Protein
          : dataItem.MajorityProteinIDsHGNC
        ).split(';')[0];
        let param = { proteinNames: protein, queryId: -1, from: 0 };
        phosphoprotService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action'
        );
      };
    };

    addParams.showPlot = dataItem => {
      return function() {
        debugger;
        // this.selectedId = dataItem.id_mult;
        //this.svgLabel = "Phosphosite Intensity - " + dataItem.Protein_Site;
        //this.getPlot(dataItem.id_mult, dataItem.Protein_Site)
        // switch (this.selectedTestCategory.testCategory) {
        //   case "Differential Expression":
        //     this.imageInfo.title =
        //       "Protein Intensity - " + dataItem.MajorityProteinIDs;
        //     break;
        //   default:
        //     this.imageInfo.title =
        //       "Phosphosite Intensity - " + dataItem.Protein_Site;
        // }
        // this.getPlot(
        //   dataItem.id_mult ? dataItem.id_mult : dataItem.id,
        //   dataItem
        // );
      };
    };
    return addParams;
  });
}
