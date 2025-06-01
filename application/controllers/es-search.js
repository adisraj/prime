"use strict";
angular.module("rc.search", ["calculus.application", "elasticsearch"]);
angular.module("rc.search").service("DataFilterService", DataFilterService);
angular.module("rc.search").factory("elasticClient", [
    "esFactory",
    function (esFactory) {
        // this will actually create a "Client"-Instance which you can configure as you wish.
        return esFactory({
            host: "http://18.220.98.244:9707"
        });
    }
]);

function DataFilterService() {
    this.filters = {
        availableFilters: {},
        selectedFilters: []
    };
    this.findSelectedFilter = (fieldName, value) => {
        let selectedFilters = this.filters.selectedFilters;
        for (let index = 0; index < selectedFilters.length; index++) {
            const element = selectedFilters[index];
            if (element.field == fieldName && element.value == value) {
                return index;
            }
        }
        return -1;
    };
    this.formatFilters = aggregations => {
        let formattedFilters = {};
        for (let aggregation in aggregations) {
            if (aggregations.hasOwnProperty(aggregation)) {
                let filters = aggregations[aggregation].buckets.map(object => {
                    let isSelected = () => {
                        return this.findSelectedFilter(aggregation, object.key) == -1
                            ? false
                            : true;
                    };
                    return {
                        value: object.key,
                        count: object.doc_count,
                        isSelected: isSelected()
                    };
                });
                formattedFilters[aggregation] = filters;
            }
        }
        this.filters.availableFilters = formattedFilters;
    };
}

class DataSearchFactory {
    constructor(
        $http,
        application_configuration,
        $q,
        esFactory,
        DataFilterService,
        elasticClient,
        VendorService,
    ) {
        this.$http = $http;
        this.application_configuration = application_configuration;
        this.$q = $q;
        this.esFactory = esFactory;
        this.DataFilterService = DataFilterService;
        this.VendorService = VendorService;
        this.esClient = elasticClient;
    }

    setQuery(searchTerms, selectedFilters) {
        let query = {
            multi_match: {
                query: searchTerms,
                fields: ["name", "long_description", "vendor", "_all"]
            }
        };

        let filteredQuery = {
            bool: {
                must: [],
                filter: query
            }
        };

        if (selectedFilters && selectedFilters.length > 0) {
            selectedFilters.forEach((filter, key) => {
                let object = { term: {} };
                object.term["vendor.keyword"] = filter.value;
                filteredQuery.bool.must.push(object);
            });
        }
        return selectedFilters && selectedFilters.length > 0
            ? filteredQuery
            : query;
    }

