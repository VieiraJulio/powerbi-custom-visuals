"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

const colorModeOptions: powerbi.IEnumMember[] = [
    {
        value: "ranges",
        displayName: "Faixas de desempenho"
    },
    {
        value: "fixed",
        displayName: "Cor única"
    }
];

const displayUnitOptions: powerbi.IEnumMember[] = [
    {
        value: "none",
        displayName: "Nenhuma"
    },
    {
        value: "auto",
        displayName: "Automático"
    },
    {
        value: "thousands",
        displayName: "Mil"
    },
    {
        value: "millions",
        displayName: "Milhões"
    },
    {
        value: "billions",
        displayName: "Bilhões"
    }
];

function numberSetting(
    name: string,
    displayName: string,
    value: number,
    minimum: number,
    maximum: number
): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({
        name,
        displayName,
        value,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: minimum
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: maximum
            }
        }
    });
}

function colorSetting(
    name: string,
    displayName: string,
    value: string
): formattingSettings.ColorPicker {
    return new formattingSettings.ColorPicker({
        name,
        displayName,
        value: {
            value
        }
    });
}

class GaugeStyleSettings extends formattingSettings.SimpleCard {
    public name = "gaugeStyle";
    public displayName = "Velocímetro";

    public thicknessPercent = numberSetting(
        "thicknessPercent",
        "Espessura (% do raio)",
        16.9230769231,
        4,
        35
    );

    public segmentGapDegrees = numberSetting(
        "segmentGapDegrees",
        "Espaço entre faixas (graus)",
        12,
        0,
        24
    );

    public trackOpacity = numberSetting(
        "trackOpacity",
        "Opacidade do fundo (%)",
        20,
        0,
        100
    );

    public showMarker = new formattingSettings.ToggleSwitch({
        name: "showMarker",
        displayName: "Mostrar marcador",
        value: true
    });

    public markerColor = colorSetting(
        "markerColor",
        "Cor do marcador",
        "#000000"
    );

    public markerSizePercent = numberSetting(
        "markerSizePercent",
        "Tamanho do marcador (%)",
        63.6363636364,
        20,
        120
    );

    public slices = [
        this.thicknessPercent,
        this.segmentGapDegrees,
        this.trackOpacity,
        this.showMarker,
        this.markerColor,
        this.markerSizePercent
    ];
}

class ColorBehaviorSettings extends formattingSettings.SimpleCard {
    public name = "colorBehavior";
    public displayName = "Cores";

    public mode = new formattingSettings.ItemDropdown({
        name: "mode",
        displayName: "Modo da barra",
        items: colorModeOptions,
        value: colorModeOptions[0]
    });

    public fixedColor = colorSetting(
        "fixedColor",
        "Cor da barra",
        "#FF4C4C"
    );

    public zeroColor = colorSetting(
        "zeroColor",
        "Cor para zero",
        "#11A3DD"
    );

    public lowThreshold = numberSetting(
        "lowThreshold",
        "Valor até o primeiro limite",
        0.5,
        0,
        1
    );

    public lowColor = colorSetting(
        "lowColor",
        "Cor até o primeiro limite",
        "#FF4C4C"
    );

    public mediumThreshold = numberSetting(
        "mediumThreshold",
        "Valor limite segunda faixa",
        0.8,
        0,
        1
    );

    public mediumColor = colorSetting(
        "mediumColor",
        "Cor segundo limite",
        "#FFC300"
    );

    public highColor = colorSetting(
        "highColor",
        "Cor antes da meta",
        "#A3F573"
    );

    public beforeTargetThreshold = numberSetting(
        "beforeTargetThreshold",
        "Valor antes da meta",
        1,
        0,
        1
    );

    public targetColor = colorSetting(
        "targetColor",
        "Cor da meta",
        "#22B907"
    );

    public targetThreshold = numberSetting(
        "targetThreshold",
        "Valor da meta",
        1,
        0.01,
        1
    );

