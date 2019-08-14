#' #' Return protein metadata -  Proxy to Study Package
#'
#' This function returns the MS metadata for protein groups
#' @param id The id of the protein group
#' @param study The study
#' @details This function hits the evidence.txt file.
#' @return A data frame that includes lots of goodies!
#' @examples
#' proteindata(id = "1825")
#' @export

proteindata <- function(id, study) {

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
  rv <- get("proteindata", as.environment(v))(id)

  ## return the dataframe
  return(rv)

}
