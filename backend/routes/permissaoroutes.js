const express = require('express');
const router = express.Router();
const permissaoController = require('../controllers/permissaoController');

router.get('/', permissaoController.getPermissoes);
router.post('/', permissaoController.salvarPermissoes);

module.exports = router;