    public slices = [
        this.mode,
        this.fixedColor,
        this.zeroColor,
        this.lowColor,
        this.lowThreshold,
        this.mediumColor,
        this.mediumThreshold,
        this.highColor,
        this.beforeTargetThreshold,
        this.targetColor,
        this.targetThreshold
    ];
}

class ValueLabelSettings extends formattingSettings.SimpleCard {
    public name = "valueLabel";
    public displayName = "Valor central";

    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar valor",
        value: true
    });

    public useGaugeColor = new formattingSettings.ToggleSwitch({
        name: "useGaugeColor",
        displayName: "Acompanhar cor da barra",
        description: "Quando desativado, permite usar uma cor única ou cores próprias por faixa.",
        value: true
    });

    public useRangeColors = new formattingSettings.ToggleSwitch({
        name: "useRangeColors",
        displayName: "Personalizar cor por faixa",
        description: "Usa cores próprias para o valor central em cada faixa de desempenho.",
        value: true
    });

    public color = colorSetting(
        "color",
        "Cor personalizada",
        "#333333"
    );

    public zeroValueColor = colorSetting(
        "zeroValueColor",
        "Cor do valor em zero",
        "#11A3DD"
    );

    public lowValueColor = colorSetting(
        "lowValueColor",
        "Cor do valor na primeira faixa",
        "#FF4C4C"
    );

    public mediumValueColor = colorSetting(
        "mediumValueColor",
        "Cor do valor na segunda faixa",
        "#000000"
    );

    public highValueColor = colorSetting(
        "highValueColor",
        "Cor do valor antes da meta",
        "#000000"
    );

    public targetValueColor = colorSetting(
        "targetValueColor",
        "Cor do valor na meta",
        "#22B907"
    );

    public fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Fonte",
        value: "Segoe UI"
    });

    public fontSize = numberSetting(
        "fontSize",
        "Tamanho do texto",
        18,
        4.5,
        54
    );

    public bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Negrito",
        value: true
    });

    public displayUnits = new formattingSettings.ItemDropdown({
        name: "displayUnits",
        displayName: "Unidades de exibição",
        items: displayUnitOptions,
        value: displayUnitOptions[0]
    });

    public decimalPlaces = numberSetting(
        "decimalPlaces",
        "Casas decimais",
        0,
        0,
        4
    );

    public verticalOffsetPercent = numberSetting(
        "verticalOffsetPercent",
        "Posição vertical (%)",
        0,
        -50,
        50
    );

    public slices = [
        this.show,
        this.useRangeColors,
        this.useGaugeColor,
        this.color,
        this.zeroValueColor,
        this.lowValueColor,
        this.mediumValueColor,
        this.highValueColor,
        this.targetValueColor,
        this.fontFamily,
        this.fontSize,
        this.bold,
        this.displayUnits,
        this.decimalPlaces,
        this.verticalOffsetPercent
    ];
}

class PercentageLabelSettings extends formattingSettings.SimpleCard {
    public name = "percentageLabel";
    public displayName = "Percentual";

    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar percentual",
        value: true
    });

    public color = colorSetting(
        "color",
        "Cor do texto",
        "#000000"
    );

    public fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Fonte",
        value: "Segoe UI"
    });

    public fontSize = numberSetting(
        "fontSize",
        "Tamanho do texto",
        10.5,
        4.5,
        30
    );

    public bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Negrito",
        value: true
    });

    public decimalPlaces = numberSetting(
        "decimalPlaces",
        "Casas decimais",
        0,
        0,
        2
    );

    public verticalOffsetPercent = numberSetting(
        "verticalOffsetPercent",
        "Distância do arco (px)",
        12,
        0,
        100
    );

    public slices = [
        this.show,
        this.color,
        this.fontFamily,
        this.fontSize,
        this.bold,
        this.decimalPlaces,
        this.verticalOffsetPercent
    ];
}

