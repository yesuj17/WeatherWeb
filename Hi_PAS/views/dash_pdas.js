var MAX_DISPLAY_MOTOR_COUNT = 5;
/* PdAS Javascript */
/* OnLoad() call from index */
function pdas_OnLoad() {    
    var ulElement = document.getElementById('testRow');
    for (var i = 0; i < MAX_DISPLAY_MOTOR_COUNT; i++) {
        $('#ID_PDAS_DASH_RowRealTime').append("<div class='col-md-2' style='margin-left:15px'><div class='round round-lg'></div></div>");
    }
    
    var realTimeDataPerMotor = [];
    var socket = io();
    socket.on('updateCurrentData', function (datas) {
        var currentThreshold = localStorage.getItem('currentThreshold');
        datas.forEach(function(data){
            var currentData = {
                'label': data.MachineID + '_' + data.Type,
                'value': data.CurrentVal.toFixed(1) 
            }
            var isNewOne = true;
            for(index in realTimeDataPerMotor) {
                if(realTimeDataPerMotor[index].label == currentData.label) {
                    realTimeDataPerMotor[index] = currentData;
                    isNewOne = false;
                    break;
                }
            }
            if(isNewOne)
                realTimeDataPerMotor.push(currentData);
        });

        var tmpArrRealTimeData = realTimeDataPerMotor.slice(0);
        tmpArrRealTimeData.sort(function(a, b){ return b.value - a.value;});

        for(index in tmpArrRealTimeData){
            $('#ID_PDAS_DASH_RowRealTime').children().eq(index).children().first().children().remove();
            var targetDiv = $('#ID_PDAS_DASH_RowRealTime').children().eq(index).children().first();
            var htmlText = "<br><a class='moveToPdasAnal' href='#'>" + 
                            "<span class='label'>" + tmpArrRealTimeData[index].value + " A</span></a><br>" +
                            "<span class='label' style='font-size:10px'>" + tmpArrRealTimeData[index].label + "</span>";
           
            var backGroundColorStr = '';
            var borderColor = '';
            var array = [];
            if(currentThreshold){
                array = currentThreshold.split(",").map(Number);
                if(parseFloat(tmpArrRealTimeData[index].value) < array[0]){
                    backGroundColorStr = '#42A129';
                    borderColor = 'green';
                }
                else if(parseFloat(tmpArrRealTimeData[index].value) < array[1]){
                    backGroundColorStr = '#FF6701';
                    borderColor = 'orange';
                }                    
                else{
                    backGroundColorStr = '#ff3333';
                    borderColor = 'red';
                }
                    
            }
            $('#ID_PDAS_DASH_RowRealTime').children().eq(index).children().first().append(htmlText);
            $('#ID_PDAS_DASH_RowRealTime').children().eq(index).children().first().css({'background-color': backGroundColorStr, 'border-Color':borderColor});
        }
    });

    socket.on('updateOEESummaryData', function(data){
        var oeeThreshold = localStorage.getItem('oeeThreshold');
        var array = [];
        var oeeVal = (data.OEE*100).toFixed(1);
        if(oeeThreshold){
            array = oeeThreshold.split(",").map(Number);
            if(oeeVal < array[0])
                fontColor = '#ff3333';
            else if(oeeVal < array[1])
                fontColor = '#FF6701';
            else
                fontColor = '#42A129';
        }
        $('#ID_PDAS_DASH_oee').css({'color':fontColor, 'font-size': '30px'});
        $('#ID_PDAS_DASH_oee').text(oeeVal+'%');
    });
}

$(document).on('click', '.moveToPdasAnal', function () {
    var date = new Date();
    var strDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/'+date.getDate();
    var machineID = $(this).parent().children('span').text().split('_')[0];
    $('#ID_PDAS_analysisDateFrom').val(strDate);
    $('#ID_PDAS_analysisDateTo').val(strDate);
    $("#ID_PDAS_machine").val(machineID).trigger('change');
    $('#ID_PDAS_dateToChangeFlg').val(true).trigger('change');
    $('#ID_PDAS_analysisSearch').trigger('click');
    $('#ID_PDAS_pdasAnalysisModal').modal({
        backdrop: 'static',
    });
});

$(document).on('click', '#ID_PDAS_DASH_btnAnalysis',function(){
    var date = new Date();
    var strDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/'+date.getDate();
    $('#ID_PDAS_analysisDateFrom').val(strDate);
    $('#ID_PDAS_analysisDateTo').val(strDate);
    $('#ID_PDAS_dateToChangeFlg').val(true).trigger('change');
    $("#ID_PDAS_machine").val('0').trigger('change');
    $('#ID_PDAS_analysisSearch').trigger('click');
    $('#ID_PDAS_pdasAnalysisModal').modal({
        backdrop: 'static',
    });
})

/* $('#ID_PDAS_pdasAnalysisModal').on('hidden.bs.modal', function() {
    $(this).removeData('bs.modal-body').children().remove();
}); */