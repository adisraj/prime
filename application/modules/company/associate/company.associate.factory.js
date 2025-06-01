(function() {
    'use strict'
    angular.module('rc.prime.company.associate').factory('CompanyAssociateService', CompanyAssociateService);
    CompanyAssociateService.$inject = [
        '$http',
        'application_configuration'
    ];

    function CompanyAssociateService($http, application_configuration) {
        let API = {};
        API.GetCompanyAssociates = getCompanyAssociates;
        API.GetCompanyAssociatesByDepartmentId = getCompanyAssociatesByDepartmentId;
        API.SearchDepartmentAssociates = searchDepartmentAssociates;
        API.InsertCompanyAssociate = insertCompanyAssociate;
        API.UpdateCompanyAssociate = updateCompanyAssociate;
        API.DeleteCompanyAssociate = deleteCompanyAssociate;

        return {
            API
        };

        function getCompanyAssociates() {
            return $http.get(application_configuration.entityService.url + '/api/company/associate');
        };

        function getCompanyAssociatesByDepartmentId(department_id) {
            return $http.get(application_configuration.entityService.url + '/api/company/associate/department/' + department_id)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function searchDepartmentAssociates(search_field, search_value) {
            return $http.get(application_configuration.entityService.url + '/api/company/associate/search/' + search_field + '-' + search_value)
                .then((response) => {
                    return response.data;
                });
        };

        function insertCompanyAssociate(associateDetails) {
            return $http.post(application_configuration.entityService.url + '/api/company/associate', associateDetails);
        };

        function updateCompanyAssociate(associateDetails) {
            return $http.put(application_configuration.entityService.url + '/api/company/associate/' + associateDetails.id, associateDetails);
        };

        function deleteCompanyAssociate(associateDetails) {
            return $http.delete(application_configuration.entityService.url + '/api/company/associate/' + associateDetails.id, associateDetails);
        };

    }
})();