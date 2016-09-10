/* Implementacion del juego */

//CONSTANTES
var ESPACIO		= 32;
var IZQUIERDA	= 37;
var DERECHA		= 39;
var ARRIBA		= 38;
var ABAJO		= 40;
var ENTER		= 13;


var keys = {};
var iniciarJuego=false;

document.onkeydown = function(e){
	keys[e.which] = true;	
	iniciarJuego=true;//Inicia el juego hasta que se presione una tecla
};
document.onkeyup = function(e) { keys[e.which] = false };


//Clase game
function Game(canvasId,typeContext,fps,tilemap,jugador,enemigos) {
	var instancia = this;// Variable privada: Mantener la instancia de esta clase 
	
	
	
	
	/* Atributos */
	
	
	this.screen = document.getElementById(canvasId);
	this.context = this.screen.getContext(typeContext);
	this.screenWidth = this.context.canvas.width;
	this.screenHeight = this.context.canvas.height;
	this.personaje = jugador;
	this.velocidadActualizacion = fps;//Frames por segundo
	this.tile = tilemap;
	this.enemigos = enemigos;
	this.puntaje = 0;
	this.saludBase = 100;
	this.juegoTerminado = false;
	/* Metodos */
	
	
	this.iniciarJuego = function(){
		this.context.fillStyle="#000000";
		this.context.fillRect(0,0,this.screenWidth,this.screenHeight);
		
		instancia.intervalo = setInterval(function(){
			instancia.actualizar(); 
	    },1000/this.velocidadActualizacion);
	};
	
	this.actualizar = function(){
		if(iniciarJuego){
			if(this.juegoTerminado!=true){
				this.verificarColisiones();
				document.getElementById("soundGame").play();
			}
			
			this.actualizarMapa();
			this.actualizarEnemigos();
			this.actualizarPersonaje();
			this.dibujarPuntuacion();
		}else{
			this.actualizarMapa();
			this.actualizarPersonaje();
			this.tile.incremento=0;
			this.context.font= "16px arial";
			this.context.fillStyle="#ffffff";
			this.context.fillText("Pulse cualquier tecla para iniciar el juego",250,250);
		}
	};
	
	this.actualizarMapa = function(){
		this.tile.dibujar(this.context);
		if(this.tile.fin==true){
			this.gameOverMenu();
			document.getElementById("soundGame").pause();
			this.personaje.controls = {disparar:0,izquierda:0,derecha:0,arriba:0,abajo:0};
			if(keys[ENTER]){
				this.reiniciar();
			}
		}
	};
	
	this.actualizarPersonaje =function(){
		if(this.personaje.vidas<0){
			this.gameOverMenu();
			//alert("He muerto!");
			//this.personaje.controls=null;
			if(keys[ENTER]){
				this.reiniciar();
			}
		}else{
			this.personaje.dibujar(this.context,this);
			this.personaje.actionListener();
		}
		
	};
	
	this.reiniciar = function(){
		document.location.reload();
	};
	
	this.actualizarEnemigos =function(){
		if(this.saludBase<=0){
			this.gameOverMenu();
			this.saludBase==0;
			if(keys[ENTER]){
				this.reiniciar();
			}
		}
		for(i=0;i<this.enemigos.length;i++){
			this.enemigos[i].dibujar(this.context);
			if(this.enemigos[i].posY>400){
				this.saludBase-=5;
				this.eliminarEnemigo(i);
			}
		}
	};
	
	this.eliminarEnemigo = function(i){
		enemigos = new Array();
		k=0;
		for(j=0;j<this.enemigos.length;j++){
			if(j!=i){
				enemigos[k++] = this.enemigos[j];
			}
		}
		this.enemigos =enemigos;
		return true;
	};
	
	this.verificarColisiones = function(){
		for(i=0;i<this.enemigos.length;i++){
			if(intersects(this.enemigos[i],this.personaje)){
				this.personaje.revivir();
				break;
			}
		}
	};
	
	this.gameOverMenu = function(){
		this.context.font= "62px arial";
		this.context.strokeStyle="#ff0000";
		this.context.strokeText("GAME OVER",210,220);
		this.context.font= "14px arial";
		this.context.fillStyle="#ffffff";
		this.context.fillText("Pulsa 'INTRO' para volver a jugar",290,250);
		this.juegoTerminado = true;
	};
	
	this.dibujarPuntuacion = function(){
		this.context.globalAlpha = 0.72;
		this.context.drawImage(this.personaje.sprites.img,8,8,32,32,0,0,28,28);
		
		
		this.context.font= "20px Broadway";
		this.context.fillStyle="#fff";
		
		this.context.fillText(" x "+this.personaje.vidas,27	,24);
		this.context.fillText(" Puntuacion: "+this.puntaje,550,24);
		this.context.fillText(" Salud base: ",190,26);
		this.context.fillStyle="#00cc00";
		this.context.fillRect(340,15,200,10);
		if(this.saludBase>75){
			this.context.fillStyle="#00ff00";
		}else if(this.saludBase>50){
			this.context.fillStyle="#ccaa00";
		}else if(this.saludBase>25){
			this.context.fillStyle="#dd3300";
		}else{
			this.context.fillStyle="#ff0000";
		}
		this.context.fillRect(340,15,2*this.saludBase,10);
		
		this.context.globalAlpha = 1;
	};
	
}

