import { ReactElement, useState } from 'react'
import { Trans } from 'react-i18next'
import {
	Bar,
	BarChart,
	LabelList,
	ReferenceLine,
	Tooltip,
	XAxis,
} from 'recharts'

import { StyledLegend } from '@/components/charts/PagesCharts'
import { Radio, ToggleGroup } from '@/design-system'
import { Emoji } from '@/design-system/emoji'
import { Spacing } from '@/design-system/layout'
import { Strong } from '@/design-system/typography'
import { Li, Ul } from '@/design-system/typography/list'
import { Body } from '@/design-system/typography/paragraphs'
import { useDarkMode } from '@/hooks/useDarkMode'

import { RealResponsiveContainer } from './Chart'
import { SatisfactionLevel } from './types'

export const SatisfactionStyle: [
	SatisfactionLevel,
	{ emoji: string; color: string }
][] = [
	[SatisfactionLevel.Mauvais, { emoji: '🙁', color: '#D97C76' }],
	[SatisfactionLevel.Moyen, { emoji: '😐', color: '#f3dd68' }],
	[SatisfactionLevel.Bien, { emoji: '🙂', color: '#90e789' }],
	[SatisfactionLevel.TrèsBien, { emoji: '😀', color: '#17B890' }],
]

function toPercentage(data: Record<string, number>) {
	const total = Object.values(data).reduce((a, b: number) => a + b, 0)

	return {
		percent: Object.fromEntries(
			Object.entries(data).map(([key, value]) => [key, (100 * value) / total])
		),
		total,
	}
}

type SatisfactionChartProps = {
	data: Array<{
		date: string
		nombre: Record<string, number>
	}>
}

type DataType = 'nombres' | 'pourcentage'

export default function SatisfactionChart({ data }: SatisfactionChartProps) {
	const [darkMode] = useDarkMode()
	const [dataType, setDataType] = useState<DataType>('nombres')

	if (!data.length) {
		return null
	}

	const flattenData = data
		.map((d) => ({
			...d,
			...toPercentage(d.nombre),
			info:
				d.date === '2022-01-01T00:00:00.000Z' ? (
					<ChangeJanuary2022 />
				) : d.date === '2023-01-01T00:00:00.000Z' ? (
					<ChangeJanuary2023 />
				) : null,
		}))
		.filter((d) => Object.values(d.nombre).reduce((a, b) => a + b, 0))

	return (
		<Body as="div">
			<ToggleGroup
				onChange={(val) => setDataType(val as DataType)}
				defaultValue={dataType}
			>
				<Radio value="nombres">
					<Trans>nombres</Trans>
				</Radio>
				<Radio value="pourcentage">
					<Trans>pourcentage</Trans>
				</Radio>
			</ToggleGroup>

			<Spacing sm />

			<RealResponsiveContainer width="100%" height={400}>
				<BarChart data={flattenData}>
					<XAxis
						dataKey="date"
						tickFormatter={formatMonth}
						angle={-45}
						textAnchor="end"
						height={60}
						minTickGap={-8}
						stroke={darkMode ? 'lightGrey' : 'darkGray'}
					/>
					<Tooltip content={<CustomTooltip dataType={dataType} />} />

					{SatisfactionStyle.map(([level, { emoji, color }]) => (
						<Bar
							key={level}
							dataKey={`${
								dataType === 'nombres' ? 'nombre' : 'percent'
							}.${level}`}
							stackId="1"
							fill={color}
							maxBarSize={50}
						>
							<LabelList
								dataKey={`${dataType === 'nombres' ? 'nombre' : 'percent'}`}
								content={() => emoji}
								position="left"
							/>
						</Bar>
					))}

					{flattenData
						.filter(({ info }) => info)
						.map(({ date }) => (
							<ReferenceLine
								key={date}
								x={date}
								stroke={darkMode ? 'lightGrey' : 'darkGray'}
								strokeWidth={2}
							/>
						))}
				</BarChart>
			</RealResponsiveContainer>
		</Body>
	)
}

const ChangeJanuary2022 = () => {
	return (
		<Body style={{ maxWidth: '350px' }}>
			<Trans i18nKey="stats.change_january_2022">
				Modification du module de retours utilisateurs entraînant une baisse
				significative des avis
			</Trans>
		</Body>
	)
}

const ChangeJanuary2023 = () => {
	return (
		<Body style={{ maxWidth: '350px' }}>
			<Trans i18nKey="stats.change_january_2023">
				Modification du module de retours utilisateurs
			</Trans>
		</Body>
	)
}

function formatMonth(date: string | Date) {
	return new Date(date).toLocaleString('default', {
		month: 'short',
		year: '2-digit',
	})
}

interface Stat {
	'très bien': number
	bien: number
	moyen: number
	mauvais: number
}

type CustomTooltipProps = {
	dataType: DataType
	active?: boolean
	payload?: {
		payload?: {
			info: ReactElement | null
			date: string | Date
			nombre: Stat
			percent: Stat
			total: number
		}
	}[]
}

const CustomTooltip = ({ payload, active, dataType }: CustomTooltipProps) => {
	const { date, nombre, percent, total, info } =
		(payload && payload.length > 0 && payload[0].payload) || {}
	const data = dataType === 'pourcentage' ? percent : nombre

	if (!active || !data || !date || typeof total !== 'number') {
		return null
	}

	return (
		<StyledLegend>
			{info}
			<Body>
				Sur{' '}
				<Strong style={total < 10 ? { color: 'red' } : {}}>{total} avis</Strong>{' '}
				en {formatMonth(date)} :
			</Body>
			<Ul size="XS">
				<Li>
					<Strong>
						{Math.round((data['très bien'] ?? 0) + (data.bien ?? 0))}
						{dataType === 'pourcentage' ? '%' : ''}
					</Strong>{' '}
					satisfaits{' '}
					<small>
						({Math.round(data['très bien'] ?? 0)}
						{dataType === 'pourcentage' ? '%' : ''} <Emoji emoji="😀" /> /{' '}
						{Math.round(data.bien ?? 0)}
						{dataType === 'pourcentage' ? '%' : ''} <Emoji emoji="🙂" />)
					</small>
				</Li>
				<Li>
					<Strong>
						{Math.round((data.moyen ?? 0) + (data.mauvais ?? 0))}
						{dataType === 'pourcentage' ? '%' : ''}
					</Strong>{' '}
					négatifs{' '}
					<small>
						({Math.round(data.moyen ?? 0)}
						{dataType === 'pourcentage' ? '%' : ''} <Emoji emoji="😐" /> /{' '}
						{Math.round(data.mauvais ?? 0)}
						{dataType === 'pourcentage' ? '%' : ''} <Emoji emoji="🙁" />)
					</small>
					<Emoji emoji="" />
				</Li>
			</Ul>
		</StyledLegend>
	)
}
