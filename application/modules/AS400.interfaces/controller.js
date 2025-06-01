class ResyncSkuInterfaceController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    SKUService,
    InterfaceService,
    DataLakeAPIService,
    SKUSetService,
    ItemService,
    VendorService,
    APIServices,
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.SKUSetService = SKUSetService;
    this.ItemService = ItemService;
    this.$state = $state;
    this.common = common;
    this.VendorService = VendorService;
    this.logger = this.common.Logger.getInstance("ResyncSkuInterfaceController");
    this.searchedSKUList = [];
    this.setSkuIds = [];
    this.vendorlist = [];
    this.vendorpayload = [];
    this.skuIds = [];
    this.selectedFile = [];
    this.UploadedMessage = '';
    this.invalidmsg = '';
    this.invalidSkusList = [];
    this.CountMessage = '';
    this.ContentMessage = '';
    this.convertClear = false;
    this.selectedExcelFile = null,
      this.priceOptions = [];
    this.staticPriceGroups = [];
    this.selectedPriceGroups = [];
    this.effectiveDates = [];
    this.effectiveDateOptions = [];
    this.selectedEffectiveDate = null;
    this.selectedPrice = null;
    this.isOpen = false;
    this.searchText = "";
    this.priceTypeDisabled = true;
    this.priceGroupsDisabled = true;
    this.skuCount = null;
    this.tab = 1;
    this.isEffectiveDateVisible = true;
    this.priceTypeWarningMessage = null;
    this.isResyncButtonDisabled = false;
    //Initialize SKU Service object, derived from the CommonServices SKU Object
    this.SKUServiceFactory = SKUService;
    this.InterfaceServiceFactory = InterfaceService;
    this.DataLakeFactory = DataLakeAPIService;
    this.RetailService = APIServices.Retail;
    //Call Activate() method to intitialize the controller
    this.Activate();

    this.priceClassMapping = {
      stores: 86,
      outlet: 87,
      web: 88,
      amazon: 633
    };

    this.$scope.tab = {
      currentTab: 1,
      setTab: function (tabId) {
        this.currentTab = tabId;
      },
      isSet: function (tabId) {
        return this.currentTab === tabId;
      }
    };

    $scope.$watch(() => $scope.tab.isSet(1), (isTab1) => {
      if (!isTab1) {
        this.clearSearchEffectiveDate();
      }
    });

    this.$scope.$watch(
      () => this.selectedEffectiveDate,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          this.FetchPriceOptions();
        }
      }
    );

    this.boundHandleDocumentClick = this.handleDocumentClick.bind(this);
    document.addEventListener('click', this.boundHandleDocumentClick);
  }

  handleDocumentClick(event) {
    // Ensure the click was outside the dropdown
    const dropdownElement = document.querySelector('.dropdown');
    if (this.isOpen && dropdownElement && !dropdownElement.contains(event.target)) {
      this.$scope.$apply(() => {
        this.isOpen = false;
      });
    }
  }

  // Clean up event listeners on destroy
  $onDestroy() {
    document.removeEventListener('click', this.boundHandleDocumentClick);
  }

  //Activate function to initialize the controller
  Activate() {
    this.selectedPriceGroups = [];
    this.isOpen = false;
    this.FetchVendors();
  }

  clearSearchSKU() {
    this.sku_number = '';
    this.noSkuFound = false;
    this.skuDoesNotExist = false
  };

  clearSearchEffectiveDate() {
    this.sku_number = '';
    this.skuCount = null;
    this.searchedSKUList = [];
    this.selectedEffectiveDate = null;
    this.convertClear = false;
    this.isResyncButtonDisabled = true;
    this.selectedPriceGroups = [];
    this.priceTypeWarningMessage = null;
  };

  updateEffectiveDateVisibility() {
    if (this.resync_retails === "1") {
      this.isEffectiveDateVisible = true;
    } else {
      this.isEffectiveDateVisible = false;
    }
  };

  clearSKUDetailsOnTabChange() {
    this.searchedSKUList = [];
    this.setSkuIds = [];
    this.selectedEffectiveDate = null;
    this.searchedSKUList = [];
    this.skuIds = [];
    this.setSkuIds = [];
    this.fileList = null;
    this.convertClear = false; // Disable "Resynchronize" button
    this.UploadedMessage = '';
    this.invalidmsg = '';
    this.vendorlist = [];
    this.skuCount = [];
    this.selectedPriceGroups = [];
    this.priceTypeWarningMessage = null
    this.isProcessing = false;
    this.filetoUploadName = "Select Spreadsheet";
    this.isResyncButtonDisabled = false;
    if (this.$scope.tab.isSet(3) && this.resync_retails === '1') {
      this.isProcessing = true;
      this.RetailService.EffectiveDates.GetAllEffectiveDates()
        .then(response => {
          this.allEffectiveDates = response;
          this.FetchEffectiveDates();
        })
        .catch(error => {
          this.logger.error('Failed to fetch effective dates', error);
        });
    }
  };

  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  FetchRetailsSKUCount() {
    let payloadRetail = {};
    const priceTypeMapping = {
      suggested_price: 1,
      sale_price: 2,
      map: 3,
      wholesale_price: 4,
      signage_price: 5
    };
    this.isResyncButtonDisabled = true;
    if (
      this.selectedEffectiveDate &&
      this.selectedPriceGroups.length > 0 &&
      this.selectedPrice
    ) {
      const formattedDate = this.formatDate(this.selectedEffectiveDate);
      const mappedPriceGroups = this.selectedPriceGroups.map(group => {
        const mappedValue = this.priceClassMapping[group.toLowerCase()];
        if (!mappedValue) {
          console.error("Invalid group in selectedPriceGroups:", group);
        }
        return mappedValue;
      }).filter(Boolean);
      // Ensure that the price groups were mapped successfully
      if (mappedPriceGroups.length !== this.selectedPriceGroups.length) {
        this.logger.error("Error in mapping priceGroups. Check the selectedPriceGroups structure and priceClassMapping.");
        return;
      }
      // Map the selected price type to its numeric value
      const mappedPriceType = priceTypeMapping[this.selectedPrice.originalPriceType?.toLowerCase()];
      if (!mappedPriceType) {
        this.logger.error("Error in mapping priceType. Check the selectedPrice structure and priceTypeMapping.");
        return;
      }
      payloadRetail = {
        effective_date: formattedDate,
        price_type: mappedPriceType,
        price_class: mappedPriceGroups,
      };
      this.RetailService.getRetailSKUCount.getRetailSKUCounts(payloadRetail)
        .then(response => {
          const skuIds = [...new Set(response?.map(item => item.sku_id))];
          this.skuArray = skuIds;
          this.skuCount = skuIds.length;
          this.skuIds = skuIds || [];
          this.isResyncButtonDisabled = !(this.skuIds.length > 0);
        })
        .catch(error => {
          this.logger.error("Failed to fetch SKU count", error);
          this.isResyncButtonDisabled = false;
        });
    } else {
      this.logger.warn("Please select all dropdown values before fetching the SKU count.");
      this.isResyncButtonDisabled = false;
    }
  }

  FetchPriceGroups(effectiveDate) {
    if (!this.allEffectiveDates) {
      return this.RetailService.EffectiveDates.GetAllEffectiveDates()
        .then(response => {
          this.allEffectiveDates = response;
          return this.processPriceGroups(effectiveDate);
        })
        .catch(error => {
          this.logger.error('Failed to fetch effective dates', error);
          this.staticPriceGroups = [];
          this.isPriceGroupDisabled = true;
        }).finally(() => {
          this.isProcessing = false;
        });
    } else {
      return Promise.resolve(this.processPriceGroups(effectiveDate))
    }
  }

  processPriceGroups(effectiveDate) {
    if (Array.isArray(this.allEffectiveDates) && this.allEffectiveDates.length > 0) {
      const selectedDate = moment(effectiveDate).format("YYYY-MM-DD");
      const filteredItems = this.allEffectiveDates.filter(item => {
        const itemDate = moment(item?.effective_date).format("YYYY-MM-DD");
        return itemDate === selectedDate && item?.price_type === "sale_price";
      });

      const uniquePriceGroups = new Set(
        filteredItems.flatMap(item => {
          if (Array.isArray(item?.price_class)) {
            return item.price_class.filter(Boolean);
          }
          return item?.price_class ? [item.price_class] : [];
        })
      );
      // Map price groups to their corresponding values and sort them
      const sortedPriceGroups = Array.from(uniquePriceGroups)
        .map(group => {
          const lowerCaseGroup = group.toLowerCase();
          const value = this.priceClassMapping[lowerCaseGroup];
          // Return null if the group is not found in the mapping
          return value !== undefined ? { group, value } : null;
        })
        .filter(item => item !== null) // Filter out null values
        .sort((a, b) => a.value - b.value)
        .map(({ group }) => group.charAt(0).toUpperCase() + group.slice(1));
      this.staticPriceGroups = sortedPriceGroups;
      this.isPriceGroupDisabled = this.staticPriceGroups.length === 0;
    } else {
      this.staticPriceGroups = [];
      this.isPriceGroupDisabled = true;
    }
  }

  onPriceGroupDropdownClick($event) {
    $event.stopPropagation();
    if (this.selectedEffectiveDate) {
      this.FetchPriceGroups(this.selectedEffectiveDate);
    }
    this.isOpen = !this.isOpen;
  }

  // Function to toggle selection
  toggleSelect(group, $event) {
    const index = this.selectedPriceGroups.indexOf(group);
    if (index > -1) {
      this.selectedPriceGroups.splice(index, 1);
    } else {
      this.selectedPriceGroups.push(group);
    }
    // Check if $event exists before calling stopPropagation
    if ($event) {
      $event.stopPropagation();
    }
  }

  /*Fetch Price types */
  FetchPriceOptions() {
    if (!this.allEffectiveDates) {
      return this.RetailService.EffectiveDates.GetAllEffectiveDates()
        .then(response => {
          this.allEffectiveDates = response;
          this.processPriceOptions(response);
        })
        .catch(error => {
          this.logger.error("Failed to fetch effective dates", error);
        })
        .finally(() => {
          this.isProcessing = false;
        });
    } else {
      return Promise.resolve(this.processPriceOptions(this.allEffectiveDates))
    }
  }


  processPriceOptions(effectiveDateData) {
    const selectedDate = moment(this.selectedEffectiveDate).format("YYYY-MM-DD")
    const selectedDateData = effectiveDateData.filter(item => {
      const itemDate = moment(item.effective_date).format("YYYY-MM-DD")
      return itemDate == selectedDate;
    });
    if (selectedDateData.length === 0) {
      this.priceOptions = [];
      this.showPriceTypeDropdown = false;
      return;
    }
    // Check if any SKU in the selected date data has a sale price
    const hasSalePrice = selectedDateData.some(item =>
      item?.price_type?.toLowerCase() === 'sale_price'
    );

    this.priceOptions = [];
    if (hasSalePrice) {
      this.priceOptions.push({
        id: 'sale_price',
        name: 'Sale Price',
        originalPriceType: 'sale_price'
      });
      this.priceTypeWarningMessage = null;
      this.showPriceTypeDropdown = true;
    } else {
      this.priceOptions = [];
      this.priceTypeWarningMessage = "No sale price exists for the selected effective date. Please add a sale price to continue to resync!";
      this.showPriceTypeDropdown = false;
    }
    this.selectedPrice = this.priceOptions.length > 0 ? this.priceOptions[0] : null;
  }


  // Fetch all Effective dates
  FetchEffectiveDates() {
    this.isProcessing = true;
    // this.RetailService.EffectiveDates.GetAllEffectiveDates()
    //   .then(response => {
    let response = this.allEffectiveDates;
    if (Array.isArray(response) && response.length > 0) {
      const effectiveDates = response
        .flatMap(item => {
          if (item?.effective_date) {
            return new Date(item.effective_date);
          }
          return [];
        })
        .filter(date => !isNaN(date.getTime()));
      if (effectiveDates.length > 0) {
        this.effectiveDateOptions = Array.from(
          new Set(effectiveDates.map(date => date.toISOString()))
        )
          .map(date => new Date(date))
          .sort((a, b) => b.getTime() - a.getTime());
        this.selectedEffectiveDate = null;
        this.isEffectiveDateDisabled = false;
      }
    }
    this.isProcessing = false;
    // })
    // .catch(error => {
    //   this.logger.error('Failed to fetch effective dates', error);
    //   this.isProcessing = false;
    // })
    // .finally(() => {
    //   this.isProcessing = false; // Hide spinner
    // });
  }

  handleEffectiveDateChange(selectedEffectiveDate) {
    this.isResyncButtonDisabled = true; // Keep it true initially
    this.skuCount = null;
    this.selectedPriceGroups.length = 0;
    this.priceTypeWarningMessage = '';
    this.showNoSalePriceWarning = false;
    this.isExecuting = false;
    this.UploadedMessage = null;
    this.invalidmsg = null;
    this.isExecuted = false;
    // Fetch new price groups
    this.FetchPriceGroups(selectedEffectiveDate);
  }

  //Get the Vendors to create a map of Vendors
  FetchVendors() {
    let model = "allVendors";
    this.VendorService.API
      .GetVendors()
      .then(response => {
        this.$scope[model] = response.data.data;
        this.model = response.data.data;
      })
      .catch(error => {
        this.error = error;
      });
  }

  // function to toggle vendor dropdown
  toggleDropdown() {
    if (this.openVendorDropdown == undefined || (!this.openVendorDropdown && this.selectedVendor)) {
      this.openVendorDropdown = false;
    } else {
      if (this.openVendorDropdown) {
        this.openVendorDropdown = false;
      } else {
        this.openVendorDropdown = false;
      }
    }
  }

  getCollections(selectedVendors) {
    var vendor_uuid = 9;
    this.selectedVendorIds = [];
    this.selectedVendor = '';
    this.openVendorDropdown = true;
    if (this.vendorlist.length && this.vendorlist.some(item => item.id == selectedVendors.id)) {
      this.SKUError = "Selected Vendor is already added to the queue.";
      this.common.$timeout(() => {
        this.SKUError = null;
      }, 3000)
    }
    else {
      this.vendorlist.push(selectedVendors);
      this.vendorpayload.push(selectedVendors.id);
      this.LoadImage(vendor_uuid, selectedVendors);
    }
  }

  DeletevendorFromQueue(id) {
    if (id) {
      let idx = this.vendorlist.findIndex(sk => sk.id == id);
      this.vendorlist.splice(idx, 1);
      if (this.vendorlist.length == 0) {
        this.selectedVendor = '';
      }
    }
  }

  // Function to format SKU number in 'xxxx-xxx' format
  FormatSkuNumber() {
    if (this.sku_number && this.sku_number !== "") {
      if (this.sku_number.length < 8) {
        if (this.sku_number.length == 7) {
          this.sku_number = "00000000" + this.sku_number;
          !this.sku_number.includes("-") ?
            (this.sku_number = this.sku_number.substr(
              this.sku_number.length - 9,
              this.sku_number.length
            )) :
            (this.sku_number = this.sku_number.substr(
              this.sku_number.length - 10,
              this.sku_number.length
            ));
          !this.sku_number.includes("-") ?
            (this.sku_number =
              this.sku_number.slice(0, 4) +
              "-" +
              this.sku_number.slice(4, 7) +
              "-" +
              this.sku_number.slice(7, 9)) :
            null;
        }
        else {
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
              this.sku_number.slice(0, 4) +
              "-" +
              this.sku_number.slice(4, 7))
            : null;
        }
      } else if (this.sku_number.length === 8) {
        !this.sku_number.includes("-")
          ? (this.sku_number =
            this.sku_number.slice(0, 4) +
            "-" +
            this.sku_number.slice(4, 7))
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
    }
    this.GetSKUForSkuNumber();
  };

  GetSKUForSkuNumber() {
    this.isSKUSearching = true;
    this.isLoading = true;
    this.SKUServiceFactory.API.SearchSKU("sku", this.sku_number).then(
      result => {
        this.isLoading = false;
        this.isSKUSearching = false;
        result.data = result.data.filter(skuNum => skuNum.sku == this.sku_number)
        if (this.countOfSKU == undefined) this.countOfSKU = 0;
        if (result.data) {
          if (result.data.length && !this.skuIds.includes(result.data[0].id) && result.data[0].sku_type && result.data[0].sku_type.toLowerCase() !== "mto" && this.countOfSKU <= 200) {
            this.searchedSKUList.push(result.data[0]);
            this.skuIds.push(result.data[0].id);
            this.LoadImage(this.common.Identifiers.sku_master, result.data[0]);
            this.sku_number = undefined;
            this.skuDoesNotExist = false;
            result.data[0].sku_sub_type.toLowerCase() === "set" ? this.setSkuIds.push(result.data[0].id) : "";
          } else if (result.data.length && result.data[0].sku_type && result.data[0].sku_type.toLowerCase() === "mto" && this.countOfSKU <= 200) {
            this.isSKUSearching = false;
            this.SKUError = "Selected SKU# belongs to the type MTO. Details for MTO SKUs cannot be sent to AS400.";
            angular.element("#sku_number_search").focus();
            this.common.$timeout(() => {
              this.SKUError = null;
            }, 3000)
          } else if (result.data.length && this.skuIds.includes(result.data[0].id) && this.countOfSKU <= 200) {
            this.isSKUSearching = false;
            this.SKUError = "Searched SKU exists in spreadsheet, Please delete them!.";
            angular.element("#sku_number_search").focus();
            this.common.$timeout(() => {
              this.SKUError = null;
            }, 3000)
          } else if (this.countOfSKU > 200) {
            this.CountMessage = "Maximun supported SKUs are 200.!";
            this.common.$timeout(() => {
              this.CountMessage = null;
            }, 3000)

          }
          else {
            this.isSKUSearching = false;
            this.SKUError = "SKU# does not exist.";
            angular.element("#sku_number_search").focus();
            this.common.$timeout(() => {
              this.SKUError = null;
            }, 3000)
            this.sku_number = undefined;
          }
        }
      },
      error => {
        this.isSearching = false;
        this.isLoading = false;
      }
    );

  }

  Upload() {
    if (this.convertClear) {
      this.UploadedMessage = null;
      this.invalidmsg = null;
      this.CountMessage = null;
      this.ContentMessage = null;
      this.skuIds = [];
    } else {
      this.invalidmsg = null;
      var fileUpload = document.getElementById("fileUpload");
      var files = fileUpload.files;
      if (fileUpload.value.toLowerCase().endsWith('.xlsx') && files && files.length > 0) {
        if (typeof FileReader !== "undefined") {
          var reader = new FileReader();
          var file = fileUpload.files[0];

          reader.onload = function (e) {
            var data;
            if (reader.readAsBinaryString) {
              data = e.target.result;
            } else {
              var bytes = new Uint8Array(e.target.result);
              data = String.fromCharCode.apply(null, bytes);
            }
            this.ProcessExcel(data);
          }.bind(this);

          if (reader.readAsBinaryString) {
            reader.readAsBinaryString(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        }

      } else if (fileUpload.value == '') {
        this.ContentMessage = ''
        this.ContentMessage = "Select the xlsx file!";
        this.UploadedMessage = null;
        this.invalidmsg = null;
        this.CountMessage = null;
        this.common.$timeout(() => {
          this.ContentMessage = null;
          this.$scope.$apply()
        }, 3000)
        // this.$scope.$apply()
      } else if (!fileUpload.value.toLowerCase().endsWith('.xlsx')) {
        this.ContentMessage = ''
        this.ContentMessage = "Select the xlsx file Only!";
        this.UploadedMessage = null;
        this.invalidmsg = null;
        this.CountMessage = null;
        this.common.$timeout(() => {
          this.ContentMessage = null;
          this.$scope.$apply()
        }, 3000);

      }
    }
  };

  processJsonData(data) {
    // Iterate over each item in the array
    data.forEach(item => {
      // Check if the item has the __EMPTY property
      if (item.hasOwnProperty('__EMPTY')) {
        // Get the value of __EMPTY
        const emptyValue = item['__EMPTY'].toString().trim();

        // Check if the value is an empty string
        if (emptyValue === "") {
          // Remove the __EMPTY property
          delete item['__EMPTY'];
        } else {
          // Throw an exception if __EMPTY has a value other than an empty string
          throw new Error(`More than one column in Spreadsheet`);
        }
      }
    });
    return data;
  }

  ProcessExcel = (data) => {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
      type: 'binary'
    });
    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];
    this.invalidskuexists = [];
    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    var column_name = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 })[0];
    excelRows = excelRows.map(item => {
      // Filter out items where 'sku' is an empty string
      const newItem = {};
      for (const key in item) {
        if (key === "SKU") {
          newItem["sku"] = typeof item[key] === 'string' ? item[key].trim() : item[key];
        } else {
          newItem[key.trim()] = typeof item[key] === 'string' ? item[key].trim() : item[key];
        }
      }
      return newItem;
    }).map(obj =>
      Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== "")
      )
    ).filter(obj => Object.keys(obj).length > 0)
    if (data == '' || excelRows.length == 0) {
      this.ContentMessage = ''
      if (column_name?.length && typeof (column_name[0]) == 'string' && column_name[0].toLowerCase() == 'sku') this.ContentMessage = "No SKUs in spreadsheet";
      else if (column_name?.length == 1 && (column_name[0] != 'sku' || column_name[0] != 'SKU')) this.ContentMessage = "More than one column is not valid in Spreadsheet!";
      else this.ContentMessage = "No Data Available in spreadsheet!";
      this.$scope.$apply()
      this.common.$timeout(() => {
        this.ContentMessage = null;
        this.$scope.$apply()
      }, 3000)
      this.UploadedMessage = null;
      this.invalidmsg = null;
      this.CountMessage = null;

    } else {
      try {
        excelRows = this.processJsonData(excelRows);
        excelRows = excelRows.filter(item => {
          // Filter out items where 'sku' is an empty string
          const sku = item.sku ? item.sku : item.SKU;
          return typeof sku === 'number' || (typeof sku === 'string' && sku.length > 0);
        });
        const hasValidSkuColumn = excelRows.some(row => row.hasOwnProperty('sku') || row.hasOwnProperty('SKU'));
        if (!hasValidSkuColumn) {
          this.ContentMessage = "More than one column in Spreadsheet";
          this.$scope.$apply();
          this.common.$timeout(() => {
            this.ContentMessage = null;
            this.$scope.$apply();
          }, 3000);
          return;
        }

        let firstRowKeys = Object.keys(excelRows[0]);
        const isObjectLengthOne = Object.keys(excelRows[0]).length === 1 && firstRowKeys[0].toLowerCase() === 'sku';
        column_name = column_name.filter(item => {
          // Convert the item to a string and trim it to check for non-whitespace content
          return typeof item === 'number' || item.trim() !== "";
        });
        if (isObjectLengthOne && column_name.length == 1) {
          if (isObjectLengthOne) {
            let countarray = excelRows.map((obj) => obj.SKU || obj.sku);
            this.countOfSKU = countarray.length;
            if (this.countOfSKU > 200) {
              this.CountMessage = "Maximun supported SKUs are 200.!";
              this.$scope.$apply()
              this.UploadedMessage = null;
              this.invalidmsg = null;
              this.ContentMessage = null;
              this.common.$timeout(() => {
                this.CountMessage = null;
              }, 3000);
            } else {
              if (excelRows) {
                excelRows = Array.from(new Set(excelRows.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));
                let newArray = excelRows
                  .map(obj => obj.SKU?.toString() || obj.sku?.toString()) // Extract SKU values
                  .filter(sku => {
                    if (!sku) return false; // Filter out empty SKUs
                    return true;
                  });
                for (let i = 0; i <= newArray?.length - 1; i++) {
                  newArray[i] = newArray[i].toString();
                  if (newArray[i] && newArray[i] !== "") {
                    if (newArray[i].length < 8) {
                      if (newArray[i].length == 7) {
                        newArray[i] = "00000000" + newArray[i];
                        !newArray[i].includes("-") ?
                          (newArray[i] = newArray[i].substr(
                            newArray[i].length - 9,
                            newArray[i].length
                          )) :
                          (newArray[i] = newArray[i].substr(
                            newArray[i].length - 8,
                            newArray[i].length
                          ));
                        !newArray[i].includes("-") ?
                          (newArray[i] =
                            newArray[i].slice(0, 4) +
                            "-" +
                            newArray[i].slice(4, 7) +
                            "-" +
                            newArray[i].slice(7, 9)) :
                          null;
                      }
                      else {
                        //Append leading zeros to the existing sku number
                        newArray[i] = "000000" + newArray[i];
                        //Get the sku number of length 6
                        !newArray[i].includes("-")
                          ? (newArray[i] = newArray[i].substr(
                            newArray[i].length - 7,
                            newArray[i].length
                          ))
                          : (newArray[i] = newArray[i].substr(
                            newArray[i].length - 8,
                            newArray[i].length
                          ));
                        !newArray[i].includes("-")
                          ? (newArray[i] =
                            newArray[i].slice(0, 4) +
                            "-" +
                            newArray[i].slice(4, 7))
                          : null;
                      }
                    } else if (newArray[i].length === 8) {
                      !newArray[i].includes("-")
                        ? (newArray[i] =
                          newArray[i].slice(0, 4) +
                          "-" +
                          newArray[i].slice(4, 7))
                        : null;
                    } else if (newArray[i].length >= 9) {
                      !newArray[i].includes("-")
                        ? (newArray[i] =
                          newArray[i].slice(0, 4) +
                          "-" +
                          newArray[i].slice(4, 7) +
                          "-" +
                          newArray[i].slice(7, newArray[i].length))
                        : null;
                    } else {
                      this.ContentMessage = ''
                      this.ContentMessage = "More than one sku are not correct";
                      this.$scope.$apply()
                      this.common.$timeout(() => {
                        this.ContentMessage = null;
                      }, 3000);
                    }
                  }
                  if (excelRows[i].length == 0) excelRows[i].sku_number = ''
                  else excelRows[i].sku_number = newArray[i];
                }
                excelRows = excelRows.filter((arr, index, self) =>
                  index === self.findIndex((t) => (t.sku_number === arr.sku_number)))
                for (let j = 0; j <= excelRows.length - 1; j++) {
                  var format = /[ `!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
                  if (format.test(newArray[j])) {
                    this.invalidskuexists.push(newArray[j]);
                    let index = newArray.indexOf(newArray[j]);
                    if (index > -1) {
                      newArray.splice(index, 1);
                      j--
                    }
                  }
                }

                this.excelvalues = [];
                for (let i = 0; i < newArray?.length; i++) {
                  this.searchedSKUList.map((obj) => {
                    if (obj.sku == newArray[i]) {
                      this.ContentMessage = ''
                      this.ContentMessage = `Searched SKU exists in spreadsheet, Please delete them!`;
                      this.UploadedMessage = null;
                      this.invalidmsg = null;
                      this.$scope.$apply()
                      this.CountMessage = null;
                      this.common.$timeout(() => {
                        this.UploadedMessage = null;
                        this.invalidmsg = null;
                        this.ContentMessage = null;
                        this.$scope.$apply()
                      }, 4000)
                    }
                  })
                }
                if (!this.ContentMessage && newArray.length) {
                  this.validSkus = [];
                  this.SKUServiceFactory.API.GetSKUIDs(newArray).then(
                    result => {
                      if (result.data.length) {
                        for (let i = 0; i < result.data.length; i++) {
                          this.skuIds.push(result.data[i].id)
                          this.validSkus.push(result.data[i].sku)
                          this.excelvalues.push(result.data[i].id)
                        }
                        this.UploadedMessage = `${result.data.length > 0 ? `${result.data.length} SKUs Fetched Successfully,Please Complete Resync!` : ''}`;
                        this.invalidmsg = `${(excelRows.length - result.data.length) > 0 ? `${excelRows.length - result.data.length} Invalid SKUs` : ''}`;
                        this.convertClear = true;
                        newArray = [...newArray, ...this.invalidskuexists];
                        this.isResyncButtonDisabled = this.skuIds.length === 0;
                        this.invalidSkusList = newArray.filter(sku => !this.validSkus.includes(sku));
                        const skuMap = excelRows.reduce((map, item) => {
                          const key = item.sku_number.toLowerCase();
                          if (item.SKU) {
                            map[key] = item.SKU;
                          } else if (item.sku) {
                            map[key] = item.sku;
                          }
                          return map;
                        }, {});
                        // Get the SKUs based on the invalid SKU list
                        this.invalidSkusList = this.invalidSkusList.map(sku_number => skuMap[sku_number]);
                      } else if (result.status == 200 && result.message !== '') {
                        this.invalidmsg = `${(excelRows.length - result.data.length) > 0 ? `${excelRows.length - result.data.length} Invalid SKUs` : ''}`;
                        this.convertClear = true;
                        newArray = [...newArray, ...this.invalidskuexists];
                        this.invalidSkusList = newArray.filter(sku => !this.validSkus.includes(sku));
                        this.ContentMessage = ''
                        this.ContentMessage = `One or more invalid sku in spreadsheet`;
                        // this.$scope.$apply()
                        const skuMap = excelRows.reduce((map, item) => {
                          const key = item.sku_number.toLowerCase();
                          // Check which property is present and assign the appropriate value
                          if (item.SKU) {
                            map[key] = item.SKU;
                          } else if (item.sku) {
                            map[key] = item.sku;
                          }
                          return map;
                        }, {});
                        this.invalidSkusList = this.invalidSkusList.map(sku_number => skuMap[sku_number]);
                      }
                    }
                  ).catch(err => {
                    console.log(err)
                  })
                }
                else {
                  if (!newArray.length) {
                    this.ContentMessage = ''
                    if (!this.invalidskuexists.length) this.ContentMessage = "SKUs not  available under SKU column!";
                    else {
                      this.invalidmsg = `${this.invalidskuexists.length} Invalid SKUs`;
                      this.invalidSkusList = this.invalidskuexists;
                      this.ContentMessage = `One or more invalid sku in spreadsheet`;
                      this.convertClear = true;
                    }
                    this.$scope.$apply()
                    this.UploadedMessage = null;
                    // this.invalidmsg = null;
                    this.CountMessage = null;
                    this.common.$timeout(() => {
                      this.ContentMessage = null;
                    }, 3000)
                  }
                }

                if (this.convertClear) {
                  this.UploadedMessage = null;
                  this.invalidmsg = null;
                  this.CountMessage = null;
                  this.common.$timeout(() => {
                    this.$scope.$apply()
                  }, 3000);
                }
              }
            }
          }
        }
        else {
          this.ContentMessage = ''
          this.ContentMessage = "More than one column in Spreadsheet";
          this.$scope.$apply()
          this.UploadedMessage = null;
          this.invalidmsg = null;
          this.CountMessage = null;
          this.common.$timeout(() => {
            this.ContentMessage = null;
          }, 3000)
        }
      } catch (error) {
        this.CountMessage = (error.message);
        this.$scope.$apply();
        this.common.$timeout(() => {
          this.CountMessage = null;
          this.$scope.$apply()
        }, 3000)
      }
    }
  }

  downloadInvalidSkus() {
    if (this.invalidSkusList.length) {
      const now = new Date();
      const timestamp = now.getFullYear() +
        '-' + ('0' + (now.getMonth() + 1)).slice(-2) +
        '-' + ('0' + now.getDate()).slice(-2) +
        '_' +
        ('0' + now.getHours()).slice(-2) +
        '-' + ('0' + now.getMinutes()).slice(-2) +
        '-' + ('0' + now.getSeconds()).slice(-2);
      const fileName = `Invalid_SKU's_${timestamp}.xlsx`;

      const ws_data = this.invalidSkusList.map(sku => [sku]);
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Invalid SKUs");

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      }

      const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  LoadImage(uuid, data) {
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

  DeleteSKUFromQueue(skuId) {
    if (skuId) {
      let idx = this.searchedSKUList.findIndex(sk => sk.id == skuId);
      let setIndex = this.setSkuIds.findIndex(sid => sid == skuId);
      let idIdx = this.skuIds.findIndex(id => id == skuId);
      this.searchedSKUList.splice(idx, 1);
      this.skuIds.splice(idIdx, 1);
      this.setSkuIds.splice(setIndex, 1);
    }
  }

  resetresync() {
    if (this.resync_retails == '1' || this.resync_retails == '0') {
      var fileInput = document.getElementById("fileUpload");
      if (fileInput) angular.element(fileInput).val(null);
      this.UploadedMessage = null;
      this.invalidmsg = null;
      this.ContentMessage = null;
      this.searchedSKUList = [];
      this.convertClear = false;
      this.skuIds = [];
      this.convertClear = false;
      this.$scope.tab.setTab(1);
      this.isResyncButtonDisabled = false;
    }
    this.filetoUploadName = "Select Spreadsheet"
    this.vendorpayload = [];
    this.vendorlist = [];
    this.selectedVendor = '';
    this.searchedSKUList = [];
    this.skuIds = [];
    this.skuCount = [];
    this.selectedPriceGroups = [];
    this.selectedEffectiveDate = null;
    this.fileList = null;
    this.priceTypeWarningMessage = null
    this.isProcessing = false;
  }

  clickOnClear() {
    if (!this.searchedSKUList.length) {
      this.searchedSKUList = []
      this.skuIds = [];
    }
    else {
      this.skuIds = this.skuIds.filter((el) => !this.excelvalues?.includes(el));
    }
    var fileElement = angular.element('#fileUpload');
    if (fileElement) angular.element(fileElement).val(null);
    this.UploadedMessage = null;
    this.invalidmsg = null;
    this.ContentMessage = null;
    this.filetoUploadName = "Select Spreadsheet";
    this.convertClear = false;
  }

  updateFileName(filelist) {
    this.ContentMessage = null;
    this.invalidmsg = null;
    if (filelist.length) this.filetoUploadName = filelist[0].name;
    else this.filetoUploadName = "Select Spreadsheet";
  }

  isResyncSkuOrRetails() {
    this.convertClear = false;
    if (this.resync_retails === '1') {
      if (this.$scope.tab && this.$scope.tab.isSet(3)) {
        this.ResyncRetailsByEffectiveDate(); // Navigation handled inside the function
      } else {
        this.ResyncRetails(); // Navigation handled inside the function
      }
    } else if (this.resync_retails === '2') {
      this.ResyncVendors();
    } else {
      this.ReSyncSKUs();
    }
  }

  ReSyncSKUs() {
    if (this.skuIds.length > 0) {
      this.isExecuting = true;
      this.isExecuted = false;
      this.skuIds = [...new Set(this.skuIds)];
      const skuIdsCopy = [...this.skuIds];
      const batchSize = 50;
      while (skuIdsCopy.length > 0) {
        this.InterfaceServiceFactory.API.ReSyncSKUs(skuIdsCopy.splice(0, batchSize))
          .then(result => {
            if (this.setSkuIds.length) {
              for (let i = 0; i < this.setSkuIds.length; i++) {
                let setId = this.setSkuIds[i];
                this.CaptureSetSkusChanges(setId, "create");
              }
            }
            this.message = "Selected SKUs are resynced successfully.";
            this.isExecuting = false;
            this.UploadedMessage = null;
            this.invalidmsg = null;
            this.isExecuted = true;
            this.common.$timeout(() => {
              this.isExecuted = false;
              this.searchedSKUList = [];
              this.clickOnClear();
              this.message = null;
              this.skuIds = [];
              this.setSkuIds = [];
              this.$scope.tab.setTab(1);
            }, 3000);
          })
          .catch(error => {
            this.isExecuting = false;
            this.error = error;
            this.isExecuting = false;
            this.common.$timeout(() => {
              this.error = null;
            }, 3000);
          })
      }

    }
  }

  //Method to Resync Vendors from Interface
  ResyncVendors() {
    if (this.vendorpayload.length > 0) {
      this.isExecuting = true;
      this.isExecuted = false;
      this.InterfaceServiceFactory.API.ResyncVendors(this.vendorpayload)
        .then(result => {
          // if (this.vendorpayload.length) {
          //   for (let i = 0; i < this.vendorpayload.length; i++) {
          //     let setId = this.vendorpayload[i];
          //     this.UpdateVendorChanges(setId);
          //   }
          // }
          this.message = "Selected Vendors are resynced successfully.";
          this.isExecuting = false;
          this.isExecuted = true;
          this.common.$timeout(() => {
            this.isExecuted = false;
            this.message = null;
            this.vendorlist = [];
            this.vendorpayload = [];
            this.selectedVendor = '';
          }, 5000);
        })
        .catch(error => {
          this.isExecuting = false;
          this.error = error;
          this.isExecuting = false;
          this.common.$timeout(() => {
            this.error = null;
          }, 3000);
        })
    }
  }

  CaptureSetSkusChanges = (parentSkuId, action) => {
    this.SKUSetService.API.CaptureSkuSetChangeInQueue(parentSkuId, action)
      .then(result => {
        console.log("Success", result);
      })
  }

  UpdateVendorChanges = (Id) => {
    this.ItemService.API.CaptureSKUChangesInVendorProperties(Id)
      .then(result => {
        console.log("Success", result);
      })
  }

  ResyncRetails() {
    if (this.skuIds.length > 0) {
      this.isExecuting = true;
      this.isExecuted = false;
      this.skuIds = [...new Set(this.skuIds)];
      const skuIdsCopy = [...this.skuIds];
      const batchSize = 50;
      while (skuIdsCopy.length > 0) {
        this.InterfaceServiceFactory.API.ReSyncRetails(skuIdsCopy.splice(0, batchSize))
          .then(result => {
            this.message = "Selected SKU Retails are resynced successfully.";
            this.isExecuting = false;
            this.UploadedMessage = null;
            this.invalidmsg = null;
            this.isExecuted = true;
            this.common.$timeout(() => {
              this.isExecuted = false;
              this.clickOnClear();
              this.message = null;
              this.skuIds = [];
              this.setSkuIds = [];
              this.searchedSKUList = [];
              this.$scope.tab.setTab(1);
            }, 3000);
          })
          .catch(error => {
            this.isExecuting = false;
            this.error = error;
            this.isExecuting = false;
            this.setSkuIds = [];
            this.common.$timeout(() => {
              this.error = null;
            }, 3000);
          })
      }
    }
  }

  ResyncRetailsByEffectiveDate() {
    if (this.skuIds.length > 0) {
      this.isExecuting = true;
      this.isExecuted = false;

      // Remove duplicate SKUs
      this.skuIds = [...new Set(this.skuIds)];
      const skuIdsCopy = [...this.skuIds];
      // const batchSize = 100;

      // Prepare the payload for price type and price class
      if (
        this.selectedEffectiveDate &&
        this.selectedPriceGroups.length > 0 &&
        this.selectedPrice
      ) {
        const priceTypeMapping = {
          suggested_price: 1,
          sale_price: 2,
          map: 3,
          wholesale_price: 4,
          signage_price: 5
        };
        const formattedDate = this.formatDate(this.selectedEffectiveDate);
        const mappedPriceGroups = this.selectedPriceGroups.map(group => {
          const mappedValue = this.priceClassMapping[group.toLowerCase()];
          if (!mappedValue) {
            console.error("Invalid group in selectedPriceGroups:", group);
          }
          return mappedValue;
        }).filter(Boolean);
        if (mappedPriceGroups.length !== this.selectedPriceGroups.length) {
          this.logger.error(
            "Error in mapping priceGroups. Check the selectedPriceGroups structure and priceClassMapping."
          );
          return;
        }
        const mappedPriceType = priceTypeMapping[this.selectedPrice.originalPriceType?.toLowerCase()];
        if (!mappedPriceType) {
          this.logger.error("Error in mapping priceType. Check the selectedPrice structure and priceTypeMapping.");
          return;
        }
        const effectiveDatePayload = {
          effective_date: formattedDate,
          price_type: mappedPriceType,
          price_class: mappedPriceGroups
        };

        // Process the SKU batches
        while (skuIdsCopy.length > 0) {
          const batch = skuIdsCopy.splice(0);
          const payload = {
            skuid: batch,
            ...effectiveDatePayload
          };

          this.InterfaceServiceFactory.API.ResyncSKURetailsByEffectiveDate(payload)
            .then(result => {
              this.skuCount = this.skuIds.length;
              this.message = "Selected SKU Retails are resynced successfully by effective date.";
              this.isExecuting = false;
              this.UploadedMessage = null;
              this.invalidmsg = null;
              this.isExecuted = true;

              this.common.$timeout(() => {
                this.skuCount = null;
                this.selectedEffectiveDate = null;
                this.isExecuted = false;
                this.clickOnClear();
                this.message = null;
                this.skuIds = [];
                this.setSkuIds = [];
                this.searchedSKUList = [];
                this.selectedPriceGroups = [];
                this.priceTypeWarningMessage = null;
                this.$scope.tab.setTab(1);
              }, 3000);
            })
            .catch(error => {
              this.isExecuting = false;
              this.error = error;

              this.common.$timeout(() => {
                this.error = null;
              }, 3000);
            });
        }
      } else {
        this.logger.error("Missing required parameters for resync.");
      }
    }
  }

}

angular
  .module("rc.prime.interface")
  .controller("ResyncSkuInterfaceController", ResyncSkuInterfaceController).directive("filesInput", function () {
    return {
      require: "ngModel",
      link: function postLink(scope, elem, attrs, ngModel) {
        elem.on("change", function (e) {
          var files = elem[0].files;
          ngModel.$setViewValue(files);
        })
      }
    }
  })
