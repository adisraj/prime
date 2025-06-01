class TypePackageController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    valdr,
    StatusCodes,
    OrderAdvisorServices,
    GlobalRegularExpression,
    SKUService
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.valdr = valdr;
    this.globalRegularExpression = GlobalRegularExpression;
    this.isShowAdd = false;
    this.StatusCodes = StatusCodes;
    this.SKUService = SKUService;
    this.containerPop=null
    this.OrderAdvisorService = OrderAdvisorServices.OrderAdvisor;
    this.logger = this.common.Logger.getInstance("TypePackageController");
    this.permissionsMap = {
      create: 1,
      update: 1,
      delete: 1
    }
    this.Activate();
  }

  //Activation method to initialize order advisor type package controller
  Activate() {
    //Fetch all order advisor packages for a type
    this.FetchOrderAdvisorTypePackages();
    this.FetchPackages();
    //Get Order advisor type details
    this.FetchOrderAdvisorType(this.common.$stateParams.type_id);
  }

  //Fetch all the order advisor types
  FetchOrderAdvisorTypePackages(refresh) {
    this.isLoaded = false;
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.OrderAdvisorService.Packages.FetchPackagesForAType(this.common.$stateParams.type_id)
      .then(response => {
        this.OrderAdvisorTypePackages = response.data;
        this.rowsCount = response.data.length;
        this.PackageIds = [];
        _.each(this.OrderAdvisorTypePackages, typePackage => {
          // if (typePackage.isLinked == 1) {
          this.PackageIds.push(typePackage.package_id);
          // }
        });
         if(this.containerPop){
          this.containerPop.popover('hide');
        }
        if (this.Packages) {
          this.mapPacakges();
        }
        this.isLoaded = true;
        if (refresh !== undefined) {
          this.totalRecords = response.data.length;
          this.totalRecordsText = "record(s) loaded in approximately";
          this.totalTimeText =
            "<strong>" +
            time_taken +
            "</strong><span class='f-14 c-gray'> seconds</span>";
          this.refreshTableText = "Successfully refreshed";
          this.common.$timeout(() => {
            this.isRefreshTable = false;
          }, 3500);
        }
      })
      .catch(error => {
        //If fetch attributes fail, return a fail message
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.common.$timeout(() => {
          this.isRefreshTable = false;
        }, 2500);
        this.isLoaded = false;
        this.logger.error(error);
      });
  }

  mapPacakges() {
    _.each(this.OrderAdvisorTypePackages, typePackage => {
      _.each(this.Packages, pckg => {
        if (typePackage.package_id == pckg.id) {
          pckg.isLinked = 1;
          if (typePackage.display_pe == 1) {
            pckg.display_pe = true
          }
          else {
            pckg.display_pe = false;
          }
          if(typePackage.default_package==1){
            pckg.default_package=true
          }else{
            pckg.default_package=false
          }
        }
      })
    });
  }

  // Get available packages
  FetchPackages() {
    this.OrderAdvisorService.Packages.FetchPackages()
      .then(response => {
        this.Packages = response.data;
        this.packageMap = new Map();
        //Create map of avaiable statuses by status code
        this.Packages.forEach(packageObject => {
          this.packageMap[packageObject.id] = packageObject;
        });
        if (this.OrderAdvisorTypePackages) {
          this.mapPacakges();
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  //Fetch Order advisor type details
  FetchOrderAdvisorType(typeId) {
    this.OrderAdvisorService.Type.FetchTypeByID(typeId)
      .then(type => {
        this.Type = _.clone(type.data);
      })
  }

  closeForm() {
    this.isShowDetails = false;
    this.saveBtnText = "Create";
    this.common.$timeout(() => {
      this.showErrorDetails = false;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  };

  openForm() {
    this.saveBtnText = "Create";
    this.packageDetails = {};
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isShowDetails = true;
    this.isShowAdd = true;
    this.setInitialState();
  }

  dblClickAction(packageData) {
    this.isShowAdd = false;
    this.showDetailsByID(packageData);
  };

  showDetailsByID(packageData) {
    this.packageDetails = _.clone(packageData);
    this.oldPackageDetails = _.clone(packageData);
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.updateBtnText = "Update";
    this.isShowDetails = true;
    this.setInitialState();
  };

  //show create new location type form on click of create another button after a new record created.
  createAnotherForm() {
    this.isShowDetails = true;
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.packageDetails = {};
    this.setInitialState();
  };


  setInitialState() {
    this.common.$timeout(() => {
      angular.element('#packageDescription').focus();
    }, 0);
  }

  //Show confirmation page on click of delete button
  showconfirm() {
    this.isConfirmDelete = true;
  };

  //Create new Package
  CreatePackage(packageData) {
    this.saveBtnText = "Creating...";
    let object = {
      description: packageData.description
    }
    this.OrderAdvisorService.Packages.CreatePackages(object)
      .then(response => {
        response.data.selected = true;
        this.FetchOrderAdvisorTypePackages();
        this.CreateTypePackageLink(this.common.$stateParams.type_id, response.data)
        this.Packages.push(response.data);
        this.packageMap[response.data.id] = response.data;
        this.saveBtnText = "Done";
        this.isSaveSuccess = true;
        // this.message = "Package created Successfully";
        this.common.$timeout(() => {
          this.message = null;
        }, 3500);
      })
      .catch(error => {
        this.saveBtnError = true;
        this.saveBtnText = "Oops.!! Something went wrong";
        this.error = error.data.message;
        this.common.$timeout(() => {
          this.saveBtnError = false;
          this.saveBtnText = "Create";
          this.error = null;
        }, 2500);
        this.logger.error(error);
      });
  }
  CreateTypePackageLink(typeId, packageObject, isSelected) {
    let packageId = packageObject.id;
    if(this.containerPop){
      this.containerPop.popover('hide');
    }
    this.isProcessing = true; // Disable all the action buttons
    packageObject.isProcessing = true; // Disable a specific action button
    typeId === undefined ? typeId = this.common.$stateParams.type_id : null;
    let largestPackageId = Math.max(...this.Packages.map(pkg => pkg.id));
    let lastValue=largestPackageId==packageId
    if (isSelected !== false && packageObject.isLinked == 1) {
      this.OrderAdvisorService.Packages.CreatePackageForAType(typeId, packageId)
        .then(response => {
          this.OrderAdvisorTypePackages.push(packageObject);
          this.PackageIds.push(packageId);
          this.isProcessing = false; // Disable all the action buttons
          packageObject.isProcessing = false; // Disable a specific action button
          packageObject.isLinked = 1;
          this.FetchOrderAdvisorTypePackages();
          // this.packageDetails.description = null;
          // _.each(this.Packages, pckg => {
          //   if (pckg.id != packageObject.id && pckg.isLinked == 1) {
          //     this.DeleteTypePackageLink(pckg);
          //   }
          // })
        })
        .catch(error => {
          this.isProcessing = false; // Disable all the action buttons
          packageObject.isProcessing = false; // Disable a specific action button
        })
    } else {
      let existingStyle = document.getElementById('popover-style');
                  if (existingStyle) {
                      document.head.removeChild(existingStyle);
                  }
      this.SKUService.API.FindSkuWithPackageIdandOrderAdvisorTypeId(typeId,packageObject.id).then(res=>{
        if(res.data.length>0){
          let numSku=res.data.length>1?"SKU's":"SKU";
          let container = $('.pop-contain[data-package-id="' + packageObject.id + '"]');
                // Set up custom content for the popover (with two buttons)
                let popoverContent = `
                    <div style="text-align: center;">
                      <span class="f-15 " style="color:black;">The Current Package is Linked with ${res.data.length} ${numSku}.<br>Do you want to Unlink?</span>
                      <div>
                        <button class="btn btn-sm btn-success waves-effect f-700" style="margin-right:5px;margin-top:5px;" id="Unlink-btn-${packageId}"> Unlink</button>
                        <button class="btn btn-sm bgm-firebrick waves-effect f-700" style="margin-top:5px;" id="cancel-btn-${packageId}">Cancel</button>
                      </div>
                    </div>
                `;
                
                let isIPad = /iPad|iPhone|iPod/.test(navigator.platform) && !window.MSStream;

                // Detect screen size for iPad (portrait or landscape)
                let placements = 'left'; // Default placement for larger screens
                if (isIPad || (window.innerWidth <= 1024 && window.innerWidth >= 768)) {
                    placements = 'top'; // Change to 'top' for iPads
                }
                // Initialize and show the popover with custom content
                container.attr('data-content', popoverContent); // Dynamically set content
                container.popover({
                    content: popoverContent,
                    placement: placements,
                    trigger: 'manual', // Manual trigger for popover
                    html: true ,
                    // Allow HTML inside popover content
                }).popover('show');
                if(lastValue){
                  var style = document.createElement('style');
                  style.id = 'popover-style'; 
                    style.innerHTML = `
                        .popover-title + .popover-content {
                            padding-top: 4px;
                            padding-bottom:9px;
                        }
                        .popover.left {
                            top: -50px !important;
                        }
                            .popover>.arrow {
                              top:77% !important;
                          }
                    `;
                    document.head.appendChild(style);
                }
                this.containerPop=container
                $(`#Unlink-btn-${packageId}`).on('click', () => {
                  let existingStyle = document.getElementById('popover-style');
                  if (existingStyle) {
                      document.head.removeChild(existingStyle);
                  }
                  var style = document.createElement('style');
                  style.id = 'popover-style'; 
                    style.innerHTML = `
                        .popover-title + .popover-content {
                            padding-bottom:9px;
                        }
                    `;
                    document.head.appendChild(style);
                  this.DeleteTypePackageLink(packageObject);
                  res.data.forEach(skus=>{
                    this.SKUService.API.DeleteOrderAdvisorPackageRetail(skus.sku_id,skus.order_advisor_id,packageObject.id).then(res=>{})
                  })
                  this.containerPop.popover('hide');
                  setTimeout(() => {
                    let successMessage = `
                    <div style="text-align: center;">
                      <span class="f-15 f-700" style="color: green;">Package successfully unlinked!</span>
                    </div>
                  `;
                  
                  container.attr('data-content', successMessage); // Set success message content
                  container.popover('show');
                  setTimeout(() => {
                    container.popover('hide')
                  }, 2000);
                  }, 2000);
                });
                $(`#cancel-btn-${packageId}`).on('click', () => {
                  this.isProcessing = false; // Disable all the action buttons
                  packageObject.isLinked = 1;
                  packageObject.isProcessing = false;
                  this.FetchOrderAdvisorTypePackages();
                  this.containerPop.popover('hide'); // Close the popover
                });
        }else{
          this.DeleteTypePackageLink(packageObject);
        }
        
      })
    }
    
  }

  defaultPackage(packageObj,typeId,event){
    event.target.blur(); // Blur the radio button
    typeId === undefined ? typeId = this.common.$stateParams.type_id : null;
    if(packageObj.default_package == true){
      packageObj.default_package=1
    }else{
      packageObj.default_package=0
    }
    let arrayOfDefaultPackages=[]
    _.each(this.OrderAdvisorTypePackages, pckg => {
      if (pckg.package_id == packageObj.id && pckg.default_package == 1) {
        arrayOfDefaultPackages.push(pckg)
      }
    })
    if(packageObj.default_package==1 && arrayOfDefaultPackages.length == 0){
      let conditional=false
      this.SKUService.API.UpdateOrderAdvisorPackageDefault(packageObj,typeId).then(response=>{
        this.Packages.forEach(pckg => {
          if (pckg.id !== packageObj.id && pckg.default_package == 1) {
            conditional=true
            this.deleteOrderAdvisorPackageDefault(pckg)
          }else if(!conditional && pckg.default_package == 1){
            conditional=true
            this.FetchOrderAdvisorTypePackages()
          }
        });
      }).catch(error=>{})
    }else{
      this.deleteOrderAdvisorPackageDefault(packageObj)
    }
  }

  deleteOrderAdvisorPackageDefault(packageObj){
    let packageId = packageObj.id;
    this.SKUService.API.UnselectOrderAdvisorPackageDefault(this.common.$stateParams.type_id,packageId).then(res=>{

        packageObj.default_package = false;
        this.isProcessing = false; // Disable all the action buttons
        packageObj.isProcessing = false; // Disable a specific action button
        // this.PackageIds = this.PackageIds.filter(pkgId => pkgId !== packageId); // Remove the package from the linked packages array
        this.FetchOrderAdvisorTypePackages();
      
    }).catch(error=>{});
  }

  

  DisplayinPE(packageObject, typeId,event) {
    event.target.blur(); // Blur the radio button
    typeId === undefined ? typeId = this.common.$stateParams.type_id : null;
    if (packageObject.display_pe == true) {
      packageObject.display_pe = 1;
    }
    else {
      packageObject.display_pe = 0;
    }
    let arrayOfPackages=[]
    _.each(this.OrderAdvisorTypePackages, pckg => {
      if (pckg.package_id == packageObject.id && pckg.display_pe == 1) {
        arrayOfPackages.push(pckg)
      }
    })
    if (packageObject.display_pe == 1 && arrayOfPackages.length == 0) {
      let conditional=false
      this.SKUService.API.UpdateOrderAdvisorPE(packageObject, typeId)
        .then(response => {
          _.each(this.Packages, pckg => {
            if (pckg.id != packageObject.id && pckg.display_pe == 1) {
              conditional=true
              this.DeleteTypePackagePE(pckg);
            }else if(!conditional && pckg.display_pe == 1){
              conditional=true
              this.FetchOrderAdvisorTypePackages()
            }
          })
        })
        .catch(error => {
          this.isProcessing = false; // Disable all the action buttons
          packageObject.isProcessing = false;
        })
    }
    else {
      this.DeleteTypePackagePE(packageObject);
    }
  }

  UpdatePackage(packageData) {
    this.updateBtnText = "Updating...";
    if (packageData.description && packageData.description.toLowerCase() !== this.oldPackageDetails.description.toLowerCase()) {
      let obj = {
        id: packageData.id,
        description: packageData.description
      }
      this.OrderAdvisorService.Packages.UpdatePackageById(obj)
        .then(response => {
          this.isUpdateSuccess = true;
          this.oldPackageDetails.description = packageData.description;
          this.updateBtnText = "Done";
          let index = this.Packages.findIndex(pkg => pkg.id === packageData.id);
          this.Packages[index].description = packageData.description;
        })
        .catch(error => {
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.error = error.data.message;
          this.common.$timeout(() => {
            this.error = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
          }, 2500);
          this.logger.error(error);
        });
    } else {
      this.updateBtnError = true;
      this.updateBtnText = "Nothing to update";
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
      }, 1000);
    }
  }

  DeleteTypePackagePE(packageObject) {
    let packageId = packageObject.id;
    this.OrderAdvisorService.Packages.DeletePackageForPE(this.common.$stateParams.type_id, packageId)
      .then(response => {
        packageObject.display_pe = false;
        this.isProcessing = false; // Disable all the action buttons
        packageObject.isProcessing = false; // Disable a specific action button
        // this.PackageIds = this.PackageIds.filter(pkgId => pkgId !== packageId); // Remove the package from the linked packages array
        this.FetchOrderAdvisorTypePackages();
      })
      .catch(error => {
        this.isProcessing = false; // Disable all the action buttons
        packageObject.isProcessing = false; // Disable a specific action button
      })
  }

  DeleteTypePackageLink(packageObject) {
    let packageId = packageObject.id;
    this.isProcessing = true; // Disable all the action buttons
    packageObject.isProcessing = true; // Disable a specific action button
    this.OrderAdvisorService.Packages.DeletePackageForAType(this.common.$stateParams.type_id, packageId)
      .then(response => {
        packageObject.isLinked = 0;
        packageObject.display_pe = 0;
        packageObject.default_package=0
        this.isProcessing = false; // Disable all the action buttons
        packageObject.isProcessing = false; // Disable a specific action button
        this.PackageIds = this.PackageIds.filter(pkgId => pkgId !== packageId); // Remove the package from the linked packages array
        this.FetchOrderAdvisorTypePackages();
        this.BulkUpdateSkuPackageIds(this.common.$stateParams.type_id, packageId);
      })
      .catch(error => {
        this.isProcessing = false; // Disable all the action buttons
        packageObject.isProcessing = false; // Disable a specific action button
      })
  }

  BulkUpdateSkuPackageIds(typeId, packageId) {
    this.SKUService.API.BulkUpdateSkuPackageIds(typeId, packageId)
      .then(response => {
        this.bulkUpdate = response;
      })
      .catch(error => {
        this.isProcessing = false; // Disable all the action buttons
        packageObject.isProcessing = false;
      })
  }

  DeletePackage(packageData) {
    this.OrderAdvisorService.Packages.DeletePackageById(packageData.id)
      .then(response => {
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        let index = this.Packages.findIndex(pkg => pkg.id === packageData.id);
        this.Packages.splice(index, 1);
      })
      .catch(error => {
        this.error = error.data.message;
        this.common.$timeout(() => {
          this.error = null;
        }, 2500);
      })
  }

  //Go to view order advisors view page
  Exit() {
    this.Type = null;
    this.common.$state.go("common.prime.orderadvisortype");
  }
}

angular
  .module("rc.prime.orderadvisor.type.packages")
  .controller("TypePackageController", TypePackageController);
