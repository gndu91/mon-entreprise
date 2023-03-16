import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Chip } from '@/design-system'
import { Emoji } from '@/design-system/emoji'
import { H2, H3 } from '@/design-system/typography/heading'
import { Link } from '@/design-system/typography/link'
import { Li, Ol, Ul } from '@/design-system/typography/list'
import { Body } from '@/design-system/typography/paragraphs'
import { useFetchData } from '@/hooks/useFetchData'

import { StatsStruct } from './types'

export default function DemandeUtilisateurs() {
	const { data: stats } = useFetchData<StatsStruct>('/data/stats.json')
	const { t } = useTranslation()

	return (
		<section>
			<H2 id="demandes-utilisateurs">Demandes utilisateurs</H2>
			<Body>
				Demandes formulées en utilisant le bouton "<Emoji emoji="👋" />" à
				droite de votre écran.
				<Link
					href="https://github.com/betagouv/mon-entreprise/blob/master/CONTRIBUTING.md#retours-utilisateurs"
					target="_blank"
					aria-label={t(
						'Comment ça marche ? Voir la page explicative sur la page du dépôt github, nouvelle fenêtre'
					)}
				>
					Comment ça marche ?
				</Link>
			</Body>

			<H3>En attente d'implémentation</H3>
			<Pagination items={stats?.retoursUtilisateurs.open ?? []} />

			<H3>Réalisées</H3>
			<Pagination items={stats?.retoursUtilisateurs.closed ?? []} />
		</section>
	)
}

type IssueProps = {
	title: string
	number: number
	count: number
	closedAt: string | null
}

type PaginationProps = {
	items: Array<IssueProps>
}

function Pagination({ items }: PaginationProps) {
	const [currentPage, setCurrentPage] = useState(0)

	return (
		<>
			<Ol>
				{[
					{
						title:
							'mon-entreprise: bug scrolling de la popup Answers (desktop et mobile)',
						closedAt: '2021-01-12T16:22:52Z',
						number: 1326,
						count: 1,
					},
					{
						title: 'Question vide avec le lien direct "impot"',
						closedAt: '2021-01-05T16:18:10Z',
						number: 1311,
						count: 2,
					},
					{
						title:
							'Abattament fiscal de 10% seulement sur les traitements et salaires',
						closedAt: '2021-01-05T14:02:59Z',
						number: 1306,
						count: 2,
					},
					{
						title: 'Franchise de TVA pour les professions libérales',
						closedAt: '2021-01-04T11:35:22Z',
						number: 1216,
						count: 1,
					},
					{
						title:
							"Simulateur Auto-Entrepreneur : chiffre d'affaire affiché à 100 000 000 €/an",
						closedAt: '2020-12-10T11:10:13Z',
						number: 1246,
						count: 1,
					},
				]
					.slice(currentPage * 10, (currentPage + 1) * 10)
					.map((item) => (
						<Issue key={`issue-${item.number}`} {...item} />
					))}
			</Ol>
			<Pager>
				{[...Array(Math.ceil(items.length / 10)).keys()].map((i) => (
					<li key={i}>
						<PagerButton
							onPress={() => setCurrentPage(i)}
							currentPage={currentPage === i}
							aria-selected={currentPage === i ? true : undefined}
							aria-current={currentPage === i ? 'page' : undefined}
						>
							{i + 1}
						</PagerButton>
					</li>
				))}
			</Pager>
		</>
	)
}

function Issue({ title, number, count, closedAt }: IssueProps) {
	const { t } = useTranslation()

	return (
		<Li>
			{count > 1 && <Chip>{count} demandes</Chip>}{' '}
			<Link
				href={`https://github.com/betagouv/mon-entreprise/issues/${number}`}
				aria-label={t(
					'{{title}}, voir la demande sur github.com, nouvelle fenêtre',
					{ title }
				)}
			>
				{title}
			</Link>{' '}
			{closedAt && <small>(Résolu en {formatMonth(new Date(closedAt))})</small>}
		</Li>
	)
}

function formatMonth(date: string | Date) {
	return new Date(date).toLocaleString('default', {
		month: 'long',
		year: 'numeric',
	})
}

type PagerButtonProps = {
	currentPage: boolean
	onPress: () => void
}

const PagerButton = styled.button<PagerButtonProps>`
	font-family: ${({ theme }) => theme.fonts.main};
	padding: 0.375rem 0.5rem;
	border: ${({ theme, currentPage }) =>
		currentPage
			? `2px solid ${theme.colors.bases.primary[500]}`
			: `1px solid ${theme.colors.extended.grey[300]}`};
	background-color: ${({ theme, currentPage }) =>
		currentPage
			? theme.colors.bases.primary[100]
			: theme.colors.extended.grey[100]};

	&:hover {
		background-color: ${({ theme }) => theme.colors.bases.primary[100]};
	}
`

const Pager = styled.ul`
	font-family: ${({ theme }) => theme.fonts.main};
	text-align: center;
	margin: auto;

	& li {
		list-style: none;
		display: inline-block;
		margin-right: 0.25rem;
	}

	& li:first-child {
		button {
			border-top-left-radius: 0.25rem;
			border-top-right-radius: 0;
			border-bottom-left-radius: 0.25rem;
			border-bottom-right-radius: 0;
		}
	}

	& li:last-child {
		button {
			border-top-right-radius: 0.25rem;
			border-bottom-right-radius: 0.25rem;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
			margin-right: 0;
		}
	}
`
