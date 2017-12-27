app.controller("mapController",function($scope,$http,$interval,mapToAccordion,puntos){
	//TIMEPICKER
		//Esto pone la hora por default
		$scope.mytime = new Date();
		$scope.hstep = 1;
		$scope.mstep = 1;
		//mapToAccordion.resultados;//Variable para enviar datos al acordeon
	//Esta parte carga el mapa principal
	$scope.map = {
		center: {					// Se indican las coordenadas en donde se centrará el mapa
			latitude: -33.043065, 
			longitude: -71.616607
		}, 
		zoom: 15,					// Zoom inicial del mapa
		options : {				
			scrollwheel: false,		// Si se desea que el scrollwheel del mouse efectue cambios en el mapa
			mapTypeId: google.maps.MapTypeId.ROADMAP // tipo de mapa a usar
		},
		control: {}
	};

	var lineSymbol = {
		path: 'M 0,-1 0,1',			// Simbolo que se utiliza para dibujar la polyline de caminar
		strokeOpacity: 1,			// Nivel de opacidad de la polyline (0,1)
		strokeWeight: 3				// Ancho de la polyline
	},
	poly2 ={						// Caracteristicas de la polyline
		icons:[{
			icon: lineSymbol,
			offset: '0',
			repeat: '15px'
			}],
		strokeOpacity: 0,
		strokeColor: '#12698B'
		
	},
	mark={
		visible:false,				// Visibilidad del marcador
	},
	mark2={
		visible:false,				// Visibilidad del marcador
	},
	rendererOptions2 = {			
		preserveViewport:true,		// Si se desea o no, preservar la vista original a la ruta o realizar un zoom a ella
		polylineOptions:poly2,		// Definicion de polyline a usar
		suppressMarkers:true		// Suprimir marcadores usados originalmente por la api de google
	},
	poly3 ={
		strokeColor: '#F8ED1C',
		strokeWeight: 3,
		strokeOpacity: 1
	},
	rendererOptions3 = {
		markerOptions:mark2,		
		preserveViewport:false,		// Si se desea o no, preservar la vista original a la ruta o realizar un zoom a ella
		polylineOptions:poly3,		// Definicion de polyline a usar
		suppressMarkers:false		// Suprimir marcadores usados originalmente por la api de google
	},	
	poly ={
		strokeWeight: 3
	},
	rendererOptions = {
		markerOptions:mark,
		preserveViewport:false,
		polylineOptions: poly,
		suppressMarkers:true
	},
	geocoder = new google.maps.Geocoder(), // Objeto de que devuelve una lat y long, mediante una direccion valida
	driveDisplay = new google.maps.DirectionsRenderer(rendererOptions), // Objeto que muestra la ruta
	walkDisplay = new google.maps.DirectionsRenderer(rendererOptions2), // Objeto que muestra la ruta
	walkDisplay2 = new google.maps.DirectionsRenderer(rendererOptions2), // Objeto que muestra la ruta
	rutaDisplay = new google.maps.DirectionsRenderer(rendererOptions3), // Objeto que muestra la ruta
	directionsService = new google.maps.DirectionsService(); // Objeto que solicita la ruta

	
//El callback para leer los objetos json	
function leer_json(callback){
    $http.get('json/paraderos.json').success(function (data) {
		info = data;
		callback(info);
    });
}

function leer_lugares(callback){
    $http.get('json/lugares.json').success(function (data) {
		info = data;
		callback(info);
    });
}
//Metodo que es llamado cuando se coloca enviar en el formulario principal del sitio			
	$scope.submitForm = function (formData) {
		$scope.lugares = []; //Borra todos los marcadores de lugares
		origen = $scope.formData.origen;
		destino = $scope.formData.destino;
		buscar(origen,destino);
		llamarancla();
	};
	
	var promise = $interval(function(){
		if(puntos.resultados==0){
			lugares_interes();
		}else{
			borrar_lugares();
		}
	},800);
	
	$scope.borrar_rutas=function(){
		borrar_marcadores();
		driveDisplay.setMap(null);
		walkDisplay.setMap(null);
		walkDisplay2.setMap(null);
	}
	
//Funcion que deberia empezar todo el proceso	
function buscar(origen,destino){
	origen=rev_string(origen);
	destino=rev_string(destino);
	leer_json( function (micros){
		geocoderLatLng(origen,destino,micros);
	});
}
function refresh(){
	$scope.map.control.refresh({latitude: -33.043065, 
		longitude: -71.616607});
}

	$scope.submitRutas = function (numero) {
		rutas_imperdibles(numero);
	};
	
function leer_rutas(callback){
    $http.get('json/rutas.json').success(function (data) {
		info = data;
		callback(info);
    });
}

function rutas_imperdibles(numero){
	leer_rutas( function (rutass){
		var listadoRutas = [rutass.ruta_1,rutass.ruta_2,rutass.ruta_3];
		marcar_ruta(listadoRutas[numero-1]);
	});
}

function marcar_ruta(ruta){
	var hito=[],
		hito2=[],
		n=ruta.ubicacion.length;
	for(var i=1;i<n-1;i++){
		actual=new google.maps.LatLng(ruta.ubicacion[i].lat,ruta.ubicacion[i].lng);
		hito2={
			location:actual,
			stopover:false
		};
		hito.push(hito2);
	}
	var request = {
		origin: new google.maps.LatLng(ruta.ubicacion[0].lat,ruta.ubicacion[0].lng),
		destination: new google.maps.LatLng(ruta.ubicacion[n-1].lat,ruta.ubicacion[n-1].lng),
		waypoints: hito,
		travelMode: google.maps.TravelMode.WALKING
	};
	marcadoresrutas(ruta.ubicacion[0],ruta.ubicacion[n-1]);
	directionsService.route(request, function(response, status) { // Solicitud de ruta
		if (status == google.maps.DirectionsStatus.OK) {
			rutaDisplay.setDirections(response);				  // Se setea el display guardando la ruta
		}
	});
	rutaDisplay.setMap($scope.map.control.getGMap());
	refresh();
}
function borrar_marcadores(){
	$scope.marker1 =[{}];
	$scope.marker2 =[{}];
	$scope.marker3 =[{}];
	$scope.marker4 =[{}];
}

function marcadores(origen,origen2,destino,destino2){
	borrar_marcadores();	
	$scope.marker1 =[{
		id: "one",
		icon: "img/letter_a.png",
		coords: {
			latitude: origen.lat(),
			longitude: origen.lng()
		}
	}];
	$scope.marker2 =[{
		id: "two",
		icon: "img/letter_b.png",
		coords: {
			latitude: origen2.lat(),
			longitude: origen2.lng()
		}
	}];
	$scope.marker3 =[{
		id: "three",
		icon: "img/letter_c.png",
		coords: {
			latitude: destino.lat(),
			longitude: destino.lng()
		}
	}];
	$scope.marker4 =[{
		id: "four",
		icon: "img/letter_d.png",
		coords: {
			latitude: destino2.lat(),
			longitude: destino2.lng()
		}
	}];
}

function borrar_marcadoresrutas(){
	$scope.ruta1 =[{id: "five"}];
	$scope.ruta2 =[{id: "six"}];
}

function marcadoresrutas(origen,destino){
	borrar_marcadoresrutas();
	$scope.ruta1 =[{
		id: "five",
		icon: "img/letter_a2.png",
		coords: {
			latitude: origen.lat,
			longitude: origen.lng
		}
	}];
	$scope.ruta2 =[{
		id: "six",
		icon: "img/letter_b2.png",
		coords: {
			latitude: destino.lat,
			longitude: destino.lng
		}
	}];

}
function lugares_interes(){
	leer_lugares( function (lugares){
		borrar_lugares();
		marcar_lugares(lugares);
	});

}

function marcar_lugares(lugares){
	var listadoLugares=[lugares.bancos,lugares.supermercados,lugares.hoteles,lugares.hostales,lugares.restaurants];
	marcar_bancos(listadoLugares[0]);
	marcar_super(listadoLugares[1]);
	marcar_hotel(listadoLugares[2]);
	marcar_hostal(listadoLugares[3]);
	marcar_restaurant(listadoLugares[4]);
}

function borrar_lugares(){
	$scope.banco1=[{}];
	$scope.banco2=[{}];
	$scope.banco3=[{}];
	$scope.banco4=[{}];
	$scope.banco5=[{}];
	$scope.banco6=[{}];
	$scope.banco7=[{}];
	$scope.hotel1=[{}];
	$scope.hotel2=[{}];
	$scope.hotel3=[{}];
	$scope.hotel4=[{}];
	$scope.super1=[{}];
	$scope.super2=[{}];
	$scope.super3=[{}];
	$scope.super4=[{}];
	$scope.hostal1=[{}];
	$scope.hostal2=[{}];
	$scope.hostal3=[{}];
	$scope.hostal4=[{}];
	$scope.hostal5=[{}];
	$scope.hostal6=[{}];
	$scope.restaurant1=[{}];
	$scope.restaurant2=[{}];
	$scope.restaurant3=[{}];
	$scope.restaurant4=[{}];
	$scope.restaurant5=[{}];
	$scope.restaurant6=[{}];
	$scope.restaurant7=[{}];
	$scope.restaurant8=[{}];
}

function marcar_bancos(bancos){
	$scope.banco1 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[0].lat, 
			longitude: bancos.ubicacion[0].lng
		}
	}];
	$scope.banco2 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[1].lat, 
			longitude: bancos.ubicacion[1].lng
		}
	}];
	$scope.banco3 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[2].lat, 
			longitude: bancos.ubicacion[2].lng
		}
	}];
	$scope.banco4 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[3].lat, 
			longitude: bancos.ubicacion[3].lng
		}
	}];
	$scope.banco5 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[4].lat, 
			longitude: bancos.ubicacion[4].lng
		}
	}];
	$scope.banco6 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[5].lat, 
			longitude: bancos.ubicacion[5].lng
		}
	}];
	$scope.banco7 =[{
		id: "five",
		icon: "img/bank.png",
		coords: {
			latitude: bancos.ubicacion[6].lat, 
			longitude: bancos.ubicacion[6].lat
		}
	}];
}

