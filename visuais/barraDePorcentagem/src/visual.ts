"use strict";

import powerbi from "powerbi-visuals-api";

import IVisual =
    powerbi.extensibility.visual.IVisual;

import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;

import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;

import DataView =
    powerbi.DataView;

import DataViewValueColumn =
    powerbi.DataViewValueColumn;

import {
    FormattingSettingsService
} from "powerbi-visuals-utils-formattingmodel";

import {
    VisualFormattingSettingsModel
} from "./settings";

import * as vega from "vega";

import {
    compile
} from "vega-lite";

interface TooltipDataItem {
    field: string;
    title: string;
    value: string | number;
    type: "quantitative" | "nominal";
    format?: string;
}

interface VegaTooltipDefinition {
    field: string;
    title: string;
    type: "quantitative" | "nominal";
    format?: string;
}

/**
 * Barra percentual personalizada.
 *
 * O comprimento total do trilho é configurável
 * e não depende do valor percentual.
 *
 * Somente o preenchimento colorido varia.
 *
 * Sem meta:
 * progresso = percentual.
 *
 * Com meta:
 * progresso = percentual / meta.
 */
export class Visual implements IVisual {

    private readonly container:
        HTMLDivElement;

    private view:
        vega.View | null = null;

    private formattingSettingsService:
        FormattingSettingsService;

    private formattingSettings:
        VisualFormattingSettingsModel;

    private renderVersion:
        number = 0;

    constructor(
        options: VisualConstructorOptions
    ) {
        const localizationManager =
            options.host
                .createLocalizationManager();

        this.formattingSettingsService =
            new FormattingSettingsService(
                localizationManager
            );

        this.formattingSettings =
            new VisualFormattingSettingsModel();

        this.container =
            document.createElement("div");

        this.container.style.width =
            "100%";

        this.container.style.height =
            "100%";

        this.container.style.boxSizing =
            "border-box";

        this.container.style.overflow =
            "hidden";

        this.container.style.fontFamily =
            "Segoe UI";

        this.container.style.display =
            "flex";

        this.container.style.alignItems =
            "center";

        /*
         * Mantém a barra alinhada à esquerda quando
         * o comprimento configurado for menor que 100%.
         */
        this.container.style.justifyContent =
            "flex-start";

        options.element.appendChild(
            this.container
        );
    }

    public update(
        options: VisualUpdateOptions
    ): void {

        this.renderVersion += 1;

        const currentRenderVersion:
            number =
            this.renderVersion;

        const dataView:
            DataView | undefined =
            options.dataViews &&
            options.dataViews.length > 0
                ? options.dataViews[0]
                : undefined;

        if (dataView) {
            this.formattingSettings =
                this.formattingSettingsService
                    .populateFormattingSettingsModel(
                        VisualFormattingSettingsModel,
                        dataView
                    );
        } else {
            this.formattingSettings =
                new VisualFormattingSettingsModel();
        }

        this.formattingSettings
            .updateVisibility();

        if (
            !dataView ||
            !this.hasRole(
                dataView,
                "percentual"
            )
        ) {
            this.showMessage(
                "Adicione uma medida ao campo Percentual."
            );

            return;
        }

        const percentage:
            number =
            this.getFirstRoleValue(
                dataView,
                "percentual"
            ) ?? 0;

        const target:
            number | null =
            this.getFirstRoleValue(
                dataView,
                "meta"
            );

        if (!Number.isFinite(percentage)) {
            this.showMessage(
                "O percentual possui um valor inválido."
            );

            return;
        }

        if (
            target !== null &&
            (
                !Number.isFinite(target) ||
                target <= 0
            )
        ) {
            this.showMessage(
                "A meta deve possuir um valor maior que zero."
            );

            return;
        }

        /*
         * Quando existe meta:
         *
         * progresso = percentual / meta.
         *
         * Exemplo:
         *
         * percentual = 20%
         * meta = 30%
         *
         * progresso = 66,67%.
         */
        const progress:
            number =
            target !== null
                ? percentage / target
                : percentage;

        if (!Number.isFinite(progress)) {
            this.showMessage(
                "Não foi possível calcular o preenchimento da barra."
            );

            return;
        }

        /*
         * Com meta, o rótulo apresenta o atingimento.
         * Sem meta, apresenta o percentual original.
         */
        const labelValue:
            number =
            target !== null
                ? progress
                : percentage;

        const resolvedBarColor:
            string =
            this.resolveBarColor(
                target,
                progress
            );

        const tooltipItems:
            TooltipDataItem[] =
            this.getTooltipItems(
                dataView
            );

        void this.render(
            percentage,
            target,
            progress,
            labelValue,
            resolvedBarColor,
            tooltipItems,
            options.viewport.width,
            options.viewport.height,
            currentRenderVersion
        );
    }

