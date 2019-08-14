#' Search Inference.Results for a particular dataset - Proxy to Study Package
#'
#' This function returns a table of results.
#' @param study The study
#' @param testCategory The test category
#' @param test The test
#' @return a table
#' @examples
#'  getInferenceResults("DonorDifferentialPhosphorylation","Donor1vDonor2","***REMOVED***")
#' @export


getInferenceResults <- function(testCategory,test,study) {

  if((any(grepl("package:***REMOVED***", search())))&(study != "***REMOVED***"))
    detach("package:***REMOVED***")
  else message("No need to detach ***REMOVED***")

  if((any(grepl("package:***REMOVED***", search())))&(study != "***REMOVED***"))
    detach("package:***REMOVED***")
  else message("No need to detach ***REMOVED***")

  if((any(grepl("package:***REMOVED***plots", search())))&(study != "***REMOVED***plots"))
    detach("package:***REMOVED***plots")
  else message("No need to detach ***REMOVED***plots")

  library(study, character.only = TRUE)

  v <- toString(paste("package:", study, sep=""))
  rv <- get("getInferenceResults", as.environment(v))(testCategory,test)

  ## return the dataframe
  return(rv)
}