function marcar_super(supers){
	$scope.super1 =[{
		id: "five",
		icon: "img/super.png",
		coords: {
			latitude: supers.ubicacion[0].lat, 
			longitude: supers.ubicacion[0].lng
		}
	}];
	$scope.super2 =[{
		id: "five",
		icon: "img/super.png",
		coords: {
			latitude: supers.ubicacion[1].lat, 
			longitude: supers.ubicacion[1].lng
		}
	}];
	$scope.super3 =[{
		id: "five",
		icon: "img/super.png",
		coords: {
			latitude: supers.ubicacion[2].lat, 
			longitude: supers.ubicacion[2].lat
		}
	}];
	$scope.super4 =[{
		id: "five",
		icon: "img/super.png",
		coords: {
			latitude: supers.ubicacion[3].lat, 
			longitude: supers.ubicacion[3].lng
		}
	}];
}

function marcar_hotel(hotels){
	$scope.hotel1 =[{
		id: "five",
		icon: "img/hotel.png",
		coords: {
			latitude: hotels.ubicacion[0].lat, 
			longitude: hotels.ubicacion[0].lng
		}
	}];
	$scope.hotel2 =[{
		id: "five",
		icon: "img/hotel.png",
		coords: {
			latitude: hotels.ubicacion[1].lat, 
			longitude: hotels.ubicacion[1].lng
		}
	}];
	$scope.hotel3 =[{
		id: "five",
		icon: "img/hotel.png",
		coords: {
			latitude: hotels.ubicacion[2].lat, 
			longitude: hotels.ubicacion[2].lng
		}
	}];
	$scope.hotel4 =[{
		id: "five",
		icon: "img/hotel.png",
		coords: {
			latitude: hotels.ubicacion[3].lat, 
			longitude: hotels.ubicacion[3].lng
		}
	}];
}

