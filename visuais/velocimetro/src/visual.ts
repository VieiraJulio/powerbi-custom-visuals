"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import {
    displayUnitSystemType as displayUnitSystemTypes,
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";
import { VisualFormattingSettingsModel } from "./settings";
import "./../style/visual.less";

import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ViewMode = powerbi.ViewMode;
import CustomVisualHostEnv = powerbi.common.CustomVisualHostEnv;

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const START_ANGLE = -3 * Math.PI / 4;
const TOTAL_ANGLE = 3 * Math.PI / 2;
const EDGE_MARKER_EPSILON = 1e-9;
const DENEB_PADDING = 5;
const DENEB_OUTER_RADIUS = 130;
const DENEB_INNER_RADIUS = 108;
const DENEB_PERCENTAGE_OFFSET = 12;
const DENEB_VALUE_FORMAT = "R$ #,0";
const VALUE_FORMAT_LOCALE = "pt-BR";
const MAX_ICON_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ICON_EDGE = 128;
const MAX_ICON_DATA_URL_LENGTH = 512000;
const ICON_FEEDBACK_DURATION = 4000;

interface Point {
    x: number;
    y: number;
}

interface GaugeSegment {
    start: number;
    end: number;
    color: string;
}

interface ColorThresholds {
    first: number;
    second: number;
    beforeTarget: number;
    target: number;
}

type RangeBand = "zero" | "low" | "medium" | "high" | "target";

interface GaugeData {
    actual: number | null;
    hasActual: boolean;
    target: number | null;
    hasTarget: boolean;
    ratio: number;
    gaugeRatio: number;
    actualName: string;
    targetName: string;
    actualFormat: string;
    targetFormat: string;
    tooltipItems: VisualTooltipDataItem[];
}

interface NumberSeparators {
    sourceGroup: string;
    sourceDecimal: string;
    targetGroup: string;
    targetDecimal: string;
    primaryGroupSize: number;
    secondaryGroupSize: number;
}

interface ScaledFormat {
    divisor: number;
    format: string;
}

export class Visual implements IVisual {
    private readonly host: IVisualHost;
    private readonly events: IVisualEventService;
    private readonly tooltipService: ITooltipService;
    private readonly formattingSettingsService: FormattingSettingsService;
    private formattingSettings = new VisualFormattingSettingsModel();

    private readonly rootElement: HTMLDivElement;
    private readonly svgElement: SVGSVGElement;
    private readonly messageElement: HTMLDivElement;
    private readonly iconControlsElement: HTMLDivElement;
    private readonly iconSettingsButton: HTMLButtonElement;
    private readonly iconMenuElement: HTMLDivElement;
    private readonly importIconButton: HTMLButtonElement;
    private readonly removeIconButton: HTMLButtonElement;
    private readonly iconFileInput: HTMLInputElement;
    private readonly iconFeedbackElement: HTMLDivElement;

    private currentViewMode: ViewMode = ViewMode.View;
    private currentFormatMode = false;
    private currentData: GaugeData | null = null;
    private currentWidth = 0;
    private currentHeight = 0;
    private customIconDataUrl = "";
    private iconMenuOpen = false;
    private iconImportInProgress = false;
    private iconFeedbackTimer: number | null = null;
    private destroyed = false;
    private readonly numberSeparatorsByLocale = new Map<
        string,
        NumberSeparators
    >();

    private readonly handleDocumentPointerDown = (event: PointerEvent): void => {
        if (!this.iconMenuOpen) {
            return;
        }

        const target = event.target as Node | null;
        if (target && this.iconControlsElement.contains(target)) {
            return;
        }

        this.setIconMenuOpen(false);
    };

    private readonly handleWindowBlur = (): void => {
        this.setIconMenuOpen(false);
    };

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.tooltipService = options.host.tooltipService;

        const localizationManager = options.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(
            localizationManager
        );

        this.rootElement = document.createElement("div");
        this.rootElement.className = "gauge-visual";

        this.svgElement = document.createElementNS(
            SVG_NAMESPACE,
            "svg"
        );
        this.svgElement.classList.add("gauge-visual__svg");
        this.svgElement.setAttribute("role", "img");
        this.svgElement.setAttribute("tabindex", "0");

        this.messageElement = document.createElement("div");
        this.messageElement.className = "gauge-visual__message";
        this.messageElement.setAttribute("role", "status");

        this.iconControlsElement = document.createElement("div");
        this.iconControlsElement.className = "gauge-visual__icon-controls";

        this.iconSettingsButton = document.createElement("button");
        this.iconSettingsButton.type = "button";
        this.iconSettingsButton.className = "gauge-visual__icon-settings";
        this.iconSettingsButton.textContent = "⚙";
        this.iconSettingsButton.title = "Configurações do ícone";
        this.iconSettingsButton.setAttribute(
            "aria-label",
            "Configurações do ícone"
        );
        this.iconSettingsButton.setAttribute("aria-haspopup", "true");
        this.iconSettingsButton.setAttribute("aria-expanded", "false");

        this.iconMenuElement = document.createElement("div");
        this.iconMenuElement.className = "gauge-visual__icon-menu";
        this.iconMenuElement.setAttribute("role", "group");
        this.iconMenuElement.setAttribute(
            "aria-label",
            "Configurações do ícone"
        );
        this.iconMenuElement.setAttribute("aria-hidden", "true");

        this.importIconButton = this.createIconActionButton(
            "Importar PNG"
        );
        this.importIconButton.title =
            "Escolher um PNG de até 5 MB";

        this.removeIconButton = this.createIconActionButton(
            "Usar ícone padrão"
        );

        this.iconFileInput = document.createElement("input");
        this.iconFileInput.type = "file";
        this.iconFileInput.accept = "image/png,.png";
        this.iconFileInput.setAttribute(
            "aria-label",
            "Selecionar ícone PNG"
        );
        this.iconFileInput.hidden = true;

        this.iconFeedbackElement = document.createElement("div");
        this.iconFeedbackElement.className = "gauge-visual__icon-feedback";
        this.iconFeedbackElement.setAttribute("role", "status");
        this.iconFeedbackElement.setAttribute("aria-live", "polite");
        this.iconFeedbackElement.setAttribute("aria-atomic", "true");

        this.iconMenuElement.append(
            this.importIconButton,
            this.removeIconButton
        );
        this.iconControlsElement.append(
            this.iconSettingsButton,
            this.iconMenuElement,
            this.iconFileInput,
            this.iconFeedbackElement
        );
        this.rootElement.append(
            this.svgElement,
            this.messageElement,
            this.iconControlsElement
        );
        options.element.appendChild(this.rootElement);

        this.attachTooltipEvents();
        this.attachIconControlEvents();
        document.addEventListener(
            "pointerdown",
            this.handleDocumentPointerDown,
            true
        );
        window.addEventListener("blur", this.handleWindowBlur);
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            this.currentViewMode = options.viewMode ?? ViewMode.View;
            this.currentFormatMode = options.formatMode === true;
            this.currentWidth = Math.max(0, options.viewport.width);
            this.currentHeight = Math.max(0, options.viewport.height);

            const dataView = options.dataViews?.[0];
            this.formattingSettings = dataView
                ? this.formattingSettingsService.populateFormattingSettingsModel(
                    VisualFormattingSettingsModel,
                    dataView
                )
                : new VisualFormattingSettingsModel();
            const storedIconDataUrl =
                this.formattingSettings.iconSettings.customIconDataUrl.value;
            this.customIconDataUrl = this.normalizeIconDataUrl(
                storedIconDataUrl
            );
            if (storedIconDataUrl !== this.customIconDataUrl) {
                this.formattingSettings.iconSettings.customIconDataUrl.value =
                    this.customIconDataUrl;
            }
            this.formattingSettings.updateVisibility();
            if (!this.formattingSettings.tooltipSettings.show.value) {
                this.hideTooltip(false);
            }
            this.updateIconControlsVisibility();

            if (
                !dataView ||
                !this.hasRole(dataView, "actual")
            ) {
                this.currentData = null;
                this.showMessage(
                    "Adicione uma medida ao campo Faturamento."
                );
                this.events.renderingFinished(options);
                return;
            }

            const actual = this.getAggregatedRoleValue(
                dataView,
                "actual"
            );
            const target = this.getAggregatedRoleValue(
                dataView,
                "target"
            );

            if (actual !== null && !Number.isFinite(actual)) {
                throw new Error("O Faturamento possui um valor inválido.");
            }

