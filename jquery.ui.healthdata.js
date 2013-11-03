 /*
 * jQuery UI HealthData version 0.1
 *
 * Copyright (c) 2012 Gareth Mula
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 * http://www.mulamedical.com
 */

(function($) {

$.widget("mula.healthdata", {
	getter: "value",
	version: "0.1",
	eventPrefix: "healthdata",
	options: {
		width: 400,
		type: 'bp',
		bindValue: 'map',
		setValues: {},
		refElem: {},
		elemsForHtml: {}
	},
	
	_setVar: function(k, v) {
		this._values[k] = v;
		
		// Trigger event that value has been updated
		this.element.trigger('refresh');
		
		// if k within fieldsforvalues set field value
		if(k in this.options.elemsForHtml) {
			$(this.options.elemsForHtml[k]).html(this._values[k]);
		}
	},
	
	getVar: function(k) {
		return this._values[k];
	},
	
	varUpdate: function(k, v) {
		this._values[k] = v;
	},
	
	_widgetListen: function() {
		for(elem in this.options.refElem) {
			
			var re = this.options.refElem[elem];
			
			$(re).bind('refresh', {self: this.options.refElem[elem], referrer: this.element, elm: elem}, function(event) {
				$(event.data.referrer).healthdata("varUpdate", event.data.elm, $(event.data.self).healthdata("getVar", event.data.elm	));
			}); 
		}
	},
	
	_calcValues: function() {
		this._setVar('sbp', Math.round(parseInt($('#sbp').val())));
		this._setVar('dbp', Math.round(parseInt($('#dbp').val())));
		if(!isNaN(this._values.sbp)&&!isNaN(this._values.dbp)) {
			this._setVar('pp', this._values.sbp - this._values.dbp);
			this._setVar('map', Math.round(this._values.dbp + (this._values.pp/3)));
			this._setVar('bpstring', this._values.sbp.toString() + "/" + this._values.dbp.toString());
		}
		this.element.val(this._values[this.options.bindValue]);
	},
	_tapHR: function() {
		var clicktime = (new Date()).getTime();
		if(this._values.clicktimes==null) {
			// First click
			this._values.clicktimes = [];
			this._values.clicktimes.push(clicktime);
		} else {
			this._values.clicktimes.push(clicktime);
			if(this._values.clicktimes.length > 10) { // Average over 10 clicks
				this._values.clicktimes.shift(); // Remove first value
			}
			
			if((this._values.clicktimes[this._values.clicktimes.length-1] - this._values.clicktimes[this._values.clicktimes.length-2]) > 2000) {
				// IF CLICK INTERVAL IS > 2 seconds, i.e. HR < 30 --> Reset
				this._values.clicktimes = [];
				this._values.clicktimes.push(clicktime);
				
				this._values.hr = null;
				this.element.val("-");
				this.element.css("background-color", "#ffcccc");

				
			} else {
				
				var totalinterval = 0;
				for(var i=1; i<this._values.clicktimes.length; i++) {
					var interval = this._values.clicktimes[i] - this._values.clicktimes[i-1];
					totalinterval += interval;
				}
				var intaverage = totalinterval / (this._values.clicktimes.length - 1);
				this._setVar('hr', Math.round(60000 / intaverage));
				
				this.hr.val(this._values.hr);
				this.element.val(this._values.hr);
				
				if(this._values.clicktimes.length > 8) {
					this.hr.css("background-color", "#ccffcc");
				} else if(this._values.clicktimes.length > 4) {
					this.hr.css("background-color", "#ffcc99");
				} else {
					this.hr.css("background-color", "#ffcccc");
				}
				
			}
		}
	},
	_updateFields: function(activeField) {
		for(u in this._fields[this.options.type]) {
			if(u==activeField) {
				// Don't update the field we're currently editing
			} else {
				for(var i=0;i < this._fields[this.options.type][u].data.length; i++) {
					$('#input_' + u + "_" + i).val(this._values[this._fields[this.options.type][u].data[i]]);
				}
			}
		}
	},
	_onUserInput: function(event) {
		switch(event.data.sc) {
			// HEIGHT
			//
			case "m":
				this._setVar('m', Number($('#input_m_0').val()));
				this._setVar('cm', this._values.m * 100);
				this._setVar('justin', Math.round(this._values.cm * 0.393700787));
				this._setVar('ft', Math.floor(this._values.justin / 12));
				this._setVar('inch', this._values.justin - (this._values.ft * 12));
				break;
			case "cm":
				this._setVar('cm', parseInt($('#input_cm_0').val()));
				this._setVar('m', this._values.cm * 0.01);
				this._setVar('justin', Math.round(this._values.cm * 0.393700787));
				this._setVar('ft', Math.floor(this._values.justin / 12));
				this._setVar('inch', this._values.justin - (this._values.ft * 12));
				break;
			case "ft":
				this._setVar('ft', parseInt($('#input_ft_0').val()));
				this._setVar('inch', parseInt($('#input_ft_1').val()));
				this._setVar('justin', this._values.inch + (this._values.ft * 12));
				this._setVar('cm', Math.round(this._values.justin * 2.54));
				this._setVar('m', this._values.cm * 0.01);
				break;
				
			// WEIGHT
			case "kg":
				this._setVar('kg', parseInt($('#input_kg_0').val()));
				this._setVar('justlb', Math.round(this._values.kg * 2.20462));
				this._setVar('st', Math.floor(this._values.justlb / 14));
				this._setVar('lb', this._values.justlb - (this._values.st * 14));
				break;
			case "st":
				this._setVar('st', parseInt($('#input_st_0').val()));
				this._setVar('lb', parseInt($('#input_st_1').val()));
				this._setVar('justlb', (this._values.st * 14) + this._values.lb);
				this._setVar('kg', Math.round(this._values.justlb * 0.453592));
				break;
			case "lb":
				this._setVar('justlb', parseInt($('#input_lb_0').val()));
				this._setVar('st', Math.floor(this._values.justlb / 14));
				this._setVar('lb', this._values.justlb - (this._values.st * 14));
				this._setVar('kg', Math.round(this._values.justlb * 0.453592));
				break;
		}
		if(this._values.kg!=null&&this._values.m!=null) {
			this._setVar('bmi', (this._values.kg / (this._values.m * this._values.m)));
			this._setVar('bsa', Math.sqrt((this._values.cm*this._values.kg)/3600));
			if(this._values.gender=="m") {
				this._setVar('lbw', (1.1 * this._values.kg) - (128 * ((this._values.kg * this._values.kg) / (this._values.cm * this._values.cm))));
				this._setVar('ibw', (50 + (2.3 * (this._values.justin - 60))));
			} else if(this._values.gender=="f") {
				this._setVar('lbw', (1.07 * this._values.kg) - (148 * ((this._values.kg * this._values.kg) / (this._values.cm * this._values.cm))));
				this._setVar('ibw', (45.5 + (2.3 * (this._values.justin - 60))));
			}
		}
		this._updateFields(event.data.sc);
	},
	_setScale: function(event) {

		this._values.scale = event.data.sc;
		
		for(u in this._fields[event.data.groupid]) {
			if(u==this._values.scale) {
				$('#fieldspan_' + u).show();
			} else {
				$('#fieldspan_' + u).hide();
			}
		}	
		
		this.element.val(this._values[this.options.bindValue]);
	},
	_createScaleButtons: function(scaleName, scaleDef) {
		
		var newElem = $('<span></span>');
		newElem.attr('id', scaleName);
		
		var sFields = $('<span class="userinput"></span>');
		var sButtons = $('<span class="scale-choose"></span>');
		
		for(u in scaleDef) {
			// Generate button for scale value
			var b = $('<input type="radio" name="gr_' + scaleName + '" id="' + u + '"/><label for="' + u +'">' + scaleDef[u].b + '</label>').bind("click", {sc: u, lbl: scaleDef[u].lbl, groupid: scaleName}, $.proxy(this, "_setScale")).appendTo(sButtons);
			
			var f = $('<span></span>');
			f.attr('class', 'fieldspan');
			f.attr('id', 'fieldspan_' + u);
			
			for(var i=0, len=scaleDef[u].lbl.length; i < len; i++){

				var fi = $('<input type="text"/>').bind("keyup", {sc: u}, $.proxy(this, "_onUserInput"));
				fi.attr('id', 'input_' + u + "_" + i);
				if(len == 1) {
					fi.attr('size', '6'); // Single Field has length = 6
				} else {
					fi.attr('size', '3'); // Double Fields have length = 3
				}
				var fl = $('<span class="scalelabel">' + scaleDef[u].lbl[i] + '</span>');
				f.append(fi);
				f.append(fl);
			}
			
			// Only show first option fields on initialise
			if(u==this._values.scale) {
				f.show();
			} else {
				f.hide();
			}
			
			sFields.append(f);
		}
		sButtons.buttonset();
		
		newElem.append(sFields);
		newElem.append(sButtons);
		
		return newElem;
		
	},
	_create: function() {
		this._widgetListen();
		this._fields = {
			weight: {kg: {b: 'Kg', lbl: ['Kg'], data: ['kg']}, st: {b: 'Stone', lbl: ['st','lb'], data: ['st','lb']}, justlb: {b: 'Pounds', lbl: ['lb'], data: ['justlb']}},
			height: {m: {b: 'm', lbl: ['m'], data: ['m']}, cm: {b: 'cm', lbl: ['cm'], data: ['cm']}, ft: {b: 'Feet + In', lbl: ['ft', 'in'], data: ['ft', 'inch']}}
		}
		this._values = {
			sbp: null,
			dbp: null,
			pp: null,
			map: null,
			bpstring: "",
			hr: null,
			clicktimes: null,
			wtscale: "kg",
			kg: null,
			st: null,
			lb: null,
			justlb: null,
			htscale: "m",
			m: null,
			cm: null,
			ft: null,
			inch: null,
			justin: null,
			bmi: null,
			scale: "kg",
			gender: null
			};
		
		for(k in this.options.setValues) {
			this._values[k] = this.options.setValues[k];
		}
		
		this._elements = {};
		
		this.container = $('<div class="ui-healthdata ui-helper-clearfix ui-widget"></div>').insertAfter(this.element);
		switch(this.options.type) {
			case 'bp':
				this.container.addClass('healthdata-bp');
				this.sbp = $('<span class="systolic"></span>');
				this.sbp.append('<input type="text" class="bp" id="sbp" size="3" maxlength="3"/>').bind("keyup", {}, $.proxy(this, "_calcValues"));
				
				this.dbp = $('<span class="diastolic"></span>');
				this.dbp.append('<input type="text" class="bp" id="dbp" size="3" maxlength="3"/>').bind("keyup", {}, $.proxy(this, "_calcValues"));
				
				this.map = $('span class="map"></span>');
				
				this.container.append(this.sbp);
				this.container.append(this.dbp);
				this.container.append(this.map);
				break;
			case 'hr':
				this.container.addClass('healthdata-hr');
				this.hr = $('<input type="text" class="hr" id="hr" size="3" maxlength="3"/>');
				this.taprate = $('<button class="pulse-button"><span class="pulse-button-text">Pulse</span></button>').button({ icons: {primary:'ui-icon-heart'}}).bind("click", {}, $.proxy(this, "_tapHR"));
				this.container.append(this.hr);
				this.container.append(this.taprate);
				break;
			case 'weight':
				this.container.addClass('healthdata-wt');
				this.wtelem = this._createScaleButtons('weight', this._fields.weight);
				this.container.append(this.wtelem);
				break;
			case 'height':
				this.container.addClass('healthdata-ht');
				this.htelem = this._createScaleButtons('height', this._fields.height);
				this.container.append(this.htelem);
				break;
		}
		
		this.element.hide();
    }, 
	_valChange: function() {
	
	},
	destroy: function() {
		this.container.remove();
		this.element.show();
	},

});

})(jQuery);
