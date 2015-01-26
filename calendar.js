"use strict";

var app = angular.module('app.directives', []);

var language = {

    ms0: 'Janeiro',
    ms1: 'Fevereiro',
    ms2: 'Março',
    ms3: 'Abril',
    ms4: 'Maio',
    ms5: 'Junho',
    ms6: 'Julho',
    ms7: 'Agosto',
    ms8: 'Setembro',
    ms9: 'Outubro',
    ms10: 'Novembro',
    ms11: 'Dezembro',

    d0: 'dom',
    d1: 'seg',
    d2: 'ter',
    d3: 'qua',
    d4: 'qui',
    d5: 'sex',
    d6: 'sab',

    thisMonth: "This month",
    prevMonth: "Prev",
    nextMonth: "Next",

};

Date.prototype.getMonthFormatted = function() {
    return language['ms'+this.getMonth()];
    /*var month = this.getMonth() + 1;
    return month < 10 ? '0' + month : month;*/
}

Date.prototype.ddmmyyyy = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return (dd[1]?dd:"0"+dd[0]) + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + yyyy; // padding
};

app.directive('ngHtml', function() {
    return function(scope, element, attrs) {
        scope.$watch(attrs.ngHtml, function(value) {
            element[0].innerHTML = value;
        });
    }
});

