class CustomerController {
  constructor($scope, common, CustomerService,DiscountService,DataLakeService,DataLakeAPIService) {
    this.$scope = $scope;
    this.common = common;
    this.CustomerService = CustomerService;
    this.DiscountService = DiscountService;
    this.DataLakeService = DataLakeService;
    this.DataLakeAPIService = DataLakeAPIService;
    this.logger = this.common.Logger.getInstance("CustomerController");
    this.$timeout = this.common.$timeout;

    //varibles to update page information
    this.initialPageSize = 50;
    this.initialPageNumber = 1;
    this.pageSize = 50;
    this.currentPage = 1;
    this.isLoadingMore = false;
    this.isLoading = false;
    this.showPersonalInformation = true;
    this.showDiscountDetails = false;
    this.showCartsList = false;
    this.sortByField = "id";
    this.sortByOrder = "desc";
    this.groupByField = "";
    this.activate();
    this.valuesMap = {};
    this.cloud_cart_uuid = 95;

    this.sortableFields = [
      {
        field: "Sort By None",
        value: "id"
      },
      {
        field: "Name",
        value: "name"
      },
      {
        field: "Contact",
        value: "contact_information"
      }
    ];
  
    this.customerGroupByDropdown = [
      { 
        prefix:'',
        name:'Group By None' 
      },
      { 
        prefix: 'zipcode', 
        name:'Zipcode' 
      }
    ]
  }

  activate() {
    this.customers = [];
    this.customerIds = [];
    this.getAllCustomers(this.currentPage,this.pageSize);
    this.getTotalCustomersCount();
    this.resetCustomerDetailsTabs();
  }

initCustomer(customer){
  customer.id = customer.customer_id;
  if (this.sortByField === 'name') {
    customer.name = customer.individuals[0] ? customer.individuals[0].first_name + ' ' + customer.individuals[0].last_name : customer.business_name
    customer.name = customer.name ? customer.name.trim() : "";
  } else if (this.sortByField === 'contact_information') {
    customer.contact_information = customer.contacts && customer.contacts.length > 0 ? customer.contacts[0].information : 0;
  }
}

  /// Get total count of customers
  getTotalCustomersCount(){
    this.CustomerService.API.GetCustomersCount()
    .then(response => {
        this.customersCount = response[0].customers_count;
      })
      .catch(error => {
        this.logger.error(error);
      }); 
  }

