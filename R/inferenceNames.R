#' Parse Inference.Results to obtain names of objects within - Proxy to Study Package
#'
#' This function returns a json object.
#' @param study The study
#' @return json
#' @examples
#'  inferenceNames("***REMOVED***")
#' @export

inferenceNames <- function(study) {

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
  rv <- get("inferenceNames", as.environment(v))()

  return (rv)
}