var calendarLinkFunction = function (scope, element) {                
    var contentObj = scope.content;        
    var targetMonth = parseInt(scope.assignedMonth, 10),
        targetYear = parseInt(scope.assignedyear, 10);

    if(
        !isNaN(targetMonth) &&
        !isNaN(targetYear) &&
        targetMonth > 0 &&
        targetMonth < 12
     ){            
        scope.currentDate = new Date(targetYear, targetMonth, 0);
    }
    else{
        scope.currentDate = new Date();   
    }

    scope.today;
    scope.language = language;
    scope.navigate = {};

    scope.days = [];

    // month between 1 and 12
    var daysInMonth = function(month,year){            
        return new Date(year, month, 0).getDate();
    }

    scope.navigate.prevMotnth = function(){                  
        scope.currentDate.setMonth(scope.currentDate.getMonth()-1);
        refreshCalendar();
    }                        
    scope.navigate.nextMotnth = function(){                        
        scope.currentDate.setMonth(scope.currentDate.getMonth()+1);
        refreshCalendar();
    }
    scope.navigate.thisMotnth = function(){                        
        scope.currentDate = new Date();            
        refreshCalendar();
    }

    // month between 1 ~ 12
    var getDateContent = function(year,month,date){            
        /*if(contentObj != null && contentObj[year] != null && 
            contentObj[year][month] != null && 
            contentObj[year][month][date] != null){
            return contentObj[year][month][date];    
        }         
        return null;*/
        if ( contentObj != null ) {
            return contentObj[(new Date(year,month-1,date)).ddmmyyyy()];
        }

        return null;
    }

    // month between 1 ~ 12
    var monthGenegrator = function(month, year){  //month = 6;         
        var monthArray = [];
        var firstDay = new Date(year, month-1, 1, 0, 0, 0, 0);
        //  weekDay between 1 ~ 7 , 1 is Monday, 7 is Sunday
        //var firstDayInFirstweek = (firstDay.getDay() > 0) ? firstDay.getDay() : 7;
        var firstDayInFirstweek = firstDay.getDay();

        var daysOfMonth = daysInMonth(month,year);
        var prevDaysOfMonth = daysInMonth(month-1,year);
        
        var recordDate = 0; //record which day obj already genegrate
        
        //first week row
        monthArray.push(weekGenegrator(year , month , recordDate-firstDayInFirstweek ,daysOfMonth , prevDaysOfMonth));

        recordDate = 7 - firstDayInFirstweek;
        //loop for following week row           
        while(recordDate < daysOfMonth-1){
            monthArray.push(weekGenegrator(year , month , recordDate , daysOfMonth));
            recordDate += 7;                
        }

        var today = new Date();

        //set isToday
        if(scope.currentDate.getMonth() == today.getMonth() &&
            scope.currentDate.getFullYear() == today.getFullYear() ){                                            
            var atWeek = Math.ceil((today.getDate()+firstDayInFirstweek-1) / 7) -1;
            var atDay = (today.getDate()+firstDayInFirstweek-1) % 7;                
            monthArray[atWeek][atDay].isToday = true;
            scope.today = monthArray[atWeek][atDay];
            //console.info()
        } //else scope.today = null;

        return monthArray;
    }

    //month between 1~12
    var weekGenegrator = function(year , month , startDate , daysOfMonth , prevDaysOfMonth){            
        var week = [];
        for(var i =  0 ; i <= 6 ; i++){
            
            /*var 
                year = year,
                month = month,
                realDate,
                outmonth = false,
                content = "";*/

            var day = {
                "year" : year,
                "month" : month,
                "day": i,
                "outmonth" : false
            };

            if(startDate + i < 0){
                day.date = prevDaysOfMonth+startDate+i+1;
                day.outmonth = true;
                day.month--;
                if ( day.month < 1 ) {
                    day.month = 12;
                    day.year--;
                }
            }
            else if(startDate + i + 1 > daysOfMonth){
                day.date = startDate+i-daysOfMonth+1;
                day.outmonth = true;
                day.month++;
                if ( day.month > 12 ) {
                    day.month = 1;
                    day.year++;
                }
            }
            else{
                day.date =  startDate+i+1;   
                day.content = getDateContent(year , month , day.date);
            }

            week.push(day);

            scope.days.push(day);
        }
        return week;
    }

    var refreshCalendar = function(){

        scope.days = [];

        scope.month = monthGenegrator(scope.currentDate.getMonth()+1, scope.currentDate.getFullYear()); 

        if ( scope.activeDay ) scope.setActiveDay( scope.activeDay );
        else if ( scope.today ) scope.setActiveDay( scope.today );

        var firstDay = scope.days[0];
        var lastDay = scope.days[ scope.days.length-1 ];

        var startDate = new Date( firstDay.year , firstDay.month -1 , firstDay.date );
        var endDate = new Date( lastDay.year , lastDay.month -1 , lastDay.date );

        scope.selectActiveMonth({startDate: startDate, endDate: endDate });

    }

    scope.activeDay;

    /*scope.selectActiveDay = function(activeDay) {
        scope.activeDay = activeDay;
    }*/

    scope.setActiveDay = function(activeDay) { console.log(activeDay);
        
        scope.activeDay = activeDay;
        scope.selectActiveDay({day: activeDay});

        //refreshCalendar();

    };

    refreshCalendar();

    scope.$on("updateCalendarContent", function (event, args) {

        for ( var d = 0; d < scope.days.length ; d++ ) {
            var day = scope.days[d];
            var ddmmyyyy = ("0"+day.date).substr(-2) + '/' + ("0"+day.month).substr(-2) + '/' + day.year;
            day.content = args.calendarContent[ ddmmyyyy ];
            //console.log( ddmmyyyy );
        }
        
        // console.log( args.calendarContent );
        
        //var firstDay = new Date(year, month-1, 1, 0, 0, 0, 0);
        /*var firstDayInFirstweek = scope.currentDate.getDay();
        var daysOfMonth = daysInMonth(scope.currentDate.getMonth(),scope.currentDate.getFullYear())

        for ( var d = 0; d <= daysOfMonth ; d++ ) {
            
            var ddmmyyyy = ( (new Date(scope.currentDate.getFullYear(),scope.currentDate.getMonth(),d) ).ddmmyyyy() );
            // console.log( ddmmyyyy );
            var atWeek = Math.ceil( ( d + firstDayInFirstweek - 1 ) / 7) - 1;
            var atDay = ( d + firstDayInFirstweek - 2 ) % 7;

            //console.log( [ atWeek , atDay , scope.month[atWeek] ] );

            scope.month[atWeek][atDay].content = args.calendarContent[ddmmyyyy];
            
        }*/

        //scope.activeDay.content = [{},{}];

        scope.selectActiveDay({day: scope.activeDay});

       //refreshCalendar();
    });

}

var scripts = document.getElementsByTagName("script")
var currentScriptPath = scripts[scripts.length-1].src;

app.directive("calendar", function(){
    return{
        restrict: "E",
        scope: { 
            content: '=calendarContent',
            assignedMonth: '=calendarMonth',
            assignedyear: '=calendarYear',
            selectActiveDay : '&onSelectActiveDay',
            selectActiveMonth : '&onSelectActiveMonth'
        },
        replace: true,
        link: calendarLinkFunction,
        // templateUrl: '../lib/angular-calendar/calendar-template.html'
        templateUrl: currentScriptPath.substring(0, currentScriptPath.lastIndexOf('/') + 1) 
        + 'calendar-template.html'
    }
});