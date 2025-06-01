class SKUFormatSettingsController {
    constructor($scope, $stateParams, $state, common, SKUFormatSettingsFactory) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.common = common;
        this.Factory = SKUFormatSettingsFactory;
        this.activate()
    }

    async activate() {
        try {
            this.isLoaded = false;
            let response = await this.Factory.FetchSKUFormat();
            this.SKUFormat = response.data[0];
            if (this.SKUFormat) {
                this.isCreate = false;
            } else {
                this.isCreate = true;
            }
            this.isLoaded = true;
        } catch (exception) {
            this.isLoaded = true;
        }
    }
    GoToCreate() {
        this.$state.go('common.prime.skuformat.edit');
    }

}
angular
    .module('rc.prime.sku.settings')
    .controller('SKUFormatSettingsController', SKUFormatSettingsController)