  // function to get customer ids only based on page limit and current page number
  getAllCustomers(page,limit,flag) {
    if(flag){
      this.customerIds= [];
      this.customers = [];
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
      this.isLoaded = false;
    }
    this.reverse = this.sortByOrder && this.sortByOrder === "asc" ? false : true;
    this.CustomerService.API.GetCustomerIds({
      page: page,
      limit: limit
    },
    { field: this.sortByField, order: this.sortByOrder })
      .then(response => {
        for (let i = 0; i < response.length; i++) {
          this.customerIds.push(response[i].id);
          this.getCustomerDetailsByCustomerId(response[i].id);
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  //get customer details by cutomer id
  getCustomerDetailsByCustomerId(customerId) {
    this.CustomerService.API.GetCustomerDetailsById(customerId)
      .then(response => {
        this.customers.push(response);
        this.refreshTableText = "Successfully refreshed";
        this.common.$timeout(() => {
          this.isRefreshTable = false;
        }, 3500);
        if(this.customerIds.length === this.customers.length){
            this.isLoaded = true;
            this.isLoadingMore = false;
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // function to get carts for the selected customer
  getCustomerCarts(customer) {
    this.selectedCustomer = customer;
    this.isLoaded = false;
    let query = {
      customer_id: customer.customer_id,
      pricingclass: this.pricingclass
    };
    this.showCarts = true;
    this.showCustomers = false;
    this.searchCartsByFieldAndValue(query);
  }

  searchCartsByFieldAndValue(query) {
    this.selectedCustomer.carts = [];
    this.CustomerService.API
      .SearchCartsByFieldAndValue(query)
      .then(response => {
        this.isLoaded = true;
        if(response.length>0){
          this.selectedCustomer.carts = response;
        }
      })
      .catch(error => {
        this.isLoaded = true;
      });
  }

  fetchDropsForCart(cart) {
    let cartId = !cart.id && cart.cart_id ? cart.cart_id : cart.id;
    this.DataLakeService
      .GetDropByUuidAndInstanceId(this.cloud_cart_uuid, cartId)
      .then(response => {
        if (response.length > 0) {
          cart.cartDropsList = response;
          cart.uuid = this.cloud_cart_uuid;
          cart.drop_id = response[0]["drop_id"];
          if (response[0].drop_type === "url") {
            cart["imgUrl"] = response[0]["url"];
          } else {
            let query = {
              uuid: this.cloud_cart_uuid,
              instance_id: cart.customer_id,
              stream: "cover_image"
            };
            cart["imgUrl"] = this.DataLakeAPIService.API.GetDataLakeDownloadUrl(
              response[0]["drop_id"],
              query
            );
          }
        }
      });
  }

  //load more customers
  loadMoreCustomers() {
    this.currentPage += 1;
    this.isLoadingMore = true;
    this.getAllCustomers(this.currentPage,this.pageSize);
  }

  sortCustomers(order) {
    this.customerIds = [];
    this.customers = [];
    this.sortByOrder = order ? order : 'asc';
    this.currentPage = 1;
    this.getAllCustomers(this.currentPage, this.pageSize)
  }

  // Get list of all regions to show in UI
  getAllDiscountTypes() {
    this.isLoaded = false;

    this.DiscountService.API.GetDiscountTypes()
      .then(response => {
        this.discountTypes = response.data;
        for (let i = 0; i < this.discountTypes.length; i++) {
          this.discountTypes[i].checked = true;
        }
        this.rowsCount = response.data.length;
        this.createTypesListMap(response.data);
      })
      .catch(error => {
        this.isLoaded = true;
        this.logger.error(error);
      });
  }

  //Create Map List
  createTypesListMap(list) {
    this.typesMap = [];
    for (let i = 0; i < list.length; i++) {
      list[i].discount_type_id = list[i].id;
      if (this.typesMap[list[i].id] === undefined) {
        this.typesMap[list[i].id] = list[i];
      }
      this.getAllValuesByDisountTypeId(list[i].discount_type_id);
    }
  }

  getAllValuesByDisountTypeId(typeId) {
    this.DiscountService.API.GetDiscountTypeValues(typeId)
      .then(response => {
        this.isLoaded = true;
        for (let i = 0; i < response.length; i++) {
          if (this.valuesMap[response[i].id] === undefined) {
            this.valuesMap[response[i].id] = response[i];
          }
        }
      })
      .catch(error => {
        this.isLoaded = true;
        this.logger.error(error);
      });
  }


  getNodes(data, isDiscountType) {    
    if (!data.nodes || data.nodes.length === 0) {
      data.isLoaded = false;
      data.nodes = [];
      let query = {
        discount_type_id: data.discount_type_id,
        parent_id: !isDiscountType ? data.id : undefined
      };
      this.DiscountService.API.GetDiscountTypeValuesByTypeIdAndParentId(query)
        .then(response => {
          data.isLoaded = true;         
          data.nodes = response;
          if (isDiscountType) {
            this.typesMap[data.discount_type_id].nodes = response;
          } else {
            this.valuesMap[data.id].nodes = response;
          }
        })
        .catch(error => {
          data.isLoaded = true;
          this.logger.error(error);
        });
    }
  }

  getDiscountTypeForCustomer() {
    this.CustomerService.API.GetDicountType(this.selectedCustomer.customer_id)
      .then(response => {
        this.selectedCustomer.discount = response.length > 0 ? response[0] : undefined;
      })
      .catch(error => {
        this.logger.error(error);
      })
  }

  saveOrUpdateDiscountType(discountTypeDetails) {
    let payload = {
      customer_id:this.selectedCustomer.customer_id,
      discount_type_value_id:discountTypeDetails.id
    }
    if(this.selectedCustomer.discount && this.selectedCustomer.discount.discount_type_value_id) {
      //update discount type
      this.CustomerService.API.UpdateDiscountType(payload)
      .then(response => {
        this.message = response.data.message;
        this.getDiscountTypeForCustomer();
      })
      .catch(error => {
        this.errorMessage = "Can not update. Please contact system administrator";
        this.logger.error(error);
      })
    } else {
      //save discount type
      this.CustomerService.API.SaveDiscountType(payload)
      .then(response => {
        this.message = response.data.message;
        this.getDiscountTypeForCustomer();
      })
      .catch(error => {
        this.errorMessage = "Can not save. Please contact system administrator";
        this.logger.error(error);
      })
    }

    this.$timeout(() => {
      this.message = null;
      this.errorMessage = null;
    }, 2500)
  }

  deleteDiscountForCustomer(){
    this.CustomerService.API.DeleteDiscountType(this.selectedCustomer.discount)
      .then(response => {
        this.message = "Customer discount deleted successfully!";
        this.getDiscountTypeForCustomer();
      })
      .catch(error => {
        this.errorMessage = "Can not delete. Please contact system administrator";
        this.logger.error(error);
      });

      this.$timeout(() => {
        this.message = null;
        this.errorMessage = null;
      }, 2500)
  }
  
  toggleCustomerDetailsPanel(customerData) {
    this.selectedCustomer = customerData;
    this.showCustomerDetailsPanel = true;
    this.showDiscountDetails = false;
    this.showCartsList = false;
  }

  togglePersonalInformation() {
    this.showPersonalInformation = true;
    this.showDiscountDetails = false;
    this.showCartsList = false;
  }

  toggleDiscountDetails() {
    this.showDiscountDetails = true;
    this.showPersonalInformation = false;
    this.showCartsList = false;
    this.getAllDiscountTypes();
    this.getDiscountTypeForCustomer();
  }

  toggleCartsList() {
    this.showCartsList = true;
    this.showDiscountDetails = false;
    this.showPersonalInformation = false;
    this.getCustomerCarts(this.selectedCustomer);
  }

  resetCustomerDetailsTabs() {
    this.showPersonalInformation = false;
    this.showDiscountDetails = false;
  }
}

angular
  .module("rc.prime.customer")
  .controller("CustomerController", CustomerController);
