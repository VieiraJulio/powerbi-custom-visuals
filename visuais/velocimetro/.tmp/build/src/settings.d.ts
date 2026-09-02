import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
declare class GaugeStyleSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    thicknessPercent: formattingSettings.NumUpDown;
    segmentGapDegrees: formattingSettings.NumUpDown;
    trackOpacity: formattingSettings.NumUpDown;
    showMarker: formattingSettings.ToggleSwitch;
    markerColor: formattingSettings.ColorPicker;
    markerSizePercent: formattingSettings.NumUpDown;
    slices: (formattingSettings.ToggleSwitch | formattingSettings.ColorPicker | formattingSettings.NumUpDown)[];
}
declare class ColorBehaviorSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    mode: formattingSettings.ItemDropdown;
    fixedColor: formattingSettings.ColorPicker;
    zeroColor: formattingSettings.ColorPicker;
    lowThreshold: formattingSettings.NumUpDown;
    lowColor: formattingSettings.ColorPicker;
    mediumThreshold: formattingSettings.NumUpDown;
    mediumColor: formattingSettings.ColorPicker;
    highColor: formattingSettings.ColorPicker;
    beforeTargetThreshold: formattingSettings.NumUpDown;
    targetColor: formattingSettings.ColorPicker;
    targetThreshold: formattingSettings.NumUpDown;
    slices: (formattingSettings.ColorPicker | formattingSettings.NumUpDown | formattingSettings.ItemDropdown)[];
}
declare class ValueLabelSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    useGaugeColor: formattingSettings.ToggleSwitch;
    useRangeColors: formattingSettings.ToggleSwitch;
    color: formattingSettings.ColorPicker;
    zeroValueColor: formattingSettings.ColorPicker;
    lowValueColor: formattingSettings.ColorPicker;
    mediumValueColor: formattingSettings.ColorPicker;
    highValueColor: formattingSettings.ColorPicker;
    targetValueColor: formattingSettings.ColorPicker;
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    letterSpacing: formattingSettings.NumUpDown;
    letterSpacingDecimal: formattingSettings.TextInput;
    bold: formattingSettings.ToggleSwitch;
    displayUnits: formattingSettings.ItemDropdown;
    decimalPlaces: formattingSettings.NumUpDown;
    verticalOffsetPercent: formattingSettings.NumUpDown;
    slices: (formattingSettings.ToggleSwitch | formattingSettings.ColorPicker | formattingSettings.NumUpDown | formattingSettings.TextInput | formattingSettings.FontPicker | formattingSettings.ItemDropdown)[];
}
declare class PercentageLabelSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    color: formattingSettings.ColorPicker;
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    bold: formattingSettings.ToggleSwitch;
    decimalPlaces: formattingSettings.NumUpDown;
    verticalOffsetPercent: formattingSettings.NumUpDown;
    slices: (formattingSettings.ToggleSwitch | formattingSettings.ColorPicker | formattingSettings.NumUpDown | formattingSettings.FontPicker)[];
}
declare class IconSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    showIconControls: formattingSettings.ToggleSwitch;
    defaultIconColor: formattingSettings.ColorPicker;
    sizePercent: formattingSettings.NumUpDown;
    verticalOffsetPercent: formattingSettings.NumUpDown;
    opacity: formattingSettings.NumUpDown;
    customIconDataUrl: formattingSettings.TextInput;
    slices: (formattingSettings.ToggleSwitch | formattingSettings.ColorPicker | formattingSettings.NumUpDown | formattingSettings.TextInput)[];
}
declare class TooltipSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    slices: formattingSettings.ToggleSwitch[];
}
export declare class VisualFormattingSettingsModel extends formattingSettings.Model {
    gaugeStyle: GaugeStyleSettings;
    colorBehavior: ColorBehaviorSettings;
    valueLabel: ValueLabelSettings;
    percentageLabel: PercentageLabelSettings;
    iconSettings: IconSettings;
    tooltipSettings: TooltipSettings;
    cards: (GaugeStyleSettings | ColorBehaviorSettings | ValueLabelSettings | PercentageLabelSettings | IconSettings | TooltipSettings)[];
    updateVisibility(): void;
}
export {};
