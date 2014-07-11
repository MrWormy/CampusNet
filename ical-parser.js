var icalParser = exports = module.exports ={
	parseIcal: function(ical,icsString){
		ical.version=this.getValue(ical,'VERSION',icsString);
		ical.prodid=this.getValue(ical,'PRODID',icsString);
		icsString=icsString.replace(/\r\n /g,'');

		var reg=/BEGIN:VEVENT(\r?\n+[^B\n].*)+/g;
		var matches=icsString.match(reg);
		if(matches){
			for(i=0;i<matches.length;i++){
				//console.log(matches[i]);
				this.parseVevent(ical,matches[i]);
			}
		}
		reg=/BEGIN:VTODO(\r?\n[^B].*)+/g;
		matches=icsString.match(reg);
		if(matches){
			for(i=0;i<matches.length;i++){
				//console.log('TODO=>'+matches[i]);
				this.parseVtodo(ical,matches[i]);
			}
		}
		reg=/BEGIN:VJOURNAL(\r?\n[^B].*)+/g;
		matches=icsString.match(reg);
		if(matches){
			for(i=0;i<matches.length;i++){
				//console.log('JOURNAL=>'+matches[i]);
				this.parseVjournal(ical,matches[i]);
			}
		}
		reg=/BEGIN:VFREEBUSY(\r?\n[^B].*)+/g;
		matches=icsString.match(reg);
		if(matches){
			for(i=0;i<matches.length;i++){
				//console.log('FREEBUSY=>'+matches[i]);
				this.parseVfreebusy(ical, matches[i]);
			}
		}
		//console.log('parsed');
	},
	parseVfreebusy: function(ical,vfreeString){
		////PROCHAINE VERSION: Générer seul les propriétés trouvées : + rapide
		var freebusy={
			contact:this.getValue(ical,'CONTACT',vfreeString), //
			dtstart:this.getValue(ical,'DTSTART',vfreeString), //This property specifies when the calendar component begins.
			dtend:this.getValue(ical,'DTEND',vfreeString), //This property specifies when the calendar component ends.
			duration:this.getValue(ical,'DURATION',vfreeString), //
			description:this.getValue(ical,'DESCRIPTION',vfreeString), //This property provides a more complete description of the calendar component, than that provided by the "SUMMARY" property.
			dtstamp:this.getValue(ical,'DTSTAMP',vfreeString), //The property indicates the date/time that the instance of the iCalendar object was created.
			organizer:this.getValue(ical,'ORGANIZER',vfreeString), //The property defines the organizer for a calendar component.
			uid:this.getValue(ical,'UID',vfreeString), //This property defines the persistent, globally unique identifier for the calendar component.
			url:this.getValue(ical,'URL',vfreeString), //This property defines a Uniform Resource Locator (URL) associated with the iCalendar object.

			attendee:this.getValue(ical,'ATTENDEE',vfreeString,true), //The property defines an "Attendee" within a calendar component.
			comment:this.getValue(ical,'COMMENT',vfreeString,true), //This property specifies non-processing information intended to provide a comment to the calendar user.
			freebusy:this.getValue(ical,'FREEBUSY',vfreeString,true), //The property defines one or more free or busy time intervals.
			rstatus:this.getValue(ical,'REQUEST-STATUS',vfreeString,true), //This property defines the status code returned for a scheduling request.
			xprop:this.getValue(ical,'X-',vfreeString,true), //
		};
		ical.freebusys[ical.freebusys.length]=freebusy;
	},
	parseVjournal: function(ical,vjournalString){
		////PROCHAINE VERSION: Générer seul les propriétés trouvées : + rapide
		var journal={
			klass:this.getValue(ical,'CLASS',vjournalString), //This property defines the access classification for a calendar component.
			created:this.getValue(ical,'CREATED',vjournalString), //This property specifies the date and time that the calendar information was created by the calendar user agent in the calendar store.
			description:this.getValue(ical,'DESCRIPTION',vjournalString), //This property provides a more complete description of the calendar component, than that provided by the "SUMMARY" property.
			dtstart:this.getValue(ical,'DTSTART',veventString), //This property specifies when the calendar component begins.
			dtstamp:this.getValue(ical,'DTSTAMP',vjournalString), //The property indicates the date/time that the instance of the iCalendar object was created.
			lastmod:this.getValue(ical,'LAST-MODIFIED',vjournalString), //The property specifies the date and time that the information associated with the calendar component was last revised in the calendar store.
			organizer:this.getValue(ical,'ORGANIZER',vjournalString), //The property defines the organizer for a calendar component.
			recurid:this.getValue(ical,'RECURRENCE-ID',vjournalString), //This property is used in conjunction with the "UID" and "SEQUENCE" property to identify a specific instance of a recurring "VEVENT", "VTODO" or "VJOURNAL" calendar component. The property value is the effective value of the "DTSTART" property of the recurrence instance.
			seq:this.getValue(ical,'SEQUENCE',vjournalString), //This property defines the revision sequence number of the calendar component within a sequence of revisions.
			status:this.getValue(ical,'STATUS',vjournalString), //This property defines the overall status or confirmation for the calendar component.
			summary:this.getValue(ical,'SUMMARY',vjournalString), //This property defines a short summary or subject for the calendar component.
			uid:this.getValue(ical,'UID',vjournalString), //This property defines the persistent, globally unique identifier for the calendar component.
			url:this.getValue(ical,'URL',vjournalString), //This property defines a Uniform Resource Locator (URL) associated with the iCalendar object.

			attach:this.getValue(ical,'ATTACH',vjournalString,true), //The property provides the capability to associate a document object with a calendar component.
			attendee:this.getValue(ical,'ATTENDEE',vjournalString,true), //The property defines an "Attendee" within a calendar component.
			categories:this.getValue(ical,'CATEGORIES',vjournalString,true), //This property defines the categories for a calendar component.
			comment:this.getValue(ical,'COMMENT',vjournalString,true), //This property specifies non-processing information intended to provide a comment to the calendar user.
			contact:this.getValue(ical,'CONTACT',vjournalString,true), //The property is used to represent contact information or alternately a reference to contact information associated with the calendar component.
			exdate:this.getValue(ical,'EXDATE',vjournalString,true), //This property defines the list of date/time exceptions for a recurring calendar component.
			exrule:this.getValue(ical,'EXRULE',vjournalString,true), //This property defines a rule or repeating pattern for an exception to a recurrence set.
			related:this.getValue(ical,'RELATED',vjournalString,true), //To specify the relationship of the alarm trigger with respect to the start or end of the calendar component.
			rdate:this.getValue(ical,'RDATE',vjournalString,true), //This property defines the list of date/times for a recurrence set.
			rrule:this.getValue(ical,'RRULE',vjournalString,true), //This property defines a rule or repeating pattern for recurring events, to-dos, or time zone definitions.
			rstatus:this.getValue(ical,'REQUEST-STATUS',vjournalString,true), //This property defines the status code returned for a scheduling request.
			xprop:this.getValue(ical,'X-',vjournalString,true), //
		};
		ical.journals[ical.journals.length]=journal;
	},
	parseVtodo: function(ical,vtodoString){
		////PROCHAINE VERSION: Générer seul les propriétés trouvées : + rapide
		var todo={
			klass:this.getValue(ical,'CLASS',vtodoString), //This property defines the access classification for a calendar component.
			completed:this.getValue(ical,'COMPLETED',vtodoString), //This property defines the date and time that a to-do was actually completed.
			created:this.getValue(ical,'CREATED',vtodoString), //This property specifies the date and time that the calendar information was created by the calendar user agent in the calendar store.
			description:this.getValue(ical,'DESCRIPTION',vtodoString), //This property provides a more complete description of the calendar component, than that provided by the "SUMMARY" property.
			dtstamp:this.getValue(ical,'DTSTAMP',vtodoString), //The property indicates the date/time that the instance of the iCalendar object was created.
			geo:this.getValue(ical,'GEO',vtodoString), //This property specifies information related to the global position for the activity specified by a calendar component.
			lastmod:this.getValue(ical,'LAST-MODIFIED',vtodoString), //The property specifies the date and time that the information associated with the calendar component was last revised in the calendar store.
			location:this.getValue(ical,'LOCATION',vtodoString), //The property defines the intended venue for the activity defined by a calendar component.
			organizer:this.getValue(ical,'ORGANIZER',vtodoString), //The property defines the organizer for a calendar component.
			percent:this.getValue(ical,'PERCENT-COMPLETE',vtodoString), //This property is used by an assignee or delegatee of a to-do to convey the percent completion of a to-do to the Organizer.
			priority:this.getValue(ical,'PRIORITY',vtodoString), //The property defines the relative priority for a calendar component.
			recurid:this.getValue(ical,'RECURRENCE-ID',vtodoString), //This property is used in conjunction with the "UID" and "SEQUENCE" property to identify a specific instance of a recurring "VEVENT", "VTODO" or "VJOURNAL" calendar component. The property value is the effective value of the "DTSTART" property of the recurrence instance.
			seq:this.getValue(ical,'SEQUENCE',vtodoString), //This property defines the revision sequence number of the calendar component within a sequence of revisions.
			status:this.getValue(ical,'STATUS',vtodoString), //This property defines the overall status or confirmation for the calendar component.
			summary:this.getValue(ical,'SUMMARY',vtodoString), //This property defines a short summary or subject for the calendar component.
			uid:this.getValue(ical,'UID',vtodoString), //This property defines the persistent, globally unique identifier for the calendar component.
			url:this.getValue(ical,'URL',vtodoString), //This property defines a Uniform Resource Locator (URL) associated with the iCalendar object.

			due:this.getValue(ical,'DUE',vtodoString), //This property defines the date and time that a to-do is expected to be completed.
			duration:this.getValue(ical,'DURATION',vtodoString), //The property specifies a positive duration of time.

			attach:this.getValue(ical,'ATTACH',vtodoString,true), //The property provides the capability to associate a document object with a calendar component.
			attendee:this.getValue(ical,'ATTENDEE',vtodoString,true), //The property defines an "Attendee" within a calendar component.
			categories:this.getValue(ical,'CATEGORIES',vtodoString,true), //This property defines the categories for a calendar component.
			comment:this.getValue(ical,'COMMENT',vtodoString,true), //This property specifies non-processing information intended to provide a comment to the calendar user.
			contact:this.getValue(ical,'CONTACT',vtodoString,true), //The property is used to represent contact information or alternately a reference to contact information associated with the calendar component.
			exdate:this.getValue(ical,'EXDATE',vtodoString,true), //This property defines the list of date/time exceptions for a recurring calendar component.
			exrule:this.getValue(ical,'EXRULE',vtodoString,true), //This property defines a rule or repeating pattern for an exception to a recurrence set.
			rstatus:this.getValue(ical,'REQUEST-STATUS',vtodoString,true), //This property defines the status code returned for a scheduling request.
			related:this.getValue(ical,'RELATED',vtodoString,true), //To specify the relationship of the alarm trigger with respect to the start or end of the calendar component.
			resources:this.getValue(ical,'RESOURCES',vtodoString,true), //This property defines the equipment or resources anticipated for an activity specified by a calendar entity..
			rdate:this.getValue(ical,'RDATE',vtodoString,true), //This property defines the list of date/times for a recurrence set.
			rrule:this.getValue(ical,'RRULE',vtodoString,true), //This property defines a rule or repeating pattern for recurring events, to-dos, or time zone definitions.
			xprop:this.getValue(ical,'X-',vtodoString,true), //
		};
		ical.todos[ical.todos.length]=todo;
	},
	parseVevent: function(ical,veventString){
		////PROCHAINE VERSION: Générer seul les propriétés trouvées : + rapide
		var event={
			klass:this.getValue(ical,'CLASS',veventString), //This property defines the access classification for a calendar component.
			created:this.getValue(ical,'CREATED',veventString), //This property specifies the date and time that the calendar information was created by the calendar user agent in the calendar store.
			description:this.getValue(ical,'DESCRIPTION',veventString), //This property provides a more complete description of the calendar component, than that provided by the "SUMMARY" property.
			geo:this.getValue(ical,'GEO',veventString), //This property specifies information related to the global position for the activity specified by a calendar component.
			lastmod:this.getValue(ical,'LAST-MODIFIED',veventString), //The property specifies the date and time that the information associated with the calendar component was last revised in the calendar store.
			location:this.getValue(ical,'LOCATION',veventString), //The property defines the intended venue for the activity defined by a calendar component.
			organizer:this.getValue(ical,'ORGANIZER',veventString), //The property defines the organizer for a calendar component.
			priority:this.getValue(ical,'PRIORITY',veventString), //The property defines the relative priority for a calendar component.
			dtstamp:this.getValue(ical,'DTSTAMP',veventString), //The property indicates the date/time that the instance of the iCalendar object was created.
			seq:this.getValue(ical,'SEQUENCE',veventString), //This property defines the revision sequence number of the calendar component within a sequence of revisions.
			status:this.getValue(ical,'STATUS',veventString), //This property defines the overall status or confirmation for the calendar component.
			transp:this.getValue(ical,'TRANSP',veventString), //This property defines whether an event is transparent or not to busy time searches.
			url:this.getValue(ical,'URL',veventString), //This property defines a Uniform Resource Locator (URL) associated with the iCalendar object.
			recurid:this.getValue(ical,'RECURRENCE-ID',veventString), //This property is used in conjunction with the "UID" and "SEQUENCE" property to identify a specific instance of a recurring "VEVENT", "VTODO" or "VJOURNAL" calendar component. The property value is the effective value of the "DTSTART" property of the recurrence instance.
			duration:this.getValue(ical,'DURATION',veventString), //The property specifies a positive duration of time.
			attach:this.getValue(ical,'ATTACH',veventString,true), //The property provides the capability to associate a document object with a calendar component.
			attendee:this.getValue(ical,'ATTENDEE',veventString,true), //The property defines an "Attendee" within a calendar component.
			categories:this.getValue(ical,'CATEGORIES',veventString,true), //This property defines the categories for a calendar component.
			comment:this.getValue(ical,'COMMENT',veventString,true), //This property specifies non-processing information intended to provide a comment to the calendar user.
			contact:this.getValue(ical,'CONTACT',veventString,true), //The property is used to represent contact information or alternately a reference to contact information associated with the calendar component.
			exdate:this.getValue(ical,'EXDATE',veventString,true), //This property defines the list of date/time exceptions for a recurring calendar component.
			exrule:this.getValue(ical,'EXRULE',veventString,true), //This property defines a rule or repeating pattern for an exception to a recurrence set.
			rstatus:this.getValue(ical,'REQUEST-STATUS',veventString,true), //This property defines the status code returned for a scheduling request.
			related:this.getValue(ical,'RELATED',veventString,true), //To specify the relationship of the alarm trigger with respect to the start or end of the calendar component.
			resources:this.getValue(ical,'RESOURCES',veventString,true), //This property defines the equipment or resources anticipated for an activity specified by a calendar entity..
			rdate:this.getValue(ical,'RDATE',veventString,true), //This property defines the list of date/times for a recurrence set.
			rrule:this.getValue(ical,'RRULE',veventString,true), //This property defines a rule or repeating pattern for recurring events, to-dos, or time zone definitions.
			xprop:this.getValue(ical,'X-',veventString,true), //
			uid:this.getValue(ical,'UID',veventString), //This property defines the persistent, globally unique identifier for the calendar component.
			summary:this.getValue(ical,'SUMMARY',veventString), //This property defines a short summary or subject for the calendar component.
			dtstart:this.getValue(ical,'DTSTART',veventString), //This property specifies when the calendar component begins.
			dtend:this.getValue(ical,'DTEND',veventString) //This property specifies the date and time that a calendar component ends.
		};
		ical.events[ical.events.length]=event;
	},
	getValue: function(ical,propName,txt,multiple){
		if(multiple){
			eval('var matches=txt.match(/\\n'+propName+'[^:]*/g)');
			var props=[];
			if(matches){
				for(l=0;l<matches.length;l++){
					matches[l]=matches[l].replace(/:.*/,'');
					//on enleve les parametres
					props[props.length]=this.getValue(ical,matches[l],txt);
				}
				//console.log(props);
				return props;
			}
		}else{
			propName=propName.replace(/^\s+/g,'').replace(/\s+$/g,'');
			//console.log('('+propName.replace(/;(.*)/,')(;.*')+')');
			var reg=new RegExp('('+(propName.indexOf(';')?propName.replace(/;(.*)/,')(;.*'):propName)+')((?:;[^=]*=[^;:\n]*)*):([^\n\r]*)','g');
			var matches=reg.exec(txt);
			if(matches){ //on a trouvé la propriété cherchée
				//console.log('params='+RegExp.$2+' / valeur='+RegExp.$3);
				var valeur=RegExp.$3;
				var tab_params={};
				if(RegExp.$2.length>0){ //il y a des paramètres associés
					var params=RegExp.$2.substr(1).split(';');
					var pair;
					for(k=0;k<params.length;k++){
						pair=params[k].split('=');
						if(!pair[1]) pair[1]=pair[0];
						tab_params[pair[0]] = pair[1];
					}
				}
				//console.log(tab_params);
				return {
					value:valeur,
					params:tab_params
				};
			}else{
				return null;
			}
		}
	},
	getEvents:function(ical){
		return ical.events;
	}
}
