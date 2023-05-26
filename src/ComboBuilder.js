import './ComboBuilder.css'
import { useState } from 'react'

const COMBOS = [...require('./combos.json')]
const CHARS = [...new Set(COMBOS.map(combo => combo.character))]
const MODIFIERS = new RegExp('CH|PC|AA|Block|CU')

COMBOS.forEach(combo => {
	combo.notation = combo.notation.split(/([,>~ ])/).map(s => s.trim()).filter(s => s)
	combo['modifier'] = (MODIFIERS.test(combo.notation[0])) ? combo.notation.shift() : ''
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
		return (
			<div className='move-row'>
				<select 
					id={index}
					onChange={updateUserCombo}
					defaultValue={''}>
					<option value=''>Choose a move</option>
					{[...new Set(combos.map(combo => combo.notation[index]))].sort().map(move => (
						<option>{move}</option>
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
				{[...Array(userCombo.length).keys()].map(i => getNextMoves(getPossibleCombos(COMBOS, i), i+1))}
				<div>
					{userCombo.map(move => move+' ')}
				</div>
			</div>
		</div>
	)
}