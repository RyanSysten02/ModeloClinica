CREATE DATABASE  IF NOT EXISTS `backend` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `backend`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: backend
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agendamento_aula`
--

DROP TABLE IF EXISTS `agendamento_aula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamento_aula` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_turma` int NOT NULL,
  `id_func_responsavel` int NOT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `desc` text,
  `color` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `status` enum('P','C','AD') DEFAULT 'P',
  `dh_cancelamento` datetime DEFAULT NULL,
  `motivocancelamento` text,
  `dh_adiamento` datetime DEFAULT NULL,
  `motivo_adiamento` text,
  `lote_agendamento` int DEFAULT NULL,
  `dh_inclusao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_inclusao` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_agendamento_professor` (`id_func_responsavel`),
  CONSTRAINT `fk_agendamento_professor` FOREIGN KEY (`id_func_responsavel`) REFERENCES `professor` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamento_aula`
--

LOCK TABLES `agendamento_aula` WRITE;
/*!40000 ALTER TABLE `agendamento_aula` DISABLE KEYS */;
/*!40000 ALTER TABLE `agendamento_aula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aluno`
--

DROP TABLE IF EXISTS `aluno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aluno` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` char(11) NOT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `dataNascimento` date DEFAULT NULL,
  `sexo` enum('Masculino','Feminino','Outro') DEFAULT NULL,
  `numeroBeneficio` varchar(50) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `num` varchar(10) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `celular` varchar(15) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contatoEmergencia` varchar(15) DEFAULT NULL,
  `observacoes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aluno`
--

LOCK TABLES `aluno` WRITE;
/*!40000 ALTER TABLE `aluno` DISABLE KEYS */;
/*!40000 ALTER TABLE `aluno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aluno_turma`
--

DROP TABLE IF EXISTS `aluno_turma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aluno_turma` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula_id` int NOT NULL,
  `turma_id` int NOT NULL,
  `ano_letivo` year NOT NULL,
  `data_alocacao` date NOT NULL,
  `campo_unico` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campo_unico` (`campo_unico`),
  KEY `fk_aluno_turma_turma_idx` (`turma_id`),
  KEY `idx_matricula_id` (`matricula_id`),
  CONSTRAINT `fk_aluno_turma_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matricula` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_aluno_turma_turma` FOREIGN KEY (`turma_id`) REFERENCES `turma` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aluno_turma`
--

LOCK TABLES `aluno_turma` WRITE;
/*!40000 ALTER TABLE `aluno_turma` DISABLE KEYS */;
/*!40000 ALTER TABLE `aluno_turma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atendimento`
--

DROP TABLE IF EXISTS `atendimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atendimento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `status` int NOT NULL,
  `motivo` text NOT NULL,
  `resolucao` text NOT NULL,
  `operador` int NOT NULL,
  `tipo` int NOT NULL,
  `data` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  CONSTRAINT `atendimento_ibfk_1` FOREIGN KEY (`status`) REFERENCES `status_atendimento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atendimento`
--

LOCK TABLES `atendimento` WRITE;
/*!40000 ALTER TABLE `atendimento` DISABLE KEYS */;
/*!40000 ALTER TABLE `atendimento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas`
--

DROP TABLE IF EXISTS `aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_semana` enum('Segunda','Terça','Quarta','Quinta','Sexta') NOT NULL,
  `horario_id` int NOT NULL,
  `turma` varchar(50) NOT NULL,
  `disciplina_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `cor` varchar(7) DEFAULT NULL,
  `dh_inclusao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_aula` (`dia_semana`,`horario_id`,`turma`),
  KEY `idx_prof` (`professor_id`),
  KEY `idx_disc` (`disciplina_id`),
  KEY `fk_aula_horario` (`horario_id`),
  CONSTRAINT `fk_aula_disc` FOREIGN KEY (`disciplina_id`) REFERENCES `disciplina` (`id`),
  CONSTRAINT `fk_aula_horario` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`),
  CONSTRAINT `fk_aula_prof` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=856 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas`
--

LOCK TABLES `aulas` WRITE;
/*!40000 ALTER TABLE `aulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas_historico`
--

DROP TABLE IF EXISTS `aulas_historico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas_historico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_semana` enum('Segunda','Terça','Quarta','Quinta','Sexta') NOT NULL,
  `snapshot` json NOT NULL,
  `dh_versao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_historico`
--

LOCK TABLES `aulas_historico` WRITE;
/*!40000 ALTER TABLE `aulas_historico` DISABLE KEYS */;
/*!40000 ALTER TABLE `aulas_historico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracao_email`
--

DROP TABLE IF EXISTS `configuracao_email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracao_email` (
  `id` int NOT NULL DEFAULT '1',
  `smtp_host` varchar(255) NOT NULL,
  `smtp_port` int NOT NULL,
  `smtp_user` varchar(255) NOT NULL,
  `smtp_pass` varchar(255) NOT NULL,
  `smtp_secure` tinyint(1) NOT NULL DEFAULT '0',
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `data_alteracao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracao_email`
--

LOCK TABLES `configuracao_email` WRITE;
/*!40000 ALTER TABLE `configuracao_email` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracao_email` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_aluno` varchar(255) NOT NULL,
  `id_func_responsavel` int DEFAULT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `desc` text,
  `color` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `status` enum('P','C','AD') DEFAULT 'P',
  `dh_cancelamento` datetime DEFAULT NULL,
  `motivocancelamento` text,
  `dh_adiamento` datetime DEFAULT NULL,
  `motivo_adiamento` text,
  `lote_agendamento` int DEFAULT NULL,
  `dh_inclusao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_inclusao` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lote_agendamento` (`lote_agendamento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disciplina`
--

DROP TABLE IF EXISTS `disciplina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplina` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `area_conhecimento` varchar(100) DEFAULT NULL COMMENT 'Área geral do conhecimento, ex: Exatas, Humanas, Linguagens',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_UNIQUE` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplina`
--

LOCK TABLES `disciplina` WRITE;
/*!40000 ALTER TABLE `disciplina` DISABLE KEYS */;
/*!40000 ALTER TABLE `disciplina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frequencia`
--

DROP TABLE IF EXISTS `frequencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frequencia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `disciplina_id` int NOT NULL,
  `presente` tinyint(1) NOT NULL DEFAULT '1',
  `data_aula` date NOT NULL,
  `notificacao_status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendente',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cod_usuario_inclusao` int DEFAULT NULL,
  `data_alteracao` timestamp NULL DEFAULT NULL,
  `cod_usuario_alteracao` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_aula_disciplina_unica` (`matricula_id`,`professor_id`,`disciplina_id`,`data_aula`),
  KEY `fk_frequencia_professor` (`professor_id`),
  KEY `fk_frequencia_disciplina` (`disciplina_id`),
  CONSTRAINT `fk_frequencia_disciplina` FOREIGN KEY (`disciplina_id`) REFERENCES `disciplina` (`id`),
  CONSTRAINT `fk_frequencia_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matricula` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_frequencia_professor` FOREIGN KEY (`professor_id`) REFERENCES `professor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8797 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequencia`
--

LOCK TABLES `frequencia` WRITE;
/*!40000 ALTER TABLE `frequencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `frequencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionario`
--

DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `funcao` varchar(50) DEFAULT NULL,
  `habilitacao` varchar(50) DEFAULT NULL,
  `dataNascimento` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionario`
--

LOCK TABLES `funcionario` WRITE;
/*!40000 ALTER TABLE `funcionario` DISABLE KEYS */;
/*!40000 ALTER TABLE `funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios`
--

DROP TABLE IF EXISTS `horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sequencia` int NOT NULL,
  `inicio` time NOT NULL,
  `fim` time NOT NULL,
  `rotulo` varchar(100) NOT NULL,
  `is_intervalo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sequencia` (`sequencia`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios`
--

LOCK TABLES `horarios` WRITE;
/*!40000 ALTER TABLE `horarios` DISABLE KEYS */;
INSERT INTO `horarios` VALUES (1,1,'07:00:00','07:50:00','07:00 – 07:50',0),(2,2,'07:50:00','08:40:00','07:50 – 08:40',0),(3,3,'08:40:00','09:30:00','08:40 – 09:30',0),(4,4,'09:30:00','09:45:00','09:30 – 09:45 (intervalo)',1),(5,5,'09:45:00','10:35:00','09:45 – 10:35',0),(6,6,'10:35:00','11:25:00','10:35 – 11:25',0),(7,7,'11:25:00','12:15:00','11:25 – 12:15',0),(8,8,'12:15:00','13:15:00','12:15 – 13:15 (almoço)',1),(9,9,'13:15:00','14:05:00','13:15 – 14:05',0),(10,10,'14:05:00','14:55:00','14:05 – 14:55',0),(11,11,'14:55:00','15:45:00','14:55 – 15:45',0),(12,12,'15:45:00','16:35:00','15:45 – 16:35 (clube juvenil)',1);
/*!40000 ALTER TABLE `horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matricula`
--

DROP TABLE IF EXISTS `matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matricula` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `turma_id` int DEFAULT NULL,
  `responsavel_id` int DEFAULT NULL,
  `data_matricula` datetime DEFAULT CURRENT_TIMESTAMP,
  `ano_letivo` varchar(10) DEFAULT NULL,
  `status` enum('ativa','inativa','cancelada') DEFAULT 'ativa',
  `observacoes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aluno_id` (`aluno_id`,`turma_id`),
  KEY `responsavel_id` (`responsavel_id`),
  KEY `matricula_ibfk_2` (`turma_id`),
  CONSTRAINT `matricula_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `aluno` (`id`),
  CONSTRAINT `matricula_ibfk_2` FOREIGN KEY (`turma_id`) REFERENCES `turma` (`id`),
  CONSTRAINT `matricula_ibfk_3` FOREIGN KEY (`responsavel_id`) REFERENCES `responsavel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matricula`
--

LOCK TABLES `matricula` WRITE;
/*!40000 ALTER TABLE `matricula` DISABLE KEYS */;
/*!40000 ALTER TABLE `matricula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` char(11) NOT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `dataNascimento` date DEFAULT NULL,
  `sexo` enum('Masculino','Feminino','Outro') DEFAULT NULL,
  `numeroBeneficio` varchar(50) DEFAULT NULL,
  `planoSaude` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `num` varchar(10) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `celular` varchar(15) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contatoEmergencia` varchar(15) DEFAULT NULL,
  `observacoes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissoes`
--

DROP TABLE IF EXISTS `permissoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `recurso` varchar(50) DEFAULT NULL,
  `pode_acessar` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `permissoes_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissoes`
--

LOCK TABLES `permissoes` WRITE;
/*!40000 ALTER TABLE `permissoes` DISABLE KEYS */;
INSERT INTO `permissoes` VALUES (20,1,'configuracoes',1),(21,1,'aluno',1),(22,1,'professor',1),(23,1,'responsavel',1),(24,2,'aluno',1),(25,2,'professor',1),(26,2,'responsavel',1),(27,3,'aluno',1),(28,3,'professor',1),(29,3,'responsavel',1),(30,1,'disciplina',1),(31,1,'matricula',1),(32,1,'turma',1),(33,2,'disciplina',1),(34,1,'cadastrousuario',1),(35,2,'configuracoes',1),(36,1,'registrofrequencia',1),(37,1,'montarturma',1);
/*!40000 ALTER TABLE `permissoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professor`
--

DROP TABLE IF EXISTS `professor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `tipo` enum('docente','coordenador','colaborativo') NOT NULL DEFAULT 'docente',
  `area_conhecimento` varchar(100) DEFAULT NULL,
  `carga_horaria` int DEFAULT NULL,
  `habilitacao` varchar(50) DEFAULT NULL,
  `telefone` varchar(20) NOT NULL,
  `sexo` enum('Masculino','Feminino','Outro') NOT NULL,
  `email` varchar(100) NOT NULL,
  `cpf` varchar(45) DEFAULT NULL,
  `rg` varchar(45) DEFAULT NULL,
  `cep` varchar(45) DEFAULT NULL,
  `end_rua` varchar(45) DEFAULT NULL,
  `end_numero` varchar(45) DEFAULT NULL,
  `bairro` varchar(45) DEFAULT NULL,
  `cidade` varchar(45) DEFAULT NULL,
  `data_nasc` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professor`
--

LOCK TABLES `professor` WRITE;
/*!40000 ALTER TABLE `professor` DISABLE KEYS */;
/*!40000 ALTER TABLE `professor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsavel`
--

DROP TABLE IF EXISTS `responsavel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsavel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` char(11) NOT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `dataNascimento` date DEFAULT NULL,
  `sexo` enum('Masculino','Feminino','Outro') DEFAULT NULL,
  `numeroBeneficio` varchar(50) DEFAULT NULL,
  `responsavelTurma` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `num` varchar(10) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `celular` varchar(15) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contatoEmergencia` varchar(15) DEFAULT NULL,
  `observacoes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsavel`
--

LOCK TABLES `responsavel` WRITE;
/*!40000 ALTER TABLE `responsavel` DISABLE KEYS */;
/*!40000 ALTER TABLE `responsavel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADM'),(2,'PROFESSOR'),(3,'SECRETARIA');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_atendimento`
--

DROP TABLE IF EXISTS `status_atendimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_atendimento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_atendimento`
--

LOCK TABLES `status_atendimento` WRITE;
/*!40000 ALTER TABLE `status_atendimento` DISABLE KEYS */;
INSERT INTO `status_atendimento` VALUES (1,'Concluído'),(2,'Não Concluído'),(3,'Aberto'),(4,'Cancelado'),(5,'Pausado');
/*!40000 ALTER TABLE `status_atendimento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `substituicoes_eventuais`
--

DROP TABLE IF EXISTS `substituicoes_eventuais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `substituicoes_eventuais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aula_id` int NOT NULL COMMENT 'Referencia o ID da tabela aulas (grade fixa)',
  `professor_substituto_id` int NOT NULL COMMENT 'Quem vai dar a aula neste dia',
  `data_aula` date NOT NULL COMMENT 'Para qual dia específico é essa troca',
  `motivo` text,
  `criado_por` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_eventual_prof` (`professor_substituto_id`),
  CONSTRAINT `fk_eventual_prof` FOREIGN KEY (`professor_substituto_id`) REFERENCES `professor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `substituicoes_eventuais`
--

LOCK TABLES `substituicoes_eventuais` WRITE;
/*!40000 ALTER TABLE `substituicoes_eventuais` DISABLE KEYS */;
/*!40000 ALTER TABLE `substituicoes_eventuais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `substituicoes_historico`
--

DROP TABLE IF EXISTS `substituicoes_historico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `substituicoes_historico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_aula` int NOT NULL COMMENT 'Referencia a tabela aulas',
  `id_professor_anterior` int NOT NULL COMMENT 'O professor que foi substituído (FK para professor.id).',
  `id_professor_novo` int NOT NULL COMMENT 'O professor que assumiu a aula (FK para professor.id).',
  `data_substituicao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora em que a substituição foi registrada no sistema.',
  `id_usuario_responsavel` int DEFAULT NULL COMMENT 'O usuário do sistema que realizou a operação (FK para user.id).',
  `motivo` text COMMENT 'Campo opcional para justificativa ou observação sobre a troca.',
  PRIMARY KEY (`id`),
  KEY `idx_agendamento_aula` (`id_aula`),
  KEY `fk_subst_professor_anterior` (`id_professor_anterior`),
  KEY `fk_subst_professor_novo` (`id_professor_novo`),
  KEY `fk_subst_usuario_responsavel` (`id_usuario_responsavel`),
  CONSTRAINT `fk_subst_professor_anterior` FOREIGN KEY (`id_professor_anterior`) REFERENCES `professor` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_subst_professor_novo` FOREIGN KEY (`id_professor_novo`) REFERENCES `professor` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_subst_usuario_responsavel` FOREIGN KEY (`id_usuario_responsavel`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registra o histórico de todas as substituições de professores em aulas agendadas.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `substituicoes_historico`
--

LOCK TABLES `substituicoes_historico` WRITE;
/*!40000 ALTER TABLE `substituicoes_historico` DISABLE KEYS */;
/*!40000 ALTER TABLE `substituicoes_historico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turma`
--

DROP TABLE IF EXISTS `turma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turma` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `nivel` enum('Anos Iniciais','Anos Finais','Ensino Médio') DEFAULT NULL COMMENT 'Nível de ensino da turma, para a regra do Artigo 12',
  `ano_letivo` int NOT NULL,
  `semestre` int NOT NULL,
  `status` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turma`
--

LOCK TABLES `turma` WRITE;
/*!40000 ALTER TABLE `turma` DISABLE KEYS */;
/*!40000 ALTER TABLE `turma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role_id` int DEFAULT '2',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-08 14:41:57
