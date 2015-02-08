var it = {};
angular.module('livingLegends', ['ngRoute'])
	.controller('CheckoutCtrl', ['$scope', '$http', function($scope, $http) {
		var config = {
			stripeKey: 			'pk_test_67ULD85LvW1vIGHYjzF7yrcx', //Live Key: pk_live_X5vVRdtlzVgvrTzY06YriuDq
		 	parseAppId: 		'wrW1HED5dzxcRqubPhN665860ALUqsKM7ze5hDSe',
		 	parseJsKey: 		'MLwhcDhJcMZxPhxySBENVsMEuiH2u7VI59epHnO1',
		 	parseRestApiKey: 	'zyL6RuhwOrrgziL964TBPpGzbXZTJPpzd04xyJan',
		}
	
		$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
		$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
		$http.defaults.headers.common['Content-Type'] = 'application/json';
		Stripe.setPublishableKey(config.stripeKey);
		$scope.checkout = {};
		
		var costs = $scope.costs = {
			adult:10,
			youth:7,
			family:35
		}

		var tools = $scope.tools = {
			init: function(){
				 $scope.order = {
				 	tickets: {
						adult:0,
						youth:0,
						family:0
					}
				 }
			},
			total:function(){
				var total = 0;
				total += $scope.order.tickets.adult * costs.adult;
				total += $scope.order.tickets.youth * costs.youth;
				total += $scope.order.tickets.family * costs.family;
				return total;
			},
			processing:function(){
				var ttl = tools.total();
				if(ttl>0)
					return Math.round((( (100/971)*(10*ttl+3) ) - ttl) * 100) / 100;
				else
					return 0
			},
			final:function(){
				return tools.total() + tools.processing();
			},
			family: {
				uct: function(){
					$scope.order.families = [];
					for(var i=0; i<$scope.order.tickets.family; i++)
						$scope.order.families.push({size: 0, email: null})
				}
			},
			checkout:function(){
				var ccInfo = $scope.card;
				Stripe.card.createToken(ccInfo, function(status, response){
					if(response.error){
						alert(response.error.message)
					}else{
						$scope.card.status = 'processing';
						var order = angular.copy($scope.order)
							order.card = response.id;
						$http.post('https://api.parse.com/1/classes/Order', order).success(function(customer){
							$scope.card = {status: 'saved'};
							alert('Purchase Placed!')
							tools.init();
						}).error(function(error){
							alert('The card information could not be validated, please check all your information and try again.')
							$scope.card.status = null;
						})
					}
				});
			}
		}

		tools.init();
		it.Checkout = $scope; 
	}])
	
	
	.controller('TicketCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
		var config = {
			stripeKey: 			'pk_live_X5vVRdtlzVgvrTzY06YriuDq', //Live Key: pk_live_X5vVRdtlzVgvrTzY06YriuDq
		 	parseAppId: 		'wrW1HED5dzxcRqubPhN665860ALUqsKM7ze5hDSe',
		 	parseJsKey: 		'MLwhcDhJcMZxPhxySBENVsMEuiH2u7VI59epHnO1',
		 	parseRestApiKey: 	'zyL6RuhwOrrgziL964TBPpGzbXZTJPpzd04xyJan',
		}
		$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
		$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
		$http.defaults.headers.common['Content-Type'] = 'application/json';

		var rp = $location.search();
		var tools = $scope.tools = {
			init: function(){
				$http.post('https://api.parse.com/1/functions/Tickets', {orderId:rp.orderId, token:rp.token}).success(function(data){
					$scope.tickets = data.result;
				})
			},
			qr: function(ticket){
				var google = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl='
				var other = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='
				return other+encodeURIComponent('http://livinglegends.info/scan.html#/?orderId='+ticket.orderId+'&ticketId='+ticket.objectId)
			},
			qro: function(){
				var google = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl='
				var other = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='
				return other+encodeURIComponent('http://livinglegends.info/scan.html#/?orderId='+rp.orderId+'&ticketId=all')
			},
			description: function(ticket){
				if(ticket.type == 'youth')
					return 'This ticket is valid for anyone under 17.'
				else if(ticket.type == 'adult')
					return 'This ticket is valid for any one person.'
				else
					return 'This ticket is valid for a family of '+ticket.size
			}
		}
		it.rp=$location.search();
		tools.init();
		it.TicketCtrl = $scope; 
	}])
	
	
	.controller('ScannerCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
		var config = {
			stripeKey: 			'pk_test_67ULD85LvW1vIGHYjzF7yrcx', //Live Key: pk_live_X5vVRdtlzVgvrTzY06YriuDq
		 	parseAppId: 		'wrW1HED5dzxcRqubPhN665860ALUqsKM7ze5hDSe',
		 	parseJsKey: 		'MLwhcDhJcMZxPhxySBENVsMEuiH2u7VI59epHnO1',
		 	parseRestApiKey: 	'zyL6RuhwOrrgziL964TBPpGzbXZTJPpzd04xyJan',
		}
		$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
		$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
		$http.defaults.headers.common['Content-Type'] = 'application/json';

		var rp = $location.search();
		var tools = $scope.tools = {
			init: function(){
				// $http.post('https://api.parse.com/1/functions/Tickets', {orderId:rp.orderId, token:rp.token}).success(function(data){
				// 	$scope.tickets = data.result;
				// })
			},
			description: function(ticket){
				if(ticket.type == 'youth')
					return 'This ticket is valid for anyone under 17.'
				else if(ticket.type == 'adult')
					return 'This ticket is valid for any one person.'
				else
					return 'This ticket is valid for a family of '+ticket.size
			}
		}
		$scope.onSuccess = function(data) {
			alert(data);
		};
		$scope.onError = function(error) {
			// alert(error);
		};
		$scope.onVideoError = function(error) {
			// alert(error);
		};

		tools.init();
		it.ScannerCtrl = $scope; 
	}])
	.controller('ScanCtrl', ['$scope', '$http', '$location', '$q', function($scope, $http, $location, $q) {
		var config = {
			stripeKey: 			'pk_test_67ULD85LvW1vIGHYjzF7yrcx', //Live Key: pk_live_X5vVRdtlzVgvrTzY06YriuDq
		 	parseAppId: 		'wrW1HED5dzxcRqubPhN665860ALUqsKM7ze5hDSe',
		 	parseJsKey: 		'MLwhcDhJcMZxPhxySBENVsMEuiH2u7VI59epHnO1',
		 	parseRestApiKey: 	'zyL6RuhwOrrgziL964TBPpGzbXZTJPpzd04xyJan',
		}
		$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
		$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
		$http.defaults.headers.common['Content-Type'] = 'application/json';

		var rp = $location.search();
		var tools = $scope.tools = {
			init: function(){
				if(localStorage.user){
					var localUser = angular.fromJson(localStorage.user);
					$http.defaults.headers.common['X-Parse-Session-Token'] = localUser.sessionToken;
					$scope.user = localUser;
				}
				$http.post('https://api.parse.com/1/functions/Scan', {orderId:rp.orderId, ticketId:rp.ticketId}).success(function(data){
					$scope.ticket = data.result;
				})
			},
			signup:function(user){
				$http.post('https://api.parse.com/1/users', user).success(function(data){
					tools.login(user)
				})
			},
			login:function(user){
				$http.get('https://api.parse.com/1/login?username='+user.username+'&password='+user.password).success(function(data){
					localStorage.setItem('user', angular.toJson(data));
					$http.defaults.headers.common['X-Parse-Session-Token'] = data.sessionToken;
					$scope.user = data;
				}).error(function(){
					tools.signup(user);
				})
			},
			createRole:function(){
				var roles = ['Admin', 'Manager', 'Scanner']
				for(var i=0; i<roles.length; i++){
					var role = {
						name:roles[i],
						ACL:{
							'*':{
								read: true
							}
						}
					}
					$http.post('https://api.parse.com/1/roles', role).success(function(data){
						$scope.ticket = data.result;
					})
				}
			},
			addToRole:function(roleId,userId){
				var deferred = $q.defer();
				var request = {
					users: {
						"__op": "AddRelation",
						"objects": [{
							"__type": "Pointer",
							"className": "_User",
							"objectId": userId
						}]
					}
				}
				$http.put('https://api.parse.com/1/classes/_Role/'+roleId, request).success(function(data){
					deferred.resolve(data);
				}).error(function(data){
					deferred.reject(data);
				});
				return deferred.promise;
			}
		}

		tools.init();
		it.ScanCtrl = $scope; 
	}])	
	
	.directive('qrScanner', ['$timeout', function($timeout) {
		return {
			restrict: 'E',
			scope: {
				ngSuccess: '&ngSuccess',
				ngError: '&ngError',
				ngVideoError: '&ngVideoError'
			},
			link: function(scope, element, attrs) {

				window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

				var height = attrs.height || 300;
				var width = attrs.width || 250;
				var localMediaStream;

				var video = document.createElement('video');
				video.setAttribute('width', width);
				video.setAttribute('height', height);
				var canvas = document.createElement('canvas');
				canvas.setAttribute('id', 'qr-canvas');
				canvas.setAttribute('width', width);
				canvas.setAttribute('height', height);
				canvas.setAttribute('style', 'display:none;');

				angular.element(element).append(video);
				angular.element(element).append(canvas);
				var context = canvas.getContext('2d');

				var scan = function() {
					if (localMediaStream) {
						context.drawImage(video, 0, 0, 307, 250);
						try {
							qrcode.decode();
						}
						catch (e) {
							scope.ngError({
								error: e
							});
						}
					}
					$timeout(scan, 500);
				}
				var successCallback = function(stream) {
						video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
						localMediaStream = stream;
						video.play();
						$timeout(scan, 1000);
					}
					// Call the getUserMedia method with our callback functions
				if (navigator.getUserMedia) {
					navigator.getUserMedia({
						video: true
					}, successCallback, function(e) {
						scope.ngVideoError({
							error: e
						});
					});
				}
				else {
					scope.ngVideoError({
						error: 'Native web camera streaming (getUserMedia) not supported in this browser.'
					});
				}
				qrcode.callback = function(data) {
					scope.ngSuccess({
						data: data
					});
				};
			}
		}
	}])
	
	.filter('ucFirst', function() {
		return function(input) {
			return input.charAt(0).toUpperCase() + input.slice(1);
		};
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	