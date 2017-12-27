var a = angular.module("A",['ui.bootstrap']);
var b = angular.module("B",['google-maps']);
var app = angular.module("index", ["A","B"]);

app.controller('Carousel', function ($scope,$http) {
	function leer_json(callback){
		$http.get('json/busquedas.json').success(function (data) {
			//Convert data to array.
			//leer_json2(data);
			info = data;
			callback(info);
		});
	}
	leer_json( function (busquedas){
		//console.log(busquedas);
	});
	
//Usar imagenes de 600*300 para que calcen todas

 $scope.myInterval = 5000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 600 + slides.length + 1;
    slides.push({
		image: 'img/lugares_recomendados/muelle_baron.jpg',
		text: 'Muelle Barón'
		},
		{
		image:'img/lugares_recomendados/monumento_britanico.png',
		text:'Monumento Británico para Valparaíso'
		},
		{
		image:'img/lugares_recomendados/ex_carcel.jpg',
		text:'Parque Cultural Ex Carcel'
		},
		{
		image:'img/lugares_recomendados/trole.png',
		text:'Estacion Trole Bus'
		},
		{
		image:'img/lugares_recomendados/paseo_21demayo.png',
		text:'Paseo 21 de Mayo'
		});
  };
    $scope.addSlide();
});

app.controller('Carousel2', function ($scope) {
 $scope.myInterval = 5000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 600 + slides.length + 1;
    slides.push({
		image: 'img/lugares_mas_visitados/congreso.jpg',
		text: 'Congreso de Valparaíso'
		},
		{
		image:'img/lugares_mas_visitados/plaza_sotomayor.jpg',
		text:'Plaza Sotomayor'
		},
		{
		image:'img/lugares_mas_visitados/la_sebastiana.png',
		text:'Casa La Sebastiana'
		},
		{
		image:'img/lugares_mas_visitados/paseo_atkinson.jpg',
		text:'Paseo Atkinson'
		},
		{
		image:'img/lugares_mas_visitados/paseo_jugoslavo.png',
		text:'Paseo Jugoslavo'
		});
  };
    $scope.addSlide();
});
app.controller('ModalDemoCtrl', function ($scope, $uibModal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('index').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {


  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };
//
  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('PopoverDemoCtrl', function ($scope) {
	$scope.dynamicPopover = {
		content: 'Bienvenido a TransValpo, échale un vistazo con nuestro video!!',
		templateUrl: 'myPopoverTemplate.html',
		title: 'Videotutorial'
	};
});
app.controller('AccordionDemoCtrl',function ($scope,mapToAccordion) {
	$scope.groups = [
		{
			"title":"Menor distancia a pie",
			"items": []
		},
		{
			"title":"Economía",
			"items": []
		},
		{
			"title":"Locomoción más frecuente",
			"items": []
		}
	];

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

function ordenarPrecio(vector){		// Se ordena un vector de menor a mayor segun su distancia

	for(var i=0;i<vector.length;i++){
		for(var j=0;j<vector.length-i-1;j++){
			if(vector[j].precio>vector[j+1].precio){
				aux=vector[j];
				vector[j]=vector[j+1];
				vector[j+1]=aux;
			}
		}
	}
	return vector;
}

function ordenarFrec(vector){		// Se ordena un vector de menor a mayor segun su distancia

	for(var i=0;i<vector.length;i++){
		for(var j=0;j<vector.length-i-1;j++){
			if(vector[j].frecuencia>vector[j+1].frecuencia){
				aux=vector[j];
				vector[j]=vector[j+1];
				vector[j+1]=aux;
			}
		}
	}
	return vector;
}

function limpiar_recorridos(recorrido){
	var nuevo_rec=[],
		micro=[],
		flag;//flag=1 no se ha visitado esa micro
	micro.push(recorrido[0].num_micro);
	nuevo_rec.push(recorrido[0]);
	for(var i=1;i<recorrido.length;i++){
		flag=1;
		for(var j=0;j<micro.length;j++){
			if(recorrido[i].num_micro==micro[j]){
				flag=0;
				break;
			}
		}
		if(flag==1){
			micro.push(recorrido[i].num_micro);
			nuevo_rec.push(recorrido[i]);
		}
	}
	return nuevo_rec;
}

	var vector_ordenado;
	var i = 0;
	$scope.opened = function (group, i) {
		var resultados = mapToAccordion.resultados;//Variable para recibir datos del mapa
		//Para Rutas disponibles
		$scope.groups[0].items=[]; // se inicializan los array del acordeon
		$scope.groups[1].items=[];
		$scope.groups[2].items=[];
		//Para Rutas más rápidas
		if(i != 1 && i != 2){
			vector_ordenado = ordenarDist(resultados);
			vector_ordenado=limpiar_recorridos(vector_ordenado);
			var j =0;
			while(j < (vector_ordenado.length - 1)){
				if(vector_ordenado[j].frecuencia==0){
					frec=0;
				}else{
					frec=60/vector_ordenado[j].frecuencia;
				}
				$scope.groups[0].items.push( {"item-micro": vector_ordenado[j].num_micro, "item-precio": vector_ordenado[j].precio, "item-distancia": vector_ordenado[j].dist.toFixed(2) , "item-frecuencia": frec,"item-objeto": vector_ordenado[j]});
				j = j + 1;
			}
		}
		//Para Rutas más barata
		if(i = 1){
			vector_ordenado = ordenarPrecio(resultados);
			vector_ordenado=limpiar_recorridos(vector_ordenado);
			j =0;
			while(j < (vector_ordenado.length - 1)){
				if(vector_ordenado[j].frecuencia==0){
					frec=0;
				}else{
					frec=60/vector_ordenado[j].frecuencia;
				}
				$scope.groups[1].items.push( {"item-micro": vector_ordenado[j].num_micro, "item-precio": vector_ordenado[j].precio, "item-distancia": vector_ordenado[j].dist.toFixed(2) , "item-frecuencia": frec,"item-objeto":vector_ordenado[j]});
				j = j + 1;
			}
		}
		//Para Rutas con tramos más largos
		if(i = 2){
			vector_ordenado = ordenarFrec(resultados);
			vector_ordenado=limpiar_recorridos(vector_ordenado);
			j = 0;
			while(j < (vector_ordenado.length - 1)){
				if(vector_ordenado[j].frecuencia==0){
					frec=0;
				}else{
					frec=60/vector_ordenado[j].frecuencia;
				}
				$scope.groups[2].items.push( {"item-micro": vector_ordenado[j].num_micro, "item-precio": vector_ordenado[j].precio, "item-distancia": vector_ordenado[j].dist.toFixed(2) , "item-frecuencia": frec,"item-objeto":vector_ordenado[j]});
				j = j + 1;
			}
		}
		
	};
  $scope.$watch('groups', function(groups){
    angular.forEach(groups, function(group, idx){
      if (group.open) {
        console.log("Opened group with idx: "+idx);
      }
    })   
  }, true);

  $scope.addItem = function() {
    var newItemNo = $scope.items.length + 1;
    $scope.items.push('Item ' + newItemNo);
  };
});

app.controller('DropdownCtrl', function ($scope, $log) {
	$scope.items = [
		'The first choice!',
		'And another choice for you.',
		'but wait! A third!'
	];

	$scope.status = {
		isopen: false
	};

	$scope.toggled = function(open) {
		$log.log('Dropdown is now: ', open);
	};

	$scope.toggleDropdown = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.status.isopen = !$scope.status.isopen;
	};
});