function marcar_hostal(hostales){
	$scope.hostal1 =[{
		id: "five",
		icon: "img/hostal.png",
		coords: {
			latitude: hostales.ubicacion[0].lat, 
			longitude: hostales.ubicacion[0].lng
		}
	}];
	$scope.hostal2 =[{
		id: "five",
		icon: "img/hostal.png",
		coords: {
			latitude: hostales.ubicacion[1].lat, 
			longitude: hostales.ubicacion[1].lng
		}
	}];
	$scope.hostal3 =[{
		id: "five",
		icon: "img/hostal.png",
		coords: {
			latitude: hostales.ubicacion[2].lat, 
			longitude: hostales.ubicacion[2].lng
		}
	}];
	$scope.hostal4 =[{
		id: "five",
		icon: "img/hostal.png",
		coords: {
			latitude: hostales.ubicacion[3].lat, 
			longitude: hostales.ubicacion[3].lng
		}
	}];
	$scope.hostal5 =[{
		id: "five",
		icon: "img/hostal.png",
		coords: {
			latitude: hostales.ubicacion[4].lat, 
			longitude: hostales.ubicacion[4].lng
		}
	}];
	$scope.hostal6 =[{
		id: "five",
		icon: "img/hostal.png",
		coords: {
			latitude: hostales.ubicacion[5].lat, 
			longitude: hostales.ubicacion[5].lng
		}
	}];
}

