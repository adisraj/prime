(function() {
    class HangTagController {
        constructor(common, HangTagFactory, HierarchyValueService, DataLakeAPIService, SKUService, SkuRetailService) {
            this.common = common;
            this.Factory = HangTagFactory;
            this.HierarchyValueService = HierarchyValueService.API;
            this.DataLakeAPIService = DataLakeAPIService;
            this.SKUService = SKUService.API;
            this.SkuRetailService = SkuRetailService.API;
            this.save_btn_txt = "Save Department Template";
            this.skuHead = {};
            this.activate();
        }
        toggleDeptTemplatePanel(flag) {
            this.isSaveSuccess = false;
            this.showDeptTemplPanel = flag;
            if (flag) {
                if (this.department_class_form !== undefined) {
                    this.department_class_form.$setPristine();
                    this.save_data = {};
                }
                this.createNewDepartmentTemplate();
            }
        }
        getTemplates() {
            this.Factory
                .FetchTemplates()
                .then(res => {
                    this.templates = res.data;
                })
        }
        getDepatmentsAndClasses() {
            //Load department and classes to assign dept and class template
            this.HierarchyValueService
                .GetDepartmentsAndClasses()
                .then(res => {
                    this.departmentsclasses = res.data;
                });
        }

        setTemplate(template, index) {
            //select template for preview and generation of hang tag
            this.selectedTemplate = template;
            this.setClickedRow(index);
            this.isPreviewForm = true;
            this.isPreviewTemplate = false;
            this.skuHead.sku = null;
        }
        getSKUDetails() {
            //get sku detail along with image and barcode image
            this.isShowData = true;
            this.isLoading = true;
            this.SKUService.SearchSKU('sku', this.sku_number)
                .then(response => {
                    this.isLoading = false;
                    this.sku_number = null;
                    if (response.data.length > 0) {
                        this.isPreviewTemplate = true;
                        this.skuHead = response.data[0];
                        //this.getRetail();
                        this.getDataLakeImage(this.skuHead);
                        this.getBarcodeImage(this.skuHead);
                        this.previewTemplate();
                    } else {
                        this.skuHead = {};
                    }
                })
                .catch(error => {
                    this.isLoading = false;
                    this.isShowData = false;
                    error.status === 404 ? this.error = "Error in connecting SKU service. Please contact the administrator." : '';
                });
        }
        getDataLakeImage() {
            let query = {
                uuid: 44, // uuid for static hang tag template
                instance_id: this.skuHead.id,
                stream: 'cover_image'
            }
            this.DataLakeAPIService.API.GetDropInfoByParams(query)
                .then(datalakeres => {
                    let drop_id = datalakeres.data[0].drop_id;
                    this.skuHead.thumbnail = this.DataLakeAPIService.API.GetDownloadUrl(drop_id, query.uuid);
                });
        };
        //Barcode for Hang tag
        getBarcodeImage(skuHead) {
            this.DataLakeAPIService.API
                .GetDropsByUuidInstanceAndStream(44, skuHead.id, 'code')
                .then((response) => {
                    if (response.length > 0) {
                        for (let i = 0; i < response.length; i++) {
                            if (response[i]['file_name'].startsWith('code128')) {
                                skuHead.barcode_img_url = this.DataLakeAPIService.API.GetDownloadUrl(response[i].drop_id, 44);
                            }
                        }
                    }

                });

        };
        //get static hang tag template and compile to html for preview and generate
        previewTemplate() {

            this.isPreviewTemplate = true;

            let query = {
                uuid: 104, // uuid for static hang tag template
                instance_id: this.selectedTemplate.id,
                stream: 'static_hang_tag_template'
            }
            this.DataLakeAPIService.API.GetDropInfoByParams(query)
                .then(datalakeres => {
                    let drop_id = datalakeres.data[0].drop_id;
                    let templateUrl = this.DataLakeAPIService.API.GetDownloadUrl(drop_id, 104);
                    $.ajax({
                        url: templateUrl,
                        dataType: 'html',
                        success: (response) => {

                            var object = {
                                product: this.skuHead.description,
                                sku_number: this.skuHead.sku,
                                price: '$$.$$',
                                savings: '$$.$$',
                                shown_price: '$$.$$',
                                model: 'MM-MM-MM',
                                image_url: this.skuHead.thumbnail,
                                barcode_img_url: this.skuHead.barcode_img_url
                            }
                            $('#preview_template').html(_.template(response, { data: object }));
                        }
                    });

                });
        }
        saveDepartmentTemplate() {
            let type = "department";
            let department_id = this.save_data.department.id;
            if (this.save_data.isClass) {
                type = "class";
                department_id = this.save_data.classId;
            }
            let data = {
                template_id: this.save_data.templateId,
                department_id: department_id,
                type: type
            }
            this.save_btn_txt = "Saving..."
            this.Factory
                .SaveDepartmentTemplate(data)
                .then(res => {
                    if (res.status === 201) {
                        this.common.$timeout(() => {
                            this.save_btn_txt = "Saved";
                            this.isSaveSuccess = true;
                        }, 1500);
                    }
                });
        }
        createNewDepartmentTemplate() {
            this.isSaveSuccess = false;
            this.save_btn_txt = "Save Department Template";

        }
        setClickedRow(index) { //function that sets the value of selectedRow to current index
            this.selectedRow = index;
        }

        activate() {
            this.getTemplates();
            this.getDepatmentsAndClasses();
        }
    }

    angular.module('rc.prime.tag').controller('HangTagController', HangTagController);

})();