#' Search Inference.Results for a particular dataset - Proxy to Study Package
#'
#' This function returns a table of results.
#' @param study The study
#' @param testCategory The test category
#' @param annotation The annotation
#' @return a table
#' @examples
#'  getEnrichmentResults("DonorDifferentialPhosphorylation","GSEA_biocarta_modelI","***REMOVED***")
#' @export


getEnrichmentResults <- function(testCategory,annotation,study) {
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
  rv <- get("getEnrichmentResults", as.environment(v))(testCategory,annotation)

  ## return the dataframe
  return(rv)
}

