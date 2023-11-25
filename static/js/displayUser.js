import insertElement from "./tinyDOM/insertElement.js"
import emptyElement from "./tinyDOM/emptyElement.js"

// We might need and endpoint that return texts based on locale for the translations
const displayUser = async () => {
	const id = 'userDiv'
	const userDiv = document.getElementById(id)
    const userDataPromise = await fetch('/auth/user')
    const userData = await userDataPromise.json()
	const intraLogin = userData['intra_login']
	if (intraLogin) {
        const intraPfp = userData['intra_pfp']
        const authLogout = userDiv.dataset.authLogout
        const pongGame = userDiv.dataset.pongGame
		insertElement(id,
		`
        <div class="d-flex">
            <div class="d-flex flex-column">
                <h1 class="text-white mb-4">Logged as ${intraLogin}</h1>
                <img src="${intraPfp}">
                <a id="logoutButton" class="btn btn-outline-light">Logout</a>
            </div>
            <div class="container">
                <h1 style="color: white;">"Play a match!"</h1>
                <form action="/pong/game" method="post">
                    <input type="text" name="player1" value=${intraLogin} placeholder=${intraLogin} readonly>
                    <input type="text" name="player2" placeholder="Player Two Name">
                    <div class="mt-4">
                        <button class="btn btn-outline-light" type="submit">Play Pong</button> 
                    </div>
                </form>
            </div>
        </div>
		`
		)		
        const logoutButton = document.getElementById('logoutButton')
        logoutButton.addEventListener('click', () => {
            fetch(authLogout)
            emptyElement(id)
            displayUser()
        })
	} else {
		insertElement(id,
            `
            <div>
                <h1 class="text-white mb-0"> You are not logged </h1>
                <a id="loginButton" class="btn btn-outline-light">Login with intra</a>
            </div>
            ` 
		)
        const loginButton = document.getElementById('loginButton')
        loginButton.addEventListener('click', () => {
            fetch('/auth/intra')
        })
	}
}

document.addEventListener("DOMContentLoaded", () => {
	displayUser()
});
