function Bezier (scene) {
    //Puntos de control de la curva
	this.puntosControl = new Array();
	
	// creamos el material
	this.materialCurva = new THREE.LineBasicMaterial({
		color: 0xff0000
	});
	// creamos la geometria
	this.geometryCurva = new THREE.Geometry();
	this.geometryCurva.dynamic = true;
	this.geometryCurva.verticesNeedUpdate = true;
	// creamos la linea
	this.lineCurva = new THREE.LineSegments(this.geometryCurva, this.materialCurva);
	scene.add(this.lineCurva);
	
	// Puntos de Contol
	this.updatePC = false;// si hace falta cambiar datos de dibujo
	
	this.materialPC = new THREE.PointsMaterial({
		color: 0x0000ff
	});
	// creamos la geometria
	this.geometryPC = new THREE.Geometry();
	this.geometryPC.dynamic = true;
	this.geometryPC.verticesNeedUpdate = true;
	// creamos los puntos
	this.pointsPC = new THREE.Points(this.geometryPC, this.materialPC);
	scene.add(this.pointsPC);
	
	this.scene = scene;
}

//Agrega un punto de control a la curva
Bezier.prototype.pushPuntoControl = function(PC) {
	this.updatePC = true;
    this.puntosControl.push(PC);
};

//Borra el ultimo punto de control de la curva
Bezier.prototype.popPuntoControl = function() {
	if( this.puntosControl.length > 0 )
		this.puntosControl.pop();
};

//Evalua el punto de la curva en el tiempo t
//El metodo que se utilize puede verse y cambiarse usando SetTipoEvaluacion y GetTipoEvaluacion
Bezier.prototype.evaluar = function(t) {
	var Q = new Array();
	var N = this.puntosControl.length-1;

	for(var i=0; i <= N ; ++i)
		Q.push(this.puntosControl[i].clone()); // primera columna de la cuña
	for(var k=1; k <= N ; ++k)//por cada columna siguiente de la cuña
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
	
	if( this.updatePC && this.puntosControl.length > 0)
	{
		var puntos = new Array();
		var dt = 1.0/(LOD-1);
		for(var k=0; k < LOD ; k++)
		{
			var t = dt*k;
			if( t>=1 )
				t -= 0.00001;
			puntos.push( this.evaluar(t) );
		}
		
		this.geometryCurva.vertices = [];
		for(var k=1; k < LOD ; ++k)
		{
			this.geometryCurva.vertices.push(new THREE.Vector3(puntos[k].x, puntos[k].y, puntos[k].z));
			this.geometryCurva.vertices.push(new THREE.Vector3(puntos[k-1].x, puntos[k-1].y, puntos[k-1].z));
		}
		this.geometryCurva.verticesNeedUpdate = true;
	}else
	{
		this.geometryCurva.verticesNeedUpdate = false;
	}
};

//Dibuja los puntos de control de la curva
Bezier.prototype.dibujarPuntosControl = function() {
	
	if( this.updatePC )
	{
		this.scene.remove(this.pointsPC);
		// creamos la geometria
		this.geometryPC = new THREE.Geometry();// en puntos no anda dynamic ni verticesNeedUpdate :/
		// creamos los puntos
		this.pointsPC = new THREE.Points(this.geometryPC, this.materialPC);
		this.scene.add(this.pointsPC);
		
		this.geometryPC.vertices = [];
		//console.log(this.puntosControl.length);
		for(var k=0; k < this.puntosControl.length ; ++k)
		{
			//this.geometryPC.vertices.push(new THREE.Vector3(this.puntosControl[k].x, this.puntosControl[k].y, this.puntosControl[k].z));
			//this.geometryPC.vertices.push(new THREE.Vector3(this.puntosControl[k-1].x, this.puntosControl[k-1].y, this.puntosControl[k-1].z));
			this.geometryPC.vertices.push(new THREE.Vector3(this.puntosControl[k].x, this.puntosControl[k].y, this.puntosControl[k].z));
		}
	}
}

Bezier.prototype.printPC = function() {
	for(var k=0; k < this.puntosControl.length ; ++k)
		console.log("PC="+k+" - ("+this.puntosControl[k].x+","+this.puntosControl[k].y+","+this.puntosControl[k].z+")");
}

Bezier.prototype.getPuntoControlCercano = function(punto, minDistancia) {
	var minDst = Number.MAX_VALUE;
	var minIndx = -1;
	for(var i=0; i < this.puntosControl.length ; ++i)
	{
		var aux1 = this.puntosControl[i].x-punto.x;
		var aux2 = this.puntosControl[i].y-punto.y;
		var dst = Math.sqrt(aux1*aux1 + aux2*aux2);//Distancia Euclidea
		if( dst < minDst )
		{
			minDst = dst;
			minIndx = i;
		}
	}
	if( minDst < minDistancia )
		return this.puntosControl[minIndx];
	else
		return null;
}
