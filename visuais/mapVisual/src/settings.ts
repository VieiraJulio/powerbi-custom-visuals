"use strict";

import powerbi from "powerbi-visuals-api";
import {
    formattingSettings
} from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard =
    formattingSettings.SimpleCard;

import FormattingSettingsSlice =
    formattingSettings.Slice;

import FormattingSettingsModel =
    formattingSettings.Model;

export class BubbleCardSettings
    extends FormattingSettingsCard {

    public bubbleColor =
        new formattingSettings.ColorPicker({
            name: "bubbleColor",
            displayName: "Cor da bolha",
            value: {
                value: "#E67E22"
            },
            visible: true
        });

    public bubbleOpacity =
        new formattingSettings.NumUpDown({
            name: "bubbleOpacity",
            displayName: "Transparência (%)",
            value: 34,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 100
                }
            }
        });

    public borderColor =
        new formattingSettings.ColorPicker({
            name: "borderColor",
            displayName: "Cor da borda",
            value: {
                value: "#FFFFFF"
            },
            visible: true
        });

    public borderWidth =
        new formattingSettings.NumUpDown({
            name: "borderWidth",
            displayName:
                "Espessura da borda",
            value: 3,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 12
                }
            }
        });

    public showSelectionOutline =
        new formattingSettings.ToggleSwitch({
            name:
                "showSelectionOutline",
            displayName:
                "Mostrar borda de seleção",
            description:
                "Exibe um contorno ao selecionar uma bolha.",
            value: true,
            visible: true
        });

    public selectionOutlineColor =
        new formattingSettings.ColorPicker({
            name:
                "selectionOutlineColor",
            displayName:
                "Cor da borda de seleção",
            description:
                "Define a cor do contorno exibido na bolha selecionada.",
            value: {
                value: "#2563EB"
            },
            visible: true
        });

    public minimumRadius =
        new formattingSettings.NumUpDown({
            name: "minimumRadius",
            displayName: "Raio mínimo",
            value: 18,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 4
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 120
                }
            }
        });

    public maximumRadius =
        new formattingSettings.NumUpDown({
            name: "maximumRadius",
            displayName: "Raio máximo",
            value: 42,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 4
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 180
                }
            }
        });

    public showValue =
        new formattingSettings.ToggleSwitch({
            name: "showValue",
            displayName:
                "Mostrar quantidade",
            value: true,
            visible: true
        });

    public name: string =
        "bubble";

    public displayName: string =
        "Bolhas";

    public visible: boolean =
        true;

    public slices:
        FormattingSettingsSlice[] = [
            this.bubbleColor,
            this.bubbleOpacity,
            this.borderColor,
            this.borderWidth,
            this.showSelectionOutline,
            this.selectionOutlineColor,
            this.minimumRadius,
            this.maximumRadius,
            this.showValue
        ];
}

export class IconCardSettings
    extends FormattingSettingsCard {

    public showIcon =
        new formattingSettings.ToggleSwitch({
            name: "showIcon",
            displayName:
                "Mostrar ícone",
            value: true,
            visible: true
        });

    public showIconControls =
        new formattingSettings.ToggleSwitch({
            name: "showIconControls",
            displayName:
                "Mostrar botão de configurações",
            description:
                "Exibe uma engrenagem para importar um PNG somente durante a edição do relatório. Leitores não têm acesso.",
            value: true,
            visible: true
        });

    public iconSize =
        new formattingSettings.NumUpDown({
            name: "iconSize",
            displayName:
                "Tamanho do ícone (%)",
            value: 58,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 10
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 100
                }
            }
        });

    public iconOpacity =
        new formattingSettings.NumUpDown({
            name: "iconOpacity",
            displayName:
                "Opacidade do ícone (%)",
            value: 100,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 100
                }
            }
        });

    /*
     * Valor interno persistido pelo visual.
     * A imagem é alterada pelo menu de configurações sobre o mapa,
     * portanto este campo não aparece no painel.
     */
    public customIconDataUrl =
        new formattingSettings.TextInput({
            name: "customIconDataUrl",
            displayName:
                "PNG personalizado",
            value: "",
            placeholder: "",
            visible: false
        });

    public name: string =
        "iconSettings";

    public displayName: string =
        "Ícone";

    public visible: boolean =
        true;

    public slices:
        FormattingSettingsSlice[] = [
            this.showIcon,
            this.showIconControls,
            this.iconSize,
            this.iconOpacity,
            this.customIconDataUrl
        ];
}

export class MapLevelsCardSettings
    extends FormattingSettingsCard {

    public enableAutoLevels =
        new formattingSettings.ToggleSwitch({
            name: "enableAutoLevels",
            displayName:
                "Alternar Estado/Cidade pelo zoom",
            value: true,
            visible: true
        });

    public cityZoomThreshold =
        new formattingSettings.NumUpDown({
            name: "cityZoomThreshold",
            displayName:
                "Zoom para mostrar cidades",
            value: 7,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 2
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 18
                }
            }
        });

    public transitionDuration =
        new formattingSettings.NumUpDown({
            name: "transitionDuration",
            displayName:
                "Duração da transição (ms)",
            value: 280,
            visible: true,
            options: {
                minValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type:
                        powerbi.visuals
                            .ValidatorType.Max,
                    value: 1500
                }
            }
        });

    public showStateLabel =
        new formattingSettings.ToggleSwitch({
            name: "showStateLabel",
            displayName:
                "Mostrar nome do estado",
            value: true,
            visible: true
        });

    public showCityLabel =
        new formattingSettings.ToggleSwitch({
            name: "showCityLabel",
            displayName:
                "Mostrar nome da cidade",
            value: true,
            visible: true
        });

    public name: string =
        "mapLevels";

    public displayName: string =
        "Níveis do mapa";

    public visible: boolean =
        true;

    public slices:
        FormattingSettingsSlice[] = [
            this.enableAutoLevels,
            this.cityZoomThreshold,
            this.transitionDuration,
            this.showStateLabel,
            this.showCityLabel
        ];
}

export class TooltipCardSettings
    extends FormattingSettingsCard {

    public enableTooltip =
        new formattingSettings.ToggleSwitch({
            name: "enableTooltip",
            displayName:
                "Ativar dicas de ferramenta",
            value: true,
            visible: true
        });

    public includeQuantity =
        new formattingSettings.ToggleSwitch({
            name: "includeQuantity",
            displayName:
                "Incluir quantidade",
            value: true,
            visible: true
        });

    public name: string =
        "tooltipSettings";

    public displayName: string =
        "Dicas de ferramenta";

    public visible: boolean =
        true;

    public slices:
        FormattingSettingsSlice[] = [
            this.enableTooltip,
            this.includeQuantity
        ];
}

export class VisualFormattingSettingsModel
    extends FormattingSettingsModel {

    public bubbleCard:
        BubbleCardSettings =
            new BubbleCardSettings();

    public iconCard:
        IconCardSettings =
            new IconCardSettings();

    public mapLevelsCard:
        MapLevelsCardSettings =
            new MapLevelsCardSettings();

    public tooltipCard:
        TooltipCardSettings =
            new TooltipCardSettings();

    public cards:
        FormattingSettingsCard[] = [
            this.bubbleCard,
            this.iconCard,
            this.mapLevelsCard,
            this.tooltipCard
        ];
}
