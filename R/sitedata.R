#' Return phosphopeptide metadata for a given phosphosite_multiplicity summation - Proxy to Study Package
#'
#' This function returns the phosphopeptides (with site localization and other metadata) used to quantify the levels of a given phosphosite.
#' @param idmult The idmult of the phosphosite
#' @param study The study
#' @details This function hits the evidence.txt file. For singly phsphorylated peptides the phosphopeptide with the most quantifications is used. For multiply phosphorylated peptides the union of all phosphopeptides is used for the quantification. It is unclear what rule, if any is used by MQ to assign a given multiply phosphorylated peptide when multiple multiply phosphorylated peptides are observed in the same sample.
#' @return A data frame that includes localized phosphopeptides and the experiments in which each phosphopeptide was observed (or matched). Protein_Site (HGNC symbol), Modifications, Modified sequence, Type, Experiment (semicolon delimited), Obervations (n), Median Intensity (raw), Proteins,	Leading proteins,	Leading razor protein
#' @examples
#' sitedata(idmult = "221_1", study="PLA2G2plots")
#' @export

sitedata <- function(idmult, study) {

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
  rv <- get("sitedata", as.environment(v))(idmult)

  ## return the dataframe
  return(rv)
}
