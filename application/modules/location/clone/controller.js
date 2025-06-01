class LocationCloneController {
    constructor($scope, $stateParams, $state, common, LocationCloneFactory, JobsService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.common = common;
        this.logger = common.Logger.getInstance("LocationCloneController");
        this.timeout = common.$timeout;
        this.sessionMemory = common.SessionMemory;
        this.Factory = LocationCloneFactory;
        this.JobsService = JobsService;
        this.uuid = 1;
        this.id = this.$stateParams.id;
        this.cloneBtnLabel = 'Start Cloning'
        this.copycount = 1;
        this.showCloningForm = true;
        this.showAdvanced = false;
        this.properties = [];
        this.message = null;
        this.showLockedScreen = true;
        this.currentUserName = JSON.parse(this.sessionMemory.API.Get("user.name"));
        this.secondaryPassword = '';
        this.activate();
    }

    activate() {
        const detailsArray = ["name", "type", "short_name"];
        this.Factory.FetchLocation(this.id).then(response => {
            let Location = response.data;
            this.LocationDetails = Object.entries(Location).filter(function (el) {
                return (detailsArray.includes(el[0]));
            });
            this.location_name = Location.name;

        }).catch(error => {
            this.logger.error(error);
        });
    }

    /**
     * @desc creates the clone request for SKU
     * @param {Integer} sku_id sku id 
     */
    createCloneRequest() {
        this.isProcessing=true;
        let requestData = {
            task_code: "clone-data",
            title: `Clone data for Location-${this.id}`
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
                this.isProcessing=false;
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
                this.isProcessing=false;
                this.showCloningForm =false;
                this.isSaveSuccess = true;
            })
            .catch(error => {
                this.isProcessing=false;
                this.logger.error(error);
            });
    }

      //Close form and success/error messages in the form
      closeForm () {
        this.common.$state.go('common.prime.location');
      };

    /**
     * @desc prepares the data object to create request property 
     * @param {Integer} location_id Location id
     * @param {String} properties string of properties to store as value
     */
    prepareRequestProperty(location_id, properties) {
        this.propertyArray = [
            { "property": "uuid", "value": this.uuid },
            { "property": "instance id", "value": location_id },
            { "property": "advance clone", "value": properties.join(',') },
            { "property": "new description", "value": this.new_description }
        ]
    }

    startCloning() {
        if (this.isCloneDrops) {
            this.properties.push("drop");
        }

        this.prepareRequestProperty(this.id, this.properties)
        this.createCloneRequest(this.id);

    }

    unlockWithSecondaryPassword(secondaryPassword) {
        if (secondaryPassword) {
            this.Factory.ValidateWithSecondaryPassword({ secondary_password: secondaryPassword })
                .then(validatedResult => {
                    if (validatedResult.status === 200) {
                        this.showLockedScreen = false;
                        this.secondaryPassword = '';
                        this.message = '';
                    }
                })
                .catch(error => {
                    this.secondaryPassword = '';
                    if (error.data.status === 401) {
                        angular.element("#lockScreenPassword").focus();
                        this.message = 'Wrong Password.';
                        this.timeout(() => {
                            this.message = '';
                        }, 2500);
                    }
                })
        } else {
            angular.element("#lockScreenPassword").focus();
            this.message = 'Please provide Password.';
            this.timeout(() => {
                this.message = '';
            }, 2500);
        }
    }

    exit() {
        this.common.$state.go('common.prime.location');
    }

}

angular
    .module('rc.prime.location.clone')
    .controller('LocationCloneController', LocationCloneController);