(function() {
    'use strict'

    angular.module('rc.prime.company').factory('CompanyService', CompanyService);
    CompanyService.$inject = [
        '$http',
        'application_configuration'
    ];

    function CompanyService($http, application_configuration) {
        let API = {};
        let object = {};
        API.GetCompanies = getCompanies;
        API.GetCompanyById = getCompanyById;
        API.GetCompanyDeptAssoc = getCompanyDeptAssoc;
        API.InsertCompany = insertCompany;
        API.UpdateCompany = updateCompany;
        API.DeleteCompany = deleteCompany;
        API.StoreVariable = storeVariable;
        API.GetVariable = getVariable;

        return {
            API
        };

        function getCompanies() {
            return $http.get(application_configuration.entityService.url + '/api/company')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function getCompanyById(companyId) {
            return $http.get(application_configuration.entityService.url + '/api/company/' + companyId)
                .then((response) => {
                    return response.data;
                });
        };

        function getCompanyDeptAssoc(company_id) {
            return $http.get(application_configuration.entityService.url + '/api/company/companydeptassoc/' + company_id)
                .then((response) => {
                    return response.data;
                })
        }

        function insertCompany(companyDetails) {
            return $http.post(application_configuration.entityService.url + '/api/company', companyDetails);
        };

        function updateCompany(companyDetails) {
            return $http.put(application_configuration.entityService.url + '/api/company/' + companyDetails.id, companyDetails);
        };

        function deleteCompany(companyDetails) {
            return $http.delete(application_configuration.entityService.url + '/api/company/' + companyDetails.id, companyDetails);
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function getVariable(key) {
            return object[key];
        };
    }

})();