import { SimulationConfig } from '../configs/types'

const ISSimulationConfig: SimulationConfig = {
	'unité par défaut': '€/an',
	situation: {
		salarié: 'non',
		'entreprise . catégorie juridique': "''",
		'entreprise . imposition': "'IS'",
		'entreprise . imposition . IS . éligible taux réduit': 'oui',
		'entreprise . TVA . franchise de TVA': 'non',
	},
}

export default ISSimulationConfig
