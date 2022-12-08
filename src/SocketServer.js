import * as websocket from "websocket";

let active = 0
let connections = []

class Bot {
	constructor(index, name, money, pay, guaranty, prodTime) {
		this.index = index
		this.time = 120
		this.name = name
		this.money = money
		this.payMethod = pay
		this.guaranty = guaranty
		this.prodTime = prodTime
		this.isActive = true
		this.isMakeBet = false
		this.missedRound = 0
	}

	randomSum() {
		const sum = Math.round(Math.random() * 100)
		return sum < this.money ? sum : this.money
	}

	actionStep() {
		const r=Math.floor(Math.random() * (range.from-1))
		return r===0?1:r
	}

	isBet() {
		return !!Math.round(Math.random())
	}

	botAction(connections) {
		const stepToAct = this.actionStep()
		return async () => {
			for await (let value of range) {
				if (value && value !== this.time) {
					if (value === stepToAct) {
						if (this.isBet()) {
							this.money -= this.randomSum()
							this.missedRound = 0
							this.isActive = true
							this.isMakeBet = true
						}
						else {
							this.isActive = false
							this.missedRound += 1
							this.isMakeBet=false
						}
					}
					else{
						this.isMakeBet=false
					}
					this.time = value
					connections.forEach(c => {
						sendResponse(c, 'onAddConnection',
												 JSON.stringify({users, activeUser: active})
						)
					})
				}
			}
		}
	}
}

const usersData = [
	['Jou', 2222344, '50% наличные 50% безнал', 'да', '5 месяцев'],
	['Mary', 121244, '100% безнал', '10 месяцев', '6 месяцев'],
	['Fairy', 121244, '100% безнал', '12 месяцев', '6 месяцев'],
	['Jerry', 29044, 'в кредит', 'нет', '2месяца']
]
let timeout = null
let range = {
	from: 12,
	to: 0,
	async * [Symbol.asyncIterator]() {
		for (let value = this.from; value > this.to; value--) {
			if (timeout) {
				clearTimeout(timeout)
				timeout = null
			}
			await new Promise(resolve => timeout = setTimeout(resolve, 1000));
			yield value;
		}
	}
};
const createUsers = () => {
	return usersData.map((us, i) => {
		return new Bot(i, us[0], us[1], us[2], us[3], us[4])
	})
}

let users = createUsers()

class SocketServer {
	constructor(server) {
		const wsServer = new websocket.server({
																						httpServer: server,
																					});
		wsServer.on('request', (request) => {
									const connection = request.accept(undefined, request.origin);
									if (!connections.includes(connection)) {
										connections.push(connection)
										sendResponse(connection, 'onAddConnection', JSON.stringify({users, activeUser: active}))
									}
									if (connections.length == 1) {
										const r = async () => {
											const t = users[active].botAction(connections)()
											t.then(() => {
												users[active].isMakeBet=false
												active + 1 < users.length ? active++ : active = 0
												if (!!connections.length) r()
											})
										}
										r()
									}
									// if (connections.length === 0 && timeout) {
									// 	clearTimeout(timeout)
									// 	timeout = null
									// 	users=createUsers()
									// }
									connection.on('close', (reasonCode, description) => {
										connections.splice(connections.indexOf(connection), 1)
										if (connections.length === 0 && timeout) {
											clearTimeout(timeout)
											timeout = null
											users=createUsers()
											active=0
										}
									});
								}
		);
	}
}

function sendResponse(client, type, stringContent) {
	const responseMessage = {
		type: type,
		content: stringContent,
	};
	client.sendUTF(JSON.stringify(responseMessage));
}

export default SocketServer