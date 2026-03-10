const express = require('express');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadMaterial,
  getMaterials,
  getMaterial,
  summarizeMaterial,
  searchMaterials,
  deleteMaterial,
} = require('../controllers/materialController');

const router = express.Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadMaterial);
router.get('/', getMaterials);
router.get('/search', searchMaterials);
router.get('/:id', getMaterial);
router.post('/:id/summarize', summarizeMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;
