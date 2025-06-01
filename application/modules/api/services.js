APIServices.$inject = ["$http", "application_configuration"];
calculus.service("APIServices", APIServices);

function APIServices($http, application_configuration) {
  const vendorBaseUrl = `${application_configuration.vendorService.url}`;
  const itemBaseUrl = `${application_configuration.itemAndRetailService.url}`;

  const APIServices = {
    /**!!! VENDOR SERVICES START !!!**/
    Vendor: {
      //Fetch Vendors function to get all the vendors based on the query passed
      FetchVendors: (
        paginationObject,
        filtersObject,
        sortByObject,
        groupByObject
      ) => {
        return $http({
          //Specify the url to enroute
          url: `${vendorBaseUrl}/api/vendor`,
          //Method of API call is specified ie GET,PUT,POST or DELETE
          method: "GET",
          //Send objects through query string
          params: {
            pagination: paginationObject,
            filters: filtersObject,
            sort: sortByObject,
            group: groupByObject
          }
        }).then(response => {
          // Calculating time taken to fetch records
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.time_taken = time / 1000;
          //Return the response returned
          return response;
        });
      }
    },
    /**!!! VENDOR SERVICES END !!!**/

    /**!!! ITEMS SERVICES START !!!**/
    Item: {
      /** Item Collections Start */
      Collection: {
        //Fetch Collections function to get all the collections based on the query passed
        FetchCollections: (
          paginationObject,
          filtersObject,
          sortByObject,
          groupByObject
        ) => {
          return $http
            .get(`${itemBaseUrl}/api/item/collections`)
            .then(response => {
              let time =
                response.config.responseTimestamp -
                response.config.requestTimestamp;
              response.data.time_taken = time / 1000;
              return response;
            });
        }
      },
      /**Item Collections END */
      /**Item Vendor Collections Start */
      VendorCollection: {
        //Search Vendor Collections function to get all the collections by field and value
        SearchVendorCollections: (field, value) => {
          return $http
            .get(
              `${itemBaseUrl}/api/item/vendorcollection/search/${field}-${value}`
            )
            .then(response => {
              return response.data;
            });
        }
      },
      SKU: {
        InstallationRetail: {
          //Search Vendor Collections function to get all the collections by field and value
          CreateInstallationRetailForSku: retailObject => {
            return $http
              .post(
                `${itemBaseUrl}/api/sku/${retailObject.id}/installation/retail`,
                retailObject
              )
              .then(response => {
                return response;
              });
          },
          FetchInstallationRetailsForSku: id => {
            return $http
              .get(`${itemBaseUrl}/api/sku/${id}/installation/retail`)
              .then(response => {
                return response.data;
              });
          },
          UpdateInstallationRetailForSku: retailObject => {
            return $http
              .put(
                `${itemBaseUrl}/api/sku/installation/retail/${retailObject.id}`,
                retailObject
              )
              .then(response => {
                return response;
              });
          },
          DeleteInstallationRetail: id => {
            return $http
              .delete(`${itemBaseUrl}/api/sku/installation/retail/${id}`)
              .then(response => {
                return response;
              });
          }
        }
      }

      /**Item Vendor Collections END */
    },
    /**!!! ITEMS SERVICES END !!!**/

    /**RETAILS Start */
    Retail: {
      /**Rounding Rules Start */
      RoundingRule: {
        //Search Vendor Collections function to get all the collections by field and value
        FetchRoundingRuleGroups: () => {
          return $http
            .get(`${itemBaseUrl}/api/retail/rule/groups`)
            .then(response => {
              return response.data;
            });
        }
      },
      /**Rounding Rules END */
      /**Price Type Start */
      PriceType: {
        //Search Vendor Collections function to get all the collections by field and value
        FetchPriceTypes: () => {
          return $http
            .get(`${itemBaseUrl}/api/retail/pricetype`)
            .then(response => {
              return response.data;
            });
        }
      },

      /*Effective Date start */
      EffectiveDates: {
        // Fetch all effective dates
        GetAllEffectiveDates: () => {
          return $http
            .get(`${itemBaseUrl}/api/retail/mass-maintenance/get-all/effective-dates`)
            .then(response => {
              return response.data;
            });
        }
      },

      getRetailSKUCount: {
        getRetailSKUCounts: (effectiveDate) => {
          return $http
            .get(`${itemBaseUrl}/api/retail/mass-maintenance/get-retail/sku-count`, {
              params: {
                effective_date: effectiveDate.effective_date, 
                price_class_udd_line_id: effectiveDate.price_class,
                price_type_id: effectiveDate.price_type                   
              }
            })
            .then(response => {
              return response.data;
            })
            .catch(error => {
              console.error("Error fetching SKU count:", error);
              throw error;
            });
        }
      },

      /**Price Type END */
      /**Mass Maintenance Start */
      MassMaintenance: {
        //Search Vendor Collections function to get all the collections by field and value
        GetRetailDatesByVendorAndCollection: (
          vendorId,
          collectionId,
          query
        ) => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/vendor/${vendorId}/${collectionId}/dates`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: query
          }).then(response => {
            return response.data;
          });
        },

        GetSkuforImport: (
          query
        ) => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/exportskus`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: query
          }).then(response => {
            return response.data;
          });
        },

        GetCoverItemsforImport: (
          query
        ) => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/item/cover-img`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: query
          }).then(response => {
            return response.data;
          });
        },

        GetAllItemsforImport: (
          query
        ) => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/item/all`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: query
          }).then(response => {
            return response.data;
          });
        },

        GetAllDivisionsSkuforImport: (
          query
        ) => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/allDivisions/skus`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: query
          }).then(response => {
            return response.data;
          });
        },

        GetAllDivisionsCoverImgSku: (
          query
        ) => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/allDivisions/coverImg/skus`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: query
          }).then(response => {
            return response.data;
          });
        },

        // Getexcccl: (
        //   query
        // ) => {
        //   return $http({
        //     //Specify the url to enroute
        //     url: `${itemBaseUrl}/api/sku/get-xl`,
        //     //Method of API call is specified ie GET,PUT,POST or DELETE
        //     method: "POST",
        //     //Send objects through query string
        //     params: query
        //   }).then(response => {
        //     return response;
        //   });
        // },

        GenerateXl: massRetailCopyObject => {
          return $http
            .post(
              `${itemBaseUrl}/api/sku/get-xl`,
              massRetailCopyObject
            )
            .then(response => {
              //Return the response returned
              return response.data;
            });
        },

        GetItemPathId: (divisionId, departmentId) => {
          return $http
            .get(
              `${itemBaseUrl}/api/retail/mass-maintenance/item-path/${divisionId}/${departmentId}`
            )
            .then(response => {
              return response.data;
            });
        },
        //Search Vendor Collections function to get all the collections by field and value
        GetSkusForVendorAndCollection: (vendorId, collectionId, query) => {
          return $http
            .get(
              `${itemBaseUrl}/api/retail/mass-maintenance/vendor/${vendorId}/${collectionId}/skus`, { params: query }
            )
            .then(response => {
              return response.data;
            });
        },
        //Fetch Vendors function to get all the vendors based on the query passed
        FetchRetails: massRetailCopyObject => {
          return $http({
            //Specify the url to enroute
            url: `${itemBaseUrl}/api/retail/mass-maintenance/retails`,
            //Method of API call is specified ie GET,PUT,POST or DELETE
            method: "GET",
            //Send objects through query string
            params: massRetailCopyObject
          }).then(response => {
            //Return the response returned
            return response.data;
          });
        },
        // function to get vendor for item type id
        GetVendorsForItemTypeId: (itemTypeId) => {
          return $http
            .get(
              `${itemBaseUrl}/api/retail/mass-maintenance/itemtype/${itemTypeId}/vendors`,
            )
            .then(response => {
              return response.data;
            });
        },
        // function to get vendor for item type id
        GetVendorsForDivisionAndDepartment: (divisionId, departmentId) => {
          return $http
            .get(
              `${itemBaseUrl}/api/retail/mass-maintenance/division/${divisionId}/${departmentId}/vendors`,
            )
            .then(response => {
              return response.data;
            });
        },
        // function to get all divisions
        GetAllDivisions: () => {
          return $http
            .get(application_configuration.uddService.url + '/api/hierarchy/properties/divisions')
            .then(response => {
              return response.data;
            });
        },
        // function to get all departments and classes
        GetAllDepartments: () => {
          return $http
            .get(application_configuration.uddService.url + '/api/hierarchy/properties/departments/classes/')
            .then(response => {
              return response.data;
            });
        },
        // function to get vendor for item type id
        GetCollectionsForItemTypeIdAndVendorId: (itemTypeId, vendorId, query) => {
          return $http
            .get(
              `${itemBaseUrl}/api/retail/mass-maintenance/itemtype/${itemTypeId}/vendor/${vendorId}/collections`, { params: query }
            )
            .then(response => {
              return response.data;
            });
        },
        // function to get price type ids for selected effective date
        GetPriceTypeIdsForEffectiveDate: (effectiveDate) => {
          return $http
            .get(
              `${itemBaseUrl}/api/retail/mass-maintenance/pricetypes/effectivedate/${effectiveDate}`,
            )
            .then(response => {
              return response.data;
            });
        },
        //Fetch Vendors function to get all the vendors based on the query passed
        ExecuteRetailsCopy: massRetailCopyObject => {
          return $http
            .post(
              `${itemBaseUrl}/api/retail/mass-maintenance/execute`,
              massRetailCopyObject
            )
            .then(response => {
              //Return the response returned
              return response.data;
            });
        }
      }
      /**Mass Maintenance END */
      /**RETAILS Start END */
    }
  };
  return APIServices;
}
