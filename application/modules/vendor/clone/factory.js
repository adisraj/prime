'use strict';
class VendorCloneFactory {
    constructor($http, application_configuration) {
        this.endpoint = '/api';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchVendor(id) {
        return this.$http.get(this.application_configuration.vendorService.url + this.endpoint + '/vendor/' + id);
    }
}

angular
    .module('rc.prime.vendor.clone')
    .factory('VendorCloneFactory', VendorCloneFactory)