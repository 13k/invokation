// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Picker {
      export interface Elements extends Component.Elements {
        slideout: Panel;
        combos: Panel;
        filterTagsContainer: Panel;
        filterTagsResetButton: Panel;
        filterSpecialty: DropDown;
        filterStance: DropDown;
        filterDamageRating: DropDown;
        filterDifficultyRating: DropDown;
        filterItemImage: ItemImage;
        filterItemResetButton: Panel;
        filterAbilityImage: AbilityImage;
        filterAbilityResetButton: Panel;
        btnReload: Button;
        btnToggleFilters: ToggleButton;
        btnFreestyle: Button;
        btnShowItemFilter: Button;
        btnShowAbilityFilter: Button;
        btnResetFilters: Button;
        btnToggle: Button;
      }

      export type Inputs = never;
      export type Outputs = never;
      export type Params = never;

      const {
        L10n,
        CombosView: { CombosView },
        CustomEvents: { Name: CustomEventName },
        Layout: { ID: LayoutID },
        Panorama: { PanelType, SoundEvent },
        Static: { COMBOS },
        Util: { pascalCase, parseEnumValue },
        Vendor: { lodash: _ },
        Combo: {
          PROPERTIES,
          DamageRating,
          DifficultyRating,
          Property,
          Specialty,
          Stance,
          StaticID,
        },
        Sequence: {
          Sequence,
          ParallelSequence,
          AddOptionAction,
          NoopAction,
          RunFunctionAction,
          SelectOptionAction,
          SetAttributeAction,
        },
      } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        TagSelect = "PickerFilterTags",
        PopupItemPicker = "PickerPopupItemPicker",
        PopupInvokerAbilityPicker = "PickerPopupInvokerAbilityPicker",
      }

      enum CssClass {
        ComboPanel = "PickerCombo",
        DrawerClosed = "DrawerClosed",
        FiltersClosed = "FiltersClosed",
      }

      const COMBO_PANEL_ID_PREFIX = "PickerCombo";
      const PROPERTY_FILTER_ATTRIBUTE = "value";
      const PROPERTY_FILTER_OPTION_DEFAULT = "all";
      const PROPERTY_FILTER_NOT_SELECTED = {
        [Property.Stance]: "",
        [Property.Specialty]: "",
        [Property.DamageRating]: -1,
        [Property.DifficultyRating]: -1,
      } as const;

      export class Picker extends Component.Component<Elements, Inputs, Outputs, Params> {
        combosView?: CombosView.CombosView;
        pickerCombos: Record<Combo.ID, PickerCombo.PickerCombo>;
        finishedCombos: Record<Combo.ID, boolean>;
        tagSelect?: UI.TagSelect.TagSelect;
        filterTags: string[] = [];
        filtering = false;
        popupItemPickerChannel: string;
        popupAbilityPickerChannel: string;

        constructor() {
          super({
            elements: {
              slideout: "PickerSlideout",
              combos: "PickerCombos",
              filterTagsContainer: "PickerFilterTagsContainer",
              filterTagsResetButton: "PickerFilterTagsResetButton",
              filterSpecialty: "PickerFilterSpecialty",
              filterStance: "PickerFilterStance",
              filterDamageRating: "PickerFilterDamageRating",
              filterDifficultyRating: "PickerFilterDifficultyRating",
              filterItemImage: "PickerFilterItemImage",
              filterItemResetButton: "PickerFilterItemResetButton",
              filterAbilityImage: "PickerFilterAbilityImage",
              filterAbilityResetButton: "PickerFilterAbilityResetButton",
              btnReload: "BtnReload",
              btnToggleFilters: "BtnToggleFilters",
              btnFreestyle: "BtnFreestyle",
              btnShowItemFilter: "BtnShowItemFilter",
              btnShowAbilityFilter: "BtnShowAbilityFilter",
              btnResetFilters: "BtnResetFilters",
              btnToggle: "BtnToggle",
            },
            customEvents: {
              COMBO_STARTED: (payload) => this.onComboStarted(payload),
              COMBO_STOPPED: (payload) => this.onComboStopped(payload),
              COMBO_FINISHED: (payload) => this.onComboFinished(payload),
              POPUP_ITEM_PICKER_SUBMIT: (payload) => this.onPopupItemPickerSubmit(payload),
              POPUP_ABILITY_PICKER_SUBMIT: (payload) => this.onPopupAbilityPickerSubmit(payload),
            },
            panelEvents: {
              btnReload: { onactivate: () => this.Reload() },
              btnToggleFilters: { onactivate: () => this.ToggleFilters() },
              btnFreestyle: { onactivate: () => this.Freestyle() },
              filterTagsResetButton: { onactivate: () => this.ResetTagsFilter() },
              filterSpecialty: { oninputsubmit: () => this.Filter() },
              filterStance: { oninputsubmit: () => this.Filter() },
              filterDamageRating: { oninputsubmit: () => this.Filter() },
              filterDifficultyRating: { oninputsubmit: () => this.Filter() },
              filterItemResetButton: { onactivate: () => this.ResetItemFilter() },
              btnShowItemFilter: { onactivate: () => this.ShowItemFilter() },
              filterAbilityResetButton: { onactivate: () => this.ResetAbilityFilter() },
              btnShowAbilityFilter: { onactivate: () => this.ShowAbilityFilter() },
              btnResetFilters: { onactivate: () => this.ResetFilters() },
              btnToggle: { onactivate: () => this.Toggle() },
            },
          });

          this.pickerCombos = {};
          this.finishedCombos = {};
          this.popupItemPickerChannel = _.uniqueId("popup_item_picker_");
          this.popupAbilityPickerChannel = _.uniqueId("popup_ability_picker_");

          this.enableFiltering();
          this.renderFilters();
          this.bindEvents();
          this.debug("init");
        }

        // ----- Event handlers -----

        onCombosChange() {
          this.debug("onCombosChange()");

          if (!this.tagSelect) {
            this.warn("undefined tagSelect");
            return;
          }

          this.combosView = new CombosView(COMBOS.entries);

          this.tagSelect.Input("SetOptions", { options: this.comboTags() });
          this.renderCombos();
        }

        onComboDetailsShow(payload: PickerCombo.Outputs["OnShowDetails"]) {
          this.debug("onComboDetailsShow()", payload);
          this.close();
          this.renderViewer(payload.id);
        }

        onComboPlay(payload: PickerCombo.Outputs["OnPlay"]) {
          this.debug("onComboPlay()", payload);
          this.startCombo(payload.id);
        }

        onComboStarted(payload: CustomEvents.ComboStarted) {
          this.debug("onComboStarted()", payload);
          this.close();
        }

        onComboStopped(payload: CustomEvents.ComboStopped) {
          this.debug("onComboStopped()", payload);
          this.open();
        }

        onComboFinished(payload: CustomEvents.ComboFinished) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboFinished()", payload);
          this.finishCombo(payload.id);
        }

        onFilterTagsChange(payload: { tags: string[] }) {
          this.debug("onFilterTagsChange()", payload);
          this.filterByTags(payload.tags);
        }

        onPopupItemPickerSubmit(payload: CustomEvents.PopupItemPickerSubmit) {
          if (payload.channel !== this.popupItemPickerChannel) return;

          this.debug("onPopupItemPickerSubmit()", payload);

          if (!_.isEmpty(payload.item)) {
            this.filterByItem(payload.item);
          }
        }

        onPopupAbilityPickerSubmit(payload: CustomEvents.PopupAbilityPickerSubmit) {
          if (payload.channel !== this.popupAbilityPickerChannel) return;

          this.debug("onPopupAbilityPickerSubmit()", payload);

          if (!_.isEmpty(payload.ability)) {
            this.filterByAbility(payload.ability);
          }
        }

        // ----- Helpers -----

        bindEvents() {
          COMBOS.onChange(this.onCombosChange.bind(this));
        }

        startCombo(id: Combo.ID) {
          this.debug("startCombo()", id);
          this.sendServer(CustomEventName.COMBO_START, { id: id });
        }

        finishCombo(id: Combo.ID) {
          this.debug("finishCombo()", id);
          this.finishedCombos[id] = true;
          this.markComboPanelAsFinished(id);
        }

        markComboPanelAsFinished(id: Combo.ID) {
          this.getPickerCombo(id).Input("SetFinished", undefined);
        }

        renderViewer(id: Combo.ID) {
          this.sendClientSide(CustomEventName.VIEWER_RENDER, { id: id });
        }

        comboTags(): string[] {
          return _.chain(this.combosView?.entries).map("tags").flatten().uniq().sort().value();
        }

        isClosed() {
          return this.elements.slideout.BHasClass(CssClass.DrawerClosed);
        }

        isFiltersPanelClosed() {
          return this.elements.slideout.BHasClass(CssClass.FiltersClosed);
        }

        getPickerCombo(id: Combo.ID) {
          const pickerCombo = this.pickerCombos[id];

          if (!pickerCombo) {
            throw new Error(`Could not find PickerCombo for id ${id}`);
          }

          return pickerCombo;
        }

        resetPickerCombos() {
          this.pickerCombos = {};
        }

        createComboPanel(parent: Panel, combo: Combo.Combo) {
          const id = comboPanelID(combo);
          const component = this.create(LayoutID.PickerCombo, id, parent);
          const { panel } = component;

          panel.AddClass(CssClass.ComboPanel);

          component.Outputs({
            OnShowDetails: this.onComboDetailsShow.bind(this),
            OnPlay: this.onComboPlay.bind(this),
          });

          component.Input("SetCombo", combo);

          this.pickerCombos[combo.id] = component;

          if (this.finishedCombos[combo.id]) {
            this.markComboPanelAsFinished(combo.id);
          }
        }

        createPropertyFilterOption<K extends keyof Combo.Properties>(
          parent: Panel,
          prop: K,
          value?: Combo.Properties[K],
        ) {
          const id = propertyFilterOptionID(prop, value);
          const panel = $.CreatePanel(PanelType.Label, parent, id);

          setPropertyFilterAttr(panel, prop, value);

          if (value === undefined) {
            panel.text = L10n.l(L10n.Key.PickerDefaultOption);
          } else {
            panel.text = L10n.comboPropValue(prop, value);
          }

          return panel;
        }

        createTagsFilter() {
          this.tagSelect = this.create(
            LayoutID.UITagSelect,
            PanelID.TagSelect,
            this.elements.filterTagsContainer,
          );

          this.tagSelect.Outputs({
            OnChange: this.onFilterTagsChange.bind(this),
          });
        }

        resetTagsFilter() {
          this.tagSelect?.Input("Clear", undefined);
        }

        enableFiltering() {
          this.filtering = true;
        }

        disableFiltering() {
          this.filtering = false;
        }

        filter() {
          if (!this.combosView) {
            this.warn("tried to filter combos without CombosView");
            return;
          }

          const filters = {
            properties: this.propertyFilterValues(),
            tags: this.tagsFilterValue,
            item: this.itemFilterValue,
            ability: this.abilityFilterValue,
          };

          this.debug("filter()", filters);
          this.combosView.filter(filters);
        }

        propertyFilter(prop: keyof Combo.Properties) {
          return this.elements[propertyFilterAttr(prop)];
        }

        propertyFilterValue<K extends keyof Combo.Properties>(
          prop: K,
        ): Combo.Properties[K] | undefined {
          const dropDown = this.propertyFilter(prop);
          const option = dropDown.GetSelected();

          if (option == null) {
            return undefined;
          }

          switch (prop) {
            case Property.Specialty:
              return parseEnumValue(Specialty, getPropertyFilterAttr(option, prop)) as
                | Combo.Properties[K]
                | undefined;
            case Property.Stance:
              return parseEnumValue(Stance, getPropertyFilterAttr(option, prop)) as
                | Combo.Properties[K]
                | undefined;
            case Property.DamageRating:
              return parseEnumValue(DamageRating, getPropertyFilterAttr(option, prop)) as
                | Combo.Properties[K]
                | undefined;
            case Property.DifficultyRating:
              return parseEnumValue(DifficultyRating, getPropertyFilterAttr(option, prop)) as
                | Combo.Properties[K]
                | undefined;
            default: {
              const _check: never = prop;
              throw new Error(`Invalid combo property ${_check}`);
            }
          }
        }

        propertyFilterValues(): Partial<Combo.Properties> {
          const setProp = <K extends Combo.Property>(
            props: Partial<Combo.Properties>,
            prop: K,
            value?: Combo.Properties[K],
          ): void => {
            if (value === undefined) {
              return undefined;
            }

            props[prop] = value;
          };

          return _.transform(
            PROPERTIES,
            (props, descriptor) =>
              setProp(props, descriptor.name, this.propertyFilterValue(descriptor.name)),
            {} as Partial<Combo.Properties>,
          );
        }

        get tagsFilterValue() {
          return this.filterTags;
        }

        get itemFilterValue() {
          return this.elements.filterItemImage.itemname;
        }

        get abilityFilterValue() {
          return this.elements.filterAbilityImage.abilityname;
        }

        // ----- Actions -----

        resetCombosAction() {
          return new Sequence()
            .Function(this.resetPickerCombos.bind(this))
            .RemoveChildren(this.elements.combos);
        }

        renderCombosAction() {
          return new Sequence()
            .Action(this.resetCombosAction())
            .Action(this.createComboPanelsAction());
        }

        createComboPanelsAction() {
          if (!this.combosView) {
            return new NoopAction();
          }

          const actions = _.map(this.combosView.entries, (combo) =>
            this.elements.combos
              ? this.createComboPanelAction(this.elements.combos, combo)
              : new NoopAction(),
          );

          return new Sequence().Action(...actions);
        }

        createComboPanelAction(parent: Panel, combo: Combo.Combo) {
          return new RunFunctionAction(this.createComboPanel.bind(this), parent, combo);
        }

        renderFiltersAction() {
          return new ParallelSequence()
            .Action(this.renderPropertyFiltersAction())
            .Action(this.renderTagsFilterAction());
        }

        renderPropertyFiltersAction() {
          const actions = _.map(PROPERTIES, (descriptor) =>
            this.renderPropertyFilterAction(descriptor),
          );

          return new ParallelSequence().Action(...actions);
        }

        renderPropertyFilterAction<K extends keyof Combo.Properties>(
          descriptor: Combo.PropertyDescriptor<K>,
        ) {
          const dropDown = this.propertyFilter(descriptor.name);
          const actions = _.map(
            descriptor.values,
            (value) =>
              new AddOptionAction(dropDown, () =>
                this.createPropertyFilterOption(dropDown, descriptor.name, value),
              ),
          );

          return new Sequence()
            .RemoveAllOptions(dropDown)
            .AddOption(dropDown, () =>
              this.createPropertyFilterOption(dropDown, descriptor.name, undefined),
            )
            .Action(...actions);
        }

        resetPropertyFiltersAction() {
          const actions = _.map(PROPERTIES, (descriptor) =>
            this.resetPropertyFilterAction(descriptor.name),
          );

          return new ParallelSequence().Action(...actions);
        }

        resetPropertyFilterAction<K extends keyof Combo.Properties>(prop: K) {
          return new SelectOptionAction(
            this.propertyFilter(prop),
            propertyFilterOptionID(prop, undefined),
          );
        }

        renderTagsFilterAction() {
          return new RunFunctionAction(this.createTagsFilter.bind(this));
        }

        resetTagsFilterAction() {
          return new RunFunctionAction(this.resetTagsFilter.bind(this));
        }

        setItemFilterAction(name: string) {
          return new SetAttributeAction(this.elements.filterItemImage, "itemname", name);
        }

        resetItemFilterAction() {
          return new ParallelSequence()
            .Disable(this.elements.filterItemResetButton)
            .Action(this.setItemFilterAction(""));
        }

        setAbilityFilterAction(name: string) {
          return new SetAttributeAction(this.elements.filterAbilityImage, "abilityname", name);
        }

        resetAbilityFilterAction() {
          return new ParallelSequence()
            .Disable(this.elements.filterAbilityResetButton)
            .Action(this.setAbilityFilterAction(""));
        }

        // ----- Action runners -----

        renderCombos() {
          if (!this.combosView) {
            this.warn("tried to renderCombos() without CombosView");
            return;
          }

          const { size } = this.combosView;
          const seq = this.renderCombosAction();

          this.debugFn(() => ["renderCombos()", { combos: size, actions: seq.size() }]);

          seq.Run();
        }

        renderFilters() {
          const seq = this.renderFiltersAction();

          this.debugFn(() => ["renderFilters()", { actions: seq.size() }]);

          seq.Run();
        }

        open() {
          if (!this.isClosed()) return;

          const seq = new ParallelSequence()
            .PlaySoundEffect(SoundEvent.ShopOpen)
            .RemoveClass(this.elements.slideout, CssClass.DrawerClosed);

          this.debugFn(function () {
            return ["open()", { actions: seq.size() }];
          });

          seq.Run();
        }

        close() {
          if (this.isClosed()) return;

          const seq = new ParallelSequence()
            .PlaySoundEffect(SoundEvent.ShopClose)
            .AddClass(this.elements.slideout, CssClass.DrawerClosed);

          this.debugFn(() => ["close()", { actions: seq.size() }]);

          seq.Run();
        }

        openFilters() {
          if (!this.isFiltersPanelClosed()) return;

          const seq = new ParallelSequence()
            .PlaySoundEffect(SoundEvent.UIRolloverUp)
            .RemoveClass(this.elements.slideout, CssClass.FiltersClosed);

          this.debugFn(() => ["openFilters()", { actions: seq.size() }]);

          seq.Run();
        }

        closeFilters() {
          if (this.isFiltersPanelClosed()) return;

          const seq = new ParallelSequence()
            .PlaySoundEffect(SoundEvent.UIRolloverDown)
            .AddClass(this.elements.slideout, CssClass.FiltersClosed);

          this.debugFn(() => ["closeFilters()", { actions: seq.size() }]);

          seq.Run();
        }

        filterByTags(tags: string[]) {
          this.filterTags = tags;

          const seq = new Sequence();

          if (_.isEmpty(this.filterTags)) {
            seq.Disable(this.elements.filterTagsResetButton);
          } else {
            seq.Enable(this.elements.filterTagsResetButton);
          }

          seq.Function(this.Filter.bind(this));

          this.debugFn(() => ["filterByTags()", { tags: this.filterTags, actions: seq.size() }]);

          seq.Run();
        }

        filterByItem(name: string) {
          const seq = new Sequence()
            .Action(this.setItemFilterAction(name))
            .Enable(this.elements.filterItemResetButton)
            .Function(this.Filter.bind(this));

          this.debugFn(function () {
            return ["filterByItem()", { item: name, actions: seq.size() }];
          });

          seq.Run();
        }

        filterByAbility(name: string) {
          const seq = new Sequence()
            .Action(this.setAbilityFilterAction(name))
            .Enable(this.elements.filterAbilityResetButton)
            .Function(this.Filter.bind(this));

          this.debugFn(() => ["filterByAbility()", { ability: name, actions: seq.size() }]);

          seq.Run();
        }

        resetFilters() {
          const seq = new Sequence()
            .Function(this.disableFiltering.bind(this))
            .Action(this.resetPropertyFiltersAction())
            .Action(this.resetTagsFilterAction())
            .Action(this.resetItemFilterAction())
            .Action(this.resetAbilityFilterAction())
            .Function(this.enableFiltering.bind(this))
            .Function(this.Filter.bind(this));

          this.debugFn(() => ["resetFilters()", { actions: seq.size() }]);

          seq.Run();
        }

        resetItemFilter() {
          const seq = new Sequence()
            .Action(this.resetItemFilterAction())
            .Function(this.Filter.bind(this));

          this.debugFn(() => ["resetItemFilter()", { actions: seq.size() }]);

          seq.Run();
        }

        resetAbilityFilter() {
          const seq = new Sequence()
            .Action(this.resetAbilityFilterAction())
            .Function(this.Filter.bind(this));

          this.debugFn(() => ["resetAbilityFilter()", { actions: seq.size() }]);

          seq.Run();
        }

        // ----- UI methods -----

        Reload() {
          this.debug("Reload()");
          COMBOS.reload();
        }

        Toggle() {
          if (this.isClosed()) {
            this.open();
          } else {
            this.close();
          }
        }

        Freestyle() {
          this.debug("Freestyle()");
          this.startCombo(StaticID.Freestyle);
        }

        ToggleFilters() {
          if (this.isFiltersPanelClosed()) {
            this.openFilters();
          } else {
            this.closeFilters();
          }
        }

        Filter() {
          if (!this.filtering) return;

          this.filter();
          this.renderCombos();
        }

        ResetFilters() {
          this.resetFilters();
        }

        ResetTagsFilter() {
          this.resetTagsFilter();
        }

        ShowItemFilter() {
          this.showPopup(
            this.elements.filterItemImage,
            LayoutID.PopupItemPicker,
            PanelID.PopupItemPicker,
            {
              channel: this.popupItemPickerChannel,
            },
          );
        }

        ResetItemFilter() {
          this.resetItemFilter();
        }

        ShowAbilityFilter() {
          this.showPopup(
            this.elements.filterAbilityImage,
            LayoutID.PopupInvokerAbilityPicker,
            PanelID.PopupInvokerAbilityPicker,
            { channel: this.popupAbilityPickerChannel },
          );
        }

        ResetAbilityFilter() {
          this.resetAbilityFilter();
        }
      }

      const comboPanelID = (c: Combo.Combo) => `${COMBO_PANEL_ID_PREFIX}${c.id}`;

      const propertyFilterAttr = <K extends keyof Combo.Properties>(
        k: K,
      ): `filter${Capitalize<K>}` => _.camelCase(`filter_${k}`) as `filter${Capitalize<K>}`;

      const propertyFilterOptionID = <K extends keyof Combo.Properties>(
        prop: K,
        value?: Combo.Properties[K],
      ): string => {
        const valueID = value == null ? PROPERTY_FILTER_OPTION_DEFAULT : _.toString(value);

        return pascalCase(`picker_filter_${prop}_${valueID}`);
      };

      const setPropertyFilterAttr = <K extends keyof Combo.Properties>(
        panel: Panel,
        prop: K,
        value?: Combo.Properties[K],
      ): void => {
        switch (prop) {
          case Property.Stance:
            panel.SetAttributeString(
              PROPERTY_FILTER_ATTRIBUTE,
              (value == null ? PROPERTY_FILTER_NOT_SELECTED[Property.Stance] : value) as string,
            );
            break;
          case Property.Specialty:
            panel.SetAttributeString(
              PROPERTY_FILTER_ATTRIBUTE,
              (value == null ? PROPERTY_FILTER_NOT_SELECTED[Property.Specialty] : value) as string,
            );
            break;
          case Property.DamageRating:
            panel.SetAttributeInt(
              PROPERTY_FILTER_ATTRIBUTE,
              (value == null
                ? PROPERTY_FILTER_NOT_SELECTED[Property.DamageRating]
                : value) as number,
            );
            break;
          case Property.DifficultyRating:
            panel.SetAttributeInt(
              PROPERTY_FILTER_ATTRIBUTE,
              (value == null
                ? PROPERTY_FILTER_NOT_SELECTED[Property.DifficultyRating]
                : value) as number,
            );
            break;
          default: {
            const _check: never = prop;
            throw new Error(`Invalid property ${_check}`);
          }
        }
      };

      const getPropertyFilterAttr = <K extends keyof Combo.Properties>(panel: Panel, prop: K) => {
        switch (prop) {
          case Property.Stance:
            return panel.GetAttributeString(
              PROPERTY_FILTER_ATTRIBUTE,
              PROPERTY_FILTER_NOT_SELECTED[Property.Stance],
            );
          case Property.Specialty:
            return panel.GetAttributeString(
              PROPERTY_FILTER_ATTRIBUTE,
              PROPERTY_FILTER_NOT_SELECTED[Property.Specialty],
            );
          case Property.DamageRating:
            return panel.GetAttributeInt(
              PROPERTY_FILTER_ATTRIBUTE,
              PROPERTY_FILTER_NOT_SELECTED[Property.DamageRating],
            );
          case Property.DifficultyRating:
            return panel.GetAttributeInt(
              PROPERTY_FILTER_ATTRIBUTE,
              PROPERTY_FILTER_NOT_SELECTED[Property.DifficultyRating],
            );
          default: {
            const _check: never = prop;
            throw new Error(`Invalid property ${_check}`);
          }
        }
      };

      export const component = new Picker();

      component.open();
    }
  }
}
