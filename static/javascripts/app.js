/* The Widget */

var makeWidget = (function() {

	WidgetApp = Ember.Application.create()

	WidgetApp.WidgetController = Ember.ArrayController.extend({
		update:function() {
			var filters = this.get('filters'),
				content = this.get('content'),
				activeFilters = [],
				activeFilterNames = [],
				availableFilters = [],
				activeContent = [],
				activeContentTags = []

			filters.forEach(function(filter){
				if (filter.get('on')) {
					activeFilters.push(filter)
					activeFilterNames.push(filter.get('name'))
				}
			})

			if (!activeFilters.length) {
				this.set('filteredContent', content)
				this.set('availableFilters', filters)
				return
			}

			content.forEach(function(item){
				var tags = item.tags.slice(0),
					matches = 0
				while(tags.length) {
					var tag = tags.pop()
					if ($.inArray(tag, activeFilterNames) != -1) {
						matches++
					}
				}
				if (matches == activeFilterNames.length) {
					activeContent.push(item)
					activeContentTags = activeContentTags.concat(item.tags)
				}
			})

			filters.forEach(function(filter){
				if ($.inArray(filter.get('name'), activeContentTags) != -1) {
					availableFilters.push(filter)
				}
			})

			this.set('filteredContent', activeContent)
			this.set('availableFilters', availableFilters)
		}
	})

	WidgetApp.WidgetView = Ember.View.extend({
		templateName:"widget-tmpl",
		classNames:['search-widget'],
		turnOnFilter:function(filter) {
			filter.set('on', true)
			this.get('controller').update()
			this.cleanUpStyles()
		},
		turnOffFilter:function(filter) {
			filter.set('on', false)
			this.get('controller').update()
			this.cleanUpStyles()
		},
		turnOnFilterFromTag:function(tag) {
			var filters = this.get('controller.filters').slice(0)
			while(filters.length) {
				filter = filters.pop()
				if (filter.get('name') == tag) {
					this.turnOnFilter(filter)
					return
				}
			}
		},
		cleanUpStyles:function() {
			Ember.run.next(this, function() {
				this.$('.tags').find('.tag:last .comma').hide()
				this.$('.result:last').css({'border':'none'})
			})
		}
	})

	return function(content, filters, selector) {
		var filters = $.map(filters, function(name) {
				return Ember.Object.create({ name:name, on:false })
			}),
			widget = WidgetApp.WidgetController.create({content:content,filters:filters}),
			widget_view = WidgetApp.WidgetView.create({controller:widget})

		widget_view.appendTo(selector)
		widget.update()
		widget_view.cleanUpStyles()
		return {controller:widget,view:widget_view}
	}

})()

/* Adding it to the page */

$(function() {
	window.new_widget = makeWidget(data.results,data.availableTags,'body')
})

/* The Data */

var data = {
	availableTags:[
		"Car Repair",
		"Warranty",
		"Self Help",
		"User Manuals"
	],
	results:[
		{
			title:"How long should a battery normally last? 2 years? 5 years?",
			snippet:"Depends on the battery as they are usually engineered very well and last just beyond the warranty ...",
			tags:["Car Repair","Warranty"]
		},
		{
			title:"Battery Indicator Light Keeps Appearing On Dash",
			snippet:"The dash light will indicate when the alternator is charging less than 12.5 volts.",
			tags:["Car Repair","Self Help"]
		},
		{
			title:"Battery Goes Dead Overnight",
			snippet:"Several conditions can occur that will cause a battery to lose its charge overnight. There are several \"live\"...",
			tags:["Self Help","User Manuals"]
		},
		{
			title:"Replace Starter Motor and Solenoid",
			snippet:"The starter motor on your car's engine is designed to crank the engine over fast enough to allow the normal engine ...",
			tags:["User Manuals"]
		}
	]
}


