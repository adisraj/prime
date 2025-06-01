class SKUCloneController {
    constructor($scope, $stateParams, $state, common, Factory, JobsService, $timeout, SKUService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.common = common;
        this.$timeout = $timeout;
        this.logger = common.Logger.getInstance("SKUCloneController");
        this.Factory = Factory;
        this.JobsService = JobsService;
        this.SKUService = SKUService;
        this.uuid = 44;
        this.id = this.$stateParams.id || this.SKUService.API.GetVariable('sku_id');
        this.cloneBtnLabel = 'Start Cloning'
        this.copycount = 1;
        this.showCloningForm = true;
        this.showAdvanced = false;
        this.properties = [];
        this.message = null;
        this.showLockedScreen = true;
        this.activate()
    }

    activate() {
        const detailsArray = ["status", "sku_type", "item_description", "division", "department", "sku"];
        this.Factory.FetchSKU(this.id).then(response => {
            let SKU = response.data.data[0];
            this.item_id = SKU.item_id;
            this.sku_sub_type = SKU.sku_sub_type;
            this.SKUDetails = Object.entries(SKU).filter(function (el) {
                return (detailsArray.includes(el[0]));
            });
            this.sku_description = SKU.description;

        }).catch(error => {
            this.logger.error(error);
        });
    }

    /**
     * @desc creates the clone request for SKU
     * @param {Integer} sku_id sku id 
     */

    createCloneRequest(sku_id) {
        this.isProcessing = true;
        let requestData = {
            task_code: "clone-data",
            title: `Clone data for Sku-${sku_id}`
        }
        this.message = null;
        this.JobsService.API.InsertTaskRequest(requestData)
            .then(response => {
                this.request_id = response.data.data;
                for (let i = 0; i < this.propertyArray.length; i++) {
                    this.propertyArray[i].request_id = this.request_id;
                    this.createRequestProperty(this.propertyArray[i]);
                }
            })
            .catch(error => {
                this.isProcessing = false;
                this.logger.error(error);
            });
    }

    /**
     * @desc creates the request properties for recent clone request
     * @param {Object} property request property details like request id ,proeperty name, property value,
     */
    createRequestProperty(property) {
        this.JobsService.API.InsertTaskRequestProperty(property)
            .then(result => {
                this.isProcessing = false;
                this.showCloningForm = false;
                this.isSaveSuccess = true;
                // this.message = "Job request " + this.request_id + " is created to clone SKU. Once job is completed it will be notified you."
                // this.$timeout(() => {
                //     this.message = null;
                // }, 2500);
            })
            .catch(error => {
                this.isProcessing = false;
                this.logger.error(error);
            });
    }

    //Close form and success/error messages in the form
    closeForm() {
        this.common.$state.go('common.prime.itemMaintenance.sku');
        this.$timeout(() => {
            angular.element("#clone_sku").focus();
        }, 1000);
        this.$timeout(() => {
            angular.element("#clone_sku").focus();
        }, 1000);
    };
    /**
     * @desc prepares the data object to create request property 
     * @param {Integer} sku_id SKU id
     * @param {String} properties string of properties to store as value
     */
    prepareRequestProperty(sku_id, properties) {
        this.propertyArray = [
            { "property": "uuid", "value": this.uuid },
            { "property": "instance id", "value": sku_id },
            { "property": "item_id", "value": this.item_id },
            { "property": "advance clone", "value": properties.join(',') },
            { "property": "new description", "value": this.new_description }
        ]
    }

    startCloning() {
        this.showCloningForm = false;
        if (this.isCloneSkuSet) {
            this.properties.push("set");
        }
        /* if (this.isCloneHistory) {
            this.properties.push("history");
        } */
        if (this.isCloneUddValues) {
            this.properties.push("udd_values")
        }

        if (this.isCloneDrops) {
            this.properties.push("drop");
        }
        if (this.isCloneSKUHP) {
            this.properties.push("huntpath");
        }
        if (this.isCloneTags) {
            this.properties.push("tag");
        }

        this.prepareRequestProperty(this.id, this.properties)
        this.createCloneRequest(this.id);

    }

    focusCloneSku() {
        this.$timeout(() => {
            angular.element("#clone_sku").focus();
        }, 1000);
    }


    exit() {
        this.common.$state.go('common.prime.itemMaintenance.sku');
    }

}

angular
    .module('rc.prime.item.clone')
    .controller('SKUCloneController', SKUCloneController);



class ItemCloneController {
    constructor($scope, $stateParams, $state, common, Factory, JobsService, UserService, ItemService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.common = common;
        this.$timeout = common.$timeout;
        this.Factory = Factory;
        this.JobsService = JobsService;
        this.ItemService = ItemService;
        this.UserService = UserService;
        this.UUID = 4;
        this.SKUUUID = 44;
        this.id = this.$stateParams.id || this.ItemService.API.GetVariable('item_id')
        this.copycount = 1;
        this.skus = [];
        this.cloneBtnLabel = 'Start Cloning'
        this.showCloningForm = true;
        this.showAdvanced = false;
        this.message = null;
        this.error = null;
        this.showLockedScreen = true;
        this.properties = [];
        this.skuproperties = [];
        this.activate()
    }

