declare module 'react-big-calendar' {
	import * as React from 'react'
	export interface Event { [key: string]: any }
	export interface SlotInfo { start: Date; end: Date; slots: Date[]; action: 'select' | 'click' | 'doubleClick' }
	export const Views: { MONTH: string; WEEK: string; DAY: string; AGENDA: string }
	export function Calendar(props: any): React.ReactElement
	export function dateFnsLocalizer(config: any): any
}