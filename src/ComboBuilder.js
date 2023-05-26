import './ComboBuilder.css'
import { useState } from 'react'

const MOVES = require('./moves.json')
const CHARS = Object.keys(MOVES)
const MODS = [
	'Counter-Hit', 
	'Punish Counter', 
	'Blocked',
]

export default function ComboBuilder() {
	const [userCombo, setUserCombo] = useState([])
	const [userChar, setUserChar] = useState(CHARS[0])

	function updateUserCombo(e) {
		const moveIndex = parseInt(e.target.id)
		const input = e.target.value
		const updatedCombo = userCombo.slice(0, moveIndex)

		if (input !== '') {
			const move = structuredClone(MOVES[userChar].filter(move => move.input === input)[0])
			move['distance'] = getPrevDistance(moveIndex) + move.push
			updatedCombo.push(move)
		}
		setUserCombo(updatedCombo)

		try {
			document.getElementById(moveIndex + 1).value = ''
		} catch {}
	}

	function getPrevDistance(moveIndex) {
		if (moveIndex === 0) return 0
		return userCombo[moveIndex - 1].distance
	}

	function getPossibleMoves(index) {
		let possible_moves = MOVES[userChar]

		if (index > 0) {
			const prev_move = userCombo[index-1]
			possible_moves = possible_moves.filter(move => 
				move.startup <= prev_move.advantage && move.range >= prev_move.distance
			)
		}
		if (possible_moves.length === 0) return
		
		return (
			<div className='move-row'>
				<select
					id={index}
					onChange={updateUserCombo}
					defaultValue={''}>
					<option value=''>Choose a move</option>
					{possible_moves.map(move => (
						<option value={move.input}>{move.input}</option>
					))}
				</select>
			</div>
		)
	}

	return (
		<div className="combo-builder">
			<div className='top-bar'>
				<select onChange={e => setUserChar(e.target.value)}>
					{CHARS.map(char => (
						<option>{char}</option>
					))}
				</select>
			</div>
			<div className='combo-table'>
				{getPossibleMoves(0)}
				{[...userCombo.keys()].map(i => getPossibleMoves(i + 1))}
				<div>
					{userCombo.map(move => move.input+' ')}
				</div>
			</div>
		</div>
	)
}