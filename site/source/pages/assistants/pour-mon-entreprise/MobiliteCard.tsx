import { Trans, useTranslation } from 'react-i18next'

import { Article } from '@/design-system/card'
import { useSitePaths } from '@/sitePaths'

export function MobiliteCard() {
	const { absoluteSitePaths } = useSitePaths()
	const { t } = useTranslation()

	return (
		<Article
			title={t(
				'gérer.ressources.export.title',
				'Exporter son activité en Europe'
			)}
			ctaLabel={t('gérer.ressources.export.cta', 'Remplir le formulaire')}
			to={absoluteSitePaths.assistants.formulaireMobilité}
		>
			<Trans i18nKey="gérer.ressources.export.body">
				Le formulaire pour effectuer une demande de mobilité internationale
				(détachement ou pluriactivité)
			</Trans>
		</Article>
	)
}
