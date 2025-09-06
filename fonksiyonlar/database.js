const db = require('croxydb');

// Database ayarları - Önce ayarları yap, sonra options'ı set et
db.folder = 'database';
db.file = 'urunler';
db.readable = true;
db.noBlankData = true;
db.checkUpdates = false;

// Options'ı set et
db.setOptions();

module.exports = db;
