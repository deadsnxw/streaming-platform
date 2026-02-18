import express from 'express';
import { onPublish, onPublishDone } from '../controllers/StreamController.js';

const router = express.Router();

// nginx-rtmp callbacks
router.post('/on_publish', onPublish);
router.post('/on_publish_done', onPublishDone);

// Accept GET as some nginx setups may call via GET
router.get('/on_publish', onPublish);
router.get('/on_publish_done', onPublishDone);

export default router;