//Clase Sprites
function Sprites(recurso,sprites,spritePorDefecto){
	this.img		 	= document.getElementById(recurso);
	this.spriteActivo 	= spritePorDefecto;//Por defecto el primer sprite sera el activo
	this.arregloSprites = sprites;
	this.iteracion		= 0;
	//sprite["NORMAL"].x
	//sprite["NORMAL"].y
	//sprite["NORMAL"].ancho
	//sprite["NORMAL"].alto
	//sprite["NORMAL"].animacion= {"NORMAL","NORMAL_1","NORMAL_2"}
	
	this.nAnimacion		= 0;//Algunos sprites pueden contener animacion conforme pasa el tiempo
	//sprite["NORMAL"].x
	//sprite["NORMAL"].y
	//sprite["NORMAL"].ancho
	//sprite["NORMAL"].alto
	//sprite["NORMAL"].animacion= {"NORMAL","NORMAL_1","NORMAL_2"}
	
	this.activarSprite	= function(nombre){//Activa un sprite determinado por el usuario
		this.spriteActivo = nombre;
	};
	
	this.next			= function(){
		if(++this.i<this.arregloSprites[this.spriteActivo].animacion.length){
//			alert(this.arregloSprites[this.spriteActivo].animacion[this.i]);
			nombre = this.arregloSprites[this.spriteActivo].animacion[this.i];
			return (this.arregloSprites[nombre]);
//			alert(obj)
		}else{
			this.i=0;
//			alert(this.arregloSprites[this.spriteActivo].animacion[this.i]);
			nombre = this.arregloSprites[this.spriteActivo].animacion[this.i];
			return this.arregloSprites[nombre];
		}
	};
	
}


//class tilemap
function Tilemap(idImg,filas,columnas,tamTile,numTiles,tileset){
	this.tile 		= document.getElementById(idImg);
	this.nFilas 	= filas;
	this.nColumnas	= columnas;
	this.tamTile	= tamTile;
	this.numTiles	= numTiles;
	this.incremento = 0;
	this.tileset	= tileset;
	this.i 			= 0;
	
	var Tile;
	this.fin=false;
	this.dibujar 	= function(context){
	
		for(j=0;j<this.nFilas;j++){
			for(i=0;i<this.nColumnas;i++){
				//if((((this.tileset).length+9)-j-this.incremento)<0){
				//	Tile = this.tileset[j][i];
				//	this.fin =true;
				//}else{
					Tile = this.tileset[((this.tileset).length-1)-j-this.incremento][i];
				//}
				columna = Tile%this.numTiles;
				//alert(columna);
				//Tile = tileMap[j][(i+desp)%20];
				fila = (Tile/this.numTiles)|0;
				//alert(fila);
						
				sx = (columna * this.tamTile);//(columna%numTilesC)*tamTile;
				sy = (fila * this.tamTile);//(fila%numTilesF)*tamTile;
				x  = i * this.tamTile;
				y  = (this.nFilas-1-j) * this.tamTile;
				context.drawImage(this.tile,sx,sy,32,32,x,y,32,32);
			}
		}
		if(this.i % 6==0 && this.incremento+this.nFilas<this.tileset.length){
			this.incremento += 1;
		}else if(this.incremento+this.nFilas>this.tileset.length-1){
			this.fin =true;
		}
		this.i++;
	};
}