    activate() {
        this.fetchFeatureAccessDetails();
        this.Factory.FetchItem(this.id)
            .then(response => {
                let Item = response.data.data[0];
                const detailsArray = ["status", "item_type", "item_sub_type", "collection", "division", "department", "vendor"]
                this.ItemDetails = Object.entries(Item).filter((el) => {
                    return (detailsArray.includes(el[0]));
                });
                this.item_description = Item.description;
                this.FetchItemSKUs(this.id);
            })
            .catch(error => {
                this.logger.error(error);
            });
    }

    // Fetch access for clone
    fetchFeatureAccessDetails() {
        this.UserService.API.IsAllowedFeaturedPassword("sku-clone")
            .then(result => {
                if (result.data && result.data.length) {
                    this.isSKUCloneAllowed = true;
                    this.skuAllowedToolTip = "";
                } else {
                    this.isSKUCloneAllowed = false;
                    this.skuAllowedToolTip = "No access for clone. Enable access to clone SKU.";
                }
            })
            .catch(error => {
                console.error(error);
            })
    }

    FetchItemSKUs(id) {
        this.Factory.FetchItemSKUs(id)
            .then(response => {
                this.skus = response.data;
                if (this.isSKUCloneAllowed) {
                    for (let index = 0; index < this.skus.length; index++) {
                        this.skus[index].checked = true;
                    }
                }
                this.ItemDetails.push(["Number Of SKUs", this.skus.length]);
            }).catch(error => {
                this.logger.error(error);
            });
    }

    /**
     * @desc creates the clone request for SKU
     * @param {Integer} id item id or SKU id 
     * @param {Array}  propertyArray array of properties to be created in database 
     */
    createCloneRequest(entity, id, propertyArray) {
        let requestData = {
            task_code: "clone-data",
            title: `Clone data for ${entity}-${id}`
        }
        this.message = null;
        this.JobsService.API.InsertTaskRequest(requestData)
            .then(response => {
                this.request_id = response.data.data;
                for (let i = 0; i < propertyArray.length; i++) {
                    propertyArray[i].request_id = this.request_id;
                    this.createRequestProperty(propertyArray[i]);
                }
            })
            .catch(error => {
                this.isProcessing = false;
                this.logger.error(error);
            });
    }

    /**
     * @desc creates the properties for recent clone request
     * @param {Object} property request property details like request id ,proeperty name, property value,
     */
    createRequestProperty(property) {
        this.JobsService.API.InsertTaskRequestProperty(property)
            .then(result => {
                // this.message = "Job request " + this.request_id + " is created to clone item. Once job is completed it will be notified you."
                this.isProcessing = false;
                this.isSaveSuccess = true;
                // this.$timeout(() => {
                //     this.message = null;
                // }, 2500);
            })
            .catch(error => {
                this.isProcessing = false;
                this.logger.error(error);
            });
    }

    //Close form and success/error messages in the form
    closeForm() {
        this.common.$state.go('common.prime.itemMaintenance');
        this.$timeout(() => {
            angular.element("#clone_item").focus();
        }, 1000);
    };

    /**
     * @desc prepares the data object to create request property 
     * @param {Integer} item_id Item id
     * @param {String} properties string of properties to store as value
     */
    prepareRequestProperty(item_id, properties, skuproperties) {
        this.propertyArray = [
            { "property": "uuid", "value": this.UUID },
            { "property": "instance id", "value": item_id },
            { "property": "new description", "value": this.new_description },
            { "property": "sku_uuid", "value": this.SKUUUID },
            { "property": "sku instance id", "value": this.skuIds.join(',') }
        ]

        if (properties.length > 0) {
            this.propertyArray.push(
                { "property": "advance clone", "value": properties.join(',') }
            )
        }

        if (skuproperties.length > 0) {
            this.propertyArray.push(
                { "property": "sku advance clone", "value": skuproperties.join(',') }
            )
        }
    }

    prepareSkusToBeCloned() {
        this.skuIds = [];
        for (let i = 0; i < this.skus.length; i++) {
            this.skus[i].checked === true ? this.skuIds.push(this.skus[i].id) : null;
        }
    }

    startCloning() {
        this.showCloningForm = false;
        this.isProcessing = true;
        if (this.isCloneSkuSet) {
            this.properties.push("set");
        }
        /*  if (this.isCloneHistory) {
             this.properties.push("history");
         } */
        if (this.isCloneDrops) {
            this.properties.push("drop");
        }

        if (this.isCloneUddValues) {
            this.properties.push("udd_values")
        }
        /* if (this.isCloneSKUHistory) {
            this.skuproperties.push("history");
        } */
        if (this.isCloneSKUSkuSet) {
            this.skuproperties.push("set");
        }
        if (this.isCloneSKUDrops) {
            this.skuproperties.push("drop");
        }
        if (this.isCloneSKUHuntPath) {
            this.skuproperties.push("huntpath");
        }
        this.prepareSkusToBeCloned();
        this.prepareRequestProperty(this.id, this.properties, this.skuproperties);
        this.createCloneRequest('Item', this.id, this.propertyArray);

    }

    exit() {
        this.common.$state.go('common.prime.itemMaintenance');

    }

    focusCloneItem() {
        this.$timeout(() => {
            angular.element("#clone_item").focus();
        }, 1000);
    }
}

angular
    .module('rc.prime.item.clone')
    .controller('ItemCloneController', ItemCloneController);
