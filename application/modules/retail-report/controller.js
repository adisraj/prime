class RetailReportController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    SKUService,
    DataLakeService,
    DataLakeAPIService,
    SessionMemory
  ) {
    this.SKUService = SKUService;
    this.common = common;
    this.SessionMemory = SessionMemory;
    this.DataLakeService = DataLakeService;
    this.DataLakeAPIService = DataLakeAPIService

    this.uuid = 132;
    this.message = null;
    this.errorMessage = null;
    $scope
      .getAccessPermissions(132)
      .then(result => {
        this.permissionsMap = result;
        // Call Activate() method to intitialize the controller
        this.Activate();
        this.permissionsLoaded = true;
      })
      .catch(error => {
        this.permissionsMap = error.data;
        // Call Activate() method to intitialize the controller
        this.Activate();
        this.permissionsLoaded = true;
        logger.error(error);
      });
  }

  // Activate function to initialize the controller
  Activate() {
    this.getRetailReports();
  }

  getRetailReports = () => {
    this.retailReports = [];
    this.isLoading = true;
    this.DataLakeAPIService.API.GetDropsByUuidAndInstance(this.uuid, -1)
      .then(result => {
        this.isLoading = false;
        this.retailReports = result;
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  downloadRetailReport = (file, fileName) => {
    this.DataLakeService.DownloadDrop(this.uuid, file, fileName)
      .then(() => { })
      .catch(() => { });
  };

  deleteRetailReport = (file) => {
    file.uuid = this.uuid;
    file.isDeleting = true;
    this.DataLakeService.DeleteDrop(file)
      .then(() => {
        file.isDeleting = false;
        this.retailReports.splice(this.retailReports.findIndex(drop => drop.drop_id == file.drop_id), 1)
      })
      .catch(() => { });
  };

  // Create Topic
  createTopic = (queueName, data, id) => {
    return new Promise((resolve, reject) => {
      this.SKUService.API.CreateTopic(queueName, data, id)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  };

  // Generate Report
  generateReport = () => {
    this.isProcessing = true;
    this.createTopic(
      "retail.report.queue",
      {
        from_date: {
          year: new Date(this.retailHead.from_date).getFullYear(),
          month: new Date(this.retailHead.from_date).getMonth() + 1,
          date: new Date(this.retailHead.from_date).getDate()
        },
        to_date: {
          year: new Date(this.retailHead.to_date).getFullYear(),
          month: new Date(this.retailHead.to_date).getMonth() + 1,
          date: new Date(this.retailHead.to_date).getDate()
        },
        user_id: this.SessionMemory.API.Get("user.id")
      },
      null
    )
      .then(() => {
        this.common.$timeout(() => {
          this.message = "Your request to Generate Retail report has been created successfully. We will notify when the report is ready."
          this.isProcessing = false;
          this.retailHead = {};
          this.common.$timeout(() => {
            this.message = null;
          }, 5000);
        }, 0);
      })
      .catch(() => {
        this.common.$timeout(() => {
          this.errorMessage = "Error while requesting for retail report generation. Please try again."
          this.isProcessing = false;
          this.retailHead = {};
          this.common.$timeout(() => {
            this.errorMessage = null;
          }, 5000);
        }, 0);
      });
  };

  // Validate if from value is less than to
  ValidationFromTo() {
    this.ValidationError = null;
    if (this.retailHead.from_date) {
      console.info(this.retailHead.from_date, new Date(this.retailHead.from_date).getFullYear())
    }
    if (this.retailHead && this.retailHead.from_date && this.retailHead.to_date) {
      if (
        parseInt(
          moment(
            this.retailHead.from_date,
            this.SessionMemory.API.Get("user.preference.date.format")
          ).format("YYYYMMDD")
        ) >
        parseInt(
          moment(
            this.retailHead.to_date,
            this.SessionMemory.API.Get("user.preference.date.format")
          ).format("YYYYMMDD")
        )
      ) {
        this.ValidationError = "To date should be greater than From date.";
      }
    }
  }
}

angular
  .module("rc.prime.retailreport")
  .controller("RetailReportController", RetailReportController);
