var Calendar = (function(){
    var makeCalendarControl = function() {

        var CalendarControlModel = Backbone.Model.extend({
            defaults: {
                "view": 'month'
            }
        });

        var CalendarModel = Backbone.Model.extend({
            defaults: {
                "day": '',
                "month": '',
                "year": '',
                "view": '',
                "events": {}
            }
        });

        var CalendarHourModel = Backbone.Model.extend({
            "hour": '',
            "isEvent": 0
        });

        var CalendarDayModel = Backbone.Model.extend({
            "day": '',
            "eventCount": 0
        });

        var CalendarEventModel = Backbone.Model.extend({
            defaults: {
                "name": '',
                "description": '',
                "day": '',
                "start": '',
                "stop": ''
            }
        });

        var CalendarEventCollection = Backbone.Collection.extend({
            model: CalendarEventModel
        });

        var CalendarHourCollection = Backbone.Collection.extend({
            model: CalendarHourModel
        });

        var CalendarDayCollection = Backbone.Collection.extend({
            model: CalendarDayModel
        });

        var CalendarControlView = Backbone.View.extend({
            tagName: "div",
            className: "container-fluid",
            events: {
                "click #setToday": "setToday",
                "click #prevDate": "prevDate",
                "click #nextDate": "nextDate",
                "click #viewDay": "viewDay",
                "click #viewWeek": "viewWeek",
                "click #viewMonth": "viewMonth"
            },
            initialize: function() {
                this.date = new Date();
                this.setNewDate();
                this.calendarEvents = new CalendarEventCollection;
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model, 'destroy', this.remove);
            },
            template: _.template($('#calendarControl-template').html()),
            render: function() {
                this.calendarView = {};
                var dataForCalendarModel = {
                    "day": this.date.getDate(),
                    "month": this.date.getMonth(),
                    "year": this.date.getFullYear(),
                    "events": this.findEvents()
                };
                this.calendarModel = new CalendarModel(dataForCalendarModel);
                switch (this.model.get('view')) {
                    case 'day':
                        this.calendarView = new CalendarViewDay({model: this.calendarModel});
                        break;
                    case 'week':
                        this.calendarView = new CalendarViewWeek({model: this.calendarModel});
                        break;
                    default:
                        this.calendarView = new CalendarViewMonth({model: this.calendarModel});
                        break;
                }
                this.$el.html(this.template(this.model.toJSON())).append(this.calendarView.render().el);;
                return this;
            },
            findEvents: function() {
                return {}
            },
            getMonthName: function(num) {
                var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                return months[num];
            },
            getMonthNameForDay: function(num) {
                var months = ['января', 'вевраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                return months[num];
            },
            getDateForWeek: function(diff) {
                this.date.setDate(this.date.getDate()-diff);
                return {
                    "day": this.date.getDate(),
                    "year": this.date.getFullYear(),
                    "monthNameForDay": this.getMonthNameForDay(this.date.getMonth())
                }
            },
            getDate: function(view) {
                switch (view) {
                    case 'day':
                        return this.date.getDate() + ' ' + this.getMonthNameForDay(this.date.getMonth()) + ' ' + this.date.getFullYear();
                        break;
                    case 'week':
                        var week = this.date.getDay();
                        if (week === 0) week = 7;
                        var startWeek = this.getDateForWeek(week-1);
                        var endWeek = this.getDateForWeek(-6);
                        this.date.setDate(this.date.getDate()-7+week);
                        return startWeek.day + ' ' + startWeek.monthNameForDay + ' ' + startWeek.year + ' - ' + endWeek.day + ' ' + endWeek.monthNameForDay + ' ' + endWeek.year;
                        break;
                    default:
                        return this.getMonthName(this.date.getMonth()) + ' ' + this.date.getFullYear();
                }
            },
            getDiffForNextDate: function() {
                switch (this.model.get('view')) {
                    case 'day':
                        return 1;
                        break;
                    case 'week':
                        var week = this.date.getDay();
                        if (week === 0) week = 7;
                        return 8-week;
                        break;
                    default:
                        var monthDays = (new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0)).getDate();
                        return monthDays - this.date.getDate() + 1;
                }
            },
            setToday: function() {
                this.date = new Date();
                this.setNewDate();
            },
            prevDate: function() {
                this.date.setDate(this.date.getDate()-this.getDiffForNextDate());
                this.setNewDate();
            },
            nextDate: function() {
                this.date.setDate(this.date.getDate()+this.getDiffForNextDate());
                this.setNewDate();
            },
            setNewDate: function() {
                var model = {
                    "date": this.getDate(this.model.get('view'))
                };
                this.model.set(model);
            },
            viewDay: function() {
                this.setView('day');
            },
            viewWeek: function() {
                this.setView('week');
            },
            viewMonth: function() {
                this.setView('month');
            },
            setView: function(view) {
                var model = {
                    "view": view,
                    "date": this.getDate(view)
                };
                this.model.set(model);
            }
        });

        var CalendarView = Backbone.View.extend({
            tagName: "div",
            className: "col-md-12",
            initialize: function() {
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model, 'destroy', this.remove);
            },
            render: function() {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var CalendarViewDay = CalendarView.extend({
            initialize: function () {
              CalendarViewDay.__super__.initialize.call(this);
              this.template = _.template($('#calendarViewDay-template').html());
              this.hourCollection = new CalendarHourCollection;

            }
        });

        var CalendarViewWeek = CalendarView.extend({
            initialize: function () {
              CalendarViewWeek.__super__.initialize.call(this);
              this.template = _.template($('#calendarViewWeek-template').html());
            }
        });

        var CalendarViewMonth = CalendarView.extend({
            initialize: function () {
                CalendarViewMonth.__super__.initialize.call(this);
                this.template = _.template($('#calendarViewMonth-template').html());
                this.dayCollection = new CalendarDayCollection;
                this.date = new Date(this.model.get('year'), this.model.get('month'));
                setTimeout(this.renderCalendar, 0);
            },
            getDayOfWeek: function() {
                var dayOfWeek = this.date.getDay();
                if (dayOfWeek == 0) dayOfWeek = 7;
                return dayOfWeek - 1;
            },
            renderCalendar: function() {
                var i;
                var dayModel = {};
                var dayOfWeek = this.getDayOfWeek();
                for (i = 0; i < dayOfWeek; i++) {

                }
                for (i = 0; i < 42; i++) {
                    dayModel = {};
                    if (i > dayOfWeek) {
                        dayModel = {
                            "day": this.date.getDate(),
                            "eventCount": 0
                        };
                        this.date.setDate(this.date.getDate()+1);
                    }
                    //this.dayCollection.add(dayModel);
                }
            }
        });

        var CalendarDayView = Backbone.view.extend({

        });

        var CalendarHourView = Backbone.view.extend({

        });

        var calendarControlModel = new CalendarControlModel;
        var calendarControlView = new CalendarControlView({model: calendarControlModel});
        $("#calendar").html(calendarControlView.render().el);
    };

    var makeCalendar = function() {

    };

    return {
        init: function() {
            makeCalendarControl();
        }
    };
})();

