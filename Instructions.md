Para poder usar el proyecto de mejor manera necesitara los querys realizados en la base de datos para esto necesitara configurar una base de datos de manera local con estos querys
drop database proyecto;
Create database proyecto;
use proyecto;

create table users (
idUser int primary key auto_increment,
username varchar(30) not null,
name varchar(50) not null,
lastName varchar(50) not null,
password varchar(255) not null
);

create table roles(
idrole int Primary key auto_increment,
name varchar(20)
);

create table users_roles(
idusers_roles int primary key auto_increment,
users_iduser int not null,
roles_idrole int not null,
foreign key (users_iduser) references users (idUser),
foreign key (roles_idrole) references roles (idrole)
);

CREATE TABLE user_images (
  idImage INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  imagePath VARCHAR(255) NOT NULL,      -- Ruta de la imagen
  faceDescriptor JSON NOT NULL,         -- Descriptores faciales (almacenados como BLOB)/XML
  FOREIGN KEY (userId) REFERENCES users(idUser)
);


CREATE TABLE asistencia (
  idAsistencia INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  entryDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de entrada
  FOREIGN KEY (userId) REFERENCES users(idUser)
);


INSERT INTO `roles` VALUES (1,'admin'),(2,'user');



Después de esto configurar todas las dependencias en el sistema
