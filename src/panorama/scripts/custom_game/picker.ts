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
      }

      export type Inputs = never;
      export type Outputs = never;

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
          PropertyName,
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
        str: "",
        int: -1,
      };

      export class Picker extends Component.Component<Elements, Inputs, Outputs> {
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
            },
            customEvents: {
              COMBO_STARTED: "onComboStarted",
              COMBO_STOPPED: "onComboStopped",
              COMBO_FINISHED: "onComboFinished",
              POPUP_ITEM_PICKER_SUBMIT: "onPopupItemPickerSubmit",
              POPUP_ABILITY_PICKER_SUBMIT: "onPopupAbilityPickerSubmit",
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

        onComboStarted() {
          this.debug("onComboStarted()");
          this.close();
        }

        onComboStopped() {
          this.debug("onComboStopped()");
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
          property: K,
          value: Combo.Properties[K] | typeof PROPERTY_FILTER_OPTION_DEFAULT
        ) {
          const id = propertyFilterOptionID(property, value);
          const panel = $.CreatePanel(PanelType.Label, parent, id);

          let attr: string;
          let text: string;

          if (value === PROPERTY_FILTER_OPTION_DEFAULT) {
            attr = "";
            text = L10n.l(L10n.Key.PickerDefaultOption);
          } else {
            attr = _.toString(value);
            text = L10n.comboPropValue(property, value);
          }

          panel.SetAttributeString(PROPERTY_FILTER_ATTRIBUTE, attr);
          panel.text = text;

          return panel;
        }

        createTagsFilter() {
          this.tagSelect = this.create(
            LayoutID.UITagSelect,
            PanelID.TagSelect,
            this.elements.filterTagsContainer
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

        propertyFilterValue<K extends keyof Partial<Combo.Properties>>(
          prop: K
        ): Partial<Combo.Properties>[K] {
          const dropDown = this.propertyFilter(prop);
          const option = dropDown.GetSelected();

          switch (prop) {
            case PropertyName.Specialty:
              return parseEnumValue(
                Specialty,
                getFilterAttrStr(option)
              ) as Partial<Combo.Properties>[K];
            case PropertyName.Stance:
              return parseEnumValue(
                Stance,
                getFilterAttrStr(option)
              ) as Partial<Combo.Properties>[K];
            case PropertyName.DamageRating:
              return parseEnumValue(
                DamageRating,
                getFilterAttrInt(option)
              ) as Partial<Combo.Properties>[K];
            case PropertyName.DifficultyRating:
              return parseEnumValue(
                DifficultyRating,
                getFilterAttrInt(option)
              ) as Partial<Combo.Properties>[K];
            default:
              // eslint-disable-next-line no-var
              var _check: never = prop;
              throw new Error(`invalid combo property ${_check}`);
          }
        }

        propertyFilterValues(): Partial<Combo.Properties> {
          const setProp = <K extends Combo.PropertyName>(
            props: Partial<Combo.Properties>,
            prop: K,
            value?: Combo.Properties[K]
          ): void => {
            if (value == null) return;
            props[prop] = value;
          };

          return _.transform(
            PropertyName,
            (props, prop) => setProp(props, prop, this.propertyFilterValue(prop)),
            {} as Partial<Combo.Properties>
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
              : new NoopAction()
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
          const actions = _.map(PROPERTIES, (values, prop) =>
            this.renderPropertyFilterAction(prop as keyof Combo.Properties, values)
          );

          return new ParallelSequence().Action(...actions);
        }

        renderPropertyFilterAction<K extends keyof Combo.Properties>(
          prop: K,
          values: Combo.Properties[K][]
        ) {
          const valuesWithDefault: (Combo.Properties[K] | typeof PROPERTY_FILTER_OPTION_DEFAULT)[] =
            [PROPERTY_FILTER_OPTION_DEFAULT, ...values];

          const dropDown = this.propertyFilter(prop);
          const actions = _.map(
            valuesWithDefault,
            (value) =>
              new AddOptionAction(dropDown, this.createPropertyFilterOption(dropDown, prop, value))
          );

          return new Sequence().RemoveAllOptions(dropDown).Action(...actions);
        }

        resetPropertyFiltersAction() {
          const actions = _.map(PROPERTIES, (_, prop) =>
            this.resetPropertyFilterAction(prop as keyof Combo.Properties)
          );

          return new ParallelSequence().Action(...actions);
        }

        resetPropertyFilterAction<K extends keyof Combo.Properties>(prop: K) {
          return new SelectOptionAction(
            this.propertyFilter(prop),
            propertyFilterOptionID(prop, PROPERTY_FILTER_OPTION_DEFAULT)
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
            }
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
            { channel: this.popupAbilityPickerChannel }
          );
        }

        ResetAbilityFilter() {
          this.resetAbilityFilter();
        }
      }

      const comboPanelID = (c: Combo.Combo) => `${COMBO_PANEL_ID_PREFIX}${c.id}`;

      const propertyFilterAttr = <K extends keyof Combo.Properties>(
        k: K
      ): `filter${Capitalize<K>}` => _.camelCase(`filter_${k}`) as `filter${Capitalize<K>}`;

      const propertyFilterOptionID = <K extends keyof Combo.Properties>(
        property: K,
        value: Combo.Properties[K] | typeof PROPERTY_FILTER_OPTION_DEFAULT
      ) => pascalCase(`picker_filter_${property}_${value}`);

      const getFilterAttrStr = <T>(selected?: Panel) =>
        selected
          ? (selected.GetAttributeString(
              PROPERTY_FILTER_ATTRIBUTE,
              PROPERTY_FILTER_NOT_SELECTED.str
            ) as T)
          : undefined;

      const getFilterAttrInt = <T>(selected?: Panel) =>
        selected
          ? (selected.GetAttributeInt(
              PROPERTY_FILTER_ATTRIBUTE,
              PROPERTY_FILTER_NOT_SELECTED.int
            ) as T)
          : undefined;

      export const component = new Picker();
    }
  }
}

invk.Components.Picker.component.open();
