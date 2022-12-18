namespace invk {
  export namespace Components {
    export namespace UI {
      export namespace TagSelect {
        export interface Elements extends Component.Elements {
          list: Panel;
          options: DropDown;
        }

        export interface Inputs extends Component.Inputs {
          Clear: undefined;
          SetOptions: {
            options: string[];
          };
        }

        export interface Outputs extends Component.Outputs {
          OnChange: {
            tags: string[];
          };
        }

        export type Params = never;

        const {
          L10n,
          Layout,
          Panorama: { createPanelSnippet },
          Vendor: { lodash: _ },
          Sequence: {
            Sequence,
            StopSequence,
            ParallelSequence,
            AddOptionAction,
            RunFunctionAction,
          },
          Util: { pascalCase },
        } = GameUI.CustomUIConfig().invk;

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

        const normalizeTag = (tag: string): string => _.kebabCase(tag);
        const tagId = (tag: string): string => pascalCase(`${PanelID.TagPrefix}${tag}`);
        const optionId = (option: string): string => pascalCase(`${PanelID.OptionPrefix}${option}`);

        export class TagSelect extends Component.Component<Elements, Inputs, Outputs, Params> {
          options: string[];
          tags: string[];
          tagPanels: Record<string, Panel>;
          popupTextEntryChannel: string;

          constructor() {
            super({
              elements: {
                list: "UITagSelectTagList",
                options: "UITagSelectOptions",
              },
              inputs: {
                SetOptions: "setOptions",
                Clear: "clearTags",
              },
              customEvents: {
                POPUP_TEXT_ENTRY_SUBMIT: "onPopupTextEntrySubmit",
              },
            });

            this.options = [];
            this.tags = [];
            this.tagPanels = {};
            this.popupTextEntryChannel = _.uniqueId("popup_text_entry_");

            this.debug("init");
          }

          // ----- I/O -----

          setOptions(payload: Inputs["SetOptions"]) {
            this.debug("setOptions()", payload);
            this.options = payload.options;
            this.renderOptions();
          }

          // ----- Event handlers -----

          onTagRemove(tag: string) {
            this.debug("onTagRemove()", tag);
            this.removeTag(tag);
          }

          onOptionSelect() {
            const selected = this.elements.options.GetSelected();

            this.debug("OnOptionSelect", { id: selected?.id });

            if (!selected) {
              return;
            }

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

          onPopupTextEntrySubmit(payload: CustomEvents.PopupTextEntrySubmit) {
            if (payload.channel !== this.popupTextEntryChannel) {
              return;
            }

            this.debug("onPopupTextEntrySubmit()", payload);

            if (!_.isEmpty(payload.text)) {
              this.addTag(payload.text);
            }
          }

          // ----- Helpers -----

          notifyChange() {
            this.runOutput("OnChange", { tags: this.tags });
          }

          selectTag(tag: string) {
            tag = normalizeTag(tag);

            if (_.isEmpty(tag) || this.isTagSelected(tag)) {
              return null;
            }

            this.tags.push(tag);

            return tag;
          }

          deselectTag(tag: string) {
            tag = normalizeTag(tag);

            if (!this.isTagSelected(tag)) {
              return null;
            }

            _.pull(this.tags, tag);

            return tag;
          }

          isTagSelected(tag: string) {
            return _.includes(this.tags, normalizeTag(tag));
          }

          registerTagPanel(tag: string, panel: Panel) {
            this.tagPanels[tag] = panel;
          }

          getTagPanel(tag: string) {
            const panel = this.tagPanels[tag];

            if (!panel) {
              throw new Error(`Could not find panel for tag ${tag}`);
            }

            return panel;
          }

          unregisterTagPanel(tag: string) {
            delete this.tagPanels[tag];
          }

          createOption(option: string) {
            let id;
            let text;

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

            if (!removePanel) {
              throw new Error(`Could not find child with id ${PanelID.TagRemoveButton}`);
            }

            panel.SetDialogVariable("value", tag);
            removePanel.SetPanelEvent("onactivate", _.bind(this.onTagRemove, this, tag));

            this.registerTagPanel(tag, panel);

            return panel;
          }

          // ----- Actions -----

          createOptionAction(option: string) {
            return new AddOptionAction(
              this.elements.options,
              _.bind(this.createOption, this, option)
            );
          }

          renderOptionsAction() {
            const actions = _.chain([OptionValue.Empty] as string[])
              .concat(...this.options, OptionValue.TextEntry)
              .reject(this.isTagSelected.bind(this))
              .map(this.createOptionAction.bind(this))
              .value();

            return new Sequence().RemoveAllOptions(this.elements.options).Action(...actions);
          }

          selectTagAction(tag: string) {
            return new RunFunctionAction(() => {
              if (!this.selectTag(tag)) {
                throw new StopSequence();
              }
            });
          }

          deselectTagAction(tag: string) {
            return new RunFunctionAction(() => {
              if (!this.deselectTag(tag)) {
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
            const actions = _.map(this.tags, (tag) =>
              this.removeTagAction(tag, { immediate: true })
            );

            return new ParallelSequence().Action(...actions);
          }

          // ----- Action runners -----

          renderOptions() {
            const seq = new Sequence().Action(this.renderOptionsAction());

            this.debugFn(() => ["renderOptions()", { options: this.options, actions: seq.size() }]);

            seq.Run();
          }

          addTag(tag: string) {
            tag = normalizeTag(tag);

            const seq = new Sequence()
              .Action(this.addTagAction(tag))
              .Function(this.notifyChange.bind(this));

            this.debugFn(() => ["addTag()", { tag: tag, actions: seq.size() }]);

            seq.Run();
          }

          removeTag(tag: string) {
            tag = normalizeTag(tag);

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

            this.debugFn(() => ["clearTags()", { tags: this.tags.length, actions: seq.size() }]);

            seq.Run();
          }

          showTagEntryPopup() {
            this.showPopup(
              this.elements.options,
              Layout.ID.PopupTextEntry,
              PanelID.PopupTextEntry,
              {
                channel: this.popupTextEntryChannel,
                title: L10n.l(L10n.Key.TagSelectPopupTextEntryTitle),
              }
            );
          }
        }

        export const component = new TagSelect();
      }
    }
  }
}