    public getFormattingModel():
        powerbi.visuals.FormattingModel {

        return this.formattingSettingsService
            .buildFormattingModel(
                this.formattingSettings
            );
    }

    private async render(
        percentage: number,
        target: number | null,
        progress: number,
        labelValue: number,
        resolvedBarColor: string,
        tooltipItems: TooltipDataItem[],
        viewportWidth: number,
        viewportHeight: number,
        currentRenderVersion: number
    ): Promise<void> {

        this.disposeView();

        this.container.textContent =
            "";

        const labelSettings =
            this.formattingSettings
                .dataLabel;

        const barSettings =
            this.formattingSettings
                .barStyle;

        const labelVisible:
            boolean =
            Boolean(
                labelSettings.show.value
            );

        const labelFontSize:
            number =
            this.normalizeNumber(
                Number(
                    labelSettings
                        .fontSize
                        .value
                ),
                13,
                6,
                72
            );

        const decimalPlaces:
            number =
            Math.round(
                this.normalizeNumber(
                    Number(
                        labelSettings
                            .decimalPlaces
                            .value
                    ),
                    0,
                    0,
                    4
                )
            );

        /*
         * Comprimento definido no painel Formatar visual.
         *
         * Esse valor não depende do preenchimento.
         */
        const barWidthPercent:
            number =
            this.normalizeNumber(
                Number(
                    barSettings
                        .barWidthPercent
                        .value
                ),
                100,
                10,
                100
            );

        /*
         * O espaço do rótulo permanece fixo.
         *
         * Assim, a barra não muda de comprimento
         * quando o valor passa de 9% para 100%.
         */
        const labelAreaWidth:
            number =
            labelVisible
                ? this.calculateFixedLabelAreaWidth(
                    labelFontSize,
                    decimalPlaces
                )
                : 0;

        /*
         * Espaço máximo que pode ser usado pela barra,
         * descontando o rótulo e uma pequena margem.
         */
        const availableBarWidth:
            number =
            Math.max(
                Math.floor(
                    viewportWidth -
                    labelAreaWidth -
                    4
                ),
                10
            );

        /*
         * Comprimento efetivo do trilho.
         *
         * O resultado percentual não participa
         * deste cálculo.
         */
        const chartWidth:
            number =
            Math.max(
                Math.floor(
                    availableBarWidth *
                    (
                        barWidthPercent /
                        100
                    )
                ),
                10
            );

        const spec:
            unknown =
            this.createSpec(
                percentage,
                target,
                progress,
                labelValue,
                resolvedBarColor,
                tooltipItems,
                chartWidth,
                viewportHeight,
                labelAreaWidth
            );

        const tooltipEnabled:
            boolean =
            Boolean(
                this.formattingSettings
                    .tooltipSettings
                    .show
                    .value
            );

        try {
            const compiledSpec =
                compile(
                    spec as Parameters<
                        typeof compile
                    >[0]
                ).spec;

            const runtime =
                vega.parse(
                    compiledSpec
                );

            const newView:
                vega.View =
                new vega.View(
                    runtime,
                    {
                        renderer:
                            "svg",

                        hover:
                            tooltipEnabled
                    }
                ).initialize(
                    this.container
                );

            this.view =
                newView;

            await newView.runAsync();

            if (
                currentRenderVersion !==
                this.renderVersion
            ) {
                newView.finalize();

                if (
                    this.view ===
                    newView
                ) {
                    this.view =
                        null;
                }
            }
        } catch (
            error: unknown
        ) {
            if (
                currentRenderVersion !==
                this.renderVersion
            ) {
                return;
            }

            console.error(
                "Erro ao renderizar o visual:",
                error
            );

            this.showMessage(
                "Ocorreu um erro ao renderizar a barra."
            );
        }
    }

