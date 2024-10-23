'use strict';
var app = angular.module('uiApp');

app.controller('baseDanhMucCtrl', ['$scope', '$compile', 'hotkeys', 'ngProgress', 'toaster', 'svService'
    , function myfunction($scope, $compile, hotkeys, ngProgress, toaster, svService) {
        $scope.tbName = '';
        $scope.ListDatas = [];
        $scope.ViewDetail = false;
        $scope.sSearch = '';
        $scope.iPageIndex = 0;
        $scope.iPageSize = 10;
        $scope.mData = {};
        $scope.isChange = false;

        $scope.ChangeData = function () {
            $scope.isChange = true;
        }

        $scope.unChangeData = function () {
            $scope.isChange = false;
        }

        $scope.setQueryParam = function () {
            $scope.mQueryParam = {
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                from: '',
                to: '',
                iPageIndex: $scope.iPageIndex,
                iPageSize: $scope.iPageSize
            }
        }

        $scope.setListDatas = function () { }

        $scope.refreshData = function (iPageindex) {
            ngProgress.start();
            $scope.iPageIndex = iPageindex;
            $scope.setQueryParam();
            return svService.showPage($scope.mQueryParam).$promise.then(function (d) {
                $scope.ListDatas = d.List;
                $scope.setListDatas();
                $scope.total = d.Total != null ? d.Total : 0;
                $scope.totalPage = Math.floor(($scope.total - 1) / $scope.iPageSize) + 1;
                var totalPage = GetlstPage($scope.totalPage, $scope.iPageIndex, 'refreshData');
                $("#lstPage").html($compile(totalPage)($scope));
                ngProgress.complete();
                return true;
            }, function (err) {
                toaster.pop('error', 'Có lỗi', err?.data?.ExceptionMessage ?? err?.data?.Message);
                ngProgress.complete();
                return false;
            });
        }

        $scope.OpenMasterForm = function () {
            $scope.ViewDetail = false;
            $('#myModal-detail').modal('hide');
        }

        $scope.setDataForAddNew = function () {

        }

        $scope.setDataForEdit = function () {

        }

        $scope.afterOpenDetailForm = function () {

        }

        $scope.OpenDetailForm = function (d) {
            $scope.isChange = false;
            if (d) {
                $scope.mData = d;
                $scope.setDataForEdit(d);
            } else {
                $scope.mData = {
                    Active: true,
                    NgayTao: moment().format(EFormat.DateISO),
                };
                $scope.setDataForAddNew();
            }
            $scope.ViewDetail = true;
            $('#myModal-detail').modal({
                keyboard: false,
                backdrop: 'static'
            });
            setTimeout(() => {
                $scope.afterOpenDetailForm();
            }, 10);
        }

        $scope.setDataBeforSave = function () {

        }

        $scope.checkDataBeforSave = function () {
            return true;
        }

        $scope.changeDataAfterSave = function (d) {

        }

        $scope.CreateOrUpdate = function (isOpenMaster = true, funErr = null) {
            if ($scope.checkDataBeforSave()) {
                ngProgress.start(true);
                $scope.setDataBeforSave();
                svService.createOrUpdate({
                    tbName: $scope.tbName
                }, $scope.mData).$promise.then(function (d) {
                    toaster.pop('success', 'Thông báo', 'Cập nhật dữ liệu thành công');
                    ngProgress.complete(true);
                    $scope.changeDataAfterSave(d);
                    $scope.refreshData($scope.iPageIndex);
                    if (isOpenMaster) {
                        $scope.OpenMasterForm();
                    }
                }, function (err) {
                    if (funErr) {
                        funErr();
                    } else {
                        toaster.pop('error', 'Cảnh báo', err.data);
                    }
                    ngProgress.complete(true);
                });
            }
        };

        $scope.Delete = function (row) {
            if (row.Id) {
                confirmPopup('Cảnh báo', 'Anh/chị chắc chắn xóa vĩnh viễn chưa ạ?', function () {
                    ngProgress.start();
                    svService.delete({
                        tbName: $scope.tbName,
                        id: row.Id
                    }).$promise.then(function (d) {
                        toaster.pop('success', 'Thông báo', 'Xóa dữ liệu thành công');
                        ngProgress.complete();
                        $scope.refreshData($scope.iPageIndex);
                    }, function (err) {
                        toaster.pop('warning', 'Cảnh báo', err.data);
                        ngProgress.complete();
                    });
                });
            }
        }

        $scope.Deactivate = function (row) {
            if (row.Id) {
                confirmPopup('Cảnh báo', 'Anh/chị chắc chắn xóa chưa ạ?', function () {
                    ngProgress.start();
                    svService.deactivate({
                        tbName: $scope.tbName,
                        id: row.Id
                    }).$promise.then(function (d) {
                        toaster.pop('success', 'Thông báo', 'Xóa dữ liệu thành công');
                        ngProgress.complete();
                        $scope.refreshData($scope.iPageIndex);
                    }, function (err) {
                        toaster.pop('warning', 'Cảnh báo', err.data);
                        ngProgress.complete();
                    });
                });
            }
        }

        $scope.Active = function (row) {
            if (row.Id) {
                confirmPopup('Cảnh báo', 'Anh/chị chắc chắn khôi phục chưa ạ?', function () {
                    ngProgress.start();
                    svService.getstr({
                        tbName: $scope.tbName,
                        fName: 'active',
                        idActive: row.Id
                    }).$promise.then(function (d) {
                        toaster.pop('success', 'Thông báo', 'Khôi phục dữ liệu thành công');
                        ngProgress.complete();
                        $scope.refreshData($scope.iPageIndex);
                    }, function (err) {
                        toaster.pop('warning', 'Cảnh báo', err.data);
                        ngProgress.complete();
                    });
                });
            }
        }

        $scope.CheckSave = function () {
            if ($scope.isChange) {
                confirmPopup('Cảnh báo', 'Dữ liệu chưa được lưu, đồng ý thoát ?', function () {
                    $scope.OpenMasterForm();
                    $scope.$apply()
                }, function () {
                    return;
                });
            }
            else {
                $scope.OpenMasterForm();
            }
        }

        hotkeys.add({
            combo: 'ctrl+enter',
            description: 'Thêm dữ liệu',
            allowIn: ['INPUT', 'TEXTAREA', 'SELECT'],
            inContentEditable: true,
            callback: function (e) {
                e.preventDefault();
                if ($scope.ViewDetail)
                    $scope.CreateOrUpdate();
            }
        });

        hotkeys.add({
            combo: 'ctrl+s',
            description: 'Thêm dữ liệu',
            allowIn: ['INPUT', 'TEXTAREA', 'SELECT'],
            inContentEditable: true,
            callback: function (e) {
                e.preventDefault();
                if ($scope.ViewDetail)
                    $scope.CreateOrUpdate();
            }
        });
        hotkeys.add({
            combo: 'ctrl+m',
            description: 'Thêm dữ liệu',
            allowIn: ['INPUT', 'TEXTAREA', 'SELECT'],
            callback: function (e) {
                e.preventDefault();
                if (!$scope.ViewDetail)
                    $scope.OpenDetailForm();
            }
        });

        $scope.fCallBackEsc = function () {
            if ($scope.ViewDetail)
                $scope.CheckSave();
        }

        hotkeys.add({
            combo: 'esc',
            description: 'Thoát ra danh sách dữ liệu',
            allowIn: ['INPUT', 'TEXTAREA', 'SELECT'],
            inContentEditable: true,
            callback: function (e) {
                e.preventDefault();
                $scope.fCallBackEsc();
            }
        });
    }
]);
app.controller('DMTinhThanhCtrl', ['$scope', '$controller', 'svApi', function myfunction($scope, $controller, svApi) {
    angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
    const mSuper = angular.extend({}, $scope);
    $scope.tbName = 'DMTinhThanh';

    setTimeout(() => {
        $scope.refreshData(1);
    }, 0);
}]);

