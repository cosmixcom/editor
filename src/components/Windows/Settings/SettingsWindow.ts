import { createWindow } from '../create'
import { SidebarItem } from '../Layout/Sidebar'
import { Control } from './Controls/Control'
import SettingsWindowComponent from './SettingsWindow.vue'
import { setupSettings } from './setupSettings'
import Vue from 'vue'
import { App } from '@/App'
import { SettingsSidebar } from './SettingsSidebar'
import { setSettingsState, settingsState } from './SettingsState'

export class SettingsWindow {
	protected sidebar = new SettingsSidebar([])
	protected window?: any

	setup() {
		this.addCategory('general', 'General', 'mdi-circle-outline')
		this.addCategory('appearance', 'Appearance', 'mdi-palette-outline')
		this.addCategory('editor', 'Editor', 'mdi-pencil-outline')
		this.addCategory('keybindings', 'Keybindings', 'mdi-keyboard-outline')
		this.addCategory('extensions', 'Extensions', 'mdi-puzzle-outline')
		this.addCategory('developers', 'Developers', 'mdi-wrench-outline')

		setupSettings(this)
	}

	addCategory(id: string, name: string, icon: string) {
		if (settingsState[id] === undefined) settingsState[id] = {}
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: name,
				icon,
				id,
			}),
			[]
		)
	}

	addControl(control: Control<any>) {
		const category = <Control<any>[]>(
			this.sidebar.state[control.config.category]
		)
		if (!category)
			throw new Error(
				`Undefined settings category: ${control.config.category}`
			)

		category.push(control)
	}

	static saveSettings() {
		return new Promise<void>(resolve => {
			App.ready.once(async app => {
				await app.fileSystem.writeJSON(
					'data/settings.json',
					settingsState
				)
				resolve()
			})
		})
	}
	static loadSettings() {
		return new Promise<void>(resolve => {
			App.ready.once(async app => {
				try {
					setSettingsState(
						await app.fileSystem.readJSON('data/settings.json')
					)
				} catch {}

				resolve()
			})
		})
	}

	async open() {
		this.sidebar.removeElements()
		this.setup()

		this.window = createWindow(
			SettingsWindowComponent,
			{
				sidebar: this.sidebar,
				settingsState,
			},
			undefined,
			() => {
				SettingsWindow.saveSettings()
			}
		)
		this.window.open()
	}
	close() {
		this.window.close()
	}
}
