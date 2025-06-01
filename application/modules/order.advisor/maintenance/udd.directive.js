(function () {
  "use strict";
  angular
    .module("rc.prime.orderadvisor")
    .controller("UDDController", UDDController);

  UDDController.$inject = [
    "$scope",
    "common",
    "$state",
    "$stateParams",
    "OrderAdvisorServices",
    "DataLakeAPIService",
    "SKUService",
    "ItemService"
  ];

  function UDDController(
    $scope,
    common,
    $state,
    $stateParams,
    OrderAdvisorServices,
    DataLakeAPIService,
    SKUService,
    ItemService

  ) {
    let logger = common.Logger.getInstance("UDDController");
    this.OrderAdvisorServices = OrderAdvisorServices.OrderAdvisor;
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    // Variable to toggle the show add sku panel
    this.showAddSKUPanel = false;

    this.isShowAddCancelButton = false;
    this.SKUServiceFactory = SKUService;
    this.ItemService
    this.DataLakeFactory = DataLakeAPIService;
    // this.switchscreen=true;
    this.skuIds = [];
    this.searchedSKUList = [];
    this.successMessageforReplace = ''
    this.showSearchPanel = false;
    this.isSellable = true
    this.searched_isSellable = true
    this.textForReplaceandDelete = 'Replace';
    this.AllOptionsChoices = [];
    this.isAvailableinotherOptions = false;
    this.SelectedSKU = undefined;
    this.Sku = undefined;
    this.isProcessing = false;
    this.isUpdateSuccess = false;
    this.isUpdateerror = false;
    this.isLoadingDetails = false;
    this.oldDiscountChoiceDetails = {};
    this.uddOptionChoiceId = []
    this.btntext = "Submit"
    //Initial Load of controller by fetching the UDDs for the selected type
    this.Activate = () => {
      this.isLoadingOptions = true;
      this.PackageTypes = [];
      this.Packages = [];
      //Fetch UDDs by the type selected in order advisor
      this.OrderAdvisorServices.TypeUDD.FetchUDDsForType(
        this.$scope.$parent.advisorController.OrderAdvisor.adviser_type_id
      )
        .then(response => {
          this.UDDs = response.data;
          this.isLoadingOptions = false;
          this.FetchAvailablePackages(
            this.$scope.$parent.advisorController.OrderAdvisor.adviser_type_id
          );
          SKUService.API.FeatchAllOptionsChoices(
            this.$scope.$parent.advisorController.OrderAdvisor.id
          ).then(response => {
            this.AllOptionsChoices = response.data;
          })

        })
        .catch(error => {
          this.isLoadingOptions = false;
          logger.error(error);
        });
    };




    //Fetch available packages for selected type
    this.FetchAvailablePackages = typeId => {
      this.OrderAdvisorServices.Packages.FetchPackages()
        .then(response => {
          this.PackageTypes = [];
          this.Packages = response.data;
          this.OrderAdvisorServices.Packages.FetchPackagesForAType(typeId).then(
            response => {
              this.AvailableTypePackages = response.data;
              this.PackagesMap = new Map();
              _.each(this.Packages, packageObject => {
                packageObject.isPresent = this.AvailableTypePackages.some(function (el) { return el.package_id === packageObject.id });
                if (packageObject.isPresent) this.PackagesMap[packageObject.id] = packageObject;
                _.each(response.data, typepackageObject => {
                  Number(typepackageObject.package_id) ===
                    Number(packageObject.id)
                    ? this.PackageTypes.push(packageObject)
                    : null;
                });
              });
              this.isPackagesFetched = true;
            }
          );
        })
        .catch(error => {
          this.logger.error(error);
        });
    };

    this.resetSkuProperties = () => {
      this.searched_sku_number = undefined;
      this.noSkuFound = false;
      this.skuDoesNotExist = false;
      this.invalidSKuStatus = false;
    }

    //On click of each option, load the choices linked to the options by order advisor
    this.FetchAvailableSkusForUDD = udd => {
      if (this.deleted_sku) this.deleted_sku = parseInt(this.deleted_sku);
      if (this.udd.UddSKUs?.length && udd.is_deleted) {
        this.udd.UddSKUs = this.udd.UddSKUs.filter(x => (x.sku_id !== this.deleted_sku) && (x.order_advisor_udd_id === udd.id));
      }
      if (this.UddSKUs && this.UddSKUs.length > 0) {
        for (let i = 0; i < this.UddSKUs.length; i++) {
          if (this.UddSKUs[i] && this.UddSKUs[i].sku_id && (this.UddSKUs[i].order_advisor_udd_id == udd.id)) {
            if (!Array.isArray(udd.skuIds)) {
              udd.skuIds = [];
            }
            if (this.UddSKUs[i].choiceIds) {
              this.UddSKUs[i].choice_id && this.UddSKUs[i].choice_id != 0
                ? (this.UddSKUs[i].choiceIds = this.UddSKUs[i].choice_id.split(","))
                : null;
            }
            if (!Array.isArray(this.udd.UddSKUs)) {
              this.udd.UddSKUs = [];
            }

            if (!udd.skuIds.includes(this.UddSKUs[i].sku_id.toString())) {
              udd.skuIds.push(this.UddSKUs[i].sku_id.toString());
            }

            const existingItem = this.udd.UddSKUs.find(item => item.sku_id === this.UddSKUs[i].sku_id);
            if (!existingItem && existingItem != undefined) {
              this.udd.UddSKUs.push(this.UddSKUs[i]);
            }

          }
        }
      }
      if (this.udd.UddSKUs || udd.is_deleted) {
        this.udd.UddSKUs = this.udd.UddSKUs || [];
      } else {
        this.udd.UddSKUs = [];
      }
      SKUService.API.FetchValueForOrderAdvisorAndUDD(
        this.$scope.$parent.advisorController.OrderAdvisor.id,
        udd.id
      ).then(skuUDDs => {
        this.isChoicesCreated = true;

        //Add the linked choices into skuid array for sku exists validation check
        _.each(skuUDDs.data, skuUdd => {
          skuUdd.choice_id && skuUdd.choice_id != 0
            ? (skuUdd.choiceIds = skuUdd.choice_id.split(","))
            : null;
          // check whether skuUdd contains choiceIds
          if (skuUdd.choiceIds) {
            for (let i = 0; i < skuUdd.choiceIds.length; i++) {
              if (!this.PackagesMap[skuUdd.choiceIds[i]]) {
                skuUdd.choiceIds.splice(i, 1)
              }
            }
          }
          if (!Array.isArray(udd.skuIds)) {
            udd.skuIds = [];
          }
          udd.skuIds.push(skuUdd.sku_id);

          // this.udd.UddSKUs.sku_id.push(skuUDDs.data.sku_id);
          if (skuUdd.original_discount) {
            this.udd.max_discount = skuUdd.original_discount;
            this.udd.spiff = skuUdd.original_spiff;
          }
          udd.inital_entry = skuUdd.inital_entry ? Number(skuUdd.inital_entry) : null;
          this.oldDiscountChoiceDetails = _.clone(udd);
        });
        if (!this.udd.max_discount) {
          this.udd.max_discount = 0.00;
          this.udd.spiff = 0.00;
        }
        // this.udd.UddSKUs = skuUDDs.data;

        this.udd.UddSKUs = this.udd.UddSKUs.concat(skuUDDs.data.filter(item => !this.udd.UddSKUs.some(sku => sku.sku === item.sku && sku.name === item.name)));
        if (this.udd.UddSKUs && this.udd.UddSKUs.length > 0) {
          _.each(this.udd.UddSKUs, uddsku => {
            if (uddsku.display_sequence == 0) {
              uddsku.display_sequence = null;
            }
          });
        }
      }, 2000);
      this.udd.UddSKUs = this.udd.UddSKUs.filter(sku => sku.order_advisor_udd_id === udd.id);
    };

    //Remove the selected Packages from the SKU
    this.RemovePackagesSelected = (udd, choice_id) => {
      typeof choice_id !== "string"
        ? (choice_id = JSON.stringify(choice_id))
        : null;
      if (udd && udd.choiceIds) {
        let index;
        if (udd.choiceIds.every(Number.isInteger)) {
          // If udd.choiceIds is an array of numbers, convert choice_id to a number
          index = udd.choiceIds.indexOf(Number(choice_id));
        } else {
          index = udd.choiceIds.indexOf(choice_id);
        }
        index > -1 ? udd.choiceIds.splice(index, 1) : null;
        this.packageIds = udd.choiceIds;
        let object = {
          choice_id: this.packageIds.join(),
          sku_id: udd.sku_id
        };
        udd.choice_id = object.choice_id;
        // this.OrderAdvisorServices.UddValues.Update(udd.id, object)
        //   .then(response => {

        //     //If true, return variable true
        //     this.isChoicesCreated = true;
        //     // this.UpdateSkuConfiguration(udd);
        //   })
        //   .catch(error => {
        //     //On error, return variable false
        //     this.isChoicesCreated = false;
        //     logger.error(error);
        //     _.each(this.udd.UddSKUs, sku => {
        //       if (sku.sku_id === udd.sku_id) {
        //         let index = sku.choiceIds.findIndex(
        //           choiceId => choiceId == choice_id
        //         );
        //         index > -1 ? sku.choiceIds.splice(index, 1) : null;
        //         sku.choice_id = sku.choiceIds.join();
        //       }
        //     });
        //     _.each(this.UddSKUs, uddSku => {
        //       if (uddSku.sku_id === udd.sku_id) {
        //         let index = uddSku.choiceIds.findIndex(
        //           choiceId => choiceId == choice_id
        //         );
        //         index > -1 ? uddSku.choiceIds.splice(index, 1) : null;
        //       }
        //     });
        //   });
      } else {
        // if choice_id is not selected, then remove from sku.packageIds
        let index = this.Sku.packageIds.findIndex(
          id => id == choice_id
        );
        this.Sku.packageIds.splice(index, 1)
      }
    };

    this.AddPackagesSelected = (sku, packageObject) => {
      if (packageObject.isSelected === true) {
        if (sku && sku.id !== undefined) {
          sku.choiceIds ? null : (sku.choiceIds = []);
          sku.choiceIds.push(JSON.stringify(packageObject.id));
          let object = {
            choice_id: sku.choiceIds.join(),
            sku_id: sku.sku_id
          };
          sku.choice_id = object.choice_id;
          // this.OrderAdvisorServices.UddValues.Update(sku.id, object)
          //   .then(response => {
          //     //If true, return variable true
          //     this.isChoicesCreated = true;
          //   })
          //   .catch(error => {
          //     //On error, return variable false
          //     this.isChoicesCreated = false;
          //     logger.error(error);
          //   });
        } else {
          this.Sku && this.Sku.choiceIds ? null : this.Sku.choiceIds = [];
          this.Sku.choiceIds.push(JSON.stringify(packageObject.id));
          // _.each(this.UddSKUs, uddSku => {
          //   if (uddSku.sku_id === this.Sku.id) {
          //     uddSku.choiceIds = this.Sku.choiceIds;
          //     uddSku.choice_id = this.Sku.choiceIds.join();
          //   }
          // });
          _.each(this.udd.UddSKUs, sku => {
            if (sku.sku_id === this.Sku.id) {
              sku.choice_id = this.Sku.choiceIds.join();
              sku.choiceIds ? null : sku.choiceIds = [];
              sku.choiceIds.push(packageObject.id);
            }
          });
        }
      } else {
        this.RemovePackagesSelected(sku, packageObject.id);
      }
    };

    this.UpdateSkuConfiguration = sku => {
      this.isLoadingDetails = true;
      _.each(this.UddSKUs, uddSku => {
        if (uddSku.order_advisor_udd_id == sku.order_advisor_udd_id) {
          uddSku.default_quantity_value = sku.default_quantity_value;
          uddSku.display_sequence = sku.display_sequence;
          uddSku.allow_quantity_change = sku.allow_quantity_change;
          // uddSku.choice_id = (sku.choiceIds == undefined) ? "" : sku.choiceIds.join();
          uddSku.choiceIds = sku.choiceIds ? sku.choiceIds.map(String) : undefined;
          // uddSku.choice_id = sku.choice_id;
        }
      });
      this.noChangeValue = true;
      this.errorMessage = null;
      this.errorDisplaySequence = false;
      this.errorChangingDisplaySequence = false;
      let presentChoiceId = sku.choiceIds
      let oldChoiceId = sku.oldDetails.choiceIds
      if (oldChoiceId) {
        let valuesChoiceId = oldChoiceId.filter(function (element) {
          return presentChoiceId.indexOf(element) === -1; // Element is missing in arr1
        })
        if (valuesChoiceId) {
          valuesChoiceId.forEach(element => {
            if (!this.uddOptionChoiceId.includes(parseInt(element, 10))) {
              SKUService.API.DeleteOrderAdvisorPackageRetail(sku.sku_id, sku.order_advisor_id, element)
            }
          });
        }
      }
      sku.id = sku.id ? sku.id : sku.sku_id
      this.filterUddSkus = this.udd.UddSKUs.filter(udd => udd.id !== sku.id ? sku.id : sku.sku_id);
      this.udd.UddSKUs = this.udd.UddSKUs.filter(udd => (udd.order_advisor_udd_id == sku.order_advisor_udd_id));
      // _.each(this.filterUddSkus, skuUdd => {
      //   if (sku.display_sequence === skuUdd.display_sequence && sku.display_sequence != null) {
      //     this.errorDisplaySequence = true;
      //     this.noChangeValue = false;
      //     this.errorMessage = "Display Sequence is already used"
      //     this.common.$timeout(() => {
      //       this.errorMessage = null;
      //       sku.display_sequence = sku.oldDisplaySequence;
      //     }, 3000);
      //   }
      // });
      // if (sku.display_sequence === sku.oldDisplaySequence) {
      //   this.errorChangingDisplaySequence = true;
      //   this.errorMessage1 = "Nothing to update"
      //   this.common.$timeout(() => {
      //     this.errorMessage1 = null;
      //   }, 3000);
      // }
      if (((sku.display_sequence === null && sku.oldDisplaySequence === null) ||
        sku.display_sequence === sku.oldDisplaySequence) &&
        ((sku.default_quantity_value === null && sku.oldDetails.default_quantity_value === null) ||
          sku.default_quantity_value === sku.oldDetails.default_quantity_value) &&
        ((sku.allow_quantity_change === undefined && sku.oldDetails.allow_quantity_change === 0) ||
          sku.allow_quantity_change === sku.oldDetails.allow_quantity_change) &&
        ((sku.choice_id === "" && sku.oldDetails.choice_id === "") ||
          sku.choice_id === sku.oldDetails.choice_id)) {
        this.errorChangingDisplaySequence = true;
        this.errorMessage = "Nothing to update";
        this.common.$timeout(() => {
          this.errorMessage = null;
          this.isConfigureSku = false;
          this.isLoadingDetails = false;
        }, 3000);
        return; // Exit function if no changes
      }
      if (this.errorDisplaySequence === false) {
        this.noChangeValue = true;
        if (sku && (sku.id !== undefined || sku.sku_id != undefined)) {
          let object = {
            default_quantity_value: sku.default_quantity_value,
            display_sequence: sku.display_sequence,
            allow_quantity_change: sku.allow_quantity_change,
            choice_id: sku.choice_id,
            sku_id: sku.sku_id
          };
          // _.each(this.UddSKUs, uddSku => {
          //   if (uddSku.order_advisor_udd_id == sku.order_advisor_udd_id) {
          //     uddSku.default_quantity_value = sku.default_quantity_value;
          //     uddSku.display_sequence = sku.display_sequence;
          //     uddSku.allow_quantity_change = sku.allow_quantity_change;
          //     // uddSku.choice_id = (sku.choiceIds == undefined) ? "" : sku.choiceIds.join();
          //     uddSku.choiceIds = sku.choiceIds ? sku.choiceIds.map(String) : undefined;
          //     // uddSku.choice_id = sku.choice_id;
          //   }
          // });
          this.OrderAdvisorServices.UddValues.Update(sku.id ? sku.id : sku.sku_id, object)
            .then(response => {
              this.successMessage = "SKU Updated Successfully"
              //If true, return variable true
              this.isChoicesCreated = true;
              _.each(this.UddSKUs, uddSku => {
                if (uddSku.order_advisor_udd_id == sku.order_advisor_udd_id) {
                  uddSku.default_quantity_value = sku.default_quantity_value;
                  uddSku.display_sequence = sku.display_sequence;
                  uddSku.allow_quantity_change = sku.allow_quantity_change;
                  // uddSku.choice_id = (sku.choiceIds == undefined) ? "" : sku.choiceIds.join();
                  uddSku.choiceIds = sku.choiceIds ? sku.choiceIds.map(String) : undefined;
                  // uddSku.choice_id = sku.choice_id;
                }
              });
              this.OrderAdvisorServices.UddValues.FetchValueForOrderAdvisorAndUDD(
                this.$scope.$parent.advisorController.OrderAdvisor.id,
                this.udd.id
              ).then(skuUDDs => {
                //Add the linked choices into skuid array for sku exists validation check
                _.each(skuUDDs.data, skuUdd => {
                  if (sku.sku_id == skuUdd.sku_id) {
                    skuUdd.choice_id && skuUdd.choice_id != 0
                      ? (skuUdd.choiceIds = skuUdd.choice_id.split(","))
                      : null;
                    let index = this.udd.UddSKUs.findIndex(
                      udd => udd.sku_id === skuUdd.sku_id
                    );
                    this.udd.UddSKUs[index] = skuUdd;
                  }
                });
              });
              this.common.$timeout(() => {
                this.isLoadingDetails = false;
                this.isConfigureSku = false;
                this.noChangeValue = false;
                this.successMessage = null;
                this.SelectedSKU = undefined;
                this.udd.is_deleted = false;
                this.FetchAvailableSkusForUDD(this.udd);
              }, 2000);
            })
            .catch(error => {
              //On error, return variable false
              this.isChoicesCreated = false;
              logger.error(error);
              this.isLoadingDetails = false;
            });

        } else {
          // _.each(this.UddSKUs, uddSku => {
          //   if (uddSku.sku_id == this.Sku.id) {
          //     uddSku.default_quantity_value = uddSku.default_quantity_value ? uddSku.default_quantity_value : this.Sku.default_quantity_value;
          //     uddSku.display_sequence = uddSku.display_sequence ? uddSku.display_sequence : this.Sku.display_sequence,
          //       uddSku.allow_quantity_change = uddSku.allow_quantity_change ? uddSku.allow_quantity_change : this.Sku.allow_quantity_change;
          //     // uddSku.choice_id = (sku.choiceIds == undefined) ? "" : sku.choiceIds.join();
          //     uddSku.choiceIds = this.Sku.packageIds;
          //     uddSku.choice_id = this.Sku.packageIds ? this.Sku.packageIds.join() : ""
          //     // uddSku.choiceIds = uddSku.choice_id.join();
          //     // uddSku.choiceIds.push(packageObject.id);
          //   }
          // });
          // _.each(this.udd.UddSKUs, sku => {
          //   if (sku.sku_id == this.Sku.id) {
          //     sku.default_quantity_value = sku.default_quantity_value;
          //     sku.display_sequence = sku.display_sequence,
          //       sku.allow_quantity_change = sku.allow_quantity_change;
          //   }
          // });
          this.isConfigureSku = false;
          this.successMessage = null;
          // this.udd.is_deleted = false;
        }

      }
    };

    this.SelectedPackages = (selectedPackages, udd) => {
      this.Sku.packageIds === undefined ? (this.Sku.packageIds = []) : null;
      this.successMessage = null;
      if (selectedPackages.isSelected === true) {
        this.Sku.packageIds.push(selectedPackages.id);
        this.FetchAvailableSkusForUDD(udd)
      } else {
        let index = this.Sku.packageIds.findIndex(packageId => packageId == selectedPackages.id);
        index > -1 ? this.Sku.packageIds.splice(index, 1) : null;
      }
    };

    //Show the choices panel by selected order advisor options
    this.OpenUDDConfigurations = udd => {
      this.switchscreen = false;
      udd.skuUddConfiguration = true;
      udd.skuUdddiscountConfiguration = false;
      udd.isShowudd_maxdiscount = false;
      udd.isShowudd_spiff = false;
      // udd.is_deleted = false;
      this.udd = udd;
      this.udd.UddSKUs = udd.UddSKUs && udd.UddSKUs.filter(x => {
        // Ensure the comparison is correct, logging to debug if needed
        return String(x.order_advisor_udd_id) === String(udd.id); // Ensure types match
      }, 2000);

      this.udd.UddSKUs = this.udd.UddSKUs && (this.udd.UddSKUs.filter(x => (x.order_advisor_udd_id === udd.id)));
      this.showAddSKUPanel = false;
      this.isConfigureSku = false;
      //If the state is in update, fetch the existing UDD lists for the option selected
      if (
        this.$stateParams.id &&
        this.$state.current.name.includes(".update")
      ) {
        udd.skuIds = [];
        this.FetchAvailableSkusForUDD(udd);
        if (this.isChoicesCreated && this.SelectedSKU) {

          if (!this.noChangeValue) {
            this.SelectedSKU.display_sequence = this.SelectedSKU.oldDisplaySequence;
            this.SelectedSKU.default_quantity_value = this.SelectedSKU.oldDetails.default_quantity_value;
            this.SelectedSKU.allow_quantity_change = this.SelectedSKU.oldDetails.allow_quantity_change;
          }
          if (this.udd.UddSKUs?.length) {
            let omitKeys = ["adviser_type"];
            let hasChanges = false;
            _.each(this.udd.UddSKUs, sku => {
              for (let key in sku) {
                if (
                  sku.oldDetails &&
                  sku &&
                  sku.oldDetails[key] != sku[key] && // NO TYPE CHECK
                  !omitKeys.includes(key)
                ) {
                  hasChanges = true;
                  // this.UpdateSkuConfiguration(sku);
                  break;
                }
              }
              if (hasChanges && (sku.choice_id != (sku.oldDetails ? sku.oldDetails.choice_id : null))) {
                sku.choice_id = sku.oldDetails ? sku.oldDetails.choice_id : sku.choice_id;
                sku.choiceIds = sku.oldDetails ? sku.oldDetails.choiceIds : sku.choiceIds;
                // this.UpdateSkuConfiguration(sku)
              }
            })
          }
        }
      }
    };

    //Show the discounts panel by selected order advisor options
    this.OpenUDDDiscountConfigurations = udd => {
      this.switchscreen = false;
      udd.skuUdddiscountConfiguration = true;
      udd.skuUddConfiguration = false;
      udd.isShowudd_maxdiscount = false;
      udd.isShowudd_spiff = false;
      udd.disablespiff = false;
      // udd.is_deleted = false;
      this.udd = udd;
      this.showAddSKUPanel = false;
      this.isConfigureSku = false;
      //If the state is in update, fetch the existing UDD lists for the option selected
      if (
        this.$stateParams.id &&
        this.$state.current.name.includes(".update")
      ) {
        udd.skuIds = [];
        this.FetchAvailableSkusForUDD(udd);
      }
    };

    // Function to format SKU number in 'xxxx-xxx' format
    this.FormatSkuNumber = (udd) => {

      this.isSearchingSku = true;
      if (this.searched_sku_number && this.searched_sku_number !== "") {
        if (this.searched_sku_number.length < 8) {
          if (this.searched_sku_number.length == 7) {
            this.searched_sku_number = "00000000" + this.searched_sku_number;
            !this.searched_sku_number.includes("-") ?
              (this.searched_sku_number = this.searched_sku_number.substr(
                this.searched_sku_number.length - 9,
                this.searched_sku_number.length
              )) :
              (this.searched_sku_number = this.searched_sku_number.substr(
                this.searched_sku_number.length - 10,
                this.searched_sku_number.length
              ));
            !this.searched_sku_number.includes("-") ?
              (this.searched_sku_number =
                this.searched_sku_number.slice(0, 4) +
                "-" +
                this.searched_sku_number.slice(4, 7) +
                "-" +
                this.searched_sku_number.slice(7, 9)) :
              null;
          }
          else {
            //Append leading zeros to the existing sku number
            this.searched_sku_number = "000000" + this.searched_sku_number;
            //Get the sku number of length 6
            !this.searched_sku_number.includes("-")
              ? (this.searched_sku_number = this.searched_sku_number.substr(
                this.searched_sku_number.length - 7,
                this.searched_sku_number.length
              ))
              : (this.searched_sku_number = this.searched_sku_number.substr(
                this.searched_sku_number.length - 8,
                this.searched_sku_number.length
              ));
            !this.searched_sku_number.includes("-")
              ? (this.searched_sku_number =
                this.searched_sku_number.slice(0, 4) +
                "-" +
                this.searched_sku_number.slice(4, 7))
              : null;
          }
        } else if (this.searched_sku_number.length === 8) {
          !this.searched_sku_number.includes("-")
            ? (this.searched_sku_number =
              this.searched_sku_number.slice(0, 4) +
              "-" +
              this.searched_sku_number.slice(4, 7))
            : null;
        } else if (this.searched_sku_number.length >= 9) {
          !this.searched_sku_number.includes("-")
            ? (this.searched_sku_number =
              this.searched_sku_number.slice(0, 4) +
              "-" +
              this.searched_sku_number.slice(4, 7) +
              "-" +
              this.searched_sku_number.slice(7, this.searched_sku_number.length))
            : null;
        }
      }
      this.GetSKUForSkuNumber(udd);
    };


    this.GetSKUForSkuNumber = (udd) => {
      this.isSearchingSku = true;
      this.isLoading = true;
      this.invalidSKuStatus = false;
      SKUService.API.SearchSKU("sku", this.searched_sku_number).then(response => {
        //If exists, then add SKU to option else throw error message
        this.isLoading = false;
        if (response.data.length > 0) {

          if (response.data[0].status == "Inactive") {
            this.skuNotFound = false;
            this.invalidSKuStatus = true;
            this.isAvailableinotherOptions = false;
            this.isSearchingSku = false;
          } else {
            if (this.skuNotFound == false && this.invalidSKuStatus == false) {


                const tocheckthesearchedSKUavailableInAllOptions = this.AllOptionsChoices.filter((choice) => (choice.order_advisor_udd_id === this.SelectedSKU.order_advisor_udd_id && choice.sku == this.searched_sku_number));

              
              let checkRecentAddedSku = []
              if (this.UddSKUs) {
                checkRecentAddedSku = this.UddSKUs.filter((cho) => cho.sku == this.searched_sku_number)
              }
              if (tocheckthesearchedSKUavailableInAllOptions.length > 0 || checkRecentAddedSku.length > 0) {
                this.isSearchingSku = false;
                this.isAvailableinotherOptions = true;
              } else {
                this.isAvailableinotherOptions = false;
                if (this.searchedSKUList.length > 0 || this.skuIds.length > 0) {
                  // Check if there is an object in the arrays
                  if (this.searchedSKUList.length > 0) {
                    // Replace the existing object with the new one
                    SKUService.API.GetAssortmentValuesForSku(response.data[0].id).then(res => {
                      this.isSearchingSku = false;
                      if (res.some(ele => ele.sellable == 1)) {
                        this.searched_isSellable = true
                        this.searched_sku_number = null;
                        this.searchedSKUList[0] = response.data[0];
                      } else {
                        this.searched_isSellable = false
                        if (this.searchedSKUList[0].id == response.data[0].id) {
                          this.searchedSKUList[0] = response.data[0];
                          this.searchedSKUList[0].clone = true
                        } else {
                          this.searchedSKUList[0].first = true
                          this.searchedSKUList.push(response.data[0])
                        }
                      }
                    })
                  } else {
                    // Replace the existing object with the new one

                    this.searchedSKUList.push(response.data[0]);
                    this.searched_sku_number = null;
                  }

                  // Replace the existing ID with the new one
                  this.skuIds[0] = response.data[0].id;
                } else {
                  // Push the new object to the arrays
                  SKUService.API.GetAssortmentValuesForSku(response.data[0].id).then(res => {
                    this.isSearchingSku = false;
                    if (res.some(ele => ele.sellable == 1)) {
                      this.searched_isSellable = true
                      this.searched_sku_number = null;
                    } else {
                      this.searched_isSellable = false
                    }
                  })
                  this.searchedSKUList.push(response.data[0]);
                  this.skuIds.push(response.data[0].id);
                }
                this.LoadImage(this.common.Identifiers.sku_master, response.data[0]);
              }
            }

          }
        } else {
          this.skuNotFound = true;
          this.isSearchingSku = false;
          this.invalidSKuStatus = false;
          this.isAvailableinotherOptions = false;

        }
      });
      // this.SKUServiceFactory.API.SearchSKU("sku", this.sku_number).then(
      //   result => {
      //     this.isLoading = false;
      //     this.isSearchingSku = true;
      //     this.isSkuFound = false;
      //     this.packageIds = [];

      //     this.isSKUSearching = false;
      //     result.data = result.data.filter(skuNum => skuNum.sku == this.sku_number)
      //     if (!(result.data[0].status == 'Inactive') && !(result.data[0].status == 'Pending Inactive')) {
      //       if (result.data.length && !this.skuIds.includes(result.data[0].id) && result.data[0].sku_type && result.data[0].sku_type.toLowerCase() !== "mto") {
      //         this.invalidSKuStatus=false
      //         if (this.searchedSKUList.length > 0 || this.skuIds.length > 0) {
      //           // Check if there is an object in the arrays
      //           if (this.searchedSKUList.length > 0) {
      //             // Replace the existing object with the new one
      //             this.searchedSKUList[0] = result.data[0];
      //           } else {
      //             // Replace the existing object with the new one

      //             this.searchedSKUList.push(result.data[0]);
      //           }

      //           // Replace the existing ID with the new one
      //           this.skuIds[0] = result.data[0].id;
      //         } else {
      //           // Push the new object to the arrays
      //           this.searchedSKUList.push(result.data[0]);
      //           this.skuIds.push(result.data[0].id);
      //         }



      //         this.LoadImage(this.common.Identifiers.sku_master, result.data[0]);
      //         this.sku_number = undefined;
      //         this.skuDoesNotExist = false;
      //         result.data[0].sku_sub_type.toLowerCase() === "set" ? this.setSkuIds.push(result.data[0].id) : "";
      //       } else if (result.data.length && result.data[0].sku_type && result.data[0].sku_type.toLowerCase() === "mto") {
      //         this.isSKUSearching = false;
      //         this.SKUError = "Selected SKU# belongs to the type MTO. Details for MTO SKUs cannot be sent to AS400.";
      //         angular.element("#sku_number_search").focus();
      //         this.common.$timeout(() => {
      //           this.SKUError = null;
      //         }, 3000)
      //       } else if (result.data.length && this.skuIds.includes(result.data[0].id)) {
      //         this.isSKUSearching = false;
      //         this.SKUError = "Selected SKU# is already added to the queue.";
      //         angular.element("#sku_number_search").focus();
      //         this.common.$timeout(() => {
      //           this.SKUError = null;
      //         }, 3000)
      //       } 


      //       else {
      //         this.isSKUSearching = false;
      //         this.SKUError = "SKU# does not exist.";
      //         angular.element("#sku_number_search").focus();
      //         this.common.$timeout(() => {
      //           this.SKUError = null;
      //         }, 3000)
      //         this.sku_number = undefined;
      //       }
      //     }else{
      //       this.invalidSKuStatus=true;
      //       this.searchedSKUList = [];
      //       this.skuIds = [];
      //       this.sku_number=null;
      //     }
      //   },
      //   error => {
      //     this.isSearching = false;
      //     this.isLoading = false;
      //   }
      // );
    }

    $scope.onSkuNumberChange = () => {

      this.skuNotFound = false;
      this.invalidSKuStatus = false;
      this.SkuNumberExistsError = false;
      this.isAvailableinotherOptions = false;

    }

    this.sortOut = () => {
      if (this.searchedSKUList.length > 1) {
        const index = this.searchedSKUList.findIndex(item => item.first == true);

        if (index !== -1) {
          // Remove the element from the array if found
          this.searchedSKUList.splice(index, 1);
        }
      }
    }


    this.clearTheArray = () => {
      if (this.searchedSKUList.length > 1) {
        const index = this.searchedSKUList.findIndex(item => item.first !== true);

        if (index !== -1) {
          // Remove the element from the array if found
          this.searchedSKUList.splice(index, 1);
        }
      } else {
        if (!this.searchedSKUList[0].clone) {
          this.searchedSKUList = []
          this.skuIds = []
        }
      }

    }

    this.LoadImage = (uuid, data) => {
      this.DataLakeFactory.API
        .GetDropsByUuidInstanceAndStream(
          uuid,
          data.id,
          "cover_image")
        .then(res => {
          if (res.length > 0) {
            data["imgUrl"] = this.DataLakeFactory.API.GetImageDownloadUrl(
              res[0].drop_id,
              "165x165",
              uuid
            );
          }
        });
    }

    this.replaceConfiguredSKU = (udd, sku) => {
      this.radioClickHandler(udd.selectedOption);
      this.successMessageforReplace = '';
      let obj = {}
      if (udd.selectedOption == 'replace_existing_sku') {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          new_sku_id: this.skuIds[0] ? this.skuIds[0] : sku.sku_id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          replace_existing_sku: udd.selectedOption,
          maintenance_description: udd.maintenance_description
        }

      }
      if (udd.selectedOption == 'deleteSkuFromUdd') {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          new_sku_id: this.skuIds[0] ? this.skuIds[0] : sku.sku_id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          deleteSkuFromUdd: udd.selectedOption,
          maintenance_description: udd.maintenance_description
        }

      }
      if (udd.selectedOption == 'replace_all_soa') {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          new_sku_id: this.skuIds[0] ? this.skuIds[0] : sku.sku_id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          replace_all_soa: udd.selectedOption,
          maintenance_description: udd.maintenance_description
        }
      }
      if (udd.selectedOption == 'deleteSkuAllSOA') {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          deleteSkuAllSOA: udd.selectedOption,
          maintenance_description: udd.maintenance_description
        }

      }
      if (udd.selectedOption == 'replace_all_soa_choice') {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          new_sku_id: this.skuIds[0] ? this.skuIds[0] : sku.sku_id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          replace_all_soa_choice: udd.selectedOption,
          maintenance_description: udd.maintenance_description
        }
      }
      if (udd.selectedOption == 'deleteSkuAllSOASameOption') {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          deleteSkuAllSOASameOption: udd.selectedOption,
          maintenance_description: udd.maintenance_description
        }
      }
      let deleted_sku = sku.sku_id;
      ItemService.API.UpdateallSOA(obj).then(res => {
        this.deleted_sku = deleted_sku;
        udd.is_deleted = true;
        if (udd.selectedOption == 'replace_existing_sku') this.successMessageforReplace = "SKU Replaced in this SOA Successfully";
        if (udd.selectedOption == 'deleteSkuFromUdd') this.successMessageforReplace = "SKU Deleted in this SOA Successfully"
        if (udd.selectedOption == 'replace_all_soa') this.successMessageforReplace = "SKU Replaced in all SOA's with given Type Successfully";
        if (udd.selectedOption == 'deleteSkuAllSOA') this.successMessageforReplace = `SKU Deleted in all SOA's with given Type Successfully`;
        if (udd.selectedOption == 'replace_all_soa_choice') this.successMessageforReplace = "SKU Replaced in all SOA's Successfully";
        if (udd.selectedOption == 'deleteSkuAllSOASameOption') this.successMessageforReplace = "SKU Deleted in all SOA's Successfully"
        this.FetchAvailableSkusForUDD(udd);
        this.common.$timeout(() => {
          this.closeConfigureSKUPanel();
          this.successMessageforReplace = '';
          this.showSearchPanel = false;
        }, 4000);
        this.skuNotFound = false;
        this.invalidSKuStatus = false;
        this.isAvailableinotherOptions = false;
        this.SkuNumberExistsError = false
        this.searchedSKUList = [];
        this.invalidSKuStatus = false
        this.searched_sku_number = null;
        this.textForReplaceandDelete = 'Replace'
        this.searched_sku_number = null;
        this.skuIds = [];
        this.udd.selectedOption = null;
        this.AllOptionsChoices = [];
        this.CheckExistingSKU = [];
        SKUService.API.FeatchAllOptionsChoices(
          this.$scope.$parent.advisorController.OrderAdvisor.id
        ).then(response => {
          if (udd.selectedOption == "deleteSkuFromUdd" || udd.selectedOption == "replace_existing_sku") {
            this.AllOptionsChoices = this.AllOptionsChoices?.filter(item => item?.sku_id !== sku?.sku_id && item.sku_id != this.deleted_sku && item.sku_id != this.replace_sku
            );

          }
          this.AllOptionsChoices = response.data;
          _.each(this.AllOptionsChoices, option => {
            this.CheckExistingSKU.push(option.sku_id);
          });
          //When delete or replace than do delete SKUIds
          let index = udd.skuIds?.indexOf(sku.sku_id);

          if (index !== -1) {
            udd.skuIds?.splice(index, 1);
          }
          // Convert all skuIds in udd.skuIds to numbers
            udd.skuIds = udd.skuIds.map(id => Number(id));
  
          // Remove all occurrences of sku.sku_id
            udd.skuIds = udd.skuIds.filter(id => id !== sku.sku_id);
        });


      }).catch()
    }

    this.switchtheScreen = () => {
      $scope.uddController.udd.selectedOption = null;
      this.searched_isSellable = true
      this.switchscreen = false;
      this.showSearchPanel = false;
      this.searchedSKUList = [];
      this.skuIds = [];
      this.successMessageforReplace = null;
      this.udd.selectedOption = null;
      this.searched_sku_number = null;
      this.textForReplaceandDelete = 'Replace'
      this.invalidSKuStatus = false
      this.isAvailableinotherOptions = false;
      this.skuNotFound = false;
      this.invalidSKuStatus = false;
      this.SkuNumberExistsError = false


    }

    this.radioClickHandler = function (selectedRadio) {
      if (selectedRadio == 'deleteSkuFromUdd' || selectedRadio == 'deleteSkuAllSOA' || selectedRadio == 'deleteSkuAllSOASameOption') {
        this.searched_isSellable = true
        this.resetSkuProperties();
        this.showSearchPanel = false;
        this.textForReplaceandDelete = 'Delete';
        this.skuIds = [];
        this.searchedSKUList = [];

      } else if (selectedRadio == 'AddSkuFromUdd' || selectedRadio == 'AddSkuAllSOA') {

        // this.resetSkuProperties();
        // this.switchscreen = false;
        // this.showSearchPanel = false;
        this.skuIds = [];
        // this.searchedSKUList = [];
        this.isConfigureSku = false;
      }
      else {
        this.showSearchPanel = true;
        this.textForReplaceandDelete = 'Replace'

      }
    };





    this.DeleteSKUFromQueue = (skuId) => {
      if (skuId) {
        let idx = this.searchedSKUList?.findIndex(sk => sk.id == skuId);
        let setIndex = this.setSkuIds?.findIndex(sid => sid == skuId);
        let idIdx = this.skuIds?.findIndex(id => id == skuId);
        this.searchedSKUList?.splice(idx, 1);
        this.skuIds?.splice(idIdx, 1);
        this.setSkuIds?.splice(setIndex, 1);
        this.searched_sku_number = null

      }
    }
    //Search the entered SKU and add to the option selected
    this.GetSkuBySKUNumber = udd => {
      // this.sku_number = undefined;
      this.udd.default_quantity_value = undefined;
      this.udd.display_sequence = undefined;
      this.udd.allow_quantity_change = false;
      //Set the is searching SKU variable to true until search is performed
      this.isSearchingSku = true;
      this.isSkuFound = false;
      this.packageIds = [];
      // if(this.sku_number.length==0 && (this.skuNotFound = true) || (this.invalidSKuStatus = true) ||(this.SkuNumberExistsError=true)){
      //   this.skuNotFound = false;
      //   this.invalidSKuStatus = false;
      //   this.SkuNumberExistsError=false
      // }
      //If the sku number is entered then prepare the SKU format as XXXX-XXX
      if (this.sku_number) {
        this.skuNotFound = false;
        this.invalidSKuStatus = false;
        this.isLoading = true;
        if (this.sku_number.length < 8) {
          //Append leading zeros to the existing sku number
          this.sku_number = "000000" + this.sku_number;
          //Get the sku number of length 6
          !this.sku_number.includes("-")
            ? (this.sku_number = this.sku_number.substr(
              this.sku_number.length - 7,
              this.sku_number.length
            ))
            : (this.sku_number = this.sku_number.substr(
              this.sku_number.length - 8,
              this.sku_number.length
            ));
          !this.sku_number.includes("-")
            ? (this.sku_number =
              this.sku_number.slice(0, 4) + "-" + this.sku_number.slice(4, 7))
            : null;
        } else if (this.sku_number.length === 8) {
          !this.sku_number.includes("-")
            ? (this.sku_number =
              this.sku_number.slice(0, 4) + "-" + this.sku_number.slice(4, 7))
            : null;
        } else if (this.sku_number.length >= 9) {
          !this.sku_number.includes("-")
            ? (this.sku_number =
              this.sku_number.slice(0, 4) +
              "-" +
              this.sku_number.slice(4, 7) +
              "-" +
              this.sku_number.slice(7, this.sku_number.length))
            : null;
        }
        this.Sku = undefined;
        //Call search by SKU function and check is entered SKU number exists
        SKUService.API.SearchSKU("sku", this.sku_number).then(response => {
          //If exists, then add SKU to option else throw error message
          this.isLoading = false;
          let index = (this.udd.UddSKUs ? this.udd.UddSKUs : []).findIndex(
            sku => sku["sku_id"] === response.data["id"]
          );
          if (this.udd.UddSKUs && this.udd.UddSKUs.length > 0) {

          }
          if (response.data.length > 0) {
            udd.skuIds = (this.udd.UddSKUs ? this.udd.UddSKUs : []).reduce((obj, sku) => {
              obj[sku.sku_id] = true;
              return obj;
            }, {});
            if (udd.skuIds && response.data[0].id in udd.skuIds) {
              this.SkuNumberExistsError = true;
              this.isSearchingSku = false;
              this.searchedSKUList = [];
              this.skuIds = [];

            } else {

              if (
                (response.data[0].status_id === 200 || response.data[0].status_id === 400 || response.data[0].status_id === 100) &&
                (response.data[0].sku_type.toLowerCase() === "stock" || response.data[0].sku_type.toLowerCase() === "stock plus")
              ) {
                this.isShowAddCancelButton = true;
                this.Sku = response.data[0];
                this.SelectedSKU = this.Sku;

                this.searchedSKUList = [];
                this.skuIds = [];
                SKUService.API.GetAssortmentValuesForSku(response.data[0].id).then(res => {
                  this.isSearchingSku = false;
                  if (res.some(ele => ele.sellable == 1)) {
                    this.isSellable = true; // Set isSellable to true if any sellable is 1
                    this.isSkuFound = true;
                  } else {
                    this.isSellable = false; // Set isSellable to false if all sellable are 0
                  }
                })
                _.each(this.PackageTypes, packagetype => {
                  packagetype.isSelected = false;
                });
              } else if ((response.data[0].status_id != 100) && (response.data[0].status_id != 200 || response.data[0].status_id != 400) &&
                (response.data[0].sku_type.toLowerCase() === "stock" || response.data[0].sku_type.toLowerCase() === "stock plus")) {
                // If status and is not 200 or 400 and sku_type is stock
                this.invalidSKuStatus = true;
                this.searchedSKUList = [];
                this.skuIds = [];
                this.isLoading = false;
                this.isSearchingSku = false;
              } else {
                this.skuNotFound = true;
                this.isSearchingSku = false;
                this.isLoading = false;
              }
            }
          } else {
            this.skuNotFound = true;
            this.isSearchingSku = false;
          }
        });
      }
    };

    //Get the SKU details for the selected SKU by id
    this.GetSKUData = udd => {
      if (
        this.$stateParams.id &&
        this.$state.current.name.includes(".update")
      ) {
        udd.isLoaded = false;
        SKUService.API.GetSKU(udd.sku_id)
          .then(response => {
            if (response.data.length > 0) {
              udd.isLoaded = true;
              udd.sku_id = response.data[0].id;
              udd.sku = response.data[0].sku;
              udd.description = response.data[0].description;
            } else {
              this.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //Once the SKU choice is made, add the sku choice into the selected UDD
    this.AddSkuToUDD = (udd, sku) => {
      if (this.$stateParams.id) this.radioClickHandler(udd.selectedOption);
      this.SelectedSKU = undefined;
      this.errorMessage = null;
      this.errorDisplaySequence = false;
      // udd.skuIds.push(this.skuUdd.sku_id);
      if (this.udd.UddSKUs) {
        this.filterUddSkus = this.udd.UddSKUs.filter(skuid => skuid.id !== udd.id);
      }
      let obj = {};
      if (udd.selectedOption == 'AddSkuFromUdd' || !this.$stateParams.id) {
        obj = {
          old_sku_id: sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          order_advisor_udd_id: sku.order_advisor_udd_id,
          AddSkuFromUdd: udd.selectedOption
        }
      }
      if (udd.selectedOption == 'AddSkuAllSOA') {
        obj = {
          sku_id: sku.id ? sku.id : sku.sku_id,
          order_advisor_type_id: udd.adviser_type.id,
          order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
          AddSkuAllSOA: udd.selectedOption,
          order_advisor_udd_id: udd.id,
          order_advisor_help_text_header_id: this.Sku.order_help_text_header_id,
          default_quantity_value: udd.default_quantity_value ? udd.default_quantity_value : this.Sku.default_quantity_value,
          display_sequence: udd.display_sequence ? udd.display_sequence : this.Sku.display_sequence,
          allow_quantity_change: udd.allow_quantity_change ? udd.allow_quantity_change : this.Sku.allow_quantity_change,
          choiceIds: this.Sku.packageIds,
          choice_id: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
          is_deleted: true,
          AddSkuAllSOA: udd.selectedOption
        }
      }
      if (this.errorDisplaySequence === false && (udd.selectedOption == 'AddSkuFromUdd' || !this.$stateParams.id)) {
        this.SkuNumberExistsError = false;
        udd.skuIds === undefined ? (udd.skuIds = []) : null;
        udd.UddSKUs === undefined ? (udd.UddSKUs = []) : null;
        this.UddSKUs === undefined ? (this.UddSKUs = []) : null;
        udd.skuIds = Object.entries(udd.UddSKUs.reduce((acc, sku) => {
          acc[sku.sku_id] = true;
          return acc;
        }, {})).map(([key, value]) => key)
        if (udd.skuIds.includes(this.Sku.id)) {
          this.SkuNumberExistsError = true;
        } else {
          // udd.skuIds.push(this.Sku.id);
          udd.skuIds.push(this.Sku.id.toString());
          //Else push the SKUs to make it a part of order advisor
          this.SkuNumberExistsError = false;
          udd.UddSKUs.push({
            sku_id: this.Sku.id,
            sku: this.Sku.sku,
            description: this.Sku.description,
            order_advisor_udd_id: udd.id,
            isLoaded: true,
            default_quantity_value: udd.default_quantity_value,
            display_sequence: udd.display_sequence,
            allow_quantity_change: udd.allow_quantity_change,
            choiceIds: this.Sku.packageIds,
            choice_id: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
            is_deleted: true
          });
          this.UddSKUs.push({
            sku_id: this.Sku.id,
            sku: this.Sku.sku,
            description: this.Sku.description,
            order_advisor_udd_id: udd.id,
            order_advisor_help_text_header_id: this.Sku.order_help_text_header_id,
            default_quantity_value: udd.default_quantity_value ? udd.default_quantity_value : this.Sku.default_quantity_value,
            display_sequence: udd.display_sequence ? udd.display_sequence : this.Sku.display_sequence,
            allow_quantity_change: udd.allow_quantity_change ? udd.allow_quantity_change : this.Sku.allow_quantity_change,
            choiceIds: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
            choice_id: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
            is_deleted: true
          });
          udd.is_deleted = false;
          this.sku_number = null;
          this.isShowAddCancelButton = false;
        }
      }
      if (udd.selectedOption == 'AddSkuAllSOA') {
        udd.skuIds === undefined ? (udd.skuIds = []) : null;
        udd.UddSKUs === undefined ? (udd.UddSKUs = []) : null;
        this.UddSKUs === undefined ? (this.UddSKUs = []) : null;
        udd.skuIds = Object.entries(udd.UddSKUs.reduce((acc, sku) => {
          acc[sku.sku_id] = true;
          return acc;
        }, {})).map(([key, value]) => key)
        if (obj.allow_quantity_change == undefined) obj.allow_quantity_change = null
        // console.log(obj);

        SKUService.API.InsertSOAtoType(obj).then(response => {
          udd.UddSKUs.push({
            sku_id: sku.id ? sku.id : sku.sku_id,
            order_advisor_type_id: udd.adviser_type.id,
            order_advisor_id: this.$scope.$parent.advisorController.OrderAdvisor.id,
            AddSkuAllSOA: udd.selectedOption,
            order_advisor_udd_id: udd.id,
            order_advisor_help_text_header_id: this.Sku.order_help_text_header_id,
            default_quantity_value: udd.default_quantity_value ? udd.default_quantity_value : this.Sku.default_quantity_value,
            display_sequence: udd.display_sequence ? udd.display_sequence : this.Sku.display_sequence,
            allow_quantity_change: udd.allow_quantity_change ? udd.allow_quantity_change : this.Sku.allow_quantity_change,
            choiceIds: this.Sku.packageIds,
            choice_id: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
            is_deleted: true

          });
          this.UddSKUs.push({
            sku_id: this.Sku.id,
            sku: this.Sku.sku,
            description: this.Sku.description,
            order_advisor_udd_id: udd.id,
            order_advisor_help_text_header_id: this.Sku.order_help_text_header_id,
            default_quantity_value: udd.default_quantity_value ? udd.default_quantity_value : this.Sku.default_quantity_value,
            display_sequence: udd.display_sequence ? udd.display_sequence : this.Sku.display_sequence,
            allow_quantity_change: udd.allow_quantity_change ? udd.allow_quantity_change : this.Sku.allow_quantity_change,
            choiceIds: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
            choice_id: this.Sku.packageIds ? this.Sku.packageIds.join() : "",
            is_deleted: true
          });
          udd.is_deleted = false;
          this.sku_number = null;
          this.isShowAddCancelButton = false;
        })
      }
      if (udd.selectedOption == 'AddSkuFromUdd' || !this.$stateParams.id) this.successMessage = "SKU Added Successfully";
      if (udd.selectedOption == 'AddSkuAllSOA') this.successMessage = "SKU Added in all SOA's Successfully";
      this.common.$timeout(() => {
        this.errorMessage = null;
        this.isConfigureSku = false;
        sku.display_sequence = sku.oldDisplaySequence;
        $scope.uddController.udd.selectedOption = null;
        this.SelectedSKU = undefined;
        this.switchscreen = false;
        this.showSearchPanel = false;
        this.searchedSKUList = [];
        this.skuIds = [];
        this.successMessage = '';
        this.searched_sku_number = null;
        this.skuNotFound = false;
      }, 2000);
    };

    this.DeleteSkusFromUdds = (udd) => {
      if (udd && udd.id) {
        this.isDeleteSkuSuccess = false;
        this.isDeletingSKU = true;
        //find index of group under which current sku exist
        let index = this.udd.UddSKUs.findIndex(
          sku => sku["sku_id"] === udd["sku_id"]
        );
        this.udd.UddSKUs.splice(index, 1);
        let skuIndex = this.udd.skuIds.findIndex(
          skuId => parseInt(skuId) === parseInt(udd["sku_id"])
        );
        this.udd.skuIds.splice(skuIndex, 1);
        if (this.udd.skuIds.length == 0) {
          this.udd.max_discount = 0.00;
          this.udd.spiff = 0.00;
        }
        this.Sku = undefined;
        if (
          this.$stateParams.id &&
          this.$state.current.name.includes(".update")
        ) {
          this.OrderAdvisorServices.UddValues.Delete(udd.id)
            .then(result => {
              udd.baselocationid = 1;
              udd.created_by = 1;
              SKUService.API.DeleteaddedDiscountsSOA(udd).then(response => { })
              this.isDeleteSkuSuccess = true;
              this.common.$timeout(() => {
                this.isDeletingSKU = false;
                this.isDeleteSkuSuccess = false;
                this.isConfigureSku = false;
                this.isDeletingSKU = false;
                this.SelectedSKU = undefined;
              }, 2500);
            })
            .catch(error => {
              this.isDeleteSkuSuccess = true;
              this.common.$timeout(() => {
                this.isDeletingSKU = false;
                this.is_deleted = false;
                this.isDeleteSkuSuccess = false;
                this.isConfigureSku = false;
              }, 2500);
            });
        } else {
          this.isDeletingSKU = false;
          this.is_deleted = false;
          this.isDeleteSkuSuccess = true;
          this.common.$timeout(() => {
            this.isDeleteSkuSuccess = false;
          }, 2500);
        }
      } else {
        this.isDeleteSkuSuccess = false;
        this.errorMessage = "SKU is not yet published! Cannot unlink SKU."
        this.common.$timeout(() => {
          this.errorMessage = null;
          this.isDeletingSKU = false;
          this.is_deleted = false;
          this.isConfigureSku = false;
        }, 2500);
      }

    };

    //API function call to add the SKUS to the selected option
    this.AddUdds = () => {
      this.UddSKUs = this.UddSKUs ? this.UddSKUs : undefined;
      this.isButtonDisabled = true;
      if (this.UddSKUs && this.UddSKUs.length > 0) {
        let successCount = 0;  // To count the successful requests
        let failureCount = 0;  // To count the failed requests
        this.$scope.$parent.advisorController.HasUpdateUDDChanges = true;
        this.isButtonDisabled = true;
    
        let promises = [];
    
        for (let i = 0; i < this.UddSKUs.length; i++) {
          // Set the order advisor id as the selected update/created order advisor
          this.UddSKUs[i].order_advisor_id = this.$scope.inserted_id ? this.$scope.inserted_id : this.$scope.$parent.advisorController.OrderAdvisor.id;
    
          // Push the promise into the promises array
          promises.push(
            this.OrderAdvisorServices.UddValues.Create(this.UddSKUs[i])
              .then(response => {
                if (response.data) {
                  if (this.udd.max_discount) {
                    this.UddSKUs[i].max_discount = this.udd.max_discount;
                    this.UddSKUs[i].spiff = this.udd.spiff;
                    this.UddSKUs[i].inital_entry = true;
                    this.UddSKUs[i].initial_discount = true;
                    SKUService.API.UpdateDiscountOrderAdvisorSku(this.UddSKUs[i]).then(response => {
                    });
                  }
                }
                successCount++;
                let index = this.udd.UddSKUs.findIndex(
                  sku => sku["sku_id"] === response.data["sku_id"]
                );
                if (index >= 0) {
                  this.udd.UddSKUs[index].id = response.data.id;
                  this.udd.UddSKUs[index].order_advisor_id = this.$scope.$parent.advisorController.OrderAdvisor.id;
                  this.udd.UddSKUs[index].order_advisor_udd_id = this.$scope.$parent.advisorController.order_advisor_udd_id;
                }
                // //If true, return variable true
                // if (i === this.UddSKUs.length - 1) {
                //   this.isChoicesCreated = true;
                //   this.UddSKUs = [];
                // } else {
                //   // this.isChoicesCreated = false;
                // }
              })
              .catch(error => {
                // On error, handle the failure
                failureCount++;
                logger.error(error);
              })
          );
        }
    
        // Wait for all promises to be processed before executing the final logic
        Promise.all(promises).finally(() => {
          // Check after all promises are processed
          if (successCount > 0) {
            // If at least one success, show success message
            this.$scope.$emit("saveOrderadvisor", {
              event: "publish"
            });
            console.log("Success: At least one record processed successfully.");
          } else {
            this.$scope.$emit("saveOrderadvisor", {
              event: "failed"
            });
            // If all failed, show failure message
            console.log("Failure: All records failed to process.");
          }
    
          // Reset UDD state after completion
          this.isChoicesCreated = true;
          this.UddSKUs = [];
          this.common.$timeout(() => {
            this.isButtonDisabled = false;
          }, 2000);
        });
      } else {
        this.$scope.$parent.advisorController.HasUpdateUDDChanges = false;
        // this.error = true;
        this.common.$timeout(() => {
          this.isButtonDisabled = false;
        }, 2000);
      }
      this.is_deleted = false;
    };
    

    //Highlight the clocked row in table
    this.highlightSelectedRow = index => {
      this.$scope.selectedRow = index;
    };

    //Highlight the clocked row in table
    this.highlightSelectedSkuRow = index => {
      this.$scope.selectedSkuRow = index;
    };

    //Configure sku panel
    this.ConfigureSKU = sku => {
      this.uddOptionChoiceId = []
      SKUService.API.FeatchAllOptionsChoices(
        this.$scope.$parent.advisorController.OrderAdvisor.id
      ).then(response => {
        response.data.forEach(ordUdd => {
          if (ordUdd.id !== sku.id) {
            if (ordUdd.choice_id != "" && ordUdd.choice_id != null) {
              let choice_idss = ordUdd.choice_id.split(',').map(Number)
              this.uddOptionChoiceId = [...this.uddOptionChoiceId, ...choice_idss];
            }
          }
        });
      })

      this.switchscreen = false;
      this.switchtheScreen()
      sku.oldDetails = angular.copy(sku);
      sku.oldDisplaySequence = sku.display_sequence;
      this.SelectedSKU = {};
      this.AvailablePackages = [];
      // this.Sku ? null : this.Sku = {};
      this.Sku = {};
      this.Sku.id = sku.sku_id;
      sku.default_quantity_value === 0
        ? (sku.default_quantity_value = undefined)
        : null;
      sku.display_sequence === 0
        ? (sku.display_sequence = undefined)
        : null;
      sku.allow_quantity_change === 0
        ? (sku.allow_quantity_change = undefined)
        : null;
      _.each(this.PackageTypes, packageObject => {
        packageObject.isSelected = false;
        if (
          !sku.choice_id ||
          (sku.choice_id &&
            !sku.choiceIds.includes(packageObject.id) &&
            !sku.choiceIds.includes(JSON.stringify(packageObject.id)))
        ) {
          // Check if the package is already added to AvailablePackages
          const isAlreadyAdded = this.AvailablePackages.some(item => item.id === packageObject.id);
          if (!isAlreadyAdded) {
            this.AvailablePackages.push(packageObject);
          }
        } else {
          packageObject.isSelected = true;
          // Ensure the package is only added once
          const isAlreadyAdded = this.AvailablePackages.some(item => item.id === packageObject.id);
          if (!isAlreadyAdded) {
            this.AvailablePackages.push(packageObject);
          }
        }
      });
      this.common.$timeout(() => {
        this.SelectedSKU = sku;
        this.isConfigureSku = true;
      }, 10);
    };

    this.InitialFocus = () => { };

    this.toggleShowAddSKUPanel = () => {
      this.sku_number = undefined;
      this.udd.default_quantity_value = undefined;
      this.udd.display_sequence = undefined;
      this.udd.allow_quantity_change = false;
      this.showAddSKUPanel = !this.showAddSKUPanel;
      this.common.$timeout(() => {
        angular.element("#sku_number_search").focus();
      }, 0);

      $scope.uddController.udd.selectedOption = null;
      this.switchscreen = false;
    };

    this.hasUpdateChanges = (payload) => {
      if (
        ((payload.max_discount || this.oldDiscountChoiceDetails.max_discount) && this.oldDiscountChoiceDetails.max_discount != payload.max_discount ||
          (payload.spiff || this.oldDiscountChoiceDetails.spiff) && this.oldDiscountChoiceDetails.spiff != payload.spiff)
      ) {
        return true;
      } else {
        if (!payload.max_discount && (payload.inital_entry == 0)) {
          return true;
        }
        else {
          return false;
        }
      }
    }

    this.updateDiscount = (advisordetails) => {
      this.isProcessing = true;
      this.btntext = "Submitting";
      // this.GetSKUData()
      if (this.hasUpdateChanges(advisordetails) === true) {
        _.each(advisordetails.UddSKUs, sku => {
          sku.max_discount = advisordetails.max_discount || 0;
          sku.spiff = advisordetails.spiff || 0;
          sku.initial_discount = true;
          if (sku.original_discount == 0) {
            if (sku.max_discount == 0) {
              sku.inital_entry = 1;
            }
            else {
              sku.inital_entry = 0;
            }
          }
          else {
            sku.inital_entry = 0;
          }
          SKUService.API.UpdateDiscountOrderAdvisorSku(sku).then(response => {
            if (response.affectedRows == 1) {
              this.isUpdateSuccess = true;
              advisordetails.inital_entry = 0;
              this.oldDiscountChoiceDetails = _.clone(advisordetails);
              this.common.$timeout(() => {
                this.isUpdateSuccess = false;
                this.isProcessing = false;
                this.btntext = "Submit";
              }, 3000);
            }
          }).catch(error => {
            this.isProcessing = false;
            logger.error(error);
          });
        })
      }
      else {
        this.isProcessing = false;
        this.isUpdateerror = true;
        this.btntext = "Nothing to Submit"
        this.common.$timeout(() => {
          this.isUpdateerror = false;
          this.btntext = "Submit";
        }, 3000);
      }
    }

    this.onChangemax_discount = (ch) => {
      // var format = /-/;
      // if (format.test(ch.max_discount)) {
      //   ch.disablespiff = true
      // } else {
      //   ch.show_specialwarning = false
      // }
      if (ch.max_discount == 0 || ch.max_discount == 0.00 || ch.max_discount == '') {
        ch.spiff = 0;
        ch.disablespiff = true;
      }
      else {
        ch.disablespiff = false;
      }
    }

    this.closeConfigureSKUPanel = () => {
      if (!this.noChangeValue) {
        this.SelectedSKU.display_sequence = this.SelectedSKU.oldDisplaySequence;
        this.SelectedSKU.default_quantity_value = this.SelectedSKU.oldDetails.default_quantity_value;
        this.SelectedSKU.allow_quantity_change = this.SelectedSKU.oldDetails.allow_quantity_change;
      }
      $scope.uddController.udd.selectedOption = null;
      this.SelectedSKU = undefined;
      this.isConfigureSku = false;
      this.switchscreen = false;
      this.showSearchPanel = false;
      this.searchedSKUList = [];
      this.skuIds = [];
      this.successMessage = '';
      this.successMessageforReplace = ''
      this.searched_sku_number = null;
      this.udd.replace_existing_sku = false;
      this.udd.replace_all_soa = false;
      this.textForReplaceandDelete = 'Replace';
      this.skuNotFound = false;
      this.invalidSKuStatus = false;
      this.isAvailableinotherOptions = false;
      this.SkuNumberExistsError = false
      this.udd.replace_all_soa_choice = false;
      this.udd.deleteSkuFromUdd = false;
      this.udd.deleteSkuAllSOA = false;
      this.udd.deleteSkuAllSOASameOpton = false;
      if (this.udd.UddSKUs?.length) {
        let omitKeys = ["adviser_type"];
        let hasChanges = false;
        _.each(this.udd.UddSKUs, sku => {
          for (let key in sku) {
            if (
              sku.oldDetails &&
              sku &&
              sku.oldDetails[key] != sku[key] && // NO TYPE CHECK
              !omitKeys.includes(key)
            ) {
              hasChanges = true;
              // this.UpdateSkuConfiguration(sku);
              break;
            }
          }
          if (hasChanges && (sku.choice_id != (sku.oldDetails ? sku.oldDetails.choice_id : null))) {
            sku.choice_id = sku.oldDetails ? sku.oldDetails.choice_id : sku.choice_id;
            sku.choiceIds = sku.oldDetails ? sku.oldDetails.choiceIds : sku.choiceIds;
            // this.UpdateSkuConfiguration(sku)
          }
        })
      }
    };

    //Watch on each type change the reload the options accordingly
    this.$scope.$watch("loadUdds", (n, o) => {
      if (
        n === true &&
        n != o &&
        this.$scope.$parent.advisorController.OrderAdvisor.adviser_type_id
      ) {
        this.Activate();
      }
    });

    //On each save/update order advisor, add the choices for selected udds
    this.$scope.$on("saveUdds", (e, args) => {
      if (args.inserted_id) {
        this.$scope.inserted_id = args.inserted_id;
        this.AddUdds();
      }
    });
  }

  (function () {
    "use strict";

    angular
      .module("rc.prime.orderadvisor")
      .directive("orderAdvisorUddDirective", orderAdvisorUddDirective);

    function orderAdvisorUddDirective() {
      let directive = {
        restrict: "EA",
        controller: UDDController,
        controllerAs: "uddController",
        templateUrl:
          "application/modules/order.advisor/maintenance/udd.directive.html"
      };
      return directive;
    }
  })();
})();
