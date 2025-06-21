
 let productos = [];
let carrito = [];
let genericos = [];
let insumos = [];
let preparados = [];

// Cargar productos desde el archivo JSON
fetch('productos.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarProductos();
  })
  .catch(error => console.error('Error al cargar los productos:', error));

document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email === 'lekarna@farmaciapintar.com' && password === 'Farmaco00') {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
  } else {
    alert('Email o contraseña incorrectos');
  }
});

function cargarProductos() {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';
  productos.forEach((prod, i) => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `<strong>${prod.Producto}</strong> - $${prod.PrecioLista}`;
    div.onclick = () => mostrarOpcionesSector(i, div);
    contenedor.appendChild(div);
  });
}

function mostrarOpcionesSector(i, div) {
  const opciones = document.createElement('div');
  opciones.className = 'botones-sector';
  opciones.innerHTML = `
    <button onclick="agregarAlCarrito(${i}, 'Genéricos'); this.parentElement.remove();">GENÉRICOS</button>
    <button onclick="agregarAlCarrito(${i}, 'Insumos'); this.parentElement.remove();">INSUMOS</button>
    <button onclick="agregarAlCarrito(${i}, 'Preparados'); this.parentElement.remove();">PREPARADOS</button>
  `;
  div.appendChild(opciones);
  div.onclick = null;
}

function agregarAlCarrito(i, sector) {
  const prod = productos[i];
  const porcentaje = prompt("¿Porcentaje de aumento aplicado? (solo número, sin %)", "0");
  const aumento = parseFloat(porcentaje);
  const precioFinal = Math.round(prod.PrecioLista * (1 + aumento / 100));
  const productoFinal = {
    nombre: prod.Producto,
    precio: prod.PrecioLista,
    porcentaje: aumento,
    final: precioFinal,
    cantidad: 1
  };

  if (sector === 'Genéricos') genericos.push(productoFinal);
  else if (sector === 'Insumos') insumos.push(productoFinal);
  else if (sector === 'Preparados') preparados.push(productoFinal);

  const item = carrito.find(p => p.nombre === prod.Producto && p.sector === sector);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ ...productoFinal, sector });
  }
}

function mostrarPedidoSector(sector) {
  let lista = [];
  if (sector === 'Genéricos') lista = genericos;
  else if (sector === 'Insumos') lista = insumos;
  else if (sector === 'Preparados') lista = preparados;

  const contenedor = document.querySelector('.carrito');
  contenedor.innerHTML = `<h3>${sector}</h3>`;
  lista.forEach((prod, index) => {
    const div = document.createElement('div');
    div.innerHTML = `${prod.nombre} - $${prod.final} x${prod.cantidad} <button onclick="eliminarProductoSector('${sector}', ${index})">❌</button>`;
    contenedor.appendChild(div);
  });

  const btnImprimir = document.createElement('button');
  btnImprimir.textContent = 'IMPRIMIR';
  btnImprimir.onclick = () => imprimirTicket(sector);
  contenedor.appendChild(btnImprimir);
}

function eliminarProductoSector(sector, index) {
  if (sector === 'Genéricos') genericos.splice(index, 1);
  else if (sector === 'Insumos') insumos.splice(index, 1);
  else if (sector === 'Preparados') preparados.splice(index, 1);
  mostrarPedidoSector(sector);
}

function imprimirTicket(tipo) {
  const fecha = new Date();
  const fechaTexto = fecha.toLocaleDateString();
  const horaTexto = fecha.toLocaleTimeString();
  let productosSector = [];
  if (tipo === 'Genéricos') productosSector = genericos;
  else if (tipo === 'Insumos') productosSector = insumos;
  else if (tipo === 'Preparados') productosSector = preparados;

  let contenido = `
    <style>
      body { font-family: monospace; font-size: 14px; }
      .ticket { max-width: 300px; margin: auto; border: 1px solid #000; padding: 10px; }
      .linea { border-top: 1px solid #000; margin: 10px 0; }
      .centrado { text-align: center; }
    </style>
    <div class="ticket">
      <div class="centrado">
        <strong>FARMACIA PINTAR</strong><br>
        SAN MIGUEL<br>
        AV REMIGIO LOPEZ 2393<br>
        TEL: 44555502 - WHATSAPP: 1153183466<br>
        <strong>COMPROBANTE NO FISCAL</strong><br>
        FECHA: ${fechaTexto} - HORA: ${horaTexto}<br>
        <strong>${tipo.toUpperCase()}</strong>
      </div>
      <div class="linea"></div>
  `;

  let total = 0;
  productosSector.forEach(prod => {
    const subtotal = prod.final * prod.cantidad;
    total += subtotal;
    contenido += `
      <div style="margin-bottom: 8px;">
        <strong>${prod.nombre}</strong><br>
        Precio base: $${prod.precio.toFixed(2)}<br>
        Aumento: ${prod.porcentaje}%<br>
        Precio final: $${prod.final.toFixed(2)} x${prod.cantidad}<br>
        <strong>Precio Total: $${subtotal.toFixed(2)}</strong>
      </div>
    `;
  });

  contenido += `
    <div class="linea"></div>
    <div class="centrado">
      <strong>TOTAL: $${total.toFixed(2)}</strong>
    </div>
    <div class="linea"></div>
    <div style="font-size: 11px; text-align: center;">
      IMPORTANTE: EL PRECIO ES VÁLIDO POR 12HS.<br>
      PASADAS LAS 12HS, EL PRECIO PODRÍA VARIAR Y<br>
      SE APLICARÁ LA DIFERENCIA. CUALQUIER RECLAMO<br>
      SOLO CON TICKET EN MANO.
    </div>
    <div class="centrado" style="margin-top: 10px;">
      <strong>GRACIAS POR SU COMPRA</strong>
    </div>
  </div>`;

  const win = window.open('', '', 'width=300,height=600');
  win.document.write(contenido);
  win.print();
}

window.addEventListener('load', () => {
  const carritoDiv = document.querySelector('.carrito');
  const pedidoBoton = document.createElement('button');
  pedidoBoton.textContent = 'PEDIDO';
  pedidoBoton.onclick = () => {
    const botones = document.createElement('div');
    botones.className = 'botones-sector';
    botones.innerHTML = `
      <button onclick="mostrarPedidoSector('Genéricos')">GENÉRICOS</button>
      <button onclick="mostrarPedidoSector('Insumos')">INSUMOS</button>
      <button onclick="mostrarPedidoSector('Preparados')">PREPARADOS</button>
    `;
    carritoDiv.appendChild(botones);
    pedidoBoton.remove();
  };
  carritoDiv.appendChild(pedidoBoton);
});
