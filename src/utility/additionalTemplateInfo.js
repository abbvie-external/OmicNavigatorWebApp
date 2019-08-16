export const additionalTemplateInfo = {
  showPhosphositePlus: dataItem => {
    console.log(dataItem.Protein);
    //var protein = (dataItem.Protein ? dataItem.Protein : dataItem.MajorityProteinIDsHGNC).split(";")[0];
    //console.log(protein)
    // let param = { "proteinNames": protein, "queryId": -1, "from": 0 }
    // this._phosphoprotService.postToPhosphositePlus(param, "https://www.phosphosite.org/proteinSearchSubmitAction.action");
  }
};
