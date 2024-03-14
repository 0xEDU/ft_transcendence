import swapInnerHTMLOfElement from "./tinyDOM/swapInnerHTMLOfElement.js";

export default function fetchAndUpdateFriends() {
    fetch('/get-friends/')
        .then(response => response.json())
        .then(data => {
            let friendsHTML = '';
            data.forEach(function(friend) {
                let onlineStatus = friend.online ? '🟢' : '🔴';
                const isChrome = navigator.userAgent.includes("Chrome") && navigator.vendor.includes("Google Inc");
                let chromeBall = ""
                if (isChrome) {
                    onlineStatus = ""
                    chromeBall = friend.online ? "<div class=\"green-ball\"></div>"
                        : "<div class=\"red-ball\"></div>"
                }
                friendsHTML += `
              <div class="mate-container">
                ${chromeBall}
                <img class="matesImages me-3 mt-3"
                     src="${friend.image_url}" 
                     alt="${friend.username}'s Photo" 
                     title="${friend.username}">
                <span class="online-status">${onlineStatus}</span>
              </div>
            `;
            });

            swapInnerHTMLOfElement('friendsContainer', friendsHTML);
        })
        .catch(function(error) {
            console.error('Error loading friends:', error);
        });
}
