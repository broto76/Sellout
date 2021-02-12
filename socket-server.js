const { getInvoice } = require('./controller/shop');

let io;

module.exports = {
    setIo: (param) => {
        if (!param) {
            console.log('Invalid param');
            return;
        }
        io = param;
    },

    getIo: () => {
        if (!io) {
            throw new Error('Socketio not intialized');
        }
        return io;
    }
};