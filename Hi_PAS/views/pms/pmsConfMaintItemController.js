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
    pmsConfMaintItemVM.ActionList = []; 
    pmsConfMaintItemVM.selectedActionList = [];
    pmsConfMaintItemVM.ItemsActionList = [];


    pmsConfMaintItemVM.dialogCode;
    pmsConfMaintItemVM.dialogTitle;
    pmsConfMaintItemVM.dialogContent;
    pmsConfMaintItemVM.dialogTypeCheck
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
    pmsConfMaintItemVM.mPivotactionCode;
    pmsConfMaintItemVM.mPivotactionDeviceType;

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
    pmsConfMaintItemVM.LoadactionListbyCode = LoadactionListbyCode;
    pmsConfMaintItemVM.moveActionList = moveActionList;
    pmsConfMaintItemVM.showactionlistbycheckbox = showactionlistbycheckbox;
    var newobject;
    newCode();// 실행될때 DB 정보로 new code 생성. new 버튼 누르면 비동기 처리 후 사용. 
    CommConfItem();
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
    /*
     data를 최초로 생성 할 때. 
     */
    function InitNewItem() {
        document.getElementById('ID_PMS_ConfMaintItemCreateModal_Delete').disabled = true;
        document.getElementById('ID_PMS_ConfMaintItemCreateModal_Update').disabled = true;
        document.getElementById('ID_PMS_ConfMaintItemCreateModal_Save').disabled = false;
        document.getElementById('ID_PMS_ConfMaintItemTypeCheck').disabled = false;
        document.getElementById('ID_PMS_ConfMaintItemTypeAction').disabled = false;
        OnSelectItemTypeCheck();
    }
    /*
     생성되 있는 data 수정 할 때  
     */
    function InitEditeItem() {
        document.getElementById('ID_PMS_ConfMaintItemCreateModal_Delete').disabled = false;
        document.getElementById('ID_PMS_ConfMaintItemCreateModal_Update').disabled = false;
        document.getElementById('ID_PMS_ConfMaintItemCreateModal_Save').disabled = true;
        document.getElementById('ID_PMS_ConfMaintItemTypeCheck').disabled = true;;
        document.getElementById('ID_PMS_ConfMaintItemTypeAction').disabled = true;
    }
    /*Lis box 초기화*/
    function CommConfItem() {
        LoadMachineTypeList();
        LoadItemLevelList();
        LoadTBMCheckUnitList();
        LoadCBMCheckUnitList();
        pmsConfMaintItemVM.mSelectedItemType = true;
        OnSelectTBMOption();

    }
    /*
    DB에서 가져다온 data를 설정함.
    */
    function Mappingdata(res) {
        console.log("호출결과", res);
        
       // LoadMachineTypeList(res.DeviceType);// 장비 
        pmsConfMaintItemVM.dialogCode = res.Code;//코드 
        if (res.Type == 0)//조치/점검 이냐 radio
            OnSelectItemTypeCheck();
        else
            OnSelectItemTypeAction();
        pmsConfMaintItemVM.dialogTitle = res.Title; //점검명 text
        console.log('pmsConfMaintItemVM.dialogTitle',pmsConfMaintItemVM.dialogTitle);  //점검 코드 box
        LoadValueMachineModuleDevice(res.DeviceType, res.Code);//장비 종류 List box //장비 모듈 List box  //장비 부품 List box
        LoadValueLevel(res.Level);//장비 레벨 List box
        pmsConfMaintItemVM.dialogContent = res.Content;//점검 내용 text
        pmsConfMaintItemVM.mSelectedTBMCheckUnit = selectValueInListbyUID(pmsConfMaintItemVM.TBMCheckUnitList, res.TBMCheckUnit);//tbm unit List box
        LoadvalueCheckType(res.CheckType); //tbm이냐 cbm 이냐 radio. unit, value List도 초기화 함.
        pmsConfMaintItemVM.mSelectedTBMCheckValue = pmsConfMaintItemVM.TBMCheckValueList[res.TBMCheckValue-1];//tbm 값 List box
        pmsConfMaintItemVM.mSelectedCBMCheckUnit = selectValueInListbyUID(pmsConfMaintItemVM.CBMCheckUnitList, res.CBMCheckUnit);
        pmsConfMaintItemVM.mSelectedCBMCheckValue =res.CBMCheckLimitValue;
        pmsConfMaintItemVM.mSelectedCBMCheckValueWaring = res.CBMCheckWarnLimitValue;
    }
    function ShowMaintItemCreateView(maintItemUID) {
        
        if (maintItemUID == -1) {//새것 
            $('#ID_PMS_ConfMaintItemCreateModal').modal(); ID_PMS_ConfMaintItemCreateModal_Save
            InitNewItem();
            // 코드 할당
            if (document.getElementById('ID_PMS_ConfMaintItemTypeCheck').checked == true)
                pmsConfMaintItemVM.dialogCode = newobject.check;
            else if (document.getElementById('ID_PMS_ConfMaintItemTypeAction').checked == true)
                pmsConfMaintItemVM.dialogCode = newobject.action;
        }
        if (maintItemUID != -1) {//헌것 
            InitEditeItem();
            /*  XXX Load MaintItemInfo & fill view */
            var url = "/pms/onemother?Code=" + maintItemUID;
            $http.get(url).success(function (res) {
                Mappingdata(res)

            }, function (err) {
                console.log(err);
            });
        }        
    }       
    function LoadValueMachineModuleDevice(DeviceUID, Code) {
        //LoadDeviceModuleMachineTypeList();
        {
            $http.get('/pms/getModule', {
                params: {
                    DeviceUID: DeviceUID,
                    Code: Code
                }
            }).success(function (devicetype) {
                console.log("LoadValueMachineModuleDevice");
                LoadDeviceModuleMachineTypeList(devicetype.MachineType, devicetype.ModuleType, devicetype.UID);
                /*$http.get('/pms/getmachine', {
                    params: {
                        ModuleUID: ModuleType.UID
                    }
                }).success(function (machineType) {

                   // pmsConfMaintItemVM.mSelectedModuleType = pmsConfMaintItemVM.ModuleTypeList[ModuleType.UID - 1];
                    //pmsConfMaintItemVM.mSelectedMachineType = pmsConfMaintItemVM.MachineTypeList[machineType.UID - 1];
                   // pmsConfMaintItemVM.mSelectedDeviceType = pmsConfMaintItemVM.DeviceTypeList[DeviceUID - 1];
                });*/
            });
        }
    }
    function LoadValueLevel(levelUID) {
        pmsConfMaintItemVM.mSelectedItemLevel = selectValueInListbyUID(pmsConfMaintItemVM.ItemLevelList, levelUID);
    }
    function LoadactionListbyCode() {
        
        for (var i = 0; pmsConfMaintItemVM.ActionList.length; i++)
            pmsConfMaintItemVM.ActionList.pop();


        $http.get('/pms/getactionlistbyMacine', {
            params: {
                DeviceUID: pmsConfMaintItemVM.mPivotactionDeviceType,
                Code: pmsConfMaintItemVM.mPivotactionCode
            }
        })
            .then(function (response) {
                if (response.data) {
                    pmsConfMaintItemVM.ActionList = response.data;
                    for (var i = 0; i < pmsConfMaintItemVM.ActionList.length; i++) {
                        if (pmsConfMaintItemVM.ActionList[i].Code == pmsConfMaintItemVM.mPivotactionCode)
                            pmsConfMaintItemVM.ItemsActionList = pmsConfMaintItemVM.ActionList[i].Relation;
                    }


                }
            }, function (err) {
                console.log(err);
            })
            .then(function () {
                showactionlistbycheckbox();
            });
    }
    function moveActionList() {
        //초기화 

        for (var i = 0; pmsConfMaintItemVM.selectedActionList.length; i++)
            pmsConfMaintItemVM.selectedActionList.pop();

        //체크된 항목 저장.
        for (var move_i = 0; move_i < pmsConfMaintItemVM.ActionList.length; move_i++) {
            var access = 'PMS_ID_ACTION' + pmsConfMaintItemVM.ActionList[move_i].Code + '_' + move_i;

            if (document.getElementById(access).checked == true) {
                console.log(access, '선택됨');
                pmsConfMaintItemVM.selectedActionList.push(pmsConfMaintItemVM.ActionList[move_i]);
            }
        }

        console.log(pmsConfMaintItemVM.selectedActionList);
        AddActionList();
    }
    function AddActionList() {
        
        $http.put('/pms/AddactioniList', {
            params: {
                targetList: pmsConfMaintItemVM.selectedActionList,
                Code: pmsConfMaintItemVM.mPivotactionCode
            }
        })
            .success(function (res) {
              

              //  res.shift();
                showactionList(res);
        })
        .error(function (data) {
        });
        
            
    }
    function showactionlistbycheckbox() {
        for (var j = 0; j < pmsConfMaintItemVM.ItemsActionList.length; j++){
            
            var pivotstring = pmsConfMaintItemVM.ItemsActionList[j];
            for (var i = 0; i < pmsConfMaintItemVM.ActionList.length; i++) {
                var access = 'PMS_ID_ACTION' + pmsConfMaintItemVM.ActionList[i].Code + '_' + i;
                if (access.indexOf(pivotstring) != -1) { // 있는 경우 
                    document.getElementById(access).checked = true;
                }
               // console.log('입력결과는?', access.indexOf(pivotstring));
               // console.log(pivotstring, access);
            }
        }
    }
    function deleteactionList() {
        showactionList();
    }
    function showactionList(res) {
        pmsConfMaintItemVM.ItemsActionList = res;
    }
    
    function LoadvalueCheckType(CheckType) {
        if (CheckType == 0) {
            OnSelectTBMOption();
            OnChangeTBMCheckUnit();//리스트 생성.
        }
        else {
            OnSelectCBMOption();
        }
    }
    function CloseMaintItemCreateView() {
        $('#ID_PMS_ConfMaintItemCreateModal').modal('toggle');
    }
    function ShowItemActionListView(Code, DeviceType) {
        for (var i = 0; pmsConfMaintItemVM.ItemsActionList.length; i++) {
            pmsConfMaintItemVM.ItemsActionList.pop();
        }

        $('#ID_PMS_ConfMaintItemActionModal').modal();
        pmsConfMaintItemVM.mPivotactionCode = Code;
        pmsConfMaintItemVM.mPivotactionDeviceType = DeviceType;
        //showActionList(Code);
        //선택 항목 초기화
        for (var move_i = 0; move_i < pmsConfMaintItemVM.ActionList.length; move_i++) {
            var access = 'PMS_ID_ACTION' + pmsConfMaintItemVM.ActionList[move_i].Code + '_' + move_i;
            document.getElementById(access).checked = false;
        }
        //조치 항목 불러오기
        LoadactionListbyCode();
      
    }
    function CloseItemActionListView() {
       
        $('#ID_PMS_ConfMaintItemActionModal').modal('toggle');
    }
    function showActionList(Code) {
        $http.get('/pms/showactionlist', {
            params: {
                Code: Code
            }
        }).success(function (actionarray) {
        });
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
            alert('%s생성 %d', pmsConfMaintItemVM.dialogCode, pmsConfMaintItemVM.mSelectedDeviceType.UID );
            CloseMaintItemCreateView();
        }, function (err) {
            console.log(err);
        });                   
    }
    function UpdateMaintItem() {
        console.log('pmsConfMaintItemVM.dialogCode', pmsConfMaintItemVM.dialogCode);
        console.log('pmsConfMaintItemVM.dialogTitle', pmsConfMaintItemVM.dialogTitle);
        console.log('pmsConfMaintItemVM.dialogContent', pmsConfMaintItemVM.dialogContent);
        console.log('pmsConfMaintItemVM.mSelectedDeviceType', pmsConfMaintItemVM.mSelectedDeviceType);
        console.log('pmsConfMaintItemVM.mSelectedItemCheckType', pmsConfMaintItemVM.mSelectedItemCheckType);
        console.log('pmsConfMaintItemVM.mSelectedTBMCheckUnit', pmsConfMaintItemVM.mSelectedTBMCheckUnit);
        console.log('pmsConfMaintItemVM.mSelectedTBMCheckValue', pmsConfMaintItemVM.mSelectedTBMCheckValue);
        console.log('pmsConfMaintItemVM.mSelectedCBMCheckUnit', pmsConfMaintItemVM.mSelectedCBMCheckUnit);
        console.log('pmsConfMaintItemVM.mSelectedCBMCheckValue', pmsConfMaintItemVM.mSelectedCBMCheckValue);
        console.log('pmsConfMaintItemVM.mSelectedCBMCheckValueWaring', pmsConfMaintItemVM.mSelectedCBMCheckValueWaring);
        console.log('pmsConfMaintItemVM.mSelectedItemLevel', pmsConfMaintItemVM.mSelectedItemLevel);


        $http.post('/pms/updateitem', {
            params: {
                Code: pmsConfMaintItemVM.dialogCode, //코드는 변경 안됨.
                Title: pmsConfMaintItemVM.dialogTitle,
                Content: pmsConfMaintItemVM.dialogContent,
                DeviceType: pmsConfMaintItemVM.mSelectedDeviceType.UID,
                CheckType: pmsConfMaintItemVM.mSelectedItemCheckType,
                TBMCheckUnit: pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID,
                TBMCheckValue: pmsConfMaintItemVM.mSelectedTBMCheckValue.Value,//timevalue(),
                CBMCheckUnit: pmsConfMaintItemVM.mSelectedCBMCheckUnit.UID,
                CBMCheckLimitValue: pmsConfMaintItemVM.mSelectedCBMCheckValue,
                CBMCheckWarnLimitValue: pmsConfMaintItemVM.mSelectedCBMCheckValueWaring,
                Type: pmsConfMaintItemVM.mSelectedItemType,
                Level: pmsConfMaintItemVM.mSelectedItemLevel.UID
            }
        })
            .success(function () {
                var message_createsuccess = pmsConfMaintItemVM.dialogCode;
                message_createsuccess += '수정 성공, UID :';
                message_createsuccess += pmsConfMaintItemVM.mSelectedDeviceType.UID;
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
        $('#ID_PMS_ConfMaintItemTBMOption').prop("checked", true);
        $('#ID_PMS_ConfMaintItemCBMOption').prop("checked", false);
    }
    function OnSelectCBMOption() {
        pmsConfMaintItemVM.mSelectedItemCheckType = 1;
        $('#ID_PMS_ConfMaintItemTBMOption').prop("checked", false);
        $('#ID_PMS_ConfMaintItemCBMOption').prop("checked", true);
    }
    function OnChangeTBMCheckUnit() {
        console.log('onchangeTBMcheckUnit');
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

        //점검/조치 라디오 버튼이 활성화 되있을 때만 새 코드를 할당한다. 
        //-> 새로 만드는 창에는 라디오 버튼이 활서화 되있으므로 코드를 할당하는데 
        //   기존의 창에는 비활성화 되어 있어서 기존의 코드만 사용하게 한다.
        if (document.getElementById('ID_PMS_ConfMaintItemTypeCheck').disabled == false &&
            document.getElementById('ID_PMS_ConfMaintItemTypeAction').disabled == false) {
            pmsConfMaintItemVM.dialogCode = newobject.check;//점검 코드 부여
        }
    }
    function OnSelectItemTypeAction() {

        pmsConfMaintItemVM.mSelectedItemCheckType = 1;
        
        $('#ID_PMS_ConfMaintItemTypeCheck').prop("checked", false);       
        if (document.getElementById('ID_PMS_ConfMaintItemTypeCheck').disabled == false &&
            document.getElementById('ID_PMS_ConfMaintItemTypeAction').disabled == false) {
            pmsConfMaintItemVM.dialogCode = newobject.action; //조치 코드 부여
        }
    }
    /* Internal functions *******************************************/
    function LoadMachineTypeList(value) {
        $http.get('/pms/getMachineTypeList')
            .then(function (response) {
                if (response.data) {
                    pmsConfMaintItemVM.MachineTypeList = response.data;
                    pmsConfMaintItemVM.mSelectedMachineType = pmsConfMaintItemVM.MachineTypeList[0];
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
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        pmsConfMaintItemVM.DeviceTypeList = [];
        
        if (pmsConfMaintItemVM.mSelectedMachineType == null
                || pmsConfMaintItemVM.mSelectedModuleType == null) {
            return;
        }        
        console.log('pmsConfMaintItemVM.mSelectedModuleType', pmsConfMaintItemVM.mSelectedModuleType );
        $http.get('/pms/getDeviceTypeList', {
            params: {
                MachineType: pmsConfMaintItemVM.mSelectedMachineType.UID,
                ModuleType: pmsConfMaintItemVM.mSelectedModuleType.UID
            }
        }).then(function (response) {
           
            if (response.data) {
                pmsConfMaintItemVM.DeviceTypeList = response.data;
                console.log('pmsConfMaintItemVM.mSelectedMachineType,', pmsConfMaintItemVM.mSelectedMachineType );
                console.log(' pmsConfMaintItemVM.mSelectedModuleType,', pmsConfMaintItemVM.mSelectedModuleType );
                console.log('pmsConfMaintItemVM.DeviceTypeList',pmsConfMaintItemVM.DeviceTypeList);
                pmsConfMaintItemVM.mSelectedDeviceType = pmsConfMaintItemVM.DeviceTypeList[0];

            }
        }, function (err) {
            console.log(err);
        });           
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");     
    }
    function LoadDeviceModuleMachineTypeList(MachineUID, ModuleUID, DeviceUID) {
        // DeviceUID, ModuleUID, MacheineUID로 리스트 박스의 List를 먼저 채우고 
        // 채움이 끝나면 List box에 DB의 UID를 참조해 value 를 찾아 넣는다.

        pmsConfMaintItemVM.DeviceTypeList = [];
        $http.get('/pms/getDeviceTypeList', {//device List부터 채운다. 
            params: {
                MachineType: MachineUID,
                ModuleType: ModuleUID
            }
        }).then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.DeviceTypeList = response.data;
            }
            $http.get('/pms/getModuleTypeList', {   //device List 다음 Module List 를 채운다.
                params: {
                    MachineType: MachineUID
                }
            }).then(function (response) {
                if (response.data) {
                    pmsConfMaintItemVM.ModuleTypeList = response.data;
                }// 각 List가 DeviceUID 에 맞게 채워진 후 value를 넣는다. 
                pmsConfMaintItemVM.mSelectedModuleType = selectValueInListbyUID(pmsConfMaintItemVM.ModuleTypeList, ModuleUID);
                pmsConfMaintItemVM.mSelectedDeviceType = selectValueInListbyUID(pmsConfMaintItemVM.DeviceTypeList, DeviceUID);
                pmsConfMaintItemVM.mSelectedMachineType = pmsConfMaintItemVM.MachineTypeList[MachineUID - 1];// machine 은 UID로 index를 찾을 수 있음.
           
            }, function (err) {
                console.log(err);
            });

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
    function selectValueInListbyUID(List, UID) {
        for (var i = 0; i < List.length; i++) {
            if (List[i].UID == UID) {
                return List[i];
            }
        }
    }
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