//class Jugador
function Jugador(sprites,enemigos){
	this.sprites = sprites;
	this.controls	= {disparar:ESPACIO,izquierda:IZQUIERDA,derecha:DERECHA,arriba:ARRIBA,abajo:ABAJO};
	this.posX		= 400;
	this.posY		= 400;
	this.ancho		= 52;
	this.alto		= 52;
	this.aceleracionX=0;
	this.aceleracionY=0;
	this.tipoProyectil="NORMAL";
	this.i=0;
	this.enemigos = enemigos;//Arreglo de enemigos
	this.vidas = 3;
	
	
	this.actionListener = function(){
		if(keys[this.controls.izquierda]){
			this.posX -=1+0.01*(this.aceleracionX<15)?this.aceleracionX++:this.aceleracionX;
			this.sprites.spriteActivo="IZQUIERDA";
		}else if(keys[this.controls.derecha]){
			this.posX +=1+0.01*(this.aceleracionX<15)?this.aceleracionX++:this.aceleracionX;
			this.sprites.spriteActivo="DERECHA";
		}
		if(keys[this.controls.arriba]){
			this.posY -=1+0.01*(this.aceleracionY<15)?this.aceleracionY++:this.aceleracionY;
		}else if(keys[this.controls.abajo]){
			this.posY +=1+0.01*(this.aceleracionY<15)?this.aceleracionY++:this.aceleracionY;
		}
		if(!keys[this.controls.izquierda] && !keys[this.controls.derecha]){
			this.aceleracionX=0;
		}
		if(!keys[this.controls.arriba] && !keys[this.controls.abajo]){
			this.aceleracionY=0;
		}
		if(this.posX<-6){
			this.posX=-5;
		}
		if(this.posX>760){
			this.posX=759;
		}
		if(this.posY>420){
			this.posY=420;
		}
		if(this.posY<0){
			this.posY=0;
		}
	};
	this.dibujar	= function(context){
		if(keys[this.controls.disparar] && (this.i%4 ==0)){
			obj = new disparo();
			obj.disparar(context,this,juego);
			x = new Audio();
			x = document.getElementById("shootSound");
			if(x.currentTime>0.4){
				x.currentTime=0.0;
			}
			x.volume = 0.3;
			x.play();
		}
		//alert(this.i);
		
		if(this.sprites.arregloSprites[this.sprites.spriteActivo].animacion){
			obj = this.sprites.next();
			//alert(obj.y);
			context.drawImage(this.sprites.img,obj.x,obj.y,obj.ancho,obj.alto,this.posX,this.posY,this.ancho,this.alto);
		}else{
			context.drawImage(this.sprites.img,
			this.sprites.arregloSprites[this.sprites.spriteActivo].x,
			this.sprites.arregloSprites[this.sprites.spriteActivo].y,
			this.sprites.arregloSprites[this.sprites.spriteActivo].ancho,
			this.sprites.arregloSprites[this.sprites.spriteActivo].alto,
			this.posX,this.posY,this.ancho,this.alto
			);
		}
		this.sprites.spriteActivo="NORMAL";
		this.i++;
	};
	
	this.revivir = function(){
		this.vidas--;
		this.posX = 400;
		this.posY = 400;
	};
}


function disparo(){
	var instancia = this;
	this.posY;
	this.posX;
	this.enemigos;
	this.juego;
	this.ancho = 24;
	this.alto = 24;
	this.disparar = function(context,obj,juego){
		this.posY = obj.posY;
		this.posX = obj.posX + 15;
		this.juego = juego;
		instancia.intervalo = setInterval(function(){
			instancia.animacionProyectil(context,obj); 
	    },1000/80);
	};
	
	this.animacionProyectil = function(context,obj){
		matar = false;
//		context.fillRect(this.posX,this.posY--,32,32);
		context.drawImage(obj.sprites.img,335,182,11,10,this.posX,this.posY-=1,24,24);
		instancia.enemigos = instancia.juego.enemigos;
		for(i=0;i<instancia.enemigos.length;i++){
			if(intersects(instancia.enemigos[i],instancia) && (instancia.enemigos[i].posX > 0 && instancia.enemigos[i].posY > 0)){
				//clearInterval(instancia.intervalo);
				//delete instancia;
				//alert(instancia.posX + "~" + instancia.enemigos[i].posX);
				//alert(instancia.posY + "~" + instancia.enemigos[i].posY);
				matar = true;
				break;
			}
		}
		if(matar){
			if(this.juego.eliminarEnemigo(i)){
				this.juego.puntaje += 5;
				delete instancia;
				clearInterval(instancia.intervalo);
			};
			matar = false;
		}
		i=0;
		if(this.posY<15){
			//alert("Eliminar");
			//alert(delete this.instancia);
			delete instancia;
			clearInterval(instancia.intervalo);
		}
	};
}

