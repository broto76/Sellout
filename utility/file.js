const fs = require('fs');

exports.deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.log('Erro while deleting ' + filePath);
            throw (err);
        }
        console.log('Deleted file: ' + filePath);
    });
}