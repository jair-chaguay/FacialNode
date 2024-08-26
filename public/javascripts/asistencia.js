usuario = document.getElementById('idUsuario');
let currentUserId = null;

function openFaceRecognition(userId) {
  currentUserId = userId; // Guardar el ID del usuario para usarlo cuando se confirme la asistencia
  document.getElementById('videoModal').style.display = 'flex';

  // Iniciar la captura de video usando getUserMedia
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.getElementById('video');
      video.srcObject = stream;
      video.play();
    })
    .catch(error => {
      console.error('Error accessing media devices.', error);
      alert('No se pudo acceder a la cámara.');
    });
}

function closeVideoModal() {
  document.getElementById('videoModal').style.display = 'none';

  // Detener la transmisión de video al cerrar el modal
  const video = document.getElementById('video');
  const stream = video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  }
}

function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detener el video después de capturar la imagen
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }

      const imageBlob = canvas.toDataURL('image/jpeg');
      const base64Data = imageBlob.replace(/^data:image\/jpeg;base64,/, '');

      const userId = currentUserId;
      if (!userId || !base64Data) {
        console.error('Faltan datos para enviar.');
        return;
      }

      fetch('http://localhost:3000/asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBlob: base64Data, userId })
      })
        .then(response => response.json())
        .then(result => {
          console.log(result);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else {
      console.error('El video no está listo para capturar.');
    }
  }


  function showNotification(message, isSuccess) {
    // Mostrar la notificación en la parte superior de la página
    const notificationContainer = document.getElementById('notificationContainer');
    notificationContainer.textContent = message;
    notificationContainer.style.backgroundColor = isSuccess ? 'green' : 'red'; // Color del mensaje basado en el éxito o error
    notificationContainer.style.display = 'block';
  
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      notificationContainer.style.display = 'none';
    }, 3000);
  }