app.controller('DMMonHocCtrl', ['$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao'
    , function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        const mSuper = angular.extend({}, $scope);
        $scope.tbName = 'DMMonHoc';
        $scope.iPageSize = 15;
        var input = $("#myFile").get(0);

        $scope.setQueryParam = function () {
            $scope.mQueryParam = {
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: $scope.iPageSize
            }
        }

        $scope.setDataForAddNew = function () {
            $scope.mData.ThuTu = $scope.total + 1;
            input.value = null;
            $('#imgdAnh').attr('src', '');
        }
        $scope.setDataForEdit = function () {
            input.value = null;
            $('#imgdAnh').attr('src', $scope.mData.UrlHinhAnh);
        }
        setTimeout(async () => {
            $scope.refreshData(1);
        }, 0);

        $scope.GetExcel = async () => {
            const res = await svApi.showPage({
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: 100000,
            }).$promise;
            const dataExport = res.List.map(x => {
                return {
                    Id: x.Id,
                    Ten: x.Ten,
                    Ma: x.Ma,
                    GioiThieu: x.GioiThieu,
                }
            })
            return svBaoCao.exportExcel({
                TemplatesExcel: 'VTest-DMMonHoc',
                ExcelStartRow: 6,
                ExcelStartCol: 1,
                ColmunName: ['Ten', 'Ma', 'GioiThieu'],
                ObjData: dataExport,
                InsertSTT: true
            }).$promise.then(function () {
                ngProgress.complete(true);
                return true;
            }, function () {
                ngProgress.complete(true);
                toaster.pop('error', 'Thao tác thất bại', 'Vui lòng thử lại sau');
                return false;
            });
        }
        $scope.CreateOrUpdate = async function (isOpenMaster = true) {
            if (!$scope.mData.Ten) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Tên');
                return false;
            }
            if (!$scope.mData.Ma) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Mã');
                return false;
            }
            if (input.files && input.files.length > 0) {
                ngProgress.start();
                let reDsHinh = await svApi.uploadfile({
                    folder: 'DMMonHoc',
                    delFile: $scope.mData.UrlHinhAnh || ''
                }, input.files);
                $scope.mData.UrlHinhAnh = reDsHinh[0];
                ngProgress.complete();
            }
            mSuper.CreateOrUpdate(isOpenMaster);
        }
        //Handle change image
        $scope.ChonAnh = function () {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                if (['image/png'].indexOf(file.type) === -1) {
                    input.value = '';
                    toaster.pop('warning', `Yêu cầu chọn ảnh ${file.name} có định dạnh png`);
                    return;
                }
                if (_maxsize_img && ((file.size / 1048576) > _maxsize_img)) {
                    input.value = '';
                    toaster.pop('warning', `Kích cỡ ảnh ${file.name} vượt quá giới hạn ` + _maxsize_img + ' MB');
                    return;
                }
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#imgdAnh').attr('src', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        };
    }
]);

