document.addEventListener('DOMContentLoaded', () =>{
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    let current_channel = "Channel 1";
    let emoji_dict = {"positive":0x1F601, "neutral":0x1F633, "negative":0x1F641}
    joinRoom(current_channel);

    socket.on('message', data => {
        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_timestamp = document.createElement('span');
        const br = document.createElement('br');
        if (data.msg) {
            if (typeof data.username === "undefined") {
                // p.setAttribute("class", "system-msg");
                // p.innerHTML = data.msg
                document.getElementById('channel-title').innerText = data.msg;
            }
            else {
                span_username.innerHTML = data.username;
                span_timestamp.innerHTML = data.time_stamp;
                span_timestamp.setAttribute("class", "timestamp")

                if (data.username === username) {
                    p.setAttribute("class","my-msg");
                    span_username.setAttribute("class","my-username");
                }
                else {
                    p.setAttribute("class", "others-msg")
                    span_username.setAttribute("class","other-username")
                }
                p.innerHTML = span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + String.fromCodePoint(emoji_dict[data.sentiment]) + String(' ')+span_timestamp.outerHTML;
                document.querySelector('#display-message-section').append(p);
                scrollDownChatWindow()
            }

        }
    });

    socket.on('list_users',function (msg) {
        let d = jQuery.parseJSON(msg.lists)
        let current_list = d[current_channel]
        let numbers_string = '';
        for (var i = 0; i < current_list.length; i++){
            numbers_string = numbers_string + '<li>' + current_list[i].toString()  +'</li>';
        };
        $('#current_users').html(numbers_string);
    });

    document.querySelector('#send_message').onclick = () => {
        socket.emit('message',{ "msg":document.querySelector('#user_message').value,
            "username": username, "room": current_channel});
        document.querySelector('#user_message').value = '';
    }

    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML;
            if (newRoom === current_channel){
                msg = `You are already in ${current_channel} room.`
                // printSysMsg(msg);
            } else{
              leaveRoom(current_channel);
              joinRoom(newRoom);
              current_channel = newRoom;
            }
        }
    });

    function leaveRoom(current_channel) {
        socket.emit('leave', {'username':username, 'room':current_channel});
    }

    function joinRoom(current_channel) {
        socket.emit('join', {'username':username, 'room':current_channel });
        document.querySelector('#display-message-section').innerHTML = '';
        document.querySelector('#user_message').focus();
    }

    function scrollDownChatWindow() {
        const chatWindow = document.querySelector("#display-message-section");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

})