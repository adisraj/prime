class MTOChoiceCloneController {
    constructor($scope, $stateParams, $state, common, CloneMTOFactory, JobsService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.common = common;
        this.Factory = CloneMTOFactory;
        this.JobsService = JobsService;
        this.logger = this.common.Logger.getInstance("MTOChoiceCloneController");
        this.uuid = 34;
        this.id = this.$stateParams.id;
        this.copycount = 1;
        this.clones = [];
        this.properties = [];
        this.cloneBtnLabel = 'Start Cloning'
        this.showCloningForm = true;
        this.showAdvanced = false;
        this.showLockedScreen = true;
        this.success_img = "img/clone/success.png";
        this.failed_img = "img/clone/failed.png";
        this.not_processed_img = "img/clone/waiting.png";
        this.activate();
    }

    activate() {
        try {
            this.Factory.FetchChoice(this.id)
                .then(response => {
                    let Choice = response.data;
                    this.mto_id = Choice.option_id;
                    this.showDetails = true;
                    const detailsArray = ["status", "option_type", "option", "collection", "price_group"]
                    this.ChoiceDetails = Object.entries(Choice).filter(function (el) {
                        return (detailsArray.includes(el[0]));
                    });
                    this.choice_description = Choice.choice_description;
                    this.readstatus_img = this.success_img;
                })
                .catch(error => {
                    this.logger.error(error);
                })
        } catch (exception) {
            this.readstatus_img = this.failed_img;
            this.clonestatus_img = this.failed_img;
            this.cloneuddstatus_img = this.failed_img;
        }
    }

    /**
     * @desc creates the clone request for MT
     * @param {Integer} mto_id mto id 
     */
    createCloneRequest(clone, cloneProperties) {
        this.isProcessing = true;
        let requestData = {
            task_code: "clone-data",
            title: `Clone data for ${clone} - ${this.id}`
        }
        this.message = null;
        this.JobsService.API.InsertTaskRequest(requestData)
            .then(response => {
                this.request_id = response.data.data;
                for (let i = 0; i < cloneProperties.length; i++) {
                    cloneProperties[i].request_id = this.request_id;
                    this.createRequestProperty(cloneProperties[i])
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
            })
            .catch(error => {
                this.isProcessing = false;
                this.logger.error(error);
            });
    }

     //Close form and success/error messages in the form
     closeForm () {
        this.common.$state.go('common.prime.mtooptions.mtochoices');
      };

    /**
     * @desc prepares the data object to create request property 
     * @param {Integer} mto_id MTO id
     * @param {String} properties string of properties to store as value
     */
    prepareRequestProperty(properties) {
        this.propertyArray = [
            { "property": "uuid", "value": this.uuid },
            { "property": "instance id", "value": this.id },
            { "property": "new description", "value": this.new_description },
            { "property": "mto_id", "value": this.mto_id }
        ]

        if (properties.length > 0) {
            this.propertyArray.push({ "property": "advance clone", "value": properties.join(',') })
        }
    }

    startCloning() {
        /*  if (this.isCloneHistory) {
             this.properties.push("history");
         } */
        if (this.isCloneDrops) {
            this.properties.push("drop");
        }

        this.prepareRequestProperty(this.properties);
        this.createCloneRequest('MTO Choice', this.propertyArray);

    }

    exit() {
        this.common.$state.go('common.prime.mtooptions.mtochoices');
    }
}

angular
    .module('rc.prime.mto.clone')
    .controller('ChoiceCloneController', MTOChoiceCloneController);


class MTOOptionCloneController {
    constructor($scope, $stateParams, $state, common, CloneMTOFactory, JobsService, UserService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.common = common;
        this.Factory = CloneMTOFactory;
        this.JobsService = JobsService;
        this.UserService = UserService;
        this.uuid = 36;
        this.choiceUUID = 34;
        this.id = this.$stateParams.id;
        this.copycount = 1;
        this.choices = [];
        this.clones = [];
        this.properties = [];
        this.choiceProperties = [];
        this.showCloningForm = true;
        this.showAdvanced = false;
        this.showLockedScreen = true;
        this.cloneBtnLabel = 'Start Cloning';
        this.success_img = "img/clone/success.png";
        this.failed_img = "img/clone/failed.png";
        this.not_processed_img = "img/clone/waiting.png";
        this.activate();
    }

    /**
     * @desc Initializes the controller by fetching selected MTO details and corresponding choice details
     * @param {Object} property MTO option details and corresponding choice details for cloning
     */
    async activate() {
        this.fetchFeatureAccessDetails();
        try {
            this.Factory.FetchMTO(this.id).then(response => {
                let MTO = response.data;
                const detailsArray = ["status", "option_type", "description", "pricing_method", "vendor"]
                this.MTODetails = Object.entries(MTO).filter(function (el) {
                    return (detailsArray.includes(el[0]));
                });
                this.mto_description = MTO.description;
                this.Factory.FetchMTOChoices(this.id).then(response => {
                    this.choices = response.data;
                    if (this.isChoiceCloneAllowed) {
                        for (let index = 0; index < this.choices.length; index++) {
                            this.choices[index].checked = true;
                        }
                    }
                    this.MTODetails.push(["Number Of Choices", this.choices.length]);
                })
                this.readstatus_img = this.success_img;
                this.readFailed = false;
            })
                .catch(error => {
                    this.logger.error(error);
                })
        } catch (exception) {
            this.readstatus_img = this.failed_img;
            this.readFailed = true;
        }
    }

    /**
     * @desc creates the clone request for MT
     * @param {Integer} mto_id mto id 
     */
    createCloneRequest(clone, cloneProperties) {
        this.isProcessing = true;
        let requestData = {
            task_code: "clone-data",
            title: `Clone data for ${clone} - ${this.id}`
        }
        this.message = null;
        this.JobsService.API.InsertTaskRequest(requestData)
            .then(response => {
                this.request_id = response.data.data;
                for (let i = 0; i < cloneProperties.length; i++) {
                    cloneProperties[i].request_id = this.request_id;
                    this.createRequestProperty(cloneProperties[i])
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
            })
            .catch(error => {
                this.isProcessing = false;
                this.logger.error(error);
            });
    }

        //Close form and success/error messages in the form
        closeForm () {
            this.common.$state.go('common.prime.mtooptions');
        };    
    /**
     * @desc prepares the data object to create request property 
     * @param {Integer} mto_id MTO id
     * @param {String} properties string of properties to store as value
     */
    prepareRequestProperty(properties, choiceProperties) {
        this.propertyArray = [
            { "property": "uuid", "value": this.uuid },
            { "property": "instance id", "value": this.id },
            { "property": "new description", "value": this.new_description },
            { "property": "choice_uuid", "value": this.choiceUUID },
            { "property": "choice instance id", "value": this.choiceIds.join(',') }
        ]
        if (properties.length > 0 || choiceProperties.length > 0) {
            this.propertyArray.push(
                { "property": "advance clone", "value": properties.join(',') },
                { "property": "choice advance clone", "value": choiceProperties.join(',') }
            )
        }
    }

    // Fetch access for clone
    fetchFeatureAccessDetails() {
        this.UserService.API.IsAllowedFeaturedPassword("choice-clone")
            .then(result => {
                if (result.data && result.data.length) {
                    this.isChoiceCloneAllowed = true;
                    this.choiceAllowedToolTip = "";
                } else {
                    this.isChoiceCloneAllowed = false;
                    this.choiceAllowedToolTip = "No access for clone. Enable access to clone choice.";
                }
            })
            .catch(error => {
                console.error(error);
            })
    }

    getChoicesToBeCloned() {
        this.choiceIds = [];
        for (let i = 0; i < this.choices.length; i++) {
            this.choices[i].checked === true ? this.choiceIds.push(this.choices[i].id) : null;
        }
    }

    startCloning() {
        if (this.isCloneDrops) {
            this.properties.push("drop");
        }

        if (this.isCloneChoiceDrops) {
            this.choiceProperties.push("drop");
        }

        this.getChoicesToBeCloned();
        this.prepareRequestProperty(this.properties, this.choiceProperties);
        this.createCloneRequest('MTO', this.propertyArray);

    }

    exit() {
        this.common.$state.go('common.prime.mtooptions');
    }
}

angular
    .module('rc.prime.mto.clone')
    .controller('MTOCloneController', MTOOptionCloneController);