app.controller('DMDangThucCauHoiCtrl', ['$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao'
    , function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        if (!_.some($scope.user.Claim, x => x === EClaimRole.Admin)) {
            $scope.$state.go('notfound');
        }
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        $scope.tbName = 'DMDangThucCauHoi';

        $scope.setQueryParam = function () {
            $scope.mQueryParam = {
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: $scope.iPageSize
            }
        }

        setTimeout(async () => {
            $scope.refreshData(1);
        }, 0);

        $scope.GetExcel = async () => {
            const res = await svApi.showPage({
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: 100000,
            }).$promise;
            const dataExport = res.List.map(x => {
                return {
                    Id: x.Id,
                    TenNgan: x.TenNgan,
                    Ten: x.Ten,
                    Ma: x.Ma,
                    GioiThieu: x.GioiThieu,
                    HuongDan: x.HuongDan,
                }
            })
            return svBaoCao.exportExcel({
                TemplatesExcel: 'VTest-DMDangThucCauHoi',
                ExcelStartRow: 7,
                ExcelStartCol: 1,
                ColmunName: ['Ten', 'TenNgan', 'Ma', 'GioiThieu', 'HuongDan'],
                ObjData: dataExport,
                InsertSTT: true
            }).$promise.then(function () {
                ngProgress.complete(true);
                return true;
            }, function () {
                ngProgress.complete(true);
                toaster.pop('error', 'Thao tác thất bại', 'Vui lòng thử lại sau');
                return false;
            });
        }

        $scope.checkDataBeforSave = function () {
            if (!$scope.mData.Ten) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Tên');
                return false;
            }
            if (!$scope.mData.Ma) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Mã');
                return false;
            }
            if (!$scope.mData.TenNgan) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Tên Ngắn');
                return false;
            }

            return true;
        }

    }
]);

