(function () {
  OrderAdvisorServices.$inject = ["$http", "application_configuration"];
  angular
    .module("rc.prime.orderadvisor")
    .factory("OrderAdvisorServices", OrderAdvisorServices);

  function OrderAdvisorServices($http, application_configuration) {
    // Define a constant variable which contains the base URL for order adviser API service requests
    const baseUrl = `${application_configuration.orderadvisorService.url}/api/order-adviser`;
    const itemBaseUrl = `${application_configuration.itemAndRetailService.url}`;

    //Main Module, order advisor service object consists of type service object, udd service object
    const OrderAdvisorServices = {
      OrderAdvisor: {
        //Order Advisor Type Services START
        Type: {
          //Fetch all order advisor types service request
          FetchAll: () => {
            return $http.get(`${baseUrl}/types`).then(response => {
              //Calculate the API response time taken to fetch the types
              let time =
                response.config.responseTimestamp -
                response.config.requestTimestamp;
              response.data.time_taken = time / 1000;
              //Return response data with time calculated
              return response;
            });
          },
          //Fetch order advisor type by ID service request
          FetchTypeByID: id => {
            return $http.get(`${baseUrl}/types/${id}`).then(response => {
              //Calculate the API response time taken to fetch the types
              let time =
                response.config.responseTimestamp -
                response.config.requestTimestamp;
              response.data.time_taken = time / 1000;
              //Return response data with time calculated
              return response;
            });
          },
          //Create advisor type service request
          Create: typeObject => {
            return $http.post(`${baseUrl}/types`, typeObject).then(response => {
              //Return response data
              return response;
            });
          },
          //Update advisor type by type id service request
          Update: typeObject => {
            return $http
              .put(`${baseUrl}/types/${typeObject.id}`, typeObject)
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Delete advisor type by type id service request
          Delete: typeId => {
            return $http.delete(`${baseUrl}/types/${typeId}`).then(response => {
              //Return response data
              return response;
            });
          }
        },
        //Order Advisor Type Services END

        //Order Advisor Type UDD Services START
        TypeUDD: {
          //Fetch all order advisor types service request
          FetchUDDsForType: typeId => {
            return $http
              .get(`${baseUrl}/types/${typeId}/options`)
              .then(response => {
                //Calculate the API response time taken to fetch the types
                let time =
                  response.config.responseTimestamp -
                  response.config.requestTimestamp;
                response.data.time_taken = time / 1000;
                //Return response data with time calculated
                return response;
              });
          },
          //Fetch order advisor type by ID service request
          FetchUddsByID: id => {
            return $http.get(`${baseUrl}/options/${id}`).then(response => {
              //Calculate the API response time taken to fetch the types
              let time =
                response.config.responseTimestamp -
                response.config.requestTimestamp;
              response.data.time_taken = time / 1000;
              //Return response data with time calculated
              return response;
            });
          },
          //Create advisor type service request
          Create: typeUddObject => {
            return $http
              .post(
                `${baseUrl}/types/${typeUddObject.advisor_type_id}/options`,
                typeUddObject
              )
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Update advisor type by type id service request
          Update: typeObject => {
            return $http
              .put(
                `${baseUrl}/types/${typeObject.advisor_type_id}/option/${typeObject.id}`,
                typeObject
              )
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Delete advisor type by type id service request
          Delete: (id, isDeleteConfirm) => {
            return $http
              .delete(`${baseUrl}/types/option/${id}/${isDeleteConfirm}`)
              .then(response => {
                //Return response data
                return response;
              });
          }
        },
        //Order Advisor Type UDD Services END
        //Order Advisors Services START
        OrderAdvisor: {
          //Fetch all order advisors service request
          FetchAll: () => {
            return $http.get(`${baseUrl}/headers`).then(response => {
              //Calculate the API response time taken to fetch the types
              let time =
                response.config.responseTimestamp -
                response.config.requestTimestamp;
              response.data.time_taken = time / 1000;
              //Return response data with time calculated
              return response;
            });
          },
          //Fetch order advisor by ID service request
          FetchOrderAdvisorByID: id => {
            return $http.get(`${baseUrl}/header/${id}`).then(response => {
              return response;
            });
          },
          //Create advisor service request
          Create: orderAdvisorObject => {
            return $http
              .post(`${baseUrl}/header`, orderAdvisorObject)
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Update advisor type by type id service request
          Update: typeObject => {
            return $http
              .put(`${baseUrl}/header/${typeObject.id}`, typeObject)
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Delete advisor type by type id service request
          Delete: id => {
            return $http.delete(`${baseUrl}/header/${id}`).then(response => {
              //Return response data
              return response;
            });
          },
          //Clone advisor type by type id service request
          Clone: orderAdvisorObject => {
            return $http
              .post(
                `${baseUrl}/header/${orderAdvisorObject.id}/clone`,
                orderAdvisorObject
              )
              .then(response => {
                //Return response data
                return response;
              });
          },
          FetchPackagesForOrderAdvisor: id => {
            return $http.get(`${baseUrl}/udds/header/${id}/`).then(response => {
              //Return response data with time calculated
              return response;
            });
          }
        },
        //Order Advisor Services END
        //Order Advisors UDD Value Services START
        UddValues: {
          //Fetch all order advisors service request
          FetchValueForOrderAdvisorAndUDD: (orderAdvisorId, uddId) => {
            return $http
              .get(`${baseUrl}/udd/${orderAdvisorId}/header/${uddId}/`)
              .then(response => {
                //Calculate the API response time taken to fetch the types
                let time =
                  response.config.responseTimestamp -
                  response.config.requestTimestamp;
                response.data.time_taken = time / 1000;
                //Return response data with time calculated
                return response;
              });
          },
          //Create advisor service request
          Create: orderAdvisorValuesObject => {
            return $http
              .post(`${baseUrl}/udd/values`, orderAdvisorValuesObject)
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Update advisor service request
          Update: (id, orderAdvisorValuesObject) => {
            return $http
              .put(`${baseUrl}/udd/value/${id}`, orderAdvisorValuesObject)
              .then(response => {
                //Return response data
                return response;
              });
          },
          //Delete advisor type by type id service request
          Delete: id => {
            return $http.delete(`${baseUrl}/udd/value/${id}`).then(response => {
              //Return response data
              return response;
            });
          }
        },
        //Order Advisors UDD Value Services END
        //Order Advisors Type Packages Services START
        Packages: {
          //Fetch all order advisors service request
          FetchPackagesForAType: typeId => {
            return $http
              .get(`${itemBaseUrl}/api/sku/type/${typeId}/packages`)
              .then(response => {
                return response;
              });
          },
          //Create order advisors package type link request
          CreatePackageForAType: (typeId, packageId) => {
            let object = {
              package_id: packageId
            };
            return $http
              .post(`${itemBaseUrl}/api/sku/type/${typeId}/packages`, object)
              .then(response => {
                return response;
              });
          },
          //Get advisor packages available request
          FetchPackages: () => {
            return $http.get(`${baseUrl}/packages`).then(response => {
              //Return response data
              return response;
            });
          },
          //Create advisor packages available request
          CreatePackages: object => {
            return $http.post(`${baseUrl}/packages`, object).then(response => {
              //Return response data
              return response;
            });
          },
          //Delete advisor type by type id service request
          DeletePackageForAType: (typeId, packageId) => {
            return $http
              .delete(`${baseUrl}/type/${typeId}/package/${packageId}`)
              .then(response => {
                //Return response data
                return response;
              });
          },
          DeletePackageForPE: (typeId, packageId) => {
            return $http
              .put(`${itemBaseUrl}/api/sku/type/${typeId}/package/${packageId}`)
              .then(response => {
                //Return response data
                return response;
              });
          },
          UpdatePackageById: (data) => {
            return $http
              .put(`${baseUrl}/package/${data.id}`, data)
              .then(response => {
                //Return response data
                return response;
              });
          },
          DeletePackageById: (id) => {
            return $http
              .delete(`${baseUrl}/package/${id}`)
              .then(response => {
                //Return response data
                return response;
              });
          },
          UpdatePackagesForSingleAndMaxQuantity: (typeId, payload) => {
            return $http
              .put(`${itemBaseUrl}/api/sku/maxquantity/type/${typeId}/packages `, payload)
              .then(response => {
                return response;
              });
          }


        },
        //Order Advisors Type Packages Services END
        //Order Advisor Status Services START
        Status: {
          //Fetch all order advisor types service request
          FetchAll: () => {
            return $http.get(`${baseUrl}/statuses`).then(response => {
              //Return response data
              return response;
            });
          }
        }
        //Order Advisor Status Services END
      }
    };
    return OrderAdvisorServices;
  }
})();