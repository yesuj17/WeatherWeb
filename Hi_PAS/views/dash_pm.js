
/* PM Javascript */

/* OnLoad() call from index */
function pm_OnLoad() {    
    /* Calendar */
    $('#dbCalendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        titleFormat : 'YYYY MMMM',
        locale: 'ko',	  
        navLinks: false, // can click day/week names to navigate views		
        selectable: false,
        selectHelper: false,  
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        eventSources : [],
        viewRender: function (view, element) {
            if (view.name == 'month') {
                $('#dbCalendar').fullCalendar('option', 'contentHeight', 530);                         
            }
        }
    });
}
    
