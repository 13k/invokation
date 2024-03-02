// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace picker {
      const {
        l10n,
        combo: { CombosView },
        custom_events: { GameEvent, CustomGameEvent },
        layout: { LayoutID },
        panorama: { SoundEvent, createLabel },
        singleton: { COMBOS },
        util: { camelCase, parseEnumValue, pascalCase, uniqueId },
        combo: {
          DamageRating,
          DifficultyRating,
          Property,
          Specialty,
          Stance,
          StaticID,
          PROPERTIES,
        },
        sequence: {
          AddOptionAction,
          NoopAction,
          ParallelSequence,
          RunFunctionAction,
          SelectOptionAction,
          Sequence,
          SetAttributeAction,
        },
      } = GameUI.CustomUIConfig().invk;

      import tag_select = invk.components.ui.tag_select;

      import Combo = invk.combo.Combo;
      import ComboID = invk.combo.ComboID;
      import Component = invk.component.Component;
      import PickerCombo = invk.components.PickerCombo.PickerCombo;
      import Properties = invk.combo.Properties;
      import PropertyDescriptor = invk.combo.PropertyDescriptor;

      export interface Elements extends component.Elements {
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

      export class Picker extends Component<Elements> {
        combosView: combo.CombosView | undefined;
        pickerCombos: Map<ComboID, PickerCombo> = new Map();
        finishedCombos: Map<ComboID, boolean> = new Map();
        tagSelect: tag_select.TagSelect | undefined;
        filterTags: Set<string> = new Set();
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
              [CustomGameEvent.COMBO_STARTED]: (payload) => this.onComboStarted(payload),
              [CustomGameEvent.COMBO_STOPPED]: (payload) => this.onComboStopped(payload),
              [CustomGameEvent.COMBO_FINISHED]: (payload) => this.onComboFinished(payload),
              [GameEvent.POPUP_ITEM_PICKER_SUBMIT]: (payload) =>
                this.onPopupItemPickerSubmit(payload),
              [GameEvent.POPUP_ABILITY_PICKER_SUBMIT]: (payload) =>
                this.onPopupAbilityPickerSubmit(payload),
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

          this.popupItemPickerChannel = uniqueId("popup_item_picker_");
          this.popupAbilityPickerChannel = uniqueId("popup_ability_picker_");

          this.enableFiltering();
          this.renderFilters();
          this.bindEvents();
          this.debug("init");
        }

        // ----- Event handlers -----

        onCombosChange() {
          this.debug("onCombosChange()");

          if (this.tagSelect == null) {
            this.warn("Undefined tagSelect");
            return;
          }

          this.combosView = new CombosView([...COMBOS]);
          this.tagSelect.input("SetOptions", { options: this.allTags() });
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

        onComboStarted(payload: NetworkedData<custom_events.ComboStarted>) {
          this.debug("onComboStarted()", payload);
          this.close();
        }

        onComboStopped(payload: NetworkedData<custom_events.ComboStopped>) {
          this.debug("onComboStopped()", payload);
          this.open();
        }

        onComboFinished(payload: NetworkedData<custom_events.ComboFinished>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboFinished()", payload);
          this.finishCombo(payload.id);
        }

        onPopupItemPickerSubmit(payload: NetworkedData<custom_events.PopupItemPickerSubmit>) {
          if (payload.channel !== this.popupItemPickerChannel) return;

          this.debug("onPopupItemPickerSubmit()", payload);

          if (payload.item.length > 0) {
            this.filterByItem(payload.item);
          }
        }

        onPopupAbilityPickerSubmit(payload: NetworkedData<custom_events.PopupAbilityPickerSubmit>) {
          if (payload.channel !== this.popupAbilityPickerChannel) return;

          this.debug("onPopupAbilityPickerSubmit()", payload);

          if (payload.ability.length > 0) {
            this.filterByAbility(payload.ability);
          }
        }

        onFilterTagsChange(payload: tag_select.Outputs["OnChange"]) {
          this.debug("onFilterTagsChange()", payload);
          this.filterByTags(payload.tags);
        }

        // ----- Helpers -----

        bindEvents() {
          COMBOS.onChange(this.onCombosChange.bind(this));
        }

        startCombo(id: ComboID) {
          this.debug("startCombo()", id);
          this.sendServer(CustomGameEvent.COMBO_START, { id: id });
        }

        finishCombo(id: ComboID) {
          this.debug("finishCombo()", id);
          this.finishedCombos.set(id, true);
          this.markComboPanelAsFinished(id);
        }

        markComboPanelAsFinished(id: ComboID) {
          this.getPickerCombo(id).input("SetFinished", undefined);
        }

        renderViewer(id: ComboID) {
          this.sendClientSide(GameEvent.VIEWER_RENDER, { id: id });
        }

        allTags(): Set<string> {
          const tagset: Set<string> = new Set();

          if (this.combosView == null) {
            return tagset;
          }

          for (const combo of this.combosView) {
            for (const tag of combo.tagset) {
              tagset.add(tag);
            }
          }

          return tagset;
        }

        isClosed() {
          return this.elements.slideout.BHasClass(CssClass.DrawerClosed);
        }

        isFiltersPanelClosed() {
          return this.elements.slideout.BHasClass(CssClass.FiltersClosed);
        }

        getPickerCombo(id: ComboID) {
          const pickerCombo = this.pickerCombos.get(id);

          if (pickerCombo == null) {
            throw new Error(`Could not find PickerCombo for id ${id}`);
          }

          return pickerCombo;
        }

        resetPickerCombos() {
          this.pickerCombos.clear();
        }

        createComboPanel(parent: Panel, combo: Combo) {
          const id = comboPanelID(combo);
          const component = this.create(LayoutID.PickerCombo, id, parent);
          const { panel } = component;

          panel.AddClass(CssClass.ComboPanel);

          component.registerOutputs({
            OnShowDetails: this.onComboDetailsShow.bind(this),
            OnPlay: this.onComboPlay.bind(this),
          });

          component.input("SetCombo", combo);

          this.pickerCombos.set(combo.id, component);

          if (this.finishedCombos.get(combo.id)) {
            this.markComboPanelAsFinished(combo.id);
          }
        }

        createPropertyFilterOption<K extends keyof Properties>(
          parent: Panel,
          prop: K,
          value: Properties[K] | undefined,
        ) {
          const id = propertyFilterOptionID(prop, value);
          let text: string;

          if (value == null) {
            text = l10n.l(l10n.Key.PickerDefaultOption);
          } else {
            text = l10n.comboPropValue(prop, value);
          }

          const panel = createLabel(parent, id, text);

          setPropertyFilterAttr(panel, prop, value);

          return panel;
        }

        createTagsFilter() {
          this.tagSelect = this.create(
            LayoutID.UITagSelect,
            PanelID.TagSelect,
            this.elements.filterTagsContainer,
          );

          this.tagSelect.registerOutputs({
            OnChange: this.onFilterTagsChange.bind(this),
          });
        }

        resetTagsFilter() {
          this.tagSelect?.input("Clear", undefined);
        }

        enableFiltering() {
          this.filtering = true;
        }

        disableFiltering() {
          this.filtering = false;
        }

        filter(): boolean {
          if (this.combosView == null) {
            this.warn("Tried to filter combos without CombosView");
            return false;
          }

          const filters: combo.Filters = {
            properties: this.propertyFilterValues(),
            tags: this.tagsFilterValue,
            item: this.itemFilterValue,
            ability: this.abilityFilterValue,
          };

          this.debug("filter()", filters);

          return this.combosView.filter(filters);
        }

        propertyFilter(prop: keyof Properties) {
          return this.elements[propertyFilterAttr(prop)];
        }

        propertyFilterValue<K extends keyof Properties>(prop: K): Properties[K] | undefined {
          const dropDown = this.propertyFilter(prop);
          const option = dropDown.GetSelected();

          if (option == null) {
            return undefined;
          }

          switch (prop) {
            case Property.Specialty:
              return parseEnumValue(Specialty, getPropertyFilterAttr(option, prop)) as
                | Properties[K]
                | undefined;
            case Property.Stance:
              return parseEnumValue(Stance, getPropertyFilterAttr(option, prop)) as
                | Properties[K]
                | undefined;
            case Property.DamageRating:
              return parseEnumValue(DamageRating, getPropertyFilterAttr(option, prop)) as
                | Properties[K]
                | undefined;
            case Property.DifficultyRating:
              return parseEnumValue(DifficultyRating, getPropertyFilterAttr(option, prop)) as
                | Properties[K]
                | undefined;
            default: {
              const _check: never = prop;
              throw new Error(`Invalid combo property ${_check}`);
            }
          }
        }

        propertyFilterValues(): Partial<Properties> {
          const setProp = <K extends combo.Property>(
            props: Partial<Properties>,
            prop: K,
            value?: Properties[K],
          ): void => {
            if (value === undefined) return;

            props[prop] = value;
          };

          return Object.values(PROPERTIES).reduce(
            (props, pd) => {
              setProp(props, pd.name, this.propertyFilterValue(pd.name));
              return props;
            },
            {} as Partial<Properties>,
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
          if (this.combosView == null) {
            return new NoopAction();
          }

          const actions = this.combosView.map((combo) =>
            this.elements.combos
              ? this.createComboPanelAction(this.elements.combos, combo)
              : new NoopAction(),
          );

          return new Sequence().Action(...actions);
        }

        createComboPanelAction(parent: Panel, combo: Combo) {
          return new RunFunctionAction(this.createComboPanel.bind(this), parent, combo);
        }

        renderFiltersAction() {
          return new ParallelSequence()
            .Action(this.renderPropertyFiltersAction())
            .Action(this.renderTagsFilterAction());
        }

        renderPropertyFiltersAction() {
          const actions = Object.values(PROPERTIES).map((pd) =>
            this.renderPropertyFilterAction(pd),
          );

          return new ParallelSequence().Action(...actions);
        }

        renderPropertyFilterAction<K extends keyof Properties>(pd: PropertyDescriptor<K>) {
          const dropDown = this.propertyFilter(pd.name);

          if (dropDown == null) {
            throw new Error("dropDown not found");
          }

          const actions = pd.values.map(
            (value) =>
              new AddOptionAction(dropDown, () =>
                this.createPropertyFilterOption(dropDown, pd.name, value),
              ),
          );

          return new Sequence()
            .RemoveAllOptions(dropDown)
            .AddOption(dropDown, () =>
              this.createPropertyFilterOption(dropDown, pd.name, undefined),
            )
            .Action(...actions);
        }

        resetPropertyFiltersAction() {
          const actions = Object.values(PROPERTIES).map((pd) =>
            this.resetPropertyFilterAction(pd.name),
          );

          return new ParallelSequence().Action(...actions);
        }

        resetPropertyFilterAction<K extends keyof Properties>(prop: K) {
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
          if (this.combosView == null) {
            this.warn("Tried to renderCombos() without CombosView");
            return;
          }

          const size = this.combosView.size;
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

          this.debugFn(() => ["open()", { actions: seq.size() }]);

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

        filterByTags(tags: Set<string>) {
          this.filterTags = tags;

          const seq = new Sequence();

          if (this.filterTags.size === 0) {
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

          this.debugFn(() => ["filterByItem()", { item: name, actions: seq.size() }]);

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

          if (this.filter()) {
            this.renderCombos();
          }
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

      const comboPanelID = (c: Combo) => `${COMBO_PANEL_ID_PREFIX}${c.id}`;

      const propertyFilterAttr = <K extends keyof Properties>(k: K): `filter${Capitalize<K>}` =>
        camelCase(`filter_${k}`) as `filter${Capitalize<K>}`;

      const propertyFilterOptionID = <K extends keyof Properties>(
        prop: K,
        value?: Properties[K],
      ): string => {
        const valueID = value == null ? PROPERTY_FILTER_OPTION_DEFAULT : value.toString();

        return pascalCase(`picker_filter_${prop}_${valueID}`);
      };

      const setPropertyFilterAttr = <K extends keyof Properties>(
        panel: Panel,
        prop: K,
        value?: Properties[K],
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

      const getPropertyFilterAttr = <K extends keyof Properties>(panel: Panel, prop: K) => {
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
