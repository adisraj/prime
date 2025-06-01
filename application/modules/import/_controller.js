function ImportController(
    $scope,
    $filter,
    $timeout,
    $interval,
    ImportDataService,
    $stateParams,
    $state,
    Notification,
    $q,
    $http,
    $window,
    Upload,
    application_configuration,
    DataLakeService,
    EntityService

) {

    var self = this;
    var Template = ImportDataService.Template;
    var ImportJob = DataLakeService.ImportJob;
    var MappingInstance = DataLakeService.Mapping;
    self.selectedEntity = null;
    $scope.fileContent = null;
    self.isValidData = false;
    self.isValidFile = false;
    self.errors = [];
    $timeout(function() {
        self.$showStages = true;
        self.$workspace = 1;
    }, 200);
    $scope.entities = [];
    this.getEntities = function() {
        EntityService.API.GetAllEntities()
            .then(function(res) {
                $scope.entities = res.data;
            });
    };
    self.getEntities();

    this.getMappingInfoEntity = function(entity, cb) {
        self.selectedEntity = entity;
        MappingInstance.list().query({ id: entity.uuid }, function(response) {
            self.selectedTemplateFile = response.fileInfo.template_file;
            self.mappingFileData = [];
            self.templateHeaders = [];
            self.errors = [];
            $scope.mappingCols = [{
                    field: 'mappingColumns',
                    title: 'Mapping Columns',
                    show: true
                },
                {
                    field: 'usersColumns',
                    title: 'User Columns',
                    show: true
                },
                {
                    field: 'mapping',
                    title: 'Mapping',
                    show: true
                },
            ];

            var usersMappingColumns = [];
            var usersMap = {};

            _.map(self.fileData, function(v, key) {
                var k = key.toLowerCase();
                usersMap[k] = k;
            });

            _.map(response.data, function(res, key) {
                //var obj = {mappingColumns: res.field, mappedWith: key, mandatory: res.mandatory };
                var k = key.toLowerCase();
                var obj = null;
                if (k == usersMap[k]) {
                    obj = { mappingColumns: key, usersColumns: key, mapping: true };
                } else {
                    obj = { mappingColumns: key, usersColumns: null, mapping: false };
                    self.errors.push(key);
                };
                self.mappingFileData.push(obj);
                self.templateHeaders.push(key);
            });
            if (self.errors.length == 0) {
                self.isValidData = true;

            } else {
                self.isValidData = false;
            }

            if (cb !== null && cb !== undefined) {
                cb(true);
            }

        });

    };
    this.downloadTemplate = function(entity) {
        self.getMappingInfoEntity(entity, function(data) {
            writeToXlsx(self.templateHeaders, self.selectedTemplateFile);
        });
    };
    $scope.importFile = {};
    $scope.errors = [];
    self.loadUploadData = function() {
        $scope.cols = [];
        var data = $scope.fileContent['data'];
        _.map(data[0], function(value, key) {
            var obj = {
                field: key,
                title: key,
                show: true
            };
            $scope.cols.push(obj);
        });
        $scope.preview_data = data.slice(0, 4);
    }
    $scope.$on('fileDataEvent', function(e, args) {
        if (angular.equals({}, args.data)) {
            self.isValidData = false;
            Notification.errornotification({ data: "Empty File!" });
        }
        self.fileData = _.clone(args.data.data[0]);
        $scope.fileContent = args.data;
        $scope.uploadedFileName = args.fileName;
    });
    $scope.$on('isValidFileEvent', function(e, args) {
        if (args.isValidFile) {
            self.isValidFile = true;
        } else {
            Notification.errornotification({ data: "Please, upload correct file !" });
            self.isValidFile = false;
        }
    });
    $scope.showData = function() {
        // $scope.validateData($scope.fileContent);
        self.loadUploadData($scope.fileContent);
    }
    self.uploadFile = function(file) {
        file.name = self.selectedTemplateFile;
        if ($scope.errors.length == 0) {
            var d = Upload.rename(file, self.selectedTemplateFile);
            Upload.upload({
                url: ImportJob.getUploadUrl(),
                data: { file: file },
                method: 'POST'
            }).then(function(resp) {
                Notification.responsenotification(resp.data);
            }, function(resp) {
                ////console.log('Error status: ' + resp.status);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                file.progress = progressPercentage;
                ////console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        } else {
            Notification.errornotification({ data: "File contains Error!" });
        }
    };
    $scope.fileChangeEvent = function($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
        self.isValidData = false;
        self.isValidFile = false;
        $scope.$broadcast('fileChangeEvent', { data: $event });
    }

    function writeToXlsx(dataset, fileName) {
        function datenum(v, date1904) {
            if (date1904) v += 1462;
            var epoch = Date.parse(v);
            return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
        }

        function sheet_from_array_of_arrays(data, opts) {
            var ws = {};
            var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            for (var R = 0; R != data.length; ++R) {
                for (var C = 0; C != data[R].length; ++C) {
                    if (range.s.r > R) range.s.r = R;
                    if (range.s.c > C) range.s.c = C;
                    if (range.e.r < R) range.e.r = R;
                    if (range.e.c < C) range.e.c = C;
                    var cell = { v: data[R][C] };
                    if (cell.v == null) continue;
                    var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                    if (typeof cell.v === 'number') cell.t = 'n';
                    else if (typeof cell.v === 'boolean') cell.t = 'b';
                    else if (cell.v instanceof Date) {
                        cell.t = 'n';
                        cell.z = XLSX.SSF._table[14];
                        cell.v = datenum(cell.v);
                    } else cell.t = 's';

                    ws[cell_ref] = cell;
                }
            }
            if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
            return ws;
        }

        /* original data */
        /* var data = [
             [1, 2, 3],
             [true, false, null, "sheetjs"],
             ["foo", "bar", new Date("2014-02-19T14:30Z"), "0.3"],
             ["baz", null, "qux"]
         ]*/
        var data = [dataset];
        var ws_name = "data";

        function Workbook() {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        var wb = new Workbook(),
            ws = sheet_from_array_of_arrays(data);

        /* add worksheet to workbook */
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), fileName);
    };


}
ImportController.$inject = [
    '$scope',
    '$filter',
    '$timeout',
    '$interval',
    'ImportDataService',
    '$stateParams',
    '$state',
    'Notification',
    '$q',
    '$http',
    '$window',
    'Upload',
    'application_configuration',
    'DataLakeService',
    'EntityService'
];
angular.module('rc.prime.import')
    .controller('ImportController', ImportController)
    .directive('fileReader', function() {
        return {
            scope: {
                fileReader: "=",
                selectedTemplateFile: '='

            },
            link: function(scope, element) {

                var X = XLSX;
                var XW = {
                    /* worker message */
                    msg: 'xlsx',
                    /* worker scripts */
                    rABS: './vendors/bower_components/js-xlsx/xlsxworker2.js',
                    norABS: './vendors/bower_components/js-xlsx/xlsxworker1.js',
                    noxfer: './vendors/bower_components/js-xlsx/xlsxworker.js'
                };
                var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
                var use_worker = typeof Worker !== 'undefined';
                var transferable = use_worker;
                var wtf_mode = false;

                function fixdata(data) {
                    var o = "",
                        l = 0,
                        w = 10240;
                    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                    return o;
                }

                function ab2str(data) {
                    var o = "",
                        l = 0,
                        w = 10240;
                    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
                    o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
                    return o;
                }

                function s2ab(s) {
                    var b = new ArrayBuffer(s.length * 2),
                        v = new Uint16Array(b);
                    for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
                    return [v, b];
                }

                function xw_noxfer(data, cb) {
                    var worker = new Worker(XW.noxfer);
                    worker.onmessage = function(e) {
                        switch (e.data.t) {
                            case 'ready':
                                break;
                            case 'e':
                                //console.error(e.data.d);
                                break;
                            case XW.msg:
                                cb(JSON.parse(e.data.d));
                                break;
                        }
                    };
                    var arr = rABS ? data : btoa(fixdata(data));
                    worker.postMessage({
                        d: arr,
                        b: rABS
                    });
                }

                function xw_xfer(data, cb) {
                    var worker = new Worker(rABS ? XW.rABS : XW.norABS);
                    worker.onmessage = function(e) {
                        switch (e.data.t) {
                            case 'ready':
                                break;
                            case 'e':
                                //console.error(e.data.d);
                                break;
                            default:
                                xx = ab2str(e.data).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                                cb(JSON.parse(xx));
                                break;
                        }
                    };
                    if (rABS) {
                        var val = s2ab(data);
                        worker.postMessage(val[1], [val[1]]);
                    } else {
                        worker.postMessage(data, [data]);
                    }
                }

                function xw(data, cb) {
                    transferable = false;
                    if (transferable) xw_xfer(data, cb);
                    else xw_noxfer(data, cb);
                }


                function to_json(workbook) {
                    var result = {};
                    workbook.SheetNames.forEach(function(sheetName) {
                        var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        if (roa.length > 0) {
                            result[sheetName] = roa;
                        }
                    });
                    return result;
                }

                function to_csv(workbook) {

                    var result = [];
                    workbook.SheetNames.forEach(function(sheetName) {
                        var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                        if (csv.length > 0) {
                            result.push("SHEET: " + sheetName);
                            result.push("");
                            result.push(csv);
                        }
                    });
                    return result.join("\n");
                }
                scope.b64it = function() {
                    alert(1);
                    if (typeof console !== 'undefined') //console.log("onload", new Date());
                        var wb = X.read(null, {
                        type: 'base64',
                        WTF: wtf_mode
                    });
                    process_wb(wb);
                }

                function process_wb(wb) {
                    var output = "";
                    /*switch(get_radio_value("format")) {
                        case "json":
                            output = JSON.stringify(to_json(wb), 2, 2);
                            $scope.data = output;
                            break;
                        case "form":
                            output = to_formulae(wb);
                            $scope.data = output;
                            break;
                        default:*/

                    //output = to_csv(wb);
                    output = JSON.stringify(to_json(wb), 2, 2);
                    scope.fileReader = output;

                    scope.$emit('fileDataEvent', { data: JSON.parse(output), fileName: scope.fileName });



                    //    }

                    /*   
                     if(out.innerText === undefined) 
                         out.textContent = output;
                     else out.innerText = output;*/
                    if (typeof console !== 'undefined') {} //console.log("output", new Date());
                }

                function handleFile(e) {
                    rABS = true;
                    use_worker = true;
                    var files = e.target.files;
                    var f = files[0]; {
                        var reader = new FileReader();
                        var name = f.name;
                        scope.fileName = name;
                        reader.onload = function(e) {
                            if (typeof console !== 'undefined') //console.log("onload", new Date(), rABS, use_worker);
                                var data = e.target.result;
                            if (use_worker) {
                                xw(data, process_wb);
                            } else {
                                var wb;
                                if (rABS) {
                                    wb = X.read(data, {
                                        type: 'binary'
                                    });
                                } else {
                                    var arr = fixdata(data);
                                    wb = X.read(btoa(arr), {
                                        type: 'base64'
                                    });
                                }
                                process_wb(wb);
                            }
                        };
                        if (rABS) reader.readAsBinaryString(f);
                        else reader.readAsArrayBuffer(f);
                    }
                }

                scope.$on('fileChangeEvent', function(e, args) {
                    var files = args.data.target.files;
                    var f = files[0];
                    var validFile = false;
                    /* if (f.name == scope.selectedTemplateFile) {
                      
                         validFile = true;
                     }*/
                    handleFile(args.data);
                    //scope.$emit("isValidFileEvent", { isValidFile: validFile });


                });
                $(element).on('change', function(e) {
                    var names = e.target.files[0].name.split('.');
                    names.pop();
                    names.join("");

                    //console.log(scope.selectedTemplate);

                    /* if ((names[0] + ".json") === scope.selectedTemplate.mapping_file) {
                        scope.$parent.error_flag = 1;
                        scope.$parent.load_data_bt = true;
                        //console.log(scope.$parent, "ssssssssssssssssss");
                        handleFile(e);

                    } else {
                        //alert("Upload correct file");

                        scope.$parent.incorrectUploadFile();

                    }
                    */

                });
            }
        };
    });