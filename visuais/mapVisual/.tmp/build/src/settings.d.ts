import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
export declare class BubbleCardSettings extends FormattingSettingsCard {
    bubbleColor: formattingSettings.ColorPicker;
    bubbleOpacity: formattingSettings.NumUpDown;
    borderColor: formattingSettings.ColorPicker;
    borderWidth: formattingSettings.NumUpDown;
    showSelectionOutline: formattingSettings.ToggleSwitch;
    selectionOutlineColor: formattingSettings.ColorPicker;
    minimumRadius: formattingSettings.NumUpDown;
    maximumRadius: formattingSettings.NumUpDown;
    showValue: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    visible: boolean;
    slices: FormattingSettingsSlice[];
}
export declare class IconCardSettings extends FormattingSettingsCard {
    showIcon: formattingSettings.ToggleSwitch;
    showIconControls: formattingSettings.ToggleSwitch;
    iconSize: formattingSettings.NumUpDown;
    iconOpacity: formattingSettings.NumUpDown;
    customIconDataUrl: formattingSettings.TextInput;
    name: string;
    displayName: string;
    visible: boolean;
    slices: FormattingSettingsSlice[];
}
export declare class MapLevelsCardSettings extends FormattingSettingsCard {
    enableAutoLevels: formattingSettings.ToggleSwitch;
    cityZoomThreshold: formattingSettings.NumUpDown;
    transitionDuration: formattingSettings.NumUpDown;
    showStateLabel: formattingSettings.ToggleSwitch;
    showCityLabel: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    visible: boolean;
    slices: FormattingSettingsSlice[];
}
export declare class TooltipCardSettings extends FormattingSettingsCard {
    enableTooltip: formattingSettings.ToggleSwitch;
    includeQuantity: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    visible: boolean;
    slices: FormattingSettingsSlice[];
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    bubbleCard: BubbleCardSettings;
    iconCard: IconCardSettings;
    mapLevelsCard: MapLevelsCardSettings;
    tooltipCard: TooltipCardSettings;
    cards: FormattingSettingsCard[];
}
