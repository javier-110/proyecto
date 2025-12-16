/*
SQLyog Ultimate v9.02 
MySQL - 5.5.5-10.4.32-MariaDB : Database - cotizacion
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`cotizacion` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;

USE `cotizacion`;

/*Table structure for table `auth_group` */

DROP TABLE IF EXISTS `auth_group`;

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `auth_group` */

LOCK TABLES `auth_group` WRITE;

UNLOCK TABLES;

/*Table structure for table `auth_group_permissions` */

DROP TABLE IF EXISTS `auth_group_permissions`;

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `auth_group_permissions` */

LOCK TABLES `auth_group_permissions` WRITE;

UNLOCK TABLES;

/*Table structure for table `auth_permission` */

DROP TABLE IF EXISTS `auth_permission`;

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `auth_permission` */

LOCK TABLES `auth_permission` WRITE;

insert  into `auth_permission`(`id`,`name`,`content_type_id`,`codename`) values (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add user',6,'add_usuario'),(22,'Can change user',6,'change_usuario'),(23,'Can delete user',6,'delete_usuario'),(24,'Can view user',6,'view_usuario'),(25,'Can add cliente',7,'add_cliente'),(26,'Can change cliente',7,'change_cliente'),(27,'Can delete cliente',7,'delete_cliente'),(28,'Can view cliente',7,'view_cliente'),(29,'Can add cotizacion',8,'add_cotizacion'),(30,'Can change cotizacion',8,'change_cotizacion'),(31,'Can delete cotizacion',8,'delete_cotizacion'),(32,'Can view cotizacion',8,'view_cotizacion'),(33,'Can add empresa',9,'add_empresa'),(34,'Can change empresa',9,'change_empresa'),(35,'Can delete empresa',9,'delete_empresa'),(36,'Can view empresa',9,'view_empresa'),(37,'Can add producto',10,'add_producto'),(38,'Can change producto',10,'change_producto'),(39,'Can delete producto',10,'delete_producto'),(40,'Can view producto',10,'view_producto'),(41,'Can add detalle cotizacion',11,'add_detallecotizacion'),(42,'Can change detalle cotizacion',11,'change_detallecotizacion'),(43,'Can delete detalle cotizacion',11,'delete_detallecotizacion'),(44,'Can view detalle cotizacion',11,'view_detallecotizacion'),(45,'Can add trabajador',12,'add_trabajador'),(46,'Can change trabajador',12,'change_trabajador'),(47,'Can delete trabajador',12,'delete_trabajador'),(48,'Can view trabajador',12,'view_trabajador'),(49,'Can add historial promocion',13,'add_historialpromocion'),(50,'Can change historial promocion',13,'change_historialpromocion'),(51,'Can delete historial promocion',13,'delete_historialpromocion'),(52,'Can view historial promocion',13,'view_historialpromocion');

UNLOCK TABLES;

/*Table structure for table `django_admin_log` */

DROP TABLE IF EXISTS `django_admin_log`;

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_gestion_usuario_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_gestion_usuario_id` FOREIGN KEY (`user_id`) REFERENCES `gestion_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `django_admin_log` */

LOCK TABLES `django_admin_log` WRITE;

UNLOCK TABLES;

/*Table structure for table `django_content_type` */

DROP TABLE IF EXISTS `django_content_type`;

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `django_content_type` */

LOCK TABLES `django_content_type` WRITE;

insert  into `django_content_type`(`id`,`app_label`,`model`) values (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'contenttypes','contenttype'),(7,'gestion','cliente'),(8,'gestion','cotizacion'),(11,'gestion','detallecotizacion'),(9,'gestion','empresa'),(13,'gestion','historialpromocion'),(10,'gestion','producto'),(12,'gestion','trabajador'),(6,'gestion','usuario'),(5,'sessions','session');

UNLOCK TABLES;

/*Table structure for table `django_migrations` */

DROP TABLE IF EXISTS `django_migrations`;

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `django_migrations` */

LOCK TABLES `django_migrations` WRITE;

insert  into `django_migrations`(`id`,`app`,`name`,`applied`) values (1,'contenttypes','0001_initial','2025-12-03 23:30:10.585507'),(2,'contenttypes','0002_remove_content_type_name','2025-12-03 23:30:10.644822'),(3,'auth','0001_initial','2025-12-03 23:30:10.832540'),(4,'auth','0002_alter_permission_name_max_length','2025-12-03 23:30:10.875256'),(5,'auth','0003_alter_user_email_max_length','2025-12-03 23:30:10.881476'),(6,'auth','0004_alter_user_username_opts','2025-12-03 23:30:10.885649'),(7,'auth','0005_alter_user_last_login_null','2025-12-03 23:30:10.889587'),(8,'auth','0006_require_contenttypes_0002','2025-12-03 23:30:10.892592'),(9,'auth','0007_alter_validators_add_error_messages','2025-12-03 23:30:10.897153'),(10,'auth','0008_alter_user_username_max_length','2025-12-03 23:30:10.901741'),(11,'auth','0009_alter_user_last_name_max_length','2025-12-03 23:30:10.905205'),(12,'auth','0010_alter_group_name_max_length','2025-12-03 23:30:10.951745'),(13,'auth','0011_update_proxy_permissions','2025-12-03 23:30:10.956475'),(14,'auth','0012_alter_user_first_name_max_length','2025-12-03 23:30:10.961577'),(15,'gestion','0001_initial','2025-12-03 23:30:11.693850'),(16,'admin','0001_initial','2025-12-03 23:30:11.791209'),(17,'admin','0002_logentry_remove_auto_add','2025-12-03 23:30:11.796977'),(18,'admin','0003_logentry_add_action_flag_choices','2025-12-03 23:30:11.802760'),(19,'gestion','0002_producto_impuesto_producto_marca','2025-12-03 23:30:11.824091'),(20,'gestion','0003_usuario_codigo_temporal','2025-12-03 23:30:11.834502'),(21,'gestion','0004_empresa_impuesto_defecto','2025-12-03 23:30:11.846903'),(22,'gestion','0005_trabajador','2025-12-03 23:30:11.959805'),(23,'gestion','0006_empresa_codigo_validacion_empresa_validado_and_more','2025-12-03 23:30:12.060837'),(24,'gestion','0007_producto_precio_oferta_producto_tiene_oferta','2025-12-03 23:30:12.080910'),(25,'gestion','0008_producto_oferta_fin_producto_oferta_inicio_and_more','2025-12-03 23:30:12.105593'),(26,'gestion','0009_empresa_descuento_fidelizacion_and_more','2025-12-03 23:30:12.149434'),(27,'gestion','0010_producto_impuesto_especifico','2025-12-03 23:30:12.161479'),(28,'gestion','0011_producto_sku','2025-12-03 23:30:12.198092'),(29,'gestion','0012_cotizacion_numero_cotizacion','2025-12-03 23:30:12.206453'),(30,'sessions','0001_initial','2025-12-03 23:30:12.290520'),(31,'gestion','0013_empresa_logo','2025-12-05 19:35:34.503261'),(32,'gestion','0014_empresa_color_boton_principal_and_more','2025-12-05 21:37:36.428115'),(33,'gestion','0015_empresa_color_borde','2025-12-05 21:55:53.827296'),(34,'gestion','0016_remove_trabajador_telefono_and_more','2025-12-08 17:11:30.658195'),(35,'gestion','0017_empresa_dias_inicio_fidelizacion_and_more','2025-12-08 17:45:05.868875');

UNLOCK TABLES;

/*Table structure for table `django_session` */

DROP TABLE IF EXISTS `django_session`;

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `django_session` */

LOCK TABLES `django_session` WRITE;

UNLOCK TABLES;

/*Table structure for table `gestion_cliente` */

DROP TABLE IF EXISTS `gestion_cliente`;

CREATE TABLE `gestion_cliente` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rut` varchar(20) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(254) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL,
  `empresa_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `gestion_cliente_empresa_id_ab0e4a86_fk_gestion_empresa_id` (`empresa_id`),
  CONSTRAINT `gestion_cliente_empresa_id_ab0e4a86_fk_gestion_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `gestion_empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_cliente` */

LOCK TABLES `gestion_cliente` WRITE;

insert  into `gestion_cliente`(`id`,`rut`,`nombre`,`email`,`telefono`,`creado_en`,`empresa_id`) values (2,'16543456-k','javier','javier.hermosilla06@inacapmail.cl','1234234236','2025-12-05 16:06:52.142380',1),(3,'16543456-k','javier HERMOSILLA','hermosillajavier404@gmail.com','1234234236','2025-12-05 20:31:29.638135',2),(4,'16543456-8','FSDFSA','hermosillajavier13@gmail.com','1234234236','2025-12-08 18:02:14.222353',1);

UNLOCK TABLES;

/*Table structure for table `gestion_cotizacion` */

DROP TABLE IF EXISTS `gestion_cotizacion`;

CREATE TABLE `gestion_cotizacion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha` datetime(6) NOT NULL,
  `estado` varchar(10) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `empresa_id` bigint(20) NOT NULL,
  `trabajador_id` bigint(20) DEFAULT NULL,
  `numero_cotizacion` int(10) unsigned DEFAULT NULL CHECK (`numero_cotizacion` >= 0),
  PRIMARY KEY (`id`),
  KEY `gestion_cotizacion_empresa_id_1996ad87_fk_gestion_empresa_id` (`empresa_id`),
  KEY `gestion_cotizacion_trabajador_id_d946110e_fk_gestion_usuario_id` (`trabajador_id`),
  KEY `gestion_cotizacion_cliente_id_dc41fc41_fk_gestion_cliente_id` (`cliente_id`),
  CONSTRAINT `gestion_cotizacion_cliente_id_dc41fc41_fk_gestion_cliente_id` FOREIGN KEY (`cliente_id`) REFERENCES `gestion_cliente` (`id`),
  CONSTRAINT `gestion_cotizacion_empresa_id_1996ad87_fk_gestion_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `gestion_empresa` (`id`),
  CONSTRAINT `gestion_cotizacion_trabajador_id_d946110e_fk_gestion_usuario_id` FOREIGN KEY (`trabajador_id`) REFERENCES `gestion_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_cotizacion` */

LOCK TABLES `gestion_cotizacion` WRITE;

insert  into `gestion_cotizacion`(`id`,`fecha`,`estado`,`total`,`descuento`,`cliente_id`,`empresa_id`,`trabajador_id`,`numero_cotizacion`) values (3,'2025-12-05 20:31:29.640908','BORRADOR','499999.00','0.00',3,2,3,1),(8,'2025-12-08 17:05:46.476056','ACEPTADA','1000.00','0.00',2,1,2,4),(9,'2025-12-08 17:59:21.901135','BORRADOR','328004.00','0.00',3,2,3,2),(10,'2025-12-08 18:02:14.228239','ACEPTADA','416500.00','0.00',4,1,2,5),(11,'2025-12-10 19:20:06.577751','ACEPTADA','71400.00','0.00',2,1,2,6);

UNLOCK TABLES;

/*Table structure for table `gestion_detallecotizacion` */

DROP TABLE IF EXISTS `gestion_detallecotizacion`;

CREATE TABLE `gestion_detallecotizacion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(10) unsigned NOT NULL CHECK (`cantidad` >= 0),
  `precio` decimal(12,2) NOT NULL,
  `cotizacion_id` bigint(20) NOT NULL,
  `producto_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gestion_detallecotiz_cotizacion_id_d85d2aba_fk_gestion_c` (`cotizacion_id`),
  KEY `gestion_detallecotiz_producto_id_8ebad677_fk_gestion_p` (`producto_id`),
  CONSTRAINT `gestion_detallecotiz_cotizacion_id_d85d2aba_fk_gestion_c` FOREIGN KEY (`cotizacion_id`) REFERENCES `gestion_cotizacion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_detallecotizacion` */

LOCK TABLES `gestion_detallecotizacion` WRITE;

insert  into `gestion_detallecotizacion`(`id`,`cantidad`,`precio`,`cotizacion_id`,`producto_id`) values (3,1,'420167.23',3,NULL),(8,1,'840.34',8,1),(9,1,'275633.61',9,23),(10,1,'350000.00',10,10),(11,1,'60000.00',11,11);

UNLOCK TABLES;

/*Table structure for table `gestion_empresa` */

DROP TABLE IF EXISTS `gestion_empresa`;

CREATE TABLE `gestion_empresa` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rut` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL,
  `impuesto_defecto` decimal(5,2) NOT NULL,
  `codigo_validacion` varchar(6) DEFAULT NULL,
  `validado` tinyint(1) NOT NULL,
  `whatsapp_account_sid` varchar(100) DEFAULT NULL,
  `whatsapp_auth_token` varchar(100) DEFAULT NULL,
  `whatsapp_enabled` tinyint(1) NOT NULL,
  `whatsapp_from_number` varchar(20) DEFAULT NULL,
  `whatsapp_provider` varchar(50) DEFAULT NULL,
  `descuento_fidelizacion` decimal(5,2) NOT NULL,
  `dias_para_fidelizacion` int(11) NOT NULL,
  `fidelizacion_activa` tinyint(1) NOT NULL,
  `mensaje_fidelizacion` longtext NOT NULL,
  `logo` varchar(100) DEFAULT NULL,
  `color_boton_principal` varchar(20) NOT NULL,
  `color_fondo_pagina` varchar(20) NOT NULL,
  `color_menu_sidebar` varchar(20) NOT NULL,
  `color_texto_principal` varchar(20) NOT NULL,
  `color_texto_secundario` varchar(20) NOT NULL,
  `color_borde` varchar(50) NOT NULL,
  `dias_inicio_fidelizacion` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rut` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_empresa` */

LOCK TABLES `gestion_empresa` WRITE;

insert  into `gestion_empresa`(`id`,`rut`,`nombre`,`direccion`,`telefono`,`email`,`creado_en`,`impuesto_defecto`,`codigo_validacion`,`validado`,`whatsapp_account_sid`,`whatsapp_auth_token`,`whatsapp_enabled`,`whatsapp_from_number`,`whatsapp_provider`,`descuento_fidelizacion`,`dias_para_fidelizacion`,`fidelizacion_activa`,`mensaje_fidelizacion`,`logo`,`color_boton_principal`,`color_fondo_pagina`,`color_menu_sidebar`,`color_texto_principal`,`color_texto_secundario`,`color_borde`,`dias_inicio_fidelizacion`) values (1,'62459856-k','empresa1','los alerces, lolol, chile','1964784651','empresa@gmail.com','2025-12-03 23:36:08.079197','19.00',NULL,0,NULL,NULL,0,NULL,NULL,'5.00',15,1,'SOLO POR ESTA SEMANA','company_logos/OIP_qovQKRX.webp','#1ff438','#270e62','#683131','#ffffff','#b3b3b3','rgba(255, 255, 255, 0.1)',7),(2,'62489856-k','empresa2','santiago, chile','487945652','empresa2@gmail.com','2025-12-05 16:04:16.681417','19.00',NULL,0,NULL,NULL,0,NULL,NULL,'5.00',15,1,'Te extrañamos. Aquí tienes un descuento especial para tu próxima compra.','company_logos/OIP_1_zi32iZS.webp','#4dff00','#2ed6cb','#b3b521','#5b5252','#000000','#ff0000',7),(3,'16543456-k','SDFDS','CXSV','876','hermosillajavier404@gmail.com','2025-12-08 22:26:09.434057','19.00',NULL,0,NULL,NULL,0,NULL,NULL,'5.00',30,0,'Te extrañamos. Aquí tienes un descuento especial para tu próxima compra.','','#646cff','#121212','#1e1e1e','#ffffff','#b3b3b3','rgba(255, 255, 255, 0.1)',7);

UNLOCK TABLES;

/*Table structure for table `gestion_historialpromocion` */

DROP TABLE IF EXISTS `gestion_historialpromocion`;

CREATE TABLE `gestion_historialpromocion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha_envio` datetime(6) NOT NULL,
  `descuento_ofrecido` decimal(5,2) NOT NULL,
  `mensaje_enviado` longtext NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `empresa_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `gestion_historialpro_cliente_id_26837a06_fk_gestion_c` (`cliente_id`),
  KEY `gestion_historialpro_empresa_id_6c864695_fk_gestion_e` (`empresa_id`),
  CONSTRAINT `gestion_historialpro_cliente_id_26837a06_fk_gestion_c` FOREIGN KEY (`cliente_id`) REFERENCES `gestion_cliente` (`id`),
  CONSTRAINT `gestion_historialpro_empresa_id_6c864695_fk_gestion_e` FOREIGN KEY (`empresa_id`) REFERENCES `gestion_empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_historialpromocion` */

LOCK TABLES `gestion_historialpromocion` WRITE;

insert  into `gestion_historialpromocion`(`id`,`fecha_envio`,`descuento_ofrecido`,`mensaje_enviado`,`cliente_id`,`empresa_id`) values (1,'2025-12-08 17:12:37.829374','5.00','\nHola javier,\n\nfsdsd\n\nComo agradecimiento, te ofrecemos un descuento del 5.00% en tu próxima cotización.\n\n¡Esperamos verte pronto!\n\nAtentamente,\nEl equipo de empresa1\n        ',2,1),(2,'2025-12-08 17:21:55.338001','5.00','Oferta Disco SSD 1TB - 5% OFF',2,1),(3,'2025-12-08 17:22:51.612981','5.00','Oferta Disco SSD 1TB - 5% OFF',2,1),(4,'2025-12-08 17:29:25.011608','5.00','Oferta Webcam HD - 5% OFF',2,1),(5,'2025-12-08 17:34:30.499466','5.00','Oferta Mouse Inalámbrico - 5% OFF',2,1),(6,'2025-12-08 17:49:11.841330','5.00','Oferta pan - 5% OFF',2,1),(7,'2025-12-08 17:49:29.475408','5.00','Oferta Silla Ergonómica - 5% OFF',2,1),(8,'2025-12-08 17:53:44.178161','5.00','Oferta Auriculares Bluetooth - 5% OFF',2,1),(9,'2025-12-08 17:59:49.401024','5.00','Oferta Memoria RAM 16GB - 5% OFF',2,1),(10,'2025-12-08 17:59:51.617802','5.00','Oferta Webcam 4K 975 - 5% OFF',3,2),(11,'2025-12-08 18:00:08.835690','5.00','Oferta pan - 5% OFF',2,1),(12,'2025-12-08 18:00:11.395951','5.00','Oferta Mouse Optico 353 - 5% OFF',3,2),(13,'2025-12-08 18:00:28.528967','5.00','Oferta Memoria RAM 16GB - 5% OFF',2,1),(14,'2025-12-08 18:00:30.646370','5.00','Oferta Audifonos 190 - 5% OFF',3,2),(15,'2025-12-08 18:00:47.980316','5.00','Oferta Silla Ergonómica - 5% OFF',2,1),(16,'2025-12-08 18:00:50.019378','5.00','Oferta Microfono USB 286 - 5% OFF',3,2),(17,'2025-12-08 18:01:07.368164','5.00','Oferta bencina - 5% OFF',2,1),(18,'2025-12-08 18:01:09.596594','5.00','Oferta Escritorio 135 - 5% OFF',3,2),(19,'2025-12-08 18:02:58.531366','5.00','Oferta Webcam HD - 5% OFF',2,1),(20,'2025-12-08 18:03:00.805097','5.00','Oferta Escritorio Altura Ajustable - 5% OFF',4,1),(21,'2025-12-08 18:03:04.536972','5.00','Oferta Monitor 144Hz 354 - 5% OFF',3,2),(22,'2025-12-08 18:03:18.435902','5.00','Oferta Disco SSD 1TB - 5% OFF',2,1),(23,'2025-12-08 18:03:28.682398','5.00','Oferta Disco SSD 1TB - 5% OFF',4,1),(24,'2025-12-08 18:03:31.343665','5.00','Oferta Webcam 4K 975 - 5% OFF',3,2),(25,'2025-12-08 18:03:38.797827','5.00','Oferta Escritorio Altura Ajustable - 5% OFF',2,1),(26,'2025-12-08 18:03:46.089335','5.00','Oferta Auriculares Bluetooth - 5% OFF',4,1);

UNLOCK TABLES;

/*Table structure for table `gestion_producto` */

DROP TABLE IF EXISTS `gestion_producto`;

CREATE TABLE `gestion_producto` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` longtext DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `stock` int(11) NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `empresa_id` bigint(20) NOT NULL,
  `impuesto` decimal(5,2) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `precio_oferta` decimal(10,2) DEFAULT NULL,
  `tiene_oferta` tinyint(1) NOT NULL,
  `oferta_fin` datetime(6) DEFAULT NULL,
  `oferta_inicio` datetime(6) DEFAULT NULL,
  `oferta_porcentaje` decimal(5,2) DEFAULT NULL,
  `impuesto_especifico` decimal(10,2) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `gestion_producto_empresa_id_6e7ee6d5_fk_gestion_empresa_id` (`empresa_id`),
  CONSTRAINT `gestion_producto_empresa_id_6e7ee6d5_fk_gestion_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `gestion_empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_producto` */

LOCK TABLES `gestion_producto` WRITE;

insert  into `gestion_producto`(`id`,`nombre`,`descripcion`,`precio`,`categoria`,`stock`,`creado_en`,`empresa_id`,`impuesto`,`marca`,`precio_oferta`,`tiene_oferta`,`oferta_fin`,`oferta_inicio`,`oferta_porcentaje`,`impuesto_especifico`,`sku`) values (1,'pan','asdsad','1680.67','',12,'2025-12-03 23:38:10.196916',1,'19.00','ideal','840.00',1,'2025-12-12 16:05:11.701000','2025-12-05 16:05:11.701000','50.00','0.00','PAN-IDE-6145'),(2,'bencina','','840.34','',4,'2025-12-05 15:37:14.488149',1,'19.00','copec','672.00',1,'2025-12-12 15:37:24.167000','2025-12-05 15:37:24.167000','20.00','10.00','BEN-COP-8732'),(4,'RYZEN 6','','420168.07','',0,'2025-12-05 20:33:40.106129',2,'19.00','amd',NULL,0,NULL,NULL,NULL,'0.00','RYZ-AMD-9733'),(5,'Laptop Gamer','Descripción de prueba para Laptop Gamer','1500000.00','Computación',23,'2025-12-05 21:01:01.328386',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','LAP-GEN-8999'),(6,'Mouse Inalámbrico','Descripción de prueba para Mouse Inalámbrico','25000.00','Accesorios',58,'2025-12-05 21:01:01.332407',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','MOU-GEN-2925'),(7,'Teclado Mecánico','Descripción de prueba para Teclado Mecánico','80000.00','Accesorios',57,'2025-12-05 21:01:01.338981',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','TEC-GEN-9198'),(8,'Monitor 24 pulgadas','Descripción de prueba para Monitor 24 pulgadas','120000.00','Pantallas',78,'2025-12-05 21:01:01.342736',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','MON-GEN-7607'),(9,'Silla Ergonómica','Descripción de prueba para Silla Ergonómica','200000.00','Mobiliario',69,'2025-12-05 21:01:01.346746',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','SIL-GEN-5471'),(10,'Escritorio Altura Ajustable','Descripción de prueba para Escritorio Altura Ajustable','350000.00','Mobiliario',30,'2025-12-05 21:01:01.351258',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','ESC-GEN-4475'),(11,'Auriculares Bluetooth','Descripción de prueba para Auriculares Bluetooth','60000.00','Audio',72,'2025-12-05 21:01:01.356319',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','AUR-GEN-9050'),(12,'Webcam HD','Descripción de prueba para Webcam HD','45000.00','Periféricos',23,'2025-12-05 21:01:01.360461',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','WEB-GEN-6301'),(13,'Disco SSD 1TB','Descripción de prueba para Disco SSD 1TB','90000.00','Almacenamiento',52,'2025-12-05 21:01:01.368600',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','DIS-GEN-9660'),(14,'Memoria RAM 16GB','Descripción de prueba para Memoria RAM 16GB','75000.00','Componentes',47,'2025-12-05 21:01:01.372984',1,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','MEM-GEN-8315'),(15,'Silla Gamer 551','Producto generado aleatoriamente','271163.00',NULL,43,'2025-12-08 17:56:19.319167',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00','SIL-GEN-3879'),(16,'Teclado RGB 897','Producto generado aleatoriamente','292221.00',NULL,6,'2025-12-08 17:56:19.322733',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(17,'Mouse Optico 353','Producto generado aleatoriamente','119677.00',NULL,27,'2025-12-08 17:56:19.326737',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(18,'Monitor 144Hz 354','Producto generado aleatoriamente','209755.00',NULL,7,'2025-12-08 17:56:19.330736',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(19,'Escritorio 135','Producto generado aleatoriamente','393026.00',NULL,47,'2025-12-08 17:56:19.336802',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(20,'Audifonos 190','Producto generado aleatoriamente','224620.00',NULL,33,'2025-12-08 17:56:19.339801',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(21,'Webcam 4K 975','Producto generado aleatoriamente','36417.00',NULL,8,'2025-12-08 17:56:19.342814',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(22,'Microfono USB 286','Producto generado aleatoriamente','272841.00',NULL,40,'2025-12-08 17:56:19.346268',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(23,'Mousepad XXL 545','Producto generado aleatoriamente','275634.00',NULL,39,'2025-12-08 17:56:19.349773',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL),(24,'Soporte Monitor 436','Producto generado aleatoriamente','319038.00',NULL,22,'2025-12-08 17:56:19.356937',2,'19.00',NULL,NULL,0,NULL,NULL,NULL,'0.00',NULL);

UNLOCK TABLES;

/*Table structure for table `gestion_trabajador` */

DROP TABLE IF EXISTS `gestion_trabajador`;

CREATE TABLE `gestion_trabajador` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  KEY `gestion_trabajador_empresa_id_01ec1a3d_fk_gestion_empresa_id` (`empresa_id`),
  CONSTRAINT `gestion_trabajador_empresa_id_01ec1a3d_fk_gestion_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `gestion_empresa` (`id`),
  CONSTRAINT `gestion_trabajador_usuario_id_5b2bb12f_fk_gestion_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `gestion_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_trabajador` */

LOCK TABLES `gestion_trabajador` WRITE;

insert  into `gestion_trabajador`(`id`,`empresa_id`,`usuario_id`) values (1,1,4),(2,2,5);

UNLOCK TABLES;

/*Table structure for table `gestion_usuario` */

DROP TABLE IF EXISTS `gestion_usuario`;

CREATE TABLE `gestion_usuario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `rol` varchar(10) NOT NULL,
  `empresa_id` bigint(20) DEFAULT NULL,
  `codigo_temporal` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `gestion_usuario_empresa_id_90059fbc_fk_gestion_empresa_id` (`empresa_id`),
  CONSTRAINT `gestion_usuario_empresa_id_90059fbc_fk_gestion_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `gestion_empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_usuario` */

LOCK TABLES `gestion_usuario` WRITE;

insert  into `gestion_usuario`(`id`,`password`,`last_login`,`is_superuser`,`username`,`first_name`,`last_name`,`email`,`is_staff`,`is_active`,`date_joined`,`rol`,`empresa_id`,`codigo_temporal`) values (1,'pbkdf2_sha256$600000$16e8oCbG7R5c3KKkexU96b$hInO2k2zPZaRuOIxoGWE2tLtiKIjD0nZvaJ1sDnqQr8=',NULL,1,'javier','','','javier@gmail.com',1,1,'2025-12-03 23:31:22.524027','ADMIN',NULL,NULL),(2,'pbkdf2_sha256$600000$umReEusYh3ZuNifPQNO6UW$ftQYt/4Vf+/v4gIkBFG4KSQ8dJ9zMy/fs+7+jWnpBHc=',NULL,0,'empresa@gmail.com','','','empresa@gmail.com',0,1,'2025-12-03 23:35:29.875976','EMPRESA',1,NULL),(3,'pbkdf2_sha256$600000$f9rKCASKhtVoalYYdHAUvt$2IN5pjhdDAcaqw7co1tYTLHXx1m6znJLU1cEwjNuF48=',NULL,0,'empresa2@gmail.com','','','empresa2@gmail.com',0,1,'2025-12-05 16:03:21.755060','EMPRESA',2,NULL),(4,'pbkdf2_sha256$600000$TTgQ2MAsVTqaA9tzzNYEgt$SgDhtmNXLBKnvOt9fpknf8uGJB/5eVZ/8SDchu/7QuI=',NULL,0,'trabajador1','','','trabajador1@gmail.com',0,1,'2025-12-05 16:05:37.923846','TRABAJADOR',1,NULL),(5,'pbkdf2_sha256$600000$NNAdMJoJBRAALUlgzzS6Oc$JSLa6wVlYZPREJVhQbaqpMJCjrTDPpCdXD0BzwjQIYA=',NULL,0,'trabajador2','','','trabajador2@gmail.com',0,1,'2025-12-08 18:07:41.893717','TRABAJADOR',2,NULL),(6,'pbkdf2_sha256$600000$gdMmZNQ03zI8rIU2x0Urd9$+NBgtB4ov3l/3mHFAY9iQpAVcLquxzrmJZNwSX9FbkI=',NULL,0,'hermosillajavier404@gmail.com','','','hermosillajavier404@gmail.com',0,1,'2025-12-08 22:25:41.618980','EMPRESA',3,NULL),(7,'pbkdf2_sha256$600000$6HPODdyRea7bQqe6rKhGb3$91dOvmgEJWBghvhzL2UX7Lc+pZsYoc+zBMd/dDN6B3o=',NULL,0,'stress_test_user','','','stress@test.com',0,1,'2025-12-09 18:38:47.852654','ADMIN',NULL,NULL);

UNLOCK TABLES;

/*Table structure for table `gestion_usuario_groups` */

DROP TABLE IF EXISTS `gestion_usuario_groups`;

CREATE TABLE `gestion_usuario_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gestion_usuario_groups_usuario_id_group_id_274a8e9b_uniq` (`usuario_id`,`group_id`),
  KEY `gestion_usuario_groups_group_id_52d196ce_fk_auth_group_id` (`group_id`),
  CONSTRAINT `gestion_usuario_groups_group_id_52d196ce_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `gestion_usuario_groups_usuario_id_bd725e78_fk_gestion_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `gestion_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_usuario_groups` */

LOCK TABLES `gestion_usuario_groups` WRITE;

UNLOCK TABLES;

/*Table structure for table `gestion_usuario_user_permissions` */

DROP TABLE IF EXISTS `gestion_usuario_user_permissions`;

CREATE TABLE `gestion_usuario_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gestion_usuario_user_per_usuario_id_permission_id_1e2e2f70_uniq` (`usuario_id`,`permission_id`),
  KEY `gestion_usuario_user_permission_id_f64c6062_fk_auth_perm` (`permission_id`),
  CONSTRAINT `gestion_usuario_user_permission_id_f64c6062_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `gestion_usuario_user_usuario_id_621a00b7_fk_gestion_u` FOREIGN KEY (`usuario_id`) REFERENCES `gestion_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `gestion_usuario_user_permissions` */

LOCK TABLES `gestion_usuario_user_permissions` WRITE;

UNLOCK TABLES;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
