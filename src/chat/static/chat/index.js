import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";


function cookie_as_dict() {
  return document.cookie
  .split(';')
  .reduce((res, c) => {
    const [key, val] = c.trim().split('=').map(decodeURIComponent)
    try {
      return Object.assign(res, { [key]: JSON.parse(val) })
    } catch (e) {
      return Object.assign(res, { [key]: val })
    }
  }, {})
}

async function main() {
    const socket = io("http://localhost:3000", {
        withCredentials: true
    })

    const initial_data = JSON.parse(document.getElementById('initial_data_json').textContent)
    console.log(initial_data)
    
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const companion_id = (document.getElementById('companion_id')).value

    const cookie = cookie_as_dict()
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (input.value) {
        socket.emit('chat message', {
          data: input.value,
          secret_key: cookie["secret_key"],
          companion_id: companion_id
        });
        input.value = '';
      }
    });

    socket.on("add message", (data) => {
      console.log("add message", data)
    })
}

main()

