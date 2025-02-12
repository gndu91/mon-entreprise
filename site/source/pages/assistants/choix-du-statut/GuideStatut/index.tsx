import { useEffect } from 'react'
import { Trans } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { TrackChapter } from '@/components/ATInternetTracking'
import { FromBottom } from '@/components/ui/animate'
import { H1 } from '@/design-system/typography/heading'
import { Link } from '@/design-system/typography/link'
import { useSitePaths } from '@/sitePaths'
import { resetCompanyStatusChoice } from '@/store/actions/companyStatusActions'
import { RootState } from '@/store/reducers/rootReducer'

import AutoEntrepreneur from './AutoEntrepreneur'
import DirectorStatus from './DirectorStatus'
import MinorityDirector from './MinorityDirector'
import NumberOfAssociate from './NumberOfAssociate'
import PickLegalStatus from './PickLegalStatus'
import PreviousAnswers from './PreviousAnswers'
import SoleProprietorship from './SoleProprietorship'

const useResetFollowingAnswers = () => {
	const dispatch = useDispatch()
	const { absoluteSitePaths } = useSitePaths()
	const location = useLocation()
	const answeredQuestion = useSelector(
		(state: RootState) =>
			Object.keys(
				state.choixStatutJuridique.companyLegalStatus
			) as (keyof typeof state.choixStatutJuridique.companyLegalStatus)[]
	)
	useEffect(() => {
		const companyStatusCurrentQuestionName = (Object.entries(
			absoluteSitePaths.assistants['choix-du-statut'].guideStatut
		).find(([, pathname]) => location.pathname === pathname) || [])[0]
		if (!companyStatusCurrentQuestionName) {
			return
		}

		const firstAnswerToResetIndex = answeredQuestion.findIndex(
			(a) => a === companyStatusCurrentQuestionName
		)

		if (firstAnswerToResetIndex !== -1) {
			dispatch(
				resetCompanyStatusChoice(
					answeredQuestion.slice(firstAnswerToResetIndex)
				)
			)
		}
	}, [location.pathname, dispatch, absoluteSitePaths.assistants])
}

export default function Créer() {
	const { relativeSitePaths, absoluteSitePaths } = useSitePaths()
	const location = useLocation()
	useResetFollowingAnswers()

	return (
		<>
			<Link to={absoluteSitePaths.assistants['choix-du-statut'].index}>
				<span aria-hidden>←</span> <Trans>Retour</Trans>
			</Link>
			<TrackChapter chapter2="guide">
				<H1>
					<Trans i18nKey="formeJuridique.titre">
						Choix du statut juridique
					</Trans>
				</H1>
				<PreviousAnswers />
				<FromBottom key={location.pathname}>
					<Routes>
						<Route
							path={
								relativeSitePaths.assistants['choix-du-statut'].guideStatut
									.soleProprietorship
							}
							element={<SoleProprietorship />}
						/>
						<Route
							path={
								relativeSitePaths.assistants['choix-du-statut'].guideStatut
									.directorStatus
							}
							element={<DirectorStatus />}
						/>
						<Route
							path={
								relativeSitePaths.assistants['choix-du-statut'].guideStatut
									.autoEntrepreneur
							}
							element={<AutoEntrepreneur />}
						/>
						<Route
							path={
								relativeSitePaths.assistants['choix-du-statut'].guideStatut
									.multipleAssociates
							}
							element={<NumberOfAssociate />}
						/>
						<Route
							path={
								relativeSitePaths.assistants['choix-du-statut'].guideStatut
									.minorityDirector
							}
							element={<MinorityDirector />}
						/>
						<Route
							path={
								relativeSitePaths.assistants['choix-du-statut'].guideStatut
									.liste
							}
							element={<PickLegalStatus />}
						/>
						<Route
							index
							element={
								<Navigate
									to={
										absoluteSitePaths.assistants['choix-du-statut'].guideStatut
											.liste
									}
									replace
								/>
							}
						/>
					</Routes>
				</FromBottom>
			</TrackChapter>
		</>
	)
}
