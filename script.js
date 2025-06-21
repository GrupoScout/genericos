let productos = [];
let carrito = [];
let modoDesarrollador = false;

// Cargar productos desde localStorage o desde el archivo JSON si no hay datos en localStorage
function cargarProductosIniciales() {
  const productosGuardados = localStorage.getItem('productos');
  if (productosGuardados) {
    productos = JSON.parse(productosGuardados);
    cargarProductos();
  } else {
    fetch('productos.json')
      .then(response => response.json())
      .then(data => {
        productos = data;
        localStorage.setItem('productos', JSON.stringify(productos));
        cargarProductos();
      })
      .catch(error => console.error('Error al cargar los productos:', error));
  }
}

document.addEventListener('DOMContentLoaded', cargarProductosIniciales);

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

document.getElementById('developer-mode').addEventListener('click', function() {
  if (modoDesarrollador) {
    modoDesarrollador = false;
    document.getElementById('developer-mode').textContent = 'Modo Desarrollador';
    cargarProductos();
  } else {
    const password = prompt("Introduce la contraseña para entrar al modo desarrollador:");
    if (password === 'Farmaco00') {
      modoDesarrollador = true;
      document.getElementById('developer-mode').textContent = 'Salir del Modo Desarrollador';
      alert('Modo desarrollador activado');
      cargarProductos();
    } else {
      alert('Contraseña incorrecta');
    }
  }
});

document.getElementById('search-bar').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const filteredProducts = productos.filter(product =>
    product.Producto.toLowerCase().includes(searchTerm)
  );
  cargarProductos(filteredProducts);
});

function cargarProductos(productsToLoad = productos) {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';
  productsToLoad.forEach((prod, i) => {
    const precioConAumento = prod.PorcentajeAumento ? prod.PrecioLista * (1 + prod.PorcentajeAumento / 100) : prod.PrecioLista;
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <strong>${prod.Producto}</strong> - $${precioConAumento.toFixed(2)}
      ${modoDesarrollador ? `
        <button onclick="editarProducto(${i})">Editar</button>
      ` : `
        <button onclick="agregarAlCarrito(${i})">Agregar al Carrito</button>
        <button onclick="agregarAPedido(${i})">Agregar a Pedido</button>
      `}
    `;
    contenedor.appendChild(div);
  });
}

function editarProducto(i) {
  const prod = productos[i];
  const nombre = prompt("Nombre del producto:", prod.Producto);
  const precio = prompt("Precio del producto:", prod.PrecioLista);
  const porcentaje = prompt("Porcentaje de aumento:", prod.PorcentajeAumento);

  if (nombre && precio) {
    productos[i].Producto = nombre;
    productos[i].PrecioLista = parseFloat(precio);
    productos[i].PorcentajeAumento = parseFloat(porcentaje) || 0;

    // Guardar los productos actualizados en localStorage
    localStorage.setItem('productos', JSON.stringify(productos));

    cargarProductos();
  }
}

function agregarAlCarrito(i) {
  const prod = productos[i];
  const precioConAumento = prod.PorcentajeAumento ? prod.PrecioLista * (1 + prod.PorcentajeAumento / 100) : prod.PrecioLista;

  const productoFinal = {
    nombre: prod.Producto,
    precio: precioConAumento,
    cantidad: 1
  };

  const item = carrito.find(p => p.nombre === prod.Producto);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push(productoFinal);
  }
  alert(`Producto "${prod.Producto}" agregado al carrito.`);
}

function agregarAPedido(i) {
  const prod = productos[i];
  alert(`Producto "${prod.Producto}" agregado al pedido.`);
  // Aquí puedes agregar la lógica para manejar el pedido
}

document.getElementById('toggle-cart').addEventListener('click', function() {
  const carritoDiv = document.querySelector('.carrito');
  carritoDiv.style.display = carritoDiv.style.display === 'none' ? 'block' : 'none';
  mostrarCarrito();
});

function mostrarCarrito() {
  const contenedor = document.querySelector('.carrito');
  contenedor.innerHTML = '<h3>Carrito</h3>';
  carrito.forEach((prod, index) => {
    const div = document.createElement('div');
    div.innerHTML = `${prod.nombre} - $${prod.precio.toFixed(2)} x${prod.cantidad} <button onclick="eliminarProductoCarrito(${index})">❌</button>`;
    contenedor.appendChild(div);
  });
}

function eliminarProductoCarrito(index) {
  carrito.splice(index, 1);
  mostrarCarrito();
}
