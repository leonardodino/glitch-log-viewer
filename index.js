const chalk = require('chalk')
const Html5WebSocket = require('html5-websocket')
const WebSocket = require('reconnecting-websocket')

const format = ({text: raw, timestamp, stream}) => {
	const date = chalk.dim(`${new Date(timestamp).toLocaleTimeString()}: `)
	const text = raw.replace(/(.+)/g, `${date}$1`) || date
	if(/app is running/.test(text)) return chalk.green(text)
	if(stream === 'stderr') return chalk.red(text)
	return text
}

module.exports = (address, outputs) => {
	const ws = new WebSocket(address, undefined, {constructor: Html5WebSocket})
	ws.addEventListener('message', ({data: raw}) => {
		let data = {}
		try{data = JSON.parse(raw)}catch(e){return}
		if(!data || !data.process) return
		if(!data.stream || typeof data.text !== 'string') return
		const output = outputs[data.stream]
		if(!output || !output.write) return
		output.write(`${format(data)}\n`)
	})
}