class IconSettings extends formattingSettings.SimpleCard {
    public name = "iconSettings";
    public displayName = "Ícone";

    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar ícone",
        value: false
    });

    public showIconControls = new formattingSettings.ToggleSwitch({
        name: "showIconControls",
        displayName: "Mostrar botão de upload",
        description: "Exibe uma engrenagem para importar um PNG durante a edição do relatório.",
        value: false
    });

    public defaultIconColor = colorSetting(
        "defaultIconColor",
        "Cor do ícone padrão",
        "#111111"
    );

    public sizePercent = numberSetting(
        "sizePercent",
        "Tamanho (% do raio)",
        28,
        8,
        70
    );

    public verticalOffsetPercent = numberSetting(
        "verticalOffsetPercent",
        "Posição vertical (%)",
        -42,
        -80,
        30
    );

    public opacity = numberSetting(
        "opacity",
        "Opacidade (%)",
        100,
        0,
        100
    );

    public customIconDataUrl = new formattingSettings.TextInput({
        name: "customIconDataUrl",
        displayName: "PNG personalizado",
        value: "",
        placeholder: "",
        visible: false
    });

    public slices = [
        this.show,
        this.showIconControls,
        this.defaultIconColor,
        this.sizePercent,
        this.verticalOffsetPercent,
        this.opacity,
        this.customIconDataUrl
    ];
}

class TooltipSettings extends formattingSettings.SimpleCard {
    public name = "tooltipSettings";
    public displayName = "Dica de ferramenta";

    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar",
        value: true
    });

    public slices = [
        this.show
    ];
}

export class VisualFormattingSettingsModel extends formattingSettings.Model {
    public gaugeStyle = new GaugeStyleSettings();
    public colorBehavior = new ColorBehaviorSettings();
    public valueLabel = new ValueLabelSettings();
    public percentageLabel = new PercentageLabelSettings();
    public iconSettings = new IconSettings();
    public tooltipSettings = new TooltipSettings();

    public cards = [
        this.gaugeStyle,
        this.colorBehavior,
        this.valueLabel,
        this.percentageLabel,
        this.iconSettings,
        this.tooltipSettings
    ];

    public updateVisibility(): void {
        const colorMode = String(
            this.colorBehavior.mode.value?.value ?? "ranges"
        );
        const usesRanges = colorMode === "ranges";

        this.colorBehavior.fixedColor.visible = !usesRanges;
        this.colorBehavior.zeroColor.visible = usesRanges;
        this.colorBehavior.lowThreshold.visible = usesRanges;
        this.colorBehavior.lowColor.visible = usesRanges;
        this.colorBehavior.mediumThreshold.visible = usesRanges;
        this.colorBehavior.mediumColor.visible = usesRanges;
        this.colorBehavior.highColor.visible = usesRanges;
        this.colorBehavior.beforeTargetThreshold.visible = usesRanges;
        this.colorBehavior.targetColor.visible = usesRanges;
        this.colorBehavior.targetThreshold.visible = usesRanges;

        const valueUsesRanges = usesRanges &&
            this.valueLabel.useRangeColors.value;
        const valueFollowsGauge = !valueUsesRanges &&
            this.valueLabel.useGaugeColor.value;
        const rangeValueColors = [
            this.valueLabel.zeroValueColor,
            this.valueLabel.lowValueColor,
            this.valueLabel.mediumValueColor,
            this.valueLabel.highValueColor,
            this.valueLabel.targetValueColor
        ];

        this.valueLabel.useRangeColors.visible = usesRanges;
        this.valueLabel.useGaugeColor.visible = !valueUsesRanges;
        this.valueLabel.color.visible =
            !valueFollowsGauge && !valueUsesRanges;
        rangeValueColors.forEach((color) => {
            color.visible = valueUsesRanges;
        });

        this.iconSettings.defaultIconColor.visible =
            !this.iconSettings.customIconDataUrl.value;
    }
}
