import { useDispatch } from 'react-redux'

import fetchBénéfice from '@/api/activité-vers-bénéfice'
import { fetchCommuneDetails } from '@/api/commune'
import { FabriqueSocialEntreprise } from '@/api/fabrique-social'
import {
	addCommuneDetails,
	setBénéficeType,
	setCompany,
} from '@/store/actions/companyActions'

export function useSetEntreprise() {
	const dispatch = useDispatch()

	return (entreprise: FabriqueSocialEntreprise | null) => {
		if (entreprise === null) {
			return
		}

		dispatch(setCompany(entreprise))

		void fetchCommuneDetails(
			entreprise.firstMatchingEtablissement.codeCommuneEtablissement,
			entreprise.firstMatchingEtablissement.codePostalEtablissement
		).then(
			(communeDetails) =>
				communeDetails && dispatch(addCommuneDetails(communeDetails))
		)

		void fetchBénéfice(
			entreprise.firstMatchingEtablissement.activitePrincipaleEtablissement
		).then((bénéfice) => bénéfice && dispatch(setBénéficeType(bénéfice)))
	}
}