app.controller('DMCapDoTuDuyCtrl', ['$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao'
    , function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        if (!_.some($scope.user.Claim, x => x === EClaimRole.Admin)) {
            $scope.$state.go('notfound');
        }
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        $scope.tbName = 'DMCapDoTuDuy';

        $scope.setQueryParam = function () {
            $scope.mQueryParam = {
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: $scope.iPageSize
            }
        }

        setTimeout(async () => {
            $scope.refreshData(1);
        }, 0);

        $scope.GetExcel = async () => {
            const res = await svApi.showPage({
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: 100000,
            }).$promise;
            const dataExport = res.List.map(x => {
                return {
                    Id: x.Id,
                    Ten: x.Ten,
                    Ma: x.Ma,
                    Color: x.Color,
                    MoTa: x.MoTa,
                }
            })
            return svBaoCao.exportExcel({
                TemplatesExcel: 'VTest-DMCapDoTuDuy',
                ExcelStartRow: 6,
                ExcelStartCol: 1,
                ColmunName: ['Ten', 'Ma', 'Color', 'MoTa'],
                ObjData: dataExport,
                InsertSTT: true
            }).$promise.then(function () {
                ngProgress.complete(true);
                return true;
            }, function () {
                ngProgress.complete(true);
                toaster.pop('error', 'Thao tác thất bại', 'Vui lòng thử lại sau');
                return false;
            });
        }

        $scope.checkDataBeforSave = function () {
            if (!$scope.mData.Ten) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Tên');
                return false;
            }
            if (!$scope.mData.Ma) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Mã');
                return false;
            }
            return true;
        }

    }
]);

app.controller('DMHuongDanLamBaiThiCtrl', ['$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao'
    , function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        $scope.tinymceOptions = tinymceOptions;
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        $scope.tbName = 'DMHuongDanLamBaiThi';
        $scope.idMonHoc = ''

        $scope.setQueryParam = function () {
            $scope.mQueryParam = {
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: $scope.iPageSize,
                idMonHoc: $scope.idMonHoc
            }
        }

        setTimeout(() => {
            svApi.getAll({ tbName: 'DMMonHoc' }).$promise.then(d => {
                $scope.DsMonHoc = d;
                $scope.idMonHoc = d?.[0]?.Id;
                $scope.refreshData(1);
            });
        }, 0);

        $scope.setDataForAddNew = function () {
            $scope.mData.IdMonHoc = $scope.idMonHoc;
            $scope.mData.ThuTu = $scope.total;
        }
        $scope.checkDataBeforSave = function () {
            if (!$scope.mData.TieuDe) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Tiêu đề');
                return false;
            }
            if (!$scope.mData.NoiDung) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Nội dung');
                return false;
            }
            if (!$scope.mData.TuKhoa) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Từ khóa');
                return false;
            }
            if (!$scope.mData.IdMonHoc) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa chọn Môn học');
                return false;
            }
            return true;
        }
        $scope.GetExcel = async () => {
            ngProgress.start();
            const res = await svApi.showPage({
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: 100000,
                idMonHoc: $scope.idMonHoc
            }).$promise;
            const dataExport = res.List.map(x => {
                return {
                    Id: x.Id,
                    TieuDe: x.TieuDe,
                    NoiDung: x.NoiDung,
                    TuKhoa: x.TuKhoa,
                    MonHoc: $scope.DsMonHoc.find(y => y.Id === x.IdMonHoc).Ten
                }
            })
            return svBaoCao.exportExcel({
                TemplatesExcel: 'VTest-DMHuongDanLamBaiThi',
                ExcelStartRow: 6,
                ExcelStartCol: 1,
                ColmunName: ['TieuDe', 'TuKhoa', 'MonHoc', 'NoiDung'],
                ObjData: dataExport,
                InsertSTT: true
            }).$promise.then(function () {
                ngProgress.complete(true);
                return true;
            }, function () {
                ngProgress.complete(true);
                toaster.pop('error', 'Thao tác thất bại', 'Vui lòng thử lại sau');
                return false;
            });
        }
    }
]);

