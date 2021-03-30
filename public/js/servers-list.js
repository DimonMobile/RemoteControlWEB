let loaders = document.getElementsByClassName("ws-loader");

for (let item of loaders) {
    const serverAddress = item.getAttribute("data-server-address");
    const serverPort = item.getAttribute("data-server-port");
    const serverId = item.getAttribute("data-server-id");

    function markError() {
        let crossTemplate = document.getElementById('crossIcon');
        let clone = crossTemplate.content.cloneNode(true);
        let parent = item.parentElement;

        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        parent.appendChild(clone);
    }

    function markGood() {
        let checkTemplate = document.getElementById('checkIcon');
        let clone = checkTemplate.content.cloneNode(true);
        let parent = item.parentElement;

        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        parent.appendChild(clone);
    }

    fetch(`/servers/status/${serverId}`).then(response => response.json()).then(data => { 
        if (data.status === 'running') {
            markGood();
        } else {
            markError();
        }
    }).catch(e => {
        markError();
    });
}
