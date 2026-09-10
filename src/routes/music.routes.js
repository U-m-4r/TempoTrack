const express = require('express');
const musicController = require('../controllers/music.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');

const upload=multer({ 
    storage: multer.memoryStorage() 
});

const Router = express.Router();



Router.post('/upload', authMiddleware.authArtist, upload.single('music'), musicController.createMusic);
Router.post('/albums', authMiddleware.authArtist, musicController.createAlbum);

Router.get('/', authMiddleware.authUser, musicController.getAllMusics);
Router.get('/albums', authMiddleware.authUser, musicController.getAllAlbums);

Router.get('/albums/:albumId', authMiddleware.authUser, musicController.getAlbumById);

module.exports = Router;