function Enemigo(sprites,x,y,ancho,alto,formulaX,formulaY){
	//Coleccion de sprites que daran forma a los enemigos
	//Formula es una cadena de texto que se modifica usando eval
	//El enemigo aparece en el juego en determinado tiempo
	this.posX=x;
	this.posY=y;
	this.formulaX=formulaX;
	this.formulaY=formulaY;
	this.ancho=ancho;
	this.alto=alto;
	this.sprites = sprites;
	this.i=0;
	this.dibujar = function(context){
			x = this.posX;
			y = this.posY;
			x = eval(this.formulaX);
			y = eval(this.formulaY);
			//alert(x);
			//alert(x);
			//alert(y);
			this.posX=x;
			this.posY=y;
		if(this.posY>=0 && this.posY<=800){
			//Solo se dibujan a los enemigos dentro del rango
			
			context.drawImage(this.sprites.img,
			this.sprites.arregloSprites[this.sprites.spriteActivo].x,
			this.sprites.arregloSprites[this.sprites.spriteActivo].y,
			this.sprites.arregloSprites[this.sprites.spriteActivo].ancho,
			this.sprites.arregloSprites[this.sprites.spriteActivo].alto,
			this.posX,this.posY,this.ancho,this.alto
			);
			if(this.i++ % 64 ==0){
				new disparoEnemigo(this).disparar(juego);
			}
		}else{
			//Para los enemigos fuera de pantalla tenemos 2 opciones
			if(this.posY<0){
				//Aun no les toca aparecer en el juego
				this.posY++;
			}else if(this.posY>800){
				//El enemigo sale del escenario
				delete this;//Destruimos el objeto
			}
		}
	};
}

function disparoEnemigo(enemigo){
	var instancia2 = this;
	this.posY=enemigo.posY+32;
	this.posX=enemigo.posX+13;
	this.juego;
	this.ancho = 15;
	this.alto = 40;
	this.disparar = function(juego){
		this.juego = juego;
		instancia2.intervalo = setInterval(function(){
			instancia2.animacionProyectil(); 
	    },1000/60);
	};
	
	this.animacionProyectil = function(){
		matar = false;
		//context.fillRect(this.posX,this.posY--,32,32);
		//this.juego.context.fillRect(this.posX,instancia2.posY+=1,14,14);
		//context.drawImage(obj.sprites.img,335,182,11,10,this.posX,this.posY-=1,24,24);
//		this.juego.context.fillRect(this.posX,this.posY+=1,32,32);
		this.juego.context.drawImage(document.getElementById("personaje"),390,225,5,10,this.posX,this.posY+=1,15,40);
		//alert(instancia2.posX);
		if(intersects(this.juego.personaje,instancia2)){
			//clearInterval(instancia.intervalo);
			//delete instancia;
			//alert(instancia.posX + "~" + instancia.enemigos[i].posX);
			//alert(instancia.posY + "~" + instancia.enemigos[i].posY);
			matar = true;
		}
		
		if(matar && this.juego.juegoTerminado!=true){
			this.juego.personaje.revivir(i)
			delete instancia2;
			clearInterval(instancia2.intervalo);
			matar = false;
		}
		i=0;
		if(this.posY<15){
			//alert("Eliminar");
			//alert(delete this.instancia);
			delete instancia2;
			clearInterval(instancia2.intervalo);
		}
	}
}




function intersects(obj1,obj2){
				if(obj1.posX + obj1.ancho < obj2.posX)
					return false;
				if(obj1.posY + obj1.alto < obj2.posY)
					return false;
				if(obj1.posX > obj2.posX + obj2.ancho)
					return false;
				if(obj1.posY > obj2.posY + obj2.alto)
					return false;
				return true;
			}




function movimientoZigZagX(x,y){
	if(x<0 || y<0){
		return x+1;
	}
	if(y%150<75){
		return x+3;
	}else{
		return x-3;
	}
}


