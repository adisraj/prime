(function () {
  "use strict";
  angular
    .module("rc.prime.marketingcampaigns")
    .controller("MarketingCampaignsController", MarketingCampaignsController);
  MarketingCampaignsController.$inject = ["$scope", "common", "MarketingCampaignsService", "valdr", "StatusCodes"];

  function MarketingCampaignsController($scope, common, MarketingCampaignsService, valdr, StatusCodes) {
    let vm = this;
    vm.returnValue = "";
    vm.campaignEntityInformation = {};
    vm.promotionEntityInformation = {};
    vm.error = {};
    vm.message = null;
    vm.previousMarketingCampaign = {};
    vm.previousPromotion = {};
    vm.marketing_campaign_details = {};
    vm.promotion_details = {};
    vm.oldMarketingCampaignData = null;
    vm.oldPromotionData = null;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.isShowHistory = false;
    vm.statusCodes = StatusCodes;
    vm.isUnauthorized = false;
    vm.isLoaded = false;
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.rowsCount = 0;
    // variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.showErrorDetailsData = false;
    vm.errorDependentData = {};
    vm.discountTypeValueValidation = {
      "Percentage": { min: 0, max: 100, isValueRequired: true },
      "Dollar Amount": { min: 0, max: 10000, isValueRequired: true },
      "Sale Tax": { min: 0, max: 1, isValueRequired: false }
    };
    vm.isColumnSettingsVisible = false;
    vm.titletype = [];
    vm.campaignUuid = "106";
    vm.promotionUuid = "107";

    /** Common Modules */
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let logger = common.Logger.getInstance("MarketingCampaignsController");
    let NotificationService = common.Notification;

    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    }

    // to get required information of marketing campaign entity
    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.campaignUuid)
        .then(marketingCampaign_information => {
          vm.campaignEntityInformation = marketingCampaign_information;
        });
      EntityDetails.API.GetEntityInformation(vm.promotionUuid)
        .then(promotion_information => {
          vm.promotionEntityInformation = promotion_information;
        });
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.campaignUuid).then(() => { });
      EntityDetails.API.GetModelAndSetValidationRules(vm.promotionUuid).then(() => { });
    };

    vm.initializeMarketingCampaign = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.getStatuses();
      vm.reload(undefined, false);
    };

    vm.watchers = () => {
      $scope.$watch(angular.bind(vm.returnValue, () => vm.returnValue), () => { });
    };

    vm.getStatuses = () => {
      MarketingCampaignsService.API.GetStatuses()
        .then(result => {
          vm.statuses = result.data;
        })
        .catch(() => { })
    };

    vm.reload = (refresh, isCache) => {
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }

      if (isCache === undefined || isCache === null) {
        isCache = false;
      }
      vm.selectedMarketingCampaignRow = null;
      vm.selectedPromotionRow = null;
      vm.isLoaded = false;
      MarketingCampaignsService.API.GetMarketingCampaigns(isCache)
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allMarketingCampaigns = response.data;
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
              angular.element("#inlineSearch").focus();
            }, 3500);
          }
          vm.isLoaded = true;
        })
        .catch(error => {
          logger.error(error);
          if (error.status === 403) {
            vm.isLoaded = true;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
        });
    };

    // set focus on first field in form
    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#description").focus();
      }, 0);
    };

    vm.save = (data, entityName) => {
      let payload = JSON.parse(JSON.stringify(data));
      vm.saveBtnText = "Saving now...";
      vm.isProcessing = true;
      if (entityName == "Campaign") {
        MarketingCampaignsService.API.InsertMarketingCampaign(payload)
          .then(response => {
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            payload.id = response.data.inserted_id;
            vm.previousMarketingCampaign = payload;
            vm.allMarketingCampaigns.push(payload);
            vm.rowsCount += 1;
            vm.isProcessing = false;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.saveBtnText = "Oops.!! Something went wrong";
            vm.saveBtnError = true;
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            $timeout(() => {
              vm.message = null;
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
              angular.element("#decription").focus();
              vm.isProcessing = false;
            }, 2500);
          });
      } else if (entityName == "Promotion") {
        payload.discount_code = Number(payload.discount_code);
        payload.campaign_id = vm.marketing_campaign_details.id;
        payload.parent_id = vm.promotion_parent_details ? vm.promotion_parent_details.id : null;
        if (vm.promotion_parent_details && vm.promotion_parent_details.level) {
          payload.level = vm.promotion_parent_details.level + 1;
        } else {
          payload.level = 1;
        }
        if (payload.effective_start_date) {
          payload.effective_start_date = moment(new Date(payload.effective_start_date)).format("YYYY-MM-DD");
        }
        if (payload.effective_end_date) {
          payload.effective_end_date = moment(new Date(payload.effective_end_date)).format("YYYY-MM-DD");
        } else {
          payload.effective_end_date = null;
        }
        MarketingCampaignsService.API.InsertPromotion(payload)
          .then(response => {
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            payload.id = response.data.inserted_id;
            vm.previousPromotion = payload;
            if (
              vm.promotion_parent_details &&
              vm.promotion_parent_details.promotions &&
              vm.promotion_parent_details.promotions.length
            ) {
              vm.promotion_parent_details.promotions.push(payload);
            } else if (vm.promotion_parent_details) {
              vm.promotion_parent_details.promotions = [payload];
            } else if (
              vm.marketing_campaign_details &&
              vm.marketing_campaign_details.promotions &&
              vm.marketing_campaign_details.promotions.length
            ) {
              vm.marketing_campaign_details.promotions.push(payload);
            } else if (vm.marketing_campaign_details) {
              vm.marketing_campaign_details.promotions = [payload];
            }
            vm.isProcessing = false;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.saveBtnText = "Oops.!! Something went wrong";
            vm.saveBtnError = true;
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            $timeout(() => {
              vm.message = null;
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
              angular.element("#decription").focus();
              vm.isProcessing = false;
            }, 2500);
          });
      }
    };

    // check that update form previous data is not same as payload
    vm.hasUpdateChanges = (payload, entityName) => {
      if (entityName == "Campaign") {
        if (
          vm.oldMarketingCampaignData.description !== payload.description ||
          vm.oldMarketingCampaignData.long_description !== payload.long_description
        ) {
          return true;
        } else {
          return false;
        }
      } else if (entityName == "Promotion") {
        if (
          vm.oldPromotionData.description !== payload.description ||
          vm.oldPromotionData.long_description !== payload.long_description ||
          vm.oldPromotionData.discount_code != payload.discount_code ||
          vm.oldPromotionData.discount_type !== payload.discount_type ||
          vm.oldPromotionData.discount_type_value !== payload.discount_type_value ||
          moment(new Date(vm.oldPromotionData.effective_start_date)).format("YYYY-MM-DD") !==
          moment(new Date(payload.effective_start_date)).format("YYYY-MM-DD") ||
          moment(new Date(vm.oldPromotionData.effective_end_date)).format("YYYY-MM-DD") !==
          moment(new Date(payload.effective_end_date)).format("YYYY-MM-DD")
        ) {
          return true;
        } else {
          return false;
        }
      }
    };

    vm.updateDataList = (list, payload, action) => {
      if (list && list.promotions) {
        for (let index = 0; index < list.promotions.length; index++) {
          if (list.promotions[index].id == payload.id) {
            if (action === "update") {
              list.promotions[index] = payload;
            } else if (action === "delete") {
              list.promotions.splice(index, 1);
            }
            break;
          } if (list.promotions[index].promotions) {
            vm.updateDataList(list.promotions[index].promotions, payload, action);
          }
        }
      } else {
        for (let index = 0; index < list.length; index++) {
          if (list[index].promotions) {
            if (list[index].id == payload.id) {
              if (action === "update") {
                list[index] = payload;
              } else if (action === "delete") {
                list.splice(index, 1);
              }
              break;
            }
            for (let innerIndex = 0; innerIndex < list[index].promotions.length; innerIndex++) {
              if (list[index].promotions[innerIndex].id == payload.id) {
                if (action === "update") {
                  list[index].promotions[innerIndex] = payload;
                } else if (action === "delete") {
                  list[index].promotions.splice(innerIndex, 1);
                }
                break;
              } if (list[index].promotions[innerIndex].promotions) {
                vm.updateDataList(list[index].promotions[innerIndex].promotions, payload, action);
              }
            }
          } else {
            if (list[index].id == payload.id) {
              if (action === "update") {
                list[index] = payload;
              } else if (action === "delete") {
                list.splice(index, 1);
              }
              break;
            }
          }
        }
      }
    };

    vm.update = (data, entityName) => {
      let payload = JSON.parse(JSON.stringify(data));
      vm.updateBtnText = "Updating Now...";
      vm.isProcessing = true;
      if (entityName == "Campaign") {
        payload.discount_code = Number(payload.discount_code);
        if (vm.hasUpdateChanges(payload, entityName) === true) {
          MarketingCampaignsService.API.UpdateMarketingCampaign(payload)
            .then(() => {
              vm.isShowHistory = false;
              vm.updateBtnText = "Done";
              vm.isUpdateSuccess = true;
              vm.allMarketingCampaigns[vm.allMarketingCampaigns.findIndex(campaign => campaign.id == payload.id)] = payload;
              vm.oldMarketingCampaignData = null;
              vm.isProcessing = false;
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isUnauthorized = true;
              }
              vm.error = true;
              vm.message = NotificationService.errorNotification(error);
              vm.updateBtnText = "Oops.!! Something went wrong";
              vm.updateBtnError = true;
              $timeout(() => {
                vm.message = null;
                vm.updateBtnText = "Update";
                vm.updateBtnError = false;
                angular.element("#description").focus();
                vm.isProcessing = false;
              }, 2500);
            });
        } else {
          vm.updateBtnText = "Nothing to update";
          vm.updateBtnError = true;
          $timeout(() => {
            vm.updateBtnText = "Update";
            vm.updateBtnError = false;
            angular.element("#description").focus();
            vm.isProcessing = false;
          }, 1000);
        }
      } else if (entityName == "Promotion") {
        if (payload.effective_start_date) {
          payload.effective_start_date = moment(new Date(payload.effective_start_date)).format("YYYY-MM-DD");
        }
        if (payload.effective_end_date) {
          payload.effective_end_date = moment(new Date(payload.effective_end_date)).format("YYYY-MM-DD");
        } else {
          payload.effective_end_date = null;
        }
        if (vm.hasUpdateChanges(payload, entityName) === true) {
          MarketingCampaignsService.API.UpdatePromotion(payload)
            .then(() => {
              vm.isShowHistory = false;
              vm.updateBtnText = "Done";
              vm.isUpdateSuccess = true;
              vm.updateDataList(vm.marketing_campaign_details, payload, "update");
              vm.oldPromotionData = null;
              vm.isProcessing = false;
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isUnauthorized = true;
              }
              vm.error = true;
              vm.message = NotificationService.errorNotification(error);
              vm.updateBtnText = "Oops.!! Something went wrong";
              vm.updateBtnError = true;
              $timeout(() => {
                vm.message = null;
                vm.updateBtnText = "Update";
                vm.updateBtnError = false;
                angular.element("#description").focus();
                vm.isProcessing = false;
              }, 2500);
            });
        } else {
          vm.updateBtnText = "Nothing to update";
          vm.updateBtnError = true;
          $timeout(() => {
            vm.updateBtnText = "Update";
            vm.updateBtnError = false;
            angular.element("#description").focus();
            vm.isProcessing = false;
          }, 1000);
        }
      }
    };

    vm.delete = (payload, entityName) => {
      if (entityName == "Campaign") {
        MarketingCampaignsService.API.DeleteMarketingCampaign(payload)
          .then(result => {
            if (
              result &&
              result.data &&
              result.data.status &&
              result.data.status == 412 &&
              result.data.dependency
            ) {
              // to show list of dependent entities in side panel
              vm.dependencyList = result.data.dependency;
              vm.showErrorDetails = true;
            } else {
              vm.isDeleteSuccess = true;
              vm.isConfirmDelete = false;
              let index = vm.allMarketingCampaigns.findIndex(campaign => campaign.id === payload.id);
              vm.allMarketingCampaigns.splice(index, 1);
              vm.rowsCount--;
            }
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              vm.message = error.data.error;

              // to show list of dependent entities in side panel
              vm.dependencyList = error.data.dependency;
              vm.showErrorDetails = true;
            }
          });
      } else if (entityName == "Promotion") {
        MarketingCampaignsService.API.DeletePromotion(payload)
          .then(result => {
            if (
              result &&
              result.data &&
              result.data.status &&
              result.data.status == 412 &&
              result.data.dependency
            ) {
              // to show list of dependent entities in side panel
              vm.dependencyList = result.data.dependency;
              vm.showErrorDetails = true;
            } else {
              vm.isDeleteSuccess = true;
              vm.isConfirmDelete = false;
              vm.updateDataList(vm.marketing_campaign_details, payload, "delete");
            }
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              vm.message = error.data.error;
              // to show list of dependent entities in side panel
              vm.dependencyList = error.data.dependency;
              vm.showErrorDetails = true;
            }
          });
      }
    };

    // show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = () => {
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    // close dependency details side panel only
    vm.closeDependencyDetails = () => {
      vm.showErrorDetailsData = false;
    };

    // to show details of dependent entity in side panel
    vm.showDependencyListDetails = (data) => {
      $timeout(() => {
        angular.element("#title_depend_close").focus();
      }, 500);
      vm.errorDependentData = data;
      vm.showErrorDetailsData = true;
    };

    // Show confirmation page on click of delete button
    vm.showconfirm = () => {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    vm.openForm = (entityName, marketingCampaignData, parentData) => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.saveBtnText = "Save";
      vm.saveBtnError = false;
      vm.marketing_campaign_details = {};
      vm.oldMarketingCampaignData = undefined;
      vm.promotion_details = {};
      vm.oldPromotionData = undefined;
      vm.message = null;
      if (entityName == "Campaign") {
        vm.isCampaignForm = true;
        $timeout(() => {
          vm.marketing_campaign_form.$setPristine();
        }, 10);
      } else if (entityName == "Promotion") {
        vm.isCampaignForm = false;
        $timeout(() => {
          vm.marketing_campaign_details = marketingCampaignData;
          vm.promotion_parent_details = parentData;
          vm.promotion_form.$setPristine();
          vm.promotion_details.description = null;
          vm.promotion_details.long_description = null;
          vm.promotion_details.discount_type = "Percentage";
          vm.promotion_details.discount_type_value = null;
          vm.promotion_details.discount_code = null;
          vm.promotion_details.effective_start_date = null;
          vm.promotion_details.effective_end_date = null;
          vm.promotion_details.status_id = 100;
          vm.isDiscountCodeExists = false;
          vm.addValidationRules();
        }, 10);
      }
      vm.setInitialState();
    };

    // Create another marketing campaign after save
    vm.createAnotherForm = (entityName) => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.saveBtnText = "Save";
      vm.saveBtnError = false;
      if (entityName == "Campaign") {
        vm.marketing_campaign_details = {};
      } else if (entityName == "Promotion") {
        vm.promotion_details = {};
        vm.promotion_details.discount_type = "Percentage";
        vm.promotion_details.status_id = 100;
        vm.addValidationRules();
      }
      vm.setInitialState();
    };

    vm.closeForm = () => {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.showErrorDetailsData = false;
      vm.isUnauthorized = false;
      vm.showErrorDetails = false;
      vm.isDeleteSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isSaveSuccess = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
      vm.message = null;
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000);
    };

    vm.singleClickAction = (index, entityData, entityName) => {
      if (entityName == "Campaign") {
        vm.selectedPromotionRow = null;
        vm.selectedMarketingCampaignRow = index;
        entityData.showPromotions = !entityData.showPromotions;
        if (!entityData.promotions) {
          vm.getPromotionsByMarketingCampaign(entityData);
        }
      } else if (entityName == "Promotion") {
        vm.selectedPromotionRow = index;
        entityData.showPromotions = !entityData.showPromotions;
        if (!entityData.promotions) {
          vm.getPromotionsByParentPromotion(entityData);
        }
      }
    };

    vm.dblClickAction = (entityData, entityName, marketingCampaignData) => {
      vm.isShowAdd = false;
      vm.isDiscountCodeExists = false;
      entityData.showPromotions = true;
      vm.marketing_campaign_details = marketingCampaignData;
      if (entityName == "Campaign") {
        vm.showMarketingCampaignDetailsByID(entityData);
      } else if (entityName == "Promotion") {
        // vm.promotion_parent_details = parentData;
        vm.showPromotionDetailsByID(entityData, marketingCampaignData);
      }
    };

    vm.showMarketingCampaignDetailsByID = (marketingCampaignData) => {
      vm.isLoading = true;
      $timeout(() => {
        vm.marketing_campaign_details = _.clone(marketingCampaignData);
        vm.oldMarketingCampaignData = _.clone(marketingCampaignData);
        vm.isLoading = false;
      }, 0);
      vm.promotion_details = {};
      vm.oldPromotionData = null;
      vm.isCampaignForm = true;
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.isShowDetails = true;
      if (!marketingCampaignData.promotions) {
        vm.getPromotionsByMarketingCampaign(marketingCampaignData);
      }
    };

    vm.showPromotionDetailsByID = (promotionData, marketingCampaignData) => {
      vm.isLoading = true;
      if (promotionData.discount_code) {
        promotionData.discount_code = `${promotionData.discount_code}`;
        if (promotionData.discount_code.length < 10) {
          promotionData.discount_code = `0000000000${promotionData.discount_code}`;
          promotionData.discount_code = promotionData.discount_code.substring(
            promotionData.discount_code.length, promotionData.discount_code.length - 10
          );
        }
      }
      if (!promotionData.discount_type) {
        promotionData.discount_type = "Percentage";
      }
      if (promotionData.discount_type_value) {
        promotionData.discount_type_value = Number(promotionData.discount_type_value);
      }
      if (promotionData.effective_start_date) {
        promotionData.effective_start_date = moment(new Date(promotionData.effective_start_date)).format("MM/DD/YYYY");
      }
      if (promotionData.effective_end_date) {
        promotionData.effective_end_date = moment(new Date(promotionData.effective_end_date)).format("MM/DD/YYYY");
      }
      vm.marketing_campaign_details = marketingCampaignData;
      vm.oldMarketingCampaignData = marketingCampaignData;
      $timeout(() => {
        if (vm.promotion_form) {
          vm.promotion_form.$setPristine();
        }
        vm.promotion_details = _.clone(promotionData);
        vm.oldPromotionData = _.clone(promotionData);
        vm.addValidationRules();
        vm.isLoading = false;
      }, 0);
      vm.isCampaignForm = false;
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.isShowDetails = true;
      if (!promotionData.promotions) {
        vm.getPromotionsByParentPromotion(promotionData);
      }
    };

    vm.getPromotionsByMarketingCampaign = marketingCampaign => {
      marketingCampaign.isLoaded = false;
      MarketingCampaignsService.API.GetPromotionsByMarketingCampaign(marketingCampaign.id)
        .then(result => {
          marketingCampaign.promotions = result.data;
          marketingCampaign.isLoaded = true;
        })
        .catch(() => { })
    };

    vm.getPromotionsByParentPromotion = promotion => {
      promotion.isLoaded = false;
      MarketingCampaignsService.API.GetPromotionsByParentPromotion(promotion.id)
        .then(result => {
          promotion.promotions = result.data;
          promotion.isLoaded = true;
        })
        .catch(() => { })
    };

    vm.validateDiscountCodeCheck = discountCode => {
      vm.isProcessing = true;
      vm.isDiscountCodeExists = false;
      vm.invalidDiscountCode = false;
      if (Number(discountCode) < 0) {
        vm.invalidDiscountCode = true;
      }
      if (!vm.oldPromotionData || (vm.oldPromotionData && discountCode != vm.oldPromotionData.discount_code)) {
        if (discountCode) {
          MarketingCampaignsService.API.ValidateDiscountCodeCheck(discountCode)
            .then(result => {
              if (result.data) {
                vm.isDiscountCodeExists = result.data.exists;
                vm.isProcessing = false;
              }
            })
            .catch(() => {
              vm.isProcessing = false;
            });
        } else {
          vm.isProcessing = false;
        }
      } else {
        vm.isProcessing = false;
      }
    };

    vm.determineStatus = () => {
      if (
        vm.promotion_details &&
        Number(moment(vm.promotion_details.effective_start_date).format("YYYYMMDD")) <= Number(moment(vm.promotion_details.effective_end_date).format("YYYYMMDD"))
      ) {
        vm.promotion_details.status_id = 100;
        if (
          vm.promotion_details.effective_start_date &&
          Number(moment(new Date()).format("YYYYMMDD")) < Number(moment(vm.promotion_details.effective_start_date).format("YYYYMMDD"))
        ) {
          vm.promotion_details.status_id = 100;
        } else if (
          vm.promotion_details.effective_start_date &&
          vm.promotion_details.effective_end_date &&
          Number(moment(new Date()).format("YYYYMMDD")) >= Number(moment(vm.promotion_details.effective_start_date).format("YYYYMMDD")) &&
          Number(moment(new Date()).format("YYYYMMDD")) <= Number(moment(vm.promotion_details.effective_end_date).format("YYYYMMDD"))
        ) {
          vm.promotion_details.status_id = 200;
        } else if (
          vm.promotion_details.effective_start_date &&
          !vm.promotion_details.effective_end_date &&
          Number(moment(new Date()).format("YYYYMMDD")) >= Number(moment(vm.promotion_details.effective_start_date).format("YYYYMMDD"))
        ) {
          vm.promotion_details.status_id = 200;
        } else if (
          vm.promotion_details.effective_start_date &&
          Number(moment(new Date()).format("YYYYMMDD")) > Number(moment(vm.promotion_details.effective_end_date).format("YYYYMMDD"))
        ) {
          vm.promotion_details.status_id = 300;
        }
      } else {
        vm.promotion_details.effective_end_date = undefined;
      }
    };

    vm.validateDiscountType = () => {
      let limit = vm.promotion_form.discount_type_value.$viewValue.length;
      if (vm.promotion_details && vm.promotion_details.discount_type === "Percentage") {
        limit = 3;
      } else {
        limit = 5;
      }
      if (
        vm.promotion_details &&
        vm.promotion_form.discount_type_value.$viewValue &&
        vm.promotion_form.discount_type_value.$viewValue.length > limit
      ) {
        vm.promotion_details.discount_type_value = Number(vm.promotion_form.discount_type_value.$viewValue.substring(0, limit));
      }
    };

    // Get history details for codes
    $scope.loadHistory = (entityName) => {
      if (entityName == "Campaign") {
        EntityDetails.API
          .GetHistoryData(vm.campaignEntityInformation.uuid, vm.marketing_campaign_details.id)
          .then(response => {
            $scope.historyList = response.data;
            $scope.showhistory = true;
          })
          .catch(error => {
            logger.error(error);
          });
      } else if (entityName == "Promotion") {
        EntityDetails.API
          .GetHistoryData(vm.promotionEntityInformation.uuid, vm.promotion_details.id)
          .then(response => {
            $scope.historyList = response.data;
            $scope.showhistory = true;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    // Close show history panel only
    $scope.closeShowHistory = function () {
      $timeout(function () {
        angular.element("#description").focus();
      }, 500);
      $scope.showhistory = false;
    };

    /* add validation rules based for discount code */
    vm.addValidationRules = () => {
      let obj = {};
      if (vm.promotion_form && vm.promotion_form.discount_code) {
        vm.promotion_form.discount_code.$setUntouched();
        vm.promotion_form.discount_code.$setPristine();
      }
      let getConstraint = valdr.getConstraints()["RULES-107"];
      let msg = `Discount code should be a 10 digit number.`;
      getConstraint["discount_code"] = {
        digits: { integer: 10, message: msg },
        required: { message: "The Discount code is required !" },
        size: { min: 10, message: msg, max: 10 }
      };
      obj["RULES-107"] = getConstraint;
      valdr.addConstraints(obj);
      if (vm.promotion_details.discount_code) {
        vm.validateDiscountCodeCheck(vm.promotion_details.discount_code);
      }
    };

    $scope.getAccessPermissions(131)
      .then(() => {
        vm.initializeMarketingCampaign();
      })
      .catch(() => {
        vm.initializeMarketingCampaign();
      })
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
