app.controller("puntoController",function($scope,$http,puntos){
	var punto=2;
	$scope.puntos_interes=function(){
		if(punto==0){
			punto=1;
		}else{
			punto=0;
		}
		puntos.resultados=punto;
	};

});

app.factory('puntos', function() {
  var _resultados = {};
  return {
    resultados: _resultados
  };
});