function marcar_restaurant(restaurants){
	$scope.restaurant1 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[0].lat, 
			longitude: restaurants.ubicacion[0].lng
		}
	}];
	$scope.restaurant2 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[1].lat, 
			longitude: restaurants.ubicacion[1].lng
		}
	}];
	$scope.restaurant3 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[2].lat, 
			longitude: restaurants.ubicacion[2].lng
		}
	}];
	$scope.restaurant4 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[3].lat, 
			longitude: restaurants.ubicacion[3].lng
		}
	}];
	$scope.restaurant5 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[4].lat, 
			longitude: restaurants.ubicacion[4].lng
		}
	}];
	$scope.restaurant6 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[5].lat, 
			longitude: restaurants.ubicacion[5].lng
		}
	}];
	$scope.restaurant7 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[6].lat, 
			longitude: restaurants.ubicacion[6].lng
		}
	}];
	$scope.restaurant8 =[{
		id: "five",
		icon: "img/restaurant.png",
		coords: {
			latitude: restaurants.ubicacion[7].lat, 
			longitude: restaurants.ubicacion[7].lng
		}
	}];
}

function geocoderLatLng(origen,destino,micros){
	geocoder.geocode( { 'address': origen}, function(results, status){  // Solicitud de geocoder
		if (status == google.maps.GeocoderStatus.OK) {					// Si la respuesta es valida o no
			var1 = results[0].geometry.location;						// Respuesta obtenida
			geocoder.geocode( { 'address': destino}, function(results, status){
				if (status == google.maps.GeocoderStatus.OK){
					var2 = results[0].geometry.location;
					calcularRuta(var1,var2,micros);
				} else {
					alert('El parametro 2 ingresado no es valido'); // Mensaje de error
				}
			});
		} else {
			alert('El parametro 1 ingresado no es valido');
		}
	});
}


function calcularRuta(origen,destino,micros){
	var para_inicial,
		para_final;
	ida = idaovuelta(origen,destino);                   // Se define la direccion del recorrido
	para_inicial=paraderoMasCercano(origen,micros,ida); // Se obtienen los paraderos mas cercanos al punto de origen
	para_final=paraderoMasCercano(destino,micros,ida);	// Se obtienen los paraderos mas cercanos al punto de destino
	comunes=buscarComun(para_inicial,para_final,micros,ida);	// Se buscan paraderos comunes
	mapToAccordion.resultados= comunes;				//Envio de paraderos comunes hacia el Accordion
	if(comunes.length==0){
		alert("No existen recorridos disponibles");
	}
	marcadores(origen,comunes[0].inicio,comunes[0].fin,destino);
	calcularRutaPie(origen,comunes[0].inicio,walkDisplay);	 // Se traza la ruta a pie del origen al primer paradero
	calcularRutaMicro(comunes[0].inicio,comunes[0].hito,comunes[0].fin);	   	 // Se traza la ruta de la micro desde el primer paradero al segundo paradero
	calcularRutaPie(comunes[0].fin,destino,walkDisplay2);// Se traza la ruta desde el segundo paradero al destino
	setPoly(parseInt(comunes[0].num_micro/100)-1);									 // Se marca el color de la micro a usar
	driveDisplay.setMap($scope.map.control.getGMap());
	walkDisplay.setMap($scope.map.control.getGMap());   // Se muestra la ruta total
	walkDisplay2.setMap($scope.map.control.getGMap());
	refresh();
}