app.controller('DMChuDeKienThucCtrl', [
    '$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao',
    function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        const mSuper = angular.extend({}, $scope);
        $scope.tbName = 'DMChuDeKienThuc';
        $scope.idMonHoc = '';
        var inputPdf = $("#myPdf").get(0);
        const _maxsize_pdf = 10;

        $scope.setQueryParam = function () {
            $scope.mQueryParam = {
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: $scope.iPageSize,
                idMonHoc: $scope.idMonHoc
            };
        };

        setTimeout(() => {
            svApi.getAll({ tbName: 'DMMonHoc' }).$promise.then(d => {
                $scope.DsMonHoc = d;
                $scope.idMonHoc = d?.[0]?.Id;
                $scope.refreshData(1);
            });
        }, 0);

        $scope.setDataForAddNew = function () {
            $scope.mData.IdMonHoc = $scope.idMonHoc;
            $scope.mData.ThuTu = $scope.total + 1;
        };

        $scope.checkDataBeforSave = function () {
            if (!$scope.mData.Ten) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập Tên');
                return false;
            }
            if (!$scope.mData.IdMonHoc) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa chọn Môn học');
                return false;
            }
            return true;
        };

        $scope.setDataBeforSave = function () {
            if ($scope.mData.ThuTu === "" || !$scope.mData.ThuTu) {
                $scope.mData.ThuTu = $scope.total + 1
            }
        }

        $scope.CreateOrUpdate = async function (isOpenMaster = true) {
            if ($scope.filePdf) {
                const resPdf = await svApi.uploadfile({
                    folder: 'FileLyThuyetOnTap',
                    delFile: $scope.UrlFilePDFCu ?? ''
                }, [$scope.filePdf]);
                if (resPdf && resPdf.length > 0) {
                    $scope.mData.FileLyThuyet = resPdf?.[0];
                    var data = await PDFtoIMG(resPdf?.[0]);
                    if (data) {
                        var ds = await svApi.post({
                            tbName: 'DMChuDeKienThuc', fName: 'saveimg',
                            folder: $scope.mData.FolderLyThuyet || ''
                        }, data).$promise;
                        $scope.mData.FolderLyThuyet = ds.folder;
                        $scope.mData.SoTrang = ds.sotrang;
                    }
                }
            } else {
                if ($scope.UrlFilePDFCu) {
                    await svApi.deleteMultipleFile({
                        delFile: $scope.UrlFilePDFCu ?? ''
                    });
                }
            }
            $scope.filePdf = null;
            mSuper.CreateOrUpdate(isOpenMaster);
        };

        function PDFtoIMG(url) {
            return new Promise(async (resolve, reject) => {
                var { pdfjsLib } = globalThis;
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.vett.io.vn/plugins/pdf/build/pdf.worker.js';
                const pdf = await pdfjsLib.getDocument(url).promise;
                const pages = [];
                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1.5 });

                    const canvas = document.createElement('canvas');
                    canvas.id = `canvas-page-${pageNumber}`;
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width
                    canvas.height = viewport.height
                    const task = page.render({ canvasContext: ctx, viewport: viewport })
                    task.promise.then(() => {
                        pages.push({
                            Base64: canvas.toDataURL("image/jpeg").replace(/^data:image\/(png|jpg|jpeg);base64,/, '')
                        })
                        if (pageNumber == pdf.numPages) {
                            resolve(pages)
                        }
                    })
                }
            })
        };
        $scope.ChonFilePDF = function () {
            if (inputPdf.files && inputPdf.files[0]) {
                const file = inputPdf.files[0];
                if (file.type !== 'application/pdf') {
                    inputPdf.value = '';
                    $scope.$apply(() => {
                        toaster.pop('warning', `Yêu cầu chọn file ${file.name} có định dạng pdf`);
                    })

                    return;
                }
                if (_maxsize_pdf && ((file.size / 1048576) > _maxsize_pdf)) {
                    inputPdf.value = '';
                    $scope.$apply(() => {
                        toaster.pop('warning', `Kích cỡ file ${file.name} vượt quá giới hạn ` + _maxsize_pdf + ' MB');
                    })

                    return;
                }
                var reader = new FileReader();

                reader.onload = function (e) {
                    $scope.$apply(function () {
                        $scope.UrlFilePDFCu = $scope.mData.FileLyThuyet;
                        $scope.fileLyThuyetName = file.name;
                    });
                }
                inputPdf.value = '';
                reader.readAsDataURL(file);
                $scope.filePdf = file;
            }
        };
        $scope.XoaFilePDF = function () {
            $scope.UrlFilePDFCu = $scope.mData.FileLyThuyet;
            $scope.mData.FileLyThuyet = '';
            $scope.filePdf = null;
        }

        $scope.openFile = function (filePath) {
            if (filePath) {
                window.open(filePath, '_blank');
            }
        }

        $scope.openFileAnh = function (row) {
            $scope.lsimg = [];
            for (var i = 1; i <= row.SoTrang; i++) {
                $scope.lsimg.push(row.FolderLyThuyet + `page-${i}.jpg`);
            }
            $('#myModal-viewimg').modal({});
        }

        $scope.OpenDetailForm = function (d) {
            $scope.fileLyThuyetName = null;
            mSuper.OpenDetailForm(d)
        }


        //Export excel
        $scope.GetExcel = async () => {
            ngProgress.start();
            const res = await svApi.showPage({
                tbName: $scope.tbName,
                sSearch: $scope.sSearch,
                iPageIndex: $scope.iPageIndex,
                iPageSize: 100000,
                idMonHoc: $scope.idMonHoc
            }).$promise;
            const dataExport = res.List.map(x => {
                return {
                    Id: x.Id,
                    Ten: x.Ten,
                    Ma: x.Ma,
                    GioiThieu: x.GioiThieu,
                    MonHoc: $scope.DsMonHoc.find(y => y.Id === x.IdMonHoc).Ten
                }
            })
            return svBaoCao.exportExcel({
                TemplatesExcel: 'VTest-DMChuDeKienThuc',
                ExcelStartRow: 6,
                ExcelStartCol: 1,
                ColmunName: ['Ten', 'Ma', 'MonHoc', 'GioiThieu'],
                ObjData: dataExport,
                InsertSTT: true
            }).$promise.then(function () {
                ngProgress.complete(true);
                return true;
            }, function () {
                ngProgress.complete(true);
                toaster.pop('error', 'Thao tác thất bại', 'Vui lòng thử lại sau');
                return false;
            });
        }

        //delete
        $scope.Delete = function (row) {
            if (row.Id) {
                confirmPopup('Cảnh báo', 'Anh/chị chắc chắn xóa vĩnh viễn chưa ạ?', function () {
                    ngProgress.start();
                    svApi.delete({
                        tbName: $scope.tbName,
                        id: row.Id
                    }).$promise.then(function (d) {
                        toaster.pop('success', 'Thông báo', 'Xóa dữ liệu thành công');
                        ngProgress.complete();
                        $scope.refreshData($scope.iPageIndex);
                    }, function (err) {
                        toaster.pop('warning', 'Cảnh báo', err.data?.Message ?? err.data);
                        ngProgress.complete();
                    });
                });
            }
        }
    }
]);