            const hasActual = actual !== null && Number.isFinite(actual);
            const hasTarget = target !== null &&
                Number.isFinite(target) && target > 0;
            const rawRatio = hasActual && hasTarget
                ? actual / target
                : 0;
            const ratio = Number.isFinite(rawRatio)
                ? Math.max(0, rawRatio)
                : 0;
            const gaugeRatio = this.clamp(
                ratio / this.getGaugeMaximum(),
                0,
                1
            );
            const actualColumn = this.getRoleColumns(
                dataView,
                "actual"
            )[0];
            const targetColumn = this.getRoleColumns(
                dataView,
                "target"
            )[0];

            this.currentData = {
                actual,
                hasActual,
                target,
                hasTarget,
                ratio,
                gaugeRatio,
                actualName: actualColumn?.source.displayName || "Faturamento",
                targetName: targetColumn?.source.displayName || "Meta",
                actualFormat: actualColumn?.source.format || "",
                targetFormat: targetColumn?.source.format || "",
                tooltipItems: this.buildTooltipItems(
                    dataView,
                    actual,
                    target,
                    ratio
                )
            };

            this.renderGauge();
            this.events.renderingFinished(options);
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : "Não foi possível renderizar o velocímetro.";
            this.currentData = null;
            this.showMessage(message);
            this.events.renderingFailed(options, message);
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(
            this.formattingSettings
        );
    }

    private renderGauge(): void {
        const data = this.currentData;
        if (!data) {
            return;
        }

        const width = this.currentWidth;
        const height = this.currentHeight;
        if (width < 48 || height < 42) {
            this.showMessage("Aumente o tamanho do visual.");
            return;
        }

        this.messageElement.style.display = "none";
        this.svgElement.style.display = "block";
        this.svgElement.replaceChildren();
        this.svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);

        // The Deneb reference uses fixed radii (130/108) and Vega's
        // five-pixel padding. Keep that exact geometry in normal report tiles
        // and only scale down when the viewport is genuinely smaller.
        const padding = DENEB_PADDING;
        const radiusByWidth = (width - 2 * padding) / 2;
        const radiusByHeight = (height - 2 * padding) /
            (1 + Math.SQRT1_2);
        const outerRadius = Math.max(
            4,
            Math.min(
                DENEB_OUTER_RADIUS,
                radiusByWidth,
                radiusByHeight
            )
        );
        const centerX = width / 2;
        const centerY = padding + outerRadius;
        const thickness = this.clamp(
            outerRadius * this.numberValue(
                this.formattingSettings.gaugeStyle.thicknessPercent.value,
                100 * (DENEB_OUTER_RADIUS - DENEB_INNER_RADIUS) /
                    DENEB_OUTER_RADIUS
            ) / 100,
            2,
            outerRadius * 0.36
        );
        const arcRadius = Math.max(1, outerRadius - thickness / 2);
        const gapDegrees = this.clamp(
            this.numberValue(
                this.formattingSettings.gaugeStyle.segmentGapDegrees.value,
                12
            ),
            0,
            24
        );
        const activeColor = this.resolveActiveColor(data.ratio);
        const segments = this.getGaugeSegments();
        const highContrast = this.host.colorPalette.isHighContrast;
        const foregroundColor = this.host.colorPalette.foreground.value;
        const markerPosition = this.getMarkerPosition(data);
        const markerUsesDot =
            data.hasActual &&
            data.hasTarget &&
            this.formattingSettings.gaugeStyle.showMarker.value &&
            markerPosition > EDGE_MARKER_EPSILON &&
            markerPosition < 1 - EDGE_MARKER_EPSILON;
        const title = document.createElementNS(SVG_NAMESPACE, "title");
        const ariaLabel = this.createAriaLabel(data);
        title.textContent = ariaLabel;
        this.svgElement.setAttribute("aria-label", ariaLabel);
        this.svgElement.appendChild(title);

        const trackOpacity = this.clamp(
            this.numberValue(
                this.formattingSettings.gaugeStyle.trackOpacity.value,
                20
            ) / 100,
            0,
            1
        );

        segments.forEach((segment) => {
            const limits = this.getVisibleSegmentLimits(
                segment,
                gapDegrees
            );
            if (limits.end <= limits.start) {
                return;
            }

            this.appendArc(
                centerX,
                centerY,
                arcRadius,
                limits.start,
                limits.end,
                highContrast ? foregroundColor : segment.color,
                thickness,
                highContrast ? 0.28 : trackOpacity,
                "gauge-track"
            );
        });

        if (data.hasActual && data.hasTarget) {
            segments.forEach((segment) => {
                if (data.gaugeRatio <= segment.start) {
                    return;
                }

                const limits = this.getVisibleSegmentLimits(
                    segment,
                    gapDegrees
                );
                const reachedEnd = Math.min(data.gaugeRatio, limits.end);
                if (reachedEnd <= limits.start) {
                    return;
                }
                const progressPathEnd = markerUsesDot
                    ? this.getProgressPathEnd(
                        limits.start,
                        reachedEnd,
                        markerPosition,
                        arcRadius,
                        thickness
                    )
                    : reachedEnd;
                this.appendArc(
                    centerX,
                    centerY,
                    arcRadius,
                    limits.start,
                    progressPathEnd,
                    highContrast ? foregroundColor : activeColor,
                    thickness,
                    1,
                    "gauge-progress"
                );
            });
        }

        if (
            this.formattingSettings.iconSettings.show.value &&
            outerRadius >= 34
        ) {
            this.appendCenterIcon(
                centerX,
                centerY,
                outerRadius,
                highContrast ? foregroundColor : undefined
            );
        }

        let valueLabel: SVGTextElement | undefined;
        if (this.formattingSettings.valueLabel.show.value) {
            const zeroColor = this.colorValue(
                this.formattingSettings.colorBehavior.zeroColor.value.value,
                "#11A3DD"
            );
            const valueColor = highContrast
                ? foregroundColor
                : !data.hasActual
                    ? zeroColor
                    : data.hasTarget
                        ? this.resolveValueLabelColor(data.ratio, activeColor)
                        : zeroColor;
            valueLabel = this.appendValueLabel(
                data,
                centerX,
                centerY,
                outerRadius,
                thickness,
                width,
                valueColor
            );
        }

        if (
            this.formattingSettings.percentageLabel.show.value &&
            outerRadius >= 34
        ) {
            this.appendPercentageLabel(
                data,
                centerX,
                centerY,
                arcRadius,
                outerRadius,
                width,
                height,
                highContrast ? foregroundColor : undefined,
                undefined,
                valueLabel
            );
        }

        if (
            this.formattingSettings.gaugeStyle.showMarker.value
        ) {
            this.appendMarker(
                data,
                centerX,
                centerY,
                arcRadius,
                thickness,
                highContrast ? foregroundColor : undefined
            );
        }
    }

    private appendArc(
        centerX: number,
        centerY: number,
        radius: number,
        start: number,
        end: number,
        color: string,
        strokeWidth: number,
        opacity: number,
        className: string
    ): void {
        const pathData = this.arcPath(
            centerX,
            centerY,
            radius,
            start,
            end
        );
        if (!pathData) {
            return;
        }

        const layer = document.createElementNS(SVG_NAMESPACE, "g");
        layer.setAttribute("opacity", opacity.toFixed(3));
        layer.setAttribute("pointer-events", "none");
        layer.classList.add("gauge-arc-layer", `${className}-layer`);

        const path = document.createElementNS(SVG_NAMESPACE, "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", strokeWidth.toFixed(3));
        path.setAttribute("stroke-linecap", "butt");
        path.classList.add(className);
        layer.appendChild(path);

        [start, end].forEach((position, index) => {
            const point = this.polarPoint(
                centerX,
                centerY,
                radius,
                position
            );
            const cap = document.createElementNS(
                SVG_NAMESPACE,
                "circle"
            );
            cap.setAttribute("cx", point.x.toFixed(3));
            cap.setAttribute("cy", point.y.toFixed(3));
            cap.setAttribute("r", (strokeWidth / 2).toFixed(3));
            cap.setAttribute("fill", color);
            cap.classList.add(
                "gauge-arc-cap",
                `${className}-cap`,
                index === 0
                    ? "gauge-arc-cap--start"
                    : "gauge-arc-cap--end"
            );
            layer.appendChild(cap);
        });

        this.svgElement.appendChild(layer);
    }

    private appendMarker(
        data: GaugeData,
        centerX: number,
        centerY: number,
        arcRadius: number,
        thickness: number,
        highContrastColor?: string,
        markerPointOverride?: Point
    ): void {
        const markerPosition = this.getMarkerPosition(data);
        const markerPoint = markerPointOverride || this.polarPoint(
            centerX,
            centerY,
            arcRadius,
            markerPosition
        );
        const markerRadius = this.getMarkerRadius(thickness);
        const markerColor = highContrastColor || (
            data.ratio <= 0 || !data.hasTarget
                ? this.colorValue(
                    this.formattingSettings.colorBehavior.zeroColor.value.value,
                    "#11A3DD"
                )
                : this.colorValue(
                    this.formattingSettings.gaugeStyle.markerColor.value.value,
                    "#000000"
                )
        );
        const markerLayer = document.createElementNS(
            SVG_NAMESPACE,
            "g"
        );
        markerLayer.classList.add("gauge-marker-layer");
        markerLayer.setAttribute("pointer-events", "none");
        markerLayer.setAttribute("aria-hidden", "true");

        const isStartEdge = markerPosition <= EDGE_MARKER_EPSILON;
        const isEndEdge = markerPosition >= 1 - EDGE_MARKER_EPSILON;
        const isEdge = !data.hasTarget || isStartEdge || isEndEdge;
        if (isEdge) {
            const angle = START_ANGLE + markerPosition * TOTAL_ANGLE;
            const radialX = Math.sin(angle);
            const radialY = -Math.cos(angle);
            const halfLength = Math.max(2.5, markerRadius * 0.68);
            const lineWidth = Math.max(
                2,
                Math.min(markerRadius * 0.6, thickness * 0.19)
            );
            // The segment gap already leaves the round track cap beside the
            // exact 0%/100% position. Keep the edge trace at that position so
            // it touches the cap instead of receiving a second offset.
            const markerCenterX = markerPoint.x;
            const markerCenterY = markerPoint.y;
            const marker = document.createElementNS(
                SVG_NAMESPACE,
                "line"
            );
            marker.setAttribute(
                "x1",
                (markerCenterX - radialX * halfLength).toFixed(3)
            );
            marker.setAttribute(
                "y1",
                (markerCenterY - radialY * halfLength).toFixed(3)
            );
            marker.setAttribute(
                "x2",
                (markerCenterX + radialX * halfLength).toFixed(3)
            );
            marker.setAttribute(
                "y2",
                (markerCenterY + radialY * halfLength).toFixed(3)
            );
            marker.setAttribute("stroke", markerColor);
            marker.setAttribute("stroke-width", lineWidth.toFixed(3));
            marker.setAttribute("stroke-linecap", "round");
            marker.classList.add("gauge-marker", "gauge-marker--edge");
            markerLayer.appendChild(marker);
        } else {
            const marker = document.createElementNS(
                SVG_NAMESPACE,
                "circle"
            );
            marker.setAttribute("cx", markerPoint.x.toFixed(3));
            marker.setAttribute("cy", markerPoint.y.toFixed(3));
            marker.setAttribute("r", markerRadius.toFixed(3));
            marker.setAttribute("fill", markerColor);
            marker.classList.add("gauge-marker", "gauge-marker--dot");
            markerLayer.appendChild(marker);
        }

        this.svgElement.appendChild(markerLayer);
    }

    private getMarkerRadius(thickness: number): number {
        return Math.max(
            2,
            thickness * this.clamp(
                this.numberValue(
                    this.formattingSettings.gaugeStyle.markerSizePercent.value,
                    63.6363636364
                ),
                20,
                120
            ) / 200
        );
    }

    private getMarkerPosition(data: GaugeData): number {
        if (data.gaugeRatio >= 1 - EDGE_MARKER_EPSILON) {
            return 1;
        }

        if (!data.hasTarget) {
            return data.gaugeRatio;
        }

        // Use the same precision as the visible percentage. If rounding makes
        // the label show 100%, snap the marker to the final trace as well.
        const decimals = this.getPercentageDecimalPlaces();
        const displayedPercentage = this.formatPercentage(
            data.ratio,
            decimals
        );
        const displayedTarget = this.formatPercentage(1, decimals);
        return displayedPercentage === displayedTarget
            ? 1
            : data.gaugeRatio;
    }

    private getPercentageDecimalPlaces(): number {
        return Math.round(this.clamp(
            this.numberValue(
                this.formattingSettings.percentageLabel.decimalPlaces.value,
                0
            ),
            0,
            2
        ));
    }

    private getProgressPathEnd(
        start: number,
        end: number,
        markerPosition: number,
        radius: number,
        strokeWidth: number
    ): number {
        const interval = end - start;
        if (interval <= 0 || radius <= 0 || strokeWidth <= 0) {
            return end;
        }

        // Keep the dot at the exact percentage and let the round progress cap
        // reach its center from behind. The marker layer is appended later, so
        // the dot covers the cap and remains visibly in front of the bar.
        const requiredCenterDistance = strokeWidth / 2;
        const distanceRatio = this.clamp(
            requiredCenterDistance / (2 * radius),
            0,
            1
        );
        const requiredAngle = 2 * Math.asin(distanceRatio);
        const requiredInset = requiredAngle / TOTAL_ANGLE;
        const maximumEnd = markerPosition - requiredInset;

        return maximumEnd <= start
            ? start
            : Math.min(end, maximumEnd);
    }

    private appendPercentageLabel(
        data: GaugeData,
        centerX: number,
        centerY: number,
        arcRadius: number,
        outerRadius: number,
        viewportWidth: number,
        viewportHeight: number,
        highContrastColor?: string,
        positionOverride?: Point,
        valueLabel?: SVGTextElement
    ): void {
        const settings = this.formattingSettings.percentageLabel;
        const markerPosition = this.getMarkerPosition(data);
        const position = positionOverride || this.polarPoint(
            centerX,
            centerY,
            arcRadius,
            markerPosition
        );
        const distancePixels = this.clamp(
            this.numberValue(
                settings.verticalOffsetPercent.value,
                DENEB_PERCENTAGE_OFFSET
            ),
            0,
            100
        );
        const requestedSize = this.pointsToPixels(this.clamp(
            this.numberValue(settings.fontSize.value, 10.5),
            4.5,
            30
        ));
        const initialFontSize = Math.min(
            requestedSize,
            Math.max(6, outerRadius * 0.18)
        );
        const text = this.formatPercentage(
            data.ratio,
            this.getPercentageDecimalPlaces()
        );
        const estimatedWidth = Math.max(1, text.length) * initialFontSize *
            (settings.bold.value ? 0.61 : 0.57);
        const availableWidth = Math.max(12, viewportWidth - 4);
        const fontSize = Math.max(
            6,
            Math.min(
                initialFontSize,
                initialFontSize * availableWidth / estimatedWidth
            )
        );
        const fittedWidth = Math.min(
            availableWidth,
            Math.max(1, text.length) * fontSize *
                (settings.bold.value ? 0.61 : 0.57)
        );
        const halfWidth = fittedWidth / 2;
        const boundedLabelX = this.clamp(
            position.x,
            2 + halfWidth,
            Math.max(2 + halfWidth, viewportWidth - 2 - halfWidth)
        );
        const labelY = position.y + distancePixels;
        const boundedLabelY = this.clamp(
            labelY,
            2,
            Math.max(2, viewportHeight - fontSize - 2)
        );
        const label = document.createElementNS(SVG_NAMESPACE, "text");
        label.textContent = text;
        label.setAttribute("x", boundedLabelX.toFixed(3));
        label.setAttribute("y", boundedLabelY.toFixed(3));
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "hanging");
        label.setAttribute(
            "fill",
            highContrastColor || this.colorValue(
                settings.color.value.value,
                "#000000"
            )
        );
        label.style.fontFamily = settings.fontFamily.value || "Segoe UI";
        label.style.fontSize = `${fontSize}px`;
        label.style.fontWeight = settings.bold.value ? "700" : "400";
        label.classList.add("gauge-percentage-label");
        this.svgElement.appendChild(label);

        if (valueLabel) {
            const valueRect = valueLabel.getBoundingClientRect();
            const svgRect = this.svgElement.getBoundingClientRect();
            const collisionGap = 3;
            const collidesWithValue = (rect: DOMRect): boolean =>
                rect.left < valueRect.right + collisionGap &&
                rect.right > valueRect.left - collisionGap &&
                rect.top < valueRect.bottom + collisionGap &&
                rect.bottom > valueRect.top - collisionGap;
            let percentageRect = label.getBoundingClientRect();

            if (
                collidesWithValue(percentageRect) &&
                svgRect.width > 0
            ) {
                const direction = position.x >= centerX ? 1 : -1;
                const requiredHorizontalShift = (direction > 0
                    ? valueRect.right + collisionGap - percentageRect.left
                    : percentageRect.right - valueRect.left + collisionGap
                ) + 1;
                const scaleX = viewportWidth / svgRect.width;
                const adjustedX = this.clamp(
                    boundedLabelX + direction *
                        Math.max(0, requiredHorizontalShift) * scaleX,
                    2 + halfWidth,
                    Math.max(
                        2 + halfWidth,
                        viewportWidth - 2 - halfWidth
                    )
                );
                label.setAttribute("x", adjustedX.toFixed(3));
                percentageRect = label.getBoundingClientRect();
            }

            if (
                collidesWithValue(percentageRect) &&
                svgRect.height > 0
            ) {
                const scaleY = viewportHeight / svgRect.height;
                const shift = (
                    valueRect.bottom + collisionGap - percentageRect.top
                ) * scaleY;
                const adjustedY = this.clamp(
                    boundedLabelY + shift,
                    2,
                    Math.max(2, viewportHeight - fontSize - 2)
                );
                label.setAttribute("y", adjustedY.toFixed(3));
            }
        }
    }

    private appendValueLabel(
        data: GaugeData,
        centerX: number,
        centerY: number,
        outerRadius: number,
        thickness: number,
        viewportWidth: number,
        labelColor: string
    ): SVGTextElement {
        const settings = this.formattingSettings.valueLabel;
        const unitsMode = this.normalizeDisplayUnitsMode(
            settings.displayUnits.value?.value
        );
        const decimals = Math.round(this.clamp(
            this.numberValue(settings.decimalPlaces.value, 0),
            0,
            4
        ));
        const text = data.actual === null
            ? "(Blank)"
            : this.formatMeasureValue(
                data.actual,
                DENEB_VALUE_FORMAT + (decimals > 0
                    ? `.${"0".repeat(decimals)}`
                    : ""),
                decimals,
                unitsMode,
                VALUE_FORMAT_LOCALE
        );
        const requestedSize = this.pointsToPixels(this.clamp(
            this.numberValue(settings.fontSize.value, 18),
            4.5,
            54
        ));
        const innerRadius = Math.max(1, outerRadius - thickness);
        const centralArcClearance = Math.max(6, outerRadius * 0.27);
        const maximumTextWidth = Math.max(
            1,
            Math.min(
                viewportWidth - 8,
                2 * Math.max(1, innerRadius - centralArcClearance)
            )
        );
        const fontSize = Math.max(
            6,
            Math.min(requestedSize, outerRadius * 0.32)
        );
        const decimalLetterSpacingText = String(
            settings.letterSpacingDecimal.value ?? ""
        ).trim();
        const normalizedLetterSpacing =
            /^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(
                decimalLetterSpacingText
            )
                ? decimalLetterSpacingText.replace(",", ".")
                : "";
        const decimalLetterSpacing = Number(normalizedLetterSpacing);
        const configuredLetterSpacing =
            normalizedLetterSpacing.length > 0 &&
            Number.isFinite(decimalLetterSpacing)
                ? decimalLetterSpacing
                : this.numberValue(settings.letterSpacing.value, 0);
        const letterSpacing = this.clamp(
            configuredLetterSpacing,
            -5,
            20
        );
        const letterSpacingWidth = Math.max(0, text.length - 1) *
            letterSpacing;
        const maximumTextWidthWithSpacing = Math.max(
            1,
            Math.min(
                viewportWidth - 8,
                maximumTextWidth + letterSpacingWidth
            )
        );
        const estimatedWidth = Math.max(
            1,
            Math.max(1, text.length) * fontSize * 0.53 +
                letterSpacingWidth
        );
        const verticalOffset = outerRadius * this.clamp(
            this.numberValue(settings.verticalOffsetPercent.value, 0),
            -50,
            50
        ) / 100;
        const label = document.createElementNS(SVG_NAMESPACE, "text");
        label.textContent = text;
        label.setAttribute("x", centerX.toFixed(3));
        label.setAttribute("y", (centerY + verticalOffset).toFixed(3));
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute(
            "fill",
            labelColor
        );
        label.style.fontFamily = settings.fontFamily.value || "Segoe UI";
        label.style.fontSize = `${fontSize}px`;
        label.style.fontWeight = settings.bold.value ? "700" : "400";
        label.setAttribute("letter-spacing", `${letterSpacing}px`);
        label.classList.add("gauge-value-label");
        this.svgElement.appendChild(label);
        const renderedWidth = label.getComputedTextLength();
        const effectiveWidth = Number.isFinite(renderedWidth) &&
            renderedWidth > 0
            ? renderedWidth
            : estimatedWidth;
        if (effectiveWidth > maximumTextWidthWithSpacing) {
            label.setAttribute(
                "textLength",
                maximumTextWidthWithSpacing.toFixed(3)
            );
            label.setAttribute(
                "lengthAdjust",
                maximumTextWidthWithSpacing / effectiveWidth >= 0.75
                    ? "spacing"
                    : "spacingAndGlyphs"
            );
        }
        label.setAttribute("text-rendering", "geometricPrecision");

        return label;
    }

    private appendCenterIcon(
        centerX: number,
        centerY: number,
        outerRadius: number,
        highContrastColor?: string
    ): void {
        const settings = this.formattingSettings.iconSettings;
        const size = outerRadius * this.clamp(
            this.numberValue(settings.sizePercent.value, 28),
            8,
            70
        ) / 100;
        const iconCenterY = centerY + outerRadius * this.clamp(
            this.numberValue(settings.verticalOffsetPercent.value, -42),
            -80,
            30
        ) / 100;
        const opacity = this.clamp(
            this.numberValue(settings.opacity.value, 100) / 100,
            0,
            1
        );

        if (this.customIconDataUrl) {
            const image = document.createElementNS(SVG_NAMESPACE, "image");
            image.setAttribute("x", (centerX - size / 2).toFixed(3));
            image.setAttribute("y", (iconCenterY - size / 2).toFixed(3));
            image.setAttribute("width", size.toFixed(3));
            image.setAttribute("height", size.toFixed(3));
            image.setAttribute("href", this.customIconDataUrl);
            image.setAttribute("preserveAspectRatio", "xMidYMid meet");
            image.setAttribute("opacity", opacity.toFixed(3));
            image.classList.add("gauge-center-image");
            this.svgElement.appendChild(image);
            return;
        }

        const color = highContrastColor || this.colorValue(
            settings.defaultIconColor.value.value,
            "#111111"
        );
        const scale = size / 40;
        const group = document.createElementNS(SVG_NAMESPACE, "g");
        group.setAttribute(
            "transform",
            `translate(${(centerX - size / 2).toFixed(3)} ` +
            `${(iconCenterY - size / 2).toFixed(3)}) scale(${scale.toFixed(5)})`
        );
        group.setAttribute("opacity", opacity.toFixed(3));
        group.classList.add("gauge-default-icon");

        const outline = document.createElementNS(SVG_NAMESPACE, "rect");
        outline.setAttribute("x", "7");
        outline.setAttribute("y", "4");
        outline.setAttribute("width", "26");
        outline.setAttribute("height", "32");
        outline.setAttribute("rx", "4");
        outline.setAttribute("fill", "none");
        outline.setAttribute("stroke", color);
        outline.setAttribute("stroke-width", "3.2");

        const currency = document.createElementNS(SVG_NAMESPACE, "text");
        currency.textContent = "$";
        currency.setAttribute("x", "20");
        currency.setAttribute("y", "21");
        currency.setAttribute("text-anchor", "middle");
        currency.setAttribute("dominant-baseline", "middle");
        currency.setAttribute("fill", color);
        currency.style.fontFamily = "Segoe UI, Arial, sans-serif";
        currency.style.fontSize = "21px";
        currency.style.fontWeight = "700";

        group.append(outline, currency);
        this.svgElement.appendChild(group);
    }

    private getGaugeSegments(): GaugeSegment[] {
        const settings = this.formattingSettings.colorBehavior;
        const mode = String(settings.mode.value?.value ?? "ranges");
        if (mode === "fixed") {
            return [
                {
                    start: 0,
                    end: 1,
                    color: this.colorValue(
                        settings.fixedColor.value.value,
                        "#FF4C4C"
                    )
                }
            ];
        }

        const thresholds = this.getColorThresholds();
        const firstEnd = thresholds.first / thresholds.target;
        const secondEnd = thresholds.second / thresholds.target;
        const candidates: GaugeSegment[] = [
            {
                start: 0,
                end: firstEnd,
                color: this.colorValue(
                    settings.lowColor.value.value,
                    "#FF4C4C"
                )
            },
            {
                start: firstEnd,
                end: secondEnd,
                color: this.colorValue(
                    settings.mediumColor.value.value,
                    "#FFC300"
                )
            },
            {
                start: secondEnd,
                end: 1,
                color: this.colorValue(
                    settings.highColor.value.value,
                    "#A3F573"
                )
            }
        ];

        return candidates.filter((segment) => segment.end > segment.start);
    }

    private resolveActiveColor(ratio: number): string {
        const settings = this.formattingSettings.colorBehavior;
        const mode = String(settings.mode.value?.value ?? "ranges");
        if (mode === "fixed") {
            return this.colorValue(
                settings.fixedColor.value.value,
                "#FF4C4C"
            );
        }

        switch (this.resolveRangeBand(ratio)) {
            case "zero":
                return this.colorValue(
                    settings.zeroColor.value.value,
                    "#11A3DD"
                );
            case "low":
                return this.colorValue(
                    settings.lowColor.value.value,
                    "#FF4C4C"
                );
            case "medium":
                return this.colorValue(
                    settings.mediumColor.value.value,
                    "#FFC300"
                );
            case "high":
                return this.colorValue(
                    settings.highColor.value.value,
                    "#A3F573"
                );
            case "target":
            default:
                return this.colorValue(
                    settings.targetColor.value.value,
                    "#22B907"
                );
        }
    }

    private resolveValueLabelColor(
        ratio: number,
        activeColor: string
    ): string {
        const settings = this.formattingSettings.valueLabel;
        const colorMode = String(
            this.formattingSettings.colorBehavior.mode.value?.value ??
            "ranges"
        );
        const useRangeColors = colorMode === "ranges" &&
            settings.useRangeColors.value;
        if (!useRangeColors && settings.useGaugeColor.value) {
            return activeColor;
        }
        if (!useRangeColors) {
            return this.colorValue(settings.color.value.value, "#333333");
        }

        switch (this.resolveRangeBand(ratio)) {
            case "zero":
                return this.colorValue(
                    settings.zeroValueColor.value.value,
                    "#11A3DD"
                );
            case "low":
                return this.colorValue(
                    settings.lowValueColor.value.value,
                    "#FF4C4C"
                );
            case "medium":
                return this.colorValue(
                    settings.mediumValueColor.value.value,
                    "#000000"
                );
            case "high":
                return this.colorValue(
                    settings.highValueColor.value.value,
                    "#000000"
                );
            case "target":
            default:
                return this.colorValue(
                    settings.targetValueColor.value.value,
                    "#22B907"
                );
        }
    }

    private resolveRangeBand(ratio: number): RangeBand {
        if (ratio <= 0) {
            return "zero";
        }

        const thresholds = this.getColorThresholds();
        if (ratio >= thresholds.target) {
            return "target";
        }
        if (ratio <= thresholds.first) {
            return "low";
        }
        if (ratio <= thresholds.second) {
            return "medium";
        }
        if (ratio <= thresholds.beforeTarget) {
            return "high";
        }
        return "target";
    }

    private getColorThresholds(): ColorThresholds {
        const settings = this.formattingSettings.colorBehavior;
        const target = this.clamp(
            this.numberValue(settings.targetThreshold.value, 1),
            0.01,
            1
        );
        const first = this.clamp(
            this.numberValue(settings.lowThreshold.value, 0.5),
            0,
            target
        );
        const second = this.clamp(
            Math.max(
                first,
                this.numberValue(settings.mediumThreshold.value, 0.8)
            ),
            0,
            target
        );
        const beforeTarget = this.clamp(
            Math.max(
                second,
                this.numberValue(
                    settings.beforeTargetThreshold.value,
                    0.9
                )
            ),
            0,
            target
        );

        return {
            first,
            second,
            beforeTarget,
            target
        };
    }

    private getGaugeMaximum(): number {
        const mode = String(
            this.formattingSettings.colorBehavior.mode.value?.value ??
            "ranges"
        );
        return mode === "ranges"
            ? this.getColorThresholds().target
            : 1;
    }

    private getVisibleSegmentLimits(
        segment: GaugeSegment,
        gapDegrees: number
    ): { start: number; end: number } {
        const gapNormalized = gapDegrees / 270;
        const maximumInset = (segment.end - segment.start) * 0.45;
        const inset = Math.min(gapNormalized / 2, maximumInset);

        return {
            // Vega applies padAngle at the two outside edges as well. This
            // inset reproduces the shorter, symmetric Deneb endpoints with
            // the stroked-arc implementation used by the custom visual.
            start: segment.start + inset,
            end: segment.end - inset
        };
    }

    private arcPath(
        centerX: number,
        centerY: number,
        radius: number,
        start: number,
        end: number
    ): string {
        if (end <= start || radius <= 0) {
            return "";
        }

        const startPoint = this.polarPoint(
            centerX,
            centerY,
            radius,
            start
        );
        const endPoint = this.polarPoint(
            centerX,
            centerY,
            radius,
            end
        );
        const sweep = (end - start) * TOTAL_ANGLE;
        const largeArc = sweep > Math.PI ? 1 : 0;

        return `M ${startPoint.x.toFixed(3)} ${startPoint.y.toFixed(3)} ` +
            `A ${radius.toFixed(3)} ${radius.toFixed(3)} 0 ${largeArc} 1 ` +
            `${endPoint.x.toFixed(3)} ${endPoint.y.toFixed(3)}`;
    }

    private polarPoint(
        centerX: number,
        centerY: number,
        radius: number,
        normalizedValue: number
    ): Point {
        const angle = START_ANGLE + this.clamp(
            normalizedValue,
            0,
            1
        ) * TOTAL_ANGLE;

        return {
            x: centerX + radius * Math.sin(angle),
            y: centerY - radius * Math.cos(angle)
        };
    }

    private hasRole(dataView: DataView, roleName: string): boolean {
        return Boolean(
            dataView.metadata?.columns?.some(
                (column) => column.roles?.[roleName] === true
            )
        );
    }

    private getRoleColumns(
        dataView: DataView,
        roleName: string
    ): DataViewValueColumn[] {
        const values = dataView.categorical?.values;
        if (!values) {
            return [];
        }

        return Array.from(values).filter(
            (column) => column.source.roles?.[roleName] === true
        );
    }

    private getAggregatedRoleValue(
        dataView: DataView,
        roleName: string
    ): number | null {
        const columns = this.getRoleColumns(dataView, roleName);
        let total = 0;
        let hasNumber = false;

        columns.forEach((column) => {
            column.values?.forEach((value) => {
                if (typeof value === "number" && Number.isFinite(value)) {
                    total += value;
                    hasNumber = true;
                }
            });
        });

        return hasNumber ? total : null;
    }

    private buildTooltipItems(
        dataView: DataView,
        actual: number | null,
        target: number | null,
        ratio: number
    ): VisualTooltipDataItem[] {
        const actualColumn = this.getRoleColumns(dataView, "actual")[0];
        const targetColumn = this.getRoleColumns(dataView, "target")[0];
        const items: VisualTooltipDataItem[] = [
            {
                displayName: actualColumn?.source.displayName || "Faturamento",
                value: actual === null
                    ? "(Em branco)"
                    : this.formatMeasureValue(
                        actual,
                        actualColumn?.source.format || "",
                        2,
                        "none"
                    )
            }
        ];

        if (target !== null && Number.isFinite(target) && target > 0) {
            items.push({
                displayName: targetColumn?.source.displayName || "Meta",
                value: this.formatMeasureValue(
                    target,
                    targetColumn?.source.format || "",
                    2,
                    "none"
                )
            });
            if (actual !== null) {
                items.push({
                    displayName: "Atingimento",
                    value: this.formatPercentage(ratio, 2)
                });
            }
        }

        this.getRoleColumns(dataView, "tooltip").forEach((column) => {
            const values = Array.from(column.values || []).filter(
                (value) => value !== null && value !== undefined
            );
            if (values.length === 0) {
                return;
            }

            const numericValues = values.filter(
                (value): value is number =>
                    typeof value === "number" && Number.isFinite(value)
            );
            let formattedValue: string;

            if (numericValues.length === values.length) {
                const sum = numericValues.reduce(
                    (total, value) => total + value,
                    0
                );
                formattedValue = this.formatMeasureValue(
                    sum,
                    column.source.format || "",
                    2,
                    "none"
                );
            } else {
                const uniqueValues = Array.from(
                    new Set(values.map((value) => String(value)))
                );
                formattedValue = uniqueValues.slice(0, 5).join(", ");
                if (uniqueValues.length > 5) {
                    formattedValue += "…";
                }
            }

            items.push({
                displayName: column.source.displayName || "Detalhe",
                value: formattedValue
            });
        });

        return items;
    }

    private attachTooltipEvents(): void {
        this.svgElement.addEventListener(
            "pointermove",
            (event: PointerEvent) => {
                if (
                    !this.currentData ||
                    !this.formattingSettings.tooltipSettings.show.value
                ) {
                    this.hideTooltip(event.pointerType === "touch");
                    return;
                }

                this.tooltipService.show({
                    coordinates: [event.clientX, event.clientY],
                    isTouchEvent: event.pointerType === "touch",
                    dataItems: this.currentData.tooltipItems,
                    identities: []
                });
            }
        );

        this.svgElement.addEventListener(
            "pointerleave",
            (event: PointerEvent) => {
                this.hideTooltip(event.pointerType === "touch");
            }
        );
    }

    private createAriaLabel(data: GaugeData): string {
        const actualLabel = data.actual === null
            ? `${data.actualName}: em branco.`
            : `${data.actualName}: ${this.formatMeasureValue(
                data.actual,
                data.actualFormat,
                2,
                "none"
            )}.`;
        if (!data.hasTarget || data.target === null) {
            return actualLabel;
        }

        const targetLabel = `${actualLabel} ${data.targetName}: ${this.formatMeasureValue(
            data.target,
            data.targetFormat,
            2,
            "none"
        )}.`;
        return data.hasActual
            ? `${targetLabel} Atingimento: ${this.formatPercentage(
                data.ratio,
                1
            )}.`
            : targetLabel;
    }

    private formatPercentage(value: number, decimalPlaces: number): string {
        const precision = Math.round(this.clamp(decimalPlaces, 0, 12));
        const percentageValue = value * 100;
        const percentageFormat = "#,0" + (precision > 0
            ? `.${"0".repeat(precision)}`
            : "");
        const formattedValue = this.formatMeasureValue(
            percentageValue,
            percentageFormat,
            precision,
            "none",
            VALUE_FORMAT_LOCALE
        );
        return `${formattedValue}%`;
    }

    private formatMeasureValue(
        value: number,
        formatString: string,
        decimalPlaces: number,
        displayUnitsMode: string,
        localeOverride?: string
    ): string {
        const valueLocale = localeOverride || this.host.locale ||
            VALUE_FORMAT_LOCALE;
        const precision = Math.round(this.clamp(decimalPlaces, 0, 12));
        const scaledFormat = this.normalizeFormatScaling(value, formatString);
        const groupedFormat = this.ensureThousandsGrouping(
            scaledFormat.format
        );
        const formattedInput = value / scaledFormat.divisor;
        const effectiveDisplayUnitsMode = scaledFormat.divisor > 1
            ? "none"
            : displayUnitsMode;
        const unitReference = this.resolveDisplayUnitReference(
            formattedInput,
            effectiveDisplayUnitsMode
        );
        const unitSystemType = effectiveDisplayUnitsMode === "none"
            ? displayUnitSystemTypes.DisplayUnitSystemType.Verbose
            : displayUnitSystemTypes.DisplayUnitSystemType.Default;

        try {
            const formattedValue = valueFormatter.create({
                format: groupedFormat,
                value: unitReference,
                precision,
                cultureSelector: valueLocale,
                allowFormatBeautification: true,
                formatSingleValues: effectiveDisplayUnitsMode === "auto",
                displayUnitSystemType: unitSystemType
            }).format(formattedInput);
            const localizedValue = this.localizeFormattedNumber(
                formattedValue,
                valueLocale
            );
            return this.ensureGroupedFormattedOutput(
                localizedValue,
                valueLocale,
                formattedInput,
                effectiveDisplayUnitsMode === "none" &&
                    scaledFormat.divisor === 1 &&
                    !/[%‰\/]/.test(groupedFormat) &&
                    !/[eE][+-]?0/.test(groupedFormat)
            );
        } catch {
            return new Intl.NumberFormat(
                valueLocale,
                {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision
                }
            ).format(formattedInput);
        }
    }

    private ensureGroupedFormattedOutput(
        formattedValue: string,
        locale: string,
        numericValue: number,
        shouldGroup: boolean
    ): string {
        if (
            !shouldGroup ||
            !Number.isFinite(numericValue) ||
            Math.abs(numericValue) < 1000 ||
            /[%‰]/.test(formattedValue) ||
            /\d[eE][+-]?\d/.test(formattedValue)
        ) {
            return formattedValue;
        }

        const separators = this.getNumberSeparators(locale);
        const numericCharacters = this.escapeRegExp(
            `${separators.targetGroup}${separators.targetDecimal}`
        );
        const tokenPattern = new RegExp(
            `[0-9](?:[0-9${numericCharacters}]*[0-9])?`,
            "g"
        );
        const expectedIntegerDigits = Math.max(
            1,
            Math.trunc(Math.abs(numericValue)).toString().length
        );
        const candidates = Array.from(
            formattedValue.matchAll(tokenPattern)
        ).map((match) => {
            const token = match[0];
            const decimalIndex = token.lastIndexOf(
                separators.targetDecimal
            );
            const integerPart = decimalIndex >= 0
                ? token.substring(0, decimalIndex)
                : token;
            const integerDigits = integerPart.replace(/[^0-9]/g, "");
            return {
                index: match.index ?? -1,
                token,
                decimalIndex,
                integerDigits,
                score: Math.abs(
                    integerDigits.length - expectedIntegerDigits
                )
            };
        }).filter((candidate) =>
            candidate.index >= 0 && candidate.integerDigits.length >= 4
        ).sort((left, right) =>
            left.score - right.score ||
            right.integerDigits.length - left.integerDigits.length
        );

        const candidate = candidates[0];
        if (!candidate) {
            return formattedValue;
        }

        const decimalSuffix = candidate.decimalIndex >= 0
            ? candidate.token.substring(candidate.decimalIndex)
            : "";
        const groupedInteger = this.groupIntegerDigits(
            candidate.integerDigits,
            separators
        );
        const replacement = groupedInteger + decimalSuffix;

        return formattedValue.substring(0, candidate.index) +
            replacement +
            formattedValue.substring(candidate.index + candidate.token.length);
    }

    private groupIntegerDigits(
        digits: string,
        separators: NumberSeparators
    ): string {
        const groups: string[] = [];
        let end = digits.length;
        let groupSize = separators.primaryGroupSize;

        while (end > 0) {
            const start = Math.max(0, end - groupSize);
            groups.unshift(digits.substring(start, end));
            end = start;
            groupSize = separators.secondaryGroupSize;
        }

        return groups.join(separators.targetGroup);
    }

    private ensureThousandsGrouping(formatString: string): string {
        const trimmedFormat = formatString.trim();
        if (
            trimmedFormat.length === 0 ||
            /^(?:g|general|general number)$/i.test(trimmedFormat)
        ) {
            return "#,0";
        }

        const standardFormat = trimmedFormat.match(
            /^([a-zA-Z])(\d{0,2})$/
        );
        if (standardFormat) {
            const code = standardFormat[1].toUpperCase();
            const digits = standardFormat[2];
            if (code === "G") {
                return "#,0";
            }
            if (code === "F") {
                const decimalCount = digits.length > 0
                    ? Number(digits)
                    : 2;
                return "#,0" + (decimalCount > 0
                    ? `.${"0".repeat(decimalCount)}`
                    : "");
            }
            return trimmedFormat;
        }

        return this.splitFormatSections(formatString).map((section) =>
            this.ensureGroupingInFormatSection(section)
        ).join(";");
    }

    private splitFormatSections(formatString: string): string[] {
        const sections: string[] = [];
        let section = "";
        let inQuotes = false;
        let inBrackets = false;
        let escaped = false;

        for (let index = 0; index < formatString.length; index += 1) {
            const character = formatString[index];
            if (escaped) {
                section += character;
                escaped = false;
                continue;
            }
            if (character === "\\") {
                section += character;
                escaped = true;
                continue;
            }
            if (!inBrackets && character === "\"") {
                section += character;
                inQuotes = !inQuotes;
                continue;
            }
            if (!inQuotes && character === "[") {
                section += character;
                inBrackets = true;
                continue;
            }
            if (!inQuotes && character === "]") {
                section += character;
                inBrackets = false;
                continue;
            }
            if (character === ";" && !inQuotes && !inBrackets) {
                sections.push(section);
                section = "";
                continue;
            }
            section += character;
        }

        sections.push(section);
        return sections;
    }

    private ensureGroupingInFormatSection(section: string): string {
        let inQuotes = false;
        let inBrackets = false;
        let escaped = false;
        const placeholders: number[] = [];
        let visiblePattern = "";

        for (let index = 0; index < section.length; index += 1) {
            const character = section[index];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (character === "\\") {
                escaped = true;
                continue;
            }
            if (!inBrackets && character === "\"") {
                inQuotes = !inQuotes;
                continue;
            }
            if (!inQuotes && character === "[") {
                inBrackets = true;
                continue;
            }
            if (!inQuotes && character === "]") {
                inBrackets = false;
                continue;
            }
            if (inQuotes || inBrackets) {
                continue;
            }

            visiblePattern += character;
            if (/[0#?]/.test(character)) {
                placeholders.push(index);
            }
        }

        if (
            placeholders.length === 0 ||
            /[%‰\/]/.test(visiblePattern) ||
            /[eE][+-]?0/.test(visiblePattern)
        ) {
            return section;
        }

        const firstPlaceholder = placeholders[0];
        const lastPlaceholder = placeholders[placeholders.length - 1];
        const integerPatternEnd = this.findUnquotedFormatCharacter(
            section,
            ".",
            firstPlaceholder,
            lastPlaceholder
        );
        const integerEnd = integerPatternEnd >= 0
            ? integerPatternEnd
            : lastPlaceholder + 1;
        const groupPosition = this.findUnquotedFormatCharacter(
            section,
            ",",
            firstPlaceholder,
            integerEnd
        );
        if (groupPosition >= 0) {
            return section;
        }

        return section.substring(0, firstPlaceholder) + "#," +
            section.substring(firstPlaceholder);
    }

    private findUnquotedFormatCharacter(
        value: string,
        target: string,
        start: number,
        end: number
    ): number {
        let inQuotes = false;
        let inBrackets = false;
        let escaped = false;

        for (let index = 0; index < value.length; index += 1) {
            const character = value[index];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (character === "\\") {
                escaped = true;
                continue;
            }
            if (!inBrackets && character === "\"") {
                inQuotes = !inQuotes;
                continue;
            }
            if (!inQuotes && character === "[") {
                inBrackets = true;
                continue;
            }
            if (!inQuotes && character === "]") {
                inBrackets = false;
                continue;
            }
            if (
                index >= start &&
                index < end &&
                !inQuotes &&
                !inBrackets &&
                character === target
            ) {
                return index;
            }
        }

        return -1;
    }

    private normalizeFormatScaling(
        value: number,
        formatString: string
    ): ScaledFormat {
        if (!formatString) {
            return { divisor: 1, format: "" };
        }

        const sections = this.splitFormatSections(formatString);
        const normalizedSections: string[] = [];
        const scaleCounts: number[] = [];

        sections.forEach((section) => {
            const lastPlaceholder = this.findLastNumericPlaceholder(section);
            if (lastPlaceholder < 0) {
                normalizedSections.push(section);
                scaleCounts.push(0);
                return;
            }

            const tail = section.substring(lastPlaceholder + 1);
            const scalingMatch = tail.match(/^(\s*)(,+)/);
            const scaleCount = scalingMatch?.[2].length || 0;
            scaleCounts.push(scaleCount);
            normalizedSections.push(scaleCount > 0
                ? section.substring(0, lastPlaceholder + 1) +
                    tail.replace(/^(\s*),+/, "$1")
                : section
            );
        });

        const sectionIndex = value < 0 && sections.length > 1
            ? 1
            : value === 0 && sections.length > 2
                ? 2
                : 0;
        const scaleCount = scaleCounts[sectionIndex] || 0;

        return {
            divisor: Math.pow(1000, scaleCount),
            format: normalizedSections.join(";")
        };
    }

    private findLastNumericPlaceholder(section: string): number {
        let inQuotes = false;
        let escaped = false;
        let lastPlaceholder = -1;

        for (let index = 0; index < section.length; index += 1) {
            const character = section[index];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (character === "\\") {
                escaped = true;
                continue;
            }
            if (character === "\"") {
                inQuotes = !inQuotes;
                continue;
            }
            if (!inQuotes && /[0#?]/.test(character)) {
                lastPlaceholder = index;
            }
        }

        return lastPlaceholder;
    }

    private resolveDisplayUnitReference(value: number, mode: string): number {
        if (mode === "billions") {
            return 1e9;
        }
        if (mode === "millions") {
            return 1e6;
        }
        if (mode === "thousands") {
            return 1e3;
        }
        return mode === "auto" ? Math.abs(value) : 0;
    }

    private normalizeDisplayUnitsMode(value: unknown): string {
        const normalized = String(value ?? "none").trim().toLowerCase();
        const legacyModes: Record<string, string> = {
            "0": "none",
            "1": "none",
            "1000": "thousands",
            "1000000": "millions",
            "1000000000": "billions"
        };
        const resolved = legacyModes[normalized] || normalized;

        return [
            "none",
            "auto",
            "thousands",
            "millions",
            "billions"
        ].includes(resolved)
            ? resolved
            : "none";
    }

    private localizeFormattedNumber(value: string, locale: string): string {
        const separators = this.getNumberSeparators(locale);
        if (
            separators.sourceGroup === separators.targetGroup &&
            separators.sourceDecimal === separators.targetDecimal
        ) {
            return value;
        }

        const sourceCharacters = this.escapeRegExp(
            `${separators.sourceGroup}${separators.sourceDecimal}`
        );
        const numericToken = new RegExp(
            `[0-9](?:[0-9${sourceCharacters}]*[0-9])?`,
            "g"
        );

        return value.replace(numericToken, (token) => token
            .split(separators.sourceGroup).join("\u0000")
            .split(separators.sourceDecimal).join(
                separators.targetDecimal
            )
            .split("\u0000").join(separators.targetGroup));
    }

    private getNumberSeparators(locale: string): NumberSeparators {
        const cached = this.numberSeparatorsByLocale.get(locale);
        if (cached) {
            return cached;
        }

        const probe = valueFormatter.format(
            12345.6,
            "#,0.0",
            false,
            locale
        );
        const sourceMatch = probe.match(/12([^0-9])345([^0-9])6/);
        const targetParts = new Intl.NumberFormat(locale, {
            useGrouping: true,
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).formatToParts(12345.6);
        const groupingParts = new Intl.NumberFormat(locale, {
            useGrouping: true,
            maximumFractionDigits: 0
        }).formatToParts(1234567890123);
        const integerGroupSizes = groupingParts.filter(
            (part) => part.type === "integer"
        ).map((part) => part.value.length);
        const primaryGroupSize = integerGroupSizes.at(-1) || 3;
        const secondaryGroupSize = integerGroupSizes.at(-2) ||
            primaryGroupSize;
        const separators: NumberSeparators = {
            sourceGroup: sourceMatch?.[1] || ",",
            sourceDecimal: sourceMatch?.[2] || ".",
            targetGroup: targetParts.find(
                (part) => part.type === "group"
            )?.value || ",",
            targetDecimal: targetParts.find(
                (part) => part.type === "decimal"
            )?.value || ".",
            primaryGroupSize,
            secondaryGroupSize
        };
        this.numberSeparatorsByLocale.set(locale, separators);
        return separators;
    }

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    private showMessage(message: string): void {
        this.hideTooltip(false);
        this.svgElement.replaceChildren();
        this.svgElement.style.display = "none";
        this.messageElement.textContent = message;
        this.messageElement.style.display = "flex";
    }

    private attachIconControlEvents(): void {
        ["pointerdown", "mousedown", "dblclick", "wheel"].forEach(
            (eventName) => {
                this.iconControlsElement.addEventListener(
                    eventName,
                    (event) => event.stopPropagation()
                );
            }
        );

        this.iconSettingsButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.setIconMenuOpen(!this.iconMenuOpen);
        });

        this.iconControlsElement.addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || !this.iconMenuOpen) {
                return;
            }
            event.preventDefault();
            this.setIconMenuOpen(false);
            this.iconSettingsButton.focus();
        });

        this.importIconButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (this.iconImportInProgress || !this.isAuthoringMode()) {
                return;
            }
            this.iconFileInput.value = "";
            this.setIconMenuOpen(false);
            this.iconFileInput.click();
        });

        this.removeIconButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!this.isAuthoringMode()) {
                return;
            }
            this.persistCustomIcon("");
            this.setIconMenuOpen(false);
            this.showIconFeedback("Ícone padrão restaurado.", false);
        });

        this.iconFileInput.addEventListener("change", () => {
            const file = this.iconFileInput.files?.[0];
            this.iconFileInput.value = "";
            if (file && this.isAuthoringMode()) {
                void this.importCustomIcon(file);
            }
        });
    }

    private createIconActionButton(label: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gauge-visual__icon-action";
        button.textContent = label;
        return button;
    }

    private async importCustomIcon(file: File): Promise<void> {
        this.iconImportInProgress = true;
        this.updateIconControlState();
        this.showIconFeedback("Processando PNG...", false);

        try {
            const dataUrl = await this.resizePngForPersistence(file);
            if (!this.isAuthoringMode()) {
                return;
            }
            this.persistCustomIcon(dataUrl);
            this.showIconFeedback("Ícone salvo no relatório.", false);
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : "Não foi possível importar o PNG.";
            this.showIconFeedback(message, true);
        } finally {
            this.iconImportInProgress = false;
            this.updateIconControlState();
        }
    }

    private async resizePngForPersistence(file: File): Promise<string> {
        const isPng = file.type === "image/png" ||
            (!file.type && /\.png$/i.test(file.name));
        if (!isPng) {
            throw new Error("Selecione um arquivo PNG.");
        }
        if (file.size <= 0) {
            throw new Error("O arquivo PNG está vazio.");
        }
        if (file.size > MAX_ICON_FILE_BYTES) {
            throw new Error("O PNG deve ter no máximo 5 MB.");
        }

        const sourceDataUrl = await this.readFileAsDataUrl(file);
        const sourceImage = await this.loadIconImage(sourceDataUrl);
        const width = sourceImage.naturalWidth;
        const height = sourceImage.naturalHeight;
        if (width <= 0 || height <= 0 || width * height > 40000000) {
            throw new Error("O PNG não possui dimensões válidas.");
        }

        const scale = Math.min(1, MAX_ICON_EDGE / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("O navegador não conseguiu processar o PNG.");
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, targetWidth, targetHeight);
        context.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);
        const dataUrl = this.normalizeIconDataUrl(
            canvas.toDataURL("image/png")
        );
        if (!dataUrl) {
            throw new Error("O PNG processado não pôde ser salvo.");
        }
        return dataUrl;
    }

    private readFileAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("O PNG não pôde ser lido."));
                }
            };
            reader.onerror = () => reject(
                new Error("O PNG não pôde ser lido.")
            );
            reader.onabort = () => reject(
                new Error("A leitura do PNG foi cancelada.")
            );
            reader.readAsDataURL(file);
        });
    }

    private loadIconImage(dataUrl: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = document.createElement("img");
            image.decoding = "async";
            image.onload = () => resolve(image);
            image.onerror = () => reject(
                new Error("O arquivo selecionado não é um PNG válido.")
            );
            image.src = dataUrl;
        });
    }

    private normalizeIconDataUrl(value: string): string {
        if (typeof value !== "string") {
            return "";
        }
        const normalized = value.trim();
        const prefix = "data:image/png;base64,";
        if (
            !normalized.startsWith(prefix) ||
            normalized.length > MAX_ICON_DATA_URL_LENGTH
        ) {
            return "";
        }
        const payload = normalized.substring(prefix.length);
        if (!payload || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
            return "";
        }
        return normalized;
    }

    private persistCustomIcon(dataUrl: string): void {
        if (!this.isAuthoringMode()) {
            return;
        }

        const normalized = dataUrl
            ? this.normalizeIconDataUrl(dataUrl)
            : "";
        if (dataUrl && !normalized) {
            throw new Error("O PNG processado não pôde ser salvo.");
        }

        this.host.persistProperties({
            merge: [
                {
                    objectName: "iconSettings",
                    selector: null,
                    properties: {
                        customIconDataUrl: normalized
                    }
                }
            ]
        });
        this.customIconDataUrl = normalized;
        this.formattingSettings.iconSettings.customIconDataUrl.value = normalized;
        this.formattingSettings.updateVisibility();
        this.renderGauge();
        this.updateIconControlState();
    }

    private updateIconControlsVisibility(): void {
        const visible = this.isAuthoringMode() &&
            this.formattingSettings.iconSettings.showIconControls.value;
        this.iconControlsElement.style.display = visible ? "flex" : "none";
        if (!visible) {
            this.setIconMenuOpen(false);
        }
        this.updateIconControlState();
    }

    private updateIconControlState(): void {
        const enabled = this.isAuthoringMode() && !this.iconImportInProgress;
        this.iconSettingsButton.disabled = !enabled;
        this.importIconButton.disabled = !enabled;
        this.removeIconButton.disabled = !enabled || !this.customIconDataUrl;
        this.iconControlsElement.setAttribute(
            "aria-busy",
            this.iconImportInProgress ? "true" : "false"
        );
    }

    private setIconMenuOpen(open: boolean): void {
        const shouldOpen = open && this.isAuthoringMode();
        this.iconMenuOpen = shouldOpen;
        this.iconMenuElement.style.display = shouldOpen ? "flex" : "none";
        this.iconMenuElement.setAttribute(
            "aria-hidden",
            shouldOpen ? "false" : "true"
        );
        this.iconSettingsButton.setAttribute(
            "aria-expanded",
            shouldOpen ? "true" : "false"
        );
    }

    private showIconFeedback(message: string, isError: boolean): void {
        if (this.iconFeedbackTimer !== null) {
            window.clearTimeout(this.iconFeedbackTimer);
        }
        this.iconFeedbackElement.textContent = message;
        this.iconFeedbackElement.classList.toggle(
            "gauge-visual__icon-feedback--error",
            isError
        );
        this.iconFeedbackElement.style.display = message ? "block" : "none";

        if (message) {
            this.iconFeedbackTimer = window.setTimeout(() => {
                this.iconFeedbackElement.style.display = "none";
                this.iconFeedbackTimer = null;
            }, ICON_FEEDBACK_DURATION);
        }
    }

    private isAuthoringMode(): boolean {
        const isEditView =
            this.currentViewMode === ViewMode.Edit ||
            this.currentViewMode === ViewMode.InFocusEdit;
        if (this.destroyed || !isEditView) {
            return false;
        }

        const hostEnvironment = this.host.hostEnv || 0;
        const isDesktop = (
            hostEnvironment & CustomVisualHostEnv.Desktop
        ) === CustomVisualHostEnv.Desktop;
        const isWebFormatting = (
            hostEnvironment & CustomVisualHostEnv.Web
        ) === CustomVisualHostEnv.Web && this.currentFormatMode;

        return isDesktop || isWebFormatting;
    }

    private colorValue(value: string, fallback: string): string {
        return typeof value === "string" && value.trim()
            ? value
            : fallback;
    }

    private numberValue(value: number, fallback: number): number {
        return Number.isFinite(value) ? value : fallback;
    }

    private pointsToPixels(value: number): number {
        return value * 4 / 3;
    }

    private hideTooltip(isTouchEvent: boolean): void {
        this.tooltipService.hide({
            immediately: true,
            isTouchEvent
        });
    }

    private clamp(value: number, minimum: number, maximum: number): number {
        return Math.min(maximum, Math.max(minimum, value));
    }

    public destroy(): void {
        this.destroyed = true;
        document.removeEventListener(
            "pointerdown",
            this.handleDocumentPointerDown,
            true
        );
        window.removeEventListener("blur", this.handleWindowBlur);
        if (this.iconFeedbackTimer !== null) {
            window.clearTimeout(this.iconFeedbackTimer);
            this.iconFeedbackTimer = null;
        }
        this.hideTooltip(false);
        this.rootElement.replaceChildren();
    }
}