function buscarComun(para_inicial,para_final,micros,ida){
	var comunes= [],
		i=0,
		j=0;
	while(i<para_inicial.length){
		j=0;
		while(j<para_final.length){
			if(para_inicial[i].num_micro==para_final[j].num_micro){ // Se comparan uno a uno esperando obtener una micro en comun
				hito2=calcularHitos(para_inicial[i].paradero,para_final[j].paradero,micros,ida,para_inicial[i].num_micro);
				comunes.push({inicio: para_inicial[i].paradero,fin: para_final[j].paradero,
					dist: (para_inicial[i].dist+para_final[j].dist), num_micro: para_inicial[i].num_micro,
					precio: para_inicial[i].precio, frecuencia: para_inicial[i].frecuencia,
					origen: para_inicial[i].direccion, destino: para_final[j].direccion,
					hito: hito2} );
			}   // En caso de coincidir se guarda los 2 paraderos mas la distancia
			j++;
		}
		i++;
	}
	comunes=ordenarDist(comunes);
	return comunes;
}
		
function calcularRutaMicro(origen,hito,destino){
	var request = {
		origin: origen,				// Punto inicial de la ruta
		waypoints: hito,
		destination: destino,		// Punto final de la ruta
		travelMode: google.maps.TravelMode.DRIVING // Metodo de  viaje utilizado para trazar la ruta
	};
	directionsService.route(request, function(response, status) { // Solicitud de ruta
		if (status == google.maps.DirectionsStatus.OK) {
			driveDisplay.setDirections(response);				  // Se setea el display guardando la ruta
		}
	});
}

function calcularHitos(origen,destino,micros,ida,num_micro){
	var hito=[],
		i,
		actual,
		listadoMicros;
	actual=origen;
	if(ida == 1){	
		listadoMicros = [micros.micro_101_ida,micros.micro_202_ida,micros.micro_105_ida,micros.micro_201_ida,micros.micro_203_ida,
		micros.micro_204_ida,micros.micro_205_ida,micros.micro_209_ida,micros.micro_210_ida,micros.micro_211_ida,micros.micro_212_ida,
		micros.micro_213_ida,micros.micro_214_ida,micros.micro_216_ida,micros.micro_515_ida,micros.micro_521_ida,micros.micro_802_ida,
		micros.micro_705_ida,micros.micro_701_ida];	
	}else {
		listadoMicros = [micros.micro_101_vuelta,micros.micro_202_vuelta,micros.micro_105_vuelta,micros.micro_201_vuelta,micros.micro_203_vuelta,
		micros.micro_204_vuelta,micros.micro_205_vuelta,micros.micro_209_vuelta,micros.micro_210_vuelta,micros.micro_211_vuelta,micros.micro_212_vuelta,
		micros.micro_213_vuelta,micros.micro_214_vuelta,micros.micro_216_vuelta,micros.micro_515_vuelta,micros.micro_521_vuelta,micros.micro_802_vuelta,
		micros.micro_705_vuelta,micros.micro_701_vuelta];
	}
	for(i=0;i<listadoMicros.length;i++){
		objmicro=listadoMicros[i];
		if(num_micro==objmicro.datos_micro.num_micro){
			break;
		}
	}
	for(i=0;objmicro.ubicacion.length;i++){
		actual=new google.maps.LatLng(objmicro.ubicacion[i].lat,objmicro.ubicacion[i].lng);
		if(origen.equals(actual)){
			break;
		}
	}
	while(!actual.equals(destino)){
		if(i%2==0){
			var hito2={
				location:actual,
				stopover:false
			};
			hito.push(hito2);
		}
		actual=new google.maps.LatLng(objmicro.ubicacion[i].lat,objmicro.ubicacion[i].lng);
		i++;
	}
	return hito;
}