    private createSpec(
        percentage: number,
        target: number | null,
        progress: number,
        labelValue: number,
        resolvedBarColor: string,
        tooltipItems: TooltipDataItem[],
        chartWidth: number,
        viewportHeight: number,
        labelAreaWidth: number
    ): unknown {

        const barSettings =
            this.formattingSettings
                .barStyle;

        const labelSettings =
            this.formattingSettings
                .dataLabel;

        const tooltipEnabled:
            boolean =
            Boolean(
                this.formattingSettings
                    .tooltipSettings
                    .show
                    .value
            );

        const barHeight:
            number =
            this.normalizeNumber(
                Number(
                    barSettings
                        .barHeight
                        .value
                ),
                15,
                1,
                100
            );

        const cornerRadius:
            number =
            this.normalizeNumber(
                Number(
                    barSettings
                        .cornerRadius
                        .value
                ),
                15,
                0,
                50
            );

        const backgroundColor:
            string =
            barSettings
                .backgroundColor
                .value
                .value ||
            "#C8C8C8";

        const labelVisible:
            boolean =
            Boolean(
                labelSettings.show.value
            );

        const useBarColor:
            boolean =
            Boolean(
                labelSettings
                    .useBarColor
                    .value
            );

        const customLabelColor:
            string =
            labelSettings
                .color
                .value
                .value ||
            "#333333";

        const labelColor:
            string =
            useBarColor
                ? resolvedBarColor
                : customLabelColor;

        const labelFontSize:
            number =
            this.normalizeNumber(
                Number(
                    labelSettings
                        .fontSize
                        .value
                ),
                13,
                6,
                72
            );

        const decimalPlaces:
            number =
            Math.round(
                this.normalizeNumber(
                    Number(
                        labelSettings
                            .decimalPlaces
                            .value
                    ),
                    0,
                    0,
                    4
                )
            );

        const percentageFormat:
            string =
            "." +
            decimalPlaces +
            "%";

        const contentHeight:
            number =
            Math.max(
                barHeight + 6,
                labelFontSize + 6,
                18
            );

        const chartHeight:
            number =
            Math.max(
                Math.min(
                    viewportHeight,
                    contentHeight
                ),
                15
            );

        const dataRow:
            Record<
                string,
                string | number | null
            > = {
                percentual:
                    percentage,

                meta:
                    target,

                progresso:
                    progress,

                valorRotulo:
                    labelValue,

                cor:
                    resolvedBarColor
            };

        for (
            const tooltipItem
            of tooltipItems
        ) {
            dataRow[
                tooltipItem.field
            ] =
                tooltipItem.value;
        }

        const tooltipEncoding:
            VegaTooltipDefinition[] = [
                {
                    field:
                        "percent_fixed",

                    type:
                        "quantitative",

                    title:
                        "Percentual original",

                    format:
                        percentageFormat
                }
            ];

        if (target !== null) {
            tooltipEncoding.push({
                field:
                    "meta_fixed",

                type:
                    "quantitative",

                title:
                    "Meta",

                format:
                    percentageFormat
            });

            tooltipEncoding.push({
                field:
                    "progress_fixed",

                type:
                    "quantitative",

                title:
                    "Atingimento da meta",

                format:
                    percentageFormat
            });
        }

        for (
            const tooltipItem
            of tooltipItems
        ) {
            const definition:
                VegaTooltipDefinition = {
                    field:
                        tooltipItem.field,

                    type:
                        tooltipItem.type,

                    title:
                        tooltipItem.title
                };

            if (tooltipItem.format) {
                definition.format =
                    tooltipItem.format;
            }

            tooltipEncoding.push(
                definition
            );
        }

        const attachTooltip =
            (
                encoding:
                    Record<string, unknown>
            ): Record<string, unknown> => {

                if (tooltipEnabled) {
                    encoding.tooltip =
                        tooltipEncoding;
                }

                return encoding;
            };

        /*
         * Trilho completo.
         *
         * Sempre começa em zero e termina em um.
         * Seu comprimento não depende do percentual.
         */
        const backgroundEncoding:
            Record<string, unknown> =
            attachTooltip({
                x: {
                    datum:
                        1
                },

                x2: {
                    datum:
                        0
                }
            });

        /*
         * Parte preenchida.
         *
         * Somente esta camada varia de acordo
         * com o percentual ou atingimento da meta.
         */
        const progressEncoding:
            Record<string, unknown> =
            attachTooltip({
                x: {
                    field:
                        "progress_barra",

                    type:
                        "quantitative"
                },

                x2: {
                    datum:
                        0
                },

                color: {
                    field:
                        "cor",

                    type:
                        "nominal",

                    scale:
                        null,

                    legend:
                        null
                }
            });

        const labelEncoding:
            Record<string, unknown> =
            attachTooltip({
                text: {
                    field:
                        "label_fixed",

                    type:
                        "quantitative",

                    format:
                        percentageFormat
                },

                x: {
                    datum:
                        1
                }
            });

        return {
            $schema:
                "https://vega.github.io/schema/vega-lite/v5.json",

            background:
                "transparent",

            data: {
                values: [
                    dataRow
                ]
            },

            transform: [
                {
                    calculate:
                        "isValid(datum.percentual) " +
                        "? datum.percentual " +
                        ": 0",

                    as:
                        "percent_fixed"
                },

                {
                    calculate:
                        "isValid(datum.meta) " +
                        "? datum.meta " +
                        ": null",

                    as:
                        "meta_fixed"
                },

                {
                    calculate:
                        "isValid(datum.progresso) " +
                        "? datum.progresso " +
                        ": 0",

                    as:
                        "progress_fixed"
                },

                {
                    calculate:
                        "isValid(datum.valorRotulo) " +
                        "? datum.valorRotulo " +
                        ": 0",

                    as:
                        "label_fixed"
                },

                /*
                 * O preenchimento é limitado entre
                 * zero e 100%.
                 *
                 * O rótulo e o tooltip podem continuar
                 * exibindo valores acima de 100%.
                 */
                {
                    calculate:
                        "datum.progress_fixed < 0 " +
                        "? 0 " +
                        ": datum.progress_fixed > 1 " +
                        "? 1 " +
                        ": datum.progress_fixed",

                    as:
                        "progress_barra"
                }
            ],

            /*
             * Comprimento total do trilho.
             *
             * É determinado apenas pelo painel
             * de formatação e pelo tamanho do visual.
             */
            width:
                chartWidth,

            height:
                chartHeight,

            /*
             * Espaço reservado para o rótulo depois
             * da extremidade do trilho.
             */
            padding: {
                left:
                    0,

                right:
                    labelAreaWidth,

                top:
                    0,

                bottom:
                    0
            },

            /*
             * "none" impede o Vega-Lite de recalcular
             * e aumentar automaticamente a largura.
             *
             * Com "content", chartWidth representa
             * somente a área real do trilho.
             */
            autosize: {
                type:
                    "none",

                contains:
                    "content",

                resize:
                    false
            },

            layer: [
                {
                    mark: {
                        type:
                            "bar",

                        cornerRadius:
                            cornerRadius,

                        height:
                            barHeight,

                        color:
                            backgroundColor,

                        tooltip:
                            tooltipEnabled
                    },

                    encoding:
                        backgroundEncoding
                },

                {
                    mark: {
                        type:
                            "bar",

                        cornerRadius:
                            cornerRadius,

                        height:
                            barHeight,

                        tooltip:
                            tooltipEnabled
                    },

                    encoding:
                        progressEncoding
                },

                {
                    mark: {
                        type:
                            "text",

                        align:
                            "left",

                        baseline:
                            "middle",

                        dx:
                            5,

                        fontSize:
                            labelFontSize,

                        font:
                            "Segoe UI",

                        fontWeight:
                            "bold",

                        color:
                            labelColor,

                        opacity:
                            labelVisible
                                ? 1
                                : 0,

                        tooltip:
                            tooltipEnabled
                    },

                    encoding:
                        labelEncoding
                }
            ],

            encoding: {
                x: {
                    type:
                        "quantitative",

                    scale: {
                        domain: [
                            0,
                            1
                        ],

                        nice:
                            false,

                        zero:
                            true,

                        clamp:
                            true
                    },

                    axis:
                        null
                }
            },

            config: {
                view: {
                    stroke:
                        "transparent"
                }
            }
        };
    }

