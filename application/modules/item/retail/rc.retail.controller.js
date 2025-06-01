(function() {
  "use strict";

  angular.module("calculus").controller("RetailMaintenance", RetailMaintenance);

  RetailMaintenance.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "ItemService",
    "ItemPriceGroupService",
    "MTOPriceGroupService",
    "RetailService",
    "SKUService",
    "valdr"
  ];

  function RetailMaintenance(
    $scope,
    $stateParams,
    common,
    ItemService,
    ItemPriceGroupService,
    MTOPriceGroupService,
    RetailService,
    SKUService,
    valdr
  ) {
    /* jshint validthis:true */
    var vm = this;

    let logger = common.Logger.getInstance("RetailMaintenance");
    vm.isShowDetails = false;
    vm.retailHead = {};
    vm.retailReasonsMap = {};
    vm.retailPublish = false;
    let ref_percent = 0;
    vm.isSkuSelectionModal = true;
    vm.isRetails = false;
    vm.skuIds = [];

    vm.GetSKUs = () => {
      let data = common.EntityDetails.API.GetGraphSet(
        common.Identifiers.sku_master,
        ["id", "description", "sku", "sku_type"],
        "item_id",
        $stateParams.item_id
      )
        .then(response => {
          vm.Skus = response.data;
        })
        .catch(err => logger.error(err));
      return data;
    };

    vm.selectSku = skuObject => {
      vm.selectedSkuCount === undefined ? (vm.selectedSkuCount = 0) : null;
      if (skuObject.checked === false) {
        let index = this.skuIds.findIndex(skuId => skuId === skuObject.id);
        this.skuIds.splice(index, 1);
        vm.selectedSkuCount = vm.selectedSkuCount - 1;
        let selectedSkuCount = 0;
        _.each(vm.Skus, sku => {
          if (
            sku.sku_type === skuObject.sku_type &&
            sku.id !== skuObject.id &&
            sku.checked === true
          ) {
            selectedSkuCount = selectedSkuCount + 1;
          }
        });
        if (selectedSkuCount === 0) {
          vm.skuIds = [];
          vm.Skus = _.filter(vm.Skus, sku => {
            sku.isDisabled = false;
            return sku;
          });
        }
      } else if (skuObject.checked === true) {
        vm.selectedSkuCount = vm.selectedSkuCount + 1;
        vm.Skus = _.filter(vm.Skus, sku => {
          return sku.sku_type !== skuObject.sku_type
            ? (sku.isDisabled = true)
            : sku;
        });
      }
      vm.loadRetailDetail();
    };

    vm.applyClassificationForCurrentRetail = () => {
      vm.retails[0].price_type_id = vm.retailHead.price_type_id;
      vm.retails[0].retail_reason_id = vm.retailHead.retail_reason_id;
      vm.retails[0].effective_date = vm.retailHead.effective_date;

      //:STOCK RETAIL
      for (let i = 0; i < vm.retails[0].retails.stockSKUs.length; i++) {
        let obj = vm.retails[0].retails.stockSKUs[i];
        let refClassRetail = 0;
        for (let j = 0; j < obj.priceGroups.length; j++) {
          if (j == 0) {
            refClassRetail = obj.priceGroups[j]["retail"];
          } else {
            obj.priceGroups[j]["retail"] =
              refClassRetail +
              (obj.priceGroups[j].price_percentage / 100) * refClassRetail;
          }
        }
      }
      //:STOCK PLUS RETIAL
      for (let i = 0; i < vm.retails[0].retails.stockPlusSKUs.length; i++) {
        let obj = vm.retails[0].retails.stockPlusSKUs[i];
        let refClassRetail = 0;
        for (let j = 0; j < obj.priceGroups.length; j++) {
          if (j == 0) {
            refClassRetail = obj.priceGroups[j]["retail"];
          } else {
            obj.priceGroups[j]["retail"] =
              refClassRetail +
              (obj.priceGroups[j].price_percentage / 100) * refClassRetail;
          }
        }
      }
      //: MTO SKU RETAIL
      for (let i = 0; i < vm.retails[0].retails.mtoSKUs.length; i++) {
        let obj = vm.retails[0].retails.mtoSKUs[i];
        let refClassRetail = 0;
        for (let j = 0; j < obj.priceGroups.length; j++) {
          if (j == 0) {
            refClassRetail = obj.priceGroups[j]["retail"];
          } else {
            obj.priceGroups[j]["retail"] =
              refClassRetail +
              (obj.priceGroups[j].price_percentage / 100) * refClassRetail;
          }
        }
        let mtoTypes = obj["types"];
        for (let j = 0; j < mtoTypes.length; j++) {
          let mto_type = mtoTypes[j];
          for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
            let pg = mto_type.subPriceGroups[k];
            let defaultRetail = 0;
            for (let j = 0; j < pg.priceGroups.length; j++) {
              if (j == 0) {
                defaultRetail = pg.priceGroups[j]["retail"];
              } else {
                pg.priceGroups[j]["retail"] =
                  defaultRetail +
                  (pg.priceGroups[j].price_percentage / 100) * defaultRetail;
              }
            }
          }
          for (let l = 0; l < mto_type.subByChoices.length; l++) {
            let pg = mto_type.subByChoices[l];
            let defaultRetail = 0;
            for (let j = 0; j < pg.priceGroups.length; j++) {
              if (j == 0) {
                defaultRetail = pg.priceGroups[j]["retail"];
              } else {
                pg.priceGroups[j]["retail"] =
                  defaultRetail +
                  (pg.priceGroups[j].price_percentage / 100) * defaultRetail;
              }
            }
          }
        }
      }
    };

    vm.applyClassificationToNextRetail = () => {
      var rulePercentValue = 0;
      if (vm.retailHead.method === "off") {
        rulePercentValue = -vm.retailHead.percentNumber;
      } else if (vm.retailHead.method === "inc") {
        rulePercentValue = vm.retailHead.percentNumber;
      } else if (vm.retailHead.method === "manual") {
        rulePercentValue = vm.retailHead.percentNumber;
      }
      let selectedRetail =
        vm.retails[vm.retailHead.selectedRetailDate.index].retails;

      vm.retails[vm.retails.length - 1].price_type_id =
        vm.retailHead.price_type_id;
      vm.retails[vm.retails.length - 1].retail_reason_id =
        vm.retailHead.retail_reason_id;
      vm.retails[vm.retails.length - 1].effective_date =
        vm.retailHead.effective_date;

      vm.retails[vm.retails.length - 1]["retails"] = JSON.parse(
        JSON.stringify(selectedRetail)
      );

      //:STOCK SKUS RETAIL
      for (
        let i = 0;
        i < vm.retails[vm.retails.length - 1].retails.stockSKUs.length;
        i++
      ) {
        let obj = vm.retails[vm.retails.length - 1].retails.stockSKUs[i];
        for (let j = 0; j < obj.priceGroups.length; j++) {
          if (
            vm.retailHead.isStock &&
            (!vm.retailHead.applyTo ||
              vm.retailHead.applyTo.pricing_class_udd_line_id ===
                obj.priceGroups[j].pricing_class_udd_line_id)
          ) {
            obj.priceGroups[j]["retail"] =
              obj.priceGroups[j]["retail"] +
              (obj.priceGroups[j]["retail"] * rulePercentValue) / 100;
          } else {
            obj.priceGroups[j]["retail"] = null;
          }
        }
      }

      //:STOCK PLUS SKUS RETAIL
      for (
        let i = 0;
        i < vm.retails[vm.retails.length - 1].retails.stockPlusSKUs.length;
        i++
      ) {
        let obj = vm.retails[vm.retails.length - 1].retails.stockPlusSKUs[i];
        for (let j = 0; j < obj.priceGroups.length; j++) {
          if (
            vm.retailHead.isStockPlus &&
            (!vm.retailHead.applyTo ||
              vm.retailHead.applyTo.pricing_class_udd_line_id ===
                obj.priceGroups[j].pricing_class_udd_line_id)
          ) {
            obj.priceGroups[j]["retail"] =
              obj.priceGroups[j]["retail"] +
              (obj.priceGroups[j]["retail"] * rulePercentValue) / 100;
          } else {
            obj.priceGroups[j]["retail"] = null;
          }
        }
      }

      //: MTO SKU RETAIL
      for (
        let i = 0;
        i < vm.retails[vm.retails.length - 1].retails.mtoSKUs.length;
        i++
      ) {
        let obj = vm.retails[vm.retails.length - 1].retails.mtoSKUs[i];
        for (let j = 0; j < obj.priceGroups.length; j++) {
          let pg = obj.priceGroups[j];
          if (
            vm.retailHead.isMTO &&
            (!vm.retailHead.applyTo ||
              vm.retailHead.applyTo.pricing_class_udd_line_id ===
                pg.pricing_class_udd_line_id)
          ) {
            pg["retail"] =
              pg["retail"] + (pg["retail"] * rulePercentValue) / 100;
          } else {
            pg["retail"] = null;
          }
        }
        for (let l = 0; l < obj.types.length; l++) {
          let type = obj.types[l];
          for (let p = 0; p < type.subPriceGroups.length; p++) {
            let subPriceGroup = type.subPriceGroups[p];
            for (let j = 0; j < subPriceGroup.priceGroups.length; j++) {
              let pg = subPriceGroup.priceGroups[j];
              if (
                vm.retailHead.isMTO &&
                (!vm.retailHead.applyTo ||
                  vm.retailHead.applyTo.pricing_class_udd_line_id ===
                    pg.pricing_class_udd_line_id)
              ) {
                pg["retail"] =
                  pg["retail"] + (pg["retail"] * rulePercentValue) / 100;
              } else {
                pg["retail"] = null;
              }
            }
          }
          for (let p = 0; p < type.subByChoices.length; p++) {
            let subByChoice = type.subByChoices[p];
            for (let j = 0; j < subByChoice.priceGroups.length; j++) {
              let pg = subByChoice.priceGroups[j];
              if (
                vm.retailHead.isMTO &&
                (!vm.retailHead.applyTo ||
                  vm.retailHead.applyTo.pricing_class_udd_line_id ===
                    pg.pricing_class_udd_line_id)
              ) {
                pg["retail"] =
                  pg["retail"] + (pg["retail"] * rulePercentValue) / 100;
              } else {
                pg["retail"] = null;
              }
            }
          }
        }
      }
    };

    vm.applyRetailRules = groupId => {
      vm.fetchRetailRulesByGroup(groupId);
    };

    vm.fetchRetailRulesByGroup = groupId => {
      RetailService.API.FetchRetailRulesByGroup(groupId)
        .then(response => {
          vm.roundingRules = response;
          vm.applyRoundingRulesToCurrentRetail();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.applyRetailRulesToCurrentRetail = retail => {
      if (retail !== undefined && retail !== null && retail > 0) {
        vm.roundingRules.forEach(function(roundingRule) {
          let retailValue = String(retail).split(".");
          retailValue[1] = retailValue[1] === undefined ? 0 : retailValue[1];
          let is_valid_rule = false;
          let retailRoundingRule = roundingRule.condition_for_number.replace(
            /N/g,
            Number(retailValue[0])
          );
          is_valid_rule = eval(retailRoundingRule);
          if (is_valid_rule) {
            let decimalRoundingRule = roundingRule.condition_for_decimal.replace(
              /N/g,
              Number(retailValue[0])
            );
            decimalRoundingRule = decimalRoundingRule.replace(
              /M/g,
              Number(retailValue[0].substring(0, 3))
            );
            decimalRoundingRule = decimalRoundingRule.replace(
              /D/g,
              Number(retailValue[1])
            );
            if (eval(decimalRoundingRule)) {
              let rule = roundingRule.rule;
              let regex = /M/;
              if (regex.test(rule)) {
                rule = rule
                  .replace(/M/g, Number(retailValue[0].substring(0, 3)))
                  .split(".");
              } else {
                rule = rule.replace(/N/g, Number(retailValue[0])).split(".");
              }
              retail = parseInt(eval(rule[0]) + "." + rule[1]);
            }
          }
        }, this);
        return retail;
      }
    };

    vm.applyRoundingRulesToCurrentRetail = () => {
      vm.retails[vm.retails.length - 1].price_type_id =
        vm.retailHead.price_type_id;
      vm.retails[vm.retails.length - 1].retail_reason_id =
        vm.retailHead.retail_reason_id;
      vm.retails[vm.retails.length - 1].effective_date =
        vm.retailHead.effective_date;

      //:STOCK RETAIL
      for (
        let i = 0;
        i < vm.retails[vm.retails.length - 1].retails.stockSKUs.length;
        i++
      ) {
        let obj = vm.retails[vm.retails.length - 1].retails.stockSKUs[i];
        for (let j = 0; j < obj.priceGroups.length; j++) {
          obj.priceGroups[j]["retail"] = vm.applyRetailRulesToCurrentRetail(
            obj.priceGroups[j]["retail"]
          );
        }
      }
      //:STOCK PLUS RETIAL
      for (
        let i = 0;
        i < vm.retails[vm.retails.length - 1].retails.stockPlusSKUs.length;
        i++
      ) {
        let obj = vm.retails[vm.retails.length - 1].retails.stockPlusSKUs[i];
        for (let j = 0; j < obj.priceGroups.length; j++) {
          obj.priceGroups[j]["retail"] = vm.applyRetailRulesToCurrentRetail(
            obj.priceGroups[j]["retail"]
          );
        }
      }
      //: MTO SKU RETAIL
      for (
        let i = 0;
        i < vm.retails[vm.retails.length - 1].retails.mtoSKUs.length;
        i++
      ) {
        let obj = vm.retails[vm.retails.length - 1].retails.mtoSKUs[i];
        for (let j = 0; j < obj.priceGroups.length; j++) {
          obj.priceGroups[j]["retail"] = vm.applyRetailRulesToCurrentRetail(
            obj.priceGroups[j]["retail"]
          );
        }
        let mtoTypes = obj["types"];
        for (let j = 0; j < mtoTypes.length; j++) {
          let mto_type = mtoTypes[j];
          for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
            let pg = mto_type.subPriceGroups[k];
            for (let j = 0; j < pg.priceGroups.length; j++) {
              pg.priceGroups[j]["retail"] = vm.applyRetailRulesToCurrentRetail(
                obj.priceGroups[j]["retail"]
              );
            }
          }
          for (let l = 0; l < mto_type.subByChoices.length; l++) {
            let pg = mto_type.subByChoices[l];
            for (let j = 0; j < pg.priceGroups.length; j++) {
              pg.priceGroups[j]["retail"] = vm.applyRetailRulesToCurrentRetail(
                obj.priceGroups[j]["retail"]
              );
            }
          }
        }
      }
      vm.retailPublish = true;
    };

    //Generating new retail after change  of price
    // current retail = 1, next retail =2
    let stockPlusLinkMap = {};
    let creatLinkingMap = sku => {
      stockPlusLinkMap[sku.stock_plus_pricing_sku_id] = sku;
    };
    vm.getLinkedSKU = (sku, pg, index) => {
      if (stockPlusLinkMap[sku.id]["priceGroups"] !== undefined) {
        let stPlusPriceGroup = stockPlusLinkMap[sku.id]["priceGroups"][index];
        stPlusPriceGroup.retail = pg.retail;
      }
    };
    vm.generateNewRetail = forWhichRetail => {
      if (forWhichRetail === 1) {
        let newRetail = {
          effective_date: vm.retailHead.effective_date,
          isUpdate: true,
          retails: {
            stockSKUs: [],
            stockPlusSKUs: [],
            mtoSKUs: []
          },
          retail_reason_id: vm.retailHead.retail_reason_id
        };
        //:: STOCK Skus
        for (let k = 0; k < vm.meta.stockSKUs.length; k++) {
          let sku = vm.meta.stockSKUs[k];
          sku.priceGroups = JSON.parse(JSON.stringify(vm.meta.priceGroups));
          newRetail.retails.stockSKUs.push(sku);
        }
        //:: STOCK PLUS Skus
        for (let k = 0; k < vm.meta.stockPlusSKUs.length; k++) {
          let sku = vm.meta.stockPlusSKUs[k];
          sku.priceGroups = JSON.parse(JSON.stringify(vm.meta.priceGroups));
          newRetail.retails.stockPlusSKUs.push(sku);
          creatLinkingMap(sku);
        }
        //:MTO SKUs
        for (let k = 0; k < vm.meta.mtoSKUs.length; k++) {
          let sku = vm.meta.mtoSKUs[k];
          sku.priceGroups = JSON.parse(JSON.stringify(vm.meta.priceGroups));
          for (let l = 0; l < sku.types.length; l++) {
            let type = sku.types[l];
            for (let p = 0; p < type.subPriceGroups.length; p++) {
              let subPriceGroup = type.subPriceGroups[p];
              subPriceGroup.priceGroups = JSON.parse(
                JSON.stringify(vm.meta.priceGroups)
              );
            }
            for (let p = 0; p < type.subByChoices.length; p++) {
              let subByChoice = type.subByChoices[p];
              subByChoice.priceGroups = JSON.parse(
                JSON.stringify(vm.meta.priceGroups)
              );
            }
          }
          newRetail.retails.mtoSKUs.push(sku);
        }
        vm.retails.push(newRetail);
      } else {
        let indexDate = vm.retailHead.selectedRetailDate.index;
        let newRetail = JSON.parse(JSON.stringify(vm.retails[indexDate]));

        newRetail.effective_date = vm.retailHead.effective_date;
        newRetail.retail_reason_id = vm.retailHead.retail_reason_id;
        newRetail.price_type_id = vm.retailHead.price_type_id;
        newRetail.isUpdate = true;
        newRetail.isNewRetail = true;
        var rulePercentValue = 0;
        if (vm.retailHead.method === "off") {
          rulePercentValue = -vm.retailHead.percentNumber;
        } else if (vm.retailHead.method === "inc") {
          rulePercentValue = vm.retailHead.percentNumber;
        } else if (vm.retailHead.method === "manual") {
          rulePercentValue = vm.retailHead.percentNumber;
        }
        //:STOCK SKUS RETAIL
        for (let i = 0; i < newRetail.retails.stockSKUs.length; i++) {
          let pgs = newRetail.retails.stockSKUs[i].priceGroups;
          for (let j = 0; j < pgs.length; j++) {
            if (
              vm.retailHead.isStock &&
              (!vm.retailHead.applyTo ||
                vm.retailHead.applyTo.pricing_class_udd_line_id ===
                  pgs[j].pricing_class_udd_line_id)
            ) {
              pgs[j].retail += (pgs[j]["retail"] * rulePercentValue) / 100;
            } else {
              pgs[j].retail = null;
            }
          }
        }
        //:STOCK PLUS SKUS RETAIL
        for (let i = 0; i < newRetail.retails.stockPlusSKUs.length; i++) {
          let pgs = newRetail.retails.stockPlusSKUs[i].priceGroups;
          for (let j = 0; j < pgs.length; j++) {
            if (
              vm.retailHead.isStockPlus &&
              (!vm.retailHead.applyTo ||
                vm.retailHead.applyTo.pricing_class_udd_line_id ===
                  pgs[j].pricing_class_udd_line_id)
            ) {
              pgs[j].retail += (pgs[j]["retail"] * rulePercentValue) / 100;
            } else {
              pgs[j].retail = null;
            }
          }
        }
        //: MTO SKU Retail
        for (let i = 0; i < newRetail.retails.mtoSKUs.length; i++) {
          let obj = newRetail.retails.mtoSKUs[i];
          let pgs = newRetail.retails.mtoSKUs[i].priceGroups;
          for (let j = 0; j < pgs.length; j++) {
            if (
              vm.retailHead.isMTO &&
              (!vm.retailHead.applyTo ||
                vm.retailHead.applyTo.pricing_class_udd_line_id ===
                  pgs[j].pricing_class_udd_line_id)
            ) {
              pgs[j].retail += (pgs[j]["retail"] * rulePercentValue) / 100;
            } else {
              pgs[j].retail = null;
            }
          }
          for (let l = 0; l < obj.types.length; l++) {
            let type = obj.types[l];
            for (let p = 0; p < type.subPriceGroups.length; p++) {
              let subPriceGroup = type.subPriceGroups[p];
              for (let j = 0; j < subPriceGroup.priceGroups.length; j++) {
                let pg = subPriceGroup.priceGroups[j];
                if (
                  vm.retailHead.isMTO &&
                  (!vm.retailHead.applyTo ||
                    vm.retailHead.applyTo.pricing_class_udd_line_id ===
                      pg.pricing_class_udd_line_id)
                ) {
                  pg["retail"] =
                    pg["retail"] + (pg["retail"] * rulePercentValue) / 100;
                } else {
                  pg["retail"] = null;
                }
              }
            }
            for (let p = 0; p < type.subByChoices.length; p++) {
              let subByChoice = type.subByChoices[p];
              for (let j = 0; j < subByChoice.priceGroups.length; j++) {
                let pg = subByChoice.priceGroups[j];
                if (
                  vm.retailHead.isMTO &&
                  (!vm.retailHead.applyTo ||
                    vm.retailHead.applyTo.pricing_class_udd_line_id ===
                      pg.pricing_class_udd_line_id)
                ) {
                  pg["retail"] =
                    pg["retail"] + (pg["retail"] * rulePercentValue) / 100;
                } else {
                  pg["retail"] = null;
                }
              }
            }
          }
        }
        vm.retails.push(newRetail);
      }
    };

    vm.createPriceChange = function(forWhichRetail, isApply) {
      vm.retail_error_message = null;
      let start_date = moment(
        vm.retailHead.effective_date,
        $scope.date_format
      ).format("YYYY-MM-DD");
      let payload = {
        skuIds: vm.meta.skuIds,
        mtoSKUIds: vm.meta.mtoSKUIds,
        price_type_id: vm.retailHead.price_type_id,
        retail_reason_id: vm.retailHead.retail_reason_id,
        effective_date: start_date
      };
      RetailService.API.ValidateRetails(payload)
        .then(res => {
          if (res.status === 200) {
            vm.disableRetailProceedBtn = false;
            if (!isApply) {
              vm.generateNewRetail(forWhichRetail); // creating new retail
            } else if (forWhichRetail == 1) {
              vm.applyClassificationForCurrentRetail(); // apply discount,reason etc for current retail
            } else {
              vm.applyClassificationToNextRetail(); // apply discount,reason etc for next retail
            }
            vm.isRetails = true;
            vm.isSave = true;
          }
        })
        .catch(err => {
          if (err.data.status === 412) {
            vm.disableRetailProceedBtn = true;
            vm.retail_error_message =
              err.data.message + " ( " + err.data.errors + " )";
            common.$timeout(() => {
              vm.retail_error_message = null;
            }, 2500);
          }
        });
    };

    vm.applynproceed = () => {
      vm.retailPublish = true;
    };

    vm.disableRetailProceed = () => {
      vm.disableRetailProceedBtn = true;
    };

    vm.getMTOPriceGroups = () => {
      MTOPriceGroupService.API.GetMtoPriceGroups()
        .then(response => {
          vm.mto_price_groups = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.priceTypeMap = {};
    vm.getRetailPriceTypes = () => {
      RetailService.API.GetRetailPriceTypes()
        .then(response => {
          vm.price_types = response.data;
          for (let j = 0; j < response.data.length; j++) {
            vm.priceTypeMap[response.data[j]["id"]] = response.data[j];
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getRetailReasons = () => {
      RetailService.API.GetRetailReasons()
        .then(response => {
          vm.retail_reasons = response.data;
          for (let j = 0; j < response.data.length; j++) {
            vm.retailReasonsMap[response.data[j]["id"]] = response.data[j];
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getSkuRetails = () => {
      vm.loadRetailDetail();
      vm.isSkuSelectionModal = false;
      vm.isShowSkuRetails = true;
    };

    vm.loadRetailDetail = () => {
      vm.skuIds = [];
      for (let i = 0; i < vm.Skus.length; i++) {
        vm.Skus[i].checked === true ? vm.skuIds.push(vm.Skus[i].id) : null;
      }
    };

    vm.initialize = () => {
      vm.getItemById($stateParams.item_id);
      if (vm.skuIds.length > 1) {
        vm.getRetailPriceTypes();
        vm.getRetailReasons();
        vm.showSKURetails(vm.skuIds);
      } else if (vm.skuIds.length === 1) {
        common.$state.go("common.prime.itemMaintenance.sku.retail", {
          item_id: $stateParams.item_id,
          id: vm.skuIds[0]
        });
      } else if (vm.skuIds.length === 0) {
        vm.error = "Please select the SKUs to proceed.";
      }
    };

    vm.getItemById = selected_item_id => {
      ItemService.API.GetItemById(selected_item_id).then(response => {
        vm.selected_item = response[0];
      });
    };

    vm.isLoaded = false;
    vm.isRetailScreen = true;
    vm.isPriceGroups = true;
    vm.showSKURetails = skuIds => {
      vm.retailHead = {};
      vm.isSave = false;
      RetailService.API.GetSKURetailMap(skuIds)
        .then(retail => {
          vm.retails = retail.data.retails;
          vm.meta = retail.data.meta;
          vm.mtoSKUs = retail.data.meta.mtoSKUs;
          vm.isLoaded = true;

          if (vm.retails.length > 0) {
            $scope.isCurrentRetail = true;
            $scope.retail_name = "Set New Retail";
            vm.isRetails = true;
          } else {
            vm.isRetails = false;
          }
          if (
            vm.meta.stockSKUs === undefined &&
            vm.meta.mtoSKUs === undefined &&
            vm.meta.stockPlusSKUs === undefined
          ) {
            vm.isRetailScreen = false;
          }
          if (vm.meta.priceGroups.length === 0) {
            vm.isPriceGroups = false;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.saveRetail = function(obj, flag) {
      return new Promise(function(resolve, reject) {
        RetailService.API.UpdateSKURetail(obj)
          .then(response => {
            vm.retailUpdateFlag = flag;
          })
          .catch(error => {
            logger.error(error);
          });
      });
    };

    vm.saveMTOSKURetail = function(obj, flag) {
      return new Promise(function(resolve, reject) {
        RetailService.API.UpdateMTOSKURetail(obj)
          .then(response => {
            vm.retailUpdateFlag = flag;
            resolve("Success");
          })
          .catch(error => {
            logger.error(error);
            //reject(error);
          });
      });
    };
    vm.saveRetailItem = (retail, priceGroup, sku) => {
      if (vm.isRetails) {
        let payload = {};
        let effective_date = retail.effective_date;
        payload["itemtypeid"] = vm.selected_item.type_id;
        payload["retail_reason_id"] = retail.retail_reason_id;
        payload["price_type_id"] = retail.price_type_id;
        payload["effective_date"] = effective_date;
        payload["ref_percent"] = 1;
        payload["status_id"] = 200;
        payload["apply_all_flag"] = 0;
        payload["apply_percent"] = 1;
        payload["sku_id"] = sku.id;
        payload["sku_retail"] = priceGroup.retail;
        payload["udd_id"] = priceGroup.pricing_class_udd_id;
        payload["udd_line_id"] = priceGroup.pricing_class_udd_line_id;
        vm.saveRetail(payload, false);
      }
    };

    vm.saveMTORetailItem = mtoInfo => {
      if (vm.isRetails) {
        let payload = {};
        let effective_date = mtoInfo.retail.effective_date;
        payload["itemtypeid"] = vm.selected_item.type_id;
        payload["retail_reason_id"] = mtoInfo.retail.retail_reason_id;
        payload["price_type_id"] = mtoInfo.retail.price_type_id;
        payload["effective_date"] = effective_date;
        payload["ref_percent"] = 1;
        payload["status_id"] = 200;
        payload["apply_all_flag"] = 0;
        payload["apply_percent"] = 1;
        payload["sku_id"] = mtoInfo.sku.id;
        payload["sku_retail"] = mtoInfo.priceGroup.retail;
        payload["udd_id"] = mtoInfo.priceGroup.pricing_class_udd_id;
        payload["udd_line_id"] = mtoInfo.priceGroup.pricing_class_udd_line_id;

        if (mtoInfo.is_price_group == 2) {
          payload["is_price_group"] = 2;
          payload["option_id"] = null;
          payload["price_group_id_or_choice_id"] = null;
        } else if (mtoInfo.is_price_group == 1) {
          payload["is_price_group"] = 1;
          payload["option_id"] = mtoInfo.price_group.option_id;
          payload["price_group_id_or_choice_id"] =
            mtoInfo.price_group.choice_price_group_id;
        } else if (mtoInfo.is_price_group == 0) {
          payload["is_price_group"] = 0;
          payload["option_id"] = mtoInfo.choice.option_id;
          payload["price_group_id_or_choice_id"] = mtoInfo.choice.choice_id;
        }
        vm.saveMTOSKURetail(payload, false);
      }
    };

    vm.fetchRetailRuleGroups = () => {
      RetailService.API.FetchRetailRuleGroups()
        .then(response => {
          vm.roundingRuleGroups = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.isRetailRoundingRules = () => {
      $("#roundingrules").modal("show");
    };

    vm.save_current_retail = function(forWhichRetail) {
      var payload = {};
      payload["itemtypeid"] = vm.selected_item.type_id;
      if (forWhichRetail === 1) {
        let retailSKUList = [];
        let promises = [];
        let effective_date = moment(
          vm.retailHead.effective_date,
          $scope.date_format
        ).format("YYYY-MM-DD");
        payload["retail_reason_id"] = vm.retailHead.retail_reason_id;
        payload["price_type_id"] = vm.retailHead.price_type_id;
        payload["effective_date"] = effective_date;

        payload["ref_percent"] = 1;
        payload["status_id"] = vm.retailHead.status_id;
        payload["apply_all_flag"] = 0;
        payload["apply_percent"] = 1;
        //:STOCK SKUS RETAIL
        for (let i = 0; i < vm.retails[0].retails.stockSKUs.length; i++) {
          let obj = vm.retails[0].retails.stockSKUs[i];
          for (let j = 0; j < obj.priceGroups.length; j++) {
            let payloadToUpsert = {
              sku_id: obj.id,
              sku_retail: obj.priceGroups[j].retail,
              udd_id: obj.priceGroups[j]["pricing_class_udd_id"],
              udd_line_id: obj.priceGroups[j]["pricing_class_udd_line_id"]
            };
            angular.extend(payloadToUpsert, payload);
            vm.saveRetail(payloadToUpsert, true);
          }
        }
        //:STOCK PLUS SKUS RETAIL
        for (let i = 0; i < vm.retails[0].retails.stockPlusSKUs.length; i++) {
          let obj = vm.retails[0].retails.stockPlusSKUs[i];
          for (let j = 0; j < obj.priceGroups.length; j++) {
            let payloadToUpsert = {
              sku_id: obj.id,
              sku_retail: obj.priceGroups[j].retail,
              udd_id: obj.priceGroups[j]["pricing_class_udd_id"],
              udd_line_id: obj.priceGroups[j]["pricing_class_udd_line_id"]
            };
            angular.extend(payloadToUpsert, payload);
            vm.saveRetail(payloadToUpsert, true);
          }
        }

        //: MTO SKU RETAIL
        for (let i = 0; i < vm.retails[0].retails.mtoSKUs.length; i++) {
          let obj = vm.retails[0].retails.mtoSKUs[i];
          for (let j = 0; j < obj.priceGroups.length; j++) {
            let payloadToUpsert = {
              sku_id: obj.id,
              sku_retail: obj.priceGroups[j].retail,
              udd_id: obj.priceGroups[j]["pricing_class_udd_id"],
              udd_line_id: obj.priceGroups[j]["pricing_class_udd_line_id"],
              is_price_group: 2,
              price_group_id_or_choice_id: null,
              option_id: null
            };
            angular.extend(payloadToUpsert, payload);
            vm.saveMTOSKURetail(payloadToUpsert, true);
          }

          for (let j = 0; j < obj.types.length; j++) {
            let mto_type = obj.types[j];
            for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
              let subPriceGroup = mto_type.subPriceGroups[k];
              for (let l = 0; l < subPriceGroup.priceGroups.length; l++) {
                let payloadToUpsert = {
                  sku_id: obj.id,
                  sku_retail: subPriceGroup.priceGroups[l].retail,
                  udd_id: subPriceGroup.priceGroups[l]["pricing_class_udd_id"],
                  udd_line_id:
                    subPriceGroup.priceGroups[l]["pricing_class_udd_line_id"],
                  is_price_group: 1,
                  price_group_id_or_choice_id:
                    subPriceGroup.choice_price_group_id,
                  option_id: subPriceGroup.option_id
                };
                angular.extend(payloadToUpsert, payload);
                vm.saveMTOSKURetail(payloadToUpsert, true);
              }
            }

            for (let l = 0; l < mto_type.subByChoices.length; l++) {
              let subByChoice = mto_type.subByChoices[l];
              for (let l = 0; l < subByChoice.priceGroups.length; l++) {
                let payloadToUpsert = {
                  sku_id: obj.id,
                  sku_retail: subByChoice.priceGroups[l].retail,
                  udd_id: subByChoice.priceGroups[l]["pricing_class_udd_id"],
                  udd_line_id:
                    subByChoice.priceGroups[l]["pricing_class_udd_line_id"],
                  is_price_group: 0,
                  price_group_id_or_choice_id: subByChoice.choice_id,
                  option_id: subByChoice.option_id
                };
                angular.extend(payloadToUpsert, payload);
                vm.saveMTOSKURetail(payloadToUpsert, true);
              }
            }
          }
        }
      } else {
        payload["apply_all_flag"] = 0;
        payload["apply_percent"] = 1;
        payload["retail_reason_id"] = vm.retailHead.retail_reason_id;
        payload["price_type_id"] = vm.retailHead.price_type_id;
        payload["effective_date"] = moment(
          vm.retailHead.effective_date,
          $scope.date_format
        ).format("YYYY-MM-DD");
        payload["ref_percent"] = 1;
        payload["status_id"] = 200; //by default active

        //:STOCK SKUS RETAIL
        for (
          let i = 0;
          i < vm.retails[vm.retails.length - 1].retails.stockSKUs.length;
          i++
        ) {
          let obj = vm.retails[vm.retails.length - 1].retails.stockSKUs[i];
          for (let j = 0; j < obj.priceGroups.length; j++) {
            if (
              vm.retailHead.isStock &&
              (!vm.retailHead.applyTo ||
                vm.retailHead.applyTo.pricing_class_udd_line_id ===
                  obj.priceGroups[j].pricing_class_udd_line_id)
            ) {
              let payloadToUpsert = {
                sku_id: obj.id,
                sku_retail: obj.priceGroups[j].retail,
                udd_id: obj.priceGroups[j]["pricing_class_udd_id"],
                udd_line_id: obj.priceGroups[j]["pricing_class_udd_line_id"]
              };
              angular.extend(payloadToUpsert, payload);
              vm.saveRetail(payloadToUpsert, true);
            }
          }
        }

        //:STOCK PLUS SKUS RETAIL
        for (
          let i = 0;
          i < vm.retails[vm.retails.length - 1].retails.stockPlusSKUs.length;
          i++
        ) {
          let obj = vm.retails[vm.retails.length - 1].retails.stockPlusSKUs[i];
          for (let j = 0; j < obj.priceGroups.length; j++) {
            if (
              vm.retailHead.isStockPlus &&
              (!vm.retailHead.applyTo ||
                vm.retailHead.applyTo.pricing_class_udd_line_id ===
                  obj.priceGroups[j].pricing_class_udd_line_id)
            ) {
              let payloadToUpsert = {
                sku_id: obj.id,
                sku_retail: obj.priceGroups[j].retail,
                udd_id: obj.priceGroups[j]["pricing_class_udd_id"],
                udd_line_id: obj.priceGroups[j]["pricing_class_udd_line_id"]
              };
              angular.extend(payloadToUpsert, payload);
              vm.saveRetail(payloadToUpsert, true);
            }
          }
        }
        //: MTO SKU RETAIL
        for (
          let i = 0;
          i < vm.retails[vm.retails.length - 1].retails.mtoSKUs.length;
          i++
        ) {
          let obj = vm.retails[vm.retails.length - 1].retails.mtoSKUs[i];
          for (let j = 0; j < obj.priceGroups.length; j++) {
            if (
              vm.retailHead.isMTO &&
              (!vm.retailHead.applyTo ||
                vm.retailHead.applyTo.pricing_class_udd_line_id ===
                  obj.priceGroups[j].pricing_class_udd_line_id)
            ) {
              let payloadToUpsert = {
                sku_id: obj.id,
                sku_retail: obj.priceGroups[j].retail,
                udd_id: obj.priceGroups[j]["pricing_class_udd_id"],
                udd_line_id: obj.priceGroups[j]["pricing_class_udd_line_id"],
                is_price_group: 2,
                price_group_id_or_choice_id: null,
                option_id: null
              };
              angular.extend(payloadToUpsert, payload);
              vm.saveMTOSKURetail(payloadToUpsert, true);
            }
          }

          for (let j = 0; j < obj.types.length; j++) {
            let mto_type = obj.types[j];
            for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
              let subPriceGroup = mto_type.subPriceGroups[k];
              for (let l = 0; l < subPriceGroup.priceGroups.length; l++) {
                let pg = subPriceGroup.priceGroups[l];
                if (
                  vm.retailHead.isMTO &&
                  (!vm.retailHead.applyTo ||
                    vm.retailHead.applyTo.pricing_class_udd_line_id ===
                      pg.pricing_class_udd_line_id)
                ) {
                  let payloadToUpsert = {
                    sku_id: obj.id,
                    sku_retail: pg.retail,
                    udd_id: pg["pricing_class_udd_id"],
                    udd_line_id: pg["pricing_class_udd_line_id"],
                    is_price_group: 1,
                    price_group_id_or_choice_id:
                      subPriceGroup.choice_price_group_id,
                    option_id: subPriceGroup.option_id
                  };
                  angular.extend(payloadToUpsert, payload);
                  vm.saveMTOSKURetail(payloadToUpsert, true);
                }
              }
            }

            for (let l = 0; l < mto_type.subByChoices.length; l++) {
              let subByChoice = mto_type.subByChoices[l];
              for (let l = 0; l < subByChoice.priceGroups.length; l++) {
                let pg = subByChoice.priceGroups[l];
                if (
                  vm.retailHead.isMTO &&
                  (!vm.retailHead.applyTo ||
                    vm.retailHead.applyTo.pricing_class_udd_line_id ===
                      pg.pricing_class_udd_line_id)
                ) {
                  let payloadToUpsert = {
                    sku_id: obj.id,
                    sku_retail: pg.retail,
                    udd_id: pg["pricing_class_udd_id"],
                    udd_line_id: pg["pricing_class_udd_line_id"],
                    is_price_group: 0,
                    price_group_id_or_choice_id: subByChoice.choice_id,
                    option_id: subByChoice.option_id
                  };
                  angular.extend(payloadToUpsert, payload);
                  vm.saveMTOSKURetail(payloadToUpsert, true);
                }
              }
            }
          }
        }
      }
      vm.retailPublish = false;
    };

    vm.setValidationRules = () => {
      valdr.addConstraints({
        "RULES-RETAIL": {
          effective_date: {
            nextEffectiveDate: {
              message:
                "Retail(s) cannot be maintained/updated! Start date is less than or equal to current date"
            },
            required: {
              message: "Retail date is required."
            }
          }
        }
      });
    };

    vm.goToListSkusPage = () => {
      vm.isSkuSelectionModal = true;
      vm.isShowSkuRetails = false;
    };

    vm.createNew = () => {
      vm.retailUpdateFlag = false;
      vm.showSKURetails();
    };
    vm.closeForm = () => {
      vm.showRetailForm = false;
      vm.retailHead = {};
      vm.retailUpdateFlag = false;
      vm.showSKURetails();
    };
    vm.toggleRetailSidePanel = flag => {
      vm.disableRetailProceedBtn = true;
      vm.retail_error_message = null;
      vm.showRetailForm = flag;
      vm.retailUpdateFlag = false;

      if (vm.retail_form) {
        vm.retail_form.$setPristine(true);
      }
      vm.retailHead = {};
      if (vm.isSave && vm.retails.length > 0) {
        vm.retails = vm.retails.slice(0, -1);
      }
      vm.isSave = false;
    };
    activate();

    function activate() {
      $scope.getStatuses(4); //GET current statuses for item
      let getskus = vm.GetSKUs();
      getskus.then(res => {
        vm.initialize();
      });
      // vm.loadRetailDetail();
      //vm.setValidationRules();
    }
  }
})();
