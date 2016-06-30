function Bezier (scene) {
    //Puntos de control de la curva
	this.puntosControl = new Array();
	
	// creamos el material
	this.material = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});
	// creamos la geometria
	this.geometry = new THREE.Geometry();
	this.geometry.dynamic = true;
	this.geometry.verticesNeedUpdate = true;
	// creamos la linea
	this.line = new THREE.LineSegments(this.geometry, this.material);
	scene.add(this.line);
}

//Agrega un punto de control a la curva
Bezier.prototype.agregarPuntoControl = function(PC) {
    this.puntosControl.push(PC);
};

//Borra el ultimo punto de control de la curva
Bezier.prototype.eliminarUltimoPuntoControl = function() {
    this.puntosControl.pop();
};

//Evalua el punto de la curva en el tiempo t
//El metodo que se utilize puede verse y cambiarse usando SetTipoEvaluacion y GetTipoEvaluacion
Bezier.prototype.evaluar = function(t) {
	var Q = new Array();
	var N = this.puntosControl.length-1;

	for(i=0; i <= N ; ++i)
		Q.push(this.puntosControl[i].clone()); // primera columna de la cuña
	for(k=1; k <= N ; ++k)//por cada columna siguiente de la cuña
		for(i=0; i <= (N-k); ++i)
		{
			Q[i].x = (1 - t)*Q[i].x + t*Q[i+1].x;//calculo del punto C en el ratio (1-t):t
			Q[i].y = (1 - t)*Q[i].y + t*Q[i+1].y;
			Q[i].z = (1 - t)*Q[i].z + t*Q[i+1].z;
		}

	var res = Q[0];//punto de la curva a tiempo t
	return res;
};

//Dibuja la curva de Bezier
//RW es la ventana donde se dibujara
//LOD es el nivel de detalle con el que se dibujara la curva, es decir
//la cantidad de lineas que poseera la poligonal que aproxima la curva
Bezier.prototype.dibujar = function(LOD) {
    var puntos = new Array();
    var dt = 1.0/(LOD-1);
	for(k=0; k < LOD ; ++k)
	{
		var t = dt*k;
		if( t>=1 )
			t -= 0.00001;
		puntos.push( this.evaluar(t) );
	}
	
	this.geometry.vertices = [];
	for(k=1; k < LOD ; ++k)
	{
		this.geometry.vertices.push(new THREE.Vector3(puntos[k].x, puntos[k].y, 0));
		this.geometry.vertices.push(new THREE.Vector3(puntos[k-1].x, puntos[k-1].y, 0));
	}
	this.geometry.verticesNeedUpdate = true;
};

Bezier.prototype.dibujarPuntosControl = function() {
	this.geometry.vertices = [];
	for(k=1; k < this.puntosControl.length ; ++k)
	{
		this.geometry.vertices.push(new THREE.Vector3(this.puntosControl[k].x, this.puntosControl[k].y, 0));
		this.geometry.vertices.push(new THREE.Vector3(this.puntosControl[k-1].x, this.puntosControl[k-1].y, 0));
	}
	this.geometry.verticesNeedUpdate = true;
}
