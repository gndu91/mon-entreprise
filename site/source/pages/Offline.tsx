import DefaultHelmet from '@/components/utils/DefaultHelmet'
import { Message } from '@/design-system'
import { Grid } from '@/design-system/layout'
import { Body, Intro } from '@/design-system/typography/paragraphs'

export default function Offline() {
	return (
		<Grid
			container
			css={{ justifyContent: 'center', margin: '10rem 0' }}
			role="main"
		>
			<Grid item md={8} sm={12}>
				<DefaultHelmet>
					<title>Hors ligne</title>
				</DefaultHelmet>
				<Message type="info" css={{ margin: '1rem 0' }}>
					<Intro>Vous êtes actuellement hors ligne.</Intro>
					<Body>
						Cette page n'a pas encore été téléchargée et n'est donc pas
						disponible sans internet, pour y accéder vérifiez votre connexion
						puis rechargez la page.
					</Body>
				</Message>
			</Grid>
		</Grid>
	)
}
