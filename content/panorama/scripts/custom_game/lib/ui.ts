export class UI {
  static hudError(message: string, soundEvent: string): void {
    GameUI.SendCustomHUDError(message, soundEvent);
  }

  static setUI(element: DotaDefaultUIElement_t, state: boolean): void {
    GameUI.SetDefaultUIEnabled(element, state);
  }

  static showUI(element: DotaDefaultUIElement_t): void {
    this.setUI(element, true);
  }

  static hideUI(element: DotaDefaultUIElement_t): void {
    this.setUI(element, false);
  }

  static showActionPanelUI(): void {
    this.showUI(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL);
  }

  static hideActionPanelUI(): void {
    this.hideUI(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL);
  }

  static showInventoryShopUI(): void {
    this.showUI(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP);
  }

  static hideInventoryShopUI(): void {
    this.hideUI(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP);
  }
}