    /**
     * Calcula uma área fixa para o rótulo.
     *
     * O resultado atual não participa do cálculo,
     * evitando que o trilho aumente ou diminua.
     */
    private calculateFixedLabelAreaWidth(
        fontSize: number,
        decimalPlaces: number
    ): number {

        /*
         * Reserva espaço para textos como:
         *
         * 100%
         * 100,0%
         * 100,00%
         */
        const characterCount:
            number =
            decimalPlaces > 0
                ? 5 +
                    decimalPlaces
                : 4;

        return Math.ceil(
            characterCount *
            fontSize *
            0.62 +
            12
        );
    }

    private resolveBarColor(
        target: number | null,
        progress: number
    ): string {

        const settings =
            this.formattingSettings
                .colorBehavior;

        let selectedMode:
            string =
            "target";

        if (
            settings.mode.value &&
            settings.mode.value.value
        ) {
            selectedMode =
                String(
                    settings
                        .mode
                        .value
                        .value
                );
        }

        const fixedColor:
            string =
            settings
                .fixedColor
                .value
                .value ||
            "#11A3DD";

        if (
            selectedMode ===
            "fixed"
        ) {
            return fixedColor;
        }

        if (
            selectedMode ===
            "ranges"
        ) {
            const badValue:
                number =
                this.normalizeNumber(
                    Number(
                        settings
                            .badGroup
                            .badValue
                            .value
                    ),
                    0,
                    0,
                    10
                );

            const lowValue:
                number =
                Math.max(
                    badValue,
                    this.normalizeNumber(
                        Number(
                            settings
                                .lowGroup
                                .lowValue
                                .value
                        ),
                        0.5,
                        0,
                        10
                    )
                );

            const intermediateValue:
                number =
                Math.max(
                    lowValue,
                    this.normalizeNumber(
                        Number(
                            settings
                                .intermediateGroup
                                .intermediateValue
                                .value
                        ),
                        0.8,
                        0,
                        10
                    )
                );

            const highValue:
                number =
                Math.max(
                    intermediateValue,
                    this.normalizeNumber(
                        Number(
                            settings
                                .highGroup
                                .highValue
                                .value
                        ),
                        0.99,
                        0,
                        10
                    )
                );

            const targetValue:
                number =
                Math.max(
                    highValue,
                    this.normalizeNumber(
                        Number(
                            settings
                                .targetGroup
                                .targetValue
                                .value
                        ),
                        1,
                        0,
                        10
                    )
                );

            /*
             * Meta atingida.
             */
            if (
                progress >=
                targetValue
            ) {
                return (
                    settings
                        .targetGroup
                        .targetColor
                        .value
                        .value ||
                    "#22B907"
                );
            }

            /*
             * Alta.
             */
            if (
                progress >=
                highValue
            ) {
                return (
                    settings
                        .highGroup
                        .highColor
                        .value
                        .value ||
                    "#62D62C"
                );
            }

            /*
             * Intermediária.
             */
            if (
                progress >=
                intermediateValue
            ) {
                return (
                    settings
                        .intermediateGroup
                        .intermediateColor
                        .value
                        .value ||
                    "#A3F573"
                );
            }

            /*
             * Baixa.
             */
            if (
                progress >=
                lowValue
            ) {
                return (
                    settings
                        .lowGroup
                        .lowColor
                        .value
                        .value ||
                    "#FFC300"
                );
            }

            /*
             * Ruim.
             */
            return (
                settings
                    .badGroup
                    .badColor
                    .value
                    .value ||
                "#FF4C4C"
            );
        }

        /*
         * Sem uma meta, o modo de comparação
         * utiliza a cor fixa.
         */
        if (target === null) {
            return fixedColor;
        }

        if (
            progress >= 1
        ) {
            return (
                settings
                    .reachedTargetColor
                    .value
                    .value ||
                "#22B907"
            );
        }

        return (
            settings
                .belowTargetColor
                .value
                .value ||
            "#FF4C4C"
        );
    }

