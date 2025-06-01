angular.module("rc.prime.datalake").service("DataLakeService", Services);

Services.$inject = [
  "application_configuration",
  "DataLakeAPIService",
  "Upload",
  "$http",
  "$q"
];

function Services(
  application_configuration,
  DataLakeAPIService,
  Upload,
  $http,
  $q
) {
  //Actions available on storage service
  let Actions = {
    /**
     * Upload drop with the details of module and image information passed
     * If the drop type is regular, accept the image selected or imported from the user
     * If the drop type is virtual, insert the url entered and show image from given url
     */
    UploadDrop: drop => {
      return new Promise((resolve, reject) => {
        //If the selected drop type is regular, insert the drop and download the file passed
        if (drop.source && (drop.source.toLowerCase() === "local" || drop.source.toLowerCase() === "camera")) {
          let chain = $q.when();
          //For each files selected in the drop, upload all the files sequentially
          angular.forEach(drop.files, (file, index) => {
            chain = chain.then(
              uploadFileSequentially(file, (drop.files.length - index) * 1000)
            );
          });

          //Return the reponse obtained for sequential file upload
          let data = chain.then(response => {
            //Once all the promise is resolve, return the response obtained
            return chain;
          });
          resolve(data);
        } else if (drop.source && drop.source.toLowerCase() === "url") {
          //If the drop type virtual,upload drop with given URL
          uploadDrop({ data: drop }).then(res => {
            resolve(res);
          }).catch(error => {
            reject(error);
          });
          //resolve(data);
        }
        //Time out promise to complete all the actions passed to execute
        function setTimeoutPromise(ms) {
          let defer = $q.defer();
          setTimeout(defer.resolve, ms);
          return defer.promise;
        }
        //Function to upload file
        function uploadFileSequentially(file, ms) {
          return function () {
            //Set the time out for each file upload
            return setTimeoutPromise(ms).then(() => {
              //Get the URL to which the datalake upload is being done
              let uploadUrl = DataLakeAPIService.API.GetUploadDropUrl();
              //Upload middleware to send the file as a property of request object
              file.upload = Upload.upload({
                url: uploadUrl,
                method: "POST",
                data: { file: file, data: drop }
              });
              //Upload the file along with module details and file
              return file.upload
                .then(response => {
                  //Return the response on success
                  return response;
                })
                .catch(error => {
                  //Return error on failure
                  return error;
                });
            });
          };
        }
        //Upload Drop details
        function uploadDrop(drop) {
          return new Promise((resolve, reject) => {

            //Upload the drop details along with URL given, if the body contains no files
            DataLakeAPIService.API
              .UploadDrop(drop)
              .then(response => {
                //Return the response on success
                resolve(response);
              })
              .catch(error => {
                //Return error on failure
                reject(error);
              });
            // return uploadUrl;

          })
        }
      })
    },

    UploadCorporateDrop: drop => {
      return new Promise((resolve, reject) => {
        //If the selected drop type is regular, insert the drop and download the file passed
        let chain = $q.when();
        //For each files selected in the drop, upload all the files sequentially
        angular.forEach(drop.files, (file, index) => {
          chain = chain.then(
            uploadFileSequentially(file, (drop.files.length - index) * 1000)
          );
        });

        //Return the reponse obtained for sequential file upload
        let data = chain.then(response => {
          //Once all the promise is resolve, return the response obtained
          return chain;
        });
        resolve(data);

        //Time out promise to complete all the actions passed to execute
        function setTimeoutPromise(ms) {
          let defer = $q.defer();
          setTimeout(defer.resolve, ms);
          return defer.promise;
        }
        //Function to upload file
        function uploadFileSequentially(file, ms) {
          return function () {
            //Set the time out for each file upload
            return setTimeoutPromise(ms).then(() => {
              //Get the URL to which the datalake upload is being done
              let uploadUrl = DataLakeAPIService.API.GetUploadCorporateDropUrl();
              //Upload middleware to send the file as a property of request object
              file.upload = Upload.upload({
                url: uploadUrl,
                method: "POST",
                data: { file: file, data: drop }
              });
              //Upload the file along with module details and file
              return file.upload
                .then(response => {
                  //Return the response on success
                  return response;
                })
                .catch(error => {
                  //Return error on failure
                  return error;
                });
            });
          };
        }
      })
    },
    //Function to get drops by uuid and instance id
    GetDropByUuidAndInstanceId: (uuid, instance_id) => {
      //For given uuis and instance, get all the drops available
      return DataLakeAPIService.API
        .GetDropsByUuidAndInstance(uuid, instance_id)
        .then(response => {
          //Return the drops response obtained
          return response;
        })
        .catch(error => {
          //Return error on failure
          return error;
        });
    },
    //Get the lake and stream link details from lake stream table
    GetLakeStreamLink: (lakeId, streamId) => {
      //Contains all properties such as is upload multiple,lake details,stream details
      return DataLakeAPIService.API
        .GetLakeStreamLink(lakeId, streamId)
        .then(response => {
          //Return the lake stream details on success
          return response;
        })
        .catch(error => {
          //Return error on failure
          return error;
        });
    },
    //Set statuses for drops upload
    GetDropStatuses: () => {
      // It would be active as id - 1 and inactive as id - 0
      // boolean property isDefault is used to maintain the value selected by default.
      return [{ id: 1, label: "Active", isDefault: 1 }, { id: 0, label: "Inactive", isDefault: 0 }];
    },
    //Get drop lake details by UUID
    GetDropLakesByUUID: uuid => {
      //For given uuid get the lakes available for given uuid
      return DataLakeAPIService.API
        .GetLakesByUuid(uuid)
        .then(response => {
          //return the reponse on success
          return response;
        })
        .catch(error => {
          //Return error on failure
          return error;
        });
    },
    //Get all the streams available for a lake
    GetStreamsByLakeId: lakeId => {
      return DataLakeAPIService.API
        .GetStreamsByLake(lakeId)
        .then(response => {
          //return the reponse on success
          return response;
        })
        .catch(error => {
          //Return error on failure
          return error;
        });
    },
    //Download file function by image details
    DownloadDrop: (uuid, file, fileName) => {
      //Based on file name and uuid, call the download the funtion
      return DataLakeAPIService.API
        .DownloadDrop(file, uuid)
        .success((data, status, headers) => {
          //On success of finding the file, proceed with download process
          //Set the attributes and elements for download
          headers = headers();
          //Blob feature of reading the content type of download file
          let contentType = headers["content-type"];
          //Create an 
          let linkElement = document.createElement("a");
          try {
            let blob = new Blob([data], { type: contentType });
            let url = window.URL.createObjectURL(blob);
            //Set the href attribute of the element selected
            linkElement.setAttribute("href", url);
            //And the file name which should be downloaded
            linkElement.setAttribute("download", fileName);
            //Set the action to be performed on the click event
            let clickEvent = new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: false
            });
            //Return the dispatched event performed on click event
            return linkElement.dispatchEvent(clickEvent);
          } catch (exception) {
            return exception;
          }
        })
        .error(error => {
          return error;
        });
    },

    DownloadCorporateDrop: (uuid, file, fileName) => {
      //Based on file name and uuid, call the download the funtion
      return DataLakeAPIService.API
        .DownloadCorporateDrop(file, uuid)
        .success((data, status, headers) => {
          //On success of finding the file, proceed with download process
          //Set the attributes and elements for download
          headers = headers();
          //Blob feature of reading the content type of download file
          let contentType = headers["content-type"];
          //Create an 
          let linkElement = document.createElement("a");
          try {
            let blob = new Blob([data], { type: contentType });
            let url = window.URL.createObjectURL(blob);
            //Set the href attribute of the element selected
            linkElement.setAttribute("href", url);
            //And the file name which should be downloaded
            linkElement.setAttribute("download", fileName);
            //Set the action to be performed on the click event
            let clickEvent = new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: false
            });
            //Return the dispatched event performed on click event
            return linkElement.dispatchEvent(clickEvent);
          } catch (exception) {
            return exception;
          }
        })
        .error(error => {
          return error;
        });
    },
    //Service function to delete a drop and remove the images
    DeleteDrop: drop => {
      //Delete drop API call from the datalake service
      return DataLakeAPIService.API
        .DeleteDrop(drop)
        .then(response => {
          //Return response of delete drop
          return response;
        })
        .catch(error => {
          //Return error in case of rejection
          return error;
        });
    },

    DeleteCorporateDrop: drop => {
      //Delete drop API call from the datalake service
      return DataLakeAPIService.API
        .DeleteCorporateDrop(drop)
        .then(response => {
          //Return response of delete drop
          return response;
        })
        .catch(error => {
          //Return error in case of rejection
          return error;
        });
    }
  };
  return Actions;
}
