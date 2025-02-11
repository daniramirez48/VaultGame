const { exec } = require('child_process');
const fs = require('fs');

const keyPath = 'key.pem';
const certPath = 'cert.pem';

// Generar clave privada
exec(`openssl genpkey -algorithm RSA -out ${keyPath}`, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error al generar la clave privada: ${stderr}`);
    return;
  }
  console.log('Clave privada generada correctamente.');

  // Generar certificado
  exec(`openssl req -x509 -key ${keyPath} -out ${certPath} -days 365 -subj "/C=ES/ST=País Vasco/L=Ataún/O=MiOrganización/OU=MiUnidad/CN=localhost/emailAddress=tuemail@ejemplo.com"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error al generar el certificado: ${stderr}`);
      return;
    }
    console.log('Certificado generado correctamente.');
  });
});
