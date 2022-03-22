import Value from '@/components/EngineValue'
import { EngineContext } from '@/components/utils/EngineContext'
import {
	Situation,
	useSituationState,
} from '@/components/utils/SituationContext'
import { Spacing } from '@/design-system/layout'
import { H3 } from '@/design-system/typography/heading'
import { Li, Ul } from '@/design-system/typography/list'
import { Grid } from '@mui/material'
import { DottedNames } from 'exoneration-covid'
import Engine, { EvaluatedNode, PublicodesExpression } from 'publicodes'
import { useContext } from 'react'
import { Trans } from 'react-i18next'
import { Bold, GridTotal, Italic, Recap, RecapExpert, Total } from './Recap'
import { Row, Table, Tbody, Th, Thead, Tr } from './Table'

const getTotalByMonth = (
	engine: Engine<DottedNames>,
	situation: Situation<DottedNames>
) => {
	const ret = Object.fromEntries(
		Object.entries(situation)
			.filter(([monthDottedName]) => monthDottedName.startsWith('mois . '))
			.map(([monthDottedName]) => {
				const { nodeValue } = engine.evaluate(
					monthDottedName
				) as EvaluatedNode<string>

				const parsedRules = engine.getParsedRules()

				if (!nodeValue || !(nodeValue + ' . montant mensuel' in parsedRules)) {
					return [monthDottedName, undefined]
				}

				const value = engine.evaluate(
					nodeValue + ' . montant mensuel'
				) as EvaluatedNode<number>

				return [monthDottedName, value]
			})
	)

	return ret
}

interface Props {
	onChange?: (dottedName: DottedNames, value: PublicodesExpression) => void
}

export const FormulaireS1S1Bis = ({ onChange }: Props) => {
	const engine = useContext(EngineContext) as Engine<DottedNames>
	const { situation = {} } = useSituationState<DottedNames>()

	const totalByMonth = getTotalByMonth(engine, situation) ?? {}

	if (!engine.evaluate('mois').nodeValue) {
		return null
	}

	const months = Object.entries(engine.getParsedRules()).filter(([name]) =>
		name.match(/^mois \. [^.]*$/)
	)

	let isAnyRowShowed = false

	return (
		<>
			<H3>
				<Trans>
					Quelle était votre situation liée à la crise sanitaire durant vos mois
					d’activité ?
				</Trans>
			</H3>
			<Table>
				<Thead>
					<Tr>
						<Trans>
							<Th>Mois</Th>
							<Th alignSelf="center">Situation liée à la crise sanitaire</Th>
							<Th alignSelf="end">Montant de la réduction</Th>
						</Trans>
					</Tr>
				</Thead>

				<Tbody>
					{months.map(([dotName, node], i) => {
						const showRow = engine.evaluate(dotName).nodeValue !== null

						if (!showRow) {
							if (isAnyRowShowed) {
								return (
									<Row
										{...months[i][1]}
										actualMonth={dotName}
										dottedNames={[]}
										key={months[i][0]}
									/>
								)
							}

							return null
						}
						isAnyRowShowed = true

						return (
							<Row
								actualMonth={dotName}
								dottedNames={['LFSS 600', 'LFSS 300', 'LFR1']}
								title={node.title}
								total={totalByMonth[dotName]}
								onSelectionChange={(key) => {
									const val = (key as string).replace(/\.\d+$/, '')
									onChange?.(dotName as DottedNames, `'${val}'`)
								}}
								key={dotName}
							/>
						)
					})}
				</Tbody>
			</Table>

			<Spacing lg />

			<Recap>
				<Grid container>
					<Grid item xs>
						<Trans>
							<Bold>
								Dispositif loi de financement de la sécurité sociale (LFSS) pour
								2021
							</Bold>

							<Italic>
								Mesure d’interdiction d’accueil du public ou baisse d’au moins
								50% (ou 65% à compter de décembre 2021) du chiffre d’affaires
							</Italic>
						</Trans>
					</Grid>

					<Grid item xs="auto" alignSelf={'end'}>
						<Total>
							<Value
								engine={engine}
								expression="LFSS 600"
								linkToRule={false}
								precision={0}
							/>
						</Total>
					</Grid>
				</Grid>

				<Grid container>
					<Grid item xs>
						<Trans>
							<Italic>Baisse entre 30% à 64% du chiffre d'affaires</Italic>
						</Trans>
					</Grid>

					<Grid item xs="auto" alignSelf={'end'}>
						<Total>
							<Value
								engine={engine}
								expression="LFSS 300"
								linkToRule={false}
								precision={0}
							/>
						</Total>
					</Grid>
				</Grid>

				<hr />

				<Grid container>
					<Grid item xs>
						<Trans>
							<Bold>
								Dispositif loi de finances rectificative (LFR1) pour 2021
							</Bold>

							<Italic>Éligibilité aux mois de mars, avril ou mai 2021</Italic>
						</Trans>
					</Grid>

					<Grid item xs="auto" alignSelf={'end'}>
						<Total>
							<Value
								engine={engine}
								expression="LFR1"
								linkToRule={false}
								precision={0}
							/>
						</Total>
					</Grid>
				</Grid>

				<hr />

				<GridTotal container>
					<Grid item xs>
						<Trans>
							Montant de l’exonération sociale liée à la crise sanitaire sur
							l’année 2021
						</Trans>
					</Grid>

					<Grid item xs="auto" alignSelf={'end'}>
						<Total>
							<Value
								engine={engine}
								expression="montant total"
								linkToRule={false}
								precision={0}
							/>
						</Total>
					</Grid>
				</GridTotal>
			</Recap>

			<Trans>
				<H3>Résumé</H3>

				<RecapExpert>
					<Li>
						Secteur d'activité dont relève l'activité principale :{' '}
						<Bold as="span">{engine.evaluate('secteur').nodeValue}</Bold>
					</Li>
					<Li>
						Activité exercée en{' '}
						<Bold as="span">
							{engine.evaluate("lieu d'exercice").nodeValue}
						</Bold>
					</Li>
					<Li>
						Début d'activité :{' '}
						<Bold as="span">
							{engine.evaluate("début d'activité").nodeValue}
						</Bold>
					</Li>
					<Li>
						Nombres de mois pour lesquels vous remplissez les conditions
						d'éligibilité
						<Ul>
							<Li>
								LFSS :{' '}
								<Bold as="span">
									<Value
										engine={engine}
										expression="LFSS . mois éligibles"
										linkToRule={false}
										precision={0}
									/>
								</Bold>
							</Li>
							<Li>
								LFR1 :{' '}
								<Bold as="span">
									<Value
										engine={engine}
										expression="LFR1 . mois éligibles"
										linkToRule={false}
										precision={0}
									/>
								</Bold>
							</Li>
						</Ul>
					</Li>
				</RecapExpert>
			</Trans>
		</>
	)
}