app.controller('DMNangLucCtrl', ['$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao'
    , function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        $scope.tinymceOptions = tinymceOptions;
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        $scope.tbName = 'DMNangLuc';
        $scope.idMonHoc = '';
        $scope.ListDatas = [];

        $scope.refreshData = function () {
            ngProgress.start();
            svApi.getList({ tbName: $scope.tbName, fName: 'list', idmonhoc: $scope.idMonHoc }).$promise.then((d) => {
                $scope.ListDatas = d;
                ngProgress.complete();
            }, er => {
                ngProgress.complete();
            });
        }

        setTimeout(() => {
            svApi.getAll({ tbName: 'DMMonHoc' }).$promise.then(d => {
                $scope.DsMonHoc = d;
                $scope.idMonHoc = d?.[0]?.Id;
                $scope.refreshData();
            });
        }, 0);

        $scope.setDataForAddNew = function () {
            $scope.mData.IdMonHoc = $scope.idMonHoc;
            $scope.mData.ThuTu = $scope.ListDatas.length + 1;
        }
        $scope.checkDataBeforSave = function () {
            if (!$scope.mData.Ten) {
                toaster.pop('warning', 'Cảnh báo', 'Chưa nhập tên năng lực');
                return false;
            }
            return true;
        }
    }
]);

