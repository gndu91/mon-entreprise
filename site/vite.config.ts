/* eslint-disable no-console */
import replace from '@rollup/plugin-replace'
import yaml, { ValidYamlType } from '@rollup/plugin-yaml'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs/promises'
import path from 'path'
import serveStatic from 'serve-static'
import { Plugin, defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { runScriptOnFileChange } from './scripts/runScriptOnFileChange'
import { pwaOptions } from './vite-pwa-options'

const env = (mode: string) => loadEnv(mode, process.cwd(), '')

export default defineConfig(({ command, mode }) => ({
	resolve: {
		alias: [{ find: '@', replacement: path.resolve('./source') }],
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
	},
	publicDir: 'source/public',
	build: {
		sourcemap: true,
		rollupOptions: {
			output: {
				chunkFileNames: (chunkInfo) => {
					if (chunkInfo.isDynamicEntry) {
						return 'assets/lazy_[name].[hash].js'
					}

					return 'assets/[name].[hash].js'
				},
			},
		},
	},
	define: {
		BRANCH_NAME: JSON.stringify(getBranch(mode)),
		IS_DEVELOPMENT: mode === 'development',
		IS_STAGING: mode === 'production' && !isProductionBranch(mode),
		IS_PRODUCTION: mode === 'production' && isProductionBranch(mode),
	},
	plugins: [
		{
			name: 'run-script-on-file-change',
			apply: 'serve',
			buildStart() {
				if (mode === 'development') {
					void runScriptOnFileChange()
				}
			},
		},
		command === 'build' &&
			replace({
				__SENTRY_DEBUG__: false,
				preventAssignment: false,
			}),
		react({
			plugins: [['@swc/plugin-styled-components', { pure: true }]],
		}),
		yaml({
			transform(data, filePath) {
				return filePath.endsWith('/rules-en.yaml')
					? cleanAutomaticTag(data)
					: data
			},
		}),
		multipleSPA({
			defaultSite: 'mon-entreprise',
			templatePath: './source/entries/template.html',
			sites: {
				'mon-entreprise': {
					lang: 'fr',
					entry: '/source/entries/entry-fr.tsx',
					title:
						"mon-entreprise.urssaf.fr : L'assistant officiel du créateur d'entreprise",
					description:
						'Du statut juridique à la première embauche, en passant par la simulation des cotisations, vous trouverez ici toutes les ressources pour démarrer votre activité.',
					shareImage: '/source/assets/images/logo-monentreprise.svg',
					shareImageAlt: 'Logo mon-entreprise, site Urssaf',
				},
				infrance: {
					lang: 'en',
					entry: '/source/entries/entry-en.tsx',
					title:
						'My company in France: A step-by-step guide to start a business in France',
					description:
						'Find the type of company that suits you and follow the steps to register your company. Discover the French social security system by simulating your hiring costs. Discover the procedures to hire in France and learn the basics of French labour law.',
					shareImage: '/logo-mycompany-share.png',
					shareImageAlt: 'Logo My company in France by Urssaf',
				},
			},
		}),
		VitePWA(pwaOptions),
		legacy({
			targets: ['defaults', 'not IE 11'],
		}),
	],
	server: {
		port: 3000,
		hmr: {
			clientPort:
				typeof env(mode).HMR_CLIENT_PORT !== 'undefined'
					? parseInt(env(mode).HMR_CLIENT_PORT)
					: undefined,
		},
		// Keep watching changes in the publicodes package to support live reload
		// when we iterate on publicodes logic.
		// https://vitejs.dev/config/#server-watch
		watch: {
			ignored: [
				'!**/node_modules/publicodes/**',
				'!**/node_modules/publicodes-react/**',
			],
		},
		proxy: {
			'/api': 'http://localhost:3004',
			'/twemoji': {
				target: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/twemoji/, ''),
				timeout: 3 * 1000,
			},
		},
	},
	optimizeDeps: {
		entries: ['./source/entries/entry-fr.tsx', './source/entries/entry-en.tsx'],
		include: ['publicodes-react > react/jsx-runtime'],
		exclude: ['publicodes-react', 'publicodes'],
	},
	ssr: {
		/**
		 * Prevent listed dependencies from being externalized for SSR build cause some
		 * packages are not esm ready or package.json setup seems wrong, wait this pr to be merge:
		 * markdown-to-jsx: https://github.com/probablyup/markdown-to-jsx/pull/414
		 * styled-components: https://github.com/styled-components/styled-components/issues/3601 (wait v6 release)
		 */
		noExternal: [
			/markdown-to-jsx/,
			/styled-components|emotion/,
			/publicodes-react/, // use styled-components
		],
	},
}))

