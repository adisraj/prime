(function () {
    'use strict'
    angular.module('rc.prime.mto.choice').controller('MTOUserDefinedDataController', MTOUserDefinedDataController);
    MTOUserDefinedDataController.$inject = [
        '$scope',
        'valdr',
        'common',
        'MTOUDDService',
        'MTOUDDValueService',
        'GlobalRegularExpression'
    ];

    function MTOUserDefinedDataController(
        $scope,
        valdr,
        common,
        MTOUDDService,
        MTOUDDValueService,
        GlobalRegularExpression
    ) {
        var vm = this;
        let vmCtrl = this;
        let mto_map_key = "mto_map_id";
        let logger = common.Logger.getInstance('MTOUserDefinedDataController');

        let apiInstanceToRead = MTOUDDService.API.GetMTOUDDList;
        let apiInstanceToUddInsert = MTOUDDValueService.API.InsertMTOUDDValue;
        let apiInstanceToUddRead = MTOUDDValueService.API.SearchMTOUDDValue;
        let apiInstanceToUddValueUpdate = MTOUDDValueService.API.UpdateMTOUDDValue;
        let apiInstanceToUddValueDelete = MTOUDDValueService.API.DeleteMTOUDDValueById;
        $scope.$parent.mtoChoiceLoadingUDD = false;
        $scope.globalRegularExpression = GlobalRegularExpression;
        function init() {
            vmCtrl.attributesUDDs = undefined;
            vmCtrl.hierarchyUDDs = undefined;
            vmCtrl.isUddLoaded = false;
            $scope.$parent.mtoChoiceLoadingUDD = true;
            vmCtrl.result_udd_data = [];
            $scope.selectedHierarchyProperty = {};
            $scope.uddValidationErrors = [];
            vmCtrl.getDimensionalAttributesList();
            apiInstanceToRead($scope.choiceHead.option_type_id, $scope.choiceHead.option_id, $scope.choiceHead.collection_id, $scope.choiceHead.family_id)
                .then(response => {
                    /* attribute values (if attribute format is "Value List", "Rating" or "Multiselect") maped to particular choice */
                    // create new attribute map
                    let attributeMap = new Map();
                    let attributes = [];
                    _.each(response.data.attributes, attribute => {
                        let values = [];
                        // looping through attribute values and push the value to attributeMap with the index as map_id
                        _.each(attribute.values, value => {
                            // check whether map_id already exists
                            // if not push to the attributeMap
                            if (attributeMap[value.map_id + '-' + value.id] === undefined) {
                                attributeMap[value.map_id + '-' + value.id] = value;
                                values.push(value);
                            }
                        })
                        attribute.values = values;
                        attributes.push(attribute);
                    });
                    vmCtrl.attributesUDDs = attributes;

                    /* hierarchy properties maped to particular choice */
                    // create new hierarchy map
                    let hierarchyMap = new Map();
                    let hierarchies = [];
                    _.each(response.data.hierarchies, hierarchy => {
                        let props = [];
                        // looping through hierarchy properties and push the value to hierarchyMap with the index as map_id
                        _.each(hierarchy.props, prop => {
                            // check whether map_id already exists
                            // if not push to the hierarchyMap
                            if (hierarchyMap[prop.map_id + '-' + prop.id] === undefined) {
                                hierarchyMap[prop.map_id + '-' + prop.id] = prop;
                                props.push(prop);
                            }
                        })
                        hierarchy.props = props;
                        hierarchies.push(hierarchy);
                    });
                    vmCtrl.hierarchyUDDs = hierarchies;

                    if ($scope.edit_master_id) {
                        apiInstanceToUddRead('mto_id', $scope.edit_master_id)
                            .then(response => {
                                dataMapping(response.data);
                            }).catch(error => {
                                $scope.$parent.mtoChoiceLoadingUDD = false;
                                logger.error(error)
                            });
                    } else {
                        var response = {
                            data: []
                        }
                        dataMapping(response.data);
                    }
                }).catch(error => {
                    $scope.$parent.mtoChoiceLoadingUDD = false;
                    logger.error(error)
                });
        }

        vmCtrl.getDimensionalAttributesList = () => {
            if (!common.LocalMemory.API.Get("DimensionAttributesMap")) {
                common.EntityDetails.API.GetGraphSet(
                    common.Identifiers.attribute,
                    [
                        "id",
                        "description",
                        "format",
                        "dimension_class",
                        "dimension_unit"
                    ],

                    "format_id",
                    9
                )
                    .then(res => {
                        let attributeListMap = {};
                        for (let i = 0; i < res.length; i++) {
                            if (attributeListMap[res[i].id] === undefined) {
                                attributeListMap[res[i].id] = res[i];
                            }
                        }
                        common.LocalMemory.API.Post(
                            "DimensionAttributesMap",
                            attributeListMap
                        );
                        vmCtrl.dimensionAttributesMap = attributeListMap;
                    })
                    .catch(err => logger.error(err));
            } else {
                vmCtrl.dimensionAttributesMap = JSON.parse(common.LocalMemory.API.Get("DimensionAttributesMap"));
            }
        };

        vmCtrl.init = init;
        $scope.$watch("isEnabled", function (n, o) {
            if (n && $scope.choiceHead.status_id) {
                vmCtrl.setDefaultValues = false;
                vmCtrl.init();
            }
        });

        $scope.setPropertyFn = function (data) {
            $scope.selectedHierarchyProperty = data.selectedHierarchyProperty;
        };

        var default_status_id = 200; // ACTIVE for ALL
        function dataMapping(results) {
            $scope.$parent.mtoChoiceLoadingUDD = false;
            vmCtrl.editData = results;
            if (results.length > 0) {
                $scope.setdefault = false;
            } else {
                $scope.setdefault = true;
            }
            var data = {}; // It contains all hierarchies,attributes,options
            $scope.uddValues = {};
            var mapIds = [];
            var hierarchyPropsMap = {};
            for (var i = 0; i < vmCtrl.attributesUDDs.length; i++) {
                var attributeUDD = vmCtrl.attributesUDDs[i];
                attributeUDD.isRequired = false;
                attributeUDD.requiredImgScript = "optionalFieldNotation";
                // If the attribute UDD is  a required udd and if the value List has no values, show an error
                if (
                    vmCtrl.attributesUDDs[i].values.length === 1 &&
                    (vmCtrl.attributesUDDs[i]["format"] === "Value List" || vmCtrl.attributesUDDs[i]["format"] === "Rating" || vmCtrl.attributesUDDs[i]["format"].toLowerCase() == "multiselect") &&
                    vmCtrl.attributesUDDs[i].values[0]["id"] === null
                ) {
                    if ($scope.uddValidationErrors.length > 0) {
                        if (
                            $scope.uddValidationErrors.filter(
                                uddValidationError =>
                                    uddValidationError.user_defined_data_type.toLowerCase() ===
                                    "attribute"
                            ).length > 0
                        ) {
                            $scope.uddValidationErrors.filter(uddValidationError => {
                                if (
                                    uddValidationError.user_defined_data_type.toLowerCase() ===
                                    "attribute" &&
                                    !uddValidationError.udd_description.includes(
                                        vmCtrl.attributesUDDs[i]["short_description"]
                                    )
                                ) {
                                    uddValidationError.udd_description +=
                                        " , " + vmCtrl.attributesUDDs[i]["short_description"];
                                }
                            });
                        } else {
                            $scope.uddValidationErrors.push({
                                user_defined_data_type: "Attribute",
                                udd_description: vmCtrl.attributesUDDs[i]["short_description"]
                            });
                        }
                    } else {
                        $scope.uddValidationErrors.push({
                            user_defined_data_type: "Attribute",
                            udd_description: vmCtrl.attributesUDDs[i]["short_description"]
                        });
                    }
                }
                if ($scope.choiceHead.status_id !== 100 && attributeUDD.required.toLowerCase() === 'activation') {
                    if (attributeUDD.format.toLowerCase() === "yes/no") {
                        attributeUDD.isRequired = false;
                    }
                    else attributeUDD.isRequired = true;
                    attributeUDD.requiredImgScript = "optionalFieldNotation";
                } else if (attributeUDD.required.toLowerCase() === 'immediate') {
                    if (attributeUDD.format.toLowerCase() === "yes/no") {
                        attributeUDD.isRequired = false;
                    }
                    else attributeUDD.isRequired = true;
                    attributeUDD.requiredImgScript = "requiredFieldNotation";
                } else if (attributeUDD.required.toLowerCase() == "no") {
                    attributeUDD.isRequired = false;
                    attributeUDD.requiredImgScript = "FieldNotation"
                }

                if (attributeUDD.format && attributeUDD.format.toLowerCase() == 'multiselect') {
                    let valuesMap = [];
                    for (let i = 0; i < attributeUDD.values.length; i++) {
                        if (valuesMap[attributeUDD.values[i].id] === undefined) {
                            valuesMap[attributeUDD.values[i].id] = attributeUDD.values[i];
                        }
                    }
                    attributeUDD.valuesMap = valuesMap;
                }
                data[attributeUDD.map_id] = attributeUDD;
                data[attributeUDD.map_id]["user_defined_data_type"] = "Attribute";
                mapIds.push(attributeUDD.map_id);
            };
            for (var i = 0; i < vmCtrl.hierarchyUDDs.length; i++) {
                var hierarchyUDD = vmCtrl.hierarchyUDDs[i];
                hierarchyUDD.isRequired = false;
                hierarchyUDD.requiredImgScript = "optionalFieldNotation";
                // If the hierarchy UDD is  a required udd and if it has no values, show an error
                if (
                    vmCtrl.hierarchyUDDs[i].props.length === 1 &&
                    vmCtrl.hierarchyUDDs[i].props[0]["id"] === null
                ) {
                    if ($scope.uddValidationErrors.length > 0) {
                        if ($scope.uddValidationErrors.filter(uddValidationError =>
                            uddValidationError.user_defined_data_type.toLowerCase() === 'hierarchy').length > 0) {
                            $scope.uddValidationErrors.filter(uddValidationError => {
                                if (uddValidationError.user_defined_data_type.toLowerCase() === 'hierarchy' &&
                                    !uddValidationError.udd_description.includes(vmCtrl.hierarchyUDDs[i]["short_description"])) {
                                    uddValidationError.udd_description +=
                                        " , " + vmCtrl.hierarchyUDDs[i]["short_description"];
                                }
                            })
                        } else {
                            $scope.uddValidationErrors.push({
                                user_defined_data_type: "Hierarchy",
                                udd_description: vmCtrl.hierarchyUDDs[i]["short_description"]
                            });
                        }
                    } else {
                        $scope.uddValidationErrors.push({
                            user_defined_data_type: "Hierarchy",
                            udd_description: vmCtrl.hierarchyUDDs[i]["short_description"]
                        });
                    }
                }
                if ($scope.choiceHead.status_id !== 100 && hierarchyUDD.required.toLowerCase() === 'activation') {
                    hierarchyUDD.isRequired = true;
                    hierarchyUDD.requiredImgScript = "optionalFieldNotation";
                } else if (hierarchyUDD.required.toLowerCase() === 'immediate') {
                    hierarchyUDD.isRequired = true;
                    hierarchyUDD.requiredImgScript = "requiredFieldNotation";
                } else if (hierarchyUDD.required.toLowerCase() == "no") {
                    hierarchyUDD.isRequired = false;
                    hierarchyUDD.requiredImgScript = "FieldNotation"
                }
                data[hierarchyUDD.map_id] = hierarchyUDD;
                data[hierarchyUDD.map_id]["user_defined_data_type"] = "Hierarchy";
                for (var j = 0; j < hierarchyUDD.props.length; j++) {
                    hierarchyPropsMap[hierarchyUDD.props[j]['id']] = hierarchyUDD.props[j];
                }
                mapIds.push(hierarchyUDD.map_id);
            };

            let dormantMapIds = _.clone(mapIds);
            /** Edit Data Contains already created user defined data */
            for (var i = 0; i < vmCtrl.editData.length; i++) {
                var ed = vmCtrl.editData[i];
                if (data[ed[mto_map_key]] !== undefined) {
                    // if value for udd is set already then remove the id from dromant ids array
                    dormantMapIds.splice(dormantMapIds.findIndex(mapId => mapId === ed[mto_map_key]), 1);
                    if (data[ed[mto_map_key]].format && data[ed[mto_map_key]].format.toLowerCase() == 'multiselect' && (ed.value !== null || ed.value !== undefined || ed.value !== "")) {
                        data[ed[mto_map_key]]['selectedValueIds'] = ed.value.split(',').map(Number);
                    } else {
                        data[ed[mto_map_key]]["value"] = ed.value;
                    }
                    data[ed[mto_map_key]]["old_value"] = ed.udd_value_id || ed.value;
                    data[ed[mto_map_key]]["udd_value_id"] = ed.udd_value_id;
                    data[ed[mto_map_key]]["udd_bridge_id"] = ed.id;
                    data[ed[mto_map_key]]["isCreated"] = true;
                }
            }

            // if Update MTO choice then do not show default values in udd fields -- TO SHOW DEFAULT VALUES
            if (!common.$state.current.name.endsWith(".update") && !common.$stateParams.id) {
                // Assign defualt value to the fields for udds which does not have any values
                for (let i = 0; i < dormantMapIds.length; i++) {
                    if (data[dormantMapIds[i]].user_defined_data_type.toLowerCase() === "attribute") {
                        // if udd is of attribute type then check format as well to set default value 
                        if (data[dormantMapIds[i]].format.toLowerCase() === "multiselect") {
                            // Assign previous value in udd screen field if it has value, otherwise show defalut value.   
                            if (data[dormantMapIds[i]].value) {
                                data[dormantMapIds[i]].selectedValueIds = data[dormantMapIds[i]].value.split(",").map(Number)
                            } else {
                                data[dormantMapIds[i]].default_value ?
                                    data[dormantMapIds[i]].selectedValueIds = data[dormantMapIds[i]].default_value.split(",").map(Number) :
                                    null;
                            }
                        } else if (
                            data[dormantMapIds[i]].format.toLowerCase() === "value list" ||
                            data[dormantMapIds[i]].format.toLowerCase() === "rating"
                        ) {
                            if (!data[dormantMapIds[i]].udd_value_id) {
                                data[dormantMapIds[i]].default_value ?
                                    data[dormantMapIds[i]].udd_value_id = Number(data[dormantMapIds[i]].default_value) :
                                    null;
                            } else {
                                data[dormantMapIds[i]].udd_value_id ? null : data[dormantMapIds[i]].udd_value_id = data[dormantMapIds[i]].default_value;
                            }
                        } else if (
                            data[dormantMapIds[i]].format.toLowerCase() === "text") {
                            if (!data[dormantMapIds[i]].value) {
                                data[dormantMapIds[i]].default_value ?
                                    data[dormantMapIds[i]].value = data[dormantMapIds[i]].default_value :
                                    null;
                            } else {
                                data[dormantMapIds[i]].value ? null : data[dormantMapIds[i]].value = data[dormantMapIds[i]].default_value;
                            }
                        } else {
                            if (!data[dormantMapIds[i]].value) {
                                data[dormantMapIds[i]].default_value ?
                                    data[dormantMapIds[i]].value = data[dormantMapIds[i]].default_value :
                                    null;
                            } else {
                                data[dormantMapIds[i]].value ? null : data[dormantMapIds[i]].value = data[dormantMapIds[i]].default_value;
                            }
                        }
                    } else {
                        data[dormantMapIds[i]].udd_value_id ? null : data[dormantMapIds[i]].udd_value_id = data[dormantMapIds[i]].default_value;
                    }
                }
            }

            var uddRules = {};
            vmCtrl.result_udd_data = [];
            for (var i = 0; i < mapIds.length; i++) {
                var mapId = mapIds[i];
                // Setting validation rules using from and to and required value
                uddRules[mapId] = {};
                if (data[mapId]['isRequired']) {
                    uddRules[mapId]['required'] = {
                        'message': data[mapId]['maintenance_description'] + ' is required'
                    }
                }
                if (data[mapId]["format"]) {
                    if (data[mapId]["format"].toLowerCase() === "integer") {
                        uddRules[mapId]["digits"] = {
                            integer: data[mapId]["to"].length,
                            message: "Must be integer between " +
                                data[mapId]["from"] +
                                " and " +
                                data[mapId]["to"]
                        };
                        uddRules[mapId]["range"] = {
                            from: data[mapId]["from"],
                            to: data[mapId]["to"],
                            message: "Must be integer between " +
                                data[mapId]["from"] +
                                " and " +
                                data[mapId]["to"]
                        };
                        data[mapId]["message"] =
                            data[mapId]["maintenance_description"] +
                            " must be integer between " +
                            data[mapId]["from"] +
                            " and " +
                            data[mapId]["to"];
                    } else if (data[mapId]["format"].toLowerCase() === "decimal") {
                        uddRules[mapId]["digits"] = {
                            integer: 10,
                            fraction: 8,
                            message: "Must be Decimal number"
                        };
                        uddRules[mapId]["range"] = {
                            from: data[mapId]["from"],
                            to: data[mapId]["to"],
                            message: "Must be decimal between " +
                                data[mapId]["from"] +
                                " and " +
                                data[mapId]["to"]
                        };
                        data[mapId]["message"] =
                            data[mapId]["maintenance_description"] +
                            " must be decimal between " +
                            data[mapId]["from"] +
                            " and " +
                            data[mapId]["to"];
                    } else if (data[mapId]["format"].toLowerCase() === "date") {
                        uddRules[mapId]["startAndEndDateCompare"] = {
                            sval: data[mapId]["from"],
                            eval: data[mapId]["to"],
                            message: "Must be between " +
                                moment(data[mapId]["from"]).format($scope.date_format) +
                                " and " +
                                moment(data[mapId]["to"]).format($scope.date_format)
                        };
                    } else if (data[mapId]["format"].toLowerCase() === "percentage") {
                        uddRules[mapId]["digits"] = {
                            integer: 10,
                            fraction: 8,
                            message: "Must be percentage number"
                        };
                        uddRules[mapId]["range"] = {
                            from: parseInt(data[mapId]["from"].replace('%', '')),
                            to: parseInt(data[mapId]["to"].replace('%', '')),
                            message: "Must be percentage between " +
                                data[mapId]["from"] +
                                " and " +
                                data[mapId]["to"]
                        };
                        data[mapId]["message"] =
                            data[mapId]["maintenance_description"] +
                            " must be decimal between " +
                            data[mapId]["from"] +
                            " and " +
                            data[mapId]["to"];
                    } else if (data[mapId]["format"].toLowerCase() === "date") {
                        uddRules[mapId]["startAndEndDateCompare"] = {
                            sval: data[mapId]["from"],
                            eval: data[mapId]["to"],
                            message: "Must be between " +
                                moment(data[mapId]["from"]).format($scope.date_format) +
                                " and " +
                                moment(data[mapId]["to"]).format($scope.date_format)
                        };
                    } else if (data[mapId]["format"].toLowerCase() === "dimension") {
                        uddRules[mapId]["digits"] = {
                            integer: data[mapId]["to"].length,
                            fraction: 8,
                            message: "Must be number between " +
                                data[mapId]["from"] + " " + vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
                                " and " +
                                data[mapId]["to"] + " " + vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
                                " with upto 8 decimal digits."
                        };
                        uddRules[mapId]["range"] = {
                            from: data[mapId]["from"],
                            to: data[mapId]["to"],
                            message: "Must be number between " +
                                data[mapId]["from"] + " " + vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
                                " and " +
                                data[mapId]["to"] + " " + vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit
                        };
                        data[mapId]["message"] =
                            data[mapId]["maintenance_description"] +
                            " must be number between " +
                            data[mapId]["from"] + " " + vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
                            " and " +
                            data[mapId]["to"] + " " + vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit;
                    } else if (data[mapId]["format"].toLowerCase() === "text") {
                        uddRules[mapId]["minLength"] = {
                            number: data[mapId]["from"],
                            message: "Must be text between " +
                                data[mapId]["from"] +
                                " and " +
                                data[mapId]["to"] +
                                " characters"
                        };
                        uddRules[mapId]["maxLength"] = {
                            number: data[mapId]["to"],
                            message: "Must be text between " +
                                data[mapId]["from"] +
                                " and " +
                                data[mapId]["to"] +
                                " characters"
                        };
                        data[mapId]["message"] =
                            data[mapId]["maintenance_description"] +
                            " must be text between " +
                            data[mapId]["from"] +
                            " and " +
                            data[mapId]["to"] +
                            " characters";
                    } else if (data[mapId]["format"].toLowerCase() === "url") {
                        uddRules[mapId]["pattern"] = {
                            value: /^((http|https):\/\/)?(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/,
                            message: "Must be a valid URL and link text should contain alpha-numeric characters."
                        };
                        data[mapId]["message"] =
                            data[mapId]["maintenance_description"] + " must be in a valid URL format. And link text should contain alpha-numeric characters.";
                    }
                }
                vmCtrl.result_udd_data.push(data[mapId]);
            };
            valdr.addConstraints({
                UddRules: uddRules
            });
            $scope.$parent.uddData = vmCtrl.result_udd_data;
            vmCtrl.isUddLoaded = true;
        }
        // Function to get link text and url path from URL format value saved
        vm.setLinkTextAndUrlPathModel = (urlUdd) => {
            // Check if the url udd value exists for the given udd
            if (urlUdd.value && urlUdd.value.length) {
                // Each url value will be saved the forma link_text::url_path, split by ::
                let urlValue = urlUdd.value.split("::");
                urlUdd.link_text_value = urlValue[0];
                urlUdd.url_path_value = urlValue[1];
            }
        }
        $scope.setDateValue = function (to_from_val, value) {
            if (value !== null && value !== undefined) {
                return $scope.getDateBasedOnFormat(value);
            } else if (to_from_val !== null && to_from_val !== undefined) {
                return $scope.getDateBasedOnFormat(to_from_val);
            }
        };
        $scope.setValue = function (to_from_val, value) {
            if (value !== undefined && value !== null) {
                return value;
            }
            if (to_from_val !== null) {
                return to_from_val;
            }
        }
        $scope.setPercentValue = function (to_from_val, from, value) {
            if (value) {
                return value;
            }
            if (to_from_val !== null && to_from_val !== undefined) {
                return to_from_val;
            } else {
                from = from.replace('%', '');
                return from;
            }
        }


        function updateUddValue(uddValObj, notificationString) {
            return new Promise(function (resolve, reject) {
                apiInstanceToUddValueUpdate(uddValObj).then(res => {
                    // body...
                    init();
                    if (notificationString == "show_notification") {
                        $scope.mtoChoiceUDDSuccessMessage = res.data.message;
                    }
                    resolve(res);
                }).catch(error => logger.error(error));
            });
        }

        function deleteUddValues(valueId) {
            return new Promise(function (resolve, reject) {
                apiInstanceToUddValueDelete(valueId)
                    .then(response => {
                        resolve(response);
                    })
                    .catch(error => logger.error(error));
            });
        }

        // This variable is to initialize the dropdown object used in selectize
        $scope.selectUddDropDown = {};
        // This is called in the selectize on each dropdown which is created in the ng-repeat
        vmCtrl.initDropDown = current_udd_data => {
            // Configure select UDD dropdown object
            $scope.selectUddDropDown[current_udd_data.maintenance_description] = {
                valueField: "id",
                labelField: "description",
                searchField: ["description"],
                sortField: "description",
                // Space is concatinated so that end of the text does not cut off
                placeholder: "Select " + current_udd_data.maintenance_description + " ",
                allowEmptyOption: true,
                create: false,
                highlight: false,
                hideSelected: true,

                searchConjunction: "or",
                // Adding the data to the options, so as to show the data in the dropdown
                options: current_udd_data.values,
                render: {
                    option: (data, escape) => {
                        if (data.value_status.toLowerCase() === "inactive") {
                            return ('<div class="p-5 disabled">' +
                                '<div class="m-5">' +
                                '<span class="c-black f-13"> ' +
                                escape(data.description) +
                                " : " +
                                data.value_status +
                                "</span>" +
                                "</div>" +
                                "</div>")
                        } else {
                            return (
                                '<div class="p-5">' +
                                '<div class="m-5">' +
                                '<span class="c-black f-13"> ' +
                                escape(data.description) +
                                " : " +
                                data.value_status +
                                "</span>" +
                                "</div>" +
                                "</div>"
                            );
                        }
                    },
                    // The selected option is sent to the item object
                    item: (data, escape) => {
                        return (
                            '<div class="option">' +
                            '<span class="title m-r-5">' +
                            escape(data.description) +
                            "</span>" +
                            "</div>"
                        );
                    }
                }
            };
        };

        function hasUpdateChanges(object, currentUddData) {
            let omitKeys = ["id", "mto_id", "mto_map_id", "status_id"];
            for (let key in object) {
                if (!omitKeys.includes(key)) {
                    if (key === "value" || key === "udd_value_id") {
                        if (currentUddData.user_defined_data_type.toLowerCase() === 'attribute' &&
                            (currentUddData["format"].toLowerCase() === 'date' || currentUddData["format"].toLowerCase() === 'multiselect' || currentUddData["format"].toLowerCase() === 'text')) {
                            if (object[key] === currentUddData["old_value"]) {
                                vmCtrl.hasUpdateChanges = false;
                            } else {
                                return (vmCtrl.hasUpdateChanges = true);
                            }
                        } else if (currentUddData.user_defined_data_type.toLowerCase() === 'attribute' &&
                            (currentUddData["format"].toLowerCase() === 'decimal')) {
                            if (parseFloat(object[key]) === parseFloat(currentUddData["old_value"])) {
                                vmCtrl.hasUpdateChanges = false;
                            }
                        } else {
                            if (object[key] == currentUddData["old_value"]) {
                                vmCtrl.hasUpdateChanges = false;
                            } else {
                                if (key === 'udd_value_id' && object[key] === 0) {
                                    return (vmCtrl.hasUpdateChanges = false);
                                } else {
                                    return (vmCtrl.hasUpdateChanges = true);
                                }
                            }
                        }
                    } else {
                        if (object[key] === currentUddData[key]) {
                            vmCtrl.hasUpdateChanges = false;
                        } else {
                            return (vmCtrl.hasUpdateChanges = true);
                        }
                    }
                }
            }
            return vmCtrl.hasUpdateChanges;
        }

        $scope.update_udd_values = function () {
            var updatePromises = [];
            var createUddValues = [];
            var deletePromises = [];
            var deleteUddValueIds = [];
            let hasChanges = false;
            var notificationString = "show_notification";
            if (vmCtrl.result_udd_data) {
                for (var i = 0; i < vmCtrl.result_udd_data.length; i++) {
                    var obj = vmCtrl.result_udd_data[i];
                    var udd_obj = {};
                    var flag = false;
                    udd_obj.id = obj.udd_bridge_id;
                    udd_obj["status_id"] = default_status_id; // code 200 Always ACTIVE
                    udd_obj["mto_map_id"] = obj.map_id;

                    /* Attribute , MTO Type , MTO Option */

                    if (obj.format && obj.selectedValueIds && obj.format.toLowerCase() === 'multiselect' && obj.selectedValueIds && obj.selectedValueIds.length > 0) {
                        udd_obj.value = obj.selectedValueIds.join(',');
                        obj.value = obj.selectedValueIds.join(",");
                        flag = true;
                    }

                    if (obj.user_defined_data_type !== 'Hierarchy' && obj.udd_value_id !== null && obj.udd_value_id !== undefined && obj.udd_value_id !== "") {
                        udd_obj.udd_value_id = obj.udd_value_id;
                        flag = true;
                    } else if (obj.format && obj.format.toLowerCase() === "yes/no" &&
                        (obj.value === undefined || obj.value === null || obj.value === '')) {
                        udd_obj.value = '0';
                        flag = true;
                    }

                    /* Attribute has no dropdown - integer,decimal,date,percentage,yes/no etc.*/
                    if (typeof (obj.has_values) !== 'undefined' && obj.has_values == 0 && obj.value !== null && obj.value !== undefined && obj.value !== "") {
                        udd_obj.value = (obj.value).toString();
                        flag = true;
                        if (obj.format == 'Date') {
                            udd_obj.value = moment(obj.value, $scope.date_format).format("YYYY-MM-DD");
                        }
                    }
                    /* Hierarchy Dropdown */
                    if (obj.user_defined_data_type === 'Hierarchy') {
                        if ($scope.selectedHierarchyProperty !== undefined && $scope.selectedHierarchyProperty[obj.map_id] !== undefined &&
                            $scope.selectedHierarchyProperty[obj.map_id]["property_id"] &&
                            $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !== "" &&
                            $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !== null &&
                            $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !== undefined) {
                            udd_obj.udd_value_id = $scope.selectedHierarchyProperty[obj.map_id]["property_id"];
                        } else {
                            if (obj.udd_value_id !== null &&
                                obj.udd_value_id !== 'null' &&
                                obj.udd_value_id !== undefined &&
                                obj.udd_value_id !== "") {
                                udd_obj.udd_value_id = obj.udd_value_id;
                            }
                        }
                        flag = true;
                    };

                    if (obj.old_value && !obj.value && !obj.udd_value_id &&
                        ((obj.user_defined_data_type.toLowerCase() === 'attribute' &&
                            obj.format.toLowerCase() !== 'yes/no') ||
                            obj.user_defined_data_type.toLowerCase() !== 'attribute')) {
                        deletePromises.push(deleteUddValues(obj.udd_bridge_id));
                        deleteUddValueIds.push(obj.udd_bridge_id);
                    }

                    if (obj.isCreated !== undefined) {
                        udd_obj["mto_id"] = $scope.choiceHead.id;

                        if (hasUpdateChanges(udd_obj, obj)) {
                            hasChanges = true;
                            updatePromises.push(updateUddValue(udd_obj, notificationString));
                            notificationString = "hide_notification";
                        }
                    } else {
                        delete udd_obj.id;
                        udd_obj["mto_id"] = $scope.inserted_id;
                        if (flag && (udd_obj.udd_value_id || udd_obj.value)) {
                            createUddValues.push(udd_obj);
                        }
                    }
                }
            } else {
                $scope.mtoChoiceUDDSuccessMessage = "Nothing to update in MTO Choice UDD";
            }

            Promise.all(updatePromises)
                .then(() => {
                    if (deleteUddValueIds.length === 0 && !hasChanges) {
                        $scope.mtoChoiceUDDSuccessMessage =
                            "Nothing to update in MTO Choice UDD";
                    }
                })
                .catch(() => { });

            Promise.all(deletePromises)
                .then(() => {
                    if (deleteUddValueIds.length > 0) {
                        init();
                        $scope.mtoChoiceUDDSuccessMessage = 'MTO Choice user defined data updated successfully.';
                    }
                })
                .catch(() => { });

            if (createUddValues.length > 0) {
                var uddValuesObj = {};
                uddValuesObj['Objects'] = createUddValues;
                uddValuesObj['action'] = 'bulk';
                apiInstanceToUddInsert(uddValuesObj)
                    .then(response => {
                        $scope.mtoChoiceUDDSuccessMessage = response.data.message;
                        $scope.edit_master_id = $scope.inserted_id;
                        init();

                    }).catch(error => {
                        $scope.edit_master_id = $scope.inserted_id;
                        init();
                        logger.error(error);
                    });
            }
        };

        // function to reset udd value
        $scope.resetUddValue = (udd) => {
            if (udd && udd.format && udd.format.toLowerCase() === 'yes/no') {
                udd.value = "0";
            } else if (udd && udd.format && udd.format.toLowerCase() === 'url') {
                udd.value = "";
                udd.link_text_value = "";
                udd.url_path_value = "";
            } else {
                udd.value = "";
            }
            if (udd.user_defined_data_type.toLowerCase() === 'hierarchy' &&
                $scope.selectedHierarchyProperty[udd.map_id]) {
                $scope.selectedHierarchyProperty[udd.map_id] = undefined;
            }
            udd.udd_value_id = undefined;
            udd.selectedValueIds = [];
        }

        $scope.$on('saveOrUpdateUdd', function (e, args) {
            /* variables to reset the Notification message-start */
            $scope.mtoChoiceSuccessMessage = null;
            $scope.mtoChoiceErrorMessage = null;
            $scope.mtoChoiceUDDSuccessMessage = null;
            /* variables to reset the Notification message-end */
            if (
                args.response != undefined &&
                (args.response.status === 200 ||
                    args.response.status === 201 ||
                    args.response.status === 403)
            ) {
                if ((args.response.data && args.response.data.inserted_id) || args.response.inserted_id) {
                    $scope.mtoChoiceSuccessMessage = "MTO Choice is created Successfully";
                } else {
                    args.response.status === 403 ?
                        ($scope.mtoChoiceSuccessMessage =
                            "Nothing to update in MTO Choice Master") :
                        ($scope.mtoChoiceSuccessMessage =
                            "MTO Choice is updated Successfully");
                }
                $scope.inserted_id = args.inserted_id;
                $scope.update_udd_values();
            } else if (args.error !== undefined) {
                if (args.error.data.status === 412) {
                    $scope.mtoChoiceErrorMessage = [args.error.data.error.message];
                } else if (args.error.data.status === 505) {
                    $scope.mtoChoiceErrorMessage = [args.error.data.error];
                }
            } else {
                $scope.mtoChoiceErrorMessage = args.response.form_validation_error;
            }
        });
    };

    // Directive 
    (function () {
        'use strict';

        angular
            .module('rc.prime.mto.choice')
            .directive('mtoUserdefinedDataDirective', mtoUserdefinedDataDirective);


        function mtoUserdefinedDataDirective() {
            // Usage:
            //     <mto-userdefined-data-directive> </mto-userdefined-data-directive>
            // Creates:
            // 
            var directive = {
                restrict: 'EA',
                controller: MTOUserDefinedDataController,
                controllerAs: 'vmCtrl',
                templateUrl: 'application/modules/mto/choice/mto.choice.udd.directive.html',
            };
            return directive;
        }
    })();
})();