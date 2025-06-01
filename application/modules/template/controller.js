class TemplateController {
  constructor(
    $scope,
    common,
    EntityDetails,
    TemplateSkuService,
    SKUService,
    ItemTypeService,
    DataLakeAPIService
  ) {
    this.$scope = $scope;
    this.common = common;
    this.logger = this.common.Logger.getInstance("TemplateController");
    this.$timeout = this.common.$timeout;
    this.EntityDetails = EntityDetails;
    this.templateSkuService = TemplateSkuService;
    this.skuService = SKUService;
    this.itemTypeService = ItemTypeService;
    this.dataLakeAPIService = DataLakeAPIService;
    // this.openConfigureParametersTabel = false;
    this.openConfigurePackagesTable = false;
    this.isShowPackageDetails = false;
    this.openConfigureOptionTable = false;
    this.isShowOptionDetails = false;
    this.openParametersChoiceTable = false;
    this.openOptionsChoiceTable = false;
    this.openUpdateTemplateNameSidepanel = false;
    this.showPackagePriceForChoice = false;
    this.isShowAdd = false;
    this.saveBtnText = "Save";
    this.saveBtnError = false;
    this.isSaveSuccess = false;
    this.updateBtnText = "Update";
    this.updateBtnError = false;
    this.isUpdateSuccess = false;
    this.isConfirmDelete = false;
    this.isDeleteSuccess = false;
    this.isShowParameterDetails = false;
    this.isShowOptionChoiceDetails = false;
    this.showOptionForParameter = false;
    this.isShowParameterChoiceDetails = false;
    this.isShowHistory = false;
    this.showSkuDropdown = true;
    this.templateSkusMap = {};
    this.parametersMap = {};
    this.skuList = [];
    this.activate();
    this.sortType = "name";
    this.skuUUID = 44;

    //Configure SKU search select object
    this.selectSKUList = {
      valueField: "sku",
      labelField: "sku",
      searchField: ["sku"],
      sortField: "sku",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select SKU" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: this.skuList,
      render: {
        option: function(data, escape) {
          if (data.status.toLowerCase() === "inactive") {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.sku) +
              "</span>" +
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          } else {
            return (
              '<div class="p-5">' +
              '<div class="m-5">' +
              '<span class="cloudcart-admin-sku-number f-13"> ' +
              escape(data.sku) +
              "</span>" +
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: function(data, escape) {
          return (
            '<div class="option">' +
            '<span class="title m-r-5 cloudcart-admin-sku-number">' +
            escape(data.sku) +
            "</span>" +
            "-" +
            '<span class="m-l-5 f-12 text-muted">' +
            escape(data.status) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    //Configure SKU search select object
    this.selectItemTypesList = {
      valueField: "item_type_id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Item Type" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: this.itemTypesList,
      render: {
        option: function(data, escape) {
          if (data.status.toLowerCase() === "inactive") {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.short_description) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          } else {
            return (
              '<div class="p-5">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.short_description) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: function(data, escape) {
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.short_description) +
            "</span>" +
            "</div>"
          );
        }
      }
    };
  }

  activate() {
    this.fetchTemplateSKU();
    this.fetchItems();
    this.getModelAndSetValidationRules(this.common.Identifiers.template);
  }

  getModelAndSetValidationRules(uuid) {
    this.EntityDetails.API.GetModelAndSetValidationRules(
      uuid
    ).then(model => {});
  }

  fetchItems() {
    this.itemTypeService.API.GetItemTypes()
      .then(response => {
        this.itemTypesList = response.data;
      })
      .catch();
  }

  fetchSKUs(search_field, searchData) {
    if (searchData && searchData.item_type_id) {
      let search_value = searchData.item_type_id;
      this.showSkuDropdown = false;
      searchData.isProcessing = true;
      this.skuService.API.SearchSKU(search_field, search_value)
        .then(response => {
          this.skuList = response.data;
          this.showSkuDropdown = true;
          delete searchData.isProcessing;
        })
        .catch(() => {
          this.showSkuDropdown = true;
          this.isProcessing = false;
        });
    }
  }

  fetchTemplateSKU(refresh) {
    this.isProcessing = false;
    this.LoadingMessage = "Loading...";
    this.openUpdateTemplateNameSidepanel = false;
    this.templateSkuService.API.FetchTemplateSkus()
      .then(response => {
        this.LoadingMessage = "";
        if (refresh) {
          this.refreshMessage = "Successfully refreshed";
          this.isProcessing = true;
          this.isConfirmTemplateDelete = false;
          if (this.tempRowAdded) {
            this.templateSkus.splice(0, 1);
            this.tempRowAdded = false;
          }
        }
        this.templateSkus = response.data;
        this.templateSkus.length
          ? (this.templateMessage = "")
          : (this.templateMessage = "No templates found!");
        for (
          let templateSkuIndex = 0;
          templateSkuIndex < response.data.length;
          templateSkuIndex++
        ) {
          if (
            this.templateSkusMap[response.data[templateSkuIndex].id] ===
            undefined
          ) {
            this.templateSkusMap[response.data[templateSkuIndex].id] =
              response.data[templateSkuIndex];
          }
        }
        this.common.$timeout(() => {
          this.refreshMessage = "";
          this.isProcessing = false;
        }, 2500);
      })
      .catch(error => {});
  }

  fetchTemplateSkuParametersByTemplateSku(templateSkuObject) {
    this.LoadingMessage = "Loading...";
    this.templateSkuService.API.FetchTemplateSkuParametersByTemplateSku(
      templateSkuObject.id
    )
      .then(response => {
        this.LoadingMessage = "";
        this.templateSkus.find(
          templateSku => templateSku.id == templateSkuObject.id
        ).parameters = response;
        response.length
          ? (this.parameterMessage = "")
          : (this.parameterMessage = "No parameters found!");

        for (let i = 0; i < response.length; i++) {
          if (this.parametersMap[response[i].id] === undefined) {
            this.parametersMap[response[i].id] = response[i];
          }
        }
        this.checkIsParameterLinked(response);
      })
      .catch(error => {});
  }
  toggleOptionParameters(optionData) {
    optionData.showLinkedParameterList = !optionData.showLinkedParameterList;
  }

  fetchLinkedParameterByOptionId(optionData, flag) {
    if (!optionData.linkedParametersList) {
      this.LoadingMessage = "Loading...";
      this.templateSkuService.API.FetchLinkedParametersForOption(optionData.id)
        .then(response => {
          this.LoadingMessage = "";
          optionData.linkedParametersList = response;
          response.length
            ? (this.linkedParameterMessage = "")
            : (this.linkedParameterMessage = "No linked parameters found!");
          optionData.linkedParameters = [];
          if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
              optionData.linkedParameters.push(response[i].parameter_id);
            }
          }
          if (!flag) {
            !this.templateSku.parameters
              ? this.fetchTemplateSkuParametersByTemplateSku(this.templateSku)
              : this.checkIsParameterLinked(this.templateSku.parameters);
          }
        })
        .catch(error => {});
    } else {
      if (!optionData.linkedParameters) {
        optionData.linkedParameters = [];
      }
      for (let i = 0; i < optionData.linkedParametersList.length; i++) {
        if (
          !optionData.linkedParameters.includes(
            optionData.linkedParametersList[i].parameter_id
          )
        ) {
          optionData.linkedParameters.push(
            optionData.linkedParametersList[i].parameter_id
          );
        }
      }

      if (!flag) {
        !this.templateSku.parameters
          ? this.fetchTemplateSkuParametersByTemplateSku(this.templateSku)
          : this.checkIsParameterLinked(this.templateSku.parameters);
      }
    }
  }

  fetchTemplateSkuParameterChoicesByParameter(parameterObject) {
    this.LoadingMessage = "Loading...";
    this.templateSkuService.API.FetchTemplateSkuParameterChoicesByParameter(
      parameterObject.id
    )
      .then(response => {
        this.LoadingMessage = "";
        this.templateSku = this.templateSkus.find(
          templateSku => templateSku.id == parameterObject.template_master_id
        );
        this.templateSku.parameters.find(
          parameter => parameter.id == parameterObject.id
        ).choices = response;
        this.parameter.choices = response;
        response.length
          ? (this.choiceMessage = "")
          : (this.choiceMessage = "No choices found!");
      })
      .catch(error => {});
  }

  fetchTemplateSkuPackagesByTemplateSku(templateSkuObject) {
    this.LoadingMessage = "Loading...";
    this.templateSkuService.API.FetchTemplateSkuPackagesByTemplateSku(
      templateSkuObject.id
    )
      .then(response => {
        this.LoadingMessage = "";
        this.templateSkus.find(
          templateSku => templateSku.id == templateSkuObject.id
        ).packages = response;
        response.length
          ? (this.packageMessage = "")
          : (this.packageMessage = "No packages found!");
      })
      .catch(error => {});
  }

  fetchTemplateSkuOptionsByTemplateSku(templateSkuObject) {
    this.LoadingMessage = "Loading...";
    this.templateSkuService.API.FetchTemplateSkuOptionsByTemplateSku(
      templateSkuObject.id
    )
      .then(response => {
        this.LoadingMessage = "";
        this.templateSkus.find(
          templateSku => templateSku.id == templateSkuObject.id
        ).options = response;
        response.length
          ? (this.optionMessage = "")
          : (this.optionMessage = "No options found!");
      })
      .catch(error => {});
  }

  fetchTemplateSkuOptionChoicesByParameter(optionObject) {
    this.LoadingMessage = "Loading...";
    this.templateSkuService.API.FetchTemplateSkuOptionChoicesByParameter(
      optionObject.id
    )
      .then(response => {
        this.LoadingMessage = "";
        this.templateSku = this.templateSkus.find(
          templateSku => templateSku.id == optionObject.template_id
        );
        this.templateSku.options.find(
          option => option.id == optionObject.id
        ).choices = response;
        this.option.choices = response;
        //let tempArray = [...new Set(this.option.choices)];
        let tempArray = new Array();
        let obj = {};

        for (let i = 0; i < this.option.choices.length; i++)
          obj[this.option.choices[i]["id"]] = this.option.choices[i];

        for (let key in obj) tempArray.push(obj[key]);

        for (let i = 0; i < tempArray.length; i++) {
          if (tempArray[i].sku) {
            this.skuService.API.SearchSKU("sku", tempArray[i].sku)
              .then(resp => {
                tempArray.find(idx => {
                  if (idx.sku === tempArray[i].sku) {
                    idx.skuDetails = resp.data[0];
                    this.dataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
                      this.skuUUID,
                      idx.skuDetails.id,
                      "cover_image"
                    )
                      .then(response => {
                        if (response && response.length > 0) {
                          if (!response[0].url) {
                            idx.skuDetails.imgUrl = this.dataLakeAPIService.API.GetImageDownloadUrl(
                              response[0].drop_id,
                              "100x100",
                              this.skuUUID
                            );
                          } else if (response[0].url) {
                            idx.skuDetails.imgUrl = response[0].url;
                          }
                          idx.skuDetails.drop_id = response[0].drop_id;
                        } else {
                          idx.skuDetails.imgUrl = undefined;
                        }
                      })
                      .catch(error => {});
                  }
                });
              })
              .catch(error => {});
          }
        }
        response.length
          ? (this.choiceMessage = "")
          : (this.choiceMessage = "No choices found!");
      })
      .catch(error => {});
  }

  openTemplateConfiguration(entityObject, entityName) {
    if (entityName && entityName.toLowerCase() === "template parameter") {
      this.templateSku = entityObject;
      this.parameter = undefined;
      this.option = undefined;
      this.isShowParameterDetails = false;
      for (
        let templateIndex = 0;
        templateIndex < this.templateSkus.length;
        templateIndex++
      ) {
        if (this.tempRowAdded) {
          this.templateSkus[templateIndex].openConfigureParametersTabel = false;
        }
        if (this.templateSkus[templateIndex].id != entityObject.id) {
          this.templateSkus[templateIndex].openConfigureParametersTabel = false;
        } else {
          this.templateSkus[templateIndex].openConfigureParametersTabel = !this
            .templateSkus[templateIndex].openConfigureParametersTabel;
        }
        this.templateSkus[templateIndex].openConfigurePackagesTable = false;
        this.templateSkus[templateIndex].openConfigureOptionTable = false;
        this.templateSkus[templateIndex].openParametersChoiceTable = false;
        this.templateSkus[templateIndex].openOptionsChoiceTable = false;
      }
      !this.templateSku.parameters
        ? this.fetchTemplateSkuParametersByTemplateSku(this.templateSku)
        : null;
      this.templateSku.parameters && this.templateSku.parameters.length
        ? (this.parameterMessage = "")
        : (this.parameterMessage = "No parameters found!");
      this.removeTempRow({}, "templatemaster");
      this.removeTempRow({}, entityName);
      this.getModelAndSetValidationRules(
        this.common.Identifiers.template_parameter
      );
    } else if (entityName && entityName.toLowerCase() === "template package") {
      this.templateSku = entityObject;
      this.parameter = undefined;
      this.option = undefined;
      for (
        let templateIndex = 0;
        templateIndex < this.templateSkus.length;
        templateIndex++
      ) {
        if (this.tempRowAdded) {
          this.templateSkus[templateIndex].openConfigurePackagesTable = false;
        }
        if (this.templateSkus[templateIndex].id != entityObject.id) {
          this.templateSkus[templateIndex].openConfigurePackagesTable = false;
        } else {
          this.templateSkus[templateIndex].openConfigurePackagesTable = !this
            .templateSkus[templateIndex].openConfigurePackagesTable;
        }
        this.templateSkus[templateIndex].openConfigureParametersTabel = false;
        this.templateSkus[templateIndex].openConfigureOptionTable = false;
        this.templateSkus[templateIndex].openParametersChoiceTable = false;
        this.templateSkus[templateIndex].openOptionsChoiceTable = false;
      }
      !this.templateSku.packages
        ? this.fetchTemplateSkuPackagesByTemplateSku(this.templateSku)
        : null;
      this.templateSku.packages && this.templateSku.packages.length
        ? (this.packageMessage = "")
        : (this.packageMessage = "No packages found!");
      this.removeTempRow({}, "templatemaster");
      this.removeTempRow({}, entityName);
      this.getModelAndSetValidationRules(
        this.common.Identifiers.template_package
      );
    } else if (entityName && entityName.toLowerCase() === "template option") {
      this.templateSku = entityObject;
      this.parameter = undefined;
      this.option = undefined;
      for (
        let templateIndex = 0;
        templateIndex < this.templateSkus.length;
        templateIndex++
      ) {
        if (this.tempRowAdded) {
          this.templateSkus[templateIndex].openConfigureOptionTable = false;
        }
        if (this.templateSkus[templateIndex].id != entityObject.id) {
          this.templateSkus[templateIndex].openConfigureOptionTable = false;
        } else {
          this.templateSkus[templateIndex].openConfigureOptionTable = !this
            .templateSkus[templateIndex].openConfigureOptionTable;
        }
        this.templateSkus[templateIndex].openConfigureParametersTabel = false;
        this.templateSkus[templateIndex].openConfigurePackagesTable = false;
        this.templateSkus[templateIndex].openParametersChoiceTable = false;
        this.templateSkus[templateIndex].openOptionsChoiceTable = false;
      }
      !this.templateSku.options
        ? this.fetchTemplateSkuOptionsByTemplateSku(this.templateSku)
        : null;
      this.templateSku.options && this.templateSku.options.length
        ? (this.optionMessage = "")
        : (this.optionMessage = "No options found!");
      this.removeTempRow({}, "templatemaster");
      this.getModelAndSetValidationRules(
        this.common.Identifiers.template_option
      );
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      this.parameter = _.clone(entityObject);
      this.option = undefined;
      this.templateSku.openParametersChoiceTable = true;
      !this.parameter.choices
        ? this.fetchTemplateSkuParameterChoicesByParameter(this.parameter)
        : null;
      this.parameter.choices && this.parameter.choices.length
        ? (this.choiceMessage = "")
        : (this.choiceMessage = "No choices found!");
      this.getModelAndSetValidationRules(
        this.common.Identifiers.template_parameter_choice
      );
      this.removeTempRow({}, entityName);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template option choice"
    ) {
      this.option = _.clone(entityObject);
      this.parameter = undefined;
      this.getModelAndSetValidationRules(
        this.common.Identifiers.template_option_choice
      );
      this.templateSku.openOptionsChoiceTable = true;
      !this.option.choices
        ? this.fetchTemplateSkuOptionChoicesByParameter(this.option)
        : null;
      this.option.choices && this.option.choices.length
        ? (this.choiceMessage = "")
        : (this.choiceMessage = "No choices found!");
      this.removeTempRow({}, entityName);
    }
  }

  closeTemplateConfiguration(entityName) {
    this.templateSku.openOptionsChoiceTable = false;
    this.removeTempRow({}, entityName);
    this.templateSku = {};
    if (this.choiceValues) {
      this.choiceValues.showPackagePriceForChoice = false;
    }
    if (entityName && entityName.toLowerCase() === "template parameter") {
      this.templateSku.openConfigureParametersTabel = false;
      this.templateParameterDetails = {};
      this.isShowParameterDetails = false;
      this.closeTemplateConfiguration("Template Parameter Choice");
    } else if (entityName && entityName.toLowerCase() === "template package") {
      this.templateSku.openConfigurePackagesTable = false;
      this.packageDetails = {};
      this.isShowPackageDetails = false;
    } else if (entityName && entityName.toLowerCase() === "template option") {
      this.templateSku.openConfigureOptionTable = false;
      this.isShowOptionDetails = false;
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      this.templateSku.openParametersChoiceTable = false;
      // this.templateSku.openConfigureParametersTabel = true;
      this.parameterChoiceDetails = {};
      this.isShowParameterChoiceDetails = false;
    }
  }

  openCreateForm(entityName) {
    if (entityName && entityName.toLowerCase() === "template parameter") {
      this.templateParameterDetails = {};
      this.isShowParameterDetails = false;
      this.isConfirmParameterDelete = false;
      if (!this.tempRowAdded) {
        this.tempRowAdded = true;
        this.templateSku.parameters.unshift({
          isNew: 1,
          id: undefined,
          parameter_name: undefined
        });
      }
      this.$timeout(() => {
        this.isShowParameterDetails = true;
        this.setInitialState(entityName);
      }, 0);
    } else if (entityName && entityName.toLowerCase() === "template package") {
      this.packageDetails = {};
      this.packageDetails.template_master_id = this.templateSku.id;
      this.packageDetails.template_name = this.templateSku.name;
      this.isConfirmPackageDelete = false;
      this.isShowPackageDetails = false;
      if (!this.tempRowAdded) {
        this.tempRowAdded = true;
        this.templateSku.packages.unshift({
          isNew: 1,
          id: undefined,
          package_name: undefined
        });
      }
      this.$timeout(() => {
        this.isShowPackageDetails = true;
        this.setInitialState(entityName);
      }, 0);
    } else if (entityName && entityName.toLowerCase() === "template option") {
      this.optionDetails = {
        option_name: null
      };
      this.optionDetails.linkedParameters = [];
      this.templateSku.parameters = null;
      this.optionDetails.add_parameter_ids = [];
      this.optionDetails.add_parameters = [];
      this.optionDetails.template_id = this.templateSku.id;
      this.optionDetails.template_name = this.templateSku.name;
      this.fetchTemplateSkuParametersByTemplateSku(this.templateSku);
      this.isShowOptionDetails = true;
      //this.optionForm.$setPristine();
    } else if (entityName && entityName.toLowerCase() === "template_master") {
      this.openUpdateTemplateNameSidepanel = true;
      this.isShowAdd = true;
      this.templateDetails = {};
    } else if (
      entityName &&
      entityName.toLowerCase() === "template option choice"
    ) {
      this.isShowOptionChoiceDetails = false;
      this.isConfirmOptionChoiceDelete = false;
      this.isShowAdd = true;
      this.templateOptionChoiceDetails = {};
      this.templateOptionChoiceDetails.option_id = this.option.id;
      this.templateOptionChoiceDetails.option_name = this.option.option_name;
      this.templateOptionChoiceDetails.packages = [];
      this.templateSkuService.API.FetchTemplateSkuPackagesByTemplateSku(
        this.templateSku.id
      )
        .then(response => {
          this.packageList = response;
          for (
            let packageIndex = 0;
            packageIndex < this.packageList.length;
            packageIndex++
          ) {
            this.templateOptionChoiceDetails.packages.push({
              template_master_id: this.templateSku.id,
              id: this.packageList[packageIndex].id,
              package_name: this.packageList[packageIndex].package_name,
              price: "0"
            });
          }
        })
        .catch(() => {});
      this.$timeout(() => {
        this.isShowOptionChoiceDetails = true;
        this.setInitialState(entityName);
      }, 0);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      this.parameterChoiceDetails = {};
      this.parameterChoiceDetails.template_master_id = this.templateSku.id;
      this.parameterChoiceDetails.template_name = this.templateSku.name;
      this.parameterChoiceDetails.parameter_id = this.parameter.id;
      this.parameterChoiceDetails.parameter_name = this.parameter.parameter_name;
      this.isShowParameterChoiceDetails = false;
      if (!this.tempRowAdded) {
        this.tempRowAdded = true;
        this.parameter.choices.unshift({
          isNew: 1,
          id: undefined,
          choice: undefined
        });
      }
      !this.templateSku.packages
        ? this.fetchTemplateSkuPackagesByTemplateSku(this.templateSku)
        : null;
      this.$timeout(() => {
        this.isShowParameterChoiceDetails = true;
        this.setInitialState(entityName);
      }, 0);
    }
    this.isShowAdd = true;
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
  }

  savePackage(packageDetails) {
    packageDetails.isProcessing = true;
    this.saveBtnText = "Saving now...";
    this.templateSkuService.API.CreateTemplatePackage(packageDetails)
      .then(response => {
        packageDetails.id = response.inserted_id;
        this.saveBtnText = "Save";
        packageDetails.isProcessing = false;
        this.isConfirmDelete = false;
        this.isSaveSuccess = true;
        this.isUpdateSuccess = false;
        this.isDeleteSuccess = false;
        if (this.tempRowAdded) {
          this.tempRowAdded = false;
          this.package = {};
          this.templateSku.packages.splice(0, 1);
          this.isShowPackageDetails = false;
        }
        this.templateSku.packages.unshift(packageDetails);
        if (this.templateSku.parameters) {
          this.templateSku.parameters.forEach(parameter => {
            parameter.choices = undefined;
          });
        }
      })
      .catch(error => {
        this.errorMessage = error.data.error.message || error.data.error;
        packageDetails.isProcessing = false;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        this.common.$timeout(() => {
          this.errorMessage = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
        }, 2500);
      });
  }

  updatePackage(packageDetails) {
    this.isConfirmPackageDelete = false;
    packageDetails.isProcessing = true;
    if (this.hasUpdateChanges(packageDetails)) {
      this.updateBtnText = "Updating now...";
      this.templateSkuService.API.UpdateTemplatePackage(packageDetails)
        .then(response => {
          packageDetails.isProcessing = false;
          this.updateBtnText = "Update";
          this.isConfirmDelete = false;
          this.isSaveSuccess = false;
          this.isUpdateSuccess = true;
          this.isDeleteSuccess = false;
          this.isShowPackageDetails = false;
          this.templateSku.packages[
            this.templateSku.packages.findIndex(
              _package => _package.id == packageDetails.id
            )
          ] = packageDetails;
          if (this.templateSku.parameters) {
            this.templateSku.parameters.forEach(parameter => {
              parameter.choices = undefined;
            });
          }
        })
        .catch(error => {
          this.errorMessage = error.data.error.message || error.data.error;
          packageDetails.isProcessing = false;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = true;
          this.common.$timeout(() => {
            this.errorMessage = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
        });
    } else {
      this.isShowPackageDetails = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        packageDetails.isProcessing = false;
      }, 1000);
    }
  }

  removePackage(packageDetails) {
    packageDetails.isProcessing = true;
    this.templateSkuService.API.DeleteTemplatePackage(packageDetails.id)
      .then(response => {
        packageDetails.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmPackageDelete = false;
        this.isSaveSuccess = false;
        this.isUpdateSuccess = false;
        this.templateSku.packages.splice(
          this.templateSku.packages.findIndex(
            _package => _package.id == packageDetails.id
          ),
          1
        );
        this.package = undefined;
        this.templateSku.packages && this.templateSku.packages.length
          ? (this.packageMessage = "")
          : (this.packageMessage = "No packages found!");
        this.isConfirmPackageDelete = false;
        if (this.templateSku.parameters) {
          this.templateSku.parameters.forEach(parameter => {
            parameter.choices = undefined;
          });
        }
      })
      .catch(error => {
        packageDetails.isProcessing = false;
      });
  }

  toggleOptionForParameter(data) {
    if (data) this.choiceValues = data;
    data.showOptionForParameter = !data.showOptionForParameter;
  }

  saveOption(optionDetails) {
    this.isProcessing = true;
    this.saveBtnText = "Saving now...";

    this.templateSkuService.API.CreateTemplateOpion(optionDetails)
      .then(response => {
        optionDetails.id = response.inserted_id;
        this.saveBtnText = "Save";
        this.isProcessing = false;
        this.isConfirmDelete = false;
        this.isSaveSuccess = true;
        this.isUpdateSuccess = false;
        this.isDeleteSuccess = false;
        this.templateSku.options.push(optionDetails);
        this.addOrRemoveOptionInList(optionDetails);
      })
      .catch(error => {
        this.errorMessage = error.data.error.message || error.data.error;
        this.isProcessing = false;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        this.common.$timeout(() => {
          this.errorMessage = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
        }, 2500);
      });
  }

  addOrRemoveOptionInList(optionDetails, isUpdateFlag) {
    let idx = this.templateSku.options.findIndex(
      op => op.id === optionDetails.id
    );
    if (optionDetails.linkedParametersList) {
      for (let i = 0; i < optionDetails.add_parameter_ids.length; i++) {
        optionDetails.linkedParametersList.push({
          parameter_id: optionDetails.add_parameter_ids[i],
          parameter_name: this.parametersMap[optionDetails.add_parameter_ids[i]]
            .parameter_name,
          option_id: optionDetails.id,
          option_name: optionDetails.option_name
        });
      }
      if (isUpdateFlag) {
        /* for(let i=optionDetails.linkedParameters.length-1;i>=0;i--) {
          if(optionDetails.delete_parameter_ids.includes(optionDetails.linkedParameters[i])) {
            optionDetails.linkedParameters.splice(i,1);
          }
        } */

        for (
          let i = optionDetails.linkedParametersList.length - 1;
          i >= 0;
          i--
        ) {
          if (
            optionDetails.delete_parameter_ids.includes(
              optionDetails.linkedParametersList[i].parameter_id
            )
          ) {
            //optionDetails.linkedParameters.splice(optionDetails.linkedParameters.findIndex(pId => pId === optionDetails.linkedParametersList[i].parameter_id),1);
            optionDetails.linkedParametersList.splice(i, 1);
          }
        }
      }
    }
    this.templateSku.options[idx] = optionDetails;
  }

  updateOption(optionDetails) {
    this.isProcessing = true;
    if (this.hasUpdateChanges(optionDetails) || this.isOptionChanged) {
      this.updateBtnText = "Updating now...";
      this.templateSkuService.API.UpdateTemplateOpion(optionDetails)
        .then(response => {
          optionDetails.linkedParameters = optionDetails.linkedParameters.filter(
            parameter_id =>
              !optionDetails.delete_parameter_ids.includes(parameter_id)
          );
          optionDetails.linkedParameters = [
            ...optionDetails.linkedParameters,
            ...optionDetails.add_parameter_ids
          ];
          this.isProcessing = false;
          this.updateBtnText = "Update";
          this.isConfirmDelete = false;
          this.isSaveSuccess = false;
          this.isUpdateSuccess = true;
          this.isDeleteSuccess = false;
          this.showhistory = false;
          this.isShowHistory = false;
          for (let i = 0; i < this.templateSku.options.length; i++) {
            if (this.templateSku.options[i].id === optionDetails.id) {
              this.templateSku.options[i].option_name =
                optionDetails.option_name;
            }
          }
          this.addOrRemoveOptionInList(optionDetails, true);
        })
        .catch(error => {
          this.errorMessage = error.data.error.message || error.data.error;
          this.isProcessing = false;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = true;
          this.common.$timeout(() => {
            this.errorMessage = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
        });
    } else {
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        this.isProcessing = false;
      }, 1000);
    }
  }

  removeOption(optionDetails) {
    this.isProcessing = true;
    this.templateSkuService.API.DeleteTemplateOpion(optionDetails.id)
      .then(response => {
        this.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        this.isSaveSuccess = false;
        this.isUpdateSuccess = false;
        this.templateSku.options.splice(
          this.templateSku.options.findIndex(
            option => option.id == optionDetails.id
          ),
          1
        );
        this.option = undefined;
        this.templateSku.options && this.templateSku.options.length
          ? (this.optionMessage = "")
          : (this.optionMessage = "No options found!");
      })
      .catch(error => {
        this.isProcessing = false;
      });
  }

  checkIsParameterLinked(allparameters) {
    for (let i = 0; i < allparameters.length; i++) {
      let parameter = allparameters[i];
      parameter.checked =
        this.optionDetails &&
        this.optionDetails.linkedParameters &&
        this.optionDetails.linkedParameters.includes(parameter.id)
          ? 1
          : 0;
    }
  }

  addParameterToOption(parameterData) {
    if (parameterData.checked) {
      //if parameter id is not linked already then push to array to link
      if (!this.optionDetails.linkedParameters.includes(parameterData.id)) {
        this.optionDetails.add_parameter_ids.push(parameterData.id);
        this.optionDetails.add_parameters.push(parameterData.parameter_name);
      }

      //if parameter id is linked already and it is there in delete ids array then remove from delete ids array
      if (this.optionDetails.linkedParameters.includes(parameterData.id)) {
        let idx = this.optionDetails.delete_parameter_ids.indexOf(
          parameterData.id,
          0
        );
        this.optionDetails.delete_parameter_ids.splice(idx, 1);
        this.optionDetails.delete_parameters.splice(idx, 1);
      }
    } else if (!parameterData.checked) {
      //if parameter id is linked already then push to array of ids to delete
      if (this.optionDetails.linkedParameters.includes(parameterData.id)) {
        this.optionDetails.delete_parameter_ids.push(parameterData.id);
        this.optionDetails.delete_parameters.push(parameterData.parameter_name);
      }

      //remove from array of ids to be linked
      if (this.optionDetails.add_parameter_ids.includes(parameterData.id)) {
        let idx = this.optionDetails.add_parameter_ids.indexOf(
          parameterData.id,
          0
        );
        this.optionDetails.add_parameter_ids.splice(idx, 1);
        this.optionDetails.add_parameters.splice(idx, 1);
      }
    }
    this.isOptionChanged = true;
  }

  // set focus on first field in form
  setInitialState(entityName) {
    if (entityName && entityName.toLowerCase() === "template option") {
      this.common.$timeout(() => {
        angular.element("#option_name").focus();
      }, 0);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter"
    ) {
      this.common.$timeout(() => {
        angular.element("#parameter_name").focus();
      }, 0);
    } else if (entityName && entityName.toLowerCase() === "template package") {
      this.common.$timeout(() => {
        angular.element("#package_name").focus();
      }, 0);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template option choice"
    ) {
      this.common.$timeout(() => {
        angular.element("#choice").focus();
      }, 0);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      this.common.$timeout(() => {
        angular.element("#parameter_choice").focus();
      }, 0);
    } else {
      this.common.$timeout(() => {
        angular.element("#name").focus();
      }, 0);
    }
    this.successMessage = null;
  }

  resetForm() {
    vm.templateDetails = {};
    vm.templateDetails["name"] = null;
  }

  closeForm() {
    this.isShowPackageDetails = false;
    this.isShowOptionDetails = false;
    this.openUpdateTemplateNameSidepanel = false;
    this.showhistory = false;
    this.isShowParameterDetails = false;
    this.isShowOptionChoiceDetails = false;
    this.isShowParameterChoiceDetails = false;
    this.$timeout(() => {
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  }

  closeParameterChoiceSection() {
    this.templateSku.openParametersChoiceTable = false;
    this.isShowParameterChoiceDetails = false;
  }

  removeTempRow(data, entityName) {
    if (entityName && entityName.toLowerCase() === "templatemaster") {
      this.isConfirmTemplateDelete = false;
      if (data && data.id) {
        this.openUpdateTemplateNameSidepanel = false;
        this.isConfirmTemplateDelete = false;
        if (data.validationMessage) {
          data.validationMessage = false;
        }
      } else {
        if (
          this.templateSkus &&
          (!this.templateSkus[0] || !this.templateSkus[0].id)
        ) {
          this.templateSkus.splice(0, 1);
        }
        this.tempRowAdded = false;
      }
    }
    if (entityName && entityName.toLowerCase() === "template parameter") {
      this.isConfirmParameterDelete = false;
      if (data && data.id) {
        this.isShowParameterDetails = false;
        this.isConfirmParameterDelete = false;
      } else {
        if (
          this.templateSku &&
          this.templateSku.parameters &&
          this.templateSku.parameters[0] &&
          !this.templateSku.parameters[0].id
        ) {
          this.templateSku.parameters.splice(0, 1);
        }
        this.tempRowAdded = false;
      }
    }
    if (entityName && entityName.toLowerCase() === "template package") {
      this.isConfirmPackageDelete = false;
      if (data && data.id) {
        this.isShowPackageDetails = false;
      } else {
        if (
          this.templateSku &&
          this.templateSku.packages &&
          this.templateSku.packages[0] &&
          !this.templateSku.packages[0].id
        ) {
          this.templateSku.packages.splice(0, 1);
        }
        this.tempRowAdded = false;
      }
    }
    if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      this.isConfirmParameterChoiceDelete = false;
      if (data && data.id) {
        this.isShowParameterChoiceDetails = false;
        this.parameterChoiceDetails = {};
      } else {
        if (
          this.templateSku &&
          this.templateSku.parameters &&
          this.templateSku.parameters[0] &&
          !this.templateSku.parameters[0].id
        ) {
          this.templateSku.parameters.splice(0, 1);
        }
        if (
          this.parameter &&
          this.parameter.choices &&
          this.parameter.choices[0] &&
          !this.parameter.choices[0].id
        ) {
          this.parameter.choices.splice(0, 1);
        }
        this.tempRowAdded = false;
      }
    }
    // if (entityName && entityName.toLowerCase() === 'template option choice') {
    //   this.isShowOptionChoiceDetails = false;
    //   this.isConfirmOptionChoiceDelete = false;
    //   if (data && data.id) {
    //     this.isShowOptionChoiceDetails = false;
    //   } else {
    //     if (this.option && this.option.choices && this.option.choices[0] && !this.option.choices[0].id) {
    //       this.option.choices.splice(0, 1);
    //     }
    //     this.option.choices.length ? this.choiceMessage = "" : this.choiceMessage = "No choices found!";
    //   }
    // }
  }

  getItemTypeBySku(search_field, searchData) {
    let search_value = searchData.sku;
    if (searchData.sku) {
      this.skuService.API.SearchSKU(search_field, search_value)
        .then(response => {
          searchData.item_type_id = response.data[0].item_type_id;
          //this.fetchSKUs('item_type_id', searchData);
          this.oldPayload = angular.copy(searchData);
        })
        .catch(err => logger.error(err));
    } else {
      searchData.item_type_id = null;
      this.oldPayload = angular.copy(searchData);
    }
  }

  dblClickAction(entityData, entityName) {
    // to keep a copy of the old data
    this.oldPayload = _.clone(entityData);
    if (entityName && entityName.toLowerCase() === "template") {
      //this.templateSku = _.clone(entityData);
      this.templateDetails = _.clone(entityData);
      if (this.tempRowAdded && entityData.id) {
        this.templateSkus.splice(0, 1);
        this.tempRowAdded = false;
      }
      this.isConfirmParameterDelete = false;
      this.isShowOptionDetails = false;
      this.isShowParameterDetails = false;
      this.openUpdateTemplateNameSidepanel = true;
      this.selected_uuid = this.common.Identifiers.template; // variables used to get history
      this.instance_id = entityData.id;
      this.isConfirmTemplateDelete = false;
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter"
    ) {
      this.isShowOptionDetails = false;
      this.isShowParameterDetails = true;
      this.isShowParameterChoiceDetails = false;
      this.templateParameterDetails = _.clone(entityData);
      this.isConfirmParameterDelete = false;
      if (this.tempRowAdded && entityData.id) {
        this.tempRowAdded = false;
        this.templateSku.parameters.splice(0, 1);
      }
      this.selected_uuid = this.common.Identifiers.template_parameter; // variables used to get history
      this.instance_id = entityData.id;
    } else if (entityName && entityName.toLowerCase() === "template package") {
      this.packageDetails = _.clone(entityData);
      this.isShowPackageDetails = true;
      this.isConfirmPackageDelete = false;
      if (this.tempRowAdded && entityData.id) {
        this.tempRowAdded = false;
        this.templateSku.packages.splice(0, 1);
      }
      this.selected_uuid = this.common.Identifiers.template_package; // variables used to get history
      this.instance_id = entityData.id;
    } else if (entityName && entityName.toLowerCase() === "template option") {
      this.optionDetails = _.clone(entityData);
      this.isShowOptionDetails = true;
      this.selected_uuid = this.common.Identifiers.template_option; // variables used to get history
      this.instance_id = entityData.id;
      this.optionDetails.delete_parameter_ids = [];
      this.optionDetails.add_parameter_ids = [];
      this.optionDetails.delete_parameters = [];
      this.optionDetails.add_parameters = [];
      this.fetchLinkedParameterByOptionId(this.optionDetails);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template option choice"
    ) {
      this.templateOptionChoiceDetails = {
        id: entityData[0].id,
        choice: entityData[0].choice,
        option_id: entityData[0].option_id,
        option_name: entityData[0].option_name,
        template_id: entityData[0].template_id,
        template_name: entityData[0].template_name,
        sku: entityData[0].sku ? entityData[0].sku : ""
      };
      this.templateOptionChoiceDetails.packages = [];
      for (let i = 0; i < entityData.length; i++) {
        const priceValue = Number(entityData[i].price).toFixed(2);
        this.templateOptionChoiceDetails.packages.push({
          id: entityData[i].price_id,
          package_id: entityData[i].package_id,
          package_name: entityData[i].package_name,
          price: priceValue
        });
      }
      this.isShowOptionChoiceDetails = true;
      this.selected_uuid = this.common.Identifiers.template_option_choice; // variables used to get history
      this.instance_id = this.templateOptionChoiceDetails.id;
      this.fetchTemplateSkuPackagesByTemplateSku(this.templateSku);
      this.getItemTypeBySku("sku", this.templateOptionChoiceDetails);
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      if (this.tempRowAdded && entityData.id) {
        this.parameter.choices.splice(0, 1);
        this.tempRowAdded = false;
      }
      this.parameterChoiceDetails = _.clone(entityData);
      this.parameterChoiceDetails.template_master_id = this.parameter.template_master_id;
      this.parameterChoiceDetails.parameter_id = this.parameter.id;
      this.isShowParameterDetails = false;
      this.isShowParameterChoiceDetails = true;
      this.selected_uuid = this.common.Identifiers.template_parameter_choice; // variables used to get history
      this.instance_id = entityData.id;
      !this.templateSku.packages
        ? this.fetchTemplateSkuPackagesByTemplateSku(this.templateSku)
        : null;
    }
    this.setInitialState(entityName);
    this.isOptionChanged = false;
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isShowHistory = true;
    this.isShowAdd = false;
    // variables used to get history
    this.showhistory = false;
  }

  setRow(data, entityName) {
    this.showhistory = true;
    this.instance_id = data.id;
    if (entityName && entityName.toLowerCase() === "template") {
      this.templateSku = data;
      this.selected_uuid = this.common.Identifiers.template; // variables used to get history
    }
  }

  // funcion to check if the payload has changed, if yes returns true else returns false
  hasUpdateChanges(payload) {
    for (let key in payload) {
      if (
        this.oldPayload[key] !== undefined &&
        payload[key] !== undefined &&
        this.oldPayload[key] !== payload[key] &&
        typeof this.oldPayload[key] !== "object"
      ) {
        return true;
      }
    }
    return false;
  }

  // CRUD Operation for Template master start

  openAddTemplate() {
    this.templateDetails = {};
    this.templateSku = {};
    this.isConfirmTemplateDelete = false;
    this.openUpdateTemplateNameSidepanel = false;
    if (!this.tempRowAdded) {
      let tempObj = {
        isNew: 1,
        id: undefined,
        name: this.searchTemplateName
      };
      this.tempRowAdded = true;
      this.templateSkus.unshift(tempObj);
    }
    this.$timeout(() => {
      this.openUpdateTemplateNameSidepanel = true;
      this.setInitialState();
    }, 0);
  }

  controlInlineAddOnSearch(entityName) {
    if (
      entityName &&
      entityName.toLowerCase() === "template" &&
      this.tempRowAdded
    ) {
      this.templateSkus[0].name = this.searchTemplateName;
    }
  }

  validateForm(data, fieldName) {
    if (!fieldName) {
      data.validationMessage = "Required filed";
    } else if (fieldName.length < 2 || fieldName.length > 40) {
      data.validationMessage = "Length should be between 2 and 40.";
    } else {
      data.validationMessage = "";
    }
  }

  validatePriceField(data, fieldName) {
    if (fieldName && fieldName.includes(".")) {
      fieldName = fieldName.substring(0, fieldName.indexOf("."));
    }
    if (!fieldName) {
      data.validationMessage = "Required filed";
    } else if (fieldName.length < 0 || fieldName.length > 6) {
      data.validationMessage = "Length should be between 1 and 6.";
    } else {
      data.validationMessage = "";
    }
  }

  saveTemplateSKU(data) {
    data.isProcessing = true;
    this.saveBtnText = "Saving now...";
    this.templateSkuService.API.InsertTemplateSku(data)
      .then(response => {
        data.isProcessing = false;
        data.validationMessage = false;
        this.saveBtnText = "Save";
        data.id = response.inserted_id;
        this.isSaveSuccess = true;
        this.openUpdateTemplateNameSidepanel = false;
        if (this.tempRowAdded) {
          this.tempRowAdded = false;
          this.templateSku = {};
          this.templateSkus.splice(0, 1);
        }
        this.templateSkus.unshift(data);
      })
      .catch(error => {
        data.isProcessing = false;
        this.templateDetails.errorMessage =
          error.data.error.message || error.data.error;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        //this.errorMessage = NotificationService.errorNotification(error);
        this.common.$timeout(() => {
          this.templateDetails.errorMessage = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
        }, 2500);
      });
  }

  updateTemplateSKU(data) {
    data.isProcessing = true;
    this.isConfirmTemplateDelete = false;
    if (this.hasUpdateChanges(data)) {
      this.updateBtnText = "Updating now...";
      this.templateSkuService.API.UpdateTemplateSkuById(data)
        .then(response => {
          this.isShowHistory = false;
          this.updateBtnText = "Update";
          this.showhistory = false;
          data.isProcessing = false;
          data.validationMessage = false;
          this.isUpdateSuccess = true;
          this.openUpdateTemplateNameSidepanel = false;
          this.successMessage = response.message;
          let index = this.templateSkus.findIndex(
            template => template.id === data.id
          );
          this.templateSkus[index] = data;
        })
        .catch(error => {
          this.templateDetails.errorMessage =
            error.data.error.message || error.data.error;
          data.isProcessing = false;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = true;
          this.common.$timeout(() => {
            this.templateDetails.errorMessage = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
        });
    } else {
      this.openUpdateTemplateNameSidepanel = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        data.isProcessing = false;
      }, 1000);
    }
  }

  deleteTemplateSKU(data) {
    data.isProcessing = true;
    this.templateSkuService.API.DeleteTemplateSku(data)
      .then(response => {
        data.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        let index = this.templateSkus.findIndex(
          template => template.id === data.id
        );
        this.templateSkus.splice(index, 1);
        this.templateSkus.length
          ? (this.templateMessage = "")
          : (this.templateMessage = "No template found!");
        this.isConfirmTemplateDelete = false;
        this.parameter = undefined;
        this.option = undefined;
        this.package = undefined;
        this.templateSku = undefined;
      })
      .catch(error => {
        data.isProcessing = false;
      });
  }

  // CRUD Operation for Template master end

  // CRUD Operation for Template parameter start

  saveTemplateParameterBySKU(data) {
    data.isProcessing = true;
    this.saveBtnText = "Saving now...";
    data.template_master_id = this.templateSku.id;
    data.template_name = this.templateSku.name;
    this.templateSkuService.API.InsertTemplateSkuParameterByTemplateSku(data)
      .then(response => {
        data.isProcessing = false;
        this.saveBtnText = "Save";
        data.id = response.inserted_id;
        this.isSaveSuccess = true;
        if (this.tempRowAdded) {
          this.tempRowAdded = false;
          this.parameter = {};
          this.templateSku.parameters.splice(0, 1);
          this.isShowParameterDetails = false;
        }
        this.templateSku.parameters.unshift(data);
      })
      .catch(error => {
        data.isProcessing = false;
        this.templateParameterDetails.errorMessage =
          error.data.error.message || error.data.error;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        this.common.$timeout(() => {
          this.templateParameterDetails.errorMessage = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
        }, 2500);
      });
  }

  updateTemplateParameterBySKU(data) {
    this.isConfirmParameterDelete = false;
    data.isProcessing = true;
    if (this.hasUpdateChanges(data)) {
      this.updateBtnText = "Updating now...";
      this.templateSkuService.API.UpdateTemplateSkuParameterByTemplateSku(data)
        .then(response => {
          data.isProcessing = false;
          this.updateBtnText = "Update";
          this.isUpdateSuccess = true;
          this.isShowParameterDetails = false;
          let index = this.templateSku.parameters.findIndex(
            parameter => parameter.id === data.id
          );
          this.templateSku.parameters[index] = data;
        })
        .catch(error => {
          data.isProcessing = false;
          this.templateParameterDetails.errorMessage =
            error.data.error.message || error.data.error;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = true;
          this.common.$timeout(() => {
            this.templateParameterDetails.errorMessage = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
        });
    } else {
      this.isShowParameterDetails = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        data.isProcessing = false;
      }, 1000);
    }
  }

  // Show confirmation page on click of delete button
  showconfirm() {
    this.isConfirmDelete = true;
    this.isShowHistory = false;
    this.showhistory = false;
  }

  deleteTemplateParameterBySKU(data) {
    data.isProcessing = true;
    this.templateSkuService.API.DeleteTemplateSkuParameterByTemplateSku(data)
      .then(response => {
        data.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        let index = this.templateSku.parameters.findIndex(
          parameter => parameter.id === data.id
        );
        this.templateSku.parameters.splice(index, 1);
        this.parameter = undefined;
        this.templateSku.parameters.length
          ? (this.parameterMessage = "")
          : (this.parameterMessage = "No parameters found!");
        this.isConfirmParameterDelete = false;
      })
      .catch(error => {
        data.isProcessing = false;
      });
  }

  // CRUD Operation for Parameter choice start

  togglePackagePriceForChoice(data) {
    if (data) this.choiceValues = data;
    data.showPackagePriceForChoice = !data.showPackagePriceForChoice;
  }

  saveParameterChoice(parameterChoiceDetails) {
    parameterChoiceDetails.isProcessing = true;
    this.saveBtnText = "Saving now...";
    this.templateSkuService.API.CreateTemplateParameterChoice(
      parameterChoiceDetails
    )
      .then(response => {
        if (this.tempRowAdded) {
          this.tempRowAdded = false;
          this.parameterChoiceDetails = {};
          this.parameter.choices.splice(0, 1);
          this.isShowParameterChoiceDetails = false;
        }
        parameterChoiceDetails.id = response.inserted_id;
        this.saveBtnText = "Save";
        parameterChoiceDetails.isProcessing = false;
        this.isConfirmDelete = false;
        this.isSaveSuccess = true;
        this.isUpdateSuccess = false;
        this.isDeleteSuccess = false;
        if (this.templateSku.packages && this.templateSku.packages.length) {
          // push choice object with each package price
          for (
            let packageIndex = 0;
            packageIndex < this.templateSku.packages.length;
            packageIndex++
          ) {
            const choiceDetails = {
              choice: parameterChoiceDetails.choice,
              id: parameterChoiceDetails.id,
              package_id: this.templateSku.packages[packageIndex].id,
              package_name: this.templateSku.packages[packageIndex]
                .package_name,
              parameter_id: parameterChoiceDetails.parameter_id,
              parameter_name: parameterChoiceDetails.parameter_name,
              price: "0",
              template_master_id: this.templateSku.id,
              template_name: this.templateSku.name
            };
            this.parameter.choices.push(choiceDetails);
          }
        } else {
          this.parameter.choices.push(parameterChoiceDetails);
        }
      })
      .catch(error => {
        parameterChoiceDetails.isProcessing = false;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        this.parameterChoiceDetails.errorMessage =
          error.data.error.message || error.data.error;
        this.common.$timeout(() => {
          this.parameterChoiceDetails.errorMessage = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
        }, 2500);
      });
  }

  roundOff(number) {
    if (Number.parseFloat(number) || Number.parseFloat(number) === 0) {
      return Number.parseFloat(number).toFixed(2);
    }
  }

  updateParameterChoice(parameterChoiceDetails) {
    if (this.hasUpdateChanges(parameterChoiceDetails)) {
      parameterChoiceDetails.isProcessing = true;
      this.updateBtnText = "Updating now...";
      this.templateSkuService.API.UpdateTemplateParameterChoice(
        parameterChoiceDetails
      )
        .then(response => {
          parameterChoiceDetails.isProcessing = false;
          this.updateBtnText = "Update";
          this.isConfirmDelete = false;
          this.isSaveSuccess = false;
          this.isUpdateSuccess = true;
          this.isDeleteSuccess = false;
          this.isShowParameterChoiceDetails = false;
          this.parameterChoiceDetails = {};
          // update choice based on each package price
          for (
            let choiceIndex = 0;
            choiceIndex < this.parameter.choices.length;
            choiceIndex++
          ) {
            if (
              this.parameter.choices[choiceIndex].id ==
                parameterChoiceDetails.id &&
              this.parameter.choices[choiceIndex].package_id ==
                parameterChoiceDetails.package_id
            ) {
              this.parameter.choices[choiceIndex] = parameterChoiceDetails;
            } else if (
              this.parameter.choices[choiceIndex].id ==
              parameterChoiceDetails.id
            ) {
              this.parameter.choices[choiceIndex].choice =
                parameterChoiceDetails.choice;
            }
          }
        })
        .catch(error => {
          parameterChoiceDetails.isProcessing = false;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = true;
          this.parameterChoiceDetails.errorMessage =
            error.data.error.message || error.data.error;
          this.common.$timeout(() => {
            this.parameterChoiceDetails.errorMessage = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
        });
    } else {
      this.isShowParameterChoiceDetails = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        parameterChoiceDetails.isProcessing = false;
      }, 1000);
    }
  }

  removeParameterChoice(parameterChoiceDetails) {
    parameterChoiceDetails.isProcessing = true;
    this.templateSkuService.API.DeleteTemplateParameterChoice(
      parameterChoiceDetails.id
    )
      .then(response => {
        parameterChoiceDetails.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmParameterChoiceDelete = false;
        this.isShowHistory = false;
        this.showhistory = false;
        this.isSaveSuccess = false;
        this.isUpdateSuccess = false;
        this.isShowParameterChoiceDetails = false;
        // update choice based on each package price
        for (
          let choiceIndex = this.parameter.choices.length;
          choiceIndex >= 0;
          choiceIndex--
        ) {
          if (
            this.parameter.choices[choiceIndex] &&
            this.parameter.choices[choiceIndex].id == parameterChoiceDetails.id
          ) {
            this.parameter.choices.splice(choiceIndex, 1);
          }
        }
        this.parameter.choices.length
          ? (this.choiceMessage = "")
          : (this.choiceMessage = "No choices found!");
      })
      .catch(error => {
        parameterChoiceDetails.isProcessing = false;
      });
  }

  showConfirmInline(entityName) {
    this.isProcessing = true;
    if (entityName && entityName.toLowerCase() === "template") {
      this.isConfirmTemplateDelete = true;
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter"
    ) {
      this.isConfirmParameterDelete = true;
    } else if (entityName && entityName.toLowerCase() === "template package") {
      this.isConfirmPackageDelete = true;
    } else if (
      entityName &&
      entityName.toLowerCase() === "template parameter choice"
    ) {
      this.isConfirmParameterChoiceDelete = true;
    } else if (
      entityName &&
      entityName.toLowerCase() === "template option choice"
    ) {
      this.isConfirmOptionChoiceDelete = true;
    }
    this.isShowHistory = false;
    this.showhistory = false;
  }
  // CRUD Operation for Template option choice start

  togglePackagePriceForOption(data) {
    if (data) this.optionValues = data;
    data.showPackagePriceForOption = !data.showPackagePriceForOption;
  }

  saveTemplateOptionChoice(data) {
    this.isProcessing = true;
    this.saveBtnText = "Saving now...";
    data.option_id = this.option.id;
    this.choiceMessage = "";
    this.templateSkuService.API.InsertTemplateOptionChoice(data)
      .then(response => {
        this.isProcessing = false;
        this.saveBtnText = "Save";
        data.id = response.inserted_id;
        this.isSaveSuccess = true;
        this.pushOptionChoicesToList(data);
      })
      .catch(error => {
        this.isProcessing = false;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        this.errorMessage = error.data.error.message || error.data.error;
        this.common.$timeout(() => {
          this.errorMessage = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
        }, 2500);
      });
  }

  pushOptionChoicesToList(data) {
    for (let i = 0; i < data.packages.length; i++) {
      let obj = {
        id: data.id,
        choice: data.choice,
        option_id: data.option_id,
        option_name: data.option_name,
        template_id: data.template_id,
        template_name: data.template_name,
        sku: data.sku,
        price_id: data.packages[i].id,
        package_id: data.packages[i].package_id
          ? data.packages[i].package_id
          : data.packages[i].id,
        package_name: data.packages[i].package_name,
        price: data.packages[i].price
      };
      this.skuService.API.SearchSKU("sku", data.sku)
        .then(resp => {
          obj.skuDetails = resp.data[0];
          obj.skuDetails.imgUrl = this.dataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
            this.skuUUID,
            obj.skuDetails.id,
            "cover_image"
          );
          this.dataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
            this.skuUUID,
            obj.skuDetails.id,
            "cover_image"
          )
            .then(response => {
              if (response && response.length > 0) {
                if (!response[0].url) {
                  obj.skuDetails.imgUrl = this.dataLakeAPIService.API.GetImageDownloadUrl(
                    response[0].drop_id,
                    "100x100",
                    this.skuUUID
                  );
                } else if (response[0].url) {
                  obj.skuDetails.imgUrl = response[0].url;
                }
                obj.skuDetails.drop_id = response[0].drop_id;
              } else {
                obj.skuDetails.imgUrl = undefined;
              }
            })
            .catch(error => {});
        })
        .catch(error => {});
      this.option.choices.push(obj);
    }
  }

  updateTemplateOptionChoice(data) {
    this.isProcessing = true;
    data.item_type_id = Number(data.item_type_id);
    const allowUpdate = this.hasUpdateChanges(data);
    let allowPriceUpdate = false;
    for (
      let packageIndex = 0;
      packageIndex < data.packages.length;
      packageIndex++
    ) {
      for (let key in data.packages[packageIndex]) {
        if (
          this.oldPayload.packages[packageIndex][key] !== undefined &&
          data.packages[packageIndex][key] !== undefined &&
          this.oldPayload.packages[packageIndex][key] !==
            data.packages[packageIndex][key] &&
          typeof this.oldPayload.packages[packageIndex][key] !== "object"
        ) {
          allowPriceUpdate = true;
        }
      }
    }
    if (allowUpdate || allowPriceUpdate) {
      this.updateBtnText = "Updating now...";
      this.templateSkuService.API.UpdateTemplateOptionChoice(data)
        .then(response => {
          this.option.choices = this.option.choices.filter(
            choice => choice.id !== data.id
          );
          this.isProcessing = false;
          this.isUpdateSuccess = true;
          this.isShowHistory = false;
          this.showhistory = false;
          this.updateBtnText = "Update";
          this.pushOptionChoicesToList(data);
        })
        .catch(error => {
          this.isProcessing = false;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = true;
          this.errorMessage = error.data.error.message || error.data.error;
          this.common.$timeout(() => {
            this.errorMessage = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
        });
    } else {
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        this.isProcessing = false;
      }, 1000);
    }
  }

  deleteTemplateOptionChoice(data) {
    this.isProcessing = true;
    this.templateSkuService.API.DeleteTemplateOptionChoice(data)
      .then(response => {
        this.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        this.isShowHistory = false;
        this.showhistory = false;
        this.isShowOptionChoiceDetails = false;
        this.isConfirmOptionChoiceDelete = false;
        this.option.choices = this.option.choices.filter(
          choice => choice.id !== data.id
        );
        this.option.choices.length
          ? (this.choiceMessage = "")
          : (this.choiceMessage = "No choices found!");
        this.isSaveSuccess = false;
        this.isUpdateSuccess = false;
      })
      .catch(error => {
        this.isShowOptionChoiceDetails = false;
        this.isProcessing = false;
      });
  }

  // Get history details for selected instance
  loadHistory() {
    this.showhistoryloading = true;
    this.EntityDetails.API.GetHistoryData(this.selected_uuid, this.instance_id)
      .then(response => {
        this.showhistoryloading = false;
        this.historyList = response;
        this.showhistory = true;
      })
      .catch(error => {
        this.showhistoryloading = false;
        this.logger.error(error);
      });
  }

  // close the show update history panel
  closeShowHistory() {
    this.showhistory = false;
    this.showhistoryloading = false;
  }
}

angular
  .module("rc.prime.templatesku")
  .controller("TemplateController", TemplateController);
