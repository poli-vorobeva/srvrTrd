import * as websocket from "websocket";

let active = 0
let connections = []
class Bot {
	constructor(index, name, money,pay,guaranty,prodTime) {
		this.index = index
		this.time = 120
		this.name = name
		this.money = money
		this.payMethod=pay
		this.guaranty=guaranty
		this.prodTime=prodTime
		this.isActive=true
		this.isMakeBet=false
		this.missedRound=0
	}

	randomSum() {
		const sum = Math.round(Math.random() * 100)
		return sum < this.money ? sum : this.money
	}

	actionStep() {
		return Math.floor(Math.random() * range.from)
	}

	isBet() {
		return !!Math.round(Math.random())
	}

	botAction(connections) {
		const stepToAct=this.actionStep()
		return async () => {
			for await (let value of range) {
				if (value === stepToAct) {
					if(this.isBet()){
						this.money -= this.randomSum()
						this.missedRound= !!this.missedRound && 0
						this.isActive=true
						this.isMakeBet=true
					}else{
						this.isActive=false
						this.missedRound+=1
					}
				}else if (value !== stepToAct){
					this.isMakeBet=false
				}
				if (value && value !== this.time) {
					this.time = value
					connections.forEach(c => {
						sendResponse(c, 'onAddConnection',
							JSON.stringify({users, activeUser: active}))
					})
				}
			}
		}
	}
}
let users = [
	new Bot(0, 'Jou', 2222344,'50% наличные 50% безнал','да','5 месяцев'),
	new Bot(1, 'Mary', 121244,'100% безнал','10 месяцев','6 месяцев'),
	new Bot(2, 'Fairy', 121244,'100% безнал','12 месяцев','6 месяцев'),
	new Bot(3, 'Jerry', 29044,'в кредит','нет','2месяца')
]
let timeout = null
let range = {
	from: 12,
	to: 0,
	async* [Symbol.asyncIterator]() {
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
							active + 1 < users.length ? active++ : active = 0
							if (!!connections.length) r()
						})
					}
					r()
				}
				if (connections.length === 0 && timeout) {
					clearTimeout(timeout)
					timeout = null
				}
				connection.on('close', (reasonCode, description) => {
					connections.splice(connections.indexOf(connection),1)
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