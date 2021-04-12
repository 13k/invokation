/*
interface Panel extends PanelBase {
  Data(): any;
}
*/

type PanelWithText = Panel & { text: string };

type OmitPanel<T> = Omit<T, keyof Panel>;

type AbilityImageOwn = Omit<AbilityImage, keyof Panel>;
type AbilityImageOwnWritable = Writable<AbilityImageOwn>;

type ItemImageOwn = Omit<ItemImage, keyof Panel>;
type ItemImageOwnWritable = Writable<ItemImageOwn>;

type HeroImageOwn = Omit<HeroImage, keyof Panel>;
type HeroImageOwnWritable = Writable<HeroImageOwn>;

type ProgressBarOwn = Omit<ProgressBar, keyof Panel>;
type ProgressBarOwnWritable = Writable<ProgressBarOwn>;

interface CDOTA_PanoramaScript_GameEvents {
  SendEventClientSide<T extends invk.Events.EventName>(
    pEventName: T,
    eventData: invk.Events.EventType<T>
  ): void;
}
