(function () {
  "use strict";
  class SkuRetailController {
    constructor(
      $scope,
      $state,
      $stateParams,
      common,
      DataLakeAPIService,
      SkuRetailService,
      HierarchyService,
      HierarchyValueService,
      ItemPriceGroupService,
      SKUService,
      ItemService,
      valdr,
      $window,
      SessionMemory,
      OrderAdvisorServices
    ) {
      this.sku_uuid = 44; // Sku master uuid
      this.$scope = $scope;
      this.$state = $state;
      this.skuMaintCtrl = {};
      this.$stateParams = $stateParams;
      this.common = common;
      this.DataLakeAPIService = DataLakeAPIService.API;
      this.logger = this.common.Logger.getInstance("SkuRetailController");
      this.valdr = valdr;
      this.SkuRetailService = SkuRetailService.API;
      this.HierarchyService = HierarchyService.API;
      this.HierarchyValueService = HierarchyValueService.API;
      this.ItemPriceGroupService = ItemPriceGroupService.API;
      this.OrderAdvisorServices = OrderAdvisorServices.OrderAdvisor;
      this.SKUService = SKUService.API;
      this.ItemService = ItemService.API;
      this.skuId = $stateParams.id;
      this.retailReasonsMap = {};
      this.priceTypeMap = {};
      this.retailHead = {};
      this.packageRetailHead = {};
      this.saving = false;
      this.price_groups = [];
      this.retails = [];
      this.currentRetail = {};
      this.nextRetail = {};
      this.priceGroupMap = {};
      this.price_group_ids = [];
      this.copyPriceGroupIds = [];
      this.sku_detail = {};
      this.loaded = false;
      this.isLoaded = false;
      this.isRetailLoading = true;
      this.isPackageRetailLoading = false;
      this.nopackage_retails = false;
      this.price_classification_id = null;
      this.existingRetailsList = [];
      this.todays_date = moment().format("YYYYMMDD");
      this.currentDate = moment().format("YYYY-MM-DD");
      this.SessionMemory = SessionMemory;
      this.rounding_rule_apply_msg = null;
      this.disablePreviousButton = true;
      this.disableNextButton = false;
      this.showNoRetailMessage = false;
      // disable the make price change button
      this.disablePriceChange = false;
      this.setDate();
      this.getSKU();
      this.yearsList = [];
      this.allYearList = [];
      this.allYearNumbers = [];
      this.btnText = "Save Retail";
      this.isSaveSuccess = false;
      this.enablediff = true;
      this.disable_delete = false;
    }

    // Get Item Vendors list
    getItemVendorsList() {
      this.ItemService.GetVendorsForAnItem(this.$stateParams.item_id)
        .then(response => {
          this.secondaryVendors = response.data;
          this.getLinkedVendorListForSku(this.skuId);
        })
        .catch(error => {
          logger.error(error);
        });
    }

    // get linked vendor with average,landed and first cost for sku
    getLinkedVendorListForSku(skuId) {
      this.SKUService.GetLinkedVendorList(skuId)
        .then(response => {
          this.vendorIdsMap = {};
          for (let i = 0; i < response.length; i++) {
            if (this.vendorIdsMap[response[i].vendor_id] === undefined) {
              this.vendorIdsMap[response[i].vendor_id] = response[i];
            }
          }
          let item = this.getSelectedItem();
          item.then(() => {
            if (this.vendorIdsMap[this.selectedItem.vendor_id] === undefined) {
              this.vendorIdsMap[
                this.selectedItem.vendor_id
              ] = this.selectedItem;
            }
          });
        })
        .catch(error => {
          this.logger.error(error);
        });
    }

    // get selected item and primary vendor
    getSelectedItem() {
      let data = this.common.EntityDetails.API.GetGraphSet(
        this.common.Identifiers.item,
        ["id", "description", "vendor", "vendor_id"],
        "id",
        this.$stateParams.item_id
      )
        .then(res => {
          this.selectedItem = res.data[0];
          return res;
        })
        .catch(error => {
          this.logger.error(error);
        });

      return data;
    }

    gobackToSKU() {
      this.$state.go("common.prime.itemMaintenance.sku", {
        item_id: this.sku_detail.item_id
      });
    }

    activate() {
      this.getPriceTypes()
        .then(() => { })
        .catch(() => { });
      this.getRetailReasonTypes();
      this.getRetailReasons();
      this.setValidationRules();
      this.getItemVendorsList();
      this.setDate();
      // this.getPricingGroups();
      this.selectedYear = this.presentYear.toString();
    }

    getSKU() {
      this.SKUService.GetSKU(this.skuId).then(response => {
        this.sku_detail = response.data[0];
        if (this.sku_detail.sku_type.toLowerCase() === "mto") {
          this.$scope.getAccessPermissions(this.common.Identifiers.retail_mto_sku)
            .then(response => {
              this.permissionsMap = response;
              this.activate();
              this.getPricingGroups();
            })
            .catch(error => {
              this.permissionsMap = error.data;
              this.activate();
              this.getPricingGroups();
            })
        } else {
          this.$scope.getAccessPermissions(this.common.Identifiers.retail_sku)
            .then(response => {
              this.permissionsMap = response;
              this.activate();
              this.getPricingGroups();
            })
            .catch(error => {
              this.permissionsMap = error.data;
              this.activate();
              this.getPricingGroups();
            })
        }
        // this.getPricingGroups();
      });
    }

    getSKUById(sku) {
      this.SKUService.GetSKU(sku.sku_id).then(response => {
        sku.description = response.data[0].description;
        sku.sku = response.data[0].sku;
      });
    }

    // Function to validate whether the package is included in orderAdvisor
    validatetoShowIncludedPackages() {
      for (let index = 0; index < this.OrderAdvisors.length; index++) {
        const orderAdvisor = this.OrderAdvisors[index];

        // Check if price_types and Packages are valid
        if (orderAdvisor.price_types && orderAdvisor.price_types.length > 0) {
          // Create a Set for included package IDs for faster lookup
          const includedPackageIds = new Set(orderAdvisor.included_packages);

          // Initialize `isPachagesIncluded` to false initially
          orderAdvisor.isPachagesIncluded = false;

          // Iterate over price_types and Packages
          outerLoop:
          for (let i = 0; i < orderAdvisor.price_types.length; i++) {
            const priceType = orderAdvisor.price_types[i];

            if (priceType.Packages && priceType.Packages.length > 0) {
              for (let j = 0; j < priceType.Packages.length; j++) {
                const packageId = priceType.Packages[j].id;
                if (includedPackageIds.has(packageId)) {
                  // Once we find a match, set isPachagesIncluded and break out of loops
                  orderAdvisor.isPachagesIncluded = true;
                  break outerLoop; // Break both inner and outer loops
                }
              }
            }
          }
        }
      }
    }

    setBasePackagePrice() {
      return new Promise((resolve, reject) => {
        this.SKUService.FetchOrderAdvisorsForSku(this.skuId).then(
          orderAdvisors => {
            this.OrderAdvisors = [];
            this.linkedOrderAdvisors = orderAdvisors.data;
            if (orderAdvisors.data && orderAdvisors.data.length) {
              for (let i = 0; i < orderAdvisors.data.length; i++) {
                // Get the order advisor details by id for each of the order advisor linked to the SKU
                this.OrderAdvisorServices.OrderAdvisor.FetchOrderAdvisorByID(
                  orderAdvisors.data[i].order_advisor_id
                ).then(result => {
                  orderAdvisors.data[i] = result.data;
                  orderAdvisors.data[i].price_types = this.clone(this.price_types);
                  orderAdvisors.data[i].included_packages = [];
                  // Get included packages each of the order advisor linked to the sku
                  this.OrderAdvisorServices.OrderAdvisor.FetchPackagesForOrderAdvisor(
                    orderAdvisors.data[i].id
                  ).then(result => {
                    // Get choices included in the order advisor linked
                    for (let index = 0; index < result.data.length; index++) {
                      let res = result.data[index];
                      let choiceIds = res.choice_id
                        ? res.choice_id.split(",").map(Number)
                        : [];
                      if (choiceIds && choiceIds.length) {
                        _.each(choiceIds, choiceId => {
                          !orderAdvisors.data[i].included_packages.includes(
                            choiceId
                          )
                            ? orderAdvisors.data[i].included_packages.push(
                              choiceId
                            )
                            : null;
                        });
                      }
                      if (index === result.data.length - 1) {
                        this.validateIncludedFlag = true;
                      }
                    }
                    this.OrderAdvisors.push(orderAdvisors.data[i]);
                    this.OrderAdvisors = this.OrderAdvisors.filter((arr, index, self) =>
                      index === self.findIndex((t) => (t.description === arr.description && t.id === arr.id)))
                    if (this.validateIncludedFlag && i === orderAdvisors.data.length - 1) {
                      this.validatetoShowIncludedPackages();
                    }
                    if (i === orderAdvisors.data.length - 1) {
                      resolve(this.OrderAdvisors);
                    }
                  });
                });
              }
            } else {
              this.isPackageRetailLoading = false;
            }
          });
      });
    }
    

    getSKUImage() {
      // let query = {
      //   uuid: this.sku_uuid,
      //   instance_id: this.sku_detail.id,
      //   stream: "cover_image"
      // };
      // this.DataLakeAPIService.GetDropInfoByParams(query).then(res => {
      //   this.sku_detail.img = this.DataLakeAPIService.GetImageDownloadUrl(
      //     res.data[0]["drop_id"],
      //     "165x165",
      //     query.uuid
      //   );
      // });
    }

    clone(object) {
      return object ? JSON.parse(JSON.stringify(object)) : {};
    }

    setDate() {
      this.confirmation = false;
      let date = new Date();
      this.presentYear = moment(date).format("YYYY");
      this.presentMonth = moment(date).format("MMMM");
      this.presentDate = moment(date).format("DD");
      this.selectedYear = moment(date).format("YYYY")
      this.selectedMonth = moment(date).format("M");
      this.generateMonths();
      this.generateDateTimeline(parseInt(this.selectedMonth));
      this.selectMonth(parseInt(this.selectedMonth));
      this.selectDate(parseInt(this.presentDate));
    }

    generateMonths() {
      // disable the make price change button
      this.disablePriceChange = false;
      this.months = [
        {
          id: 1,
          name: "January",
          selected: false,
          haveRetail: false
        },
        {
          id: 2,
          name: "February",
          selected: false,
          haveRetail: false
        },
        {
          id: 3,
          name: "March",
          selected: false,
          haveRetail: false
        },
        {
          id: 4,
          name: "April",
          selected: false,
          haveRetail: false
        },
        {
          id: 5,
          name: "May",
          selected: false,
          haveRetail: false
        },
        {
          id: 6,
          name: "June",
          selected: false,
          haveRetail: false
        },
        {
          id: 7,
          name: "July",
          selected: false,
          haveRetail: false
        },
        {
          id: 8,
          name: "August",
          selected: false,
          haveRetail: false
        },
        {
          id: 9,
          name: "September",
          selected: false,
          haveRetail: false
        },
        {
          id: 10,
          name: "October",
          selected: false,
          haveRetail: false
        },
        {
          id: 11,
          name: "November",
          selected: false,
          haveRetail: false
        },
        {
          id: 12,
          name: "December",
          selected: false,
          haveRetail: false
        }
      ];
    }

    // select/highlight a month. Deselect previous selection.
    selectMonth(monthId) {
      let month = this.months.filter(month => {
        if (month.id === monthId) {
          month.selected = true;
        }
      });
      // if no retail exit then disable the make price change button
      if (this.retails.length === 0) {
        this.disablePriceChange = true;
      }
    }

    // deselect all the months on change of the month
    deSelectAllMonths() {
      let month = this.months.filter(month => {
        month.selected = false;
      });
    }

    generateDateTimeline(month) {
      this.dates = [];
      this.startDate = 1;
      this.currentMonth = parseInt(month);
      this.endDate = moment(
        this.selectedYear + "-" + month,
        "YYYY-MM"
      ).daysInMonth();
      month = month.length === 1 ? "0" + month : month;
      for (let j = this.startDate; j <= this.endDate; j++) {
        let currentdate = j.length === 1 ? "0" + j : j;
        let date = {
          id: j,
          selected: false,
          haveRetail: false,
          fulldate: this.selectedYear + "-" + month + "-" + currentdate
        };
        this.dates.push(date);
      }
      this.setDateRange();
    }

    selectCurrentOrNextRetail(navigation) {
      if (
        // for going to next retail
        this.counterIndex >= 0 &&
        // for going to the previous retail
        this.counterIndex <= this.retail_dates.length - 1
      ) {
        let date = {};
        let month = {};
        let currentRetail = {};
        if (navigation) {
          this.disablePreviousButton = false;
          currentRetail = this.retail_dates[--this.counterIndex];
          if (this.counterIndex <= 0) {
            this.counterIndex = 0;
            this.disableNextButton = true;
          } else {
            this.disableNextButton = false;
          }
        } else {
          if (
            Date.parse(this.latestRetailToSelectedDate.effective_date) <
            Date.parse(this.selectedFullDate.fulldate)
          ) {
            currentRetail = this.latestRetailToSelectedDate;
          } else {
            currentRetail = this.retail_dates[++this.counterIndex];
          }
          this.disableNextButton = false;
          if (this.counterIndex >= this.retail_dates.length - 1) {
            this.counterIndex = this.retail_dates.length - 1;
            this.disablePreviousButton = true;
          } else {
            this.disablePreviousButton = false;
          }
        }
        if (currentRetail) {
          date.id = moment(currentRetail.effective_date).format("DD");
          month.id = moment(currentRetail.effective_date).format("M");
          this.selectedYear = 
            moment(currentRetail.effective_date + 1).format("Y")
          
          date.haveRetail = true;
          date.fulldate = currentRetail.effective_date;
          this.hasRetails = true;
          this.deSelectAllMonths();
          this.selectMonth(parseInt(month.id));
          this.generateDateTimeline(parseInt(month.id));
          this.populateRetailTimeLine();
          this.deSelectAllDates();
          this.showRetailForSelectedDate(
            currentRetail.effective_date,
            null,
            currentRetail.status_id
          );
          let next_date = currentRetail.effective_date
            ? moment(currentRetail.effective_date, "YYYY-MM-DD", true).isValid() ? currentRetail.effective_date : moment(new Date(currentRetail.effective_date)).format("YYYY-MM-DD")
            : currentRetail.effective_date;
          this.getPackageRetails(next_date);
          this.selectDate(parseInt(date.id));
        }
      } else if (
        // for going to next retail
        this.counterIndex == -1
      ) {
        let date = {};
        let month = {};
        let currentRetail = {};
        if (navigation) {
          // this.disablePreviousButton = false;
          currentRetail = this.retail_dates[this.retail_dates.length - 1];
          this.counterIndex = this.retail_dates.length - 1;
          this.disablePreviousButton = true;
        }
        if (currentRetail) {
          date.id = moment(currentRetail.effective_date).format("DD");
          month.id = moment(currentRetail.effective_date).format("M");
          this.selectedYear = 
            moment(currentRetail.effective_date + 1).format("Y")
          
          date.haveRetail = true;
          date.fulldate = currentRetail.effective_date;
          this.hasRetails = true;
          this.deSelectAllMonths();
          this.selectMonth(parseInt(month.id));
          this.generateDateTimeline(parseInt(month.id));
          this.populateRetailTimeLine();
          this.deSelectAllDates();
          this.showRetailForSelectedDate(currentRetail.effective_date);
          this.selectDate(parseInt(date.id));
        }
      }
    }

    highLightDate(date) {
      let month = this.dates.filter(dateValue => {
        if (
          date.effective_date &&
          moment((dateValue.fulldate)).format("YYYY-MM-DD") ===
          moment((date.effective_date)).format("YYYY-MM-DD")
        ) {
          dateValue.haveRetail = true;
          dateValue.end_date = date.end_date;
          dateValue.status_id = date.status_id;
          /* differentiate permanent & temporary retail in calendar base on end date */
          if (date.end_date) {
            dateValue.isTemporary = true;
          } else {
            dateValue.isTemporary = false;
          }
        }
      });
    }

    disableDate() {
      let dateToCompare = null;
      let today = moment().format("YYYY-MM-DD");
      if (this.retail_dates && this.retail_dates.length > 0) {
        let first_effective_date = moment(
          this.retail_dates[this.retail_dates.length - 1].effective_date
        ).format("YYYY-MM-DD");

        if (today < first_effective_date) {
          dateToCompare = today;
        } else {
          dateToCompare = first_effective_date;
        }
      } else {
        dateToCompare = today;
      }
      this.dates.filter(dateValue => {
        if (
          moment((dateValue.fulldate)).format("YYYY-MM-DD") <
          moment((dateToCompare)).format("YYYY-MM-DD")
        ) {
          dateValue.disableRetailDate = true;
        }
      });
    }

    // Highlight the selected retail on change of months
    highLightSelectedRetail(monthId) {
      if (this.retail && this.retail.effective_date) {
        let selectedYear = parseInt(
          moment(this.retail.effective_date).format("Y")
        );
        let selectedMonth = parseInt(
          moment(this.retail.effective_date).format("M")
        );
        let selectedDate = parseInt(
          moment(this.retail.effective_date).format("D")
        );
        if (monthId === selectedMonth && selectedYear == this.selectedYear) {
          let month = this.dates.filter(dateValue => {
            if (dateValue.id === selectedDate) {
              dateValue.selected = true;
            } else {
              dateValue.selected = false;
            }
          });
        }
      }
    }

    selectDate(date) {
      this.retail = null;
      this.selectedDate = date;
      let month = this.dates.filter(dateValue => {
        if (dateValue.id === date) {
          this.selectedFullDate = dateValue;
          dateValue.selected = true;
        } else {
          dateValue.selected = false;
        }
      });
    }

    deSelectAllDates() {
      let date = this.dates.filter(dateValue => {
        dateValue.selected = false;
      });
    }

    processYearList(value, index, self) {
      return self.indexOf(value) === index;
    }

    populateRetailTimeLine() {
      if (this.retail_dates) {
        this.presentFuture = false;
        this.pastExists = false;
        this.disableDate();
        this.retail_dates.forEach(retailDate => {
          let year = moment(retailDate.effective_date).format("Y");
          let yearNumber = parseInt(moment(retailDate.effective_date).format("Y"));
          let month = parseInt(moment(retailDate.effective_date).format("M"));
          let date = parseInt(moment(retailDate.effective_date).format("D"));
          retailDate.year = year;
          this.allYearList.push(year);
          this.allYearNumbers.push(year);
          this.highLightDate(retailDate);
        });
        this.pastYear = this.allYearList.filter(past => past < this.presentYear);
        this.presentFutureYear = this.allYearList.filter(present => present >= this.presentYear);
        if (this.presentFutureYear.length > 0) {
          this.presentFuture = true;
        } else this.presentFuture = true;
        if (this.pastYear.length > 0) {
          this.pastExists = true;
        } else this.pastExists = false;
        this.generateYearList();
        this.allYearNumbers.push((this.presentYear))
        this.yearsList = _.uniq(this.allYearNumbers);
      }
    }

    generateYearList() {
      this.yearsList = [];
      if (this.retail_dates.length > 0) {
        for (
          let i = parseInt(this.presentYear);
          i <=
          parseInt(
            moment(
              this.retail_dates[this.retail_dates.length - 1].effective_date
            ).format("YYYY")
          ) +
          5;
          i++
        ) {
          this.yearsList.push(i);
        }
      }
    }

    populateRetailForSelectedDate(date) {
      let dateArray = [];
      let selectedDateStatusId;
      // If the selected date have retail
      if (date.haveRetail) {
        this.hasRetails = true;
        // disable the make price change button if the date has retail
        this.disablePriceChange = true;
        this.showRetailForSelectedDate(date.fulldate, null, date.status_id);
        this.indexArr = this.retail_dates
          .map(e => {
            return moment((e.effective_date)).format("YYYY-MM-DD");
          })
          .indexOf(moment((date.fulldate)).format("YYYY-MM-DD"));
        this.counterIndex = this.indexArr;
        this.retail_dates.map(mapdata => {
          if (
            moment(mapdata.effective_date).format("YYYY-MM-DD") < moment((date.fulldate)).format("YYYY-MM-DD")
          ) {
            dateArray.push(mapdata.effective_date);
          }
        });
      } else {
        // If the selected date does not have retail
        this.hasRetails = false;
        // if no retail exit then disable the make price change button
        if (this.retail_dates && this.retail_dates.length === 0) {
          this.disablePriceChange = true;
        } else {
          // enable the make price change button if the date does not have retail
          this.disablePriceChange = false;
        }
        this.retail_dates.map(mapdata => {
          if (
            moment((mapdata.effective_date)).format("YYYY-MM-DD") <
            moment((date.fulldate)).format("YYYY-MM-DD") &&
            (mapdata.end_date === null ||
              moment((mapdata.end_date)).format("YYYY-MM-DD") >=
              moment((date.fulldate)).format("YYYY-MM-DD")) 
          ) {
            // if selected date is somewhere between range of temporary date then fetch temporary date retails
            dateArray.push(mapdata.effective_date);
            selectedDateStatusId = mapdata.status_id;
          }
        });
        this.counterIndex = this.retail_dates
          .map(e => {
            return e.effective_date;
          })
          .indexOf(dateArray[0]);
        this.latestRetailToSelectedDate = {
          effective_date: moment(dateArray[0]).format("YYYY-MM-DD"),
          status_id: selectedDateStatusId
        };
        if (dateArray[0]) {
          this.showRetailForSelectedDate(
            dateArray[0],
            date.fulldate,
            selectedDateStatusId
          );
        } else {
          this.retail = null;
          this.showNoRetailMessage = true;
        }
      }
      if (dateArray.length > 0) {
        this.disablePreviousButton = false;
      } else {
        this.disablePreviousButton = true;
      }
      if (
        this.retail_dates.length > 0 &&
        Date.parse(moment((date.fulldate)).format("YYYY-MM-DD")) <
        Date.parse(
          moment(this.retail_dates[0].effective_date).format("YYYY-MM-DD")
        )
      ) {
        this.disableNextButton = false;
      } else {
        this.disableNextButton = true;
      }
      if (this.sku_detail && this.sku_detail.sku_type && this.sku_detail.sku_type.toLowerCase() === "stock") {
        this.getPackageRetails(
          date && date.fulldate
            ? moment(date.fulldate, "YYYY-MM-DD", true).isValid() ? date.fulldate : moment(new Date(date.fulldate)).format("YYYY-MM-DD")
            : null
        );

      }
    }

    // to get the the dates of a month
    getDates(year, month) {
      this.retailDate = [];

      for (let k = 0; k < this.retail_dates.length; k++) {
        if (
          month.id ===
          parseInt(moment(this.retail_dates[k].effective_date).format("M"))
        ) {
          this.retailDate = moment(this.retail_dates[k].effective_date).format(
            "D"
          );
          this.dates[this.retailDate].retailDate = this.retailDate;
        }
      }
    }

    groupByPriceTypesSkuRetails(result) {
      return new Promise((resolve, reject) => {
        let map = {};
        let dates = [];
        let enddates = [];
        let retails = [];
        var as400_sent = [];
        let retailReasonId =
          result && result[0] ? result[0].retail_reason_id : undefined;
        let pricetypes = {
          data: this.price_types,
          priceTypeMap: this.priceTypeMap
        };
        // used to show effective date for individual price type if retails are coming for multiplr effective dates
        this.showingMultipleDatesRetails = false;
        var priceTypeIdsHavingRetails = [];
        var priceTypeIdsNotHaveRetails = []; // used beacause if retails are not there for any type then multiple input box columns are created for same price type

        let skuRetailMap = {};
        for (let m = 0; m < result.length; m++) {
          let dItem = result[m];
          let sku_end_date = dItem.end_date;
          let sku_date = dItem.effective_date;
          let price_type_id = dItem.price_type_id;
          let _date_map = sku_date + "_" + price_type_id;
          !priceTypeIdsHavingRetails.includes(dItem.price_type_id)
            ? priceTypeIdsHavingRetails.push(dItem.price_type_id)
            : null;
          let obj = {
            price_class_udd_id: dItem.price_class_udd_id,
            retail_reason_id: dItem.retail_reason_id,
            price_class_udd_line_id: dItem.price_class_udd_line_id,
            value_short_description: dItem.price_class,
            retail: dItem.retail,
            sent_to_as400: dItem.sent_to_as400
          };

          as400_sent.push(obj.sent_to_as400);
          map[sku_date] = sku_date;
          dates.push(sku_date);
          dates = [...new Set(dates)];
          if (map[sku_end_date] === undefined) {
            map[sku_end_date] = sku_end_date;
            enddates.push(sku_end_date);
          }
          if (skuRetailMap[_date_map] === undefined) {
            skuRetailMap[_date_map] = {};
          }
          skuRetailMap[_date_map][dItem.price_class_udd_line_id] = obj;
        }
        var val = as400_sent.map(function (item) {
          return item;
        });
        var sent_val = val.join(",");
        if (sent_val.includes(1)) {
          this.permissionsMap.delete = true;
          this.disable_delete = true;
        }
        else {
          this.permissionsMap.delete = false;
          this.disable_delete = false;
        }
        let pricegroups = this.clone(this.price_groups);
        // assign retail_reason_id to empty retail field for each price group
        pricegroups.map(pgrp => (pgrp.retail_reason_id = retailReasonId));
        let endDate = enddates[0];
        for (let i = 0; i < dates.length; i++) {
          let date = dates[i];
          var obj = {
            effective_date: date,
            end_date: endDate,
            sku_id: this.skuId,
            price_types: []
          };
          let price_types = this.clone(pricetypes.data);
          let retail_effective_date = moment(dates[i]).format("YYYYMMDD");

          for (let j = 0; j < price_types.length; j++) {
            let pricetype = this.clone(price_types[j]);
            if (
              retail_effective_date &&
              Number(retail_effective_date) >= Number(this.todays_date)
            ) {
              pricetype.isUpdate = true;
            } else {
              pricetype.isUpdate = false;
            }
            // check skuRetailuMap has date and check if not a single retail exist for price type id
            if (
              priceTypeIdsHavingRetails.includes(pricetype.id) &&
              skuRetailMap[date + "_" + pricetype.id]
            ) {
              let pgs = [];

              for (let k = 0; k < pricegroups.length; k++) {
                let pg = pricegroups[k];
                if (
                  skuRetailMap[date + "_" + pricetype.id][
                  pg.price_class_udd_line_id
                  ]
                ) {
                  pgs.push(
                    skuRetailMap[date + "_" + pricetype.id][
                    pg.price_class_udd_line_id
                    ]
                  );
                } else {
                  pgs.push(pg);
                }
              }
              pricetype["retails"] = this.clone(pgs);
              obj.price_types.push(pricetype);
            } else {
              if (
                !priceTypeIdsHavingRetails.includes(pricetype.id) &&
                !priceTypeIdsNotHaveRetails.includes(pricetype.id)
              ) {
                priceTypeIdsNotHaveRetails.push(pricetype.id);
                pricetype["retails"] = this.clone(pricegroups);
                obj.price_types.push(pricetype);
              }
            }
          }
          retails.push(obj);
        }

        if (retails.length > 1) {
          // if more than one effective dates retails are showing
          this.mergeRetailsInFirstObject(retails, priceTypeIdsHavingRetails)
            .then(response => {
              retails = response;
              resolve(retails[0]);
            })
            .catch(() => { });
        } else {
          resolve(retails[0]);
        }
      });
    }

    // function to merge retails of different effective dates together to show in UI
    mergeRetailsInFirstObject(allretails, priceTypeIdsHavingRetails) {
      return new Promise((resolve, reject) => {
        let retails = allretails;
        // sort retails in Desc order
        retails.sort(function (a, b) {
          // to sort indescending order
          var key1 = new Date(b.effective_date);
          var key2 = new Date(a.effective_date);
          if (key1 < key2) {
            return -1;
          } else if (key1 == key2) {
            return 0;
          } else {
            return 1;
          }
        });
        if (retails.length > 1) {
          // if more than one effective dates retails are showing
          this.showingMultipleDatesRetails = true;
          let isRetailExistForTodayOrFutureDate = false;
          for (let i = 0; i < retails.length; i++) {
            // push effective date to inidividual price types
            for (let j = 0; j < retails[i].price_types.length; j++) {
              let ptype = retails[i].price_types[j];

              if (priceTypeIdsHavingRetails.includes(ptype.id)) {
                ptype.effective_date = retails[i].effective_date;
              }

              // to make retail field editable for each price type check effective date
              if (
                (ptype.effective_date &&
                  Number(moment(ptype.effective_date).format("YYYYMMDD")) >=
                  Number(this.todays_date)) ||
                (!ptype.effective_date && isRetailExistForTodayOrFutureDate)
              ) {
                isRetailExistForTodayOrFutureDate = true;
                ptype.isUpdate = true;
              } else {
                ptype.isUpdate = false;
              }
            }
            // merge price types of multiple effective dates into frist array
            if (i !== 0) {
              retails[0].price_types = [
                ...retails[0].price_types,
                ...retails[i].price_types
              ];
            }
          }
        }
        resolve(retails);
      });
    }

    // goto previous screen
    gotoPreviousScreen() {
      if (
        this.sku_detail.sku_type.toLowerCase() === "mto" ||
        !this.isPackageRetails ||
        !this.showPackageRetailTab
      ) {
        this.isNewRetailForm = true;
        this.isPackageRetailForm = false;
      } else {
        this.isNewRetailForm = false;
        this.isPackageRetailForm = true;
      }
      this.reviewScreen = false;
      this.isRetailRoundingForm = false;
      this.isApplied = false;
      this.common.$timeout(() => {
        angular.element("#retail_next").focus();
      }, 1000);
    }

    getSkuRetails(date, selectedDate, statusId) {
      this.isRetailLoading = true;
      this.not_temporary = false;
      this.retail = null;
      this.daysDifference = '';
      var permanent = [];
      var temporary = [];
      var retail_ar = [];
      this.SkuRetailService.GetSKURetail(
        this.skuId,
        date,
        undefined,
        undefined,
        statusId
      )
        .then(result => {
          if (result.length > 0) {
            _.each(result, res => {
              if (res.end_date == null) {
                permanent.push(res);
              }
              else {
                temporary.push(res);
              }
            })
            if (selectedDate) {
              selectedDate = moment(selectedDate).format("YYYY-MM-DD");
              var date_edit = selectedDate.split("-");
              if (date_edit[2].length == 1) {
                date_edit[2] = '0' + date_edit[2]
              };
              selectedDate = date_edit.join('-');
              _.each(temporary, temp => {
                if (selectedDate > moment(temp.end_date).format("YYYY-MM-DD")) {
                  this.not_temporary = true;
                  result = permanent;
                }
                else {
                  if (this.not_temporary && result.length > 0) {
                    result.push(temp)
                  }
                }
              })
            }
            if (result.length > 0) {
              this.groupByPriceTypesSkuRetails(result)
                .then(response => {
                  this.retail = response;
                  this.currentRetailDate = moment(this.retail.effective_date).format(
                    "YYYY-MM-DD"
                  );
                  this.daysDifference = moment(this.currentDate).diff(
                    this.currentRetailDate,
                    "days"
                  );
                  this.daysDifference < 0
                    ? (this.isRetailDateGreaterThanToday = true)
                    : (this.isRetailDateGreaterThanToday = false);
                  this.latestRetailToSelectedDate = {
                    effective_date: moment(this.retail.effective_date).format(
                      "YYYY-MM-DD"
                    )
                  };
                  if (
                    Date.parse(
                      moment(this.retail.effective_date).format("YYYY-MM-DD")
                    ) <
                    Date.parse(
                      moment(this.retail_dates[0].effective_date).format(
                        "YYYY-MM-DD"
                      )
                    )
                  ) {
                    this.disableNextButton = false;
                  } else {
                    this.disableNextButton = true;
                  }
                  if (date === undefined) {
                    // set the current retail only when loaded
                    this.currentRetail = this.retail;
                    // To get the current retail index
                    this.currentRetailIndex = this.retail_dates
                      .map(e => {
                        return e.effective_date;
                      })
                      .indexOf(this.currentRetail.effective_date);
                    this.counterIndex = this.currentRetailIndex;
                    // If the current retail index is greater than 0 in retail_dates array then assign the next retail
                    if (this.currentRetailIndex > 0) {
                      // If the current retail index is greater than 0 then the previous in the retail_dates array is set as the next retail
                      this.nextRetail = this.retail_dates[
                        this.currentRetailIndex - 1
                      ];
                    } else {
                      this.nextRetail = undefined;
                    }
                  }
                  this.setDateRange();
                  this.isLoaded = true;
                  this.common.$timeout(() => {
                    this.showNoRetailMessage = false;
                  }, 0);
                  this.isRetailLoading = false;
                })
                .catch(() => {
                  this.isLoaded = true;
                  this.isRetailLoading = false;
                });
            }
            else {
              this.retail = null;
              this.showNoRetailMessage = true;
              if (
                this.retail_dates &&
                this.retail_dates.length > 0 &&
                Date.parse(
                  moment(
                    this.presentYear +
                    "-" +
                    this.presentMonth +
                    "-" +
                    this.presentDate
                  ).format("YYYY-MM-DD")
                ) <
                Date.parse(
                  moment(this.retail_dates[0].effective_date).format(
                    "YYYY-MM-DD"
                  )
                )
              ) {
                this.disableNextButton = false;
                this.counterIndex = -1;
              } else {
                this.disableNextButton = true;
              }
              if (selectedDate) {
                /* commented for now.... can be reverted if any issue occures */
                // this.getPackageRetails(moment(new Date(selectedDate)).format("YYYY-MM-DD"));
              } else {
                this.isLoaded = true;
              }
              this.isRetailLoading = false;
            }
          } else {
            this.retail = null;
            this.showNoRetailMessage = true;
            if (
              this.retail_dates &&
              this.retail_dates.length > 0 &&
              Date.parse(
                moment(
                  this.presentYear +
                  "-" +
                  this.presentMonth +
                  "-" +
                  this.presentDate
                ).format("YYYY-MM-DD")
              ) <
              Date.parse(
                moment(this.retail_dates[0].effective_date).format(
                  "YYYY-MM-DD"
                )
              )
            ) {
              this.disableNextButton = false;
              this.counterIndex = -1;
            } else {
              this.disableNextButton = true;
            }
            if (selectedDate) {
              /* commented for now.... can be reverted if any issue occures */
              // this.getPackageRetails(moment(new Date(selectedDate)).format("YYYY-MM-DD"));
            } else {
              this.isLoaded = true;
            }
            this.isRetailLoading = false;
          }
        })
        .catch(error => {
          this.logger.error(error);
          this.isRetailLoading = false;
        });
    }

    getPackageRetails(date) {
      if (!this.isRetailLoading) {
        this.isPackageRetailLoading = true;
      }
      !date || date === undefined
        ? (date = moment(new Date(Date.now())).format("YYYY-MM-DD"))
        : null;
      this.setBasePackagePrice()
        .then(orderAdvisors => {
          this.isPackageRetailLoading = true;
          if (orderAdvisors.length) {
            this.isPackageRetails = true;
            this.SkuRetailService.GetBasePackageRetails(this.skuId, date)
              .then(result => {
                if (date && result.data.length > 0) {
                  result.data.map(data => {
                    var result_data = result.data.filter(data => (moment(data.end_date).format("YYYY-MM-DD")) >= date);
                    result.data = result_data;
                  });
                }
                if (result.data.length > 0) {
                  result.data = result.data.filter((arr, index, self) =>
                    index === self.findIndex((t) => (t.description === arr.description && t.effective_date === arr.effective_date
                      && t.package_id === arr.package_id && t.order_advisor_id === arr.order_advisor_id
                      && t.retail === arr.retail && t.price_class_udd_id == arr.price_class_udd_id && t.price_class_udd_line_id == arr.price_class_udd_line_id && t.price_type_id == arr.price_type_id)))
                  this.OrderAdvisorsRetails = [];
                  if (this.retail) {
                    this.retail.OrderAdvisorRetails = [];
                  } else {
                    this.retail = {};
                    this.retail.OrderAdvisorRetails = [];
                  }

                  for (let index = 0; index < this.linkedOrderAdvisors.length; index++) {
                    let payload = {
                      description: this.linkedOrderAdvisors[index].description,
                      order_advisor_id: this.linkedOrderAdvisors[index].id,
                      Packages: []
                    };
                    for (let packageIndex = 0; packageIndex < this.Packages.length; packageIndex++) {
                      if (this.linkedOrderAdvisors[index].included_packages) {
                        this.linkedOrderAdvisors[index].included_packages.includes(this.Packages[packageIndex].id)
                          ? payload.Packages.push(this.clone(this.Packages[packageIndex]))
                          : null;
                      }
                    }
                    for (let packageIndex = 0; packageIndex < payload.Packages.length; packageIndex++) {
                      payload.Packages[packageIndex].PriceTypes = this.clone(this.price_types);
                      for (let priceTypeIndex = 0; priceTypeIndex < payload.Packages[packageIndex].PriceTypes.length; priceTypeIndex++) {
                        payload.Packages[packageIndex].PriceTypes[priceTypeIndex].PriceGroups = this.clone(this.sku_price_groups);
                        _.each(result.data, basepackages => {
                          if (
                            basepackages.order_advisor_id === payload.order_advisor_id &&
                            basepackages.package_id === payload.Packages[packageIndex].id &&
                            basepackages.price_type_id === payload.Packages[packageIndex].PriceTypes[priceTypeIndex].id
                          ) {
                            for (let priceGroupIndex = 0; priceGroupIndex < payload.Packages[packageIndex].PriceTypes[priceTypeIndex].PriceGroups.length; priceGroupIndex++) {
                              if (basepackages.price_class_udd_id === payload.Packages[packageIndex].PriceTypes[priceTypeIndex].PriceGroups[priceGroupIndex].price_class_udd_id &&
                                basepackages.price_class_udd_line_id === payload.Packages[packageIndex].PriceTypes[priceTypeIndex].PriceGroups[priceGroupIndex].price_class_udd_line_id) {
                                payload.Packages[packageIndex].PriceTypes[priceTypeIndex].PriceGroups[priceGroupIndex].retail_id = basepackages.id;
                                if (basepackages.retail == 0) {
                                  basepackages.retail = undefined;
                                }
                                payload.Packages[packageIndex].PriceTypes[priceTypeIndex].PriceGroups[priceGroupIndex].retail = basepackages.retail;
                                payload.effective_date = basepackages.effective_date;
                                if (!basepackages.end_date || basepackages.end_date != "null") {
                                  payload.end_date = basepackages.end_date;
                                }
                              }
                            }
                          }
                        })
                      }
                    }
                    this.retail.OrderAdvisorRetails.push(payload);
                    this.retail.OrderAdvisorRetails = this.retail.OrderAdvisorRetails.filter((arr, index, self) =>
                      index === self.findIndex((t) => (t.description === arr.description && t.effective_date === arr.effective_date)))
                    this.retail.OrderAdvisorRetails = this.retail.OrderAdvisorRetails.filter(payload => payload.Packages.length > 0);
                  }
                  let conditionForRetailAvail=false
                  result.data.forEach(re=>{
                    this.retail.OrderAdvisorRetails.forEach(ora=>{
                      if(re.order_advisor_id==ora.order_advisor_id && ora.Packages.some(pkg => pkg.id == re.package_id) && !conditionForRetailAvail){
                        conditionForRetailAvail=true
                      }
                    })
                  })
                  if(!conditionForRetailAvail){
                    this.retail.OrderAdvisorRetails=[]
                  }
                  this.nopackage_retails = false;
                  this.isPackageRetailLoading = false;
                }
                else {
                  this.nopackage_retails = true;
                  this.isPackageRetailLoading = false;
                }
              })
              .catch(error => {
                this.isPackageRetailLoading = false;
                this.logger.error(error);
              });
          } else {
            this.isPackageRetails = false;
            this.isPackageRetailLoading = false;
          }
        })
        .catch(error => {
          this.isPackageRetailLoading = false;
          this.logger.error(error);
        });
    }

    getMtoTypePriceGroupAndChoices() {
      // Option list Id/Header Id & item Id will return mto  assigned option headers data
      return new Promise((resolve, reject) => {
        this.SkuRetailService.GetMTORetailPriceGroupsAndChoices(
          this.sku_detail.item_id,
          this.sku_detail.option_list_id ? [this.sku_detail.option_list_id] : [this.sku_detail.id],
          this.sku_detail.option_list_id ? true : false
        ).then(response => {
          let mto_option_headers = response;
          let type_ids = [];
          let type_id_map = {};
          let type_id_map_info = {};
          let res = {
            mto_sku_map: {}
          };
          for (let i = 0; i < mto_option_headers.data.length; i++) {
            let resItem = mto_option_headers.data[i];
            res.mto_sku_map[resItem.option_header_id] = {};
            let obj = {
              mto_description: resItem.mto_description,
              price_group_desc: resItem.price_group_desc,
              choice_desc: resItem.choice_desc,
              choice_id: resItem.choice_id,
              choice_price_group_id: resItem.choice_price_group_id,
              method: resItem.method,
              option_id: resItem.option_id,
              type_desc: resItem.type_desc,
              option_type_id: resItem.option_type_id
            };
            if (type_id_map_info[obj.option_type_id] === undefined) {
              type_ids.push(obj.option_type_id);
              type_id_map_info[obj.option_type_id] = obj.option_type_id;
            }
            if (
              type_id_map[
              resItem.option_header_id + "_" + obj.option_type_id
              ] == undefined
            ) {
              type_id_map[
                resItem.option_header_id + "_" + obj.option_type_id
              ] = {};
              res.mto_sku_map[
                resItem.option_header_id + "_" + obj.option_type_id
              ] = {
                type_desc: obj.type_desc
              };
              res.mto_sku_map[
                resItem.option_header_id + "_" + obj.option_type_id
              ]["subPriceGroups"] = [];
              res.mto_sku_map[
                resItem.option_header_id + "_" + obj.option_type_id
              ]["subByChoices"] = [];
            }
            if (resItem.method === "Price Group") {
              if (
                res.mto_sku_map[
                resItem.option_header_id + "_" + obj.option_type_id
                ]["price_group_map" + "_" + obj.choice_price_group_id] ===
                undefined
              ) {
                res.mto_sku_map[
                  resItem.option_header_id + "_" + obj.option_type_id
                ]["subPriceGroups"].push(obj);
                res.mto_sku_map[
                  resItem.option_header_id + "_" + obj.option_type_id
                ]["price_group_map" + "_" + obj.choice_price_group_id] = {};
              }
            }
            if (resItem.method === "By Choice") {
              if (
                res.mto_sku_map[
                resItem.option_header_id + "_" + obj.option_type_id
                ]["by_choice_map" + "_" + obj.choice_id] === undefined
              ) {
                res.mto_sku_map[
                  resItem.option_header_id + "_" + obj.option_type_id
                ]["subByChoices"].push(obj);
                res.mto_sku_map[
                  resItem.option_header_id + "_" + obj.option_type_id
                ]["by_choice_map" + "_" + obj.choice_id] = {};
              }
            }
          }

          let hId = this.sku_detail.option_list_id;
          this.option_types = [];
          for (let j = 0; j < type_ids.length; j++) {
            if (res.mto_sku_map[hId + "_" + type_ids[j]] !== undefined) {
              let option_type = res.mto_sku_map[hId + "_" + type_ids[j]];
              this.option_types.push(option_type);
            }
          }
          resolve("success");
        });
      });
    }

    groupByPriceTypesMtoRetails(result) {
      return new Promise((resolve, reject) => {
        let map = {};
        let retails = [];
        let dates = [];
        let enddates = [];
        let retailReasonId =
          result && result[0] ? result[0].retail_reason_id : undefined;

        // used to show effective date for individual price type if retails are coming for multiplr effective dates
        this.showingMultipleDatesRetails = false;
        let pricetypes = {
          data: this.price_types,
          priceTypeMap: this.priceTypeMap
        };
        let mskuRetailMap = {},
          typeChoiceMap = {},
          typePriceGroupMap = {};
        var priceTypeIdsHavingRetails = [];
        var priceTypeIdsNotHaveRetails = []; // used beacause if retails are not there for any type then multiple input box columns are created for same price type
        for (let m = 0; m < result.length; m++) {
          let dItem = result[m];
          let sku_date = dItem.effective_date;
          let sku_end_date = dItem.end_date;
          let price_type_id = dItem.price_type_id;
          let _date_map = sku_date + "_" + price_type_id;
          !priceTypeIdsHavingRetails.includes(dItem.price_type_id)
            ? priceTypeIdsHavingRetails.push(dItem.price_type_id)
            : null;
          let obj = {
            price_class_udd_id: dItem.price_class_udd_id,
            retail_reason_id: dItem.retail_reason_id,
            price_class_udd_line_id: dItem.price_class_udd_line_id,
            value_short_description: dItem.price_class,
            retail: dItem.retail
          };
          if (sku_end_date && map[sku_end_date] === undefined) {
            map[sku_end_date] = {};
            enddates.push(sku_end_date);
          }
          if (map[sku_date] === undefined) {
            map[sku_date] = {};
            dates.push(sku_date);
          }
          if (dItem.is_price_group === 0) {
            if (typeChoiceMap[_date_map] === undefined) {
              typeChoiceMap[_date_map] = {};
            }
            typeChoiceMap[_date_map][
              dItem.option_id +
              "_" +
              dItem.price_group_id_or_choice_id +
              "_" +
              dItem.price_class_udd_line_id
            ] = obj;
          }
          if (dItem.is_price_group === 1) {
            if (typePriceGroupMap[_date_map] === undefined) {
              typePriceGroupMap[_date_map] = {};
            }
            typePriceGroupMap[_date_map][
              dItem.option_id +
              "_" +
              dItem.price_group_id_or_choice_id +
              "_" +
              dItem.price_class_udd_line_id
            ] = obj;
          }
          if (dItem.is_price_group === 2) {
            if (mskuRetailMap[_date_map] === undefined) {
              mskuRetailMap[_date_map] = {};
            }
            mskuRetailMap[_date_map][dItem.price_class_udd_line_id] = obj;
          }
        }
        let types = this.clone(this.option_types);
        let pricegroups = this.clone(this.price_groups);
        let endDate = enddates[0];
        // assign retail_reason_id to empty retail field for each price group
        pricegroups.map(pgrp => (pgrp.retail_reason_id = retailReasonId));
        for (let i = 0; i < dates.length; i++) {
          let obj = {
            effective_date: dates[i],
            end_date: endDate,
            sku_id: this.skuId,
            price_types: []
          };
          let retail_effective_date = moment(dates[i]).format("YYYYMMDD");

          let price_types = this.clone(pricetypes.data);

          for (let j = 0; j < price_types.length; j++) {
            let pricetype = this.clone(price_types[j]);
            if (
              retail_effective_date &&
              Number(retail_effective_date) >= Number(this.todays_date)
            ) {
              pricetype.isUpdate = true;
            }
            // check mskuMap has date and check if not a single retail exist for price type id
            if (
              priceTypeIdsHavingRetails.includes(pricetype.id) &&
              mskuRetailMap[dates[i] + "_" + pricetype.id]
            ) {
              let pgs = [];
              for (let k = 0; k < pricegroups.length; k++) {
                let pg = pricegroups[k];
                if (
                  mskuRetailMap[dates[i] + "_" + pricetype.id][
                  pg.price_class_udd_line_id
                  ]
                ) {
                  pgs.push(
                    mskuRetailMap[dates[i] + "_" + pricetype.id][
                    pg.price_class_udd_line_id
                    ]
                  );
                } else {
                  pgs.push(pg);
                }
              }
              pricetype["retails"] = this.clone(pgs);
              for (let l = 0; l < types.length; l++) {
                let type = types[l];
                for (let m = 0; m < type.subByChoices.length; m++) {
                  let choice = type.subByChoices[m];
                  let pgs = [];
                  for (let n = 0; n < pricegroups.length; n++) {
                    let pg = pricegroups[n];
                    if (
                      typeChoiceMap[dates[i] + "_" + pricetype.id] &&
                      typeChoiceMap[dates[i] + "_" + pricetype.id][
                      choice.option_id +
                      "_" +
                      choice.choice_id +
                      "_" +
                      pg.price_class_udd_line_id
                      ]
                    ) {
                      pgs.push(
                        typeChoiceMap[dates[i] + "_" + pricetype.id][
                        choice.option_id +
                        "_" +
                        choice.choice_id +
                        "_" +
                        pg.price_class_udd_line_id
                        ]
                      );
                    } else {
                      pgs.push(pg);
                    }
                  }
                  choice["retails"] = this.clone(pgs);
                }
                for (let m = 0; m < type.subPriceGroups.length; m++) {
                  let optionPriceGroup = type.subPriceGroups[m];
                  let pgs = [];
                  for (let n = 0; n < pricegroups.length; n++) {
                    let pg = pricegroups[n];
                    if (
                      typePriceGroupMap[dates[i] + "_" + pricetype.id] &&
                      typePriceGroupMap[dates[i] + "_" + pricetype.id][
                      optionPriceGroup.option_id +
                      "_" +
                      optionPriceGroup.choice_price_group_id +
                      "_" +
                      pg.price_class_udd_line_id
                      ]
                    ) {
                      pgs.push(
                        typePriceGroupMap[dates[i] + "_" + pricetype.id][
                        optionPriceGroup.option_id +
                        "_" +
                        optionPriceGroup.choice_price_group_id +
                        "_" +
                        pg.price_class_udd_line_id
                        ]
                      );
                    } else {
                      pgs.push(pg);
                    }
                  }
                  optionPriceGroup["retails"] = this.clone(pgs);
                }
              }
              pricetype["types"] = this.clone(types);
              obj.price_types.push(pricetype);
            } else {
              if (
                !priceTypeIdsHavingRetails.includes(pricetype.id) &&
                !priceTypeIdsNotHaveRetails.includes(pricetype.id)
              ) {
                priceTypeIdsNotHaveRetails.push(pricetype.id);
                pricetype["retails"] = this.clone(pricegroups);
                for (let l = 0; l < types.length; l++) {
                  let type = types[l];
                  for (let m = 0; m < type.subByChoices.length; m++) {
                    let choice = type.subByChoices[m];
                    choice["retails"] = this.clone(pricegroups);
                  }
                  for (let m = 0; m < type.subPriceGroups.length; m++) {
                    let optionPriceGroup = type.subPriceGroups[m];
                    optionPriceGroup["retails"] = this.clone(pricegroups);
                  }
                }
                pricetype["types"] = this.clone(types);
                obj.price_types.push(pricetype);
              } else {
                pricetype["retails"] = this.clone(pricegroups);
                for (let l = 0; l < types.length; l++) {
                  let type = types[l];
                  for (let m = 0; m < type.subByChoices.length; m++) {
                    let choice = type.subByChoices[m];
                    let pgs = [];
                    for (let n = 0; n < pricegroups.length; n++) {
                      let pg = pricegroups[n];
                      if (
                        typeChoiceMap[dates[i] + "_" + pricetype.id] &&
                        typeChoiceMap[dates[i] + "_" + pricetype.id][
                        choice.option_id +
                        "_" +
                        choice.choice_id +
                        "_" +
                        pg.price_class_udd_line_id
                        ]
                      ) {
                        pgs.push(
                          typeChoiceMap[dates[i] + "_" + pricetype.id][
                          choice.option_id +
                          "_" +
                          choice.choice_id +
                          "_" +
                          pg.price_class_udd_line_id
                          ]
                        );
                      } else {
                        pgs.push(pg);
                      }
                    }
                    choice["retails"] = this.clone(pgs);
                  }
                  for (let m = 0; m < type.subPriceGroups.length; m++) {
                    let optionPriceGroup = type.subPriceGroups[m];
                    let pgs = [];
                    for (let n = 0; n < pricegroups.length; n++) {
                      let pg = pricegroups[n];
                      if (
                        typePriceGroupMap[dates[i] + "_" + pricetype.id] &&
                        typePriceGroupMap[dates[i] + "_" + pricetype.id][
                        optionPriceGroup.option_id +
                        "_" +
                        optionPriceGroup.choice_price_group_id +
                        "_" +
                        pg.price_class_udd_line_id
                        ]
                      ) {
                        pgs.push(
                          typePriceGroupMap[dates[i] + "_" + pricetype.id][
                          optionPriceGroup.option_id +
                          "_" +
                          optionPriceGroup.choice_price_group_id +
                          "_" +
                          pg.price_class_udd_line_id
                          ]
                        );
                      } else {
                        pgs.push(pg);
                      }
                    }
                    optionPriceGroup["retails"] = this.clone(pgs);
                  }
                }
                pricetype["types"] = this.clone(types);
                obj.price_types.push(pricetype);
              }
            }
          }
          retails.push(obj);
        }
        if (retails.length > 1) {
          // if more than one effective dates retails are showing
          this.mergeRetailsInFirstObject(retails, priceTypeIdsHavingRetails)
            .then(response => {
              retails = response;
              resolve(retails);
            })
            .catch(() => { });
        } else {
          resolve(retails);
        }
      });
    }

    getMtoSkuRetails(date, statusId) {
      this.retail_sku_map = {};
      this.isRetailLoading = true;
      this.SkuRetailService.GetMtoSKURetail(
        this.skuId,
        date,
        undefined,
        undefined,
        statusId
      )
        .then(result => {
          if (result.length > 0) {
            this.hasRetails = true;
            this.groupByPriceTypesMtoRetails(result)
              .then(response => {
                this.retail = response[0];
                this.currentRetailDate = moment(
                  this.retail.effective_date
                ).format("YYYY-MM-DD");
                const daysDifference = moment(this.currentDate).diff(
                  this.currentRetailDate,
                  "days"
                );
                daysDifference < 0
                  ? (this.isRetailDateGreaterThanToday = true)
                  : (this.isRetailDateGreaterThanToday = false);
                this.latestRetailToSelectedDate = {
                  effective_date: moment(this.retail.effective_date).format(
                    "YYYY-MM-DD"
                  )
                };
                if (
                  Date.parse(
                    moment(this.retail.effective_date).format("YYYY-MM-DD")
                  ) <
                  Date.parse(
                    moment(this.retail_dates[0].effective_date).format(
                      "YYYY-MM-DD"
                    )
                  )
                ) {
                  this.disableNextButton = false;
                } else {
                  this.disableNextButton = true;
                }
                if (date === undefined) {
                  // set the current retail only when loaded
                  this.currentRetail = this.retail;
                  // To get the current retail index
                  this.currentRetailIndex = this.retail_dates
                    .map(function (e) {
                      return e.effective_date;
                    })
                    .indexOf(this.currentRetail.effective_date);
                  this.counterIndex = this.currentRetailIndex;
                  // If the current retail index is greater than 0 in retail_dates array then assign the next retail
                  if (this.currentRetailIndex > 0) {
                    // If the current retail index is greater than 0 then the previous in the retail_dates array is set as the next retail
                    this.nextRetail = this.retail_dates[
                      this.currentRetailIndex - 1
                    ];
                  } else {
                    this.nextRetail = undefined;
                  }
                }
                this.setDateRange();
                this.common.$timeout(() => {
                  this.showNoRetailMessage = false;
                }, 0);
              })
              .catch(() => { });
          } else {
            this.hasRetails = false;
            this.showNoRetailMessage = true;
            if (this.retail_dates && this.retail_dates.length > 0) {
              if (
                Date.parse(
                  moment(
                    this.presentYear +
                    "-" +
                    this.presentMonth +
                    "-" +
                    this.presentDate
                  ).format("YYYY-MM-DD")
                ) <
                Date.parse(
                  moment(this.retail_dates[0].effective_date).format(
                    "YYYY-MM-DD"
                  )
                )
              ) {
                this.disableNextButton = false;
                this.counterIndex = -1;
              } else {
                this.disableNextButton = true;
              }
            }
          }
          this.isRetailLoading = false;
          this.isLoaded = true;
        })
        .catch(error => {
          this.logger.error(error);
          this.isRetailLoading = false;
          this.isLoaded = true;
        });
    }

    setDateRange() {
      let startRange = this.currentRetail;
      let endRange = this.nextRetail;
      this.dates.map(date => {
        if (endRange) {
          if (
            moment(
              this.selectedYear + "-" + this.currentMonth + "-" + date.id,
              "YYYY-MM-DD"
            ).isAfter(startRange.effective_date, "YYYY-MM-DD") &&
            moment(
              this.selectedYear + "-" + this.currentMonth + "-" + date.id,
              "YYYY-MM-DD"
            ).isBefore(endRange.effective_date, "YYYY-MM-DD")
          ) {
            date.isInRange = true;
          }
        } else {
          if (
            moment(
              this.selectedYear + "-" + this.currentMonth + "-" + date.id,
              "YYYY-MM-DD"
            ).isAfter(startRange.effective_date, "YYYY-MM-DD")
          ) {
            date.isInRange = true;
          }
        }
      });
    }

    getPriceTypes() {
      return new Promise((resolve, reject) => {
        this.SkuRetailService.GetRetailPriceTypes()
          .then(response => {
            this.price_types = response.data;
            this.priceTypeMap = {};
            var price_typear = [];
            for (let j = 0; j < response.data.length; j++) {
              if (response.data[j].is_default === 1) {
                price_typear.push(response.data[j].id);
                if (response.data[j].id == 2) response.data[j].order = 1;
                else response.data[j].order = 2;
              }
              response.data[j].is_default === 1
                ? (this.retailHead = {
                  price_type_id: response.data[j].id,
                  price_type_ids: price_typear,
                  price_type_name: response.data[j].name,
                  effective_date: this.retailHead["effective_date"],
                  reason_type_id: 1
                })
                : null;
              this.priceTypeMap[response.data[j]["id"]] = response.data[j];
            }
            resolve(true);
          })
          .catch(error => {
            this.logger.error(error);
            reject(error);
          });
      });
    }

    getRetailReasonTypes() {
      this.SkuRetailService.GetRetailReasonTypes()
        .then(response => {
          this.retail_reason_types = response.data;
          this.retailReasonsMap = {};
          for (let j = 0; j < response.data.length; j++) {
            this.retailReasonsMap[response.data[j]["id"]] = response.data[j];
          }
        })
        .catch(error => {
          this.logger.error(error);
        });
    }

    // Getting all the retail reasons
    getRetailReasons() {
      this.SkuRetailService.GetRetailReasons()
        .then(response => {
          this.retail_reasons = response.data;
        })
        .catch(error => {
          this.logger.error(error);
        });
    }

    // Once we select a price type we filter the price reason based on the type_id
    filterRetailReason() {
      this.ValidationError = null;
      this.retail_error_message = null;
      // if price change type is permanent, assign the end_date to null
      if (this.retailHead.reason_type_id === 1) {
        this.retailHead.end_date = null;
      }
      this.retail_filtered_reasons = this.retail_reasons.filter(
        data => this.retailHead.reason_type_id == data.type_id
      );
      if (this.retail_filtered_reasons.length === 1) {
        this.retailHead.reason_id = this.retail_filtered_reasons[0].id;
      };
    }
    filterPackageRetailReason() {
      this.retail_error_message = null;
      // if price change type is permanent, assign the end_date to null
      if (this.packageRetailHead.reason_type_id === 1) {
        this.packageRetailHead.end_date = null;
      }
      this.retail_filtered_reasons = this.retail_reasons.filter(
        data => this.packageRetailHead.reason_type_id == data.type_id
      );
      if (this.retail_filtered_reasons.length === 1) {
        this.packageRetailHead.reason_id = this.retail_filtered_reasons[0].id;
      }
    }

    createPriceGroupMap(price_groups) {
      this.sku_price_groups = [];
      this.showPricetypes = true;
      for (let i = 0; i < price_groups.length; i++) {
        let pg = price_groups[i];
        let object = {
          price_class: pg["value_short_description"],
          price_class_udd_id: pg["pricing_class_udd_id"],
          price_class_udd_line_id: pg["pricing_class_udd_line_id"],
          price_percentage: pg["price_percentage"],
          retail: null
        };
        this.priceGroupMap[pg.pricing_class_udd_line_id] = object;
        this.price_group_ids.push(pg.pricing_class_udd_line_id);
        this.sku_price_groups.push(object);
        this.price_groups = this.clone(this.sku_price_groups);
      }
    }

    createPackagePriceGroupMap(package_price_groups) {
      this.package_price_groups = [];
      for (let i = 0; i < package_price_groups.length; i++) {
        let pg = package_price_groups[i];
        let object = {
          price_class: pg["value_short_description"],
          price_class_udd_id: pg["pricing_class_udd_id"],
          price_class_udd_line_id: pg["pricing_class_udd_line_id"],
          price_percentage: pg["price_percentage"],
          retail: null
        };
        // this.priceGroupMap[pg.pricing_class_udd_line_id] = object;
        // this.price_group_ids.push(pg.pricing_class_udd_line_id);
        this.package_price_groups.push(object);
        // this.price_groups = this.clone(this.sku_price_groups);
      }
    }

    getPricingGroups() {
      this.HierarchyService.SearchHierarchy(
        "is_pricing_classification_group_id",
        1
      )
        .then(response => {
          this.price_classification_id = response[0].id;
          this.ItemPriceGroupService.GetPricingClassificationsByItemTypeAndPricingClass(
            this.sku_detail.type_id,
            this.price_classification_id
          )
            .then(response => {
              this.price_groups = response.data;
              this.createPriceGroupMap(this.price_groups);
              // Store base package retails into a variable
              this.package_price_groups = response.data;
              // Set retails for each package to null initially
              this.createPackagePriceGroupMap(this.package_price_groups);
              this.fetchPackages();
              this.loaded = true;
              if (this.sku_detail.sku_type.toLowerCase() === "mto") {
                this.getMtoTypePriceGroupAndChoices().then(res => {
                  this.getMtoSkuRetailDates();
                  this.getMtoSkuRetails();
                });
              } else {
                // Get the base package retails for the packages
                this.getSkuRetailDates();
                this.getSkuRetails();
                this.getSkuPackageRetailDates();
              }
            })
            .catch(error => { });
        })
        .catch(err => this.logger.error(err));
    }

    // get all retail dates
    getSkuRetailDates(setIndexDate) {
      this.SkuRetailService.GetSkuRetailDates(this.skuId)
        .then(res => {
          this.retail_dates = res;
          if (this.retail_dates.length === 0 || this.retail_dates.length <= 1) {
            this.disablePreviousButton = true;
            this.disableNextButton = true;
          } else {
            this.disablePreviousButton = false;
            this.disableNextButton = false;
          }
          let date=this.dates.filter(re=>{
            return re.selected==true
          })
          let datesArray=[]
          this.retail_dates.map(mapdata => {
            if (
              moment(mapdata.effective_date).format("YYYY-MM-DD") < moment((date[0].fulldate)).format("YYYY-MM-DD")
            ){
              datesArray.push(mapdata.effective_date);
            }
          })
          if (datesArray.length > 0) {
            this.disablePreviousButton = false;
          } else {
            this.disablePreviousButton = true;
          }
          if (setIndexDate !== undefined) {
            let retailDatesIndex = this.retail_dates.findIndex(date => {
              return (
                moment(setIndexDate).format("YYYY-MM-DD") ===
                moment(date.effective_date).format("YYYY-MM-DD")
              );
            });
            this.counterIndex = retailDatesIndex;
            if (this.counterIndex === 0 && this.retail_dates.length > 1) {
              this.disablePreviousButton = false;
              this.disableNextButton = true;
            } else if (
              this.counterIndex !== 0 &&
              this.counterIndex !== this.retail_dates.length - 1
            ) {
              this.disablePreviousButton = false;
              this.disableNextButton = false;
            }
          }
          this.populateRetailTimeLine();
        })
        .catch(() => { });
    }

    // get all retail dates
    getSkuPackageRetailDates(setIndexDate) {
      this.SkuRetailService.GetSkuPackageRetailDates(this.skuId)
        .then(res => {
          this.package_retail_dates = res;
        })
        .catch(() => { });
    }

    // get all mto sku retail dates
    getMtoSkuRetailDates(setIndexDate) {
      this.SkuRetailService.GetMTOSkuRetailDates(this.skuId)
        .then(res => {
          this.retail_dates = res;
          if (this.retail_dates.length === 0 || this.retail_dates.length <= 1) {
            this.disablePreviousButton = true;
            this.disableNextButton = true;
          } else {
            this.disablePreviousButton = false;
            this.disableNextButton = false;
          }
          if (setIndexDate !== undefined) {
            let retailDatesIndex = this.retail_dates.findIndex(date => {
              return (
                moment(setIndexDate).format("YYYY-MM-DD") ===
                moment(date.effective_date).format("YYYY-MM-DD")
              );
            });
            this.counterIndex = retailDatesIndex;
            if (this.counterIndex === 0 && this.retail_dates.length > 1) {
              this.disablePreviousButton = false;
              this.disableNextButton = true;
            } else if (
              this.counterIndex !== 0 &&
              this.counterIndex !== this.retail_dates.length - 1
            ) {
              this.disablePreviousButton = false;
              this.disableNextButton = false;
            }
          }
          this.populateRetailTimeLine();
        })
        .catch(err => { });
    }

    showRetailForSelectedDate(currentRetailDate, selectedDate, statusId) {
      // if date is same as todays date then pass 'undefined' as date
      let date = currentRetailDate
        ? moment((currentRetailDate)).format("YYYY-MM-DD")
        : currentRetailDate;
      if (this.sku_detail.sku_type.toLowerCase() === "mto") {
        this.getMtoSkuRetails(date, statusId);
      } else {
        this.getSkuRetails(date, selectedDate, statusId);
      }
      this.showNoRetailMessage = false;
    }

    resetPriceGroups() {
      // Reset price groups with price group map
      for (let i = 0; i < this.sku_price_groups.length; i++) {
        let sp = this.sku_price_groups[i];
        sp.retail = null;
        sp.new_retail = null;
      }
    }

    getSKURetailPayload(
      priceGroup,
      priceTypeId,
      effectiveDate,
      endDate,
      isRetailPriceGroup,
      price_type,
      idx
    ) {
      let payload = {};
      payload["retail_reason_id"] = this.retailHead.reason_id;
      payload["price_type_id"] = priceTypeId;
      payload["ref_percent"] = 1;
      payload["status_id"] = 200;
      payload["apply_all_flag"] = 0;
      payload["apply_percent"] = 1;
      payload["sku_id"] = this.skuId;
      if (this.isCopyRetail) {
        payload["sku_retail"] = priceGroup.new_retail;
      } else {
        payload["sku_retail"] = price_type.retail[idx];
      }
      payload["udd_id"] = priceGroup.price_class_udd_id;
      payload["udd_line_id"] = priceGroup.price_class_udd_line_id;
      if (!isRetailPriceGroup) {
        payload["effective_date"] = moment(
          effectiveDate,
          this.$scope.date_format
        ).format("YYYY-MM-DD");
      } else {
        payload["effective_date"] = effectiveDate;
      }
      if (endDate) {
        payload["end_date"] = moment(endDate).format("YYYY-MM-DD");
      } else {
        payload["end_date"] = null;
      }
      return payload;
    }

    getMTOSKURetailPayload(
      priceGroup,
      retailHead,
      priceTypeId,
      isRetailPriceGroup,
      mtoInfo,
      parent,
      index
    ) {
      let payload = {};
      payload["retail_reason_id"] = retailHead.reason_id;
      payload["price_type_id"] = priceTypeId;
      payload["ref_percent"] = 1;
      payload["status_id"] = 200;
      payload["apply_all_flag"] = 0;
      payload["apply_percent"] = 1;
      payload["sku_id"] = this.skuId;
      if (this.isCopyRetail) {
        payload["sku_retail"] = priceGroup.new_retail;
      } else {
        payload["sku_retail"] = parent.retail[index];
      }
      payload["udd_id"] = priceGroup.price_class_udd_id;
      payload["udd_line_id"] = priceGroup.price_class_udd_line_id;
      if (!isRetailPriceGroup) {
        payload["effective_date"] = moment(
          retailHead.effective_date,
          this.$scope.date_format
        ).format("YYYY-MM-DD");
      } else {
        payload["effective_date"] = retailHead.effective_date;
      }
      if (retailHead.end_date) {
        payload["end_date"] = moment(retailHead.end_date).format("YYYY-MM-DD");
      } else {
        payload["end_date"] = null;
      }
      angular.extend(payload, mtoInfo);
      return payload;
    }

    loadPriceOnClass(modal) {
      this.price_class = modal;
      if (
        this.priceGroupMap[modal.price_class_udd_line_id]["retail"] === null ||
        undefined
      ) {
        this.reviewPriceClass = "0.00";
      } else {
        this.reviewPriceClass =
          parseFloat(
            this.priceGroupMap[modal.price_class_udd_line_id]["retail"]
          ).toFixed(2) || "0.00";
      }
    }

    saveSkuRetailItem(priceGroup, retail) {
      if (
        priceGroup.old_retail !== priceGroup.retail &&
        priceGroup.retail !== null
      ) {
        let payload = this.getSKURetailPayload(
          priceGroup,
          retail.price_type_id,
          retail.effective_date,
          retail.end_date,
          true
        );
        this.saveSKURetail(payload).then(res => {
          priceGroup.old_retail = priceGroup.retail;
        });
      }
    }

    saveMTOSkuRetailItem(
      priceGroup,
      retail,
      priceGroupOrChoice,
      is_price_group
    ) {
      if (
        priceGroup.old_retail !== priceGroup.retail &&
        priceGroup.retail !== null
      ) {
        let mtoObj = {},
          payload = {};
        if (is_price_group === 2) {
          mtoObj = {
            is_price_group: 2,
            option_id: null,
            price_group_id_or_choice_id: null
          };
        } else if (is_price_group === 0) {
          mtoObj = {
            is_price_group: is_price_group,
            option_id: priceGroupOrChoice.option_id,
            price_group_id_or_choice_id: priceGroupOrChoice.choice_id
          };
        } else if (is_price_group === 1) {
          mtoObj = {
            is_price_group: is_price_group,
            option_id: priceGroupOrChoice.option_id,
            price_group_id_or_choice_id:
              priceGroupOrChoice.choice_price_group_id
          };
        }
        if (priceGroup.retail !== null) {
          payload = this.getMTOSKURetailPayload(
            priceGroup,
            retail,
            retail.price_type_id,
            true,
            mtoObj
          );
          this.saveMTOSKURetail(payload).then(res => {
            priceGroup.old_retail = priceGroup.retail;
          });
        }
      }
    }

    saveSKURetail(obj, flag) {
      return new Promise((resolve, reject) => {
        this.SkuRetailService.UpdateSKURetail(obj)
          .then(() => {
            resolve(true);
            this.hasRetails = true;
          })
          .catch(error => {
            this.logger.error(error);
          });
      });
    }

    saveMTOSKURetail(obj, flag) {
      return new Promise((resolve, reject) => {
        this.SkuRetailService.UpdateMTOSKURetail(obj)
          .then(() => {
            resolve("Success");
          })
          .catch(error => {
            this.logger.error(error);
            reject(error);
          });
      });
    }

    saveSKURetails() {
      this.isProcessing = true;
      this.btnText = "Saving Retail";
      let retail_promises = [];
      // this.message = "Retails are saving....";
      let retailHead = this.retailHead;
      // loop price types list
      for (let j = 0; j < this.price_types.length; j++) {
        if (retailHead.price_type_ids.includes(this.price_types[j].id)) {
          let ptype = this.price_types[j]; // price type
          // loop price groups
          for (let i = 0; i < ptype.sku_price_groups.length; i++) {
            let pg = ptype.sku_price_groups[i];
            if (
              ptype.retail &&
              ptype.retail[i] !== undefined &&
              ptype.retail[i] >= 0 &&
              pg.old_retail !== ptype.retail[i]
            ) {
              let payload = this.getSKURetailPayload(
                pg,
                ptype.id,
                retailHead.effective_date,
                retailHead.end_date,
                false,
                ptype,
                i
              );
              retail_promises.push(this.saveSKURetail(payload));
            }
          }
        }
      }
      Promise.all(retail_promises)
        .then(() => {
          this.btnText = "Save Retail";
          // this.showSetRetailPanel = false;
          let date = {}, month = {};
          // this.message = "Retails successfully created.";
          this.isNewRetailForm = false;
          this.isCopyRetail = false;
          this.getSkuRetailDates(retailHead.effective_date);
          if (!this.showPackageRetailTab) {
            if (this.retail) {
              this.getPackageRetails(moment(new Date(this.retail.effective_date)).format("YYYY-MM-DD"));
            }
            this.getSkuRetails(moment(new Date(retailHead.effective_date)).format("YYYY-MM-DD"));
          } else {
            this.saveBasePackageRetails();
            this.getSkuRetails(
              moment(new Date(this.retail.effective_date)).format("YYYY-MM-DD"),
              moment(new Date(retailHead.effective_date)).format("YYYY-MM-DD")
            );
          }
          this.resetPriceGroups();
          date.id = moment(retailHead.effective_date).format("DD");
          month.id = moment(retailHead.effective_date).format("M");
          this.selectedYear = 
            moment(retailHead.effective_date).format("Y")
          
          this.deSelectAllMonths();
          this.selectMonth(parseInt(month.id));
          this.generateDateTimeline(parseInt(month.id));
          this.populateRetailTimeLine();
          this.deSelectAllDates();
          // this.showRetailForSelectedDate(retailHead.effective_date, null, 200);
          this.selectDate(parseInt(date.id));
          this.common.$timeout(() => {
            this.message = null;
            this.isSaveSuccess = true;
            this.btnText = "Save Retail";
            this.isSaveSuccess = true;
            this.retailHead = {};
            // this.showSetRetailPanel = false;
          }, 0);
          this.common.$timeout(() => {
            angular.element("#done_btn").focus();
          }, 1000);
          this.common.$timeout(() => {
            this.isProcessing = false;
            angular.element("#refresh_retail_icon").focus();
            this.getSKU();
          }, 2500);
        })
        .catch(() => {
          this.message = "Error";
        });
    }

    closeForm() {
      this.isSaveSuccess = false;
      this.showSetRetailPanel = false;
      this.showSetRetailPanel = false;
      this.common.$timeout(() => {
        angular.element("#copy_retail_icon").focus();
      }, 1000);
    }

    saveMTOSKURetails() {
      this.isProcessing = true;
      let retail_promises = [];
      this.btnText =
        "Saving Retail"; /* changing button text until it save the mto sku retail */
      let retailHead = this.retailHead;
      for (let idx = 0; idx < this.price_types.length; idx++) {
        let ptype = this.price_types[idx];
        if (ptype.retail) {
          for (let i = 0; i < ptype.sku_price_groups.length; i++) {
            let mtoInfo = {
              is_price_group: 2,
              option_id: null,
              price_group_id_or_choice_id: null
            };
            let pg = ptype.sku_price_groups[i];
            if (
              ptype.retail &&
              ptype.retail[i] &&
              pg.old_retail !== ptype.retail[i]
            ) {
              let payload = this.getMTOSKURetailPayload(
                pg,
                retailHead,
                ptype.id,
                false,
                mtoInfo,
                ptype,
                i
              );
              if (
                payload.sku_retail !== null &&
                payload.sku_retail !== undefined
              ) {
                retail_promises.push(this.saveMTOSKURetail(payload));
              }
            }
          }
        }
        let mto_types = ptype.mto_types_retails;
        for (let m = 0; m < mto_types.length; m++) {
          let mto_type = mto_types[m];
          for (let j = 0; j < mto_type.subByChoices.length; j++) {
            let choice = mto_type.subByChoices[j];
            for (let i = 0; i < choice.price_groups.length; i++) {
              let mtoInfo = {
                is_price_group: 0,
                option_id: choice.option_id,
                price_group_id_or_choice_id: choice.choice_id
              };
              let pg = choice.price_groups[i];
              if (
                choice.retail &&
                choice.retail[i] &&
                pg.old_retail !== choice.retail[i]
              ) {
                let payload = this.getMTOSKURetailPayload(
                  pg,
                  retailHead,
                  ptype.id,
                  false,
                  mtoInfo,
                  choice,
                  i
                );
                if (
                  payload.sku_retail !== null &&
                  payload.sku_retail !== undefined
                ) {
                  retail_promises.push(this.saveMTOSKURetail(payload));
                }
              }
            }
          }
          for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
            let pricegroup = mto_type.subPriceGroups[k];
            for (let i = 0; i < pricegroup.price_groups.length; i++) {
              let mtoInfo = {
                is_price_group: 1,
                option_id: pricegroup.option_id,
                price_group_id_or_choice_id: pricegroup.choice_price_group_id
              };
              let pg = pricegroup.price_groups[i];
              if (
                pricegroup.retail &&
                pricegroup.retail[i] &&
                pg.old_retail !== pricegroup.retail[i]
              ) {
                let payload = this.getMTOSKURetailPayload(
                  pg,
                  retailHead,
                  ptype.id,
                  false,
                  mtoInfo,
                  pricegroup,
                  i
                );
                if (
                  payload.sku_retail !== null &&
                  payload.sku_retail !== undefined
                ) {
                  retail_promises.push(this.saveMTOSKURetail(payload));
                }
              }
            }
          }
        }
      }
      Promise.all(retail_promises)
        .then(() => {
          this.isProcessing = false;
          let date = {},
            month = {};
          this.btnText =
            "Save Retail"; /* changing button text after it save the mto sku retail */
          this.isSaveSuccess = true;
          // this.showSetRetailPanel = false; /* closing side panel after save the retail */
          this.isNewRetailForm = false;
          this.isCopyRetail = false;
          this.getMtoSkuRetailDates(
            moment((retailHead.effective_date)).format("YYYY-MM-DD")
          );
          this.getMtoSkuRetails(
            moment((retailHead.effective_date)).format("YYYY-MM-DD")
          );
          this.resetPriceGroups();
          date.id = moment(retailHead.effective_date).format("DD");
          month.id = moment(retailHead.effective_date).format("M");
          this.selectedYear = 
            moment(retailHead.effective_date).format("Y")
          
          this.deSelectAllMonths();
          this.selectMonth(parseInt(month.id));
          this.generateDateTimeline(parseInt(month.id));
          this.populateRetailTimeLine();
          this.deSelectAllDates();
          this.showRetailForSelectedDate(retailHead.effective_date, null, 200);
          this.selectDate(parseInt(date.id));
          this.retailHead = {};
          this.common.$timeout(() => {
            // this.message = null;
            // this.showSetRetailPanel = false;
          }, 1500);
        })
        .catch(error => {
          this.message = "Error";
        });
    }

    deleteRetailsForADate(date) {
      date = moment(date).format("YYYY-MM-DD");
      if (this.sku_detail.sku_type.toLowerCase() === "mto") {
        this.SkuRetailService.DeleteMtoSKURetailByDate(this.sku_detail.id, date)
          .then(() => {
            // this.deSelectAllDates();
            this.setDate();
            this.getMtoSkuRetailDates();
            this.getMtoSkuRetails();
            // this.showRetailForSelectedDate(
            //   this.retail_dates[this.retail_dates.length - 1]
            // );
            this.disablePreviousButton = true;
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        this.SkuRetailService.DeleteSKURetailByDate(this.sku_detail.id, date)
          .then(() => {
            // this.deSelectAllDates();
            this.setDate();
            this.allYearList = [];
            this.allYearNumbers = []
            this.getSkuRetailDates();
            this.getSkuRetails();
            this.getPackageRetails(date);
            this.selectedYear = this.presentYear.toString();
            // this.showRetailForSelectedDate(
            //   this.retail_dates[this.retail_dates.length - 1]
            // );
            this.disablePreviousButton = true;
          })
          .catch(error => {
            logger.error(error);
          });
        this.common.$timeout(() => {
          angular.element("#copy_retail_icon").focus();
        }, 1000);
      }
    }

    applyCopyActionItem(index, pg, typeData) {
      if (typeData.retail && (typeData.retail[index] || (typeData.retail[index] != undefined && isNaN(typeData.retail[index])))) {
        this.erroemsg_exists = false;
        this.retailErrorMessage = '';
        this.erroemsg_exists = ((typeData.retail[0]?.toString().length > 5 && !typeData.retail[0].toString().includes('.')) || (typeData.retail[1]?.toString().length > 5 && !typeData.retail[1].toString().includes('.')) || (typeData.retail[2]?.toString().length > 5 && !typeData.retail[2].toString().includes('.')) || (typeData.retail[3]?.toString().length > 5 && !typeData.retail[3].toString().includes('.')) || typeData.retail[0]?.toString().split('.')[0].length > 5 || typeData.retail[1]?.toString().split('.')[0].length > 5 || typeData.retail[2]?.toString().split('.')[0].length > 5 || typeData.retail[3]?.toString().split('.')[0].length > 5) ? true : false;
        for (let i = 0; i < this.price_types.length; i++) {
          if (typeData.id == this.price_types[i].id && this.price_types[i].retailErrorMessage) {
            // this.erroemsg_exists = true;
            if (!this.erroemsg_exists) this.price_types[i].retailErrorMessage = null
          }
        }
        if (this.erroemsg_exists) {
          typeData.retailErrorMessage = this.retailErrorMessage = "* Retails Exceeds 99999.99"
        }
        this.isRetailsValid = true;
        if (!pg.retail) {
          // We are settting the retail value to null
          pg.retail = null;
        }
        if (pg.oldRetailValue !== undefined && pg.retail !== undefined && !typeData.retailErrorMessage) {
          typeData.isRetailValueChanged = true;
          if (pg.oldRetailValue !== pg.retail) {
            typeData.isRetailValueChanged = true;
            if (typeData.id == 1 || typeData.id == 2) {
              _.each(this.price_types, type => {
                if (typeData.retail[0] && typeData.id == 2 && this.vendorIdsMap[this.selectedItem.vendor_id].landed_cost) {
                  typeData.gross_margin = ((typeData.retail[0] -
                    this.vendorIdsMap[this.selectedItem.vendor_id].landed_cost)
                    / typeData.retail[0]).toFixed(2);
                  if (type.id == 1 && type.retail[0]) {
                    if (type.percentage_savings) {
                      type.percentage_savings = ((type.retail[0] - typeData.retail[0]) / type.retail[0]).toFixed(2);
                    }
                  }
                }
                if (typeData.retail[0] && typeData.id == 1) {
                  typeData.cross_margin = 0;
                  if (type.id == 2) {
                    if (type.retail && type.retail[0]) {
                      typeData.percentage_savings = ((typeData.retail[0] - type.retail[0]) / typeData.retail[0]).toFixed(2);
                    }
                    else {
                      var saleretail_ar = this.retail?.price_types.filter(x => x.id == 2);
                      if (saleretail_ar?.length) {
                        var saleretail = saleretail_ar[0].retails.filter(x => x.price_class_udd_line_id == 86);
                        typeData.percentage_savings = ((typeData.retail[0] - saleretail[0].retail) / typeData.retail[0]).toFixed(2);
                      }
                    }
                  }
                }
              })
            }
            else {
              typeData.gross_margin = 0;
              typeData.percentage_savings = 0;
            }
          } else {
            typeData.isRetailValueChanged = false;
          }
        } else {
          this.isRetailsValid = false;
          // setTimeout(() => {
          //   typeData.retail[index] = pg.retail;
          //   if (typeData.retail[index] == null) typeData.retail[index] = 0;
          //   this.retailErrorMessage = '';
          // }, 1500);
        }
      }
    }

    applyBasePercentageToOtherClasses(price_groups, typeData) {
      let ref_percent = 0;
      let refClassRetail = 0;
      let priceGroups = typeData.price_groups
        ? typeData.price_groups
        : typeData.sku_price_groups; // change for mto options
      if (typeData.package_price_groups) {
        priceGroups = typeData.package_price_groups;
        for (let j = 0; j < priceGroups.length; j++) {
          let pg = priceGroups[j];
          if (j == 0) {
            // pg["retail"] =
            //   typeData["retail"][j] === 0 ? null : typeData["retail"][j];
            if (this.isCopyRetail) {
              // refClassRetail = this.isCopyRetail ? pg["new_retail"] : typeData["retail"][j];
              refClassRetail = pg["new_retail"];
            } else {
              refClassRetail = pg["retail"];
            }
          } else {
            if (this.isCopyRetail) {
              pg.new_retail = (pg.price_percentage / 100) * refClassRetail;
              pg.new_retail = pg.new_retail === 0 ? null : pg.new_retail;
              pg.copyRule = `<span class='text-info'>(Price Percentage)(${pg.price_percentage}</span> / <span class='text-warning'>100)</span> * <span class='text-success f-700'>${refClassRetail}</span>`;
            } else {
              pg.retail = (pg.price_percentage / 100) * refClassRetail;
              pg.retail = pg.retail === 0 ? null : pg.retail;
              // typeData["retail"][j] = angular.copy(pg.retail);
              typeData.copyRule = `<span class='text-info'>(Price Percentage)(${pg.price_percentage}</span> / <span class='text-warning'>100)</span> * <span class='text-success f-700'>${refClassRetail}</span>`;
            }
          }
        }
      } else {
        for (let j = 0; j < priceGroups.length; j++) {
          let pg = priceGroups[j];
          if (j == 0) {
            pg["retail"] =
              typeData["retail"][j] === 0 ? null : typeData["retail"][j];
            if (this.isCopyRetail) {
              // refClassRetail = this.isCopyRetail ? pg["new_retail"] : typeData["retail"][j];
              refClassRetail = pg["new_retail"];
            } else {
              refClassRetail = typeData["retail"][j];
            }
          } else {
            if (this.isCopyRetail) {
              pg.new_retail = (pg.price_percentage / 100) * refClassRetail;
              pg.new_retail = pg.new_retail === 0 ? null : pg.new_retail;
              pg.copyRule = `<span class='text-info'>(Price Percentage)(${pg.price_percentage}</span> / <span class='text-warning'>100)</span> * <span class='text-success f-700'>${refClassRetail}</span>`;
            } else {
              pg.retail = (pg.price_percentage / 100) * refClassRetail;
              pg.retail = pg.retail === 0 ? null : pg.retail;
              typeData["retail"][j] = pg.retail
                ? angular.copy(Number(pg.retail.toFixed(2)))
                : angular.copy(pg.retail);
              typeData.copyRule = `<span class='text-info'>(Price Percentage)(${pg.price_percentage}</span> / <span class='text-warning'>100)</span> * <span class='text-success f-700'>${refClassRetail}</span>`;
            }
          }
        }
      }
    }

    // Validate if start date value is less than end date
    ValidationFromTo() {
      this.ValidationError = null;
      if (
        parseInt(
          moment(
            this.retailHead.effective_date,
            this.SessionMemory.API.Get("user.preference.date.format")
          ).format("YYYYMMDD")
        ) >=
        parseInt(
          moment(
            this.retailHead.end_date,
            this.SessionMemory.API.Get("user.preference.date.format")
          ).format("YYYYMMDD")
        )
      ) {
        this.ValidationError = "End date should be greater than Start date.";
      }
    }

    applyToRespectiveClasses(pgs, typeData) {
      this.applyBasePercentageToOtherClasses(pgs, typeData);
    }

    applyRetailRulesToRetail(retail) {
      let roundedRetail = retail;
      if (retail !== undefined && retail !== null && retail > 0) {
        this.roundingRules.forEach(roundingRule => {
          let retailValue = String(retail).split(".");
          retailValue[1] =
            retailValue[1] && retailValue[1].length === 1
              ? retailValue[1] + "0"
              : retailValue[1] === undefined
                ? 0
                : retailValue[1];
          let is_valid_rule = false;
          let retailRoundingRule = roundingRule.condition_for_number.replace(
            /N/g,
            Number(retail)
          );
          is_valid_rule = eval(retailRoundingRule);
          if (is_valid_rule) {
            let evalRuleCondition = "";
            let conditionForDecimal = "";
            let conditionForUnit = "";
            // condition check for round_up or round_down or none;
            // none for single retail rounding round_up/round_down will come into picture when increase/decrease needs to be done.
            if (roundingRule.round_up_or_down === "") {
              // if condition_for_decimal format exists, construct conditionForDecimal
              if (roundingRule.condition_for_decimal) {
                conditionForDecimal = roundingRule.condition_for_decimal.replace(
                  /N/g,
                  Number(retailValue[0])
                );
                conditionForDecimal = conditionForDecimal.replace(
                  /D/g,
                  Number(retailValue[1])
                );
                conditionForDecimal = conditionForDecimal.replace("00", "0");
              }
              // if condition_for_unit format exists, construct conditionForUnit
              if (roundingRule.condition_for_unit) {
                conditionForUnit = roundingRule.condition_for_unit.replace(
                  /W/g,
                  Number(
                    String(retailValue[0]).substring(
                      String(retailValue[0]).length - 1,
                      String(retailValue[0]).length
                    )
                  )
                );
              }
            }
            // contribution of "conditionForDecimal" to construct "evalRuleCondition"
            if (conditionForDecimal) {
              evalRuleCondition += `${conditionForDecimal} && `;
            }
            // contribution of "conditionForUnit" to construct "evalRuleCondition"
            if (conditionForUnit) {
              evalRuleCondition += `${conditionForUnit} && `;
            }
            // appending "1" if "evalRuleCondition" present ("&&" appended in previous statements)
            if (evalRuleCondition) {
              evalRuleCondition += "1";
            }
            // evaluating "evalRuleCondition"
            if (eval(evalRuleCondition)) {
              let rule = roundingRule.rule;
              // replace "$" with relevant values
              rule = rule.replace("$.$$", Number(retailValue[0]));
              rule = rule.replace(
                "$",
                Number(
                  String(retailValue[0]).substring(
                    String(retailValue[0]).length - 1,
                    String(retailValue[0]).length
                  )
                )
              );
              rule = rule.split(",");
              try {
                rule[0] = rule[0].replace("concat(", "");
                rule[1] = rule[1].replace(")", "");
                roundedRetail = parseFloat(eval(rule[0]) + "." + rule[1]);
                roundedRetail = roundedRetail >= 0 ? roundedRetail : 0;
              } catch (error) {
                this.logger.error(error);
              }
            }
          }
        });
      }
      return roundedRetail;
    }

    applyRetailRules(groupId) {
      this.fetchRetailRulesByGroup(groupId);
    }

    isRetailRoundingRules() {
      $("#roundingrules").modal("show");
    }

    fetchRetailRuleGroups() {
      this.SkuRetailService.FetchRetailRuleGroups()
        .then(response => {
          this.roundingRuleGroups = response;
          /* Commented for now - "Retail Maintenance Rounding Rule should default to none" */
          // _.filter(response, roundingRule => {
          //   if (roundingRule.is_default === 1) {
          //     this.ruleGroupId = roundingRule.id;
          //   }
          // });
        })
        .catch(error => {
          this.logger.error(error);
        });
    }

    fetchRetailRulesByGroup(groupId) {
      this.rounding_rule_apply_msg = "Rounding rules are applying...";
      this.SkuRetailService.FetchRetailRulesByGroup(groupId)
        .then(response => {
          this.roundingRules = response;
          this.applyRoundingRulesToRetail();
          this.common.$timeout(() => {
            this.rounding_rule_apply_msg = "Rounding rules are applied.";
          }, 1000);
          this.common.$timeout(() => {
            this.rounding_rule_apply_msg = null;
          }, 2500);
          this.isApplied = true;
        })
        .catch(error => {
          this.rounding_rule_apply_msg = "Rules are not applied, Got Error";
          this.common.$timeout(() => {
            this.rounding_rule_apply_msg = null;
          }, 2500);
          this.isApplied = false;
        });
    }

    applyRoundingRulesToRetail() {
      if (!this.showPackageRetailTab) {
        for (let index = 0; index < this.price_types.length; index++) {
          let ptype = this.price_types[index];
          for (let j = 0; j < ptype.sku_price_groups.length; j++) {
            let priceGroup = ptype.sku_price_groups[j];
            if (this.isCopyRetail) {
              priceGroup["new_retail"] = this.applyRetailRulesToRetail(
                priceGroup["new_retail"]
              );
            } else {
              if (ptype.retail) {
                ptype["retail"][j] = this.applyRetailRulesToRetail(
                  ptype["retail"][j]
                );
              }
            }
          }

          if (this.sku_detail.sku_type.toLowerCase() === "mto") {
            for (let i = 0; i < ptype.mto_types_retails.length; i++) {
              let mto_type = ptype.mto_types_retails[i];
              for (let j = 0; j < mto_type.subByChoices.length; j++) {
                let choice = mto_type.subByChoices[j];
                for (let l = 0; l < choice.price_groups.length; l++) {
                  let pg = choice.price_groups[l];
                  if (this.isCopyRetail) {
                    pg["new_retail"] = this.applyRetailRulesToRetail(
                      pg["new_retail"]
                    );
                  } else {
                    if (choice.retail) {
                      choice["retail"][l] = this.applyRetailRulesToRetail(
                        choice["retail"][l]
                      );
                    }
                  }
                }
              }
              for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
                let pricegroup = mto_type.subPriceGroups[k];
                for (let l = 0; l < pricegroup.price_groups.length; l++) {
                  let pg = pricegroup.price_groups[l];
                  if (this.isCopyRetail) {
                    pg["new_retail"] = this.applyRetailRulesToRetail(
                      pg["new_retail"]
                    );
                  } else {
                    if (pricegroup.retail) {
                      pricegroup["retail"][l] = this.applyRetailRulesToRetail(
                        pricegroup["retail"][l]
                      );
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        for (
          let orderAdvisorIndex = 0;
          orderAdvisorIndex < this.OrderAdvisors.length;
          orderAdvisorIndex++
        ) {
          const priceTypes = this.OrderAdvisors[orderAdvisorIndex].price_types;
          for (
            let priceTypeIndex = 0;
            priceTypeIndex < priceTypes.length;
            priceTypeIndex++
          ) {
            const packages = this.OrderAdvisors[orderAdvisorIndex].price_types[
              priceTypeIndex
            ].Packages;
            for (
              let packagesIndex = 0;
              packagesIndex < packages.length;
              packagesIndex++
            ) {
              const priceGroups = this.OrderAdvisors[orderAdvisorIndex]
                .price_types[priceTypeIndex].Packages[packagesIndex]
                .package_price_groups;
              for (
                let priceGroupIndex = 0;
                priceGroupIndex < priceGroups.length;
                priceGroupIndex++
              ) {
                if (priceGroups[priceGroupIndex].retail) {
                  priceGroups[
                    priceGroupIndex
                  ].retail = this.applyRetailRulesToRetail(
                    priceGroups[priceGroupIndex].retail
                  );
                }
              }
            }
          }
        }
      }
    }
    // new implementation save mto retail

    upsertMTOSKURetail(
      effective_date,
      end_date,
      priceGroup,
      pricetypeId,
      priceGroupOrChoice,
      is_price_group,
      reasonId
    ) {
      if (
        priceGroup.old_retail !== priceGroup.retail &&
        priceGroup.retail !== null
      ) {
        let mtoObj = {},
          payload = {};
        if (is_price_group === 2) {
          mtoObj = {
            is_price_group: 2,
            option_id: null,
            price_group_id_or_choice_id: null
          };
        } else if (is_price_group === 0) {
          mtoObj = {
            is_price_group: is_price_group,
            option_id: priceGroupOrChoice.option_id,
            price_group_id_or_choice_id: priceGroupOrChoice.choice_id
          };
        } else if (is_price_group === 1) {
          mtoObj = {
            is_price_group: is_price_group,
            option_id: priceGroupOrChoice.option_id,
            price_group_id_or_choice_id:
              priceGroupOrChoice.choice_price_group_id
          };
        }

        payload["retail_reason_id"] = reasonId;
        payload["price_type_id"] = pricetypeId;
        payload["ref_percent"] = 1;
        payload["status_id"] = 200;
        payload["apply_all_flag"] = 0;
        payload["apply_percent"] = 1;
        payload["sku_id"] = this.skuId;
        payload["sku_retail"] = priceGroup.retail;
        payload["udd_id"] = priceGroup.price_class_udd_id;
        payload["udd_line_id"] = priceGroup.price_class_udd_line_id;
        payload["effective_date"] = moment(effective_date).format("YYYY-MM-DD");
        if (
          !(
            (
              moment(end_date).format("YYYY-MM-DD") &&
              moment(effective_date).format("YYYY-MM-DD") == moment(end_date).format("YYYY-MM-DD")
            ) ||
            !end_date
          )
        ) {
          payload["end_date"] = moment(end_date).format("YYYY-MM-DD");
        }
        angular.extend(payload, mtoObj);
        this.saveMTOSKURetail(payload).then(res => {
          priceGroup.old_retail = priceGroup.retail;
        });
      }
    }

    upsertSKURetail(effective_date, end_date, priceGroup, pricetypeId, reasonId) {
      let payload = {};
      this.invalid_retail = false;
      if ((priceGroup.retail?.toString().length > 5 && !priceGroup.retail?.toString().includes('.')) || priceGroup.retail?.toString().split('.')[0].length > 5) {
        this.invalid_retail = true;
        setTimeout(() => {
          // priceGroup.retail = priceGroup.old_retail;
          this.getSKU();
          this.invalid_retail = false;
        }, 2000);
      }
      else {
        if (
          priceGroup.old_retail !== priceGroup.retail &&
          priceGroup.retail !== null
        ) {
          payload["retail_reason_id"] = reasonId;
          payload["price_type_id"] = pricetypeId;
          payload["ref_percent"] = 1;
          payload["status_id"] = 200;
          payload["apply_all_flag"] = 0;
          payload["apply_percent"] = 1;
          payload["sku_id"] = this.skuId;
          payload["sku_retail"] = priceGroup.retail;
          payload["udd_id"] = priceGroup.price_class_udd_id;
          payload["udd_line_id"] = priceGroup.price_class_udd_line_id;
          payload["effective_date"] = moment(effective_date).format("YYYY-MM-DD");
          if (end_date) {
            payload["end_date"] = moment(end_date).format("YYYY-MM-DD");
          }
          if (payload.sku_retail) {
            this.saveSKURetail(payload).then(res => {
              priceGroup.old_retail = priceGroup.retail;
            });
          }
        }
      }
    }

    applyRetailChange(data) {
      data.retail = data.retail ? Number(data.retail).toFixed(2) : ''
    }

    toggleRetailSidePanel(isPackageRetailFlag, flag, edate) {
      this.isSaveSuccess = false;
      this.getPriceTypes()
        .then(() => {
          // timeout is included to avoid flickkering issue
          this.common.$timeout(() => {
            if (!this.Packages) {
              this.fetchPackages();
            } else {
              this.assignPackagesToPriceTypes(this.Packages);
            }
            this.isParameterSetupForm = true;
            this.isNewRetailForm = false;
            this.isRetailRoundingForm = false;
            this.reviewScreen = false;
            this.showCreateRetailForm = flag;
            this.showCopyRetailForm = false;
            this.retail_error_message = null;
            this.isPackageRetailForm = false;
            this.isApplied = false;
            this.ruleGroupId = "";
            if (isPackageRetailFlag) {
              this.showPackageRetailTab = true;
            } else {
              this.showPackageRetailTab = false;
            }
            if (this.retail_form !== undefined) {
              this.retail_form.$setPristine();
            }
            this.retailHead["effective_date"] = moment(new Date()).format("MM/DD/YYYY");
            this.retailHead["end_date"] = this.$scope.getDateBasedOnFormat(edate);
            if (this.showCreateRetailForm) {
              this.showSetRetailPanel = true;
            } else if (!this.showCreateRetailForm) {
              this.showSetRetailPanel = false;
            }
            this.filterRetailReason();
            this.validateBySkuAndDate(this.retailHead);
          }, 0);
        })
        .catch(() => { });
    }

    focusSetRetail() {
      this.common.$timeout(() => {
        angular.element("#set_retail").focus();
      }, 1000)
    }

    focusCopyRetailField() {
      this.common.$timeout(() => {
        angular.element("#price_type")[0].children[0].childNodes[0].focus();
      }, 1000)
    }

    focusThreedotMenu() {
      this.common.$timeout(() => {
        angular.element("#three_dot_menu").focus();
      }, 1000)
    }

    focusNextRounding() {
      this.common.$timeout(() => {
        angular.element("#rounding_next").focus();
      }, 1000)
    }


    focusPriceChange() {
      this.common.$timeout(() => {
        angular.element("#retail_reason_type").focus();
      }, 1000)
    }

    focusTypeNext() {
      this.common.$timeout(() => {
        angular.element("#delete_btn").focus();
      }, 1000)
    }
    checkIfRetails(isTrue) {
      if (!this.showPackageRetailTab) {
        for (let index = 0; index < this.price_types.length; index++) {
          let ptype = this.price_types[index];
          // check first price type id is selected to set retails for same
          if (this.retailHead.price_type_ids.includes(ptype.id)) {
            if (ptype.retail) {
              // remove key from retail object if value is null
              Object.keys(ptype.retail).forEach(
                key => ptype.retail[key] === null && delete ptype.retail[key]
              );
            }
            let empty_retail = false;
            // if (ptype.retail && Object.values(ptype.retail).indexOf(0) > -1) {
            if (ptype.retailErrorMessage) empty_retail = true
            let validretail = false;
            if (ptype.retail && Object.values(ptype.retail).every((val, i, arr) => isNaN(arr[i]))) validretail = true;
            if (ptype.retail && Object.values(ptype.retail).length && !empty_retail && !validretail) {
              // if atleast one price group retail is set for price type
              this.isRetail = true;
              this.retailErrorMessage = null; /* setting error message null when retail length is there */
              if (this.sku_detail.sku_type.toLowerCase() === "mto") {
                for (let i = 0; i < ptype.mto_types_retails.length; i++) {
                  let mtoType = ptype.mto_types_retails[i];
                  for (let j = 0; j < mtoType.subPriceGroups.length; j++) {
                    let pricegroup = mtoType.subPriceGroups[j];
                    if (pricegroup.retail) {
                      // remove key from retail object if value is null
                      Object.keys(pricegroup.retail).forEach(
                        key =>
                          pricegroup.retail[key] === null &&
                          delete pricegroup.retail[key]
                      );
                    }
                    if (
                      this.isRetail &&
                      (!pricegroup.retail ||
                        !Object.values(pricegroup.retail).length)
                    ) {
                      this.isRetail = false;
                      // break inner loop
                      break;
                    }
                  }

                  for (let j = 0; j < mtoType.subByChoices.length; j++) {
                    let choice = mtoType.subByChoices[j];
                    if (choice.retail) {
                      // remove key from retail object if value is null
                      Object.keys(choice.retail).forEach(
                        key =>
                          choice.retail[key] === null &&
                          delete choice.retail[key]
                      );
                    }

                    if (
                      this.isRetail &&
                      (!choice.retail || !Object.values(choice.retail).length)
                    ) {
                      this.isRetail = false;
                      // break inner loop
                      break;
                    }
                  }

                  if (this.isRetail === false) {
                    // if isRetail is false break oute loop
                    break;
                  }
                }
              }
            } else {
              this.isRetail = false;
              if (empty_retail) {
                this.retailErrorMessage = ptype.retailErrorMessage; /* error message when retail value is invalid */
              }
              else {
                this.retailErrorMessage =
                  "Please enter the retail before proceeding"; /* error message when retail value is not there */
              }
              break;
            }
          }
          // if price type has been selected but retails not set/removed then
          if (
            this.retailHead.price_type_ids.includes(ptype.id) &&
            this.isRetail === false
          ) {
            this.retailErrorMessage =
              "Please enter the retail before proceeding"; /* error message when retail value is not there */
            break;
          }
        }
      } else {
        this.isRetail = false;
        for (
          let orderAdvisorIndex = 0;
          orderAdvisorIndex < this.OrderAdvisors.length;
          orderAdvisorIndex++
        ) {
          const priceTypes = this.OrderAdvisors[orderAdvisorIndex].price_types;
          for (
            let priceTypeIndex = 0;
            priceTypeIndex < priceTypes.length;
            priceTypeIndex++
          ) {
            const packages = this.OrderAdvisors[orderAdvisorIndex].price_types[
              priceTypeIndex
            ].Packages;
            for (
              let packagesIndex = 0;
              packagesIndex < packages.length;
              packagesIndex++
            ) {
              const priceGroups = this.OrderAdvisors[orderAdvisorIndex]
                .price_types[priceTypeIndex].Packages[packagesIndex]
                .package_price_groups;
              for (
                let priceGroupIndex = 0;
                priceGroupIndex < priceGroups.length;
                priceGroupIndex++
              ) {
                if (priceGroups[priceGroupIndex].retail) {
                  this.isRetail = true;
                  break;
                }
              }
              if (this.isRetail) {
                break;
              }
            }
            if (this.isRetail) {
              break;
            }
          }
          if (this.isRetail) {
            break;
          }
        }
        if (!this.isRetail) {
          /* error message when retail value is not there */
          this.retailErrorMessage = "Please enter the retail before proceeding";
        }
      }
      if (this.isRetail === true) {
        this.reviewScreen = false;
        this.isNewRetailForm = false;
        isTrue ||
          this.sku_detail.sku_type.toLowerCase() === "mto" ||
          !this.isPackageRetails ||
          !this.showPackageRetailTab
          ? ((this.isRetailRoundingForm = true),
            (this.isPackageRetailForm = false))
          : ((this.isPackageRetailForm = true),
            (this.isRetailRoundingForm = false));
        this.common.$timeout(() => {
          this.isRetail = undefined;
        }, 3500);
      }
    }

    makePriceChange(flag) {
      let today = moment().format();
      let month =
        this.currentMonth.length === 1
          ? "0" + this.currentMonth
          : this.currentMonth;
      let currentdate =
        this.selectedDate.length === 1
          ? "0" + this.selectedDate
          : this.selectedDate;
      let edate = this.selectedYear + "-" + month + "-" + currentdate;
      if (
        moment()
          .date(this.selectedDate)
          .month(this.currentMonth - 1)
          .year(parseInt(this.selectedYear))
          .isSameOrAfter(today)
      ) {
        this.toggleRetailSidePanel(false, flag, edate);
      }
    }

    toggleCopyRetailSidePanel(flag, date) {
      this.isSaveSuccess = false;
      this.isParameterSetupForm = false;
      this.showCopyRetailForm = true;
      this.isNewRetailForm = false;
      this.isRetailRoundingForm = false;
      this.reviewScreen = false;
      this.retailHead = {};
      if (this.copy_retail_form !== undefined) {
        this.retailHead = {};
        this.copy_retail_form.$setPristine();
      }
      this.price_types = _.filter(this.price_types, price_type => {
        price_type.isChecked = 0;
        return price_type;
      });
      if (this.showCopyRetailForm) {
        this.showSetRetailPanel = true;
        this.message = "";
      } else if (!this.showCreateRetailForm) {
        this.showSetRetailPanel = false;
      }
      this.isCopyRetail = flag;
      this.retailHead.exisiting_retail = date;
    }

    toggleCopyPackageRetailSidePanel(flag, date) {
      this.packageRetailHead = {};
      this.packageRetailHead.exisiting_retail = "";
      this.showCopyPackageRetailForm = true;
      this.ValidationError = null;
      this.priceTypesForPackageRetail(date);
      this.message = "";
      if (this.copy_package_retail_form !== undefined) {
        this.packageRetailHead = {};
        this.copy_package_retail_form.$setPristine();
      }
      this.packageRetailHead.exisiting_retail = date;
      this.common.$timeout(() => {
        angular.element("#price_type")[0].children[0].childNodes[0].focus();
      }, 1000);
    }

    detailPriceType(flag, data) {
      if (flag) {
        $("#detailpricemodal").modal("show");
        this.retailDetails = data;
      } else if (!flag) {
        this.retailDetails = null;
        $("#detailpricemodal").modal("hide");
      }
    }

    validateRetails(retailHead) {
      return new Promise((resolve, reject) => {
        if (
          retailHead &&
          retailHead.price_type_ids &&
          retailHead.effective_date &&
          !this.showPackageRetailTab
        ) {
          this.retail_info_message = null;
          this.retail_error_message = null;
          this.packageretails_exists = false;
          let start_date = moment(
            retailHead.effective_date,
            this.$scope.date_format
          ).format("YYYY-MM-DD");
          let end_dates = moment(
            retailHead.end_date,
            this.$scope.date_format
          ).format("YYYY-MM-DD");
          let payload = {
            skuIds: [],
            mtoSKUIds: [],
            price_type_ids: retailHead.price_type_ids,
            effective_date: start_date,
            end_date: end_dates
          };
          if (this.sku_detail.sku_type.toLowerCase() === "mto") {
            payload["mtoSKUIds"] = [this.skuId];
          } else {
            payload["skuIds"] = [this.skuId];
          }
          this.SkuRetailService.ValidateRetails(payload)
            .then(res => {
              if (res.status === 200) {
                this.resetRetails();
              }
              resolve(res);
            })
            .catch(error => {
              if (error.data.status === 412) {
                this.retail_error_message = error.data.errors;
                this.retail_info_message =
                  "Retails for other price types can be edited inline";
              }
            });
        } else {
          resolve(true);
        }
      });
    }

    validatePackageRetails(retailHead) {
      return new Promise((resolve, reject) => {
        if (
          retailHead &&
          retailHead.price_type_ids && retailHead.price_type_ids.length &&
          retailHead.effective_date &&
          this.showPackageRetailTab
        ) {
          this.packageretails_exists = false;
          this.retail_info_message = null;
          this.retail_error_message = null;
          let start_date = moment(
            retailHead.effective_date,
            this.$scope.date_format
          ).format("YYYY-MM-DD");
          if (start_date === "Invalid date") {
            start_date = "null";
          }
          this.SkuRetailService.ValidatePackageRetailsExistance(
            {
              sku_id: Number(this.skuId),
              effective_date: start_date,
              price_type_ids: retailHead.price_type_ids
            }
          )
            .then(response => {
              resolve(response);
              this.resetPackageRetails();
            })
            .catch(error => {
              if (error.status === 412) {
                this.retail_error_message =
                  "Retail already exist for this date";
                this.retail_info_message =
                  "Retails for other price types can be edited inline";
                this.packageretails_exists = true;
              }
            });
        } else {
          resolve(true);
          this.retail_error_message = null;
          this.retail_info_message = null;

        }
      });
    }

    validateBySkuAndDate(retailHead) {
      return new Promise((resolve, reject) => {
        if (!this.showPackageRetailTab) {
          this.validateRetails(retailHead)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        } else {
          this.validatePackageRetails(retailHead)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        }
      });
    }

    getCopiedRetail(date, pricetypeId) {
      this.SkuRetailService.GetSKURetail(this.skuId, date, pricetypeId).then(
        result => {
          let priceclassmap = {};
          for (let i = 0; i < result.length; i++) {
            let retailSku = result[i];
            if (
              priceclassmap[retailSku.price_class_udd_line_id] === undefined
            ) {
              priceclassmap[retailSku.price_class_udd_line_id] =
                retailSku.retail;
            }
          }

          for (let j = 0; j < this.sku_price_groups.length; j++) {
            let pg = this.clone(this.sku_price_groups[j]);
            if (priceclassmap[pg.price_class_udd_line_id]) {
              pg.retail = priceclassmap[pg.price_class_udd_line_id];
            }
          }
          this.isCopyRetail = false;
          this.isParameterSetupForm = false;
        }
      );
    }

    getCopiedMtoRetail(date, pricetypeId) {
      this.SkuRetailService.GetMtoSKURetail(this.skuId, date, pricetypeId).then(
        result => {
          let retailmap = {};
          for (let i = 0; i < result.length; i++) {
            let retailSku = result[i];
            let key =
              retailSku.is_price_group +
              "_" +
              retailSku.price_group_id_or_choice_id +
              "_" +
              retailSku.price_class_udd_line_id;
            if (retailmap[key] === undefined) {
              retailmap[key] = retailSku.retail;
            }
          }

          for (let j = 0; j < this.sku_price_groups.length; j++) {
            let pg = this.clone(this.sku_price_groups[j]);
            let key = 2 + "_" + null + "_" + pg.price_class_udd_line_id;
            if (retailmap[key]) {
              pg.retail = retailmap[key];
            }
          }
          let mto_types = this.clone(this.option_types);
          for (let i = 0; i < mto_types.length; i++) {
            let mto_type = mto_types[i];
            for (let j = 0; j < mto_type.subByChoices.length; j++) {
              let choice = mto_type.subByChoices[j];
              choice.price_groups = this.clone(this.price_groups);
              for (let m = 0; m < choice.price_groups.length; m++) {
                let pg = this.clone(choice.price_groups[m]);
                let key =
                  0 + "_" + choice.choice_id + "_" + pg.price_class_udd_line_id;
                if (retailmap[key]) {
                  pg.retail = retailmap[key];
                }
              }
            }
            for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
              let pricegroup = mto_type.subPriceGroups[k];
              pricegroup.price_groups = this.clone(this.price_groups);
              for (let m = 0; m < pricegroup.price_groups.length; m++) {
                let pg = this.clone(pricegroup.price_groups[m]);
                let key =
                  1 +
                  "_" +
                  pricegroup.choice_price_group_id +
                  "_" +
                  pg.price_class_udd_line_id;
                if (retailmap[key]) {
                  pg.retail = retailmap[key];
                }
              }
            }
          }
          this.mto_types_retails = mto_types;
          this.isCopyRetail = false;
          this.isParameterSetupForm = false;
        }
      );
    }

    copyMTORetail(copyRetailObject) {
      this.SkuRetailService.DuplicateMTOSKURetail(copyRetailObject)
        .then(() => {
          let date = {};
          let month = {};
          this.message = "Retails are copied";
          this.getMtoSkuRetailDates(
            moment((copyRetailObject.newdate)).format("YYYY-MM-DD")
          );
          this.getMtoSkuRetails(
            moment((copyRetailObject.newdate)).format("YYYY-MM-DD")
          );
          this.resetPriceGroups();
          // let index = this.dates.findIndex(
          //   date =>
          //     moment((copyRetailObject.newdate)).format(
          //       "YYYY-MM-DD"
          //     ) === moment((date.fulldate)).format("YYYY-MM-DD")
          // );
          // this.deSelectAllDates();
          // this.dates[index] !== undefined
          //   ? (this.dates[index]["haveRetail"] = true)
          //   : null;
          // this.dates[index] !== undefined
          //   ? (this.dates[index]["selected"] = true)
          //   : null;
          // this.common.$timeout(() => {
          //   this.dates[index] !== undefined
          //     ? this.populateRetailForSelectedDate(this.dates[index])
          //     : null;
          // }, 0);

          // let date = {};
          // let month = {};
          // date.id = moment(copyRetailObject.newdate).format("DD");
          // month.id = moment(copyRetailObject.newdate).format("M");
          // this.selectedYear = parseInt(moment(copyRetailObject.newdate).format("Y"));
          // this.deSelectAllMonths();
          // this.selectMonth(parseInt(month.id));
          // this.generateDateTimeline(month.id);
          // this.populateRetailTimeLine();
          // this.deSelectAllDates();
          // this.populateRetailForSelectedDate(copyRetailObject.newdate)
          // this.showRetailForSelectedDate(copyRetailObject.newdate);
          // this.selectDate(parseInt(date.id));
          copyRetailObject.effective_date = moment(
            copyRetailObject.newdate
          ).format("YYYYMMDD");

          date.id = moment(copyRetailObject.newdate).format("DD");
          month.id = moment(copyRetailObject.newdate).format("M");
          this.selectedYear = moment(copyRetailObject.newdate).format("Y")
          this.deSelectAllMonths();
          this.selectMonth(parseInt(month.id));
          this.generateDateTimeline(parseInt(month.id));
          this.populateRetailTimeLine();
          this.deSelectAllDates();
          this.showRetailForSelectedDate(copyRetailObject.newdate);
          this.selectDate(parseInt(date.id));

          this.getCopiedMtoRetail(
            copyRetailObject.newdate,
            copyRetailObject.price_type_id
          );
          this.common.$timeout(() => {
            this.retail_error_message = null;
            this.message = null;
            this.isParameterSetupForm = false;
            this.showCopyRetailForm = false;
            this.showSetRetailPanel = false;
          }, 1500);
        })
        .catch(error => {
          this.retail_error_message =
            "Retails already exists for the selected date.";
          this.logger.error(error);
        });
    }

    copySKURetail(copyRetailObject) {
      this.SkuRetailService.DuplicateSKURetail(copyRetailObject)
        .then((res) => {
          let date = {};
          let month = {};
          // this.message = "Retails are copied";
          this.isSaveSuccess = true;
          this.getSkuRetailDates(
            moment((copyRetailObject.newdate)).format("YYYY-MM-DD")
          );
          this.getSkuRetails(
            moment((copyRetailObject.newdate)).format("YYYY-MM-DD")
          );

          this.resetPriceGroups();
          copyRetailObject.effective_date = moment(
            copyRetailObject.newdate
          ).format("YYYY-MM-DD");
          date.id = moment(copyRetailObject.newdate).format("DD");
          month.id = moment(copyRetailObject.newdate).format("M");
          this.selectedYear = moment(copyRetailObject.newdate).format("Y")
          this.deSelectAllMonths();
          this.selectMonth(parseInt(month.id));
          this.generateDateTimeline(parseInt(month.id));
          this.populateRetailTimeLine();
          this.deSelectAllDates();
          this.showRetailForSelectedDate(copyRetailObject.newdate);
          this.selectDate(parseInt(date.id));
          this.getPackageRetails(date);
          this.getCopiedRetail(
            copyRetailObject.newdate,
            copyRetailObject.price_type_id
          );
          this.common.$timeout(() => {
            this.retail_error_message = null;
            this.message = null;
            this.isParameterSetupForm = false;
            this.showCopyRetailForm = false;
          }, 1500);
        })
        .catch(error => {
          this.retail_error_message =
            "Retails already exists for the selected date.";
          this.logger.error(error);
        });
    }

    // get pricetypes using skuId and effective_date
    getPriceTypesBySkuAndDate(skuId, effective_date) {
      let date = moment(effective_date).format("YYYY-MM-DD");
      this.sku_retail_price_type = [];
      // get mtosku pricetypes using skuId and effective_date
      if (this.sku_detail.sku_type.toLowerCase() === "mto") {
        this.SkuRetailService.GetMtoSkuPriceTypesByDate(skuId, date)
          .then(res => {
            for (let i = 0; i < res.length; i++) {
              // Assigning response to variable
              this.sku_retail_price_type[i] = {
                // get the price type names using price_type_id
                name: this.priceTypeMap[res[i].price_type_id]["name"],
                id: res[i].price_type_id
              };
            }
          })
          .catch(error => {
            this.logger.error(error);
          });
      } else {
        this.SkuRetailService.GetSkuPriceTypesByDate(skuId, date)
          .then(res => {
            // Assigning response to variable
            for (let i = 0; i < res.length; i++) {
              this.sku_retail_price_type[i] = {
                // get the price type names using price_type_id
                name: this.priceTypeMap[res[i].price_type_id]["name"],
                id: res[i].price_type_id
              };
            }
          })
          .catch(error => {
            this.logger.error(error);
          });
      }
    }

    // get pricetypes using skuId and effective_date
    priceTypesForPackageRetail(effective_date) {
      let date = moment(effective_date).format("YYYY-MM-DD");
      this.package_retail_price_type = [];
      this.SkuRetailService.GetSkuPriceTypesForPackageRetail(this.skuId, date)
        .then(res => {
          // Assigning response to variable
          for (let i = 0; i < res.length; i++) {
            this.package_retail_price_type[i] = {
              // get the price type names using price_type_id
              name: this.priceTypeMap[res[i].price_type_id]["name"],
              id: res[i].price_type_id
            };
          }
        })
        .catch(error => {
          this.logger.error(error);
        });
    }

    // copy package retails
    copyPackageRetail() {
      let packageRetailHead = angular.copy(this.packageRetailHead);
      this.getSKUImage();
      packageRetailHead["skuIds"] = [this.skuId];
      packageRetailHead.effective_date = moment(
        packageRetailHead.effective_date,
        this.$scope.date_format
      ).format("YYYY-MM-DD");
      for (let i = 0; i < this.copyPackagePriceGroupIds.length; i++) {
        packageRetailHead.price_type_id = this.copyPackagePriceGroupIds[i];
        this.packageRetailHead.price_type_id = this.copyPackagePriceGroupIds[i];
        this.message = "Package Retails are copying....";
        this.setCreateOrCopyTemplateHTML(packageRetailHead);
        let endDate =
          this.packageRetailHead.reason_type_id === 2
            ? moment(this.packageRetailHead.end_date).format("YYYY-MM-DD")
            : null;
        // this.$scope.$apply();
        let price_class_udd_line_id = null,
          price_class_udd_id = null;
        let percentNumber = 0,
          price_percentage = 0,
          method = null;
        if (
          this.packageRetailHead &&
          this.packageRetailHead.applyTo &&
          this.packageRetailHead.applyTo.price_class_udd_line_id
        ) {
          price_class_udd_id = this.packageRetailHead.applyTo.price_class_udd_id;
          price_class_udd_line_id = this.packageRetailHead.applyTo
            .price_class_udd_line_id;
          price_percentage = this.packageRetailHead.applyTo.price_percentage;
        }
        percentNumber = this.packageRetailHead.percentNumber
          ? this.packageRetailHead.percentNumber
          : 0;
        method = this.packageRetailHead.method ? this.packageRetailHead.method : "inc";
        let copyPackageRetailObject = {
          sku_id: parseInt(this.skuId),
          price_type_id: this.copyPackagePriceGroupIds[i],
          retail_reason_id: this.packageRetailHead.reason_id,
          price_class_udd_id: price_class_udd_id,
          price_class_udd_line_id: price_class_udd_line_id,
          price_classification_percentage: price_percentage,
          percent_change_number: percentNumber,
          method: method,
          end_date: endDate,
          olddate: moment(this.packageRetailHead.exisiting_retail).format(
            "YYYY-MM-DD"
          ),
          newdate: moment(
            this.packageRetailHead.effective_date,
            this.$scope.date_format
          ).format("YYYY-MM-DD"),
          rule_group_id: this.packageRetailHead.rule_group_id || null
        };
        this.copySKUPackageRetail(copyPackageRetailObject);
      }
    }

    copySKUPackageRetail(copyPackageRetailObject) {
      if (copyPackageRetailObject.olddate === copyPackageRetailObject.newdate) {
        this.message = null;
        this.retail_error_message =
          "Retails already exists for the selected date.";
        this.common.$timeout(() => {
          this.retail_error_message = null;
          this.packageRetailHead = {};
        }, 2500);
      } else {
        this.SkuRetailService.DuplicateSKUPackageRetail(copyPackageRetailObject)
          .then(result => {
            let date = {};
            let month = {};
            this.message = "Package Retails are copied";
            this.resetPriceGroups();
            copyPackageRetailObject.effective_date = moment(
              copyPackageRetailObject.newdate
            ).format("YYYY-MM-DD");
            date.id = moment(copyPackageRetailObject.newdate).format("DD");
            month.id = moment(copyPackageRetailObject.newdate).format("M");
            this.selectedYear = 
              moment(copyPackageRetailObject.newdate).format("Y")
            
            this.deSelectAllMonths();
            this.selectMonth(parseInt(month.id));
            this.generateDateTimeline(parseInt(month.id));
            this.populateRetailTimeLine();
            this.populateRetailForSelectedDate(copyPackageRetailObject.newdate)
            this.getPackageRetails(copyPackageRetailObject.newdate);
            this.deSelectAllDates();
            this.selectDate(parseInt(date.id));
            this.common.$timeout(() => {
              this.showCopyPackageRetailForm = false;
              this.retail_error_message = null;
              this.message = null;
              this.isParameterSetupForm = false;
              this.showCopyRetailForm = false;
              this.showSetRetailPanel = false;
              angular.element("#copy_package_icon").focus();
            }, 1500);
          })
          .catch(error => {
            this.retail_error_message =
              "Retails already exists for the selected date.";
            this.logger.error(error);
          });
      }
    }

    focusCopyPackageIcon() {
      this.common.$timeout(() => {
        angular.element("#copy_package_icon").focus();
      }, 1500);
    }

    copyPackageRetailToPriceTypes() {
      this.copyPackagePriceGroupIds = angular.copy(this.packageRetailHead.price_type_ids);
    }

    copyRetailToPriceTypes() {
      this.copyPriceGroupIds = angular.copy(this.retailHead.price_type_ids);
    }

    copyRetail() {
      let retailHead = angular.copy(this.retailHead);
      this.getSKUImage();
      if (this.sku_detail.sku_type.toLowerCase() === "mto") {
        retailHead["mtoSKUIds"] = [this.skuId];
      } else {
        retailHead["skuIds"] = [this.skuId];
      }
      retailHead.effective_date = moment(
        retailHead.effective_date,
        this.$scope.date_format
      ).format("YYYY-MM-DD");
      this.SkuRetailService.ValidateRetailsByDate(retailHead)
        .then(() => {
          for (let i = 0; i < this.copyPriceGroupIds.length; i++) {
            retailHead.price_type_id = this.copyPriceGroupIds[i];
            this.retailHead.price_type_id = this.copyPriceGroupIds[i];
            this.message = "Retails are copying....";
            this.setCreateOrCopyTemplateHTML(retailHead);
            let endDate =
              this.retailHead.reason_type_id === 2
                ? moment(this.retailHead.end_date).format("YYYY-MM-DD")
                : null;
            // this.$scope.$apply();
            let price_class_udd_line_id = null,
              price_class_udd_id = null;
            let percentNumber = 0,
              price_percentage = 0,
              method = null;
            if (
              this.retailHead &&
              this.retailHead.applyTo &&
              this.retailHead.applyTo.price_class_udd_line_id
            ) {
              price_class_udd_id = this.retailHead.applyTo.price_class_udd_id;
              price_class_udd_line_id = this.retailHead.applyTo
                .price_class_udd_line_id;
              price_percentage = this.retailHead.applyTo.price_percentage;
            }
            percentNumber = this.retailHead.percentNumber
              ? this.retailHead.percentNumber
              : 0;
            method = this.retailHead.method ? this.retailHead.method : "inc";
            let copyRetailObject = {
              sku_id: parseInt(this.skuId),
              price_type_id: this.copyPriceGroupIds[i],
              retail_reason_id: this.retailHead.reason_id,
              price_class_udd_id: price_class_udd_id,
              price_class_udd_line_id: price_class_udd_line_id,
              price_classification_percentage: price_percentage,
              percent_change_number: percentNumber,
              method: method,
              end_date: endDate,
              olddate: moment(this.retailHead.exisiting_retail).format(
                "YYYY-MM-DD"
              ),
              newdate: moment(
                this.retailHead.effective_date,
                this.$scope.date_format
              ).format("YYYY-MM-DD"),
              rule_group_id: this.retailHead.rule_group_id || null
            };
            if (this.sku_detail.sku_type.toLowerCase() === "mto") {
              this.copyMTORetail(copyRetailObject);
            } else {
              this.copySKURetail(copyRetailObject);
            }
          }
        })
        .catch(error => {
          this.retail_error_message = error.data.errors;
          this.isCopyRetail = false;
          this.isNewRetailForm = false;
          this.isRetailRoundingForm = false;
          this.reviewScreen = false;
          this.message = null;
          this.common.$timeout(() => {
            this.retailHead.effective_date = null;
            this.retail_error_message = null;
            this.isParameterSetupForm = false;
            angular.element("#retail_change_reason_type").focus();
          }, 3000);
          this.common.$timeout(() => {
            angular.element("#copy_retail_icon").focus();
          }, 1000);
        });
    }

    deletePriceType(type) {
      this.price_types.map(obj => {
        (obj.id == type.id) && (obj.is_default = 0, obj.retail = undefined, obj.copyRule = null)
      })
      this.retailHead.price_type_ids = this.retailHead.price_type_ids.filter(item => item !== type.id);
    }

    deletePackagePriceType(type, orderAdvisor) {
      this.price_types.map(obj => {
        (obj.id == type.id) && (obj.is_default = 0, obj.retail = undefined, obj.copyRule = null)
      })
      orderAdvisor.price_types.map(obj => {
        (obj.id == type.id) && (obj.is_default = 0, obj.retail = undefined, obj.copyRule = null)
      })
      this.retailHead.price_type_ids = this.retailHead.price_type_ids.filter(item => item !== type.id);
    }

    focusDoneCopyRetail() {
      this.common.$timeout(() => {
        angular.element("#done_btn").focus();
      }, 1000);
    }

    createDefaultMTORetailForm() {
      let mto_types = this.option_types;
      for (let i = 0; i < mto_types.length; i++) {
        let mto_type = mto_types[i];
        for (let j = 0; j < mto_type.subByChoices.length; j++) {
          let choice = mto_type.subByChoices[j];
          choice.price_groups = this.clone(this.sku_price_groups);
        }
        for (let k = 0; k < mto_type.subPriceGroups.length; k++) {
          let pricegroup = mto_type.subPriceGroups[k];
          pricegroup.price_groups = this.clone(this.sku_price_groups);
        }
      }
      this.mto_types_retails = mto_types;
      // push mto types list for each price type individually to use in create form ngRepeat
      for (let i = 0; i < this.price_types.length; i++) {
        this.price_types[i].mto_types_retails = this.clone(mto_types);
      }
    }

    createPriceChange() {
      var errorretail = this.price_types.filter(val => val.retailErrorMessage);
      if (!errorretail?.length) this.retailErrorMessage = null;
      this.message = null;
      let retailHead = this.retailHead;
      if (!this.packageretails_exists) {
        this.validateRetails(retailHead)
          .then(() => {
            this.setCreateOrCopyTemplateHTML(retailHead);
            !this.showPackageRetailTab
              ? (this.isNewRetailForm = true)
              : (this.isPackageRetailForm = true);
            this.isCopyRetail = false;
            this.isParameterSetupForm = false;
            this.common.$timeout(() => {
              for (let i = 0; i < this.price_types.length; i++) {
                this.price_types[i].sku_price_groups = this.sku_price_groups;
              }
            }, 0);
            this.showPricetypes = true;
            if (this.sku_detail.sku_type.toLowerCase() === "mto") {
              this.createDefaultMTORetailForm();
            }
            this.getSKUImage();
            this.$scope.$apply();
          })
          .catch(() => {
            this.isCopyRetail = false;
            this.isNewRetailForm = false;
            this.isPackageRetailForm = false;
            this.isRetailRoundingForm = false;
            this.reviewScreen = false;
          });
      }
      else {
        this.validatePackageRetails(retailHead)
      }
    }

    resetRetails() {
      for (let i = 0; i < this.sku_price_groups.length; i++) {
        this.sku_price_groups[i]["retail"] = null;
        this.sku_price_groups[i]["copyRule"] = null;
      }
    }

    resetPackageRetails() {
      for (
        let orderAdvisorIndex = 0;
        orderAdvisorIndex < this.OrderAdvisors.length;
        orderAdvisorIndex++
      ) {
        const priceTypes = this.OrderAdvisors[orderAdvisorIndex].price_types;
        for (
          let priceTypeIndex = 0;
          priceTypeIndex < priceTypes.length;
          priceTypeIndex++
        ) {
          const packages = this.OrderAdvisors[orderAdvisorIndex].price_types[
            priceTypeIndex
          ].Packages;
          for (
            let packagesIndex = 0;
            packagesIndex < packages.length;
            packagesIndex++
          ) {
            const priceGroups = this.OrderAdvisors[orderAdvisorIndex]
              .price_types[priceTypeIndex].Packages[packagesIndex]
              .package_price_groups;
            for (
              let priceGroupIndex = 0;
              priceGroupIndex < priceGroups.length;
              priceGroupIndex++
            ) {
              priceGroups[priceGroupIndex].retail = null
            }
            if (this.isRetail) {
            }
          }
          if (this.isRetail) {
          }
        }
        if (this.isRetail) {
        }
      }
    }

    setValidationRules() {
      this.valdr.addConstraints({
        "RULES-SKU-RETAIL": {
          effective_date: {
            end_date: {
              message:
                "Retail(s) cannot be maintained/updated! Start date is less than or equal to current date"
            },
            required: {
              message: "Retail date is required."
            }
          },
          end_date: {
            required: {
              message: "End date is required."
            }
          }
        }
      });
    }

    setCreateOrCopyTemplateHTML(retailHead) {
      this.retail_effective_date = retailHead.effective_date;
      this.retail_end_date = retailHead.end_date;
    }

    assignPackagesToPriceTypes(packageList) {
      if (this.price_types && this.price_types.length) {
        for (let j = 0; j < this.price_types.length; j++) {
          this.price_types[j].Packages = [];
          let packages = this.clone(packageList);
          _.each(packages, pg => {
            pg.uniqueId = pg.id + "_" + this.price_types[j].id;
            _.each(pg.package_price_groups, ppg => {
              ppg.uniqueId =
                pg.id +
                "_" +
                ppg.price_class_udd_line_id +
                "_" +
                this.price_types[j].id;
            });
            this.price_types[j].Packages.push(pg);
          });
        }
      }
    }

    fetchPackages() {
      this.SkuRetailService.FetchPackages().then(response => {
        // For each package assign package price groups and set retail value to null initially
        this.Packages = this.clone(response.data);
        for (let i = 0; i < this.Packages.length; i++) {
          _.each(this.package_price_groups, pg => {
            pg.package_id = this.Packages[i].id;
          });
          this.Packages[i].package_price_groups = this.clone(this.package_price_groups);
        }
        this.assignPackagesToPriceTypes(this.Packages)
        if (this.sku_detail && this.sku_detail.sku_type && this.sku_detail.sku_type.toLowerCase() === "stock") {
          this.getPackageRetails(
            this.selectedFullDate && this.selectedFullDate.fulldate
              ? moment(this.selectedFullDate.fulldate, "YYYY-MM-DD", true).isValid() ? this.selectedFullDate.fulldate : moment(new Date(this.selectedFullDate.fulldate)).format("YYYY-MM-DD")
              : null
          );
        }
      });
    }

    saveBasePackageSKURetail(obj) {
      return new Promise((resolve, reject) => {
        this.SkuRetailService.SaveBasePackageSKURetail(obj)
          .then(() => {
            resolve(true);
          })
          .catch(error => {
            this.logger.error(error);
          });
      });
    }

    updateBasePackageSKURetail(obj) {
      return new Promise((resolve, reject) => {
        this.SkuRetailService.UpdateBasePackageSKURetail(obj)
          .then(() => {
            resolve(true);
          })
          .catch(error => {
            this.logger.error(error);
          });
      });
    }

    deleteBasePackageSKURetail(id) {
      return new Promise((resolve, reject) => {
        this.SkuRetailService.DeleteBasePackageSKURetail(id)
          .then(() => {
            resolve(true);
          })
          .catch(error => {
            this.logger.error(error);
          });
      });
    }

    upsertPackageRetails(
      retail_pg,
      price_type_id,
      package_id,
      order_advisor_id,
      effective_date,
      end_date
    ) {
      if (
        retail_pg &&
        (retail_pg.retail !== null || retail_pg.old_retail !== null) &&
        (retail_pg.retail >= 0 || retail_pg.old_retail >= 0)
      ) {
        let payload = {};
        payload["retail_reason_id"] = 1;
        payload["price_type_id"] = price_type_id;
        payload["ref_percent"] = 1;
        payload["status_id"] = 200;
        payload["apply_all_flag"] = 0;
        payload["apply_percent"] = 1;
        payload["sku_id"] = parseInt(this.skuId);
        payload["package_id"] = parseInt(package_id);
        payload["order_advisor_id"] = parseInt(order_advisor_id);
        if (this.isCopyRetail) {
          payload["retail"] = retail_pg.new_retail;
        } else {
          payload["retail"] = retail_pg.retail;
        }
        payload["price_class_udd_id"] = retail_pg.price_class_udd_id;
        payload["price_class_udd_line_id"] = retail_pg.price_class_udd_line_id;
        payload["effective_date"] =
          moment(
            effective_date ? new Date(effective_date) : new Date(this.selectedFullDate.fulldate)
          ).format("YYYY-MM-DD");
        if (end_date) {
          payload["end_date"] = moment(new Date(end_date)).format("YYYY-MM-DD");
        }
        if (retail_pg.retail_id) {
          if (Number.isNaN(Number(retail_pg.retail))) { // check for NaN
            this.deleteBasePackageSKURetail(retail_pg.retail_id)
              .then(() => {
                delete retail_pg.retail_id;
              })
              .catch(() => { });
          } else {
            payload.retail_id = retail_pg.retail_id;
            this.updateBasePackageSKURetail(payload).then(() => { }).catch(() => { });
          }
        } else {
          this.SkuRetailService.SaveBasePackageSKURetail(payload)
            .then(result => {
              retail_pg.retail_id = result.data.id;
            })
            .catch(error => {
              this.logger.error(error);
            });
        }
      }
    }

    // Function to insert base package retails for a sku
    saveBasePackageRetails() {
      let isRetailPriceGroup = false;
      let retail_promises = [];
      this.message = "Retails are saving....";
      let retailHead = this.retailHead;
      for (let l = 0; l < this.OrderAdvisors.length; l++) {
        for (let k = 0; k < this.OrderAdvisors[l].price_types.length; k++) {
          if (
            this.retailHead.price_type_ids.includes(
              this.OrderAdvisors[l].price_types[k].id
            )
          ) {
            _.each(this.OrderAdvisors[l].price_types[k].Packages, pack => {
              if (
                this.OrderAdvisors[l].included_packages.includes(
                  pack.id
                )
              ) {
                for (
                  let i = 0;
                  i <
                  pack.package_price_groups.length;
                  i++
                ) {
                  let pg = pack
                    .package_price_groups[i];
                  // if (
                  //   this.OrderAdvisors[l].price_types[k].Packages[j]
                  //     .is_included ||
                  //   (pg.retail && pg.retail !== null)
                  // ) {
                  if (this.OrderAdvisors[l].isPachagesIncluded == true) {
                    let payload = {};
                    payload["order_advisor_id"] = this.OrderAdvisors[l].id;
                    payload["retail_reason_id"] = retailHead.reason_id;
                    payload["is_included"] = pack.is_included == 1
                      ? 1
                      : 0;
                    payload["price_type_id"] = this.OrderAdvisors[l].price_types[
                      k
                    ].id;
                    payload["ref_percent"] = 1;
                    payload["status_id"] = 200;
                    payload["apply_all_flag"] = 0;
                    payload["apply_percent"] = 1;
                    payload["sku_id"] = parseInt(this.skuId);
                    payload["package_id"] = parseInt(
                      pack.id
                    );
                    if (this.isCopyRetail) {
                      payload["retail"] = pg.new_retail;
                    } else {
                      payload["retail"] = pack.is_included
                        ? "0.00"
                        : pg.retail;
                    }
                    payload["price_class_udd_id"] = pg.price_class_udd_id;
                    payload["price_class_udd_line_id"] =
                      pg.price_class_udd_line_id;
                    if (retailHead.end_date) {
                      payload["end_date"] = moment(retailHead.end_date).format("YYYY-MM-DD");
                    } else {
                      payload["end_date"] = null;
                    }
                    if (!isRetailPriceGroup) {
                      payload["effective_date"] = moment(
                        retailHead.effective_date,
                        this.$scope.date_format
                      ).format("YYYY-MM-DD");
                    } else {
                      payload["effective_date"] = retailHead.effective_date;
                    }
                    if (payload.retail) {
                      retail_promises.push(this.saveBasePackageSKURetail(payload));
                    }
                  }
                }
              }
            })
          }
        }
      }
      Promise.all(retail_promises)
        .then(() => {
          this.message = "Package Retails successfully created.";
          this.isNewRetailForm = false;
          this.isCopyRetail = false;
          // this.getSkuRetails(
          //   moment((retailHead.effective_date)).format("YYYY-MM-DD")
          // );
          // this.getSkuRetailDates(retailHead.effective_date);
          // this.resetPriceGroups();
          this.getPackageRetails(moment(new Date(retailHead.effective_date)).format("YYYY-MM-DD"));
          this.common.$timeout(() => {
            this.message = null;
            this.isSaveSuccess = true;
            this.btnText = "Save Retail";
            this.isSaveSuccess = true;
            this.retailHead = {};
            // this.showSetRetailPanel = false;
          }, 0);
          this.common.$timeout(() => {
            this.isProcessing = false;
            angular.element("#done_btn").focus();
          }, 1000);
        })
        .catch(error => {
          this.message = "Error";
        });
    }

    goBack() {
      // if params contains return url, then redirect to that
      if (this.$scope.needToReturnSkuView) {
        this.gobackToSKU();
      } else if (!this.$state.params.returnUrl) {
        window.history.back();
      } else {
        if (this.sku_detail.id) {
          this.$state.go(this.$state.params.returnUrl, {
            item_id: this.sku_detail.item_id,
            id: this.sku_detail.id,
            skutype: this.sku_detail.sku_type.toLowerCase(),
            subtype: this.sku_detail.sku_sub_type.toLowerCase(),
            navigateTo: "publishChanges",
          });
        }
      }
    }
  }
  angular
    .module("rc.prime.sku.retail")
    .controller("SkuRetailController", SkuRetailController);
})();

(function () {
  "use strict";

  angular.module("calculus").directive("modalDir", modalDir);

  modalDir.$inject = ["$window"];

  function modalDir($window) {
    var directive = {
      link: link,
      restrict: "EA"
    };
    return directive;

    function link(scope, element, attrs) {
      $(element).on("hidden.bs.modal", function () {
        scope.skuRetailCtrl.retailHead = {};
      });
    }
  }
})();

(function () {
  "use strict";

  angular.module("calculus").directive("scroll", directive);

  directive.$inject = ["$window"];

  function directive($window) {
    var directive = {
      link: link,
      restrict: "EA"
    };
    return directive;

    function link(scope, element, attrs) {
      angular.element($window).bind("scroll", function () {
        if (this.pageYOffset > 105) {
          scope.skuRetailCtrl.boolChangeClass = true;
        } else {
          scope.skuRetailCtrl.boolChangeClass = false;
        }
        scope.$apply();
      });
    }
  }
})();

(function () {
  "use strict";

  angular.module("calculus").filter("datefilter", datefilter);

  function datefilter($sce) {
    return datefilterFn;

    function datefilterFn(input, arg1) {
      let date = Number(moment(new Date()).format("YYYYMMDD"));
      let newdate = Number(moment(input).format("YYYYMMDD"));
      if (date < newdate) {
        input = `<span class="future-date">${input}</span>`;
      } else if (date > newdate) {
        input = `<span class="past-date">${input}</span>`;
      } else {
        input = `<span class="current-date-retail">${input}</span>`;
      }
      return $sce.trustAsHtml(input);
    }
  }
})();
