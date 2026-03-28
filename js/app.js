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

  if(p==="Paño fijo"){
    costo=(per*pl[calidad.value])*(1+col[color.value])+(a*h*vid[vidrio.value]);
  }

  if(p==="Premarco"){
    costo=per*DATA.costos.premarco;
  }

  if(p==="Contramarco"){
    costo=(per*DATA.costos.contramarco)*(1+col[color.value]);
  }

  if(!tipo){

    let s = DATA.sucursales;

    let costo_sebamar = costo * (1 - s.sebamar.desc);
    let costo_azul = costo * (1 - s.azul.desc);
    let costo_verde = costo * (1 - s.verde.desc);

    let sebamar = costo_sebamar * (1+s.sebamar.inc)*(1+s.sebamar.margen);
    let azul = costo_azul * (1+s.azul.inc)*(1+s.azul.margen);
    let verde = costo_verde * (1+s.verde.inc)*(1+s.verde.margen);

    let gan_sebamar = sebamar - costo_sebamar;
    let gan_azul = azul - costo_azul;
    let gan_verde = verde - costo_verde;

    let marg_sebamar = (gan_sebamar / sebamar) * 100;
    let marg_azul = (gan_azul / azul) * 100;
    let marg_verde = (gan_verde / verde) * 100;

    resultado.innerHTML = `
    <b>Costo base:</b> $${Math.round(costo)}<br><br>

    <b>--- SEBAMAR ---</b><br>
    Costo: $${Math.round(costo_sebamar)}<br>
    Precio: $${Math.round(sebamar)}<br>
    Ganancia: $${Math.round(gan_sebamar)}<br>
    Margen: ${marg_sebamar.toFixed(1)}%<br><br>

    <b>--- EX ---</b><br>
    Costo: $${Math.round(costo_azul)}<br>
    Precio: $${Math.round(azul)}<br>
    Ganancia: $${Math.round(gan_azul)}<br>
    Margen: ${marg_azul.toFixed(1)}%<br><br>

    <b>--- EX2 ---</b><br>
    Costo: $${Math.round(costo_verde)}<br>
    Precio: $${Math.round(verde)}<br>
    Ganancia: $${Math.round(gan_verde)}<br>
    Margen: ${marg_verde.toFixed(1)}%
    `;

  } else {

    let s = DATA.sucursales[tipo];
    let precio = costo * (1 - s.desc) * (1 + s.inc) * (1 + s.margen);

    resultado.innerHTML = "$" + Math.round(precio);
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