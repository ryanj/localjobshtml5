// app.js
(function($){

		var LocalJobs = {};
		window.LocalJobs = LocalJobs;
		
		var template = function(name) {
			return Mustache.compile($('#'+name+'-template').html());
		};
		
		LocalJobs.HomeView = Backbone.View.extend({
			tagName : "form",
			el : $("#main"),
			
			events : {
				"submit" : "findJobs"
			},
			
			render : function(){
				console.log("rendering home page..");
				$("#results").empty();
				return this;
			},
			
			findJobs : function(event){
				console.log('in findJobs()...');
				event.preventDefault();
				$("#results").empty();
				$("#jobSearchForm").mask("Finding Jobs ...");
				var skills = this.$('input[name=skills]').val().split(',');
				
				console.log("skills : "+skills);
				
				var self = this;
				
				  var mapOptions = {
				    zoom: 8,
				    center: new google.maps.LatLng(-34.397, 150.644),
				    mapTypeId: google.maps.MapTypeId.ROADMAP
				  };
				  var map = new google.maps.Map(document.getElementById('map-canvas'),
				      mapOptions);
				
				
				navigator.geolocation.getCurrentPosition(function(position){
					var longitude = position.coords.longitude;
			    	var latitude = position.coords.latitude;
			    	console.log('longitude .. '+longitude);
			    	console.log('latitude .. '+latitude);
			    	
			    	alert('longitude : '+longitude + ' , latitude : '+latitude);
			    	
			    	$("#jobSearchForm").unmask();
			    	self.plotUserLocation(new google.maps.LatLng(latitude, longitude),map);
			    	  
			    	$.get("api/jobs/"+skills+"/?longitude="+longitude+"&latitude="+latitude  , function (results){ 
		                    $("#jobSearchForm").unmask();
		                    self.renderResults(results,self,map);
		             });
				}, function(e){
					$("#jobSearchForm").unmask();
					switch (e.code) {
						case e.PERMISSION_DENIED:
							alert('You have denied access to your position. You will ' +
									'not get the most out of the application now.'); 
							break;
						case e.POSITION_UNAVAILABLE:
							alert('There was a problem getting your position.'); 
							break;
						case e.TIMEOUT:
									alert('The application has timed out attempting to get ' +
											'your location.'); 
							break;
						default:
							alert('There was a horrible Geolocation error that has ' +
									'not been defined.');
					}
				},
					{ timeout: 45000 ,maximumAge: 75000 }
				
				);
				
			},
			
			plotUserLocation : function(latLng , map){
				map.setCenter(latLng); 
				var marker = new google.maps.Marker({
					position: latLng,
					icon: 'http://icons.iconarchive.com/icons/icons-land/vista-people/48/Office-Customer-Male-Light-icon.png', 
					animation: google.maps.Animation.DROP
				}); 
				marker.setMap(map);
				map.setCenter(latLng);
				map.setZoom(6);
			},

			renderResults : function(results,self,map){
				_.each(results,function(result){
					self.renderJob(result,map);
				});
				
			},
			
			renderJob : function(result , map){
				result.marker = new google.maps.Marker({
					position: new google.maps.LatLng(result.latitude, result.longitude),
					icon: 'http://icons.iconarchive.com/icons/mad-science/olive/32/Martinis-Briefcase-icon.png', 
					animation: google.maps.Animation.DROP,
					title: result.jobTitle,
//					html: createInfoContent(result)
				});
			
				result.marker.setMap(map);
			},
			
			

		});
		
		LocalJobs.JobView = Backbone.View.extend({
				template : template("job"),
				initialize  : function(options){
					this.result = options.result;
				},
		
				render : function(){
					this.$el.html(this.template(this));
					return this;
				},
				jobtitle : function(){
					return this.result['jobTitle'];
				},
				address : function(){
					return this.result['formattedAddress'];
				},
				skills : function(){
					return this.result['skills'];
				},
				company : function(){
					return this.result['companyName'];
				},
				distance : function(){
					return this.result['distance'] + " KM";
				}
				
				
				
		
		});
		
		
		LocalJobs.Router = Backbone.Router.extend({
			el : $("#main"),
			
			routes : {
				"" : "showHomePage"
			},
			showHomePage : function(){
				console.log('in home page...');
				var homeView = new LocalJobs.HomeView();
				this.el.append(homeView.render().el);
			}
		
		});
		
		var app = new LocalJobs.Router();
		Backbone.history.start();
		
		
})(jQuery);