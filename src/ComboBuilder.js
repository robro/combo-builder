import './ComboBuilder.css'
import { useState } from 'react'

const COMBOS = [...new Set(require('./combos.json'))]
const MODS = require('./modifiers.json')
const CTRS = require('./counters.json')
const CHARS = [...new Set(COMBOS.map(combo => combo.character))]
const MODS_RE = new RegExp(Object.keys(MODS).join('|'))
const CTRS_RE = new RegExp(Object.keys(CTRS).join('|'))
const MOVES_RE = /(^|[,>~])[^,>~]+/g

COMBOS.forEach(combo => {
	const modifier = combo.notation.match(MODS_RE)
	const counter = combo.notation.match(CTRS_RE)
	combo['modifier'] = (modifier) ? modifier[0] : ''
	combo['counter'] = (counter) ? counter[0] : ''
	combo.notation = combo.notation
		.replace(combo.modifier, '')
		.replace(combo.counter, '')
		.match(MOVES_RE)
		.map(move => move.trim())
})

export default function ComboBuilder() {
	const [userCombo, setUserCombo] = useState([])
	const [userChar, setUserChar] = useState(CHARS[0])
	const [userCounter, setUserCounter] = useState('')
	const [userModifier, setUserModifier] = useState('')
	const [dropIndexes, setDropIndexes] = useState([])

	const filtered_combos = COMBOS.filter(combo => {
		let filtered = true
		if (combo.character !== userChar) filtered = false
		if (combo.counter !== userCounter) filtered = false
		if (combo.modifier !== userModifier) filtered = false
		return filtered
	})

	console.log(userCombo)
	console.log(dropIndexes)

	function updateUserCombo(e) {
		let moveIndex = parseInt(e.target.id)
		let moves = e.target.value.split('/')
		let updatedCombo = [...userCombo].slice(0, moveIndex)
		let updatedIndexes = [...dropIndexes].slice(0, moveIndex)
		
		if (moves[0] !== '') {
			updatedCombo = updatedCombo.concat(moves)
			updatedIndexes.push(moveIndex + moves.length)
		}

		setUserCombo(updatedCombo)
		setDropIndexes(updatedIndexes)

		try { document.getElementById(moveIndex+1).value = '' }
		catch {}
	}

	function getPossibleCombos(combos, index=0) {
		return combos.filter(combo => {
			if (userCombo.length === 0) return true
			for (let i = 0; i <= index; i++) {
				if (combo.notation[i] !== userCombo[i]) return false
			}
			return true
		})
	}

	function getNextMoves(combos, index) {
		if (combos.length <= 1) return
		return (
			<div className='move-row'>
				<select
					className='next-move'
					id={index}
					onChange={updateUserCombo}>
					<option value=''>Select a move</option>
					{getNextMove(combos, index).map(option => (
						<option value={option.join('/')}>{option.join('').replace(', ', '')}</option>
					))}
				</select>
			</div>
		)
	}

	function getNextMove(combos, index) {
		let options = []
		let move_count = 1

		while (options.length < 2 || move_count > 10) {
			options = Array.from(new Set(combos.map(combo =>
				combo.notation.slice(index, index + move_count)
			).map(JSON.stringify)), JSON.parse)
			move_count++
		}
		return options
	}

	function onCharacterChange(e) {
		setUserCombo([])
		setDropIndexes([])
		setUserChar(e.target.value)
		try { document.getElementById(0).value = '' }
		catch {}
	}

	function onModChange(e) {
		setUserCombo([])
		setDropIndexes([])
		setUserModifier(e.target.value)
		try { document.getElementById(0).value = '' }
		catch {}
	}

	function onCounterChange(e) {
		setUserCombo([])
		setDropIndexes([])
		setUserCounter(e.target.value)
		try { document.getElementById(0).value = '' }
		catch {}
	}

	return (
		<div className="combo-builder">
			<table className='top-bar'>
				<tbody>
					<tr>
						<td>
							<select onChange={onCharacterChange}>
								{CHARS.map(char => (
									<option>{char}</option>
								))}
							</select>
						</td>
						<td>
							<select onChange={onCounterChange}>
								<option value=''>No Counter</option>
								{Object.keys(CTRS).map(ctr => (
									<option value={ctr}>{CTRS[ctr]}</option>
								))}
							</select>
						</td>
						<td>
							<select onChange={onModChange}>
								<option value=''>No Modifier</option>
								{Object.keys(MODS).map(mod => (
									<option value={mod}>{MODS[mod]}</option>
								))}
							</select>
						</td>
					</tr>
				</tbody>
			</table>
			<div className='combo-table'>
				{getNextMoves(filtered_combos, 0)}
				{dropIndexes.map(i => getNextMoves(getPossibleCombos(filtered_combos, i-1), i))}
				<div>
					{getPossibleCombos(filtered_combos, userCombo.length-1).map(combo => (
						<div>
							{`${combo.modifier} ${combo.counter} ${combo.notation.join('')}`}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}