(function () {
  "user strict";
  angular
    .module("rc.prime.corporatecontrol")
    .controller("CorporateControlController", CorporateControlController);
  CorporateControlController.$inject = [
    "$scope",
    "CorporateControlService",
    "common",
    "EntityService",
    "DataLakeService"
  ];

  function CorporateControlController(
    $scope,
    CorporateControlService,
    common,
    EntityService,
    DataLakeService
  ) {
    let vm = this;
    vm.isLoaded = false;
    vm.isShowAdd = false;
    vm.isShowDetails = false;
    vm.order_text = {};
    vm.sortType = "description";
    vm.currentPage = 1;
    vm.pageSize = 100;
    vm.isColumnSettingsVisible = false;
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.showDependencyDetails = false;
    vm.showErrorDetails = false;
    vm.CorporateConfig_details = {};
    vm.oldCorporateConfig = {};
    vm.entityInformation = {};
    vm.imagear = [];
    vm.videoar = [];
    // Unique Identification number
    vm.uuid = "135";

    $scope.date_format = "DD-MM-YYYY";
    /** Common Modules */
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("CorporateControlController");
    let EntityDetails = common.EntityDetails;

    vm.initializeCorporateConfig = function () {
      vm.getEntityInformation();
      $scope.getAccessPermissions(vm.uuid); // Fetch the view/create/update/delete permission by user
      vm.reload(undefined);
      vm.getModelAndSetValidationRules();
    };

    // to get required information of order help text entity
    vm.getEntityInformation = function () {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        ordertext_information => {
          vm.entityInformation = ordertext_information;
          $scope.name = vm.entityInformation.name;
        }
      );
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(model => {
        //vm.getDynamicColumns(model);
      });
    };

    //Focus
    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    };

    // fuction to close the dependency panel
    vm.closeDependencyList = () => {
      $timeout(function () {
        angular.element("#title").focus();
      }, 500);
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
    }


    /* fetch all order help text */
    vm.reload = function (refresh) {
      vm.isLoaded = true;
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      CorporateControlService.API.GetCorporateConfigList()
        .then(response => {
          vm.rowsCount = response.length;
          vm.CorporateConfigList = response;
          vm.isLoaded = false;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    /* save new order help text */
    vm.save = function (payload) {
      vm.saveBtnText = "Saving now...";
      // CorporateControlService.API.InsertCorporateConfig(payload)
      //   .then(response => {
      //     vm.CorporateConfig_details = payload;
      //     vm.saveBtnText = "Save";
      //     vm.isSaveSuccess = true;
      //     payload.id = response.data.id;
      //     vm.CorporateConfigList.push(payload);
      //     vm.rowsCount++;
      //     vm.updateTableInformation(1);
      //   })
      //   .catch(error => {
      //     vm.saveBtnText = "Oops.!! Something went wrong";
      //     vm.saveBtnError = true;
      //     vm.error = true;
      //     vm.message = error.data.message;
      //     $timeout(function () {
      //       vm.message = null;
      //       vm.saveBtnText = "Save";
      //       vm.saveBtnError = false;
      //     }, 2500);
      //   });
    };

    /* fetch all order help text */
    vm.reload = function (refresh) {
      vm.isLoaded = true;
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      CorporateControlService.API.GetCorporateConfigList()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.CorporateConfigList = response.data;
          vm.isLoaded = false;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    toBase64 = (arr) => {
      //arr = new Uint8Array(arr) if it's an ArrayBuffer
      return btoa(
        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
    }


    /* save new order help text */
    vm.save = function (payload) {
      vm.saveBtnText = "Saving now...";
      vm.isSaving = true;
      payload.effective_date = payload.effectiveDate;
      payload.end_date = payload.endDate;
      payload.auto_play = payload.file_auto_play;
      CorporateControlService.API.InsertCorporateConfig(payload)
        .then(response => {
          vm.CorporateConfig_details = payload;
          if (!payload.files) {
            vm.isSaving = false;
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            payload.id = response.data.inserted_id;
            vm.CorporateConfigList.push(payload);
            vm.rowsCount++;
            vm.reload();
          }
          if (payload.files) {
            var obj = {};
            obj.files = payload.files;
            obj.id = response.data.inserted_id;
            DataLakeService.UploadCorporateDrop(obj)
              .then((res) => {
                vm.isSaving = false;
                vm.saveBtnText = "Save";
                vm.isSaveSuccess = true;
                payload.id = response.data.inserted_id;
                vm.CorporateConfigList.push(payload);
                vm.rowsCount++;
                vm.reload();
              })
          }
        })
        .catch(error => {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.isSaving = false;
          vm.message = error.data.message;
          $timeout(function () {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    // check that update form previous data is not same as payload
    vm.hasUpdateChanges = function (payload) {
      if (
        vm.oldCorporateConfig.id !== payload.id ||
        vm.oldCorporateConfig.description !== payload.description ||
        vm.oldCorporateConfig.title !== payload.title ||
        vm.oldCorporateConfig.files !== payload.files ||
        vm.oldCorporateConfig.effectiveDate !== payload.effectiveDate ||
        vm.oldCorporateConfig.endDate !== payload.endDate
         || vm.oldCorporateConfig.auto_play !== payload.auto_play
      ) {
        return true;
      } else {
        return false;
      }
    };
    // delete order help text
    vm.delete = function (payload) {
      CorporateControlService.API.DeleteCorporateConfig(payload)
        .then(() => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.reload();
        })
        .catch(() => {
          vm.error = true;
          vm.showErrorDetails = true;
          vm.showDependencyDetails = true;
        });
    };

    // update order help text
    vm.update = function (payload, take_file_play) {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        vm.isupdating = true;
        if (take_file_play || this.addFileOne) {
          payload.auto_play = payload.file_auto_play
        } 
        payload.effective_date = payload.effectiveDate;
        payload.end_date = payload.endDate;
        CorporateControlService.API.UpdateCorporateConfig(payload)
          .then(() => {
            if (!payload.files) {
              vm.isupdating = false;
              payload.$edit = false;
              vm.reload();
              vm.isShowHistory = false;
              vm.updateBtnText = "Done";
              vm.isUpdateSuccess = true;
              vm.oldCorporateConfig = null;
            }
            if (payload.files) {
              var obj = {};
              obj.files = payload.files;
              obj.id = payload.id;
              DataLakeService.UploadCorporateDrop(obj)
                .then((res) => {
                  vm.isupdating = false;
                  $scope.showConfirm = false;
                  payload.$edit = false;
                  vm.reload();
                  vm.isShowHistory = false;
                  vm.updateBtnText = "Done";
                  vm.isUpdateSuccess = true;
                  vm.oldCorporateConfig = null;
                })
            }
          })
          .catch(error => {
            vm.error = true;
            vm.isupdating = false;
            vm.message = error.data.message;
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function () {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function () {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    // delete order help text
    vm.delete = function (payload) {
      CorporateControlService.API.DeleteCorporateConfig(payload)
        .then(() => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.reload();
        })
        .catch((error) => {
          vm.error = true;
          vm.showErrorDetails = true;
          if (error.data && error.data.Data && error.data.Data.length > 0) {
            vm.dependentSkus = error.data.Data;
          }
        });
    };

    $scope.cancelConfirm = () => {
      $scope.showConfirm = false;
      vm.imagear = [];
      vm.new_fileName = null;
      vm.invalid_file = false;
      vm.CorporateConfig_details.files = undefined;
      vm.CorporateConfig_details.file_type = vm.file_type;
      vm.CorporateConfig_details.file_size = vm.file_size;
      vm.CorporateConfig_details.file_name = vm.file_name;
    }

    $scope.removeFileAndUploadNew = (drop) => {
      $scope.confirmRemoveDrop(drop, true)
        .then(() => {
          vm.initial_config = true;
          if (drop.files) {
            $scope.showConfirm = false;
            vm.update(drop, true);
          }
        })
    }

    // Read Image
    vm.readURL = (input) => {
      $scope.cancelConfirm();
      $scope.invalid_size = false;
      if (vm.file_name && input[0] && input[0].size <= 65000000) {
        $scope.showConfirm = true;
      } 
      if (!vm.file_name && input[0] && input[0].size <= 65000000) {
        this.CorporateConfig_details.auto_play = false;
        this.addFileOne = true;
      }
      if (input[0] && input[0].size > 65000000) {
        $scope.invalid_size = true;
      }
      if (input && input[0] && input[0].size <= 65000000) {
        vm.invalid_file = false;
        vm.CorporateConfig_details.files = input;
        vm.CorporateConfig_details.file_type = input[0].type;
        vm.CorporateConfig_details.file_size = input[0].size;
        vm.CorporateConfig_details.file_name = input[0].name;
        vm.CorporateConfig_details.file_auto_play = false;
        vm.new_fileName = input[0].name;
        if (input[0].type.includes('image')) {
          vm.imagear = input;
        }
        else if (input[0].type.includes('video')) {
          vm.videoar = input;
        }
        else {
          vm.invalid_file = true;
          $scope.showConfirm = false;
          $timeout(() => {
            $scope.cancelConfirm();
          }, 5000);
        }
        vm.view_file = true;
      }
    }
    // Show confirmation page on click of delete button
    vm.showconfirm = function () {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      // vm.isUnauthorized = false;
    };

    // set grid properties in order help text table
    vm.setGridProperties = () => {
      vm.ordertextlistGrid = {
        columns: {
          id: {
            visible: false
          },
          title: {
            visible: true
          },
          description: {
            visible: true
          },
          effective_date: {
            visible: true
          },
          end_date: {
            visible: true
          }
        }
      };
    };

    vm.updateTableInformation = currentPage => {
      let initalCount;
      if (vm.rowsCount === 0) {
        initalCount = 0;
      } else {
        initalCount = 1;
      }
      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying " +
          initalCount +
          "-" +
          (vm.rowsCount < vm.pageSize ? vm.rowsCount : vm.pageSize) +
          " Of " +
          vm.rowsCount +
          " Records";
      } else {
        var start =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          1;
        var end =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsInfo =
          "Displaying " +
          start +
          " -" +
          (end < vm.rowsCount ? end : vm.rowsCount) +
          " Of " +
          vm.rowsCount +
          " Records";
      }
    };

    vm.limitTextareaLine = () => {
      var maxLines = 24;
      /*
      This function handles two aspects:
      1. (a) READ VALUE from the textarea, (b) DETECT IF TEXT PER LINE IS TOO LONG  as required by the length restrictions, (c) PUSH OVERFLOWING TEXT from a line to the next line and (d) WRITE VALUE back to the textarea.
      2. (a) READ THE CURSOR POSITION to store the cursor position, and (b) POSITION THE CURSOR where a user would expect it after WRITE DATA.
      */
      var textInput = vm.CorporateConfig_details.description;//1a: READ VALUE
      if (textInput) {
        var inputAsRows = textInput.split("\n");// create array from input => each element contains one row of the textarea
        var inputAsOneLine = textInput.replace(/(\r\n\t|\n|\r\t)/gm, "");//remove all line-breaks
        var cursorPositionOnInput = document.getElementById("description").selectionStart;//2a: READ CURSOR POSITION
        var cursorOffsetAfterOutput = 0;//set default value for cursor offset. cursor offset is needed when re-posiotioning the cursor after WRITE DATA

        var visibleCharactersPerLine = Math.floor((document.getElementById("description").offsetWidth) / 9);//number of visible characters per line before text breaks without a line-break. Depends on width of textarea and width of characters entered.
        var additionalTextAreaRows = 0; //additional rows needed due to the text breaking

        var totalRows = inputAsRows.length; //don't put inputAsRows.length in the for statement, as the array is growing in the loop which results in an infinite loop
        var row;
        for (row = 0; row < totalRows; ++row) {
          if (inputAsRows[row].length > charactersPerLine) { //1b DETECT IF TEXT PER LINE IS TOO LONG 
            if (inputAsRows[row + 1] === undefined) {
              inputAsRows[row + 1] = "";// the row did not exist
              totalRows++;
            }
            //1c PUSH OVERFLOWING TEXT: move text that is too long for this row to the next row:
            inputAsRows[row + 1] = inputAsRows[row].substring(charactersPerLine) + inputAsRows[row + 1];
            inputAsRows[row] = inputAsRows[row].substring(0, charactersPerLine);
            //determine, if cursor was at the end of the line that got a line-break:
            var newOutput = inputAsRows.join("\n");
            if (newOutput.substr(cursorPositionOnInput - 1, 1) == "\n") {
              cursorOffsetAfterOutput = 1;
            }
          }
          if (inputAsRows[row].length > visibleCharactersPerLine) { //1b DETECT IF TEXT PER LINE IS TOO LONG 
            additionalTextAreaRows = additionalTextAreaRows + Math.floor(inputAsRows[row].length / visibleCharactersPerLine);
          }

        }

        if (inputAsRows.length <= maxLines && inputAsOneLine.length <= (maxLines * charactersPerLine)) {//data is within max number of rows and max total digits
          textOutput = inputAsRows.join("\n");
          $('#errMsg').text('');  //remove error message
        }
        else //data would be too long 
        {
          $('#errMsg').text('Vendor Item Description can take upto 24 lines!')
          cursorOffsetAfterOutput = -1;
        }
        vm.CorporateConfig_details.description = textOutput;//1d: WRITE VALUE
      }
      // document.getElementById("description").selectionStart = cursorPositionOnInput + cursorOffsetAfterOutput; //2b: POSITION CURSOR
      // document.getElementById("description").selectionEnd = cursorPositionOnInput + cursorOffsetAfterOutput; //set a single cursor, not a selection
    }


    vm.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function (orderHelpData) {
      vm.CorporateConfig_details = {};
      vm.isShowAdd = false;
      vm.ValidationError = null;
      vm.invalid_file = false;
      $scope.invalid_size = false;
      vm.Existingerror = null;
      vm.new_fileName = null;
      vm.file_name = null;
      vm.file_size = null;
      vm.file_type = null;
      vm.imagear = [];
      vm.videoar = [];
      $scope.showConfirm = false;
      this.addFileOne = false;
      vm.showDetailsByID(orderHelpData);
      vm.setInitialState();
      if (orderHelpData.file_name) {
        var obj = {};
        vm.view_file = false;
        obj.name = orderHelpData.file_name;
        if (orderHelpData.file_type.includes('image')) {
          if (vm.imagear.length == 0) vm.imagear.push(obj);
        }
        else if (orderHelpData.file_type.includes('video')) {
          if (vm.videoar.length == 0) vm.videoar.push(obj);
        }
        else {
          vm.invalid_file = true;
        }
        vm.file_name = orderHelpData.file_name;
        vm.file_type = orderHelpData.file_type;
        vm.file_size = orderHelpData.file_size;
      }
    };

    $scope.downloadFile = (file, fileName, fileType) => {
      let file_name = fileName;
      if (file_name.length > 4) {
        var lastFive = file_name.substr(file_name.length - 4);
        if (lastFive) {
          lastFive = lastFive.toLowerCase();
        }
        if (lastFive && lastFive != '.jpg' && lastFive != '.png' && lastFive != 'webp' && lastFive != 'jpeg' && (fileType && fileType.includes('image'))) {
          file_name = file_name + '.jpg'
        }
      }
      DataLakeService.DownloadCorporateDrop(vm.uuid, file, file_name)
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
              cancelable: false
            });
            // linkElement.dispatchEvent(clickEvent);
          } catch (exception) {
            logger.error(exception);
          }
        })
        .error(error => {
          if (error) {
            if (error || (error && error.status === 403)) {
              $scope.isDropUnauthorized = true;
            }
            logger.error(error);
          }
        });
    };

    $scope.confirmRemoveDrop = (drop, dont) => {
      return new Promise((resolve, reject) => {
        vm.isDeleting = true;
        drop.uuid = vm.uuid;
        vm.showSuccessMessage = "Deleting drop in progress";
        DataLakeService.DeleteCorporateDrop(drop)
          .then((res) => {
            if (!dont) {
              vm.CorporateConfig_details.file_type = null;
              vm.CorporateConfig_details.file_size = null;
              vm.CorporateConfig_details.file_name = null;
              CorporateControlService.API.UpdateCorporateConfig(vm.CorporateConfig_details).then(() => {	
                vm.dropToDelete = undefined;
                vm.isDeleting = 1;
                vm.showSuccessMessage = "Image unlinked!";
                vm.reload();
                vm.file_size = null;
                vm.file_name = null;
                vm.file_type = null;
                vm.videoar = [];
                vm.imagear = [];
                resolve(true);
                $timeout(() => {
                  vm.showConfirmDeletion = false;
                  vm.showSuccessMessage = null;
                  vm.isProcessing = false;
                  vm.isDeleting = false;
                }, 2500);
              }).catch(() => {
                vm.isDeleting = false;
                reject(false);
                logger.error(error);
              })
            } else {
                vm.dropToDelete = undefined;
                vm.isDeleting = 1;
                vm.showSuccessMessage = "Image unlinked!";
                vm.reload();
                vm.file_size = null;
                vm.file_name = null;
                vm.file_type = null;
                vm.videoar = [];
                vm.imagear = [];
                resolve(true);
                $timeout(() => {
                  vm.showConfirmDeletion = false;
                  vm.showSuccessMessage = null;
                  vm.isProcessing = false;
                  vm.isDeleting = false;
                }, 2500);
            }
          })
          .catch(error => {
            vm.isDeleting = false;
            reject(false);
            logger.error(error);
          });
      });
    };

    vm.getDateBasedOnFormat = function (date, date_format) {
      let tempDate;
      if (date) {
        let valueAsMoment = date;
        let isValid;
        isValid = moment(valueAsMoment).isValid();
        if (isValid) {
          let regex = /^d.*y$/gi;
          if (regex.test($scope.date_format)) {
            tempDate = moment(date).format(date_format);
            return tempDate;
          } else {
            tempDate = moment(date).format(date_format);
          }
        } else {
          tempDate = date;
        }
      } else {
        return tempDate;
      }

      return tempDate;
    };

    vm.requiredFrom = () => {
      vm.Existingerror = null;
      if (vm.CorporateConfig_details.effectiveDate) {
        _.each(vm.CorporateConfigList, config => {
          if (!vm.CorporateConfig_details.id) {
            if (vm.CorporateConfig_details.endDate && (parseInt(
              moment(
                vm.CorporateConfig_details.effectiveDate
              ).format("YYYYMMDD")
            ) <=
              parseInt(
                moment(
                  config.effective_date
                ).format("YYYYMMDD")
              )) && (parseInt(
                moment(
                  vm.CorporateConfig_details.endDate
                ).format("YYYYMMDD")
              ) >=
                parseInt(
                  moment(
                    config.effective_date
                  ).format("YYYYMMDD")
                ))) {
              vm.Existingerror = `Corporate Title '${config.title}' already exists for selected Effective Date!`;
            }
            if ((parseInt(
              moment(
                vm.CorporateConfig_details.effectiveDate
              ).format("YYYYMMDD")
            ) >=
              parseInt(
                moment(
                  config.effective_date
                ).format("YYYYMMDD")
              )) &&
              parseInt(
                moment(
                  config.end_date
                ).format("YYYYMMDD")
              ) >=
              parseInt(
                moment(
                  vm.CorporateConfig_details.effectiveDate
                ).format("YYYYMMDD")
              )
            ) {
              vm.Existingerror = `Corporate Title '${config.title}' already exists for selected Effective Date!`;
            }
          }
          else {
            if (vm.CorporateConfig_details.id !== config.id) {
              if (vm.CorporateConfig_details.endDate && (parseInt(
                moment(
                  vm.CorporateConfig_details.effectiveDate
                ).format("YYYYMMDD")
              ) <=
                parseInt(
                  moment(
                    config.effective_date
                  ).format("YYYYMMDD")
                )) && (parseInt(
                  moment(
                    vm.CorporateConfig_details.endDate
                  ).format("YYYYMMDD")
                ) >=
                  parseInt(
                    moment(
                      config.effective_date
                    ).format("YYYYMMDD")
                  ))) {
                vm.Existingerror = `Corporate Title '${config.title}' already exists for selected Effective Date!`;
              }
              if (parseInt(
                moment(
                  vm.CorporateConfig_details.effectiveDate
                ).format("YYYYMMDD")) != parseInt(
                  moment(
                    vm.oldCorporateConfig.effectiveDate
                  ).format("YYYYMMDD"))) {
                if ((parseInt(
                  moment(
                    vm.CorporateConfig_details.effectiveDate
                  ).format("YYYYMMDD")
                ) >=
                  parseInt(
                    moment(
                      config.effective_date
                    ).format("YYYYMMDD")
                  )) &&
                  (parseInt(
                    moment(
                      config.end_date
                    ).format("YYYYMMDD")
                  ) >=
                    parseInt(
                      moment(
                        vm.CorporateConfig_details.effectiveDate
                      ).format("YYYYMMDD")
                    ))
                ) {
                  vm.Existingerror = `Corporate Title '${config.title}' already exists for selected Effective Date!`;
                }
              }
            }
          }
        })
      }
      else {
        vm.Existingerror = `Effective Date is Required!`;
      }
    }

    vm.ValidationFromTo = () => {
      vm.ValidationError = null;
      if (
        parseInt(
          moment(
            vm.CorporateConfig_details.effectiveDate
          ).format("YYYYMMDD")
        ) >
        parseInt(
          moment(
            vm.CorporateConfig_details.endDate
          ).format("YYYYMMDD")
        )
      ) {
        vm.ValidationError = "End date should be greater than Effective date.";
      }
    }

    vm.showDetailsByID = function (orderHelpData) {
      orderHelpData.effectiveDate = vm.getDateBasedOnFormat(orderHelpData.effective_date, 'MM/DD/YYYY');
      orderHelpData.endDate = vm.getDateBasedOnFormat(orderHelpData.end_date, 'MM/DD/YYYY');
      vm.CorporateConfig_details = _.clone(orderHelpData);
      vm.oldCorporateConfig = _.clone(vm.CorporateConfig_details);
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.showErrorDetails = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.isShowDetails = true;
      // On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    /* side panel to open and close on click of column button */
    vm.ShowHideColumnSettings = () => {
      $timeout(() => {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#title").focus();
      }, 0);
    };

    vm.openForm = function () {
      vm.isShowDetails = true;
      this.addFileOne = false;
      vm.isShowAdd = true;
      vm.showErrorDetails = false;
      vm.showDependencyDetails = false;
      vm.invalid_file = false;
      $scope.invalid_size = false;
      vm.ValidationError = null;
      vm.Existingerror = null;
      vm.file_name = null;
      vm.file_type = null;
      $scope.showConfirm = false;
      vm.initial_config = true;
      vm.CorporateConfig_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
      vm.imagear = [];
      vm.videoar = [];
      $('#corporate_img').val('');
    };

    vm.resetForm = function () {
      vm.CorporateConfig_details = {};
      vm.CorporateConfig_details["description"] = null;
    };

    // Create an order help text after save
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.initial_config = true;
      vm.isSaveSuccess = false;
      vm.CorporateConfig_details = {};
      vm.invalid_file = false;
      $scope.invalid_size = false;
      vm.ValidationError = null;
      vm.Existingerror = null;
      vm.file_name = null;
      vm.file_type = null;
      vm.imagear = [];
      vm.videoar = [];
      $('#corporate_img').val('');
      // Setting Previously entered data to the new context
      // vm.CorporateConfig_details.entity_id = vm.CorporateConfig.entity_id;
      // vm.CorporateConfig_details.entity = vm.CorporateConfig.entity;
      vm.setInitialState();
    };

    vm.closeForm = function () {
      vm.isShowDetails = false;
      vm.initial_config = false;
      vm.saveBtnText = "Save";
      $timeout(function () {
        vm.showDependencyDetails = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    vm.initializeCorporateConfig();
  }
})();