function paraderoMasCercano(direccion,micros,ida){
	var vector = [],
		listadoMicros,
		objmicro,
		i=0,
		distancia,
		actual,
		hora;
	hora = ($scope.mytime).getHours();
	if(ida == 1){	
		listadoMicros = [micros.micro_101_ida,micros.micro_202_ida,micros.micro_105_ida,micros.micro_201_ida,micros.micro_203_ida,
		micros.micro_204_ida,micros.micro_205_ida,micros.micro_209_ida,micros.micro_210_ida,micros.micro_211_ida,micros.micro_212_ida,
		micros.micro_213_ida,micros.micro_214_ida,micros.micro_216_ida,micros.micro_515_ida,micros.micro_521_ida,micros.micro_802_ida,
		micros.micro_705_ida,micros.micro_701_ida];	
	}else {
		listadoMicros = [micros.micro_101_vuelta,micros.micro_202_vuelta,micros.micro_105_vuelta,micros.micro_201_vuelta,micros.micro_203_vuelta,
		micros.micro_204_vuelta,micros.micro_205_vuelta,micros.micro_209_vuelta,micros.micro_210_vuelta,micros.micro_211_vuelta,micros.micro_212_vuelta,
		micros.micro_213_vuelta,micros.micro_214_vuelta,micros.micro_216_vuelta,micros.micro_515_vuelta,micros.micro_521_vuelta,micros.micro_802_vuelta,
		micros.micro_705_vuelta,micros.micro_701_vuelta];
	}
	while(i<listadoMicros.length){  // Se compara la distancia del paradero encontrar los mas cercanos a la persona
		objmicro=listadoMicros[i];
		for(var j=0;j<objmicro.ubicacion.length;j++){
			actual = new google.maps.LatLng(objmicro.ubicacion[j].lat,objmicro.ubicacion[j].lng);
			distancia = google.maps.geometry.spherical.computeDistanceBetween(direccion,actual); // Se calcula la distancia entre 2 puntos
			if(distancia<600){								// Se estima conveniente buscar paraderos con una dist max de 500 metros
				vector.push({ paradero: actual,dist: distancia, num_micro: objmicro.datos_micro.num_micro,
					precio: objmicro.datos_micro.vector_precio[0].precio, frecuencia: objmicro.frecuencia[0].frecuencia[hora],
					direccion: direccion});
			}	// Se guarda el paradero, la distancia entre la persona y el numero de la micro
		}
		i++;
	}
	vector=ordenarDist(vector); // se ordenan los paraderos encontrados mediante la distancia
	return vector;
}

function calcularRutaPie(origen,destino,display){ // Funcion que traza una ruta a pie entre 2 puntos
	var request = {
		origin: origen,
		destination: destino,
		travelMode: google.maps.TravelMode.WALKING
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			display.setDirections(response);
		}
	});
}
	
function setPoly(color){	// Cambia el color de la ruta de la micro
	
	var colores=['#897253','#2FD30A','#0364C0','#0116FF','#CC6300','#FC8210',
			'#990B0B','#2C6430','#FC8210','#FF0000']// Arreglo de colores para usar en las polylines
			
	poly.strokeColor=colores[color];
}

function ordenarDist(vector){		// Se ordena un vector de menor a mayor segun su distancia

	for(var i=0;i<vector.length;i++){
		for(var j=0;j<vector.length-i-1;j++){
			if(vector[j].dist>vector[j+1].dist){
				aux=vector[j];
				vector[j]=vector[j+1];
				vector[j+1]=aux;
			}
		}
	}
	return vector;
}

function idaovuelta(origen,destino){		// Para limitar la busqueda de rutas se calcula el sentido del recorrido que se busca
	var flag;
	if(/*origen.lat()>destino.lat() ||*/destino.lng()>origen.lng()){
		flag=0; // vuelta
	}else{
		flag=1; // ida
	}
	return flag;
}