    private getRoleColumns(
        dataView: DataView,
        roleName: string
    ): DataViewValueColumn[] {

        if (
            !dataView.categorical ||
            !dataView.categorical.values
        ) {
            return [];
        }

        return Array
            .from(
                dataView
                    .categorical
                    .values
            )
            .filter(
                (
                    column:
                        DataViewValueColumn
                ): boolean => {

                    if (
                        !column.source.roles
                    ) {
                        return false;
                    }

                    return (
                        column
                            .source
                            .roles[
                                roleName
                            ] ===
                        true
                    );
                }
            );
    }

    /**
     * Verifica se um campo foi configurado para o papel informado,
     * mesmo quando o filtro faz a consulta retornar apenas BLANK().
     */
    private hasRole(
        dataView: DataView,
        roleName: string
    ): boolean {

        if (
            !dataView.metadata ||
            !dataView.metadata.columns
        ) {
            return false;
        }

        return dataView
            .metadata
            .columns
            .some(
                (column): boolean => {

                    return Boolean(
                        column.roles &&
                        column.roles[
                            roleName
                        ] === true
                    );
                }
            );
    }

    private getFirstRoleValue(
        dataView: DataView,
        roleName: string
    ): number | null {

        const columns:
            DataViewValueColumn[] =
            this.getRoleColumns(
                dataView,
                roleName
            );

        for (
            const column
            of columns
        ) {
            const rawValue =
                column.values &&
                column.values.length > 0
                    ? column.values[0]
                    : null;

            if (
                typeof rawValue ===
                    "number" &&
                Number.isFinite(
                    rawValue
                )
            ) {
                return rawValue;
            }
        }

        return null;
    }

