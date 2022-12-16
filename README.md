# OmicNavigator: Open-Source Software for Omic Data Analysis and Visualization

Exploring the results of omic analyses via interactive web applications facilitates cross-disciplinary collaboration and biological discovery. OmicNavigator is open-source software for the archival and interactive exploration of results from high-throughput biology experiments. The software enables omic data analysts (typically bioinformaticians) to create customizable web applications from the results of their work using only the statistical programming language, R. OmicNavigator is bundled as an R package that contains web application code, R functions for programmatic access and data deposition, and a new container for the storage of measurements (e.g. RNAseq read counts), statistical analyses (differential expression and/or enrichment analysis), metadata, and custom plotting functions. Studies created with OmicNavigator are themselves R packages, accessible via a JavaScript dashboard that can be interrogated on the user’s local machine or deployed online to be explored by collaborators. The dashboard combines user-defined study results and feature plots with performant tables and interactive graphics common to bioinformatic analyses such as scatter, network, volcano, and barcode plots. The tool also includes dynamic, multi-set filtering across hypothesis tests based on user-defined thresholds such as statistical significance or effect size. The 1.0 release of OmicNavigator includes a detailed user guide, API manual, and an example study derived from publicly available RNAseq data. ***This repository contains the source code for the web application.***
Typical use of this code is via the installation of the OmicNavigator R package (which comes bundled with this code). The OmicNavigator R package can be found [here](https://github.com/AbbVie-External/OmicNavigator). 

---

## Application Start
1. Install dependencies ```npm install```
2. Connect to local or remote instance of OmicNavigator server. (The R package, running OpenCPU)
   - create a ```.env``` file at the root level of this project.
   - To this file, add the following: ```REACT_APP_DEVSERVER=[your OpenCPU server url]```
   - Note: When this code is part of an R, OpenCPU installation (inst/www), the .env file is not required.   
3. Start application ```npm start```

---
### Application Build
```npm run build```

## New release

Follow these steps to create a new release

1. Bump the version number in the files `package-lock.json`, `package.json`,
   `public/manifest.json`, and `src/components/Tabs.jsx`. See [this
   commit][example-bump-commit] for an example
1. Add, commit, and push
1. On GitHub, navigate to [Releases][releases] and click [Draft a new
   release][draft-a-new-release]
1. In the box "Choose a tag", enter the new version preceded by a `v`, eg
   `vX.X.X`. Then click the message below to create the new tag when the release
   is published
1. Enter the release title as "OmicNavigatorWebApp X.X.X"
1. Add any release notes to the description box
1. Click "Publish release"

After following the above steps, the app will automatically be built and
uploaded to the release as `build.zip`, and the [R package repository][on-r]
will be triggered to create a new release.

[example-bump-commit]: https://github.com/abbvie-external/OmicNavigatorWebApp/commit/ce7ec16c6f06d8c722bb21a08210aca0b70ed10a
[releases]: https://github.com/abbvie-external/OmicNavigatorWebApp/releases
[draft-a-new-release]: https://github.com/abbvie-external/OmicNavigatorWebApp/releases/new
[on-r]: https://github.com/abbvie-external/OmicNavigator
