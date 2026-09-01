"use strict";

import powerbi from "powerbi-visuals-api";

import {
    formattingSettings
} from "powerbi-visuals-utils-formattingmodel";

const colorModeOptions: powerbi.IEnumMember[] = [
    {
        value: "target",
        displayName: "Comparar com a meta"
    },
    {
        value: "fixed",
        displayName: "Cor fixa"
    },
    {
        value: "ranges",
        displayName: "Faixas de valor"
    }
];

function createPercentageInput(
    name: string,
    value: number
): formattingSettings.NumUpDown {

    return new formattingSettings.NumUpDown({
        name,
        displayName: "Valor",
        value,
        visible: true,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 0
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 10
            }
        }
    });
}

function createColorInput(
    name: string,
    value: string
): formattingSettings.ColorPicker {

    return new formattingSettings.ColorPicker({
        name,
        displayName: "Cor",
        value: {
            value
        },
        visible: true
    });
}

/**
 * Configurações da barra.
 */
class BarStyleSettings
    extends formattingSettings.SimpleCard {

    public name: string =
        "barStyle";

    public displayName: string =
        "Barra";

    public visible: boolean =
        true;

    public analyticsPane: boolean =
        false;

    public backgroundColor =
        new formattingSettings.ColorPicker({
            name: "backgroundColor",
            displayName: "Cor de fundo",
            value: {
                value: "#C8C8C8"
            }
        });

    public barHeight =
        new formattingSettings.NumUpDown({
            name: "barHeight",
            displayName: "Altura",
            value: 15,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 1
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: 100
                }
            }
        });

    /**
     * Controla o comprimento total do trilho.
     *
     * 100 representa toda a largura disponível
     * dentro do visual antes do rótulo.
     */
    public barWidthPercent =
        new formattingSettings.NumUpDown({
            name: "barWidthPercent",
            displayName: "Comprimento da barra (%)",
            value: 100,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 10
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: 100
                }
            }
        });

    public cornerRadius =
        new formattingSettings.NumUpDown({
            name: "cornerRadius",
            displayName: "Arredondamento",
            value: 15,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: 50
                }
            }
        });

    public slices = [
        this.backgroundColor,
        this.barHeight,
        this.barWidthPercent,
        this.cornerRadius
    ];
}

/**
 * Configurações do rótulo.
 */
class DataLabelSettings
    extends formattingSettings.SimpleCard {

    public name: string =
        "dataLabel";

    public displayName: string =
        "Rótulo";

    public visible: boolean =
        true;

    public analyticsPane: boolean =
        false;

    public show =
        new formattingSettings.ToggleSwitch({
            name: "show",
            displayName: "Exibir",
            value: true
        });

    public useBarColor =
        new formattingSettings.ToggleSwitch({
            name: "useBarColor",
            displayName: "Usar cor da barra",
            value: true
        });

    public color =
        new formattingSettings.ColorPicker({
            name: "color",
            displayName: "Cor do texto",
            value: {
                value: "#333333"
            },
            visible: false
        });

    public fontSize =
        new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Tamanho do texto",
            value: 13,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 6
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: 72
                }
            }
        });

    public decimalPlaces =
        new formattingSettings.NumUpDown({
            name: "decimalPlaces",
            displayName: "Casas decimais",
            value: 0,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: 4
                }
            }
        });

    public slices = [
        this.show,
        this.useBarColor,
        this.color,
        this.fontSize,
        this.decimalPlaces
    ];
}

/**
 * Configurações da dica de ferramenta.
 */
class TooltipSettings
    extends formattingSettings.SimpleCard {

    public name: string =
        "tooltipSettings";

    public displayName: string =
        "Dica de ferramenta";

    public visible: boolean =
        true;

    public analyticsPane: boolean =
        false;

    public show =
        new formattingSettings.ToggleSwitch({
            name: "show",
            displayName: "Exibir",
            value: true
        });

    public slices = [
        this.show
    ];
}

