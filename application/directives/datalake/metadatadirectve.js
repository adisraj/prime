//Common directive for DROP functionalities across all services in PRIME
calculus.directive("metaDataPanel", function () {
  return {
    restrict: "E",
    scope: {
      imageName: "@",
    },
    templateUrl: "application/directives/datalake/metadata.html",
    link: function (scope) {
      scope.svgImageUrl = "application/modules/" + scope.imageName;
    },
    controller: function (
      $scope,
      $sce,
      $window,
      $timeout,
      DataLakeAPIService,
      $http,
      $q,
      Upload,
      Logger,
      LearnImage,
      $location,
      $http
    ) {
      let logger = Logger.getInstance("controller");

      //Initialize the controller variable values
      initializeControllerVariableValues = () => {
        //Variable to show the pop-up form
        $scope.isUpload = true;
        //All Buttons are enabled on initial model load
        $scope.isBtnEnabled = true;
        $scope.showCantMetaGen = false;
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
        $scope.currenRoutePath = $location.path();
        //show confirm deletion variable to check if cover image should be deleted or not
        $scope.showConfirmDeletion = false;
        $scope.showConfirmThumbnailDeletion = false;
        //Variable to check if user has the auhorization to upload image
        $scope.isDropUnauthorized = false;
        //Check on upload, if upload is in progress or processed
        $scope.isDropProcessed = false;
        //Set upload drop form variable as empty object
        $scope.details = {};
        //Variable to set the record details of selected record in service
        //$scope.record = null;
        //Set the map state for the streams for showing images
        //Map the images by stream id, based on display true or false, show image details
        $scope.streamState = {};
        //Is show images which exists is true on form open
        $scope.isShowImages = true;
        //Upload button content text
        $scope.uploadBtnText = "Upload";
        //to show loading message till the drops are loaded
        $scope.isLoadingDrops = false;
        // to show allow multiple document message till when allow_multiple flag is false and user selects multiple document at one choose
        $scope.showAllowMultipleMessage = false;

        $scope.details.is_thumbnail = 1;

        $scope.details.is_save_to_document_store = true;

        $scope.learnImage = LearnImage.enable.learn.image;
        $scope.isSaveSuccess = false;
        $scope.isDeleteSuccess = false;
        $scope.thumbnailActive = false;
        $scope.conditionForEmpty = false;
        $scope.numberCannotExeed = false;
        $scope.oneSequence = false;
        $scope.getChange_id = 0;
        $scope.sequenceChangeError = false;
        $scope.firstValue = 0;
        $scope.errorInvolve = "";
      };

      //On showMetaDataPanel true, open the drop view/upload popup
      $scope.$on("showMetaDataPanel", (e, data) => {
        //Initialize the controller variables initially
        initializeControllerVariableValues();
        if (!e.defaultPrevented) {
          e.defaultPrevented = true;
        }
        //Set the details of the modules/services into variable
        //Get the module/service name
        $scope.name = data.moduleInfo.name;
        //Get the module details, like uuid, name
        $scope.moduleDetail = data.moduleInfo;
        //Get the record details selected for drop upload/update
        $scope.record = data.entity_details;
        //Set the show panel/form variable
        $scope.$showMetaDatapanel = data.panel;
        $scope.entityPermissions = data.entity_permissions;
        //If the module exists and record details exist, get available drops by uuid and instance id
        if ($scope.moduleDetail !== undefined && $scope.record !== undefined) {
          //Function to get the existing drops for module and record
          fetchDropsByUuidAndEntityId(
            $scope.moduleDetail.uuid,
            $scope.record.id
          );
        }
        //If show panel/form variable is true, open the model for upload/update drop
        if (data.panel) {
          $("#metadataModal").modal("show");
          $scope.toggleMetaDataPanel = true;
          $scope.isVirtualOrRegualarDropType();
          $scope.details.regular_type = "Local";
          $scope.files = null;
          $scope.errFiles = null;
        } else {
          //If show panel/form variable is false,close the model for upload/update drop
          $("#metadataModal").modal("hide");
          $scope.toggleMetaDataPanel = false;
        }
      });

      //Get available drops by an entity and its uuid
      function fetchDropsByUuidAndEntityId(uuid, instance_id) {
        $scope.notImage = false;
        $scope.notImageUrl=false
        $scope.invalidUrl = false;
        $scope.enableSaveCoverBtn = false;
        if (uuid == 4 || uuid == 44) {
          $scope.enableSaveCoverBtn = true;
        }
        $scope.showConfirmDeletion = false;
        $scope.showConfirmThumbnailDeletion = false;
        $scope.isLoadingDrops = true;
        DataLakeAPIService.API.GetDropsByUuidAndInstance(uuid, instance_id)
          .then((response) => {
            $scope.record.isLoadingMetadata = false;
            $scope.isLoadingDrops = false;
            //If response array is greater than 0, set the response into drops variable
            if (response.length > 0) {
              for (let index = 0; index < response.length; index++) {
                // if stream is cover image, then insert thumbnail with same url
                if (
                  response[index].stream?.toLowerCase() === "cover image" &&
                  response[index].is_thumbnail
                ) {
                  // create an object with response fields and assign values.
                  let obj = {
                    id: response[index].id,
                    file_name: response[index].file_name,
                    stream: "Thumbnail",
                    stream_code: "thumbnail",
                    stream_id: 1,
                    instance_id: response[index].instance_id,
                    drop_id: response[index].drop_id,
                    drop_type: response[index].drop_type,
                    entity: response[index].entity,
                    status_id: response[index].status_id,
                    sequence: 1,
                    lake: response[index].lake,
                    lake_id: response[index].lake_id,
                    type: response[index].type,
                    type_id: response[index].type_id,
                    size: response[index].size,
                    kind: response[index].kind,
                    url: response[index].url,
                    instance_id: response[index].instance_id,
                    is_coverImage: true,
                  };
                  // push the object to the response
                  if (response[index].is_thumbnailImage) {
                    obj.is_coverImage = false;
                    obj.is_thumbnailImage = 1;
                  }
                  response.push(obj);
                }
              }
              // assign the response to drops
              let last_sequence = 0;
              for (let i of response) {
                if (i.sequence != null) {
                  last_sequence = i.sequence;
                } else {
                  last_sequence = 1;
                }
              }
              for (let j of response) {
                if (
                  (j.sequence == 0 || j.sequence == null || $scope.fromsetcoverimage) &&
                  j.stream_id == 1
                ) {
                  if (last_sequence != 0 && (response.filter(x=>x.stream_id == 33)[0].drop_id != j.drop_id)) {
                    j.sequence = last_sequence + 1;
                    last_sequence = j.sequence;
                    DataLakeAPIService.API.UpdateDetails(j).then((res) => {$scope.drops = response});
                  }
                }
              }
              $scope.fromsetcoverimage = false;
              $scope.drops = response;
              $scope.disableSetCoverImage = false;
              let duplicateDrops = $scope.drops.filter((item) => {
                return item.stream_id == 33;
              });
              if (duplicateDrops && duplicateDrops.length == 0) {
                $scope.disableSetCoverImage = true;
              }
              _.each($scope.drops, (drop) => {
                if (
                  drop.file_name?.match(
                    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
                  ) &&
                  drop.size == 0
                ) {
                  drop.url = drop.file_name;
                }
              });
            } else {
              //Else set drops variables as empty array
              $scope.drops = [];
            }
          })
          .catch((error) => {
            logger.error(error);
          });
      }

      $scope.setCoverImage = (set_cover_image, drop_id) => {
        $scope.thumbnailActive = false;
        if (set_cover_image == 1) {
          $scope.files = [];
          let coverImageDrops = $scope.drops.filter((item) => {
            return item.stream_id == 33;
          });
          let thumbnailDrops = $scope.drops.filter((item) => {
            return item.stream_id == 1 && item.drop_id == drop_id;
          });
          let dropThumbnail = [];
          if (coverImageDrops && coverImageDrops.length == 0) {
            $scope.is_thumbnailImage = true;
            dropThumbnail = thumbnailDrops[0];
            dropThumbnail.uuid = $scope.moduleDetail.uu_id;
            dropThumbnail.stream_id = 33;
            dropThumbnail.is_thumbnail = 1;
            dropThumbnail.is_thumbnailImage = 1;
            $scope.learnImageBtn = false;
            dropThumbnail.sequence = 1;
            DataLakeAPIService.API.UpdateDrop(dropThumbnail)
              .then((response) => {
                $scope.isDeleting = false;
                $scope.isBtnEnabled = true;
                $scope.showConfirm = false;
                $scope.message = "Set Cover Image successfully.";
                $scope.learnImageBtn = true;
                $scope.isDropProcessed = true;
                setImage();
                $scope.reloadList();
                $scope.isImage = true;
                $scope.isDropUploaded = true;
                $scope.panelloader = true;
                $timeout(() => {
                  $scope.message = null;
                }, 2500);
              })
              .catch((error) => {
                if (error.status === 403) {
                  $scope.isDropUnauthorized = true;
                }
                $scope.error = error;
              });
          } else if (coverImageDrops && coverImageDrops.length > 0) {
            let coverDrops = [];
            coverDrops = coverImageDrops[0];
            if (!coverDrops.is_thumbnailImage && !coverDrops.is_thumbnail) {
              let deleteDrop = coverDrops;
              deleteDrop.uuid = $scope.moduleDetail.uuid;
              // $scope.isDeleting = true;
              if (!deleteDrop.is_thumbnailImage) {
                DataLakeAPIService.API.DeleteDrop(deleteDrop)
                  .then((response) => {})
                  .catch((error) => {
                    if (error.status === 403) {
                      $scope.isDropUnauthorized = true;
                    }
                    $scope.error = error;
                  });
              }
            }
            if (coverDrops.is_thumbnailImage || coverDrops.is_thumbnail) {
              coverDrops.uuid = $scope.moduleDetail.uuid;
              coverDrops.uuid = $scope.moduleDetail.uu_id;
              coverDrops.stream_id = 1;
              coverDrops.is_thumbnail = 1;
              coverDrops.is_thumbnailImage = 0;
              DataLakeAPIService.API.UpdateDrop(coverDrops)
                .then((response) => {
                  $scope.isUpload = !$scope.isUpload;
                  if ($scope.details) $scope.details.is_thumbnail = 1;
                  $scope.is_thumbnailImage = true;
                  dropThumbnail = thumbnailDrops[0];
                  dropThumbnail.uuid = $scope.moduleDetail.uu_id;
                  dropThumbnail.stream_id = 33;
                  dropThumbnail.is_thumbnail = 1;
                  dropThumbnail.is_thumbnailImage = 1;
                  $scope.learnImageBtn = false;
                  dropThumbnail.sequence = 1;
                  DataLakeAPIService.API.UpdateDrop(dropThumbnail)
                    .then((response) => {
                      $scope.isDeleting = false;
                      $scope.isBtnEnabled = true;
                      $scope.showConfirm = false;
                      $scope.message = "Set Cover Image successfully.";
                      $scope.learnImageBtn = true;
                      $scope.isDropProcessed = true;
                      setImage();
                      $scope.fromsetcoverimage = true;
                      $scope.reloadList();
                      $scope.isImage = true;
                      $scope.isDropUploaded = true;
                      $scope.panelloader = true;
                      $timeout(() => {
                        $scope.message = null;
                      }, 2500);
                    })
                    .catch((error) => {
                      if (error.status === 403) {
                        $scope.isDropUnauthorized = true;
                      }
                      $scope.error = error;
                    });
                })
                .catch((error) => {
                  if (error.status === 403) {
                    $scope.isDropUnauthorized = true;
                  }
                  $scope.isBtnEnabled = true;
                  $scope.error = error;
                  $scope.actionFail = true;
                });
            }
            $scope.is_thumbnailImage = true;
            dropThumbnail = thumbnailDrops[0];
            dropThumbnail.uuid = $scope.moduleDetail.uu_id;
            dropThumbnail.stream_id = 33;
            dropThumbnail.is_thumbnail = 1;
            dropThumbnail.is_thumbnailImage = 1;
            $scope.learnImageBtn = false;
            DataLakeAPIService.API.UpdateDrop(dropThumbnail)
              .then((response) => {
                $scope.isDeleting = false;
                $scope.isBtnEnabled = true;
                $scope.showConfirm = false;
                $scope.message = "Set Cover Image successfully.";
                $scope.learnImageBtn = true;
                $scope.isDropProcessed = true;
                setImage();
                $scope.reloadList();
                $scope.isImage = true;
                $scope.isDropUploaded = true;
                $scope.panelloader = true;
                $timeout(() => {
                  $scope.message = null;
                }, 2500);
              })
              .catch((error) => {
                if (error.status === 403) {
                  $scope.isDropUnauthorized = true;
                }
                $scope.error = error;
              });
          }
        }
      };

      /**On selecting drop type, check if it is of type virtual/regular to proceed with upload
       * If drop type is virtual, then User has to enter the URL to get the file
       * If drop type is regular, then User get to upload files from his/fer system manually
       **/
      $scope.isVirtualOrRegualarDropType = () => {
        $scope.getLakes($scope.moduleDetail.uuid);
        $scope.details.status_id = 1;
        $scope.actionText = "upload";
        $scope.isUpload = false;
        $scope.isDropUploaded = false;
        $scope.showConfirm = false;
      };

      $scope.previewDatalake = (dropdata, streamName) => {
        if (streamName.toLowerCase() !== "import_export") {
          if (!dropdata.url) {
            let query = { uuid: $scope.moduleDetail.uuid, stream: streamName };
            dropdata["imgUrl"] = DataLakeAPIService.API.GetDataLakeDownloadUrl(
              dropdata.drop_id,
              query
            );
          } else {
            dropdata["imgUrl"] = dropdata.url;
          }
          if (dropdata.is_captured) {
            var win = window.open();
            win.document.write(
              '<iframe src="' +
                dropdata["imgUrl"] +
                '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
            );
          } else if (
            dropdata.file_name?.match(
              /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
            ) ||
            dropdata.url?.match(
              /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
            )
          ) {
            $window.open(
              dropdata.file_name ? dropdata.file_name : dropdata.url
            );
          } else {
            dropdata["imgUrl"] = $sce.trustAsResourceUrl(dropdata["imgUrl"]);
            $window.open(dropdata["imgUrl"]);
          }
        } else {
          $scope.downloadFile(dropdata.drop_id, dropdata.file_name, drop);
        }
      };

      function getImage(uuid, instance_id) {
        let query = {
          uuid: uuid,
          stream: "cover_image",
          instance_id: instance_id,
        };
        DataLakeAPIService.API.GetDropInfoByParams(query)
          .then((response) => {
            if (response.data.length > 0) {
              if ( response.data[1] && response.data[1].url) {
                $scope.record.thumbnail = response.data[1].url;
              }else if (response.data[0].url) {
                $scope.record.thumbnail = response.data[0].url;
              } else {
                // $scope.record.thumbnail = DataLakeAPIService.API.GetDataLakeDownloadUrl(
                //   response.data[0]["drop_id"],
                //   { uuid: uuid }
                // );
                // $scope.record.thumbnail = "" + "?decache=" + Math.random();
                let dropId = null;
                if (response.data[1] && response.data[1]["drop_id"]) {
                  dropId = response.data[1]["drop_id"];
                } else {
                  dropId = response.data[0]["drop_id"];
                }
                $scope.record.thumbnail =
                  DataLakeAPIService.API.GetImageDownloadUrl(
                    dropId,
                    "165x165",
                    uuid
                  );
              }
            } else {
              delete $scope.record.thumbnail;
            }
          })
          .catch((error) => {
            logger.error(error);
          });
      }

      $scope.loadImage = (data, size, id, uuid) => {
        let entityUUID = uuid ? uuid : vm.uuid;
        let entityId = id ? id : data.id;
        DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
          entityUUID,
          entityId,
          "cover_image"
        )
          .then((response) => {
            if (response && response.length > 0) {
              if (!response[0].url) {
                data.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                  response[0].drop_id,
                  size,
                  entityUUID
                );
              } else if (response[0].url) {
                data.thumbnail = response[0].url;
              }
              data.drop_id = response[0].drop_id;
            } else {
              data.thumbnail = undefined;
            }
          })
          .catch((error) => {
            logger.error(error);
          });
      };

      function setImage() {
        if ($scope.isDropProcessed === true) {
          getImage($scope.moduleDetail.uuid, $scope.record.id);
          $scope.record.thumbnail = "" + "?decache=" + Math.random();
        }
      }

      $scope.getStreams = (lake_id) => {
        $scope.loadingStreams = true;
        $scope.streams = [];
        DataLakeAPIService.API.GetStreamsByLake(lake_id)
          .then((response) => {
            $scope.streams = response;
            $scope.streams.length > 0
              ? ($scope.noStreams = false)
              : ($scope.noStreams = true);
            $scope.loadingStreams = false;
            if (response.length === 1) {
              $scope.details.stream_id = response[0].stream_id;
              $scope.getLakeStreamLinkByIds(
                response[0].lake_id,
                response[0].stream_id
              );
            }
          })
          .catch((error) => {
            logger.error(error);
          });
      };

      $scope.getLakeStreamLinkByIds = (lakeId, streamId) => {
        $scope.numberCannotExeed = false;
        $scope.oneSequence = false;
        $scope.details.duplicate = false;
        $scope.details.display_sequence = null;
        $scope.notImage = false;
        $scope.notImageUrl=false
      $scope.invalidUrl = false;
        if (streamId === 1) {
          $scope.conditionForEmpty = true;
          $scope.thumbnailActive = true;
        } else {
          $scope.conditionForEmpty = false;
          $scope.thumbnailActive = false;
        }
        $scope.showAllowMultipleMessage = false;
        $scope.details.is_save_to_document_store = true;
        DataLakeAPIService.API.GetLakeStreamLink(lakeId, streamId)
          .then((response) => {
            $scope.selectedLakeStream = response[0];
            $scope.validateSelectedFiles($scope.files);
          })
          .catch((error) => {
            logger.error(error);
          });
      };

      $scope.changeSequenceNumber = () => {
        if ($scope.details.display_sequence === null) {
          $scope.conditionForEmpty = true;
        } else {
          $scope.conditionForEmpty = false;
        }
        $scope.numberCannotExeed = false;
        $scope.oneSequence = false;
        if ($scope.details.display_sequence > 300) {
          $scope.numberCannotExeed = true;
        } else {
          $scope.numberCannotExeed = false;
        }
        if (
          $scope.details.display_sequence === 1 ||
          $scope.details.display_sequence === 0
        ) {
          $scope.oneSequence = true;
        } else {
          $scope.oneSequence = false;
        }
        if (
          $scope.drops?.length > 0 &&
          $scope.details.display_sequence !== null
        ) {
          for (let i in $scope.drops) {
            const key = $scope.drops[i];
            if (
              key.sequence == $scope.details.display_sequence &&
              key.stream_id !== 33 &&
              $scope.details.display_sequence <= 300 &&
              $scope.details.display_sequence >= 2
            ) {
              $scope.details.duplicate = true;
              break;
            } else {
              $scope.details.duplicate = false;
            }
          }
        }
      };
      $scope.editItem = (drop) => {
        $scope.firstValue = 0;
        $scope.firstValue = drop.sequence;
        if (!drop.is_coverImage && drop.sequence != 1) {
          drop.editDocSequence = true;
        }
        if (drop.url && drop.url.length > 0) {
          document
            .getElementById(String(drop.drop_id))
            .removeAttribute("class");
        }
      };
      $scope.doneEditing = (drop) => {
        document
          .getElementById(String(drop.drop_id))
          .setAttribute("class", "backing");
          
        if ($scope.firstValue != drop.sequence) {
          if (
            !$scope.sequenceChangeError &&
            (drop.sequence != 1 || drop.sequence != 0 || drop.sequence != "")
          ) {
            drop.sequence = parseInt(drop.sequence);
            DataLakeAPIService.API.UpdateDetails(drop).then((res) => {
              $scope.firstValue = res.config.data.sequence;
              drop.duplicate = false;
              fetchDropsByUuidAndEntityId(
                $scope.moduleDetail.uuid,
                $scope.record.id
              );
            });
            drop.editDocSequence = false;
          } else {
            if ("display_sequence" in drop) {
              drop.display_sequence = $scope.firstValue;
            } else {
              drop.sequence = $scope.firstValue;
            }
            fetchDropsByUuidAndEntityId(
              $scope.moduleDetail.uuid,
              $scope.record.id
            );
          }
        }
        $scope.sequenceChangeError = false;
        drop.editDocSequence = false;
      };

      $scope.validationHandle = (drop, drops) => {
        $scope.getChange_id = drop.drop_id;
        if (drop.sequence == "") {
          $scope.sequenceChangeError = true;
          $scope.errorInvolve = "*Sequence field is required";
        } else {
          if (drop.sequence == 0 || drop.sequence == 1) {
            $scope.sequenceChangeError = true;
            $scope.errorInvolve =
              "*Sequence number is reserved for cover_image thumbnail";
          } else if (drop.sequence > 300) {
            $scope.sequenceChangeError = true;
            $scope.errorInvolve = "*Sequence number cannot exceed 300";
          } else {
            for (let i of drops) {
              if (i.drop_id != drop.drop_id && i.sequence == drop.sequence) {
                drop.duplicate = true;
                $scope.sequenceChangeError = false;
                break;
              } else {
                $scope.sequenceChangeError = false;
              }
            }
          }
        }
      };
      $scope.getUrlExtension = (url) => {
        return url.split(/[#?]/)[0].split(".").pop().trim();
      };

      $scope.$nImageEdit = async () => {
        let imgUrl = "";
        var imgExt = getUrlExtension(imgUrl);

        const response = await fetch(imgUrl);
        const blob = await response.blob();
        cons;
        const file = new File([blob], "profileImage." + imgExt, {
          type: blob.type,
        });
      };

      $scope.isGivenUrlAnImage = async (details, drops) => {
        let url = details.url;
        if (url) {
          url.includes("jpg") ||
          url.includes("jpeg") ||
          url.includes("image/png") ||
          url.includes("image/gif") ||
          url.includes("image/webp") ||
          url.includes("image/bmp") ||
          url.includes("image/svg") ||
          url.includes("images") ||
          url.includes("application/octet-stream")
            ? ($scope.isImage = true)
            : ($scope.isImage = false);
          blobtest();
          async function blobtest() {
            try {
              let blob = await fetch(url)
                .then((r) => r.blob())
                .then(
                  (blobFile) =>
                    new File([blobFile], url, { type: "image/jpeg" })
                );
              let files = [blob];
              $scope.selectFiles(files, []);
              if ($scope.showConfirm) {
                $scope.removeFileAndUploadNew(details);
              } else {
                $scope.previous_selected_stream_id = details.stream_id;
                $scope.dropsForselectedLakeStream = [];
                if ($scope.drops && $scope.drops.length > 0) {
                  if ($scope.selectedLakeStream.stream_id == 33) {
                    let coverDrops = $scope.drops.filter((item) => {
                      return item.stream_id == 33;
                    });
                    if (coverDrops && coverDrops.length > 0) {
                      $scope.showConfirm = true;
                      $scope.isBtnEnabled = true;
                      $scope.uploadBtnText = "Upload";
                    } else {
                      $scope.uploadFiles(details);
                    }
                  } else {
                    $scope.uploadFiles(details);
                  }
                } else {
                  $scope.uploadFiles(details);
                }
              }
            } catch (err) {
              let blob = await fetch(url, { mode: "no-cors" })
                .then((r) => r.blob())
                .then(
                  (blobFile) =>
                    new File([blobFile], url, { type: "image/jpeg" })
                );
              let files = [blob];
              $scope.selectFiles(files, []);
              if ($scope.showConfirm) {
                $scope.removeFileAndUploadNew(details);
              } else {
                $scope.uploadFiles(details);
              }
              $scope.isBtnEnabled = true;
              $scope.uploadBtnText = "Upload";
              // $scope.showCantMetaGen = true;
              if ($scope.showConfirm) {
                $scope.showConfirm = false;
              }
            }
          }
        } else {
          $scope.isBtnEnabled = true;
          $scope.uploadBtnText = "Upload";
        }
      };

      $scope.AddedForUrl = (details) => {
        $scope.isBtnEnabled = false;
        $scope.uploadBtnText = "Uploading...";
        $scope.showCantMetaGen = false;
        let params = {
          data: {
            url: details.url,
            is_save_to_document_store: true,
          },
        };
        DataLakeAPIService.API.CheckFileType(params)
          .then((res) => {
            $scope.isGivenUrlAnImage(details, $scope.drops);
          })
          .catch((error) => {
            $scope.showCantMetaGen = true;
            $scope.isBtnEnabled = true;
            $scope.uploadBtnText = "Upload";
            if ($scope.showConfirm) {
              $scope.showConfirm = false;
            }
          });
      };

      $scope.checkMultipleDropsForStream = (details) => {
        if (
          details.regular_type &&
          details.regular_type.toLowerCase() === "url"
        ) {
          if ($scope.showConfirm) {
            $scope.AddedForUrl(details);
          } else {
            $scope.previous_selected_stream_id = details.stream_id;
            $scope.dropsForselectedLakeStream = [];
            if ($scope.drops && $scope.drops.length > 0) {
              if ($scope.selectedLakeStream.stream_id == 33) {
                let coverDrops = $scope.drops.filter((item) => {
                  return item.stream_id == 33;
                });
                if (coverDrops && coverDrops.length > 0) {
                  $scope.showConfirm = true;
                } else {
                  $scope.AddedForUrl(details);
                }
              } else {
                $scope.AddedForUrl(details);
              }
            } else {
              $scope.AddedForUrl(details);
            }
          }
        } else {
          if ($scope.showConfirm) {
            $scope.removeFileAndUploadNew(details);
          } else {
            $scope.previous_selected_stream_id = details.stream_id;
            $scope.dropsForselectedLakeStream = [];

            if ($scope.drops && $scope.drops.length > 0) {
              if ($scope.selectedLakeStream.stream_id == 33) {
                let coverDrops = $scope.drops.filter((item) => {
                  return item.stream_id == 33;
                });
                if (coverDrops && coverDrops.length > 0) {
                  $scope.showConfirm = true;
                } else {
                  $scope.uploadFiles(details);
                }
              } else {
                $scope.uploadFiles(details);
              }
            } else {
              $scope.uploadFiles(details);
            }
          }
        }
      };

      $scope.checkPreviousSelectedStreamId = () => {
        if ($scope.previous_selected_stream_id) {
          $scope.details.stream_id = $scope.previous_selected_stream_id;
        }
      };

      $scope.removeFileAndUploadNew = (details) => {
        let coverDrops = $scope.drops.filter((item) => {
          return item.stream_id == 33;
        });
        let deletedMainDrop = [];
        if (coverDrops && coverDrops.length > 0) {
          deletedMainDrop = coverDrops[0];
        }
        if ($scope.selectedLakeStream.allow_multiple === 0) {
          $scope.isBtnEnabled = false;
          let drop = {
            lake_id: details.lake_id,
            status_id: details.status_id,
            type: details.type,
            uuid: $scope.moduleDetail.uuid,
            stream_id: details.stream_id,
            instance_id: $scope.record.id,
            is_save_to_document_store: details.is_save_to_document_store,
            is_thumbnail: details.is_thumbnail,
          };
          // if (!details.url) {
          drop.size = $scope.files[0].size;
          drop.files = $scope.files[0].type;
          // } else if (details.url) {
          //   drop.url = details.url;
        // }
        if(details.regular_type==="URL" && details.url){
          drop.url=details.url
        }
          function setTimeoutPromise(ms) {
            let defer = $q.defer();
            setTimeout(defer.resolve, ms);
            return defer.promise;
          }
          $scope.isBtnEnabled = false;
          $scope.uploadBtnText = "Uploading...";

          // if (!details.url) {
          let chain = $q.when();
          angular.forEach($scope.files, function (file, index) {
            chain = chain.then(
              uplodFileSequentially(file, ($scope.files.length - index) * 1000)
            );
          });
          chain.then(() => {
            // fetchDropsByUuidAndEntityId(
            //   $scope.moduleDetail.uuid,
            //   $scope.record.id
            // );
          });
          // } else {
          //   uploadDrop({ data: drop });
          // }
          function uplodFileSequentially(file, ms) {
            return function () {
              return setTimeoutPromise(ms).then(function () {
                let uploadUrl = DataLakeAPIService.API.GetUploadDropUrl();
                file.upload = Upload.upload({
                  url: uploadUrl,
                  method: "POST",
                  data: { file: file, data: drop },
                });
                file.upload
                  .then((response) => {
                    if (response.status == 201) {
                      $scope.dropId = $scope.record.drop_id =
                        response.data.drop_id;
                      $scope.message = "Uploaded documents successfully.";
                      $scope.isDropProcessed = true;
                      $scope.isBtnEnabled = true;
                      setImage();
                      // let deleteDrop = $scope.dropsForselectedLakeStream[0];
                      let deleteDrop = deletedMainDrop;
                      deleteDrop.uuid = $scope.moduleDetail.uuid;
                      $scope.isDeleting = true;
                      if (!deleteDrop.is_thumbnailImage) {
                        DataLakeAPIService.API.DeleteDrop(deleteDrop)
                          .then((response) => {
                            $scope.isDeleting = false;
                            $scope.isBtnEnabled = true;
                            $scope.showConfirm = false;
                            fetchDropsByUuidAndEntityId(
                              $scope.moduleDetail.uuid,
                              $scope.record.id
                            );
                            let thumbnailPresent=$scope.drops.filter((item) => {
                              item.url=null
                              return item.id == coverDrops[0].id;
                            });
                            if(thumbnailPresent.length>0){
                              DataLakeAPIService.API.DeleteDrop(thumbnailPresent[0]).then((res)=>{})
                            }
                          })
                          .catch((error) => {
                            if (error.status === 403) {
                              $scope.isDropUnauthorized = true;
                            }
                            $scope.error = error;
                          });
                      }
                      if (deleteDrop.is_thumbnailImage) {
                        deleteDrop.uuid = $scope.moduleDetail.uuid;
                        $scope.isDeleting = true;
                        deleteDrop.stream_id = 1;
                        deleteDrop.is_thumbnail = 1;
                        deleteDrop.is_thumbnailImage = 0;
                        let thumbnailPresent=$scope.drops.filter((item) => {
                          return item.id == coverDrops[0].id;
                        });
                        if(thumbnailPresent.length>0){
                          let dropp=thumbnailPresent.filter((item) => {
                            return item.stream_code!="cover_image"})
                            if(dropp.length>0){
                              DataLakeAPIService.API.DeleteDrop(dropp[0]).then((res)=>{})
                            }
                        }
                        DataLakeAPIService.API.UpdateDrop(deleteDrop)
                          .then((response) => {
                            $scope.isDeleting = false;
                            $scope.reloadList();
                            $scope.isUpload = !$scope.isUpload;
                            $scope.isDropProcessed = true;
                            // $scope.streamState[data.stream_id] = true;
                            $scope.isBtnEnabled = true;
                            $scope.details.is_thumbnail = 1;
                            setImage();
                            $scope.updateBtnText = "Update";
                          })
                          .catch((error) => {
                            if (error.status === 403) {
                              $scope.isDropUnauthorized = true;
                            }
                            $scope.isBtnEnabled = true;
                            $scope.error = error;
                            $scope.actionFail = true;
                          });
                        $timeout(() => {
                          // $scope.message = null;
                          $scope.isDeleteSuccess = false;
                        }, 3000);
                        $scope.showConfirm = false;
                        // fetchDropsByUuidAndEntityId(
                        //   $scope.moduleDetail.uuid,
                        //   $scope.record.id
                        // );
                      }
                      if (!$scope.isImage) {
                        $scope.isUpload = true;
                        $scope.isDropUploaded = false;
                        $scope.files = null;
                        $scope.errFiles = null;
                      } else {
                        $scope.isDropUploaded = true;
                        $scope.learnImageBtn = true;
                        $scope.image_data = null;
                      }
                      $scope.isShowImages = true;
                    }
                    $timeout(() => {
                      $scope.message = null;
                      $scope.actionSuccess = false;
                    }, 2500);
                    $scope.uploadBtnText = "Upload";
                  })
                  .catch((error) => {
                    $scope.isBtnEnabled = true;
                    if (error.status === 403) {
                      $scope.isDropUnauthorized = true;
                    }
                    $scope.error = "Error in drop upload.";
                    $timeout(() => {
                      $scope.message = null;
                      $scope.error = null;
                      $scope.uploadBtnText = "Upload";
                    }, 2500);
                  });
              });
            };
          }

          function uploadDrop(drop) {
            let uploadUrl = DataLakeAPIService.API.UploadDrop(drop)
              .then((response) => {
                if (response.status == 201) {
                  $scope.dropId = $scope.record.drop_id = response.data.drop_id;
                  $scope.message = "Uploaded documents successfully.";
                  $scope.isDropProcessed = true;
                  $scope.isBtnEnabled = true;
                  $scope.isDropUploaded = true;
                  $scope.isImage = false;
                  $scope.details.stream_id = null;
                  $scope.details.url = null;
                  $scope.record.thumbnail = drop.data.url;
                  setImage();
                  $scope.isDeleting = true;
                  // let deleteDrop = $scope.dropsForselectedLakeStream[0];
                  let deleteDrop = deletedMainDrop;
                  deleteDrop.uuid = $scope.moduleDetail.uuid;
                  DataLakeAPIService.API.DeleteDrop(deleteDrop)
                    .then((response) => {
                      $scope.isDeleting = false;
                      $scope.isBtnEnabled = true;
                      $scope.showConfirm = false;
                      fetchDropsByUuidAndEntityId(
                        $scope.moduleDetail.uuid,
                        $scope.record.id
                      );
                    })
                    .catch((error) => {
                      if (error.status === 403) {
                        $scope.isDropUnauthorized = true;
                      }
                      $scope.error = error;
                    });
                }
                $timeout(() => {
                  $scope.message = null;
                  $scope.actionSuccess = false;
                }, 2500);
                $scope.uploadBtnText = "Upload";
              })
              .catch((error) => {
                if (error.data.includes("ERR_INVALID_DOMAIN_NAME")) {
                  $scope.uploadBtnText = "Upload";
                  if (error.status === 403) {
                    $scope.isDropUnauthorized = true;
                  }
                  $scope.error = "URL is not a file. Error in uploading!!";
                  $timeout(() => {
                    $scope.isBtnEnabled = true;
                    $scope.uploadBtnText = "Upload";
                    $scope.error = null;
                  }, 4000);
                } else {
                  if (error.status === 403) {
                    $scope.isDropUnauthorized = true;
                  } else if (error.status === 505) {
                    $scope.message = "Uploaded documents successfully.";
                    $scope.isDropProcessed = true;
                    $scope.isBtnEnabled = true;
                    $scope.isDropUploaded = true;
                    $scope.isImage = false;
                    $scope.details.stream_id = null;
                    $scope.details.url = null;
                    $scope.record.thumbnail = drop.data.url;
                    setImage();
                    $scope.isDeleting = true;
                    // let deleteDrop = $scope.dropsForselectedLakeStream[0];
                    let deleteDrop = deletedMainDrop;
                    deleteDrop.uuid = $scope.moduleDetail.uuid;
                    DataLakeAPIService.API.DeleteDrop(deleteDrop)
                      .then((response) => {
                        $scope.isDeleting = false;
                        $scope.isBtnEnabled = true;
                        $scope.showConfirm = false;

                        $scope.isDropProcessed = true;
                        $scope.isBtnEnabled = true;
                        fetchDropsByUuidAndEntityId(
                          $scope.moduleDetail.uuid,
                          $scope.record.id
                        );
                      })
                      .catch((error) => {
                        if (error.status === 403) {
                          $scope.isDropUnauthorized = true;
                        }
                        $scope.error = error;
                      });
                  }
                  $timeout(() => {
                    $scope.message = null;
                    $scope.actionSuccess = false;
                  }, 2500);
                  $scope.uploadBtnText = "Upload";
                }
              });
          }
        } else {
          $scope.uploadFiles(details);
        }
      };

      $scope.getLakes = (uuid) => {
        if (uuid !== undefined) {
          $scope.lakes = [];
          DataLakeAPIService.API.GetLakesByUuid(uuid).then((response) => {
            $scope.lakes = response;
            if (response.length) {
              $scope.details.lake_id = response[0].lake_id;
              $scope.getStreams(response[0].lake_id);
            }
            $scope.lakes.length > 0
              ? ($scope.noLakes = false)
              : ($scope.noLakes = true);
          });
        }
      };

      $scope.setShowMetaDataPanel = (value) => {
        $scope.$showMetaDatapanel = value;
        $scope.isUpload = true;
      };

      $scope.closeThis = () => {
        $scope.$showMetaDatapanel = false;
      };

      let checkType = (type) => {
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
        $scope.showAllowMultipleMessage = false;
        $scope.files = files;
        $scope.errFiles = errFiles;
        $scope.files && $scope.files.length
          ? checkType($scope.files[0].type)
          : null;
          if ($scope.files && $scope.files.length > 0) {
            if (!$scope.isImage && ($scope.details.stream_id == 33 || $scope.details.stream_id == 1)) {
              $scope.notImage = true;
            } else {
              $scope.notImage = false;
            }
          }
          $scope.selectedLakeStream ? $scope.validateSelectedFiles(files) : null;
          if ($scope.details.stream_id && $scope.files) {
            $scope.isBtnEnabled = true;
          }
      };

      $scope.validateSelectedFiles = (files) => {
        if (
          files &&
          files.length > 1 &&
          $scope.selectedLakeStream &&
          $scope.selectedLakeStream.allow_multiple === 0
        ) {
          $scope.files = [];
          $scope.showAllowMultipleMessage = true;
          $timeout(() => {
            $scope.showAllowMultipleMessage = false;
          }, 2500);
        } else {
          $scope.files = files;
        }
      };

      $scope.goBackFunction = () => {
        $scope.isUpload = true;
        $scope.isShowImages = true;
        $scope.details.status_id = 1;
        $scope.details.regular_type = "Local";
        $scope.details.url = null;
        $scope.details.is_thumbnail = 1;
        $scope.isDropUploaded = false;
        $scope.showConfirm = false;
        $scope.isImage = false;
        $scope.files = null;
        $scope.errFiles = null;
        $timeout(() => {
          $scope.details.stream_id = undefined;
          angular.element("#stream_id").focus();
        }, 0);
      };

      $scope.focusShowmetaData = () => {
        $scope.goBackFunction();
        $timeout(() => {
          angular.element("#meta_data").focus();
        }, 1000);
      };

      $scope.resetForm = () => {
        $scope.files = null;
        $scope.errFiles = null;
        $scope.isImage = false;
        $scope.showCantMetaGen = false;
        $scope.showConfirm = false;
        $scope.details.url = null;
        $scope.notImage = false;
        $scope.notImageUrl=false
      $scope.invalidUrl = false;
        if ($scope.drop) {
          $scope.drop.url = null;
        }
        if ($scope.link) {
          $scope.link = null;
        }
      };

      $scope.markItTrue = () => {
        $scope.showCantMetaGen = false;
      };

      $scope.changeStream = () => {
        if ($scope.details.regular_type == "camera") {
          $scope.details.regular_type = "Local";
        }
      };

      $scope.gotoUploadForm = () => {
        $scope.isImage = false;
        $scope.showConfirm = false;
        $scope.files = null;
        $scope.errFiles = null;
        $scope.details.url = "";
        $scope.details.stream_id = null;
        $scope.details.status_id = 1;
        $scope.details.regular_type = "Local";
        $scope.showConfirmDeletion = false;
        $scope.showConfirmThumbnailDeletion = false;
      };

      $scope.uploadFiles = (details) => {
        $scope.thumbnailActive = false;
        let drop = {
          lake_id: details.lake_id,
          status_id: details.status_id,
          type: details.type,
          uuid: $scope.moduleDetail.uuid,
          stream_id: details.stream_id,
          instance_id: $scope.record.id,
          is_save_to_document_store: undefined,
          is_thumbnail: details.is_thumbnail,
          display_sequence: details.display_sequence,
          duplicate: details.duplicate,
          source: "local",
          url: undefined,
        };
        // if (!details.url) {
        drop.size = $scope.files[0].size;
        drop.kind = $scope.files[0].type;
        drop.files = $scope.files;
        // } else if (details.url) {
        //   drop.url = details.url;
        // }
        if(details.regular_type==="URL" && details.url){
          drop.url=details.url
        }
        function setTimeoutPromise(ms) {
          let defer = $q.defer();
          setTimeout(defer.resolve, ms);
          return defer.promise;
        }
        $scope.isBtnEnabled = false;
        $scope.uploadBtnText = "Uploading...";

        //if (!details.url) {
        let chain = $q.when();
        angular.forEach($scope.files, function (file, index) {
          chain = chain.then(
            uplodFileSequentially(file, ($scope.files.length - index) * 1000)
          );
        });
        chain.then(function () {
          fetchDropsByUuidAndEntityId(
            $scope.moduleDetail.uuid,
            $scope.record.id
          );
        });
        // } else {
        //   uploadDrop({ data: drop });
        // }
        function uplodFileSequentially(file, ms) {
          return function () {
            return setTimeoutPromise(ms).then(function () {
              let uploadUrl = DataLakeAPIService.API.GetUploadDropUrl();
              file.upload = Upload.upload({
                url: uploadUrl,
                method: "POST",
                data: { file: file, data: drop },
              });
              file.upload
                .then((response) => {
                  if (response.status == 201) {
                    $scope.dropId = $scope.record.drop_id =
                      response.data.drop_id;
                    // $scope.message = "Uploaded documents successfully.";
                    $scope.isSaveSuccess = true;
                    $scope.isDropProcessed = true;
                    $scope.isBtnEnabled = true;
                    setImage();
                    $scope.reloadList();
                    if (!$scope.isImage) {
                      $scope.isUpload = true;
                      $scope.isDropUploaded = false;
                      $scope.files = null;
                      $scope.errFiles = null;
                    } else {
                      $scope.isDropUploaded = true;
                      $scope.learnImageBtn = true;
                      $scope.image_data = null;
                    }
                    $scope.isShowImages = true;
                  }
                  $timeout(() => {
                    // $scope.message = null;
                    $scope.isSaveSuccess = false;
                    $scope.actionSuccess = false;
                  }, 2500);
                  $scope.uploadBtnText = "Upload";
                })
                .catch((error) => {
                  $scope.isBtnEnabled = true;
                  if (error.status === 403) {
                    $scope.isDropUnauthorized = true;
                  }
                  $scope.error = "Error in drop upload.";
                  $timeout(() => {
                    $scope.message = null;
                    $scope.error = null;
                    $scope.uploadBtnText = "Upload";
                  }, 2500);
                });
            });
          };
        }
        function uploadDrop(drop) {
          let uploadUrl = DataLakeAPIService.API.UploadDrop(drop)
            .then((response) => {
              if (response.status == 201) {
                $scope.dropId = $scope.record.drop_id = response.data.drop_id;
                // if the file saved to document store, then shows successful message
                if (response.data.message) {
                  $scope.message = "Uploaded documents successfully.";
                } else {
                  // showing the message, could not save the file locally
                  $scope.message = response.data;
                }
                $scope.isDropProcessed = true;
                $scope.isBtnEnabled = true;
                $scope.isDropUploaded = true;
                $scope.isImage = false;
                $scope.details.stream_id = null;
                $scope.details.url = null;
                $scope.record.thumbnail = drop.data.url;
                setImage();
                $scope.reloadList();
              }
              $timeout(() => {
                $scope.message = null;
                $scope.actionSuccess = false;
              }, 3500);
              $scope.uploadBtnText = "Upload";
            })
            .catch((error) => {
              if (error.data.includes("ERR_INVALID_DOMAIN_NAME")) {
                $scope.uploadBtnText = "Upload";
                if (error.status === 403) {
                  $scope.isDropUnauthorized = true;
                }
                $scope.error = "URL is not a file. Error in uploading!!";
                $timeout(() => {
                  $scope.isBtnEnabled = true;
                  $scope.uploadBtnText = "Upload";
                  $scope.error = null;
                }, 4000);
              } else {
                if (error.status === 403) {
                  $scope.isDropUnauthorized = true;
                }
                $scope.error = error.data;
                $timeout(() => {
                  $scope.isBtnEnabled = true;
                  $scope.uploadBtnText = "Upload";
                  $scope.error = null;
                }, 4000);
              }
            });
        }
      };

      //Get the contect type of the virtual URL entered
      $scope.isUrlContainsFiles = (url) => {
        if (url) {
          $http({ method: "GET", url: url }).success(
            (data, status, headers, config) => {
              var contentType = headers("Content-Type");
              // use the content-type here
            }
          );
        }
      };
      $scope.link = null;
      $scope.snapCk = () => {
        let cvs = document.querySelector("#canvas");
        let ctx = cvs.getContext("2d");
        cvs.width = 640; // set its size to the one of the video
        cvs.height = 480;
        ctx.drawImage($scope.dvideo, 0, 0, 640, 480);
        // $scope.link = cvs.toDataURL('image/jpeg');
        return new Promise((res, rej) => {
          cvs.toBlob(res, "image/jpeg"); // request a Blob from the canvas
        });
      };

      $scope.validateUrl=(u)=>{
        $scope.invalidUrl = false;
        if(u){
          try {
              new URL(u);
              $scope.invalidUrl = false;
          } catch (e) {
              $scope.invalidUrl = true; 
              $scope.notImageUrl=false
              return; // Exit early if URL is invalid
          }
          if(!$scope.invalidUrl){
            $http({
              method: 'HEAD',
              url: u
            }).then(function(response) {
                // Get the content type from the response headers
                var contentType = response.headers('Content-Type');
                checkType(contentType)
                if (!$scope.isImage && ($scope.details.stream_id ==1 || $scope.details.stream_id == 33)) {
                  $scope.notImageUrl=true
                }  else {
                  $scope.notImageUrl=false
                }
            }).catch(function(error) {
              const fileExtension = u.split('.').pop().toLowerCase();
              const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp','svg',"octet-stream"];
        
              if (imageTypes.includes(fileExtension)) {
                $scope.notImageUrl=false
              } else {
                if(!$scope.invalidUrl && u && u.trim() !== "" && ($scope.details.stream_id ==1 || $scope.details.stream_id == 33)){
                  $scope.notImageUrl=true
                }else{
                  $scope.notImageUrl=false
                }
              }
            });
          }
        }else{
          $scope.notImageUrl=false
        }
      }

      $scope.onClickDocSnap = () => {
        $scope.snapCk().then((data) => {
          let imageName = "IMG" + Date.now() + ".JPG";
          data.name = imageName;
          $scope.link = URL.createObjectURL(data);
          data.lastModified = new Date();
          const myFile = new File([data], imageName, {
            type: data.type,
          });
          $scope.files = [myFile];
          $scope.files && $scope.files.length
            ? checkType($scope.files[0].type)
            : null;
          $scope.clickedSnap = true;
          $scope.closeDocCam();
          $scope.focusDownloadField();
          $scope.isUpload = false;
          $scope.isDropUploaded = false;
          $scope.showAllowMultipleMessage = false;
          if (!$scope.isImage && ($scope.details.stream_id == 33 || $scope.details.stream_id == 1)) {
            $scope.notImage = true;
          } else {
            $scope.notImage = false;
          }
          // $scope.selectedLakeStream ? $scope.validateSelectedFiles(myFile) : null;
        });
      };

      $scope.clickedSnap = false;
      $scope.dvideo = null;
      $scope.startDocCam = () => {
        $scope.clickedSnap = false;
        $scope.files = [];
        $scope.link = null;
        $scope.dvideo = document.querySelector("#docvideo");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" } })
            .then((stream) => {
              $scope.dvideo.srcObject = stream;
              $scope.dvideo.play();
            });
        }
      };

      $scope.closeDocCam = () => {
        $scope.stopStreamedVideo($scope.dvideo);
      };

      $scope.stopStreamedVideo = (videoElem) => {
        const stream = videoElem.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(function (track) {
          track.stop();
        });
        videoElem.srcObject = null;
      };

      $scope.getDownloadUrl = (url, dropType, downloadUrl) => {
        if (!downloadUrl) {
          return DataLakeAPIService.API.GetDownloadUrl(
            url,
            $scope.moduleDetail.uuid
          );
        } else {
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
          if (
            lastFive &&
            lastFive != ".jpg" &&
            lastFive != ".png" &&
            lastFive != "webp" &&
            lastFive != "jpeg" &&
            drop.kind.includes("image")
          ) {
            file_name = file_name + ".jpg";
          }
        }
        DataLakeAPIService.API.DownloadDrop(file, $scope.moduleDetail.uuid)
          .success((data, status, headers) => {
            headers = headers();
            let contentType = headers["content-type"];
            let linkElement = document.createElement("a");
            try {
              console.log(window.URL || window.webkitURL);
              let blob = new Blob([data], { type: contentType });
              let url = (window.URL || window.webkitURL).createObjectURL(blob);
              linkElement.setAttribute("href", url);
              linkElement.setAttribute("download", file_name);
              let clickEvent = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: false,
              });
              linkElement.dispatchEvent(clickEvent);
            } catch (exception) {
              logger.error(exception);
            }
          })
          .error((error) => {
            if (error) {
              if (error || (error && error.status === 403)) {
                $scope.isDropUnauthorized = true;
              }
              logger.error(error);
            }
          });
      };

      $scope.saveJSON = function () {
        $scope.toJSON = "";
        $scope.toJSON = angular.toJson($scope.data);
        var blob = new Blob([$scope.toJSON], {
          type: "application/json;charset=utf-8;",
        });
        var downloadLink = angular.element("<a></a>");
        downloadLink.attr("href", window.URL.createObjectURL(blob));
        downloadLink.attr("download", "fileName.json");
        downloadLink[0].click();
      };

      $scope.statusList = [
        { id: 1, label: "Active", isDefault: 1 },
        { id: 0, label: "Inactive", isDefault: 0 },
      ];

      // To delete drop
      $scope.removeDrop = (drop, flag) => {
        $scope.isDeleting = true;
        drop.uuid = $scope.moduleDetail.uuid;
        DataLakeAPIService.API.DeleteDrop(drop)
          .then((response) => {
            $scope.isDropProcessed = true;
            $scope.isDeleting = false;
            flag !== 1 ? $scope.reloadList() : null; // after delete new sequence should be loaded
            $scope.files = {};
            $scope.files[0] = "";
            $scope.files[0].name = "";
            $scope.files[0].type = "";
            $scope.errFiles = null;
            $scope.isUpload = true;
            $scope.isDropUploaded = false;
            $scope.details.is_thumbnail = 1;
            $scope.details.is_save_to_document_store = true;
            $scope.gotoUploadForm();
            setImage();
            if (
              Number(drop.uuid) === 44 &&
              drop.stream_code.toLowerCase() === "cover_image"
            ) {
              // if sku cover image deleted then assign item's cover image to sku
              $scope.loadImage(
                $scope.record,
                "165x165",
                $scope.record.item_id,
                4
              );
            }
            if (!flag) {
              // $scope.message = "Deleted drop successfully";
              $scope.isDeleteSuccess = true;
            }
            $timeout(() => {
              // $scope.message = null;
              $scope.isDeleteSuccess = false;
              angular.element("#stream_id").focus();
            }, 2000);
          })
          .catch((error) => {
            if (error.status === 403) {
              $scope.isDropUnauthorized = true;
            }
            $scope.error = error;
          });
        $timeout(() => {
          $scope.showConfirmDeletion = false;
          $scope.showConfirmThumbnailDeletion = false;
          $scope.message = null;
          $scope.actionSuccess = false;
          $scope.actionFail = false;
          angular.element("#stream_id").focus();
        }, 2500);
      };

      $scope.confirmRemoveThumbnailDrop = (drop, flag) => {
        let deletingThumbnailDrops = $scope.drops.filter((item) => {
          return (
            item.stream?.toLowerCase() === "thumbnail" &&
            item.instance_id == drop.instance_id
          );
        });
        let thumbnailCoverDrops = [];
        if (deletingThumbnailDrops && deletingThumbnailDrops.length > 0) {
          thumbnailCoverDrops = deletingThumbnailDrops[0];
        }
        // if stream is cover image
        if (
          drop.stream?.toLowerCase() === "thumbnail" &&
          drop.is_thumbnailImage
        ) {
          $scope.showConfirmThumbnailDeletion = true;
        } else if (
          drop.stream?.toLowerCase() === "cover image" &&
          drop.is_thumbnailImage
        ) {
          // $scope.message = "Deleted drop successfully.";
          let thumbnailPresent=$scope.drops.filter((item) => {
            return item.drop_id == drop.drop_id && item.stream_code =="thumbnail";
          });
          if(thumbnailPresent.length>0){
            DataLakeAPIService.API.DeleteDrop(thumbnailPresent[0]).then((res)=>{})
          }
          $scope.isDeleteSuccess = true;
          let object = {
            drop_id: drop.drop_id,
            instance_id: drop.instance_id,
            is_thumbnail: 0,
            is_thumbnailImage: 0,
          };
          drop.uuid = $scope.moduleDetail.uuid;
          $scope.isDeleting = true;
          drop.uuid = $scope.moduleDetail.uu_id;
          drop.stream_id = 1;
          drop.is_thumbnail = 1;
          drop.is_thumbnailImage = 0;
          DataLakeAPIService.API.UpdateDrop(drop)
            .then((response) => {
              $scope.isDeleting = false;
              $scope.reloadList();
              $scope.isUpload = !$scope.isUpload;
              $scope.isDropProcessed = true;
              // $scope.streamState[data.stream_id] = true;
              $scope.isBtnEnabled = true;
              $scope.details.is_thumbnail = 1;
              setImage();
              $scope.updateBtnText = "Update";
            })
            .catch((error) => {
              if (error.status === 403) {
                $scope.isDropUnauthorized = true;
              }
              $scope.isBtnEnabled = true;
              $scope.error = error;
              $scope.actionFail = true;
            });
          $timeout(() => {
            // $scope.message = null;
            $scope.isDeleteSuccess = false;
          }, 3000);
        } else {
          $scope.removeDrop(drop);
        }
      };

      // function to delete drop
      $scope.confirmRemoveDrop = (drop, flag) => {
        $scope.thumbnailActive = false;
        $scope.conditionForEmpty = false;
        $scope.numberCannotExeed = false;
        $scope.oneSequence = false;
        $scope.showConfirmDeletion = false;
        $scope.showConfirmThumbnailDeletion = false;
        if (drop.is_thumbnailImage) {
          $scope.confirmRemoveThumbnailDrop(drop);
        } else {
          // if stream is cover image
          if (
            drop.stream?.toLowerCase() === "cover image" &&
            drop.is_thumbnail
          ) {
            // show a confirmation panel to ask the permission to delete thumbnail also.
            $scope.showConfirmDeletion = true;
          } else if (
            drop.stream?.toLowerCase() === "thumbnail" &&
            drop.is_coverImage
          ) {
            // $scope.message = "Deleted drop successfully.";
            $scope.isDeleteSuccess = true;
            let object = {
              drop_id: drop.drop_id,
              instance_id: drop.instace_id,
              is_thumbnail: 0,
            };
            DataLakeAPIService.API.UpdateDetails(object)
              .then((response) => {
                $scope.reloadList();
                $scope.isUpload = !$scope.isUpload;
                $scope.isDropProcessed = true;
                $scope.streamState[drop.stream_id] = true;
                $scope.isBtnEnabled = true;
                $scope.details.is_thumbnail = 1;
                setImage();
                $scope.updateBtnText = "Update";
              })
              .catch((error) => {
                if (error.status === 403) {
                  $scope.isDropUnauthorized = true;
                }
                $scope.isBtnEnabled = true;
                $scope.error = error;
                $scope.actionFail = true;
              });
            $timeout(() => {
              // $scope.message = null;
              $scope.isDeleteSuccess = false;
            }, 3000);
          } else {
            $scope.removeDrop(drop);
          }
        }
        $timeout(() => {
          $scope.details.stream_id = null;
        }, 3500);
      };

      $scope.showUploadSection = (boolValue) => {
        $scope.isUpload = boolValue;
      };

      $scope.reloadList = () => {
        fetchDropsByUuidAndEntityId($scope.moduleDetail.uuid, $scope.record.id);
      };

      let getExtension = (filename) => {
        return filename.split(".").pop();
      };

      $scope.toggleDrops = (obj) => {
        $scope.streamState[obj.stream_id] = !$scope.streamState[obj.stream_id];
        $scope.showConfirmDeletion = false;
        $scope.showConfirmThumbnailDeletion = false;
      };
      let labelMap = {};
      let labelMapKeys = [];

      $scope.focusDownloadField = () => {
        $timeout(() => {
          angular.element("#doc_download").focus();
        }, 500);
      };

      $scope.updatecheckbox = (data) => {
        if (data.checked) {
          labelMap[data.description] = data.score;
          let tag_property = {
            description: data.description,
            confidence: data.score * 100,
          };
          tag_property.confidence = tag_property.confidence.toFixed(2);
          tag_property.confidence = parseFloat(tag_property.confidence);
          DataLakeAPIService.API.PromoteTag(
            $scope.moduleDetail.uuid,
            $scope.record.id,
            tag_property
          )
            .then((response) => {
              data.tagId = response.data.id;
            })
            .catch((error) => {
              logger.error(error);
            });
        } else {
          DataLakeAPIService.API.RemoveTag(
            $scope.moduleDetail.uuid,
            $scope.record.id,
            data.tagId
          )
            .then(function (response) {
              delete data.tagId;
            })
            .catch((error) => {
              logger.error(error);
            });
          delete labelMap[data.description];
        }
      };

      $scope.showColor = (c) => {
        $scope.cinfo = c;
        $scope.cinfo.hexColor = rgb2Hex(
          c.color.red,
          c.color.green,
          c.color.blue
        );
      };

      $scope.learnImage = () => {
        $scope.learnImageBtn = false;
        DataLakeAPIService.API.LearnImageProperties($scope.dropId)
          .then((res) => {
            $scope.learnImageBtn = true;
            $scope.image_data = res.data;
          })
          .catch((err) => {});
      };
      let tagOrAttr = null;
      let addToSet = () => {
        tagOrAttr = {
          uuid: $scope.moduleDetail.uuid,
          instance_id: $scope.record.id,
          tags: [],
        };
        for (let i = 0; i < labelMapKeys.length; i++) {
          tagOrAttr.tags.push({
            tag: labelMapKeys[i],
            score: labelMap[labelMapKeys[i]],
          });
        }
      };
      $scope.promoteTag = () => {
        addToSet();
      };
      $scope.promoteAttribute = () => {
        addToSet();
      };

      $scope.addToDocumentStore = (drop) => {
        $scope.removeDrop(drop, 1, true);
        DataLakeAPIService.API.UploadDrop({ data: drop })
          .then((response) => {
            if (response.status == 201) {
              $scope.dropId = $scope.record.drop_id = response.data.drop_id;
              // if the file saved to document store, then shows successful message
              if (response.data.message) {
                $scope.message = "Uploaded documents successfully.";
              } else {
                // showing the message, could not save the file locally
                $scope.message = response.data;
              }
              $scope.isDropProcessed = true;
              $scope.isBtnEnabled = true;
              $scope.isDropUploaded = true;
              $scope.isImage = false;
              $scope.details.stream_id = null;
              $scope.details.url = null;
              $scope.record.thumbnail = drop.url;
              setImage();
              $scope.reloadList();
            }
            $timeout(() => {
              $scope.message = null;
              $scope.actionSuccess = false;
            }, 3500);
            $scope.uploadBtnText = "Upload";
          })
          .catch((error) => {
            if (error.data && error.data.includes("ERR_INVALID_DOMAIN_NAME")) {
              $scope.uploadBtnText = "Upload";
              if (error.status === 403) {
                $scope.isDropUnauthorized = true;
              }
              $scope.error = "URL is not a file. Error in uploading!!";
              $timeout(() => {
                $scope.isBtnEnabled = true;
                $scope.error = null;
              }, 4000);
            } else {
              $scope.isBtnEnabled = true;
              if (error.status === 403) {
                $scope.isDropUnauthorized = true;
              }
              $scope.message = "Saved URL to local store successfully.";
              $timeout(() => {
                $scope.isBtnEnabled = true;
                $scope.message = null;
              }, 4000);
            }
          });
      };

      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }

      function rgb2Hex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }
    },
  };
});
