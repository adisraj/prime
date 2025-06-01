(function () {
    'use strict'
    angular.module('rc.prime.item.type.udd').factory('ItemUDDService', ItemUDDService);
    ItemUDDService.$inject = [
        '$http',
        'application_configuration'
    ]

    function ItemUDDService($http, application_configuration) {
        let API = {};
        let object = {};
        let apiEndpoint = '/api/item/udd';

        API.DeleteItemUDD = deleteItemUDD;
        API.DeleteItemUDDAndDependencies = deleteItemUDDAndDependencies;
        API.DeleteBridgeUddLink = deleteBridgeUddLink;
        API.UpsertUddBridgeValues = upsertUddBridgeValues;
        API.FetchStatus = fetchStatus;
        API.GetBridgeDependency = getBridgeDependency;
        API.GetItemUDDByLOV = getItemUDDByLOV;
        API.GetItemUDD = getItemUDD;
        API.GetItemUDDById = getItemUDDById;
        API.GetItemUDDList = getItemUDDList;
        API.GetSKUUDDList = getSKUUDDList;
        API.GetVariable = getVariable;
        API.GetUDDVisibilityOptions = getUDDVisibilityOptions;
        API.InsertItemUDD = insertItemUDD;
        API.SearchItemUDD = searchItemUDD;
        API.StoreVariable = storeVariable;
        API.TriggerCopyItemUDD = triggerCopyItemUDD;
        API.UpdateItemUDD = updateItemUDD;
        API.BulkUpdateItemUDD = bulkUpdateItemUDD;
        API.DeleteItemUDDAndBridgeValuesByAttribute = deleteItemUDDAndBridgeValuesByAttribute;
        API.DeleteItemUDDAndBridgeValuesByHierarchy = deleteItemUDDAndBridgeValuesByHierarchy;
        API.FetchGroupHeaders = fetchGroupHeaders;
        API.GetDistinctGroupHeaderByItemTypeId = getDistinctGroupHeaderByItemTypeId;
        API.GetGroupHeaderPropertiesByItemTypeId = getGroupHeaderPropertiesByItemTypeId;
        API.UpdatePropertyFieldByItemTypeIdAndHeaderId = updatePropertyFieldByItemTypeIdAndHeaderId;
        API.UpdateSequenceByItemTypeIdAndHeaderId = updateSequenceByItemTypeIdAndHeaderId;
        API.UpdateHeaderByHeaderId = updateHeaderByHeaderId;
        API.DiscoverGroupHeader = discoverGroupHeader;
        API.GetTaskIDUDD = getTaskIDUDD;
        API.DeleteGroupHeader = deleteGroupHeader;
        API.InsertItemUDDs = insertItemUDDs;

        return {
            API
        };

        function deleteItemUDD(itemTypeDetails) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + itemTypeDetails.id, itemTypeDetails);
        };

        function deleteItemUDDAndDependencies(itemTypeDetails) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + itemTypeDetails.id + '/delete', itemTypeDetails);
        };

        function deleteItemUDDAndBridgeValuesByAttribute(attributeId) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/delete/attribute/' + attributeId, {});
        };

        function deleteItemUDDAndBridgeValuesByHierarchy(hierarchyId) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/delete/hierarchy/' + hierarchyId, {});
        };

        function getBridgeDependency(item_map_id) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/uddbridge/exists/udd/' + item_map_id)
                .then((response) => {
                    return response.data.data;
                });
        };

        function deleteBridgeUddLink(item_map_id) {
            return $http.delete(application_configuration.itemAndRetailService.url + '/api/item/uddbridge/remove/map/' + item_map_id)
                .then((response) => {
                    return response.data;
                });
        };

        function upsertUddBridgeValues(payload) {
            return $http.put(application_configuration.itemAndRetailService.url + '/api/item/uddbridge/update/defaultvalue', payload)
                .then((response) => {
                    return response.data;
                });
        };

        function getItemUDD() {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint)
                .then((response) => {
                    return response.data;
                });
        };

        function getItemUDDById(id) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + id)
                .then((response) => {
                    return response.data.data;
                });
        };

        function getItemUDDByLOV(field, values) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/lov/' + field + '-' + values)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function getItemUDDList(item_type_id, collection_id, item_sub_type) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/uddlist/' + item_type_id + '/' + collection_id + "/?item_sub_type=" + item_sub_type)
                .then((response) => {
                    return response.data;
                });
        };

        function getSKUUDDList(item_type_id, sku_sub_type) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/skuuddlist/' + item_type_id + "?sku_sub_type=" + sku_sub_type)
                .then((response) => {
                    return response.data;
                });
        };

        function getUDDVisibilityOptions() {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/visibility')
                .then((response) => {
                    return response.data;
                });
        };

        function getVariable(key) {
            return object[key];
        };

        function insertItemUDD(itemTypeDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint, itemTypeDetails);
        };

        function triggerCopyItemUDD(udd_details) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/udd/copy/trigger', udd_details);
        };

        function searchItemUDD(search_field, search_value) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/search/' + search_field + '-' + search_value);
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateItemUDD(itemTypeDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + itemTypeDetails.id, itemTypeDetails);
        };

        function bulkUpdateItemUDD(itemTypeUddArray) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/bulkupdate', itemTypeUddArray);
        };

        function insertItemUDDs(itemTypeUdd) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/uddbridge/insert/udd/values', itemTypeUdd);
        };

        function fetchStatus() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/status')
                .then(response => {
                    return response.data;
                })
        };

        function fetchGroupHeaders() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/udd/groupheader')
                .then(response => {
                    return response.data;
                })
        };

        function getDistinctGroupHeaderByItemTypeId(item_type_id) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/udd/type/' + item_type_id + '/headers')
                .then(response => {
                    return response.data;
                })
        };

        function getGroupHeaderPropertiesByItemTypeId(item_type_id) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/udd/type/' + item_type_id + '/header/properties')
                .then(response => {
                    return response.data;
                })
        };

        function updatePropertyFieldByItemTypeIdAndHeaderId(itemTypeId, headerId, field, value) {
            return $http.put(
                application_configuration.itemAndRetailService.url +
                '/api/item/udd/type/' + itemTypeId +
                '/header/' + headerId +
                '/properties?field=' + field +
                '&value=' + value
            )
                .then(response => {
                    return response.data;
                })
        };

        function updateSequenceByItemTypeIdAndHeaderId(itemTypeId, headerId, sequence) {
            return $http.put(
                application_configuration.itemAndRetailService.url +
                '/api/item/udd/type/' + itemTypeId +
                '/header/' + headerId +
                '/property?sequence=' + sequence
            )
                .then(response => {
                    return response.data;
                })
        };

        function updateHeaderByHeaderId(id, group_header) {
            return $http.put(
                application_configuration.itemAndRetailService.url +
                '/api/item/udd/type/header/' + id +
                '?group_header=' + group_header
            )
                .then(response => {
                    return response.data;
                })
        };

        function discoverGroupHeader(data) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/udd/groupheader/discover', data);
        }

        function getTaskIDUDD(taskid) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/udd/copy/gettaskudd/'+ taskid);
        }

        function deleteGroupHeader(data) {
            return $http.delete(application_configuration.itemAndRetailService.url + '/api/item/udd/groupheader/' + data.group_header_id);
        }
    };
})();