    getSuggestions(query) {
        let sortObject = {};

        let terms = query.split(" ");
        let baseTerms =
            terms.length === 1 ? "" : terms.slice(0, -1).join(" ") + " ";
        let lastTerm = terms[terms.length - 1].toLowerCase();

        let deferred = this.$q.defer();
        this.esClient
            .search({
                index: "items_index",
                body: {
                    query: {
                        simple_query_string: {
                            fields: ["name"],
                            query: baseTerms + "(" + lastTerm + "|" + lastTerm + "*)",
                            default_operator: "and"
                        }
                    },
                    suggest: {
                        text: query,
                        phraseSuggestion: {
                            phrase: {
                                field: "name",
                                direct_generator: [
                                    {
                                        field: "name",
                                        suggest_mode: "popular",
                                        min_word_length: 3,
                                        prefix_length: 2
                                    }
                                ]
                            }
                        }
                    },
                    size: 3,
                    _source: ["name"]
                }
            })
            .then(function (es_return) {
                deferred.resolve(es_return);
            })
            .then(function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    }

    search(searchTerms, resultsPage, selectedSort, selectedFilters) {
        let sortObject = {};
        sortObject[selectedSort.name] = selectedSort.direction;
        let deferred = this.$q.defer();
        this.esClient
            .search({
                index: "items_index",
                body: {
                    query: this.setQuery(searchTerms, selectedFilters),
                    sort: [sortObject],
                    aggs: {
                        vendors: {
                            terms: {
                                field: "vendor.keyword",
                                size: 1000,
                                order: { _key: "asc" }
                            }
                        }
                    }
                },
                from: resultsPage * 10
            })
            .then(function (es_return) {
                deferred.resolve(es_return);
            })
            .then(function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    }
}

angular.module("rc.search").factory("DataSearchFactory", DataSearchFactory);

class DataSearchController {
    constructor(
        $scope,
        $rootScope,
        $state,
        common,
        DataSearchFactory,
        DataFilterService,
        ItemService,
        SKUService,
        VendorService,
        LocationFactory,
        MTOService,
        DataLakeAPIService,
        $stateParams,
        SessionMemory
    ) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.common = common;
        this.SessionMemory = SessionMemory;
        this.logger = common.Logger.getInstance("DataSearchController");
        this.DataSearchFactory = DataSearchFactory;
        this.DataFilterFactory = DataFilterService;
        this.ItemServiceFactory = ItemService;
        this.locationServiceFactory = LocationFactory;
        this.SKUServiceFactory = SKUService;
        this.VendorService = VendorService;
        this.mtoServiceFactory = MTOService;
        this.DataLakeFactory = DataLakeAPIService;
        this._search = null;
        this.showSearchPanel = false;
        this.noResults = false;
        this.$stateParams = $stateParams;
        //  this.isNotFoundResult = false;
        this.isSearching = false;
        this.resultsPage = 0;
        this.results = {
            searchTerms: null,
            documents: [],
            documentCount: null
        };
        this.$rootScope.$on("closeAvailbility", (e, flag) => {
            this.goBack()
        })
        this.sortOptions = [
            { name: "_score", displayName: "Relevancy", direction: "desc" },
            { name: "item_type.keyword", displayName: "Item Type", direction: "asc" }
        ];
        this.selectedSort = this.sortOptions[0];
        this.filters = this.DataFilterFactory.filters;
        this.autoComplete = {
            suggestions: []
        };
        this.showAutoComplete = false;
        this.searched = false;

        // sku search
        this.isSKUFound = false;
        this.loadSearchData();
    }

    loadSearchData() {
        //Data for the suggestion drop down
        this.globalSearchData = [
            { 'label': "SKU Number ", 'value': "SKU: ", 'imgSrc': "./img/barcode.svg" },
            // {'label': "Location", 'value': "Location: ", 'imgSrc': "./img/sidebar-icons/entity-config-location.svg"},
            // {'label': "Vendor Name", 'value': "Vendor Name: ", 'imgSrc': "./img/sidebar-icons/entity-config-vendor.svg"},
            {
                'label': "Item Description",
                'value': "ITEM DESCRIPTION: ",
                'imgSrc': "./img/sidebar-icons/entity-config-item-type.svg"
            },
            { 'label': "SKU Description", 'value': "SKU DESCRIPTION: ", 'imgSrc': "./img/barcode.svg" },
            // {
            //     'label': "MTO Description",
            //     'value': "MTO Description: ",
            //     'imgSrc': "./img/sidebar-icons/entity-config-made-to-order.svg"
            // },
        ];
    }

    checkforSearchTermChanges() {
        if (this._search && this._search.length === 0) {
            this.resetResults();
            this.searched = false;
            this.showAutoComplete = false;
        } else {
            angular.element(".search-panel-section").show();
            if (this._search && this._searchLength) {
                if (this._search.length < this._searchLength) {
                    this._search = '';
                    this._searchLength = 0;
                    this.showSuggestionList = true;
                    this.showSeachQueryPanel = false;
                }
            } else {
                this.showSuggestionList = true;
                this.showSeachQueryPanel = false;
                this.searchOptionImg = null;
                this._searchLength = 0;
            }
        }
    }

    onFocusOutResetToSKU() {
        if (!this._search || !this._searchLength) {
            this.common.$timeout(() => {
                this._search = angular.copy(this.globalSearchData[0].value);
                this.searchOptionImg = angular.copy(this.globalSearchData[0].imgSrc);
                this._searchLength = angular.copy(this._search.length - 1);
            });
        }
    }

    filterAndSetSuggestionOption(event) {
        let filteredData = this.common.$filter('filter')(this.globalSearchData, { 'label': this._search });
        // Change of global search input box -> then on enter, if suggestion dropdown is there then show the filtered dropdown
        if (event.keyCode == 13 && this.showSuggestionList) {
            // this is used for auto selecting as SKU number in search field
            if (this._search && !filteredData.length) {
                if (this._search.includes("SKU:") || this._search.includes("ITEM DESCRIPTION:") || this._search.includes("SKU DESCRIPTION:")) {
                    this._search = '';
                }
                this.showSuggestionList = false;
                this._search = this._search.replace(this._search, `${this.globalSearchData[0].value}${this._search}`);
                this.searchOptionImg = angular.copy(this.globalSearchData[0].imgSrc);
                this._searchLength = angular.copy(this._search.length - 1);
                this.search();
            } else { // if user wants to manually select from the suggestions list
                if (filteredData.length >= 1) {
                    this.setSuggestionOption(filteredData[this.selectedIndex]);
                } else {
                    this.setSuggestionOption(this.globalSearchData[this.selectedIndex]);
                }
            }
        } else if ((event.keyCode == 13 && !this.showSuggestionList)) { // Change of global search input box -> then on enter, if suggestion dropdown is not there then call search
            this.search()
        }
    }

    // On selecting an option in the suggestion set its value to search input box
    setSuggestionOption(optionData) {
        this._search = optionData.value;
        this.searchOptionImg = angular.copy(optionData.imgSrc);
        this.showSuggestionList = false;
        this.isNotFoundResult = false;
        this._searchLength = angular.copy(this._search.length - 1);
        angular.element("#gobalsuggestion").focus();
    }

    evaluvateTerms(event) {
        if (!(this._search && this._search.startsWith("#"))) {
            let inputTerms = this._search ? this._search.toLowerCase() : null;
            if (event.keyCode == 13) {
                return;
            }
            if (inputTerms && inputTerms.length > 3) {
                //this.getSuggestions(inputTerms);
            } else if (!inputTerms) {
                this.autoComplete = {};
                this.showAutoComplete = false;
            }
        } else {
            this.noResultsSKU = false;
            this.isSKUFound = false;
        }
    }

    getSuggestions(query) {
        this.DataSearchFactory.getSuggestions(query).then(es_return => {
            let suggestions = es_return.suggest.phraseSuggestion;
            let autocomplete = es_return.hits.hits;
            if (suggestions.length > 0) {
                this.autoComplete.suggestions = suggestions;
                this.autoComplete.terms = autocomplete;
                this.showAutoComplete = true;
            } else {
                this.autoComplete.suggestions = [];
                this.autoComplete.terms = [];
                this.showAutoComplete = false;
            }
            if (autocomplete.length === 0) {
                this.showAutoComplete = false;
            } else {
                this.showAutoComplete = true;
            }
        });
    }

    updateSort() {
        this.resetResults();
        this.getResults();
    }

    resetResults() {
        this.results.documentCount = null;
        this.results.documents = [];
        this.noResults = false;
        this.resultsPage = 0;
        this.searchOptionImg = null;
        this._searchLength = 0;
        this.showResultSection = false;
    }

    toggleFilter(field, value) {
        let selectedFilters = this.DataFilterFactory.filters.selectedFilters;
        let filterIndex = this.DataFilterFactory.findSelectedFilter(field, value);
        let thisFilter = { field: field, value: value };

        filterIndex > -1
            ? selectedFilters.splice(filterIndex, 1)
            : selectedFilters.push(thisFilter);
        this.resetResults();
        this.getResults();
    }

    search() {
        this.isNotFoundResult = false;
        if (this.showSuggestionList) {
            let filteredData = this.common.$filter('filter')(this.globalSearchData, { 'label': this._search });
            if (filteredData.length >= 1) {
                this.setSuggestionOption(filteredData[this.selectedIndex]);
            } else {
                this.setSuggestionOption(this.globalSearchData[this.selectedIndex]);
            }
        }
        // angular.element(".search-panel-section").show();
        if (
            this._search &&
            this._search.match(/^(SKU) [A-Z]+/) &&
            this._search.match(/^(SKU) [A-Z]+/).length > 0
        ) {
            this.SkuDesSearch = this._search.replace("SKU DESCRIPTION:", "");
            this.SkuDesSearch = this.SkuDesSearch.trim();
            this.isIteamSearch = false;
            this.isSkuDescSearch = true;
            this.isSkuSearch = false;
            this.isVendorSearch = false;
            this.isLocationSearch = false;
            this.isMtoSearch = false;
            this.getSkuDescriptionforGlobalSearch();
        } else if (this._search && this._search.includes("SKU:")) {
            this.skuNumber = this._search.replace("SKU:", "");
            this.skuNumber = this.skuNumber.trim();
            let patt = /^[0-9]+[\-]*[0-9]+$/;
            this.validSKUNumber = patt.test(this.skuNumber);
            if (this.skuNumber) {
                if (this.skuNumber.length < 8) {
                    if (this.skuNumber.length == 7) {
                        this.skuNumber = "00000000" + this.skuNumber;
                        !this.skuNumber.includes("-") ?
                            (this.skuNumber = this.skuNumber.substr(
                                this.skuNumber.length - 9,
                                this.skuNumber.length
                            )) :
                            (this.skuNumber = this.skuNumber.substr(
                                this.skuNumber.length - 10,
                                this.skuNumber.length
                            ));
                        !this.skuNumber.includes("-") ?
                            (this.skuNumber =
                                this.skuNumber.slice(0, 4) +
                                "-" +
                                this.skuNumber.slice(4, 7) +
                                "-" +
                                this.skuNumber.slice(7, 9)) :
                            null;
                    }
                    else {
                        //Append leading zeros to the existing sku number
                        this.skuNumber = "000000" + this.skuNumber;
                        //Get the sku number of length 6
                        !this.skuNumber.includes("-")
                            ? (this.skuNumber = this.skuNumber.substr(
                                this.skuNumber.length - 7,
                                this.skuNumber.length
                            ))
                            : (this.skuNumber = this.skuNumber.substr(
                                this.skuNumber.length - 8,
                                this.skuNumber.length
                            ));
                        !this.skuNumber.includes("-")
                            ? (this.skuNumber =
                                this.skuNumber.slice(0, 4) + "-" + this.skuNumber.slice(4, 7))
                            : null;
                    }
                } else if (this.skuNumber.length === 8) {
                    !this.skuNumber.includes("-")
                        ? (this.skuNumber =
                            this.skuNumber.slice(0, 4) + "-" + this.skuNumber.slice(4, 7))
                        : null;
                } else if (this.skuNumber.length >= 9) {
                    !this.skuNumber.includes("-")
                        ? (this.skuNumber =
                            this.skuNumber.slice(0, 4) +
                            "-" +
                            this.skuNumber.slice(4, 7) +
                            "-" +
                            this.skuNumber.slice(7, this.skuNumber.length))
                        : null;
                }
            }
            this.isSkuSearch = true;
            this.isMtoSearch = false;
            this.isVendorSearch = false;
            this.isIteamSearch = false;
            this.isSkuDescSearch = false;
            this.isLocationSearch = false;
            this.getSKUForSkuNumber();
        } else if (this._search && this._search.includes("VENDOR:")) {
            this.vendorDescription = this._search.replace("VENDOR:", "");
            this.vendorDescription = this.vendorDescription.trim();
            this.isSkuSearch = false;
            this.isNotFoundResult = false;
            this.isIteamSearch = false;
            this.isLocationSearch = false;
            this.isVendorSearch = true;
            this.isSkuDescSearch = false;
            this.isMtoSearch = false;
            this.getVendorForName();
        } else if (this._search && this._search.includes("ITEM DESCRIPTION:")) {
            this.itemDescription = this._search.replace("ITEM DESCRIPTION:", "");
            this.itemDescription = this.itemDescription.trim();
            this.isIteamSearch = true;
            this.isSkuSearch = false;
            this.isVendorSearch = false;
            this.isLocationSearch = false;
            this.isSkuDescSearch = false;
            this.isMtoSearch = false;
            this.getItemforGlobalSearch();
        } else if (this._search && this._search.includes("LOCATION:")) {
            this.locationSearch = this._search.replace("LOCATION:", "");
            this.locationSearch = this.locationSearch.trim();
            this.isIteamSearch = false;
            this.isSkuSearch = false;
            this.isVendorSearch = false;
            this.isLocationSearch = true;
            this.isSkuDescSearch = false;
            this.isMtoSearch = false;
            this.getLocationforGlobalSearch();
        } else if (this._search && this._search.includes("MTO DESCRIPTION:")) {
            this.mtoDesSearch = this._search.replace("MTO DESCRIPTION:", "");
            this.mtoDesSearch = this.mtoDesSearch.trim();
            this.isIteamSearch = false;
            this.isSkuSearch = false;
            this.isNotFoundResult = false;
            this.isSkuDescSearch = false;
            this.isVendorSearch = false;
            this.isLocationSearch = false;
            this.isMtoSearch = true;
            this.getMtoforGlobalSearch();
        } else {
            if (this.showSuggestionList) {
                let filteredData = this.common.$filter('filter')(this.globalSearchData, this._search);
                if (filteredData.length >= 1) {
                    this.setSuggestionOption(filteredData[this.selectedIndex]);
                } else {
                    this.setSuggestionOption(this.globalSearchData[this.selectedIndex]);
                }
            } else {
                this.resetResults();
                let searchTerms = this._search;
                if (searchTerms) {
                    this.results.searchTerms = searchTerms;
                } else {
                    return;
                }
                this.getResults();
                this.searched = true;
                if (this.results.documentCount !== 0) {
                    this.showAutoComplete = false;
                }
            }
        }
    }

    gotoRetailScreen(sku) {
        this.$state.go("common.prime.itemMaintenance.sku.retail", {
            id: sku.id,
            skutype: sku.sku_type,
            subtype: sku.sub_type,
            item_id: sku.item_id
        });
    };

    //Availability Panel on SKU search
    gotoAvailabilityScreen(sku) {
        this.enablespinner = true;
        this.loadLocationsBySku(sku.id);
    }
    loadLocationsBySku(skuid) {
        this.isLoaded = false;
        this.SKUServiceFactory.API.GetSKU(skuid).then(response => {
            this.sku_details = response.data[0];
            this.fetchSkuAvailabilityStatus(skuid);
            if (this.sku_details.sku_sub_type.toLowerCase() === "set") {
                this.SKUServiceFactory.API
                    .FetchSkuSetAndItsComponentAvailability(skuid)
                    .then(response => {
                        this.setSkuAvailability = response;
                        this.isLoaded = true;
                        this.enablespinner = false;
                        this.$stateParams.id = skuid;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                this.SKUServiceFactory.API
                    .IsShowSkuAvailability("sku-availability")
                    .then(response => {
                        //If the user is not present in any of the roles then dont show the edit button
                        response.data.length === 0
                            ? (this.isCreateupdateAvailability = 0)
                            : "";
                        for (let i = 0; i < response.data.length; i++) {
                            if (response.data[i].access) {
                                this.isCreateupdateAvailability = 1;
                                break;
                            } else {
                                this.isCreateupdateAvailability = 0;
                            }
                        }
                        //this.isCreateupdateAvailability = response.data[0].access;
                        this.SKUServiceFactory.API
                            .GetLocationSet(["id", "name"])
                            .then(response => {
                                this.availability = response;
                                this.isLoaded = true;
                                this.enablespinner = false;
                                this.$stateParams.id = skuid;
                            })
                            .catch(error => {
                                logger.error(error);
                            });
                    })
                    .catch(error => {
                        logger.error(error);
                    });
            }
        });
    };

    fetchSkuAvailabilityStatus(skuid) {
        this.SKUServiceFactory.API
            .FetchAvailabilityForSku(
                skuid,
                this.SessionMemory.API.Get("user.baseLocationId")
            )
            .then(response => {
                this.skuAvailability = response.status;
                this.isLoaded = true;
                this.enablespinner = false;
            })
            .catch(error => {
                console.log(error);
            });
    };

    loadAvailability(availability, SKUId) {
        let locationId = availability.id;
        availability.isExpanded = !availability.isExpanded;
        this.SKUServiceFactory.API.GetSkuAvailabilityForLocation(locationId, SKUId)
            .then(response => {
                availability.skuavailabilityList = response.data;
                response.data.length > 0 ?
                    (availability.isSkuAvailable = true) :
                    (availability.isSkuAvailable = false);
            })
            .catch(error => {
                logger.error(error);
            });
    };

    openUpdateInventoryPanel(availability, skuId) {
        //Function to first deselect any previously selected location
        this.deSelectAllInventoryPanels();
        this.isShowInventoryUpdate = true;
        this.inventoryUpdateBtn = "Update";
        this.inventoryDetails = {};
        availability.selected = true;
        this.selectedAvailability = availability;
        !this.qualitiesList ? this.getAllInventoryQualities() : "";
        !this.inventoryTypes ? this.getAllInventoryTypes() : "";
    };

    /// Get all the inventory qualities list
    getAllInventoryQualities() {
        this.SKUServiceFactory.API.GetInventoryQualityList()
            .then(response => {
                this.qualitiesList = response.data;
            })
            .catch(error => {
                logger.error(error);
            });
    };

    /// Get all the inventory types list
    getAllInventoryTypes() {
        this.SKUServiceFactory.API.GetInventoryTypes()
            .then(response => {
                this.inventoryTypes = response.data;
            })
            .catch(error => {
                logger.error(error);
            });
    };

    //Function to deselect all previously selected locations
    deSelectAllInventoryPanels = () => {
        this.availability.filter(availability => {
            availability.selected = false;
        });
    };

    goBack() {
        this.isLoaded = false;
    };


    getSKUForSkuNumber() {
        var sku_output = [];
        this.isSKUSearching = true;
        var x = document.getElementById("rc-global-search-result");
        if (this.validSKUNumber) {
            this.isLoading = true;
            this.SKUServiceFactory.API.SearchSKU("sku", this.skuNumber).then(
                result => {
                    this.isLoading = false;
                    this.isSKUSearching = false;
                    if (result.data.length != 0) {
                        sku_output = result.data.filter(skuid => skuid.sku == this.skuNumber)
                        if (sku_output) {
                            this.isSKUFound = true;
                            this.sku = sku_output[0];
                            this.loadImage(this.common.Identifiers.sku_master, this.sku);
                            this.noResultsSKU = false;
                            x.style.display = "block";
                            this.showResultSection = true;
                            this.isNotFoundResult = false;
                            this.ItemServiceFactory.API.GetItemById(this.sku.item_id)
                                .then(response => {
                                    this.itemDetails = response[0];
                                    this.SKUServiceFactory.API.GetSKUByItem(this.sku.item_id, { limit: 5 })
                                        .then(response => {
                                            this.RelatedSkus = _.filter(response.data, sku => sku.id !== this.sku.id);
                                        })
                                })
                        }
                    } else {
                        this.sku = {};
                        this.isSKUFound = false;
                        this.noResultsSKU = true;
                        x.style.display = "none";
                        this.showResultSection = false;
                        this.isNotFoundResult = true;
                    }
                },
                error => {
                    this.isSearching = false;
                    this.isLoading = false;
                }
            );
        } else {
            this.sku = {};
            this.isSKUFound = false;
            this.noResultsSKU = true;
            x.style.display = "none";
            this.showResultSection = false;
            this.isNotFoundResult = true;
        }
    }

    ViewSkuDetails(sku) {
        if (this.$state.current.name !== "common.prime.itemMaintenance.sku.update" || sku.id != this.$stateParams.id) {
            this.$state.go("common.prime.itemMaintenance.sku.update", {
                item_id: sku.item_id,
                id: sku.id,
                skutype: sku.sku_type.toLowerCase(),
                subtype: sku.sku_sub_type.toLowerCase(),
                returnUrl: "common.dashboard"
            });
        }
    }

    ViewVendorDetails(vendor) {
        this.$state.go("common.prime.vendor.update", {
            id: vendor.id
        });
    }

    ViewLocationDetails(location) {
        this.$state.go("common.prime.location.update", {
            id: location.id
        });
    }

    ViewItemDetails(item) {
        if (item) {
            this.$state.go("common.prime.itemMaintenance.update", {
                id: item.id,
                type: item.item_sub_type.toLowerCase()
            });
        }
    }

    ViewMtoDetails(mto) {
        this.$state.go("common.prime.mtooptions.update", {
            id: mto.id
        });
    }

    getVendorForName() {
        if (this.vendorDescription.length) {
            this.isVendorSearching = true;
            this.isVendorFound = false;
            this.isNotFoundResult = false;
            var x = document.getElementById("rc-global-search-result");
            this.isLoading = true;
            this.VendorService.API.SearchVendors("name", this.vendorDescription).then(
                result => {
                    this.isLoading = false;
                    this.isVendorSearching = false;
                    if (result.length != 0) {
                        this.isVendorFound = true;
                        this.vendor = result[0];
                        this.loadImage(this.common.Identifiers.vendor, this.vendor);
                        // this.noResultsVendor = false;
                        x.style.display = "block";
                        this.showResultSection = true;
                        this.isNotFoundResult = false;
                    } else {
                        this.vendor = {};
                        this.isVendorFound = false;
                        // this.noResultsVendor = true;
                        x.style.display = "none";
                        this.isNotFoundResult = true;
                        this.showResultSection = false;
                    }
                },
                error => {
                    this.isVendorSearching = false;
                    this.isLoading = false;
                    this.isNotFoundResult = false;
                }
            );
        }
    }

    getItemforGlobalSearch() {
        let x = document.getElementById("rc-global-search-result");
        if (this.itemDescription && this.itemDescription.length) {
            this.itemSearching = true;
            this.isLoading = true;
            this.isNotFoundResult = false;
            let filterObject = {
                description: this.itemDescription
            }
            this.ItemServiceFactory.API
                .GetItems({ page: 1, limit: 5 }, filterObject)
                .then(
                    result => {
                        this.isLoading = false;
                        this.itemSearching = false;
                        if (result.data.data.length != 0) {
                            this.Items = result.data.data;
                            _.each(this.Items, item => {
                                this.loadImage(this.common.Identifiers.item, item);
                            })
                            x.style.display = "block";
                            this.showResultSection = true;
                            this.isNotFoundResult = false;
                        } else {
                            this.item = {};
                            x.style.display = "none";
                            this.showResultSection = false;
                            this.isNotFoundResult = true;
                        }
                    },
                    error => {
                        this.itemSearching = false;
                        this.isLoading = false;
                        this.isNotFoundResult = false;
                    }
                )
                .catch(
                    err => {
                        console.log(err);
                    }
                )
        } else {
            this.item = {};
            x.style.display = "none";
        }
    }

    getLocationforGlobalSearch() {
        if (this.locationSearch.length) {
            this.locationSearching = true;
            this.isLoading = true;
            this.isNotFoundResult = false;
            var x = document.getElementById("rc-global-search-result");
            this.locationServiceFactory.API
                .SearchLocations("name", this.locationSearch)
                .then(
                    result => {
                        this.isLoading = false;
                        this.locationSearching = false;
                        if (result.length != 0) {
                            this.location = result[0];
                            this.loadImage(this.common.Identifiers.location, this.location);
                            x.style.display = "block";
                            this.showResultSection = true;
                            this.isNotFoundResult = false;
                        } else {
                            this.location = {};
                            x.style.display = "none";
                            this.showResultSection = false;
                            this.isNotFoundResult = true;
                        }
                    },
                    error => {
                        this.locationSearching = false;
                        this.isLoading = false;
                        this.isNotFoundResult = false;
                        x.style.display = "none";
                    }
                );
        }
    }

    getMtoforGlobalSearch() {
        if (this.mtoDesSearch.length) {
            this.mtoSearching = true;
            this.isNotFoundResult = false;
            var x = document.getElementById("rc-global-search-result");
            this.isLoading = true;
            this.showSuggestionList = false;
            this.mtoServiceFactory.API.SearchMTO("description", this.mtoDesSearch).then(
                result => {
                    this.isLoading = false;
                    this.mtoSearching = false;
                    if (result.data.length != 0) {
                        this.mto = result.data[0];
                        this.loadImage(this.common.Identifiers.mto_option, this.mto);
                        x.style.display = "block";
                        this.showResultSection = true;
                        this.isNotFoundResult = false;
                    } else {
                        this.mto = {};
                        x.style.display = "none";
                        this.showResultSection = false;
                        this.isNotFoundResult = true;
                    }
                },
                error => {
                    this.isLoading = false;
                    this.mtoSearching = false;
                    this.isNotFoundResult = false;
                }
            );
        }
    }

    getSkuDescriptionforGlobalSearch() {
        let x = document.getElementById("rc-global-search-result");
        if (this.SkuDesSearch.length) {
            this.skuDescriptionSearching = true;
            this.isLoading = true;
            let filterObject = {
                description: this.SkuDesSearch.replace('SKU Description:', '')
            }
            this.SKUServiceFactory.API.GetSkusByFilter(filterObject.description, 5, 1).then(
                result => {
                    this.isLoading = false;
                    if (result.data.data.length != 0) {
                        this.Skus = result.data.data;
                        _.each(this.Skus, sku => {
                            this.loadImage(this.common.Identifiers.sku_master, sku);
                        })
                        x.style.display = "block";
                        this.isNotFoundResult = false;
                        this.showResultSection = true;
                    } else {
                        this.sku = {};
                        x.style.display = "none";
                        this.isNotFoundResult = true;
                        this.showResultSection = false;
                    }
                },
                error => {
                    this.skuDescriptionSearching = false;
                    this.isLoading = false;
                }
            );
        } else {
            this.sku = {};
            x.style.display = "none";
        }
    }

    resetSearch() {
        this.isIteamSearch = false;
        this.isSkuSearch = false;
        this.isSkuDescSearch = false;
        this.isVendorSearch = false;
        this.isLocationSearch = false;
        this.isMtoSearch = false;
        this.isNotFoundResult = false;
    }

    loadImage(uuid, data) {
        this.DataLakeFactory.API
            .GetDropsByUuidInstanceAndStream(
                uuid,
                data.id,
                "cover_image")
            .then(res => {
                if (res.length > 0) {
                    data["imgUrl"] = this.DataLakeFactory.API.GetImageDownloadUrl(
                        res[0].drop_id,
                        "165x165",
                        uuid
                    );
                }
            });
    }

    getNextPage() {
        this.resultsPage++;
        this.getResults();
    }

    getResults() {
        this.isSearching = true;
        this.DataSearchFactory
            .search(
                this.results.searchTerms,
                this.resultsPage,
                this.selectedSort,
                this.DataFilterFactory.filters.selectedFilters
            )
            .then(
                es_return => {
                    let totalHits = es_return.hits.total;
                    if (totalHits > 0) {
                        this.results.documents.push.apply(
                            this.results.documents,
                            es_return.hits.hits
                        );

                        this.results.documentCount = totalHits;
                        this.DataFilterFactory.formatFilters(es_return.aggregations);
                    } else {
                        this.noResults = true;
                    }
                    this.isSearching = false;
                },
                error => {
                    this.isSearching = false;
                }
            );
    }

    redirectToItemPage(itemId) {
        this.showAutoComplete = false;
        this.searched = false;
        this._search = null;
        this.autoComplete.suggestions = {};
        this.resetResults();
        this.common.EntityDetails.API
            .GetGraphSet(
                this.common.Identifiers.item,
                ["id", "item_sub_type"],
                "id",
                itemId
            )
            .then(response => {
                this.common.$state.go("common.prime.itemMaintenance.update", {
                    type: response.data[0].item_sub_type,
                    id: itemId
                });
            });
    }

    //Get the Vendors to create a map of Vendors
    getVendors() {
        this.VendorService.API
            .GetVendors()
            .then(response => {
                this.allVendors = response.data.data;
            })
            .catch(error => {
                logger.error(error);
            });
    }

    //Calculate Check Digit of UPC Number
    calculateCheckDigit(upc_data) {
        let upc_number = Object.values(upc_data).join("");
        let _oddsum = 0;
        let _evensum = 0;
        if (upc_number.length < 12) {
            this.deactivateSet = true;
        }
        if (upc_number.length === 12) {
            this.deactivateSet = false;
            for (let i = 0; i <= upc_number.length - 1; i++) {
                if (i % 2 === 0) {
                    _oddsum = parseInt(_oddsum) + parseInt(upc_number[i]);
                } else {
                    _evensum = _evensum + parseInt(upc_number[i]);
                }
            }
            let result = (_oddsum * 3 + _evensum) % 10;
            if (result !== 0) {
                this.checkDigit = 10 - result;
            } else {
                this.checkDigit = result;
            }
        } else {
            this.checkDigit = undefined;
        }
    }

    removeEmptyUpcNumber() {
        let position = 12;
        for (let index = 0; index < 12; index++) {
            if (!this.upc_number[index] || this.upc_number[index] === undefined) {
                position = index;
                break;
            }
        }
    }

    toggleTab(data) {
        if (!data.isSelected) {
            data.isSelected = true;
        } else {
            data.isSelected = false;
        }
    }

    searchTabs() {
        this.searchTabsList = [
            {
                uuid: 44,
                svg: "./img/sidebar-icons/sku.svg",
                name: "SKU",
                serviceName: "itemAndRetailService",
                baseurl: "api/sku",
                masterField: "sku",
                modelURL: "/model",
                modelName: "sku_master",
                next_status: true
            },
            {
                uuid: 36,
                svg: "./img/sidebar-icons/entity-config-made-to-order.svg",
                name: "MTO",
                serviceName: "mtoService",
                baseurl: "api/mto",
                masterField: "description",
                countURL: "/count",
                tableName: "mto_master",
                modelName: "mto_header_master",
                modelURL: "/model",
                next_status: true
            },
            {
                uuid: 19,
                svg: "./img/sidebar-icons/mto_collections.svg",
                name: "MTO Collection",
                serviceName: "mtoService",
                baseurl: "api/mto/collections",
                masterField: "short_description",
                tableName: "mto_collection_table",
                modelName: "mto_collections",
                modelURL: "/model"
            },
            {
                uuid: 34,
                svg: "./img/sidebar-icons/mto-choice.svg",
                name: "MTO Choice",
                serviceName: "mtoService",
                baseurl: "api/mto/choice",
                masterField: "choice_description",
                tableName: "mto_choice",
                modelName: "mto_choice",
                modelURL: "/model",
                next_status: true
            },
            {
                uuid: "1",
                svg: "./img/sidebar-icons/entity-config-location.svg",
                name: "Location",
                serviceName: "locationService",
                baseurl: "api/location",
                countURL: "/count",
                masterField: "name",
                modelName: "location_master",
                tableName: "location_master",
                modelURL: "/model",
                next_status: true
            },
            {
                uuid: 4,
                svg: "./img/sidebar-icons/entity-config-item.svg",
                name: "Item",
                serviceName: "itemAndRetailService",
                baseurl: "api/item",
                countURL: "/count",
                masterField: "description",
                microServiceName: "itemAndRetail",
                modelURL: "/model",
                modelName: "item_master",
                next_status: true
            },
            {
                uuid: 9,
                svg: "./img/sidebar-icons/entity-config-vendor.svg",
                name: "Vendor",
                serviceName: "vendorService",
                baseurl: "api/vendor",
                countURL: "/count",
                masterField: "name",
                microServiceName: "vendor",
                statusURL: "/status",
                tableName: "vendor_master",
                modelURL: "/model",
                modelName: "vendor_master",
                next_status: true
            }
        ];
    }
}

angular
    .module("rc.search")
    .controller("DataSearchController", DataSearchController);
