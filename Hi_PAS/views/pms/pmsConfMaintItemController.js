angular.module('pmsConfMaintItemApp', [])
    .controller('PMSConfMaintItemController', ['$scope', '$http', PMSConfMaintItemController]);

function PMSConfMaintItemController($scope, $http) {
    var pmsConfMaintItemVM = this;
    
    pmsConfMaintItemVM.ItemList = [];
    pmsConfMaintItemVM.MachineTypeList = [];
    pmsConfMaintItemVM.ModuleTypeList = [];
    pmsConfMaintItemVM.DeviceTypeList = [];
    pmsConfMaintItemVM.ItemLevelList = [];
    pmsConfMaintItemVM.TBMCheckUnitList = [];
    pmsConfMaintItemVM.CBMCheckUnitList = [];
    pmsConfMaintItemVM.TBMCheckValueList = [];

    pmsConfMaintItemVM.dialogCode;
    pmsConfMaintItemVM.dialogTitle;
    pmsConfMaintItemVM.dialogContent;
    pmsConfMaintItemVM.mSelectedMachineType;
    pmsConfMaintItemVM.mSelectedModuleType;
    pmsConfMaintItemVM.mSelectedDeviceType;
    pmsConfMaintItemVM.mSelectedItemLevel;
    pmsConfMaintItemVM.mSelectedTBMCheckUnit;
    pmsConfMaintItemVM.mSelectedTBMCheckValue = [{ Value : 0, Name : null}];
    pmsConfMaintItemVM.mSelectedCBMCheckUnit;
    pmsConfMaintItemVM.mSelectedCBMCheckValue;
    pmsConfMaintItemVM.mSelectedCBMCheckValueWaring;
    pmsConfMaintItemVM.mSelectedItemCheckType = 0; // Default TBM   see PMSMaintItemDataSchema    
    pmsConfMaintItemVM.mSelectedItemType = 0; // Default Check  see PMSMaintItemDataSchema    


    /* Export Function declare */
    pmsConfMaintItemVM.ShowMaintItemCreateView = ShowMaintItemCreateView;
    pmsConfMaintItemVM.CloseMaintItemCreateView = CloseMaintItemCreateView;
    pmsConfMaintItemVM.ShowItemActionListView = ShowItemActionListView;
    pmsConfMaintItemVM.CloseItemActionListView = CloseItemActionListView;
    pmsConfMaintItemVM.SaveMaintItem = SaveMaintItem;
    pmsConfMaintItemVM.OnChangeMachineTypeList = OnChangeMachineTypeList;
    pmsConfMaintItemVM.OnChangeModuleTypeList = OnChangeModuleTypeList;
    pmsConfMaintItemVM.OnSelectTBMOption = OnSelectTBMOption;
    pmsConfMaintItemVM.OnSelectCBMOption = OnSelectCBMOption;
    pmsConfMaintItemVM.OnChangeTBMCheckUnit = OnChangeTBMCheckUnit;
    pmsConfMaintItemVM.OnSelectItemTypeCheck = OnSelectItemTypeCheck;
    pmsConfMaintItemVM.OnSelectItemTypeAction = OnSelectItemTypeAction;       
    pmsConfMaintItemVM.OnMotherDataLoad = OnMotherDataLoad;
    pmsConfMaintItemVM.initializeControl = initializeControl;
    pmsConfMaintItemVM.DeleteItem = DeleteItem;
    pmsConfMaintItemVM.UpdateMaintItem = UpdateMaintItem;
    var newobject;
    newCode();// 실행될때 DB 정보로 new code 생성. new 버튼 누르면 비동기 처리 후 사용. 

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_PMS_MenuConfigSubMaintItem") {
            initializeControl();
        }
    });
    $scope.file_changed = function (element) {
        $scope.$apply(function (scope) {
            var photofile = element.files[0];
            var fd = new FormData();
            fd.append('ExcelFile', photofile);

            $http.post('/pms/createmother', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
                .success(function () {
                    alert("Excel Import 성공");
                    OnMotherDataLoad();
                })
                .error(function () {
                    alert("Excel Import 실패");
                });
        });
    };
    function OnMotherDataLoad(){function callback(err, temp) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(temp);
            }
        }
        $http.get("/pms/displaymothertable").success(function (res) {
            callback(null, res);
            pmsConfMaintItemVM.ItemList = res;
        }, function (err) {
            console.log(err);
        });
    }
    function DeleteItem(Code) {// UID를 어떻게 알까?? 
        var url = "/pms/deletemother?Code=" + Code;
        //  var url = "/pms/onemother/" 
        $http.delete(url).success(function (res) {
            //inputmotherdata(res);
            newCode();
            var message_createsuccess = Code;
            message_createsuccess += '삭제';
            alert(message_createsuccess);
            CloseMaintItemCreateView();
            OnMotherDataLoad();
        }, function (err) {
            console.log(err);
        });
    }

    function initializeControl() {
        
        $http.get('/pms/getMaintItemList')        
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.ItemList = response.data;
            }
        }, function (err) {
            console.log(err);
        });
    }    
    function loadMaintItemList() {
        $http.get('/pms/getMaintItemList')
            .then(function (response) {
                if (response.data) {
                    pmsConfMaintItemVM.ItemList = response.data;
                }
            }, function (err) {
                console.log(err);
            });
    }    

    function ShowMaintItemCreateView(maintItemUID) {
        if (maintItemUID == -1) {//새것 
            $('#ID_PMS_ConfMaintItemCreateModal').modal(); ID_PMS_ConfMaintItemCreateModal_Save
            document.getElementById('ID_PMS_ConfMaintItemCreateModal_Delete').disabled = true;
            document.getElementById('ID_PMS_ConfMaintItemCreateModal_Update').disabled = true;
            document.getElementById('ID_PMS_ConfMaintItemCreateModal_Save').disabled = false;
            document.getElementById('ID_PMS_ConfMaintItemTypeCheck').disabled = false;
            document.getElementById('ID_PMS_ConfMaintItemTypeAction').disabled = false;
            LoadMachineTypeList(0);
            LoadItemLevelList();
            LoadTBMCheckUnitList();
            LoadCBMCheckUnitList();

            // 코드 할당
            if (document.getElementById('ID_PMS_ConfMaintItemTypeCheck').checked == true)
                pmsConfMaintItemVM.dialogCode = newobject.check;
            else if (document.getElementById('ID_PMS_ConfMaintItemTypeAction').checked == true)
                pmsConfMaintItemVM.dialogCode = newobject.action;
        }
        if (maintItemUID != -1) {//헌것 
            document.getElementById('ID_PMS_ConfMaintItemCreateModal_Delete').disabled = false;
            document.getElementById('ID_PMS_ConfMaintItemCreateModal_Update').disabled = false;
            document.getElementById('ID_PMS_ConfMaintItemCreateModal_Save').disabled = true;
            document.getElementById('ID_PMS_ConfMaintItemTypeCheck').disabled = true;;
            document.getElementById('ID_PMS_ConfMaintItemTypeAction').disabled = true;
            /*  XXX Load MaintItemInfo & fill view */
            var url = "/pms/onemother?Code=" + maintItemUID;
            console.log("호출url: ", url);
            $http.get(url).success(function (res) {
                console.log("호출결과", res);
                pmsConfMaintItemVM.dialogCode = res.Code;//코드 
                LoadMachineTypeList(res.DeviceType);// 장비 
                pmsConfMaintItemVM.dialogTitle = res.Title;
                pmsConfMaintItemVM.dialogContent = res.Content;
            //    LoadItemLevelList();
             //   LoadTBMCheckUnitList();
             //   LoadCBMCheckUnitList();
               // inputmotherdata(res);
                console.log(pmsConfMaintItemVM.dialog_input_title);

            }, function (err) {
                console.log(err);
            });
        }        
    }       

    function CloseMaintItemCreateView() {
        $('#ID_PMS_ConfMaintItemCreateModal').modal('toggle');
    }
        
    function ShowItemActionListView() {
        $('#ID_PMS_ConfMaintItemActionModal').modal();
    }

    function CloseItemActionListView() {
        $('#ID_PMS_ConfMaintItemActionModal').modal('toggle');
    }

    function SaveMaintItem() {
        
        /* XXX verify UI data */
              
        $http.post('/pms/createMaintItem', {
            params: {
                Code: pmsConfMaintItemVM.dialogCode,//$('#ID_PMS_ConfMaintItemCode').val(), 수정 함. jisk 2017-08-04
                Title : $('#ID_PMS_ConfMaintItemTitle').val(),
                Content : $('#ID_PMS_ConfMaintItemContent').val(),
                DeviceType : pmsConfMaintItemVM.mSelectedDeviceType.UID,
                CreateDate : Date.now(),
                CheckType : pmsConfMaintItemVM.mSelectedItemCheckType,
                TBMCheckUnit : pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID,
                TBMCheckValue : pmsConfMaintItemVM.mSelectedTBMCheckValue.Value,
                CBMCheckUnit : pmsConfMaintItemVM.mSelectedCBMCheckUnit.UID,
                CBMCheckLimitValue : $('#ID_PMS_ConfMaintItemCBMLimitValue').val(),
                CBMCheckWarnLimitValue : $('#ID_PMS_ConfMaintItemCBMWarnLimitValue').val(),
                Type : pmsConfMaintItemVM.mSelectedItemType,
                Level : pmsConfMaintItemVM.mSelectedItemLevel.UID
            }
        }).then(function (response) {
            newCode(); //새 코드 가져옴.
            OnMotherDataLoad();
            alert('생성',pmsConfMaintItemVM.dialogCode);
            CloseMaintItemCreateView();
        }, function (err) {
            console.log(err);
        });                   
    }
    function UpdateMaintItem() {
        console.log('pmsConfMaintItemVM.dialogCode', pmsConfMaintItemVM.dialogCode);
        console.log('pmsConfMaintItemVM.dialogTitle', pmsConfMaintItemVM.dialogTitle);
        console.log('pmsConfMaintItemVM.dialogContent', pmsConfMaintItemVM.dialogContent);
        console.log('pmsConfMaintItemVM.mSelectedMachineType', pmsConfMaintItemVM.mSelectedMachineType);
        console.log('pmsConfMaintItemVM.mSelectedItemCheckType', pmsConfMaintItemVM.mSelectedItemCheckType);
        console.log('pmsConfMaintItemVM.mSelectedTBMCheckUnit', pmsConfMaintItemVM.mSelectedTBMCheckUnit);
        console.log('pmsConfMaintItemVM.mSelectedTBMCheckValue', pmsConfMaintItemVM.mSelectedTBMCheckValue);
        console.log('pmsConfMaintItemVM.mSelectedCBMCheckUnit', pmsConfMaintItemVM.mSelectedCBMCheckUnit);
        console.log('pmsConfMaintItemVM.mSelectedCBMCheckValue', pmsConfMaintItemVM.mSelectedCBMCheckValue);
        console.log('pmsConfMaintItemVM.mSelectedCBMCheckValueWaring', pmsConfMaintItemVM.mSelectedCBMCheckValueWaring);
 

        $http.post('/pms/updateitem', {
            Code: pmsConfMaintItemVM.dialogCode, //코드는 변경 안됨.
            Title: pmsConfMaintItemVM.dialogTitle,
            Content: pmsConfMaintItemVM.dialogContent,
            DeviceType: pmsConfMaintItemVM.mSelectedMachineType,
            CheckType: pmsConfMaintItemVM.mSelectedItemCheckType,
            TBMCheckUnit: pmsConfMaintItemVM.mSelectedTBMCheckUnit,
            TBMCheckValue: pmsConfMaintItemVM.mSelectedTBMCheckValue,//timevalue(),
            CBMCheckUnit: pmsConfMaintItemVM.mSelectedCBMCheckUnit,
            CBMCheckLimitValue: pmsConfMaintItemVM.mSelectedCBMCheckValue,
            CBMCheckWarnLimitValue: pmsConfMaintItemVM.mSelectedCBMCheckValueWaring,
          
            Relation: [],
            
            
            Type: pmsConfMaintItemVM.mSelectedItemType,
            Level: pmsConfMaintItemVM.mSelectedItemLevel
        })
            .success(function () {
                var message_createsuccess = pmsConfMaintItemVM.dialog_input_code;
                message_createsuccess += '수정 성공';
                alert(message_createsuccess);
                CloseMaintItemCreateView();
                OnMotherDataLoad();
            })
            .error(function (data) {

                if (data.error == 'duplicate') {
                    onValidateDuplicate(false);
                }
            });

    }
    function OnChangeMachineTypeList() {
        LoadModuleTypeList();        
    }
    
    function OnChangeModuleTypeList() {
        LoadDeviceTypeList();
    }
    
    function OnSelectTBMOption() {
        pmsConfMaintItemVM.mSelectedItemCheckType = 0;

        $('#ID_PMS_ConfMaintItemCBMOption').prop("checked", false);
    }

    function OnSelectCBMOption() {
        pmsConfMaintItemVM.mSelectedItemCheckType = 1;

        $('#ID_PMS_ConfMaintItemTBMOption').prop("checked", false);
    }
    
    function OnChangeTBMCheckUnit() {
        
        pmsConfMaintItemVM.TBMCheckValueList = [];
        
        if (pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID == 1) {
            $('#ID_PMS_ConfMaintItemTBMCheckValue').prop('disabled', true);
        }
        else if (pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID == 2) {
            
            $('#ID_PMS_ConfMaintItemTBMCheckValue').prop('disabled', false);
           
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 1, 
                Name : "월",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 2, 
                Name : "화",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 3, 
                Name : "수",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 4, 
                Name : "목",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 5, 
                Name : "금",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 6, 
                Name : "토",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 7, 
                Name : "일",
            });

            pmsConfMaintItemVM.mSelectedTBMCheckValue = pmsConfMaintItemVM.TBMCheckValueList[0];
                
        }
        else if (pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID == 3) {
            $('#ID_PMS_ConfMaintItemTBMCheckValue').prop('disabled', false);
            
            for (var i = 1; i <= 31 ; i++) {
                pmsConfMaintItemVM.TBMCheckValueList.push({
                    Value : i,                     
                    Name : i,
            
                });
            }

            pmsConfMaintItemVM.mSelectedTBMCheckValue = pmsConfMaintItemVM.TBMCheckValueList[0];
        }
    }
    
    function OnSelectItemTypeCheck() {
        
        pmsConfMaintItemVM.mSelectedItemType = 0;
     
        $('#ID_PMS_ConfMaintItemTypeAction').prop("checked", false);

        pmsConfMaintItemVM.dialogCode = newobject.check;//점검 코드 부여
    }
    
    function OnSelectItemTypeAction() {

        pmsConfMaintItemVM.mSelectedItemCheckType = 1;
        
        $('#ID_PMS_ConfMaintItemTypeCheck').prop("checked", false);       

        pmsConfMaintItemVM.dialogCode = newobject.action; //조치 코드 부여
    }

    
    /* Internal functions *******************************************/
    function LoadMachineTypeList(value) {
        $http.get('/pms/getMachineTypeList')
            .then(function (response) {               
                if (response.data) {
                    pmsConfMaintItemVM.MachineTypeList = response.data;
                    for (var rd_i = 0; rd_i < response.data.length; rd_i++) {
                        if( value==rd_i)
                            pmsConfMaintItemVM.mSelectedMachineType = pmsConfMaintItemVM.MachineTypeList[rd_i]
                    }
                    LoadModuleTypeList(pmsConfMaintItemVM.mSelectedMachineType);
                }
            }, function (err) {
                console.log(err);
        });        
    }

    function LoadModuleTypeList(value) {
        
        pmsConfMaintItemVM.ModuleTypeList = [];

        if (pmsConfMaintItemVM.mSelectedMachineType == null) {        
            return;    
        }

        $http.get('/pms/getModuleTypeList', {
            params: {
                MachineType: pmsConfMaintItemVM.mSelectedMachineType.UID 
            }                                             
        }).then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.ModuleTypeList = response.data;
                pmsConfMaintItemVM.mSelectedModuleType = pmsConfMaintItemVM.ModuleTypeList[0];

                LoadDeviceTypeList();
            }
        }, function (err) {
            console.log(err);
        });
                        
    }

    function LoadDeviceTypeList() {
        
        pmsConfMaintItemVM.DeviceTypeList = [];
        
        if (pmsConfMaintItemVM.mSelectedMachineType == null
                || pmsConfMaintItemVM.mSelectedModuleType == null) {
            return;
        }        

        $http.get('/pms/getDeviceTypeList', {
            params: {
                MachineType: pmsConfMaintItemVM.mSelectedMachineType.UID,
                ModuleType: pmsConfMaintItemVM.mSelectedModuleType.UID
            }
        }).then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.DeviceTypeList = response.data;
                pmsConfMaintItemVM.mSelectedDeviceType = pmsConfMaintItemVM.DeviceTypeList[0];
            }
        }, function (err) {
            console.log(err);
        });                
    }
    
    function LoadItemLevelList() {
        $http.get('/pms/getMaintItemLevelList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.ItemLevelList = response.data;
                pmsConfMaintItemVM.mSelectedItemLevel = pmsConfMaintItemVM.ItemLevelList[0];                
            }
        }, function (err) {
            console.log(err);
        });
    }
    
    function LoadTBMCheckUnitList() {
        $http.get('/pms/getTBMCheckUnitList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.TBMCheckUnitList = response.data;
                pmsConfMaintItemVM.mSelectedTBMCheckUnit = pmsConfMaintItemVM.TBMCheckUnitList[0];
            }
        }, function (err) {
            console.log(err);
        });
    }
    
    function LoadCBMCheckUnitList() {
        $http.get('/pms/getCBMCheckUnitList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.CBMCheckUnitList = response.data;
                pmsConfMaintItemVM.mSelectedCBMCheckUnit = pmsConfMaintItemVM.CBMCheckUnitList[0];
            }
        }, function (err) {
            console.log(err);
        });
    }
    //잡다 함수
    function findnumber(array, number) {
        return (array.indexOf(number) != -1);
    }
    function emptyNumber(Inputarray) {
        var minIndex = Inputarray[0];//min 번호 ex) AC100 -> 100. 
        var maxIndex = Inputarray[Inputarray.length - 1];
        //array의 최대 최소 값 사이에 빈 값으로 할당 한다. 
        for (var i = 1; i <= maxIndex + 1; i++) {
            var flag = false;// 이미 할당 되있는 값인지 확인.
            for (var j = 0; j < Inputarray.length; j++) {
                if (findnumber(Inputarray, i)) {
                    flag = true; // 찾았다.
                    break;//찾으면 다음 후보로 넘어간다.
                }
            }
            if (flag == false)//새로 할당할 번호가 기존 값에 없다.
            {
                return i;// 할당할 번호를 반환한다. 
            }
        }
    }
    function cipher(number) {

        if (number > 99)// 세 자리수 
            return number;
        else if (number > 9)//두 자리 수 
            return '0' + number;
        else    //1자리 수.
            return '00' + number;
    }
    function newCode() {
        $http.get("/pms/getcode").success(function (res) {
            var code = res; //점검/조치 코드 배열.
            var ACcode;
            var PMcode;
            code.sort(function (a, b) {
                return a.Code < b.Code ? -1 : a.Code > b.Code ? 1 : 0;
            });
            var action_codearray = [];
            var check_codearray = [];
            //점검, 코드 별로 추림. 
            for (var k = 0; k < code.length; k++) {
                //접두 AC 항목 
                if (code[k].Code.substring(0, 2) == 'AC') {
                    var a = code[k].Code.substring(2) * 1;
                    action_codearray.push(a);
                }// PM 항목
                else if (code[k].Code.substring(0, 2) == 'PM') {
                    check_codearray.push(code[k].Code.substring(2) * 1);
                }
            }
            for (var i = 0; i < action_codearray.length; i++)
                action_codearray[i] *= 1;
            for (var i = 0; i < check_codearray.length; i++)
                check_codearray[i] *= 1;
            // AC or PM3 + 자리 int로 반환 
            ACcode = 'AC' + cipher(emptyNumber(action_codearray));
            PMcode = 'PM' + cipher(emptyNumber(check_codearray));

            if (action_codearray.length == 0)
                ACcode = 'AC001';
            if (check_codearray.length == 0)
                PMcode = 'PM001';

            console.log('PMcode', PMcode);
            console.log('ACcode', ACcode);
            newobject = {
                check: PMcode, action: ACcode
            };
        }, function (err) {
            console.log(err);
        });
    }
}

