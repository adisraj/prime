class ReactivateSkuController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    SKUService,
    ReactivateService,
    DataLakeAPIService
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.logger = this.common.Logger.getInstance("ReactivateSkuController");
    this.searchedSKUList = [];
    this.skuIds = [];
    this.skuDetails = [];
    //Initialize SKU Service object, derived from the CommonServices SKU Object
    this.SKUServiceFactory = SKUService;
    this.ReactivateServiceFactory = ReactivateService;
    this.DataLakeFactory = DataLakeAPIService;
    //Call Activate() method to intitialize the controller
    this.Activate();
  }

  //Activate function to initialize the controller
  Activate() {

  }

  // Function to format SKU number in 'xxxx-xxx' format
  FormatSkuNumber() {
    if (this.sku_number && this.sku_number !== "") {
      if (this.sku_number.length < 8) {
        //Append leading zeros to the existing sku number
        this.sku_number = "000000" + this.sku_number;
        //Get the sku number of length 6
        !this.sku_number.includes("-")
          ? (this.sku_number = this.sku_number.substr(
            this.sku_number.length - 7,
            this.sku_number.length
          ))
          : (this.sku_number = this.sku_number.substr(
            this.sku_number.length - 8,
            this.sku_number.length
          ));
        !this.sku_number.includes("-")
          ? (this.sku_number =
            this.sku_number.slice(0, 4) +
            "-" +
            this.sku_number.slice(4, 7))
          : null;
      } else if (this.sku_number.length === 8) {
        !this.sku_number.includes("-")
          ? (this.sku_number =
            this.sku_number.slice(0, 4) +
            "-" +
            this.sku_number.slice(4, 7))
          : null;
      } else if (this.sku_number.length >= 9) {
        !this.sku_number.includes("-")
          ? (this.sku_number =
            this.sku_number.slice(0, 4) +
            "-" +
            this.sku_number.slice(4, 7) +
            "-" +
            this.sku_number.slice(7, this.sku_number.length))
          : null;
      }
    }
    this.GetSKUForSkuNumber();
  };

  GetSKUForSkuNumber() {
    this.isSKUSearching = true;
    this.isLoading = true;
    this.SKUServiceFactory.API.SearchSKU("sku", this.sku_number, 1).then(
      result => {
        this.isLoading = false;
        this.isSKUSearching = false;
        if (result.data.length && !this.skuIds.includes(result.data[0].id)) {
          this.searchedSKUList.push(result.data[0]);
          this.skuIds.push(result.data[0].id);
          this.skuDetails.push(result.data[0]);
          this.LoadImage(this.common.Identifiers.sku_master, result.data[0]);
          this.sku_number = undefined;
          this.skuDoesNotExist = false;
        } else if(result.data.length && this.skuIds.includes(result.data[0].id)) {
          this.isSKUSearching = false;
          this.SKUError = "Selected SKU# is already added to the queue.";
          this.sku_number = undefined;
          this.common.$timeout(()=> {
            this.SKUError = null;
          }, 3000)
        } else {
          this.isSKUSearching = false;
          this.SKUError = "SKU# does not exist.";
          this.sku_number = undefined;
          this.common.$timeout(()=> {
            this.SKUError = null;
          }, 3000)
          this.sku_number = undefined;
        }
      },
      error => {
        this.isSearching = false;
        this.isLoading = false;
      }
    );
  }

  LoadImage(uuid, data) {
    this.DataLakeFactory.API
      .GetDropsByUuidAndInstance(uuid, data.id)
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

  DeleteSKUFromQueue(skuId) {
    if(skuId) {
      let idx = this.searchedSKUList.findIndex(sk => sk.id == skuId);
      this.searchedSKUList.splice(idx, 1);
      let idIdx = this.skuIds.findIndex(id => id == skuId);
      this.skuIds.splice(idIdx, 1);
      this.skuDetails.splice(idIdx, 1);
    }
  }

  ReActivateSKUs() {
    this.isExecuting = true;
    this.isExecuted = false;
    for(let i = 0; i < this.skuDetails.length ; i++) {

      this.ReactivateServiceFactory.API.ReActivateSKUs(this.skuDetails[i].id, this.skuDetails[i].item_id)
      .then(result => {
        if (i === this.skuDetails.length - 1) {
          this.message = "Selected SKUs are activated successfully.";
          this.isExecuting = false;
          this.isExecuted = true;
          this.common.$timeout(() => {
            this.isExecuted = false;
            this.message = null;
            this.skuIds = [];
            this.skuDetails = [];
            this.searchedSKUList = [];
          }, 5000);
        }
      })
      .catch(error => {
        console.log(error);
        this.isExecuting = false;
        this.error = error;
        this.isExecuting = false;
        this.common.$timeout(() => {
          this.error = null;
        }, 3000);
      })
    }
  }


}

angular
  .module("rc.prime.reactivatesku")
  .controller("ReactivateSkuController", ReactivateSkuController);
