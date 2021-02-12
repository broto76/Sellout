
// console.log('Sending socket io');
// openSocket('http://localhost:5555');

// const { io } = require("socket.io-client");

const socket = io();

socket.on('updateChat', (messageData) => {
    const currentUser = document.getElementById('currentUser').value;
    const remoteUser = document.getElementById('remoteUser').value;
    //console.log('Recepient: ' + messageData.recepient);
    //console.log('currentUser: ' + currentUser);
    if (currentUser != messageData.recepient || remoteUser != messageData.sender) {
        console.log('Ignore message');
        return;
    }
    console.log('Received payload at client');
    //console.log('Message: ' + messageData.data.message);

    const messageContainer = document.createElement('article');
    const para = document.createElement('p');
    const textNode = document.createTextNode(messageData.data.message);

    para.appendChild(textNode);
    messageContainer.appendChild(para);
    messageContainer.className = 'card message-data message-received';

    const list = document.getElementById('message-list');
    const form = document.getElementById('message-form');
    list.insertBefore(messageContainer, form);

});