type MultipleSPAOptions = {
	defaultSite: string
	templatePath: string
	sites: Record<string, Record<string, string>>
}

/**
 * A custom plugin to create multiple virtual html files from a template. Will
 * generate distinct entry points and single-page application outputs.
 */
function multipleSPA(options: MultipleSPAOptions): Plugin {
	const fillTemplate = async (siteName: string) => {
		const siteData = options.sites[siteName]
		const template = await fs.readFile(options.templatePath, 'utf-8')
		const filledTemplate = template
			.toString()
			.replace(/\{\{(.+)\}\}/g, (_match, p1) => siteData[(p1 as string).trim()])

		return filledTemplate
	}

	return {
		name: 'multiple-spa',
		enforce: 'pre',

		configureServer(vite) {
			// TODO: this middleware is specific to the "mon-entreprise" app and
			// shouldn't be in the "multipleSPA" plugin
			vite.middlewares.use(
				'/simulateur-iframe-integration.js',
				serveStatic(new URL('./dist', import.meta.url).pathname, {
					index: 'simulateur-iframe-integration.js',
				})
			)
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			vite.middlewares.use(async (req, res, next) => {
				const url = req.originalUrl?.replace(/^\/%2F/, '/')

				const firstLevelDir = url?.slice(1).split('/')[0]

				if (url && /\?.*html-proxy/.test(url)) {
					return next()
				}

				if (url && ['/', '/index.html'].includes(url)) {
					res.writeHead(302, { Location: '/' + options.defaultSite }).end()
				}
				// this condition is for the start:netlify script to match /mon-entreprise or /infrance
				else if (
					firstLevelDir &&
					url &&
					Object.keys(options.sites)
						.map((site) => `/${site}.html`)
						.includes(url)
				) {
					const siteName = firstLevelDir.replace('.html', '')
					const content = await vite.transformIndexHtml(
						'/' + siteName,
						await fillTemplate(siteName)
					)
					res.end(content)
				} else if (
					firstLevelDir &&
					Object.keys(options.sites).some((name) => firstLevelDir === name)
				) {
					const siteName = firstLevelDir
					const content = await vite.transformIndexHtml(
						url,
						await fillTemplate(siteName)
					)
					res.end(content)
				} else {
					next()
				}
			})
		},

		config(config, { command }) {
			if (command === 'build' && !config.build?.ssr) {
				config.build = {
					...config.build,
					rollupOptions: {
						...config.build?.rollupOptions,
						input: Object.fromEntries(
							Object.keys(options.sites).map((name) => [
								name,
								`virtual:${name}.html`,
							])
						),
					},
				}
			}
		},

		resolveId(id) {
			const pathname = id.split('/').slice(-1)[0]
			if (pathname?.startsWith('virtual:')) {
				return pathname.replace('virtual:', '')
			}

			return null
		},

		async load(id) {
			if (
				Object.keys(options.sites).some((name) => id.endsWith(name + '.html'))
			) {
				return await fillTemplate(id.replace(/\.html$/, ''))
			}
		},
	}
}

/**
 * Git branch name
 */
export const getBranch = (mode: string) => {
	let branch: string | undefined = env(mode)
		.VITE_GITHUB_REF?.split('/')
		?.slice(-1)?.[0]

	if (branch === 'merge') {
		branch = env(mode).VITE_GITHUB_HEAD_REF
	}

	return branch ?? ''
}

/**
 * We use this function to hide some features in production while keeping them
 * in feature-branches. In case we do A/B testing with several branches served
 * in production, we should add the public faced branch names in the test below.
 * This is different from the import.meta.env.MODE in that a feature branch may
 * be build in production mode (with the NODE_ENV) but we may still want to show
 * or hide some features.
 */
export const isProductionBranch = (mode: string) => {
	return ['master', 'next'].includes(getBranch(mode))
}

const cleanAutomaticTag = (data: ValidYamlType): ValidYamlType => {
	if (typeof data === 'string' && data.startsWith('[automatic] ')) {
		return data.replace('[automatic] ', '')
	}

	if (Array.isArray(data)) {
		return data.map((val) => cleanAutomaticTag(val))
	}

	if (data && typeof data === 'object') {
		return Object.fromEntries<ValidYamlType>(
			Object.entries(data).map(([key, val]) => [key, cleanAutomaticTag(val)])
		)
	}

	return data
}
