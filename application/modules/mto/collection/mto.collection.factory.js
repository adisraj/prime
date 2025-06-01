(function() {
    'use strict'
    angular.module('rc.prime.mto.collection').factory('MTOCollectionService', MTOCollectionService);
    MTOCollectionService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MTOCollectionService($http, application_configuration) {
        let API = {};
        API.GetMtoCollections = getMtoCollections;
        API.InsertMtoCollection = insertMtoCollection;
        API.UpdateMtoCollection = updateMtoCollection;
        API.DeleteMtoCollection = deleteMtoCollection;
        API.GetCollectionVendors = getCollectionVendors;
        API.UnlinkVendorFromCollection = unlinkVendorFromCollection;
        API.LinkVendorToCollection = linkVendorToCollection;
        API.SearchVendorCollections = searchVendorCollections;

        return {
            API
        };

        function getMtoCollections() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/collections')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function insertMtoCollection(collectionDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/collections', collectionDetails);
        };

        function updateMtoCollection(collectionDetails) {
            return $http.put(application_configuration.mtoService.url + '/api/mto/collections/' + collectionDetails.id, collectionDetails);
        };

        function deleteMtoCollection(collectionDetails) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/collections/' + collectionDetails.id, collectionDetails);
        };

        function getCollectionVendors(collection_id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/vendorcollection/' + collection_id)
                .then((response) => {
                    return response.data;
                });
        };

        function searchVendorCollections(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/vendor/collection/search?field=' + search_field + '&value=' + search_value)
                .then((response) => {
                    return response;
                });
        };

        function linkVendorToCollection(linkDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/vendorcollection', linkDetails)
                .then((response) => {
                    return response.data;
                });
        };

        function unlinkVendorFromCollection(collection_id, vendor_id) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/unlink/vendorcollection/' + collection_id + '/' + vendor_id).then((response) => {
                return response.data;
            });
        };
    }
})();