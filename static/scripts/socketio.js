document.addEventListener('DOMContentLoaded', () =>{
    let socket = io.connect('http://' + document.domain + ':' + location.port);

    let current_channel = "";
    let emoji_dict = {"positive":0x1F601, "neutral":0x1F633, "negative":0x1F641}

    socket.on('message', data => {
        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_timestamp = document.createElement('span');
        const br = document.createElement('br');
        if (data.msg) {
            if (typeof data.username === "undefined") {
                displaySystemMsg(data.msg);
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
        if (typeof(current_list) != "undefined"){
            for (var i = 0; i < current_list.length; i++) {
                numbers_string = numbers_string + '<li class="user-item">' + current_list[i].toString() + '</li>';
            };
        }
        $('#current_users').html(numbers_string);
    });

    document.querySelector('#send_message').onclick = () => {
        socket.emit('message',{ "msg":document.querySelector('#user_message').value,
            "username": username, "room": current_channel});
        document.querySelector('#user_message').value = '';
    }


    $(document).off("click", ".list-group .list-group-item").on("click",".list-group .list-group-item" ,function(){
        $(this).siblings().removeClass("active");
        $(this).addClass("active");
        let newRoom = $(this).text();
        if (newRoom === current_channel){
            let msg = `You are already in ${current_channel}.`;
            displaySystemMsg(msg);
        } else if (current_channel.length === 0){
            current_channel = newRoom;
            joinRoom(newRoom);
        } else {
            leaveRoom(current_channel);
            joinRoom(newRoom);
            current_channel = newRoom;
        }
    });

    document.querySelector("#logout-button").onclick = () => {
        leaveRoom(current_channel);
    }

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

    function displaySystemMsg(text){
        document.getElementById('channel-title').innerText = text;
    }

})