const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // configure temporary storage folder

module.exports = upload;