    /**
     * Obtém os campos adicionados ao papel
     * Dica de ferramenta.
     */
    private getTooltipItems(
        dataView: DataView
    ): TooltipDataItem[] {

        const columns:
            DataViewValueColumn[] =
            this.getRoleColumns(
                dataView,
                "tooltip"
            );

        const tooltipItems:
            TooltipDataItem[] = [];

        columns.forEach(
            (
                column:
                    DataViewValueColumn,
                index:
                    number
            ): void => {

                const rawValue =
                    column.values &&
                    column.values.length > 0
                        ? column.values[0]
                        : null;

                if (
                    rawValue === null ||
                    rawValue === undefined
                ) {
                    return;
                }

                const title:
                    string =
                    column
                        .source
                        .displayName ||
                    "Dica de ferramenta";

                const field:
                    string =
                    "tooltip_" +
                    index;

                if (
                    typeof rawValue ===
                        "number" &&
                    Number.isFinite(
                        rawValue
                    )
                ) {
                    const sourceFormat:
                        string =
                        column
                            .source
                            .format ||
                        "";

                    const isPercentage:
                        boolean =
                        sourceFormat
                            .includes(
                                "%"
                            );

                    tooltipItems.push({
                        field,
                        title,
                        value:
                            rawValue,
                        type:
                            "quantitative",
                        format:
                            isPercentage
                                ? ".2%"
                                : Number.isInteger(
                                    rawValue
                                )
                                    ? ",.0f"
                                    : ",.2f"
                    });

                    return;
                }

                if (
                    typeof rawValue ===
                        "boolean"
                ) {
                    tooltipItems.push({
                        field,
                        title,
                        value:
                            rawValue
                                ? "Sim"
                                : "Não",
                        type:
                            "nominal"
                    });

                    return;
                }

                if (
                    rawValue instanceof
                    Date
                ) {
                    tooltipItems.push({
                        field,
                        title,
                        value:
                            rawValue
                                .toLocaleDateString(
                                    "pt-BR"
                                ),
                        type:
                            "nominal"
                    });

                    return;
                }

                tooltipItems.push({
                    field,
                    title,
                    value:
                        String(
                            rawValue
                        ),
                    type:
                        "nominal"
                });
            }
        );

        return tooltipItems;
    }

    private normalizeNumber(
        value: number,
        fallback: number,
        minimum: number,
        maximum: number
    ): number {

        const normalizedValue:
            number =
            Number.isFinite(value)
                ? value
                : fallback;

        return Math.min(
            maximum,
            Math.max(
                minimum,
                normalizedValue
            )
        );
    }

    private showMessage(
        message: string
    ): void {

        this.disposeView();

        this.container.textContent =
            "";

        const messageElement:
            HTMLDivElement =
            document.createElement(
                "div"
            );

        messageElement.textContent =
            message;

        messageElement.style.width =
            "100%";

        messageElement.style.boxSizing =
            "border-box";

        messageElement.style.padding =
            "8px";

        messageElement.style.fontFamily =
            "Segoe UI";

        messageElement.style.fontSize =
            "12px";

        messageElement.style.lineHeight =
            "16px";

        messageElement.style.textAlign =
            "center";

        messageElement.style.wordBreak =
            "break-word";

        this.container.appendChild(
            messageElement
        );
    }

    private disposeView(): void {

        if (!this.view) {
            return;
        }

        try {
            this.view.finalize();
        } catch (
            error: unknown
        ) {
            console.warn(
                "Não foi possível finalizar a instância Vega:",
                error
            );
        }

        this.view =
            null;
    }

    public destroy(): void {

        this.renderVersion += 1;

        this.disposeView();

        this.container.textContent =
            "";
    }
}
