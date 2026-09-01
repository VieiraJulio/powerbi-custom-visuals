import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
/**
 * Configurações da barra.
 */
declare class BarStyleSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    visible: boolean;
    analyticsPane: boolean;
    backgroundColor: formattingSettings.ColorPicker;
    barHeight: formattingSettings.NumUpDown;
    /**
     * Controla o comprimento total do trilho.
     *
     * 100 representa toda a largura disponível
     * dentro do visual antes do rótulo.
     */
    barWidthPercent: formattingSettings.NumUpDown;
    cornerRadius: formattingSettings.NumUpDown;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker)[];
}
/**
 * Configurações do rótulo.
 */
declare class DataLabelSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    visible: boolean;
    analyticsPane: boolean;
    show: formattingSettings.ToggleSwitch;
    useBarColor: formattingSettings.ToggleSwitch;
    color: formattingSettings.ColorPicker;
    fontSize: formattingSettings.NumUpDown;
    decimalPlaces: formattingSettings.NumUpDown;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker | formattingSettings.ToggleSwitch)[];
}
/**
 * Configurações da dica de ferramenta.
 */
declare class TooltipSettings extends formattingSettings.SimpleCard {
    name: string;
    displayName: string;
    visible: boolean;
    analyticsPane: boolean;
    show: formattingSettings.ToggleSwitch;
    slices: formattingSettings.ToggleSwitch[];
}
/**
 * Grupo de cor fixa.
 */
declare class FixedColorGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    fixedColor: formattingSettings.ColorPicker;
    slices: formattingSettings.ColorPicker[];
}
/**
 * Grupo de comparação com a meta.
 */
declare class TargetComparisonGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    belowTargetColor: formattingSettings.ColorPicker;
    reachedTargetColor: formattingSettings.ColorPicker;
    slices: formattingSettings.ColorPicker[];
}
/**
 * Faixa Ruim.
 */
declare class BadRangeGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    badValue: formattingSettings.NumUpDown;
    badColor: formattingSettings.ColorPicker;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker)[];
}
/**
 * Faixa Baixa.
 */
declare class LowRangeGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    lowValue: formattingSettings.NumUpDown;
    lowColor: formattingSettings.ColorPicker;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker)[];
}
/**
 * Faixa Intermediária.
 */
declare class IntermediateRangeGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    intermediateValue: formattingSettings.NumUpDown;
    intermediateColor: formattingSettings.ColorPicker;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker)[];
}
/**
 * Faixa Alta.
 */
declare class HighRangeGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    highValue: formattingSettings.NumUpDown;
    highColor: formattingSettings.ColorPicker;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker)[];
}
/**
 * Faixa Meta atingida.
 */
declare class TargetRangeGroup extends formattingSettings.Group {
    name: string;
    displayName: string;
    visible: boolean;
    collapsible: boolean;
    targetValue: formattingSettings.NumUpDown;
    targetColor: formattingSettings.ColorPicker;
    slices: (formattingSettings.NumUpDown | formattingSettings.ColorPicker)[];
}
/**
 * Cartão composto do comportamento de cor.
 */
declare class ColorBehaviorSettings extends formattingSettings.CompositeCard {
    name: string;
    displayName: string;
    visible: boolean;
    analyticsPane: boolean;
    mode: formattingSettings.ItemDropdown;
    topLevelSlice: formattingSettings.ItemDropdown;
    fixedGroup: FixedColorGroup;
    targetComparisonGroup: TargetComparisonGroup;
    badGroup: BadRangeGroup;
    lowGroup: LowRangeGroup;
    intermediateGroup: IntermediateRangeGroup;
    highGroup: HighRangeGroup;
    targetGroup: TargetRangeGroup;
    groups: (FixedColorGroup | TargetComparisonGroup | BadRangeGroup | LowRangeGroup | IntermediateRangeGroup | HighRangeGroup | TargetRangeGroup)[];
    get fixedColor(): formattingSettings.ColorPicker;
    get belowTargetColor(): formattingSettings.ColorPicker;
    get reachedTargetColor(): formattingSettings.ColorPicker;
}
/**
 * Modelo geral do painel Formatar visual.
 */
export declare class VisualFormattingSettingsModel extends formattingSettings.Model {
    barStyle: BarStyleSettings;
    dataLabel: DataLabelSettings;
    tooltipSettings: TooltipSettings;
    colorBehavior: ColorBehaviorSettings;
    cards: (BarStyleSettings | DataLabelSettings | TooltipSettings | ColorBehaviorSettings)[];
    updateVisibility(): void;
}
export {};
