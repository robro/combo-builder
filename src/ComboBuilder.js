import './ComboBuilder.css'
import { useState } from 'react'

const COMBOS = [...require('./combos.json')]
const CHARS = [...new Set(COMBOS.map(combo => combo.character))]
const MODS_RE = /^\w+ (?=\w)/
const MOVES_RE = /(^|[,>~])[^,>~]+/g

COMBOS.forEach(combo => {
	const modifier = combo.notation.match(MODS_RE)
	combo['modifier'] = (modifier) ? modifier[0] : ''
	combo.notation = combo.notation.replace(combo.modifier, '').match(MOVES_RE)
})

export default function ComboBuilder() {
	const [userCombo, setUserCombo] = useState([])
	const [userChar, setUserChar] = useState(CHARS[0])

	function updateUserCombo(e) {
		let updatedCombo = [...userCombo]
		let moveIndex = parseInt(e.target.id)
		let move = e.target.value

		if (userCombo.length > moveIndex) {
			updatedCombo[moveIndex] = move
		}
		else {
			updatedCombo.push(move)
		}
		updatedCombo = updatedCombo.slice(0, moveIndex+1).filter(c => c)
		setUserCombo(updatedCombo)

		try {
			document.getElementById(moveIndex+1).value = ''
		}
		catch {}
	}

	function getPossibleCombos(combos, index) {
		return combos.filter(combo => {
			if (!userCombo.length) {
				return true
			}
			if (combo.character !== userChar) {
				return false
			}
			for (let i = 0; i <= index; i++) {
				if (combo.notation[i] !== userCombo[i]) {
					return false
				}
			}
			return true
		})
	}

	function getNextMoves(combos, index) {
		if (combos.length === 1 && index === combos[0].notation.length) {
			return
		}
		return (
			<div className='move-row'>
				<select
					id={index}
					onChange={updateUserCombo}
					defaultValue={''}>
					<option value=''>Choose a move</option>
					{[...new Set(combos.map(combo =>
							combo.notation[index]))].sort().map(move => (
						<option value={move}>{move}</option>
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
				{getNextMoves(COMBOS.filter(c => c.character === userChar), 0)}
				{[...userCombo.keys()].map(i => getNextMoves(getPossibleCombos(COMBOS, i), i+1))}
				<div>
					{userCombo}
				</div>
			</div>
		</div>
	)
}