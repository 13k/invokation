// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ui {
      export namespace tag_select {
        const {
          l10n: L10n,
          layout: Layout,
          custom_events: { GameEvent },
          panorama: { createPanelSnippet },
          util: { kebabCase, pascalCase, uniqueId },
          sequence: {
            AddOptionAction,
            ParallelSequence,
            RunFunctionAction,
            Sequence,
            StopSequence,
          },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.component.Component;

        export interface Elements extends component.Elements {
          list: Panel;
          options: DropDown;
        }

        export interface Inputs extends component.Inputs {
          Clear: undefined;
          SetOptions: {
            options: Set<string>;
          };
        }

        export interface Outputs extends component.Outputs {
          OnChange: {
            tags: Set<string>;
          };
        }

        enum Snippet {
          Tag = "UITagSelectTag",
        }

        enum PanelID {
          PopupTextEntry = "TagSelectPopupTextEntry",
          TagRemoveButton = "UITagSelectTagRemoveButton",
          TagPrefix = "UITagSelectTag",
          OptionPrefix = "UITagSelectOption",
        }

        enum CssClass {
          Option = "UITagSelectOption",
        }

        enum OptionValue {
          Empty = "__empty__",
          TextEntry = "__text_entry__",
        }

        const OptionID = {
          Empty: `${PanelID.OptionPrefix}${OptionValue.Empty}`,
          TextEntry: `${PanelID.OptionPrefix}${OptionValue.TextEntry}`,
        };

        enum Timing {
          TagDeleteDelay = 0.25,
        }

        const normalizeTag = (tag: string): string => kebabCase(tag);
        const tagId = (tag: string): string => pascalCase(`${PanelID.TagPrefix}${tag}`);
        const optionId = (option: string): string => pascalCase(`${PanelID.OptionPrefix}${option}`);

        export class TagSelect extends Component<Elements, Inputs, Outputs> {
          options: Set<string> = new Set();
          tags: Set<string> = new Set();
          tagPanels: Map<string, Panel> = new Map();
          popupTextEntryChannel: string;

          constructor() {
            super({
              elements: {
                list: "UITagSelectTagList",
                options: "UITagSelectOptions",
              },
              inputs: {
                SetOptions: (payload) => this.setOptions(payload),
                Clear: (payload) => this.onClearTags(payload),
              },
              customEvents: {
                [GameEvent.POPUP_TEXT_ENTRY_SUBMIT]: (payload) =>
                  this.onPopupTextEntrySubmit(payload),
              },
              panelEvents: {
                options: {
                  oninputsubmit: () => this.onOptionSelect(),
                },
              },
            });

            this.popupTextEntryChannel = uniqueId("popup_text_entry_");

            this.debug("init");
          }

          // ----- I/O -----

          setOptions(payload: Inputs["SetOptions"]) {
            this.debug("setOptions()", payload);
            this.options = payload.options;
            this.renderOptions();
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onClearTags(_payload: Inputs["Clear"]) {
            this.clearTags();
          }

          // ----- Event handlers -----

          onTagRemove(tag: string) {
            this.debug("onTagRemove()", tag);
            this.removeTag(tag);
          }

          onOptionSelect() {
            const selected = this.elements.options.GetSelected();

            this.debug("OnOptionSelect", { id: selected?.id });

            if (selected == null) return;

            const option = selected.GetAttributeString("value", "");

            switch (option) {
              case OptionValue.Empty:
                return;
              case OptionValue.TextEntry:
                this.showTagEntryPopup();
                break;
              default:
                this.addTag(option);
            }

            this.elements.options.SetSelected(OptionID.Empty);
          }

          onPopupTextEntrySubmit(payload: NetworkedData<custom_events.PopupTextEntrySubmit>) {
            if (payload.channel !== this.popupTextEntryChannel) {
              return;
            }

            this.debug("onPopupTextEntrySubmit()", payload);

            if ((payload.text?.length ?? 0) > 0) {
              this.addTag(payload.text);
            }
          }

          // ----- Helpers -----

          notifyChange() {
            this.output("OnChange", { tags: this.tags });
          }

          selectTag(rawTag: string) {
            const tag = normalizeTag(rawTag);

            if (tag.length === 0) {
              return null;
            }

            this.tags.add(tag);

            return tag;
          }

          deselectTag(rawTag: string) {
            const tag = normalizeTag(rawTag);

            return this.tags.delete(tag) ? tag : null;
          }

          isTagSelected(tag: string) {
            return this.tags.has(normalizeTag(tag));
          }

          registerTagPanel(tag: string, panel: Panel) {
            this.tagPanels.set(tag, panel);
          }

          getTagPanel(tag: string) {
            const panel = this.tagPanels.get(tag);

            if (panel == null) {
              throw new Error(`Could not find panel for tag ${tag}`);
            }

            return panel;
          }

          unregisterTagPanel(tag: string) {
            this.tagPanels.delete(tag);
          }

          createOption(option: string) {
            let id: string;
            let text: string;

            switch (option) {
              case OptionValue.Empty:
                id = OptionID.Empty;
                text = "";
                break;
              case OptionValue.TextEntry:
                id = OptionID.TextEntry;
                text = L10n.l(L10n.Key.TagSelectOptionTextEntry);
                break;
              default:
                id = optionId(option);
                text = option;
            }

            const panel = $.CreatePanel("Label", this.elements.options, id);

            panel.text = text;
            panel.SetAttributeString("value", option);
            panel.AddClass(CssClass.Option);

            return panel;
          }

          createTag(tag: string) {
            const id = tagId(tag);

            const panel = createPanelSnippet(this.elements.list, id, Snippet.Tag);
            const removePanel = panel.FindChildTraverse(PanelID.TagRemoveButton);

            if (removePanel == null) {
              throw new Error(`Could not find child with id ${PanelID.TagRemoveButton}`);
            }

            panel.SetDialogVariable("value", tag);
            removePanel.SetPanelEvent("onactivate", this.onTagRemove.bind(this, tag));

            this.registerTagPanel(tag, panel);

            return panel;
          }

          // ----- Actions -----

          createOptionAction(option: string) {
            return new AddOptionAction(this.elements.options, this.createOption.bind(this, option));
          }

          renderOptionsAction() {
            const actions = [OptionValue.Empty, ...this.options, OptionValue.TextEntry]
              .filter((opt) => !this.isTagSelected(opt))
              .map(this.createOptionAction.bind(this));

            return new Sequence().RemoveAllOptions(this.elements.options).Action(...actions);
          }

          selectTagAction(tag: string) {
            return new RunFunctionAction(() => {
              if (this.selectTag(tag) == null) {
                throw new StopSequence();
              }
            });
          }

          deselectTagAction(tag: string) {
            return new RunFunctionAction(() => {
              if (this.deselectTag(tag) == null) {
                throw new StopSequence();
              }
            });
          }

          createTagAction(tag: string) {
            return new Sequence().Function(this.createTag.bind(this), tag);
          }

          addTagAction(tag: string) {
            return new Sequence()
              .Action(this.selectTagAction(tag))
              .Action(this.createTagAction(tag));
          }

          removeTagAction(tag: string, options: { immediate: boolean } = { immediate: false }) {
            const delay = options.immediate ? 0 : Timing.TagDeleteDelay;
            const seq = new Sequence();
            const panel = this.getTagPanel(tag);

            if (delay > 0) {
              seq.Disable(panel);
            }

            return seq
              .Action(this.deselectTagAction(tag))
              .Function(this.unregisterTagPanel.bind(this), tag)
              .DeleteAsync(panel, delay);
          }

          clearTagsAction() {
            const actions = Array.from(this.tags).map((tag) =>
              this.removeTagAction(tag, { immediate: true }),
            );

            return new ParallelSequence().Action(...actions);
          }

          // ----- Action runners -----

          renderOptions() {
            const seq = new Sequence().Action(this.renderOptionsAction());

            this.debugFn(() => ["renderOptions()", { options: this.options, actions: seq.size() }]);

            seq.Run();
          }

          addTag(rawTag: string) {
            const tag = normalizeTag(rawTag);
            const seq = new Sequence()
              .Action(this.addTagAction(tag))
              .Function(this.notifyChange.bind(this));

            this.debugFn(() => ["addTag()", { tag: tag, actions: seq.size() }]);

            seq.Run();
          }

          removeTag(rawTag: string) {
            const tag = normalizeTag(rawTag);
            const seq = new Sequence()
              .Action(this.removeTagAction(tag))
              .Function(this.notifyChange.bind(this));

            this.debugFn(() => ["removeTag()", { tag: tag, actions: seq.size() }]);

            seq.Run();
          }

          clearTags() {
            const seq = new Sequence()
              .Action(this.clearTagsAction())
              .Function(this.notifyChange.bind(this));

            this.debugFn(() => ["clearTags()", { tags: this.tags.size, actions: seq.size() }]);

            seq.Run();
          }

          showTagEntryPopup() {
            this.showPopup(
              this.elements.options,
              Layout.LayoutID.PopupTextEntry,
              PanelID.PopupTextEntry,
              {
                channel: this.popupTextEntryChannel,
                title: L10n.l(L10n.Key.TagSelectPopupTextEntryTitle),
              },
            );
          }
        }

        export const component = new TagSelect();
      }
    }
  }
}