function rev_string(string){
	var string = string.toLowerCase();
	if(string.indexOf("valparaiso") == -1 && string.indexOf("valparaíso") == -1){
		string = string.concat(", valparaiso"); 
		//en caso de no tener la palabra Valparaiso, esta se agrega para evitar el caso de que la direccion exista en un lugar fuera de la zona establecida
	}
	if(string.indexOf("chile") == -1){
		string = string.concat(",chile");
	}
	return string;
}

	//_------------------------------Eventos de los carousel 'lugares'
	$scope.marcador = function(nombre_thumbnail) {
		if(angular.equals(nombre_thumbnail,0)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.0423,
							longitude: -71.6066,
						}
					}];
		llamarancla();
		}
		if(angular.equals(nombre_thumbnail,1)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.0446,
							longitude: -71.6204,
						}
					}];
		llamarancla();
		}
		if(angular.equals(nombre_thumbnail,2)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.046344,
							longitude:  -71.627602,
						}
					}];
		llamarancla();
		}
		if(angular.equals(nombre_thumbnail,3)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.046199,
							longitude:  -71.604552,
						}
					}];
		llamarancla();
		}
		if(angular.equals(nombre_thumbnail,4)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.032247,
							longitude:  -71.630491,
						}
					}];
		llamarancla();
		}
		
	}

	$scope.marcador2 = function(nombre_thumbnail) {
		if(angular.equals(nombre_thumbnail,0)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.0476,
							longitude: -71.6056,
						}
					}];
		llamarancla();
		}
		if(angular.equals(nombre_thumbnail,1)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.0385,
							longitude: -71.6287,
						}
					}];
		llamarancla();			
		}
		if(angular.equals(nombre_thumbnail,2)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.053860,
							longitude: -71.622370,
						}
					}];
		llamarancla();			
		}
		if(angular.equals(nombre_thumbnail,3)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.042422,
							longitude: -71.625331,
						}
					}];
		llamarancla();			
		}
		if(angular.equals(nombre_thumbnail,4)==true){
					$scope.polylines = []; //Borra todos los polylines
					$scope.map = {center: {latitude: -33.0423, longitude: -71.6066}, zoom: 15 };
					$scope.map.options = {scrollwheel: false};
					$scope.lugares = [{
						id: "first",
						stuff: "stuff",
						last_known_location: {
							latitude: -33.040091,
							longitude: -71.628981,
						}
					}];
		llamarancla();			
		}
	}
	//_------------------------------Eventos de los Accordion
	$scope.marcador_resultados = function (vector){
		//Vector -> Es el objeto que fue elegido por el usuario de la ruta predeterminada
		var vector_resultado = vector;
		//Objetos para pintar el mapa
		calcularRutaPie(vector_resultado.origen,vector_resultado.inicio,walkDisplay);	 // Se traza la ruta a pie del origen al primer paradero
		calcularRutaMicro(vector_resultado.inicio,vector_resultado.hito,vector_resultado.fin);	   	 // Se traza la ruta de la micro desde el primer paradero al segundo paradero
		calcularRutaPie(vector_resultado.fin,vector_resultado.destino,walkDisplay2);// Se traza la ruta desde el segundo paradero al destino
		setPoly(parseInt(vector_resultado.num_micro/100)-1);									 // Se marca el color de la micro a usar
		driveDisplay.setMap($scope.map.control.getGMap());
		walkDisplay.setMap($scope.map.control.getGMap());   // Se muestra la ruta total
		walkDisplay2.setMap($scope.map.control.getGMap());
		marcadores(vector_resultado.origen,vector_resultado.inicio,vector_resultado.fin,vector_resultado.destino);
		refresh();

	}
//	console.log("holaa");
//	google.maps.event.trigger($scope.map, 'resize');
});

function llamarancla(){
document.location.href = "#ancla_mapa";
}

//Factory especializado en pasar las variables de las búsquedas del mapa, a el acordeon
app.factory('mapToAccordion', function() {
  var _resultados = {};
  return {
    resultados: _resultados
  };
});