(() => {
  angular
    .module("rc.prime.orderadvisor")
    .controller("OrderAdvisorController", OrderAdvisorController);

  OrderAdvisorController.$inject = [
    "$scope",
    "$stateParams",
    "$state",
    "common",
    "valdr",
    "StatusCodes",
    "OrderAdvisorServices"
  ];

  function OrderAdvisorController(
    $scope,
    $stateParams,
    $state,
    common,
    valdr,
    StatusCodes,
    OrderAdvisorServices
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.valdr = valdr;
    this.StatusCodes = StatusCodes;
    this.OrderAdvisorService = OrderAdvisorServices.OrderAdvisor;
    //cloning success message panel
    this.isCloneSaveSuccess = false;
    this.logger = this.common.Logger.getInstance("OrderAdvisorController");

    //Unique Identification number for attribute header entity, set in entity table
    this.uuid = "120";

    //Activation method to initialize order advisor type controller
    this.Activate = () => {
      //Fetch all order advisor types
      this.FetchOrderAdvisors();
      //Fetch the view/create/update/delete permission by user
      this.$scope.getAccessPermissions(this.uuid);
      //Fetch statuses
      this.FetchStatuses();
      //Initialize validation rules
      this.AddValidationRules();
    };

    this.InitializeSelectizeVariables = () => {
      //Configure location type select object
      this.selectOrderAdvisorTypes = {
        valueField: "id",
        labelField: "description",
        searchField: ["description"],
        sortField: "description",
        //Space is concatinated so that end of the text does not cut off
        placeholder: "Select Sale Order Advisor Type" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        //Adding the data to the options, so as to show the data in the dropdown
        options: this.OrderAdvisorTypes,
        render: {
          option: (data, escape) => {
            if (data.status_id === 500) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                "</span>" +
                "<span>" +
                "</span>" +
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
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                "</span>" +
                "</span>" +
                "<span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(this.statusMap[data.status_id].description) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          //The selected option is sent to the item object
          item: (data, escape) => {
            this.OrderAdvisor.adviser_type = data.description;
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.description) +
              "</span>" +
              "-" +
              '<span class="m-l-5 f-12 text-muted">' +
              escape(this.statusMap[data.status_id].description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    // hide success message of cloning
    this.closeForm = () => {
      this.isCloneSaveSuccess = false;
      this.isShowClonePanel = false;
    };

    //Fetch all the order advisor types
    this.FetchOrderAdvisors = refresh => {
      this.isLoaded = false;
      if (refresh !== undefined) {
        this.totalRecords = "";
        this.totalTimeText = "";
        this.isRefreshing = true;
        this.refreshTableText = "Table is refreshing...";
      }
      this.OrderAdvisorService.OrderAdvisor.FetchAll()
        .then(response => {
          this.OrderAdvisors = response.data;
          //Get data from map, based on selected type udd id and current state
          if (
            this.$stateParams.id &&
            this.$state.current.name.includes(".update")
          ) {
            //Find the attribute by index and set it with updated value
            let index = this.OrderAdvisors.findIndex(
              typeudd => typeudd.id === parseInt(this.$stateParams.id)
            );
            this.OrderAdvisor = this.OrderAdvisors[index];
          }
          this.rowsCount = response.data.length;
          this.isLoaded = true;
          let time_taken = response.data.time_taken;
          //Check if view permission for attributes is true or false and set the flag value accordingly
          this.OrderAdvisors.status === 404
            ? (this.isViewAuthorized = false)
            : (this.isViewAuthorized = true);
          if (refresh !== undefined) {
            this.totalRecords = response.data.length;
            this.totalRecordsText = "record(s) loaded in approximately";
            this.totalTimeText =
              "<strong>" +
              time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            this.refreshTableText = "Successfully refreshed";
            this.common.$timeout(() => {
              this.isRefreshing = false;
            }, 3500);
          }
        })
        .catch(error => {
          //If fetch attributes fail, return a fail message
          this.isRefreshing = true;
          this.refreshTableText = "Unsuccessfull!";
          this.common.$timeout(() => {
            this.isRefreshing = false;
          }, 2500);
          this.isLoaded = false;
          this.logger.error(error);
        });
    };

    // Get available statuses for UDD service
    this.FetchStatuses = () => {
      this.OrderAdvisorService.Status.FetchAll()
        .then(response => {
          this.Statuses = response.data;
          this.statusMap = new Map();
          //Create map of avaiable statuses by status code
          this.Statuses.forEach(status => {
            this.statusMap[status.code] = status;
          });
        })
        .catch(error => {
          this.logger.error(error);
        });
    };

    //Function to transit the state to create new attribute
    this.NewOrderAdvisor = () => {
      //Set message, error and attribute variables to null initially
      this.message = null;
      this.error = null;
      this.common.$state.go("common.prime.orderadvisor.new");
    };

    this.InitializeCreateForm = () => {
      this.createForm = true;
      this.configureScreen = false;
      this.manageDropScreen = false;
      this.previewAndPublish = false;
      this.OrderAdvisor = {};
      this.OrderAdvisor.status_id = 200;
      this.OrderAdvisor.status = "Active";
      this.FetchOrderAdvisorTypes();
      this.InitializeSelectizeVariables();
      //Set the focus to description field on timeout
      this.common.$timeout(() => {
        angular.element("#description").focus();
      }, 0);
    };

    this.GoToScreen = screen => {
      if (screen && screen.toLowerCase() === "configureudds") {
        this.createForm = false;
        this.configureScreen = true;
        this.manageDropScreen = false;
        this.previewAndPublish = false;
      } else if (screen && screen.toLowerCase() === "previewandpublish") {
        this.createForm = false;
        this.configureScreen = false;
        this.manageDropScreen = false;
        this.previewAndPublish = true;
      } else if (screen && screen.toLowerCase() === "masterscreen") {
        this.createForm = true;
        this.configureScreen = true;
        this.manageDropScreen = false;
        this.previewAndPublish = false;
      }
    };

    //Fetch all the order advisor types
    this.FetchOrderAdvisorTypes = () => {
      this.OrderAdvisorService.Type.FetchAll()
        .then(response => {
          this.OrderAdvisorTypes = response.data;
        })
        .catch(error => {
          this.logger.error(error);
        });
    };

    //Function to transit the state to update attribute by id
    this.UpdateOrderAdvisor = orderadvisor => {
      this.OrderAdvisor = {};
      this.OrderAdvisor.status_id = 200;
      this.OrderAdvisor.status = "Active";
      this.message = null;
      this.error = null;
      this.common.$state.go("common.prime.orderadvisor.update", {
        id: orderadvisor.id
      });
      this.common.$timeout(() => {
        this.configureScreen = true;
      }, 1000);
    };

    this.InitializeUpdateForm = () => {
      this.createForm = true;
      this.configureScreen = false;
      this.manageDropScreen = false;
      this.isDeleteConfirmation = false;
      this.previewAndPublish = false;
      this.OrderAdvisorService.OrderAdvisor.FetchOrderAdvisorByID(
        this.$stateParams.id
      ).then(orderAdvisor => {
        this.oldOrderAdvisor = _.clone(orderAdvisor.data);
        this.OrderAdvisor = _.clone(orderAdvisor.data);
        //Set the focus to description field on timeout
        this.common.$timeout(() => {
          angular.element("#description").focus();
        }, 0);
      });
      this.FetchOrderAdvisorTypes();
      this.InitializeSelectizeVariables();
    };

    //Function to transit the state to delete the selected attribute
    this.PanelDeleteAttribute = id => {
      this.message = null;
      this.error = null;
      //Variable to show confirm delete panel
      this.isConfirmDelete = true;
      this.isDeleteConfirmation = false;
      this.isShowHistory = false;
    };

    this.LoadUDDs = () => {
      this.$scope.loadUdds = false;
      common.$timeout(() => {
        this.$scope.loadUdds = true;
        this.configureScreen = true;
      }, 1000);
    };
    this.onchangeOrderAdvisorType = (advisor) => {
      var Buyer = this.OrderAdvisorTypes.filter(order => order.id == advisor.adviser_type_id)
      this.OrderAdvisor.buyer = Buyer[0].buyer
      if (this.OrderAdvisor.buyer == "" || this.OrderAdvisor.buyer == null) {
        this.OrderAdvisor.buyer = "Not Configured"
      }
    }

    //Request to create new order advisor type
    this.CreateOrderAdvisor = () => {
      //Set is processing flag to true till request is completed
      this.isProcessing = true;
      this.OrderAdvisor.adviser_type_id = Number(
        this.OrderAdvisor.adviser_type_id
      );
      delete this.OrderAdvisor.status;
      this.isCreateSuccess = false;
      this.OrderAdvisorService.OrderAdvisor.Create(this.OrderAdvisor)
        .then(response => {
          //Inserted record is added to existing attributes to show
          this.OrderAdvisors.push(response.data);
          //Is processing flag is set to false
          this.rowsCount += 1;
          this.isCreateSuccess = true;
          this.common.$timeout(() => {
            this.$scope.$broadcast("saveUdds", {
              event: "save",
              response: response,
              inserted_id: response.data.id
            });
          }, 500);
          this.common.$timeout(() => {
            this.isProcessing = false;
            this.isCreateSuccess = false;
            this.OrderAdvisor = {};
            this.common.$state.go("common.prime.orderadvisor");
          }, 3000);
        })
        .catch(exception => {
          this.isProcessing = false;
          this.error = exception.data.message;
        });
      this.common.$timeout(() => {
        this.message = null;
        this.error = null;
      }, 3000);
    };

    this.HasUpdateChanges = () => {
      let omitKeys = ["adviser_type"];
      let hasChanges = false;
      this.OrderAdvisor.adviser_type_id = Number(
        this.OrderAdvisor.adviser_type_id
      );
      for (let key in this.OrderAdvisor) {
        if (
          this.oldOrderAdvisor &&
          this.OrderAdvisor &&
          this.oldOrderAdvisor[key] != this.OrderAdvisor[key] && // NO TYPE CHECK
          !omitKeys.includes(key)
        ) {
          return (hasChanges = true);
        }
      }
      return hasChanges;
    };

    //Request to update selected attribute
    this.Update = () => {
      //Set is processing flag to true till request is completed
      this.isProcessing = true;
      this.HasUpdateUDDChanges = undefined;
      this.HasUpdateMasterChanges = undefined;
      //Update request with updated attribute payload
      this.updateBtnText = "Updating Now...";
      this.isBtnEnable = false;
      //Check if the payload has any changes, if yes then send API request
      if (this.HasUpdateChanges()) {
        this.HasUpdateMasterChanges = true;
        this.OrderAdvisorService.OrderAdvisor.Update(this.OrderAdvisor)
          .then(response => {
            //Find the attribute by index and set it with updated value
            let index = this.OrderAdvisors.findIndex(
              value => value.id === this.OrderAdvisor.id
            );
            this.OrderAdvisors[index] = this.OrderAdvisor;
            this.oldOrderAdvisor = _.clone(this.OrderAdvisor);
            this.isBtnEnable = true;
            this.isUpdateSuccess = true;
            this.message = "Order Advisor published successfully.";
            this.isShowHistory = false;
            //Set is processing flag to false
            this.isProcessing = false;
            this.common.$timeout(() => {
              this.$scope.$broadcast("saveUdds", {
                event: "save",
                response: response,
                inserted_id: this.OrderAdvisor.id
              });
            }, 500);
            this.common.$timeout(() => {
              this.isUpdateSuccess = false;
            }, 3000);
          })
          .catch(error => {
            this.isBtnEnable = false;
            this.isProcessing = false;
            if (error.status === 403) {
              this.isUnauthorized = true;
            } else {
              this.error = error.data.message;
            }
          });
      } else {
        this.isProcessing = false;
        this.isButtonDisabled = true;
        this.HasUpdateMasterChanges = false;
        this.common.$timeout(() => {
          let response = {};
          response.noChanges = true;
          this.$scope.$broadcast("saveUdds", {
            event: "save",
            response: response,
            inserted_id: this.OrderAdvisor.id
          });
        }, 500);
      }
      this.common.$timeout(() => {
        this.isUpdateSuccess = false;
        this.isBtnEnable = true;
        this.message = null;
        this.error = null;
        this.HasUpdateMasterChanges = undefined;
        this.HasUpdateUDDChanges = undefined;
        this.isButtonDisabled = false;
      }, 3000);
    };

    this.$scope.$on("saveOrderadvisor", (e, args) => {
      if (args.event == "publish") {
        this.isProcessing = false;
        this.isUpdateSuccess = true;
        this.message = "Order Advisor published successfully.";
        this.common.$timeout(() => {
          this.isUpdateSuccess = false;
          this.message = null;
        }, 3000);
      } else if (args.event == "failed") {
        this.error = "Nothing to update";
        this.common.$timeout(() => {
          this.error = "Nothing to update";
          this.isProcessing = false;
        });
      }
      this.common.$timeout(() => {
        // this.isUpdateSuccess = false;
        this.message = null;
        this.error = null;
      }, 5000);
    });    

    //Request to delete selected attribute
    this.Delete = () => {
      let id = this.$stateParams.id;
      this.isProcessing = true;
      this.OrderAdvisorService.OrderAdvisor.Delete(id)
        .then(result => {
          this.isProcessing = false;
          this.isDeleteSuccess = true;
          this.isDeleteConfirmation = false;
          let index = this.OrderAdvisors.findIndex(value => value.id === id);
          this.OrderAdvisors.splice(index, 1);
          this.common.$state.go("common.prime.orderadvisor");
        })
        .catch(error => {
          this.isProcessing = false;
          if (error.data && error.data.Data && error.data.Data.length > 0) {
            this.showDependencyDetails = true;
            this.dependentSkus = error.data.Data;
          }
        });
      this.common.$timeout(() => {
        this.message = null;
        this.error = null;
      }, 3500);
    };

    //Open clone panel for the Order advisor clone
    this.openClonePanel = orderAdvisor => {
      this.isCloneSaveSuccess = false;
      this.isShowClonePanel = true;
      this.order_advisor = {};
      this.cloneOrderAdvisor = orderAdvisor;
    };

    //Request to create new order advisor type
    this.CloneOrderAdvisor = () => {
      //Set is processing flag to true till request is completed
      this.isProcessing = true;
      this.order_advisor.order_adviser_type_id = Number(
        this.cloneOrderAdvisor.order_adviser_type_id
      );
      this.order_advisor.id = this.cloneOrderAdvisor.id;
      this.order_advisor.is_clone_udd_options = Number(
        this.order_advisor.is_clone_udd_options
      );
      delete this.order_advisor.status;
      this.isCreateSuccess = false;
      this.OrderAdvisorService.OrderAdvisor.Clone(this.order_advisor)
        .then(response => {
          this.isProcessing = false;
          // older clone message do not delete
          // this.cloneMessage =
          //   "Job request is created to clone Order Advisor. Once job is completed it will be notified you.";
          this.isCloneSaveSuccess = true;
        })
        .catch(exception => {
          this.isProcessing = false;
          this.cloneError = exception.data.message;
        });
      this.common.$timeout(() => {
        // older clone message do not delete
        // this.cloneMessage = null;
        this.cloneError = null;
        // this.isShowClonePanel = false;
        this.order_advisor = {};
      }, 3000);
    };

    //Go to view attributes page
    this.Exit = () => {
      this.OrderAdvisor = null;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
      this.isDeleteConfirmation = false;
      this.HasUpdateMasterChanges = undefined;
      this.common.$state.go("common.prime.orderadvisor");
      this.isUnauthorized = false;
    };

    //on click of delete button in update form, delete confirmation panel should be shown
    this.ShowDeleteConfirmPanel = () => {
      this.isConfirmDelete = true;
      this.isShowHistory = false;
      this.isUnauthorized = false;
    };

    //Close form and success/error messages in the form
    this.CloseUpdateForm = () => {
      this.$state.go("common.prime.orderadvisortype");
      this.message = null;
      this.common.$timeout(() => {
        this.isDeleteConfirmation = false;
        this.isUnauthorized = false;
        this.isDeleteSuccess = false;
        this.isUpdateSuccess = false;
        this.isSaveSuccess = false;
        this.isConfirmDelete = false;
      }, 500);
    };

    //Set validation rules for different format selected
    this.AddValidationRules = () => {
      let obj = {};
      let getConstraint = this.valdr.getConstraints()["RULES-100"];
      getConstraint === undefined ? (getConstraint = {}) : null;
      let msg = `Description must be a string between 3 and 500 characters.`;
      getConstraint["description"] = {
        string: {
          message: msg
        },
        minLength: {
          number: 3,
          message: msg
        },
        maxLength: {
          number: 500,
          message: msg
        }
      };
      obj["RULES-100"] = getConstraint;
      this.valdr.addConstraints(obj);
    };

    this.Activate();
  }
})();
