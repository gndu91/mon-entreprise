import { ComponentMeta } from '@storybook/react'

import { SvgIcon } from '.'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	component: SvgIcon,
} as ComponentMeta<typeof SvgIcon>

export {
	CarretDownIcon,
	ChevronIcon,
	CircleIcon,
	ClockIcon,
	EditIcon,
	ErrorIcon,
	HexagonIcon,
	InfoIcon,
	ReturnIcon,
	SearchIcon,
	SuccessIcon,
	TriangleIcon,
} from '@/design-system/icons'