app.controller('ThongKeMonHocCtrl', ['$scope', '$controller', 'ngProgress', 'toaster', 'svApi', 'svBaoCao'
    , function myfunction($scope, $controller, ngProgress, toaster, svApi, svBaoCao) {
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        angular.extend({}, $scope);
        setTimeout(async () => {
            ngProgress.start(true)
            await svApi.getList({ tbName: 'DMMonHoc', fName: 'thong-ke' }).$promise.then(d => {
                $scope.DsMonHoc = d;
            });
            ngProgress.complete(true)
        }, 0);

        $scope.OpenDetailForm = async function (d) {
            await svApi.getList({ tbName: 'DMMonHoc', fName: 'thong-ke-mon-hoc', idMonHoc: d.Id }).$promise.then(d => {
                $scope.DsChuDe = d;
            });
            $('#myModal-detail').modal({
                keyboard: false,
                backdrop: 'static'
            });
            setTimeout(() => {
                $scope.afterOpenDetailForm();
            }, 10);
        }
    }
]);

app.controller('DMBannerCtrl', ['$scope', '$controller', 'ngProgress', 'svApi'
    , function myfunction($scope, $controller, ngProgress, svApi) {
        angular.extend(this, $controller('baseDanhMucCtrl', { $scope: $scope, svService: svApi }));
        const mSuper = angular.extend({}, $scope);
        $scope.tbName = 'DMBanner';
        var input = $("#myFile").get(0);
        var input1 = $("#myFile1").get(0);

        setTimeout(() => {
            ngProgress.start(true);
            svApi.getAll({ tbName: $scope.tbName }).$promise.then(d => {
                $scope.ListDatas = d;
                $scope.refreshData(1);
            })
            ngProgress.complete(true)
        }, 0);

        $scope.afterOpenDetailForm = function () {
            input.value = null;
            input1.value = null;
        }

        $scope.ChonAnh = function () {
            if (input.files && input.files[0]) {
                if (input.files[0].type != "image/jpeg" && input.files[0].type != "image/png") {
                    input.value = '';
                    setTimeout(function () {
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Yêu cầu chọn ảnh có định dạnh jpg hoặc png',
                            time: 2000
                        });
                    }, 2000);
                    return;
                }
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#imgdAnh').attr('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
            }
        };

        $scope.ChonAnh1 = function () {
            if (input1.files && input1.files[0]) {
                if (input1.files[0].type != "image/jpeg" && input1.files[0].type != "image/png") {
                    input1.value = '';
                    setTimeout(function () {
                        $.gritter.add({
                            title: 'Thông báo',
                            text: 'Yêu cầu chọn ảnh có định dạnh jpg hoặc png',
                            time: 2000
                        });
                    }, 2000);
                    return;
                }
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#imgdAnhMobile').attr('src', e.target.result);
                }
                reader.readAsDataURL(input1.files[0]);
            }
        };

        $scope.checkDateBeforSave = function () {
            if (!$scope.mData.UuTien || !$scope.mData.TieuDe || !$scope.mData.UrlHinhAnh || !$scope.mData.UrlHinhAnhMobile) {
                alertPopup('Thiếu thông tin', 'Vui lòng nhập đủ thông tin bắt buộc (*)', null, 'warning');
                return;
            }
            return true;
        }
        $scope.CreateOrUpdate = async function (isOpenMaster = true) {
            if (input.files && input.files.length > 0) {
                let reDsHinh = await svApi.uploadfile({
                    folder: 'Banner',
                    delFile: $scope.mData.UrlHinhAnh
                }, input.files);
                $scope.mData.UrlHinhAnh = reDsHinh[0];
            }
            if (input1.files && input1.files.length > 0) {
                let reDsHinh = await svApi.uploadfile({
                    folder: 'Banner',
                    delFile: $scope.mData.UrlHinhAnhMobile
                }, input1.files);
                $scope.mData.UrlHinhAnhMobile = reDsHinh[0];
            }
            mSuper.CreateOrUpdate(isOpenMaster);
        };
    }]);
