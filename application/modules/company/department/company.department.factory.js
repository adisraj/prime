(function() {
    'use strict'
    angular.module('rc.prime.company.department').factory('CompanyDepartmentService', CompanyDepartmentService);
    CompanyDepartmentService.$inject = [
        '$http',
        'application_configuration'
    ];

    function CompanyDepartmentService($http, application_configuration) {
        let API = {};
        let object = {};
        API.GetCompanyDepartments = getCompanyDepartments;
        API.GetCompanyDepartmentById = getCompanyDepartmentById;
        API.GetCompanyDepartmentsByCompanyId = getCompanyDepartmentsByCompanyId;
        API.SearchCompanyDepartments = searchCompanyDepartments;
        API.InsertCompanyDepartment = insertCompanyDepartment;
        API.UpdateCompanyDepartment = updateCompanyDepartment;
        API.DeleteCompanyDepartment = deleteCompanyDepartment;

        return {
            API
        };

        function getCompanyDepartments() {
            return $http.get(application_configuration.entityService.url + '/api/company/department');
        };

        function getCompanyDepartmentById(departmentId) {
            return $http.get(application_configuration.entityService.url + '/api/company/department/' + departmentId)
                .then(response => {
                    return response.data;
                });
        }

        function getCompanyDepartmentsByCompanyId(company_id) {
            return $http.get(application_configuration.entityService.url + '/api/company/department/search/company_id-' + company_id)
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function searchCompanyDepartments(search_field, search_value) {
            return $http.get(application_configuration.entityService.url + '/api/company/department/search/' + search_field + '-' + search_value)
                .then((response) => {
                    return response.data;
                });
        };

        function insertCompanyDepartment(departmentDetails) {
            return $http.post(application_configuration.entityService.url + '/api/company/department', departmentDetails);
        };

        function updateCompanyDepartment(departmentDetails) {
            return $http.put(application_configuration.entityService.url + '/api/company/department/' + departmentDetails.id, departmentDetails);
        };

        function deleteCompanyDepartment(departmentDetails) {
            return $http.delete(application_configuration.entityService.url + '/api/company/department/' + departmentDetails.id, departmentDetails);
        };

    }
})();