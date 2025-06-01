class VendorCloneController {
    constructor($scope, $stateParams, $state, common, VendorCloneFactory, JobsService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.common = common;
        this.logger = common.Logger.getInstance("VendorCloneController");
        this.Factory = VendorCloneFactory;
        this.JobsService = JobsService;
        this.uuid = 9;
        this.id = this.$stateParams.id;
        this.cloneBtnLabel = '<strong>&nbsp Start</strong> &nbspCloning'
        this.copycount = 1;
        this.showCloningForm = true;
        this.showAdvanced = false;
        this.properties = [];
        this.message = null;
        this.activate()
    }

    activate() {
        const detailsArray = ["name", "VendorType", "purchase_terms", "individual_or_company"];
        this.Factory.FetchVendor(this.id).then(response => {
            let Vendor = response.data;
            this.VendorDetails = Object.entries(Vendor).filter(function (el) {
                return (detailsArray.includes(el[0]));
            });
            this.vendor_name = Vendor.name;

        }).catch(error => {
            this.logger.error(error);
        });
    }

    /**
     * @desc creates the clone request for SKU
     * @param {Integer} sku_id sku id 
     */
    createCloneRequest() {
        let requestData = {
            task_code: "clone-data",
            title: `Clone data for Vendor-${this.id}`
        }
        this.message = null;
        this.JobsService.API.InsertTaskRequest(requestData)
            .then(response => {
                this.request_id = response.data.data;
                for (let i = 0; i < this.propertyArray.length; i++) {
                    this.propertyArray[i].request_id = this.request_id;
                    this.createRequestProperty(this.propertyArray[i])
                }
            })
            .catch(error => {
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
                this.message = "Job request " + this.request_id + " is created to clone Vendor. Once job is completed it will be notified you."
            })
            .catch(error => {
                this.logger.error(error);
            });
    }

    /**
     * @desc prepares the data object to create request property 
     * @param {Integer} sku_id SKU id
     * @param {String} properties string of properties to store as value
     */
    prepareRequestProperty(sku_id, properties) {
        this.propertyArray = [
            { "property": "uuid", "value": this.uuid },
            { "property": "instance id", "value": sku_id },
            { "property": "advance clone", "value": properties.join(',') },
            { "property": "new description", "value": this.new_description }
        ]
    }

    startCloning() {
        /* if (this.isCloneHistory) {
            this.properties.push("history");
        } */
        if (this.isCloneDrops) {
            this.properties.push("drop");
        }

        this.prepareRequestProperty(this.id, this.properties)
        this.createCloneRequest(this.id);

    }

    exit() {
        this.common.$state.go('common.prime.vendor');
    }

}

angular
    .module('rc.prime.vendor.clone')
    .controller('VendorCloneController', VendorCloneController);