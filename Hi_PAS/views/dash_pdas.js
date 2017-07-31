const MAX_DISPLAY_MOTOR_COUNT = 5;
/* PdAS Javascript */
/* OnLoad() call from index */
function pdas_OnLoad() {    
    var ulElement = document.getElementById('ID_PDAS_DASH_realTimeCurrent');
    for (var i = 0; i < MAX_DISPLAY_MOTOR_COUNT; i++) {
        var x = document.createElement('LI');
        x.setAttribute('class','pdasDashRTCurrent');
        x.innerHTML = "<a href='#'><span class='badge' style='font-size:30px; border-radius:100%;'>0.0</a></span>";
        ulElement.appendChild(x);
    }
    var socket = io();
    socket.on('updateCurrentData', function (datas) {
        var lstLIElement = ulElement.getElementsByTagName('li');
        var arrLIElement =  Array.prototype.slice.call(lstLIElement);
        
        arrLIElement.splice(0,datas.length-1);
        $('#ID_PDAS_DASH_realTimeCurrent').empty();
        datas.forEach(function(data){
            var x = document.createElement('LI');
            x.title = data.MachineID + '_' + data.Type;
            x.setAttribute('class','pdasDashRTCurrent');
            x.innerHTML = "<a class='moveToPdasAnal' href='#ID_PDAS_pdasAnalysisModal' data-target='#ID_PDAS_pdasAnalysisModal'  data-toggle='modal'>"  
                        + "<span class='badge' style='font-size:30px; border-radius:100%;'>"+ data.CurrentVal.toFixed(1) +"</a></span>";
            arrLIElement.push(x);
        });
        arrLIElement.sort(function(a, b){ return b.textContent - a.textContent;});
        for(var ipx = 0; ipx < MAX_DISPLAY_MOTOR_COUNT; ipx++) { 
            ulElement.appendChild(arrLIElement[ipx]);
        }
    });

    socket.on('updateOEESummaryData', function(data){
        $('#ID_PDAS_DASH_oee').text((data.OEE*100).toFixed(1)+'%');
    });
}

$(document).ready(function(){
    $('.pdasDashRTCurrent').tooltip();
});

$(document).on('click', '.moveToPdasAnal', function () {
     var machineID = $(this).parent().attr('title').split('_')[0];
     $("#ID_PDAS_machine").val(machineID).trigger('change');
});

$(document).on('click', '#ID_PDAS_DASH_btnAnalysis',function(){
    var date = new Date();
    var strDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/'+date.getDate();
    $('#ID_PDAS_analysisDateFrom').val(strDate);
    $('#ID_PDAS_analysisDateTo').val(strDate);
    $('#ID_PDAS_dateToChangeFlg').val(true).trigger('change');
    $('#ID_PDAS_analysisSearch').trigger('click');
    $('#ID_PDAS_pdasAnalysisModal').modal({
        backdrop: 'static',
    });
})

/* $('#ID_PDAS_pdasAnalysisModal').on('hidden.bs.modal', function() {
    $(this).removeData('bs.modal-body').children().remove();
}); */