/**
 * Grupo de cor fixa.
 */
class FixedColorGroup
    extends formattingSettings.Group {

    public name: string =
        "fixedColorGroup";

    public displayName: string =
        "Cor fixa";

    public visible: boolean =
        false;

    public collapsible: boolean =
        false;

    public fixedColor =
        new formattingSettings.ColorPicker({
            name: "fixedColor",
            displayName: "Cor",
            value: {
                value: "#11A3DD"
            }
        });

    public slices = [
        this.fixedColor
    ];
}

/**
 * Grupo de comparação com a meta.
 */
class TargetComparisonGroup
    extends formattingSettings.Group {

    public name: string =
        "targetComparisonGroup";

    public displayName: string =
        "Comparação com a meta";

    public visible: boolean =
        true;

    public collapsible: boolean =
        false;

    public belowTargetColor =
        new formattingSettings.ColorPicker({
            name: "belowTargetColor",
            displayName: "Cor abaixo da meta",
            value: {
                value: "#FF4C4C"
            }
        });

    public reachedTargetColor =
        new formattingSettings.ColorPicker({
            name: "reachedTargetColor",
            displayName: "Cor da meta atingida",
            value: {
                value: "#22B907"
            }
        });

    public slices = [
        this.belowTargetColor,
        this.reachedTargetColor
    ];
}

/**
 * Faixa Ruim.
 */
class BadRangeGroup
    extends formattingSettings.Group {

    public name: string =
        "badRangeGroup";

    public displayName: string =
        "Ruim";

    public visible: boolean =
        false;

    public collapsible: boolean =
        true;

    public badValue =
        createPercentageInput(
            "badValue",
            0
        );

    public badColor =
        createColorInput(
            "badColor",
            "#FF4C4C"
        );

    public slices = [
        this.badValue,
        this.badColor
    ];
}

/**
 * Faixa Baixa.
 */
class LowRangeGroup
    extends formattingSettings.Group {

    public name: string =
        "lowRangeGroup";

    public displayName: string =
        "Baixa";

    public visible: boolean =
        false;

    public collapsible: boolean =
        true;

    public lowValue =
        createPercentageInput(
            "lowValue",
            0.5
        );

    public lowColor =
        createColorInput(
            "lowColor",
            "#FFC300"
        );

    public slices = [
        this.lowValue,
        this.lowColor
    ];
}

/**
 * Faixa Intermediária.
 */
class IntermediateRangeGroup
    extends formattingSettings.Group {

    public name: string =
        "intermediateRangeGroup";

    public displayName: string =
        "Intermediária";

    public visible: boolean =
        false;

    public collapsible: boolean =
        true;

    public intermediateValue =
        createPercentageInput(
            "intermediateValue",
            0.8
        );

    public intermediateColor =
        createColorInput(
            "intermediateColor",
            "#A3F573"
        );

    public slices = [
        this.intermediateValue,
        this.intermediateColor
    ];
}

/**
 * Faixa Alta.
 */
class HighRangeGroup
    extends formattingSettings.Group {

    public name: string =
        "highRangeGroup";

    public displayName: string =
        "Alta";

    public visible: boolean =
        false;

    public collapsible: boolean =
        true;

    public highValue =
        createPercentageInput(
            "highValue",
            0.99
        );

    public highColor =
        createColorInput(
            "highColor",
            "#62D62C"
        );

    public slices = [
        this.highValue,
        this.highColor
    ];
}

/**
 * Faixa Meta atingida.
 */
class TargetRangeGroup
    extends formattingSettings.Group {

    public name: string =
        "targetRangeGroup";

    public displayName: string =
        "Meta atingida";

    public visible: boolean =
        false;

    public collapsible: boolean =
        true;

    public targetValue =
        createPercentageInput(
            "targetValue",
            1
        );

    public targetColor =
        createColorInput(
            "targetColor",
            "#22B907"
        );

    public slices = [
        this.targetValue,
        this.targetColor
    ];
}

