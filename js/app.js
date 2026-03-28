let DATA = {};

async function cargarDatos(){
  const res = await fetch("data/datos.json");
  DATA = await res.json();
}

function resetear(){
  ancho.value="";
  alto.value="";
  resultado.innerHTML="$0";
  actualizarUI();
}

function actualizarUI(){
  let p=producto.value;
  grupoVidrio.style.display=(p==="Paño fijo")?"block":"none";
  grupoCalidad.style.display=(p==="Paño fijo")?"block":"none";
  grupoColor.style.display=(p==="Premarco")?"none":"block";
}

// 🔥 FUNCIÓN CENTRAL
function calcularSucursal(costo, sucursal, tipoCliente){

  let descuento = sucursal.desc[tipoCliente] ?? 0;

  let costoFinal = costo * (1 - descuento);
  let precio = costoFinal * (1 + sucursal.inc) * (1 + sucursal.margen);
  let ganancia = precio - costoFinal;
  let margen = (ganancia / precio) * 100;

  return {
    costo: costoFinal,
    precio,
    ganancia,
    margen
  };
}

function calcular(tipo){

  if (!DATA.perfiles) {
    alert("Esperá que carguen los datos...");
    return;
  }

  let p=producto.value;
  let a=ancho.value/100;
  let h=alto.value/100;
  let per=a*2+h*2;

  let pl=DATA.perfiles;
  let col=DATA.colores;
  let vid=DATA.vidrios;

  let costo=0;

  // 🔧 COSTOS (no tocar)
  if(p==="Paño fijo"){
    costo=(per*pl[calidad.value])*(1+col[color.value])+(a*h*vid[vidrio.value]);
  }

  if(p==="Premarco"){
    costo=per*DATA.costos.premarco;
  }

  if(p==="Contramarco"){
    costo=(per*DATA.costos.contramarco)*(1+col[color.value]);
  }

  // 🔥 DETECTAR TIPO (herrero / modena) DESDE CALIDAD
  let tipoCliente = calidad.value.toLowerCase();

  if(tipoCliente.includes("herrero")){
    tipoCliente = "herrero";
  } else if(tipoCliente.includes("modena")){
    tipoCliente = "modena";
  } else {
    tipoCliente = "modena"; // default seguro
  }

  // 💰 CÁLCULO
  if(!tipo){

    let s = DATA.sucursales;

    let sebamar = calcularSucursal(costo, s.sebamar, tipoCliente);
    let azul = calcularSucursal(costo, s.azul, tipoCliente);
    let verde = calcularSucursal(costo, s.verde, tipoCliente);

    resultado.innerHTML = `
    <b>Costo base:</b> $${Math.round(costo)}<br><br>

    <b>--- SEBAMAR ---</b><br>
    Costo: $${Math.round(sebamar.costo)}<br>
    Precio: $${Math.round(sebamar.precio)}<br>
    Ganancia: $${Math.round(sebamar.ganancia)}<br>
    Margen: ${sebamar.margen.toFixed(1)}%<br><br>

    <b>--- EX ---</b><br>
    Costo: $${Math.round(azul.costo)}<br>
    Precio: $${Math.round(azul.precio)}<br>
    Ganancia: $${Math.round(azul.ganancia)}<br>
    Margen: ${azul.margen.toFixed(1)}%<br><br>

    <b>--- EX2 ---</b><br>
    Costo: $${Math.round(verde.costo)}<br>
    Precio: $${Math.round(verde.precio)}<br>
    Ganancia: $${Math.round(verde.ganancia)}<br>
    Margen: ${verde.margen.toFixed(1)}%
    `;

  } else {

    let s = DATA.sucursales[tipo];
    let res = calcularSucursal(costo, s, tipoCliente);

    resultado.innerHTML = "$" + Math.round(res.precio);
  }
}

function cargarSelect(id, datos){
  let select = document.getElementById(id);
  if(!select) return;

  select.innerHTML = "";

  for(let key in datos){
    let option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.appendChild(option);
  }
}

async function init(){
  await cargarDatos();

  cargarSelect("calidad", DATA.perfiles);
  cargarSelect("color", DATA.colores);
  cargarSelect("vidrio", DATA.vidrios);

  actualizarUI();
}