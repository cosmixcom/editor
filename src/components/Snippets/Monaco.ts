import { languages, editor, Position } from 'monaco-editor'
import { getLocation } from '/@/utils/monaco/getLocation'
import { App } from '/@/App'
import { FileTab } from '../TabSystem/FileTab'
import json5 from 'json5'
import { getLatestFormatVersion } from '../Data/FormatVersions'

languages.registerCompletionItemProvider('json', {
	// @ts-ignore provideCompletionItems doesn't require a range property inside of the completion items
	provideCompletionItems: async (
		model: editor.ITextModel,
		position: Position
	) => {
		const app = await App.getApp()
		const location = getLocation(model, position)
		const currentTab = app.project.tabSystem?.selectedTab

		if (!(currentTab instanceof FileTab)) return { suggestions: [] }
		const fileType = currentTab.getFileType()

		let json: any
		try {
			json = json5.parse(model.getValue())
		} catch {
			json = {}
		}

		const currentFormatVersion: string =
			(<any>json).format_version ||
			app.project.config.get().targetVersion ||
			(await getLatestFormatVersion())

		return {
			suggestions: app.project.snippetLoader
				.getSnippetsFor(currentFormatVersion, fileType, [location])
				.map((snippet) => ({
					kind: languages.CompletionItemKind.Snippet,
					label: snippet.displayData.name,
					documentation: snippet.displayData.description,
					insertText: snippet.insertText,
				})),
		}
	},
})
