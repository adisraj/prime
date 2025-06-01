function API($resource, application_configuration) {
    return {

        //TODO WE are accessing the entity api all the places ?
        EntityAPI: function(entityPrefixId) {

            return {
                EntityID: $resource(application_configuration.apiServer + '/api/entity/search/prefix-:prefix', {
                    prefix: '@prefix'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                MasterEntity: $resource(application_configuration.apiServer + '/api/entity/ismasterdata', {
                    prefix: '@prefix'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                Entity: $resource(application_configuration.apiServer + '/api/entity/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            }
        },
        EntityDetailsAPI: function() {
            return {
                EntityDetails: $resource(application_configuration.apiServer + '/api/entity/details/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),
                EntityDetailsCountForUUIDs: $resource(application_configuration.apiServer + '/api/entity/details/count/lov/:field-:values', {
                    field: '@field',
                    values: '@values'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                })
            }
        },
        CodeListAPI: function(codePrefixId) {
            return {
                CodeList: $resource(application_configuration.apiServer + '/api/codes/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': codePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': codePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': codePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': codePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                CodeListSearch: $resource(application_configuration.apiServer + '/api/codes/search/:field-:value', {
                    field: '@field',
                    value: '@value'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': codePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                CodeListMultiSearch: $resource(application_configuration.apiServer + '/api/codes/multisearch', {}, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': codePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                })
            }
        },
        Applpreferences: $resource(application_configuration.apiServer + '/api/applpreferences/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        ApplpreferencesByProperty: $resource(application_configuration.apiServer + '/api/applpreferences/property/:name', {
            name: '@name'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        TitleAPI: function(titlePrefixId) {
            return {
                Title: $resource(application_configuration.apiServer + '/api/title/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': titlePrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': titlePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': titlePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': titlePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })


            }

        },
        CountryAPI: function(countryPrefixId) {
            return {
                Country: $resource(application_configuration.apiServer + '/api/country/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': countryPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': countryPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': countryPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': countryPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                CountryAll: $resource(application_configuration.apiServer + '/api/country', {}, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': countryPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    }

                })


            }
        },
        ContactAPI: function(contactPrefixId) {
            return {
                Contact: $resource(application_configuration.apiServer + '/api/contact/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': contactPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': contactPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': contactPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': contactPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                })
            }
        },
        Department: $resource(application_configuration.apiServer + '/api/department/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        CompanyAPI: function(companyPrefixId) {
            return {
                Company: $resource(application_configuration.apiServer + '/api/company/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': companyPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': companyPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': companyPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': companyPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                })


            }
        },
        CompanyAssociateAPI: function(prefixId) {
            return {
                CompanyAssociate: $resource(application_configuration.apiServer + '/api/company/associate/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                CompanyAssociateByIndividualId: $resource(application_configuration.apiServer + '/api/company/associate/individual/:id', {
                    id: '@id'
                }, {
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                })
            }
        },


        AttributesAPI: function(attrPrefixId, attrValuePrefixId) {
            return {
                Attributes: $resource(application_configuration.apiServer + '/api/attribute/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': attrPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': attrPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': attrPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': attrPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),

                AttributeValues: $resource(application_configuration.apiServer + '/api/attribute/properties/attributeid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                AttributeValuesData: $resource(application_configuration.apiServer + '/api/attribute/properties/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': attrValuePrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                AttributesByEntityID: $resource(application_configuration.apiServer + '/api/attribute/entity/:entity_id', {
                    entity_id: '@entity_id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': attrPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })

            }

        },
        HierarchyAPI: function(hierPrefixId, hierPropPrefixId) {
            return {

                Hierarchy: $resource(application_configuration.apiServer + '/api/hierarchy/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),

                HierarchyByEntityID: $resource(application_configuration.apiServer + '/api/hierarchy/entity/:entity_id', {
                    entity_id: '@entity_id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        cancellable: true

                    }
                }),
                HierarchyListByHierarchyID: $resource(application_configuration.apiServer + '/api/hierarchy/properties/hierarchyid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': hierPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),

                HierarchyListByID: $resource(application_configuration.apiServer + '/api/hierarchy/properties/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                HierarchyPropertiesByID: $resource(application_configuration.apiServer + '/api/hierarchy/properties/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),

                HierarchyPropertiesList: $resource(application_configuration.apiServer + '/api/hierarchy/properties', {

                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': hierPropPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })

            }
        },
        CompanyDepartmentAPI: function(departmentPrefixId) {
            return {
                CompanyDepartment: $resource(application_configuration.apiServer + '/api/company/department/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': departmentPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': departmentPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': departmentPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': departmentPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
            }
        },
        MtooptionstypeAPI: function(mtooptionstypePrefixId, mtoUPrefixId, mtoBPrefixId) {
            return {
                Mtooptionstype: $resource(application_configuration.apiServer + '/api/mto/type/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtooptionstypePrefixId
                        },
                        isArray: false,
                        cancellable: true

                    }
                }),
                MtoMaintenanceUDD: $resource(application_configuration.apiServer + '/api/mto/udd/list/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtoUPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': mtoUPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                MtoUDDBulkInsert: $resource(application_configuration.apiServer + '/api/mto/udd/bridge/bulkcreate', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                MtoUDDBulkUpdate: $resource(application_configuration.apiServer + '/api/mto/udd/bridge/bulkupdate', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                MtoUDDRead: $resource(application_configuration.apiServer + '/api/mto/udd/bridge/mto_id/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                MtoUDDValueUpdate: $resource(application_configuration.apiServer + '/api/mto/udd/bridge/:id', {
                    id: '@id'
                }, {
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': "allow-data"
                        }
                    }
                }),
                ChoiceByOptionID: $resource(application_configuration.apiServer + '/api/mto/choice/option/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        headers: {
                            'prefix-id': mtoBPrefixId
                        },
                        cancellable: true
                    }
                }),
            }
        },
        IndividualAPI: function(individualPrefixId) {
            return {
                Individual: $resource(application_configuration.apiServer + '/api/individual/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': individualPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': individualPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': individualPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': individualPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            }

        },

        MtofamiliesAPI: function(mtofamiliesPrefixId) {
            return {
                Mtofamilies: $resource(application_configuration.apiServer + '/api/mto/families/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtofamiliesPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            }
        },
        LocationAPI: function(locPPrefixId, locTPrefixId, locUDDPrefixId, locMasterPrefixID) {
            return {
                LocationParameter: $resource(application_configuration.apiServer + '/api/location/parameter/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                Location: $resource(application_configuration.apiServer + '/api/location/type/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),

                LocationUDD: $resource(application_configuration.apiServer + '/api/location/udd/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),

                LocationUDDBulkUpdate: $resource(application_configuration.apiServer + '/api/location/uddbridge/bulkupdate', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': locUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),


                LocationMaster: $resource(application_configuration.apiServer + '/api/location/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': 278
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),



                LocationMaintenanceUDD: $resource(application_configuration.apiServer + '/api/location/udd/list/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': locPPrefixId
                        }
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': locPPrefixId
                        }
                    }
                }),

                LocationMasterByMultipleTypeID: $resource(application_configuration.apiServer + '/api/location/multipletypeid/:typeid', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),

                LocationUDDByLocationTypeID: $resource(application_configuration.apiServer + '/api/location/udd/locationtypeid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),

                LocationUDDByLocationTypeIDList: $resource(application_configuration.apiServer + '/api/location/udd/multiplelocationtypeid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),



                LocationUDDBulkInsert: $resource(application_configuration.apiServer + '/api/location/uddbridge/bulk', {}, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': locPPrefixId
                        }
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': locPPrefixId
                        }
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                LocationUDDRead: $resource(application_configuration.apiServer + '/api/location/uddbridge/locationid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': locPPrefixId
                        }
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': locPPrefixId
                        }
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': locPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                LocationUDDValueUpdate: $resource(application_configuration.apiServer + '/api/location/uddbridge/:id', {
                    id: '@id'
                }, {
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': "allow-data"
                        }
                    }
                })
            }
        },

        MtoCollectionsAPI: function(mtoColPPrefixId) {
            return {
                MTOCollections: $resource(application_configuration.apiServer + '/api/mto/collections/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': mtoColPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': mtoColPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': mtoColPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': mtoColPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                MtoChoiceByOptionID: $resource(application_configuration.apiServer + '/api/mto/choice/option/:option_id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),


            }

        },
        SKUAPI: function(prefix) {
            return {
                master: $resource(application_configuration.apiServer + '/api/sku/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),
                mastersearch: $resource(application_configuration.apiServer + '/api/sku/search/:field-:value', {
                    field: '@field',
                    'value': '@value'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),
                header: $resource(application_configuration.apiServer + '/api/sku/header/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                })
            }

        },
        SetAPI: function(prefixId) {
            return {
                getSet: $resource(application_configuration.apiServer + '/api/set/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': prefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
            }
        },
        ItemAPI: function(itemMasterPrefixId, itemPPrefixId, itemTPrefixId, itemUDDPrefixId) {
            return {
                ItemMaintenanceUDD: $resource(application_configuration.apiServer + '/api/item/udd/uddlist/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemUDDBulkInsert: $resource(application_configuration.apiServer + '/api/item/bridge/bulk', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemUDDBulkUpdate: $resource(application_configuration.apiServer + '/api/item/udd/bridge/bulkupdate', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemUDDRead: $resource(application_configuration.apiServer + '/api/item/bridge/itemid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemParameter: $resource(application_configuration.apiServer + '/api/item/parameter/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemUDDValueUpdate: $resource(application_configuration.apiServer + '/api/item/bridge/:id', {
                    id: '@id'
                }, {
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true,
                        headers: {
                            'prefix-id': "allow-data"
                        }
                    }
                }),

                ReadAllItemSetByParentID: $resource(application_configuration.apiServer + '/api/item/set/search/parent_item_id-:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),

                ReadAllItemSet: $resource(application_configuration.apiServer + '/api/item/set/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': itemPPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                }),
                Item: $resource(application_configuration.apiServer + '/api/item/type/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemTPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': itemTPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemTPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemUDD: $resource(application_configuration.apiServer + '/api/item/udd/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                }),
                ItemUDDOptionChoices: $resource(application_configuration.apiServer + '/api/item/udd/optionchoices/:type_id', {
                    type_id: '@type_id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    }

                }),

                ItemUDDByItemTypeIDList: $resource(application_configuration.apiServer + '/api/item/udd/multipletypeid/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true

                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': itemUDDPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }

                })

            }

        },

        ItemMaster: $resource(application_configuration.apiServer + '/api/item/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        LocationMaster: $resource(application_configuration.apiServer + '/api/location/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        VendorMaster: $resource(application_configuration.apiServer + '/api/vendor/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        MtoMaster: $resource(application_configuration.apiServer + '/api/mto/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                // headers:{'prefix-id':"access-data"},
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                // headers: { 'prefix-id': "access-data" },
                isArray: false,
                cancellable: true
            },
        }),
        MTOCollection: $resource(application_configuration.apiServer + '/api/mto/collections/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                //headers: { 'prefix-id': mtoColPPrefixId },
                isArray: false,
                cancellable: true
            },
            save: {
                method: 'post',
                //headers: { 'prefix-id': mtoColPPrefixId },
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                //headers: { 'prefix-id': mtoColPPrefixId },
                isArray: false,
                cancellable: true
            },
            delete: {
                method: 'delete',
                //headers: { 'prefix-id': mtoColPPrefixId },
                isArray: false,
                cancellable: true
            }
        }),


        ResetPassword: $resource(application_configuration.apiServer + '/api/user/passwordReset/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true


            },
            update: {
                method: 'put',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            },
            retrieve: {
                method: 'post',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true

            }
        }),
        Meta: $resource(application_configuration.apiServer + '/api/meta/:name', {
            name: '@name'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        FormValidator: $resource(application_configuration.apiServer + '/api/validations/modulename/:name/field/:field', {
            name: '@name',
            field: '@field'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        RecentActivities: $resource(application_configuration.apiServer + '/api/user/actions/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        GlobalSearchByCode: $resource(application_configuration.apiServer + '/api/globalnavigation/code/:searchCode', {
            searchCode: '@searchCode'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),


        ProfilePic: $resource(application_configuration.apiServer + '/api/user/', {

        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        ProfilePicById: $resource(application_configuration.apiServer + '/api/user/avatar?action=forcurrentuser', {

        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),
        AllProfilePics: $resource(application_configuration.apiServer + '/api/user/avatar?action=allavatar', {

        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true
            }
        }),

        SystemConfigCodeList: $resource(application_configuration.apiServer + '/api/sysconfigcodelist/property/:property', {
            property: '@property'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true

            }
        }),
        RecentActivityList: $resource(application_configuration.apiServer + '/api/user/useractions/:username', {
            username: '@username'
        }, {
            query: {
                method: 'get',
                headers: {
                    'prefix-id': "allow-data"
                },
                isArray: false,
                cancellable: true

            }
        }),
        MTOParameters: $resource(application_configuration.apiServer + '/api/mto/parameter/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true

            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        MTOMasterList: $resource(application_configuration.apiServer + '/api/mto/type/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true

            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        MTOPriceGroups: $resource(application_configuration.apiServer + '/api/mto/pricegroups/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true

            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        MTOUDDMultipleList: $resource(application_configuration.apiServer + '/api/mto/udd/multiplemtotypeid/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true

            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        MTOUDDList: $resource(application_configuration.apiServer + '/api/mto/udd/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true

            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        MTOChoiceList: $resource(application_configuration.apiServer + '/api/mto/choice/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true

            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        LocationMaster: $resource(application_configuration.apiServer + '/api/location/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        ContactSave: $resource(application_configuration.entityService.url + '/api/contact/bridge/create', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        ContactRead: $resource(application_configuration.entityService.url + '/api/contact/bridge/:entity_id', {
            entity_id: '@entity_id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        ContactUpdate: $resource(application_configuration.entityService.url + '/api/contact/bridge/update/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        ContactDelete: $resource(application_configuration.entityService.url + '/api/contact/contact/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            },
            delete: {
                method: 'delete',
                isArray: false,
                cancellable: true
            }
        }),
        AddressContactsRead: $resource(application_configuration.entityService.url + '/api/address/getaddress/:entity_type_id/:entity_id/:address_master_id', {
            entity_type_id: '@entity_type_id',
            entity_id: '@entity_id',
            address_master_id: '@address_master_id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        AddressRead: $resource(application_configuration.entityService.url + '/api/address/bridge/multisearch', {

        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        AddressUpdate: $resource(application_configuration.entityService.url + '/api/address/update/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        AddressSave: $resource(application_configuration.entityService.url + '/api/address/bridge/create', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),
        AddressDelete: $resource(application_configuration.entityService.url + '/api/address/add/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),

        CodeListTemp: $resource(application_configuration.apiServer + '/api/codes/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            save: {
                method: 'post',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            },
            delete: {
                method: 'delete',
                isArray: false,
                cancellable: true
            }

        }),
        LocationParameterTemp: $resource(application_configuration.apiServer + '/api/location/parameter/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),

        RecentHistory: $resource(application_configuration.apiServer + '/api/recent/:userid/:entity_udd_id/:instance_id', {
            userid: '@userid',
            entity_udd_id: '@entity_udd_id',
            instance_id: '@instance_id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            }
        }),

        UserPreferences: $resource(application_configuration.apiServer + '/api/applpreferences/userpreferences/:id', {
            id: '@id'
        }, {
            query: {
                method: 'get',
                isArray: false,
                cancellable: true
            },
            update: {
                method: 'put',
                isArray: false,
                cancellable: true
            }
        }),

        CompanyAssociates: function(prefixId) {
            return {
                CompanyAssociatesByDepartmentId: $resource(application_configuration.apiServer + '/api/company/associatedetails/:company_department_id', {
                    company_department_id: '@company_department_id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }
                }),
                CompanyAssociateByDepartmentID: $resource(application_configuration.apiServer + '/api/company/associate/department/:company_department_id', {
                    company_department_id: '@company_department_id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }
                })
            }
        },
        EntitySchemaAPI: function(prefixId) {
            return {
                Schema: $resource(application_configuration.apiServer + '/api/entity/schema', {}, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),
                Tables: $resource(application_configuration.apiServer + '/api/entity/schema/tables', {}, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }

                }),
                Views: $resource(application_configuration.apiServer + '/api/entity/schema/views', {}, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }

                }),
                ViewsByMicroserviceName: $resource(application_configuration.apiServer + '/api/entity/schema/views/:microservicename', {
                    microservicename: '@microservicename'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }

                }),
                ColumnsByTableName: $resource(application_configuration.apiServer + '/api/entity/schema/columns/table/:table_name', {
                    table_name: '@table_name'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }

                }),
                ColumnsById: $resource(application_configuration.apiServer + '/api/entity/schema/columns/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }

                }),
                SchemaData: $resource(application_configuration.apiServer + '/api/entity/schema/data/:id/query/:sql', {
                    id: '@id',
                    sql: '@sql'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': prefixId
                        },
                        cancellable: true
                    }

                })

            }

        }


    }
}

API.$inject = [
    '$resource',
    'application_configuration'
]
calculus.factory('API', API);
/*calculus.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common = {
        'Prefix-Id':336
      };
}]);
*/