/**
 * Cartão composto do comportamento de cor.
 */
class ColorBehaviorSettings
    extends formattingSettings.CompositeCard {

    public name: string =
        "colorBehavior";

    public displayName: string =
        "Comportamento de cor";

    public visible: boolean =
        true;

    public analyticsPane: boolean =
        false;

    public mode =
        new formattingSettings.ItemDropdown({
            name: "mode",
            displayName: "Modo",
            items: colorModeOptions,
            value: colorModeOptions[0]
        });

    public topLevelSlice =
        this.mode;

    /*
     * A versão instalada da biblioteca no projeto
     * exige um objeto no construtor dos grupos.
     */
    public fixedGroup =
        new FixedColorGroup(
            Object()
        );

    public targetComparisonGroup =
        new TargetComparisonGroup(
            Object()
        );

    public badGroup =
        new BadRangeGroup(
            Object()
        );

    public lowGroup =
        new LowRangeGroup(
            Object()
        );

    public intermediateGroup =
        new IntermediateRangeGroup(
            Object()
        );

    public highGroup =
        new HighRangeGroup(
            Object()
        );

    public targetGroup =
        new TargetRangeGroup(
            Object()
        );

    public groups = [
        this.fixedGroup,
        this.targetComparisonGroup,
        this.badGroup,
        this.lowGroup,
        this.intermediateGroup,
        this.highGroup,
        this.targetGroup
    ];

    public get fixedColor() {
        return this.fixedGroup
            .fixedColor;
    }

    public get belowTargetColor() {
        return this.targetComparisonGroup
            .belowTargetColor;
    }

    public get reachedTargetColor() {
        return this.targetComparisonGroup
            .reachedTargetColor;
    }
}

/**
 * Modelo geral do painel Formatar visual.
 */
export class VisualFormattingSettingsModel
    extends formattingSettings.Model {

    public barStyle =
        new BarStyleSettings();

    public dataLabel =
        new DataLabelSettings();

    public tooltipSettings =
        new TooltipSettings();

    public colorBehavior =
        new ColorBehaviorSettings();

    public cards = [
        this.barStyle,
        this.dataLabel,
        this.tooltipSettings,
        this.colorBehavior
    ];

    public updateVisibility(): void {

        const labelVisible: boolean =
            Boolean(
                this.dataLabel.show.value
            );

        const usesBarColor: boolean =
            Boolean(
                this.dataLabel
                    .useBarColor
                    .value
            );

        this.dataLabel.useBarColor.visible =
            labelVisible;

        this.dataLabel.color.visible =
            labelVisible &&
            !usesBarColor;

        this.dataLabel.fontSize.visible =
            labelVisible;

        this.dataLabel.decimalPlaces.visible =
            labelVisible;

        let selectedMode: string =
            "target";

        if (
            this.colorBehavior.mode.value &&
            this.colorBehavior.mode.value.value
        ) {
            selectedMode =
                String(
                    this.colorBehavior
                        .mode
                        .value
                        .value
                );
        }

        const usesTarget: boolean =
            selectedMode === "target";

        const usesFixed: boolean =
            selectedMode === "fixed";

        const usesRanges: boolean =
            selectedMode === "ranges";

        this.colorBehavior.fixedGroup.visible =
            usesFixed;

        this.colorBehavior
            .targetComparisonGroup
            .visible =
            usesTarget;

        this.colorBehavior.badGroup.visible =
            usesRanges;

        this.colorBehavior.lowGroup.visible =
            usesRanges;

        this.colorBehavior
            .intermediateGroup
            .visible =
            usesRanges;

        this.colorBehavior.highGroup.visible =
            usesRanges;

        this.colorBehavior.targetGroup.visible =
            usesRanges;
    }
}