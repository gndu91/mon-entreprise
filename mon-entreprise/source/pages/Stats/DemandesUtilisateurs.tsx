import { FromTop } from 'Components/ui/animate'
import { H2, H3 } from 'DesignSystem/typography/heading'
import { useState } from 'react'
import stats from '../../data/stats.json'

export default function DemandeUtilisateurs() {
	return (
		<section>
			<H2 id="demandes-utilisateurs">Demandes utilisateurs</H2>
			<p>
				<small>
					Demandes formulées en utilisant le bouton "faire une suggestion"
					présent sur toutes les pages
				</small>
			</p>
			<H3>En attente d'implémentation</H3>
			<Pagination
				items={stats.retoursUtilisateurs.open}
				itemComponent={Issue}
			/>

			<H3>Réalisées</H3>
			<Pagination
				items={stats.retoursUtilisateurs.closed}
				itemComponent={Issue}
			/>
		</section>
	)
}

type PaginationProps<ItemProps> = {
	itemComponent: React.FC<ItemProps>
	items: Array<ItemProps>
}

function Pagination<ItemProps>({
	itemComponent,
	items,
}: PaginationProps<ItemProps>) {
	const [currentPage, setCurrentPage] = useState(0)
	return (
		<>
			<ul>
				{items
					.slice(currentPage * 10, (currentPage + 1) * 10)
					.map(itemComponent)}
			</ul>
			<div css={{ textAlign: 'center' }}>
				Page :
				{[...Array(Math.ceil(items.length / 10)).keys()].map((i) => (
					<button
						className="ui__ small"
						onClick={() => setCurrentPage(i)}
						style={i === currentPage ? { fontWeight: 'bold' } : {}}
						key={i}
					>
						{i + 1}
					</button>
				))}
			</div>
		</>
	)
}

function Issue({
	title,
	number,
	count,
	closedAt,
}: {
	title: string
	number: number
	count: number
	closedAt: string | null
}) {
	return (
		<FromTop>
			<li>
				{count > 1 && (
					<span className="ui__ small label">{count} demandes</span>
				)}{' '}
				<a href={`https://github.com/betagouv/mon-entreprise/issues/${number}`}>
					{title}
				</a>{' '}
				{closedAt && (
					<small>(Résolu en {formatMonth(new Date(closedAt))})</small>
				)}
			</li>
		</FromTop>
	)
}

function formatMonth(date: string | Date) {
	return new Date(date).toLocaleString('default', {
		month: 'long',
		year: 'numeric',
	})
}
