(function() {
    angular.module('rc.prime.item.collection').factory('ItemCollectionService', ItemCollectionService);
    ItemCollectionService.$inject = [
        '$http',
        'application_configuration'
    ]

    function ItemCollectionService($http, application_configuration) {
        let API = {};

        API.GetItemCollections = getItemCollections;
        API.InsertItemCollection = insertItemCollection;
        API.UpdateItemCollection = updateItemCollection;
        API.DeleteItemCollection = deleteItemCollection;
        API.GetCollectionVendors = getCollectionVendors;
        API.SearchVendorCollections = searchVendorCollections;
        API.LinkVendorToCollection = linkVendorToCollection;
        API.UnlinkVendorFromCollection = unlinkVendorFromCollection;
        API.FetchCollectionsForMultipleVendors = fetchCollectionsForMultipleVendors;
        API.GetItemCollectionById = getItemCollectionById;
        API.GetCollectionsByItemCollectionIds = getCollectionsByItemCollectionIds;

        return {
            API
        };


        function getItemCollections() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/collections')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertItemCollection(valueDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/collections', valueDetails);
        };

        function updateItemCollection(valueDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + '/api/item/collections/' + valueDetails.id, valueDetails);
        };

        function deleteItemCollection(valueDetails) {
            return $http.delete(application_configuration.itemAndRetailService.url + '/api/item/collections/' + valueDetails.id, valueDetails);
        };

        function getCollectionVendors(collection_id) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/vendorcollection/' + collection_id)
                .then((response) => {
                    return response.data;
                });
        };

        function searchVendorCollections(search_field, search_value) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/vendorcollection/search/' + search_field + '-' + search_value);
        };

        function linkVendorToCollection(linkDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/vendorcollection', linkDetails)
                .then((response) => {
                    return response.data;
                });
        };

        function unlinkVendorFromCollection(collection_id, vendor_id) {
            return $http.delete(application_configuration.itemAndRetailService.url + '/api/item/vendorcollection/' + collection_id + '/' + vendor_id).then((response) => {
                return response.data;
            });
        };

        function fetchCollectionsForMultipleVendors(vendorIds) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/vendorcollection/collections', vendorIds);
        }

        function getItemCollectionById(id) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/collections/' + id)
                .then((response) => {
                    return response.data;
                });
        }

        function getCollectionsByItemCollectionIds(ids) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/collections/lov/id-' + ids)
                .then((response) => {
                    return response.data;
                });
        }
    };
})();