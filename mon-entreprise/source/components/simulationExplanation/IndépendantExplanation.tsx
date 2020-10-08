import Value, { Condition } from 'Components/EngineValue'
import StackedBarChart from 'Components/StackedBarChart'
import * as Animate from 'Components/ui/animate'
import { ThemeColorsContext } from 'Components/utils/colors'
import Emoji from 'Components/utils/Emoji'
import { EngineContext } from 'Components/utils/EngineContext'
import assuranceMaladieSrc from 'Images/assurance-maladie.svg'
import * as logosSrc from 'Images/logos-cnavpl'
import urssafSrc from 'Images/urssaf.svg'
import { max } from 'ramda'
import React, { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { DottedName } from 'Rules'
import { targetUnitSelector } from 'Selectors/simulationSelectors'
import styled from 'styled-components'
import BarChartBranch from 'Components/BarChart'
import 'Components/Distribution.css'
import RuleLink from 'Components/RuleLink'
// import Distribution from 'Components/Distribution'

export default function IndépendantExplanation() {
	const engine = useContext(EngineContext)
	const { t } = useTranslation()
	const { palettes } = useContext(ThemeColorsContext)

	return (
		<>
			<Condition expression="entreprise . catégorie d'activité . libérale règlementée">
				<PLExplanation />
			</Condition>
			<section>
				<h2>Répartition de la rémunération totale</h2>
				<StackedBarChart
					data={[
						{
							...engine.evaluate('revenu net après impôt'),
							title: t('Revenu disponible'),
							color: palettes[0][0]
						},
						{ ...engine.evaluate('impôt'), color: palettes[1][0] },
						{
							...engine.evaluate(
								'dirigeant . indépendant . cotisations et contributions'
							),
							title: t('Cotisations'),
							color: palettes[1][1]
						}
					]}
				/>
			</section>
			<section>
				<h2>
					<Trans>À quoi servent mes cotisations ?</Trans>
				</h2>
				<Distribution />
			</section>
		</>
	)
}

function PLExplanation() {
	return (
		<section>
			<Trans i18nKey="simulateurs.explanation.pamc">
				<Animate.fromBottom>
					<h2>Vos institutions partenaires</h2>
					<div className="ui__ box-container">
						<div className="ui__  card box">
							<a target="_blank" href="https://www.urssaf.fr/portail/home.html">
								<LogoImg src={urssafSrc} title="logo Urssaf" />
							</a>
							<p
								className="ui__ notice"
								css={`
									flex: 1;
								`}
							>
								Les cotisations recouvrées par l'Urssaf, qui servent au
								financement de la sécurité sociale (assurance maladie,
								allocations familiales, dépendance)
							</p>
							<p className="ui__ lead">
								<Value expression="dirigeant . indépendant . PL . cotisations Urssaf" />
							</p>
						</div>
						<CaisseRetraite />
						<Condition expression="dirigeant . indépendant . PL . PAMC . participation CPAM > 0">
							<div className="ui__  card box">
								<a
									target="_blank"
									href="https://www.urssaf.fr/portail/home/praticien-et-auxiliaire-medical/mes-cotisations/le-calcul-de-mes-cotisations/la-participation-de-la-cpam-a-me.html"
								>
									<LogoImg src={assuranceMaladieSrc} title="Logo CPAM" />
								</a>
								<p
									className="ui__ notice"
									css={`
										flex: 1;
									`}
								>
									En tant que professionnel de santé conventionné, vous
									bénéficiez d'une prise en charge d'une partie de vos
									cotisations par l'Assurance Maladie.
								</p>
								<p className="ui__ lead">
									<Emoji emoji="🎁" />{' '}
									<Value expression="dirigeant . indépendant . PL . PAMC . participation CPAM" />
								</p>
							</div>
						</Condition>
					</div>
				</Animate.fromBottom>
			</Trans>
		</section>
	)
}

function CaisseRetraite() {
	const engine = useContext(EngineContext)
	return (
		<>
			{['CARCDSF', 'CARPIMKO', 'CIPAV', 'CARMF'].map(caisse => {
				const dottedName = `dirigeant . indépendant . PL . ${caisse}` as DottedName
				const { description, références } = engine.evaluate(dottedName)
				return (
					<Condition expression={dottedName} key={caisse}>
						<div className="ui__  card box">
							<a
								target="_blank"
								href={références && Object.values(références)[0]}
							>
								<LogoImg src={logosSrc[caisse]} title={`logo ${caisse}`} />
							</a>
							<p
								className="ui__ notice"
								css={`
									flex: 1;
								`}
							>
								{description}{' '}
								<Trans i18nKey="simulateurs.explanation.CNAPL">
									Elle recouvre les cotisations liées à votre retraite et au
									régime d'invalidité-décès.
								</Trans>
							</p>

							<p className="ui__ lead">
								<Value expression="dirigeant . indépendant . PL . cotisations caisse de retraite" />
							</p>
						</div>
					</Condition>
				)
			})}
		</>
	)
}

const LogoImg = styled.img`
	padding: 1rem;
	height: 5rem;
`

const CotisationsSection: Record<DottedName, DottedName[]> = {
	'protection sociale . retraite': [
		'dirigeant . indépendant . cotisations et contributions . retraite de base',
		'dirigeant . indépendant . cotisations et contributions . retraite complémentaire',
		'dirigeant . indépendant . cotisations et contributions . PCV'
	],
	'protection sociale . santé': [
		'dirigeant . indépendant . cotisations et contributions . maladie',
		'dirigeant . indépendant . cotisations et contributions . indemnités journalières maladie',
		'dirigeant . indépendant . cotisations et contributions . CSG et CRDS * 5.95 / 9.2'
	],
	'protection sociale . invaditité et décès': [
		'dirigeant . indépendant . cotisations et contributions . invalidité et décès'
	],
	'protection sociale . famille': [
		'dirigeant . indépendant . cotisations et contributions . allocations familiales',
		'dirigeant . indépendant . cotisations et contributions . CSG et CRDS * 0.95 / 9.2'
	],
	'protection sociale . autres': [
		'dirigeant . indépendant . cotisations et contributions . contributions spéciales',
		'dirigeant . indépendant . cotisations et contributions . CSG et CRDS * 2.3 / 9.2'
	],
	'protection sociale . formation': [
		'dirigeant . indépendant . cotisations et contributions . formation professionnelle'
	]
}

function Distribution() {
	const targetUnit = useSelector(targetUnitSelector)
	const engine = useContext(EngineContext)
	const distribution = (Object.entries(
		CotisationsSection
	).map(([section, cotisations]) => [
		section,
		cotisations
			.map(c => engine.evaluate(c, { unit: targetUnit }))
			.reduce(
				(acc, evaluation) => acc + ((evaluation?.nodeValue as number) || 0),
				0
			)
	]) as Array<[DottedName, number]>)
		.filter(([, value]) => value > 0)
		.sort(([, a], [, b]) => b - a)

	const maximum = distribution.map(([, value]) => value).reduce(max, 0)

	return (
		<div className="distribution-chart__container">
			{distribution.map(([sectionName, value]) => (
				<DistributionBranch
					key={sectionName}
					dottedName={sectionName}
					value={value}
					maximum={maximum}
				/>
			))}
		</div>
	)
}

type DistributionBranchProps = {
	dottedName: DottedName
	value: number
	maximum: number

	icon?: string
}

function DistributionBranch({
	dottedName,
	value,
	icon,
	maximum
}: DistributionBranchProps) {
	const rules = useContext(EngineContext).getParsedRules()
	const branche = rules[dottedName]

	return (
		<BarChartBranch
			value={value}
			maximum={maximum}
			title={<RuleLink dottedName={dottedName} />}
			icon={icon ?? branche.icons}
			description={branche.summary}
			unit="€"
		/>
	)
}
