(function() {
  "use strict";
  angular
    .module("rc.prime.datalake")
    .controller("DataLakeController", DataLakeController);

  DataLakeController.$inject = [
    "common",
    "DataLakeAPIService",
    "Logger",
    "Upload",
    "$scope",
    "$q"
  ];

  function DataLakeController(
    common,
    DataLakeAPIService,
    Logger,
    Upload,
    $scope,
    $q
  ) {
    let vm = this;

    let $timeout = common.$timeout;

    //Initialize the controller variable values
    initializeControllerVariableValues = () => {
      //Variable to show the pop-up form
      $scope.isUpload = true;
      //All Buttons are enabled on initial model load
      $scope.isBtnEnabled = true;
      $scope.showCantMetaGen = false;
      //Is update file is false, is enabled only on doble click of record
      $scope.updateFile = false;
      //Since no action is initially performed,action success is false
      $scope.actionSuccess = false;
      //Since no action is initially performed,action failed is false
      $scope.actionFail = false;
      //Variable for checking if the drop is uploaded
      $scope.isDropUploaded = false;
      //Variable to check if file uploaded is of type image
      $scope.isImage = false;
      //show confirm variable to check if allow multiple drops for an entity is tru or false
      $scope.showConfirm = false;
      //Variable to check if user has the auhorization to upload image
      $scope.isDropUnauthorized = false;
      //Check on upload, if upload is in progress or processed
      $scope.isDropProcessed = false;
      //Set upload drop form variable as empty object
      $scope.details = {};
      //Variable to store the module/service information
      $scope.moduleDetail = null;
      //Variable to set the record details of selected record in service
      $scope.record = null;
      //Set the map state for the streams for showing images
      //Map the images by stream id, based on display true or false, show image details
      $scope.streamState = {};
      $scope.queuedDrops = [];
      //Is drop type selected variable
      $scope.isDropTypeSelected = false;
      //Is show images which exists is true on form open
      $scope.isShowImages = true;
      //Upload button content text
      $scope.uploadBtnText = "Upload";
      //Update button content text
      $scope.updateBtnText = "Update";
    };

    //On showMetaDataPanel true, open the drop view/upload popup
    vm.Activate = (moduleInformation, recordId) => {
      //Initialize the controller variables initially
      initializeControllerVariableValues();
      //Set the details of the modules/services into variable
      //Get the module/service name
      $scope.name = moduleInformation.name;
      //Get the module details, like uuid, name
      $scope.moduleDetail = moduleInformation;
      //Get the record details selected for drop upload/update
      $scope.record = { id: recordId };
      //If the module exists and record details exist, get available drops by uuid and instance id
      if (recordId !== undefined && recordId !== null) {
        //Function to get the existing drops for module and record
        fetchDropsByUuidAndEntityId(moduleInformation.uuid, recordId);
      }
    };

    //Get available drops for an entity and its uuid
    function fetchDropsByUuidAndEntityId(uuid, instance_id) {
      $scope.isLoadingDrops = true;
      DataLakeAPIService.API
        .GetDropsByUuidAndInstance(uuid, instance_id)
        .then(response => {
          $scope.isLoadingDrops = false;
          //If response array is greater than 0, set the response into drops variable
          response.length > 0 ? ($scope.drops = response) : ($scope.drops = []);
        })
        .catch(error => {
          logger.error(error);
        });
    }

    /**On selecting drop type, check if it is of type virtual/regular to proceed with upload 
       * If drop type is virtual, then User has to enter the URL to get the file
       * If drop type is regular, then User get to upload files from his/fer system manually
      **/
    $scope.isVirtualOrRegualarDropType = () => {
      //Show images variable is set to false
      $scope.isShowImages = false;
      //is drop type selected variable is true
      $scope.getLakes($scope.moduleDetail.uuid);
      $scope.isDropTypeSelected = true;
      $scope.details.status_id = 1;
      $scope.actionText = "upload";
      $scope.isUpload = false;
      $scope.updateFile = false;
      $scope.isDropUploaded = false;
      $scope.showConfirm = false;
      $scope.details.status_id = 1;
      //If selected drop type is virtual then
      if ($scope.details.type === "virtual") {
        $scope.isUpload = false;
      } else if ($scope.details.type === "regular") {
        $scope.isUpload = true;
      }
    };

    $scope.addDropToQueue = () => {
      $scope.queuedDrops === undefined ? ($scope.queuedDrops = []) : null;
      let queuedDropObject = {
        lake: $scope.selectedLakeStream.lake,
        stream: $scope.selectedLakeStream.stream,
        stream_code: $scope.selectedLakeStream.stream_code,
        url: $scope.details.url,
        file_name: $scope.files[0].name,
        size: $scope.files[0].size
      };
      $scope.queuedDrops.push(queuedDropObject);
    };

    function getImage(uuid, instance_id) {
      let query = {
        uuid: uuid,
        stream: "cover_image",
        instance_id: instance_id
      };
      DataLakeAPIService.API
        .GetDropInfoByParams(query)
        .then(response => {
          if (response.data.length > 0) {
            $scope.record.thumbnail = DataLakeAPIService.API.GetDataLakeDownloadUrl(
              response.data[0]["drop_id"],
              { uuid: uuid }
            );
          } else {
            delete $scope.record.thumbnail;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    }

    function setImage() {
      if ($scope.isDropProcessed === true) {
        getImage($scope.moduleDetail.uuid, $scope.record.id);
        $scope.record.thumbnail = "" + "?decache=" + Math.random();
      }
    }

    $scope.getStreams = lake_id => {
      $scope.loadingStreams = true;
      $scope.streams = [];
      DataLakeAPIService.API
        .GetStreamsByLake(lake_id)
        .then(response => {
          $scope.streams = response;
          $scope.streams.length > 0
            ? ($scope.noStreams = false)
            : ($scope.noStreams = true);
          $scope.loadingStreams = false;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.getLakeStreamLinkByIds = (lakeId, streamId) => {
      DataLakeAPIService.API
        .GetLakeStreamLink(lakeId, streamId)
        .then(response => {
          $scope.selectedLakeStream = response[0];
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.checkMultipleDropsForStream = details => {
      $scope.dropsForselectedLakeStream = [];
      for (let i = 0; i < $scope.drops.length; i++) {
        if (
          $scope.selectedLakeStream.lake_id === $scope.drops[i].lake_id &&
          $scope.selectedLakeStream.stream_id === $scope.drops[i].stream_id
        ) {
          $scope.dropsForselectedLakeStream.push($scope.drops[i]);
        }
      }

      if (
        $scope.dropsForselectedLakeStream.length === 0 ||
        $scope.selectedLakeStream.allow_multiple !== 0
      ) {
        $scope.uploadFiles(details);
      } else {
        $scope.showConfirm = true;
      }
    };

    $scope.removeFileAndUploadNew = details => {
      if ($scope.selectedLakeStream.allow_multiple === 0) {
        $scope.isDeleting = true;
        $scope.isBtnEnabled = false;
        let drop = $scope.dropsForselectedLakeStream[0];
        drop.uuid = $scope.moduleDetail.uuid;
        DataLakeAPIService.API
          .DeleteDrop(drop)
          .then(response => {
            $scope.isDeleting = false;
            $scope.is_save_to_document_store = true;
            if ($scope.updateFile) {
              $scope.updateFileData(details);
            } else {
              $scope.uploadFiles(details);
            }
            $scope.showConfirm = false;
            $scope.isBtnEnabled = true;
          })
          .catch(error => {
            if (error.status === 403) {
              $scope.isDropUnauthorized = true;
            }
            $scope.error = error;
          });
      } else {
        $scope.uploadFiles(details);
      }
    };

    $scope.getLakes = uuid => {
      if (uuid !== undefined) {
        $scope.lakes = [];
        DataLakeAPIService.API.GetLakesByUuid(uuid).then(response => {
          $scope.lakes = response;
          $scope.lakes.length > 0
            ? ($scope.noLakes = false)
            : ($scope.noLakes = true);
        });
      }
    };

    $scope.setShowMetaDataPanel = value => {
      $scope.$showMetaDatapanel = value;
      $scope.isUpload = true;
    };

    $scope.closeThis = () => {
      $scope.$showMetaDatapanel = false;
    };

    let checkType = type => {
      $scope.isImage = false;
      if (
        type === "image/jpg" ||
        type === "image/jpeg" ||
        type === "image/png" ||
        type === "image/gif" ||
        type === "image/webp" ||
        type === "image/bmp" ||
        type === "image/svg" ||
        type === "application/octet-stream"
      ) {
        $scope.isImage = true;
      }
    };

    $scope.selectFiles = (files, errFiles) => {
      $scope.isUpload = false;
      $scope.isDropUploaded = false;
      $scope.files = files;
      $scope.errFiles = errFiles;
      checkType($scope.files[0].type);
    };

    $scope.cancelUpload = () => {
      $scope.isUpload = true;
      $scope.isDropTypeSelected = false;
      $scope.isShowImages = true;
      $scope.details = {};
      $scope.updateFile = false;
    };

    $scope.uploadFiles = details => {
      let drop = {
        lake_id: details.lake_id,
        status_id: details.status_id,
        type: details.type,
        uuid: $scope.moduleDetail.uuid,
        stream_id: details.stream_id,
        instance_id: $scope.record.id
      };
      if (details.type === "regular") {
        drop.size = $scope.files[0].size;
        drop.kind = $scope.files[0].type;
      } else if (details.type === "virtual") {
        drop.url = details.url;
      }

      function setTimeoutPromise(ms) {
        let defer = $q.defer();
        setTimeout(defer.resolve, ms);
        return defer.promise;
      }
      $scope.isBtnEnabled = false;
      $scope.uploadBtnText = "Uploading...";

      function uplodFileSequentially(file, ms) {
        return function() {
          return setTimeoutPromise(ms).then(function() {
            let uploadUrl = DataLakeAPIService.API.GetUploadDropUrl();
            file.upload = Upload.upload({
              url: uploadUrl,
              method: "POST",
              data: { file: file, data: drop }
            });
            file.upload
              .then(response => {
                if (response.status == 201) {
                  $scope.dropId = response.data.drop_id;
                  $scope.message = "Uploaded documents successfully.";
                  $scope.isDropProcessed = true;
                  $scope.isBtnEnabled = true;
                  $scope.is_save_to_document_store = true;
                  setImage();
                  $scope.reloadList();
                  if (!$scope.isImage) {
                    $scope.isUpload = true;
                    $scope.isDropUploaded = false;
                  } else {
                    $scope.isDropUploaded = true;
                    $scope.updateFile = false;
                    $scope.learnImageBtn = true;
                    $scope.image_data = null;
                  }
                }
                $timeout(() => {
                  $scope.details = {};
                  $scope.isShowImages = true;
                  $scope.message = null;
                  $scope.actionSuccess = false;
                }, 2500);
                $scope.uploadBtnText = "Upload";
              })
              .catch(error => {
                $scope.isBtnEnabled = true;
                if (error.status === 403) {
                  $scope.isDropUnauthorized = true;
                }
                $scope.error = "Error in drop upload.";
              });
          });
        };
      }

      function uploadDrop(drop) {
        let uploadUrl = DataLakeAPIService.API
          .UploadDrop(drop)
          .then(response => {
            if (response.status == 201) {
              $scope.dropId = response.data.drop_id;
              $scope.message = "Uploaded documents successfully.";
              $scope.isDropProcessed = true;
              $scope.isBtnEnabled = true;
              $scope.isDropTypeSelected = false;
              drop.drop_type = "virtual"
                ? fetchDropsByUuidAndEntityId(
                    $scope.moduleDetail.uuid,
                    $scope.record.id
                  )
                : null;
              if (!$scope.isImage) {
                $scope.isUpload = true;
                $scope.isDropUploaded = false;
              } else {
                $scope.isDropUploaded = true;
                $scope.updateFile = false;
                $scope.learnImageBtn = true;
                $scope.image_data = null;
              }
            }
            $timeout(() => {
              $scope.details = {};
              $scope.message = null;
              $scope.actionSuccess = false;
            }, 2500);
            $scope.uploadBtnText = "Upload";
          })
          .catch(error => {
            $scope.isBtnEnabled = true;
            if (error.status === 403) {
              $scope.isDropUnauthorized = true;
            }
            $scope.error = "Error in drop upload.";
          });
      }
      if (details.type === "regular") {
        let chain = $q.when();
        angular.forEach($scope.files, (file, index) => {
          chain = chain.then(
            uplodFileSequentially(file, ($scope.files.length - index) * 1000)
          );
        });
        chain.then(function() {
          fetchDropsByUuidAndEntityId(
            $scope.moduleDetail.uuid,
            $scope.record.id
          );
        });
      } else {
        uploadDrop({ data: drop });
      }
    };

    $scope.getDownloadUrl = (url, dropType, downloadUrl) => {
      if (dropType.toLowerCase() === "regular") {
        return DataLakeAPIService.API.GetDownloadUrl(
          url,
          $scope.moduleDetail.uuid
        );
      } else if (dropType.toLowerCase() === "virtual") {
        return downloadUrl;
      }
    };

    $scope.downloadFile = (file, fileName, drop) => {
      let file_name = fileName;
      if (file_name.length > 4) {
        var lastFive = file_name.substr(file_name.length - 4);
        if (lastFive) {
          lastFive = lastFive.toLowerCase();
        }
        if (lastFive && lastFive != '.jpg' && lastFive != '.png' && lastFive != 'webp' && lastFive != 'jpeg' && drop.kind.includes("image")) {
          file_name = file_name + '.jpg'
        }
      }
      DataLakeAPIService.API
        .DownloadDrop(file, $scope.moduleDetail.uuid)
        .success((data, status, headers) => {
          headers = headers();
          let contentType = headers["content-type"];
          let linkElement = document.createElement("a");
          try {
            let blob = new Blob([data], { type: contentType });
            let url = window.URL.createObjectURL(blob);
            linkElement.setAttribute("href", url);
            linkElement.setAttribute("download", file_name);
            let clickEvent = new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: false
            });
            linkElement.dispatchEvent(clickEvent);
          } catch (exception) {
            logger.error(exception);
          }
        })
        .error(error => {
          if (error || error.status === 403) {
            $scope.isDropUnauthorized = true;
          }
          logger.error(error);
        });
    };

    $scope.saveJSON = function() {
      $scope.toJSON = "";
      $scope.toJSON = angular.toJson($scope.data);
      var blob = new Blob([$scope.toJSON], {
        type: "application/json;charset=utf-8;"
      });
      var downloadLink = angular.element("<a></a>");
      downloadLink.attr("href", window.URL.createObjectURL(blob));
      downloadLink.attr("download", "fileName.json");
      downloadLink[0].click();
    };

    $scope.updateFileData = data => {
      data.instance_id = $scope.record.id;
      $scope.message = null;
      data.uuid = $scope.moduleDetail.uuid;
      $scope.isBtnEnabled = false;
      $scope.updateBtnText = "Updating...";
      DataLakeAPIService.API
        .UpdateDetails(data)
        .then(response => {
          $scope.reloadList();
          $scope.isUpload = !$scope.isUpload;
          $scope.isDropProcessed = true;
          $scope.streamState[data.stream_id] = true;
          $scope.isBtnEnabled = true;
          $scope.message = "Updated drop successfully";
          setImage();
          $scope.updateBtnText = "Update";
        })
        .catch(error => {
          if (error.status === 403) {
            $scope.isDropUnauthorized = true;
          }
          $scope.isBtnEnabled = true;
          $scope.error = error;
          $scope.actionFail = true;
        });

      $timeout(() => {
        $scope.message = null;
        $scope.actionFail = false;
      }, 2500);
    };

    $scope.statusList = [
      { id: 1, label: "Active" },
      { id: 0, label: "Inactive" }
    ];

    $scope.dblClickAction = (name, data) => {
      $scope.getStreams(data.lake_id);
      $scope.getLakes($scope.moduleDetail.uuid);
      $scope.getLakeStreamLinkByIds(data.lake_id, data.stream_id);
      $scope.files = {};
      $scope.actionText = "update";
      $scope.details = {};
      $scope.isUpload = false;
      $scope.files[0] = data;
      $scope.files[0].name = data.file_name;
      $scope.files[0].type = data.kind;
      $scope.updateFile = true;
      $scope.details = data;
      $scope.showConfirm = false;
      checkType($scope.files[0].type);
    };

    $scope.removeDrop = (drop, flag) => {
      $scope.isDeleting = true;
      let d = $q.defer();
      drop.uuid = $scope.moduleDetail.uuid;
      DataLakeAPIService.API
        .DeleteDrop(drop)
        .then(response => {
          $scope.isDropProcessed = true;
          $scope.isDeleting = false;
          $scope.is_save_to_document_store = true;
          // after delete new sequence should be loaded
          flag !== 1 ? $scope.reloadList() : null;
          setImage();
          if (!flag) {
            $scope.message = "Deleted drop successfully";
          }
        })
        .catch(error => {
          if (error.status === 403) {
            $scope.isDropUnauthorized = true;
          }
          $scope.error = error;
        });
      $timeout(() => {
        $scope.message = null;
        $scope.actionSuccess = false;
        $scope.actionFail = false;
      }, 2500);
    };

    $scope.showUploadSection = boolValue => {
      $scope.isUpload = boolValue;
    };

    $scope.reloadList = () => {
      fetchDropsByUuidAndEntityId($scope.moduleDetail.uuid, $scope.record.id);
    };

    let getExtension = filename => {
      return filename.split(".").pop();
    };

    $scope.toggleDrops = obj => {
      $scope.streamState[obj.stream_id] = !$scope.streamState[obj.stream_id];
    };
  }
})();
