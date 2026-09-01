"use strict";

import powerbi from "powerbi-visuals-api";
import {
    LngLatBounds,
    Map as MapLibreMap,
    NavigationControl
} from "maplibre-gl";
import {
    FormattingSettingsService
} from "powerbi-visuals-utils-formattingmodel";
import {
    VisualFormattingSettingsModel
} from "./settings";

import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual =
    powerbi.extensibility.visual.IVisual;
import IVisualHost =
    powerbi.extensibility.visual.IVisualHost;
import ITooltipService =
    powerbi.extensibility.ITooltipService;
import ISelectionManager =
    powerbi.extensibility.ISelectionManager;
import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId =
    powerbi.visuals.ISelectionId;
import ViewMode =
    powerbi.ViewMode;
import VisualUpdateType =
    powerbi.VisualUpdateType;

const DEFAULT_BUBBLE_COLOR: string =
    "#E67E22";

const DEFAULT_BORDER_COLOR: string =
    "#FFFFFF";

const DEFAULT_SELECTION_OUTLINE_COLOR:
    string = "#2563EB";

const MAX_TOOLTIP_VALUES_PER_FIELD:
    number = 100;

const MAX_TOOLTIP_TEXT_LENGTH:
    number = 1600;

const MAX_ICON_FILE_BYTES:
    number = 5 * 1024 * 1024;

const MAX_ICON_EDGE:
    number = 128;

const MAX_ICON_DATA_URL_LENGTH:
    number = 512000;

const ICON_FEEDBACK_DURATION:
    number = 4000;

const MAPBOX_USERNAME: string =
    "kevenaraujo";

const MAPBOX_STYLE_ID: string =
    "cmqz9pcw7000401s12tom7zb1";

/*
 * MANTENHA AQUI O TOKEN DO MAPA 
 */
const MAPBOX_ACCESS_TOKEN: string =
    /*"COLOQUE AQUI SEU TOKEN DA API";*/

const MAPBOX_TILE_URL: string =
    `https://api.mapbox.com/styles/v1/` +
    `${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/` +
    `tiles/512/{z}/{x}/{y}` +
    `?access_token=${encodeURIComponent(
        MAPBOX_ACCESS_TOKEN
    )}`;

type MapLevel =
    "state" |
    "city";

interface ExtraTooltipItem {
    displayName: string;
    value: string;
}

interface TooltipValueBucket {
    displayName: string;
    values: string[];
}

interface CityAccumulator {
    state: string;
    city: string;

    weightedLatitude: number;
    weightedLongitude: number;
    coordinateWeight: number;

    size: number;

    labels: string[];

    firstRowIndex: number;

    tooltipBuckets:
        Map<string, TooltipValueBucket>;

    selectionIds:
        ISelectionId[];
}

interface StateAccumulator {
    state: string;

    weightedLatitude: number;
    weightedLongitude: number;
    coordinateWeight: number;

    size: number;
    cityCount: number;

    tooltipBuckets:
        Map<string, TooltipValueBucket>;

    selectionIds:
        ISelectionId[];
}

interface MapPoint {
    level: MapLevel;

    state: string;
    city: string;

    latitude: number;
    longitude: number;

    size: number;
    radius: number;

    cityCount: number;

    customLabel: string;

    extraTooltipItems:
        ExtraTooltipItem[];

    selectionIds:
        ISelectionId[];
}

interface RenderedMarker {
    point: MapPoint;
    element: HTMLDivElement;
}

interface ConvertedData {
    cityPoints: MapPoint[];
    statePoints: MapPoint[];
}

export class Visual implements IVisual {
    private readonly host:
        IVisualHost;

    private readonly tooltipService:
        ITooltipService;

    private readonly selectionManager:
        ISelectionManager;

    private readonly rootElement:
        HTMLDivElement;

    private readonly mapElement:
        HTMLDivElement;

    private readonly markerLayerElement:
        HTMLDivElement;

    private readonly statusElement:
        HTMLDivElement;

    private readonly iconControlsElement:
        HTMLDivElement;

    private readonly iconSettingsButton:
        HTMLButtonElement;

    private readonly iconMenuElement:
        HTMLDivElement;

    private readonly importIconButton:
        HTMLButtonElement;

    private readonly iconFileInput:
        HTMLInputElement;

    private readonly iconFeedbackElement:
        HTMLDivElement;

    private readonly formattingSettingsService:
        FormattingSettingsService;

    private formattingSettings:
        VisualFormattingSettingsModel =
            new VisualFormattingSettingsModel();

    private bubbleColor: string =
        DEFAULT_BUBBLE_COLOR;

    private bubbleTransparencyPercent:
        number = 34;

    private borderColor: string =
        DEFAULT_BORDER_COLOR;

    private borderWidth: number =
        3;

    private showSelectionOutline:
        boolean = true;

    private selectionOutlineColor:
        string =
            DEFAULT_SELECTION_OUTLINE_COLOR;

    private minimumRadius: number =
        18;

    private maximumRadius: number =
        42;

    private showValue: boolean =
        true;

    private showIcon: boolean =
        true;

    private showIconControls: boolean =
        true;

    private customIconDataUrl: string =
        "";

    private iconSizePercent: number =
        58;

    private iconOpacityPercent: number =
        100;

    private enableAutoLevels: boolean =
        true;

    private cityZoomThreshold: number =
        7;

    private transitionDuration: number =
        280;

    private showStateLabel: boolean =
        true;

    private showCityLabel: boolean =
        true;

    private tooltipEnabled: boolean =
        true;

    private tooltipIncludeQuantity:
        boolean = true;

    private map:
        MapLibreMap | null = null;

    private cityPoints:
        MapPoint[] = [];

    private statePoints:
        MapPoint[] = [];

    private renderedMarkers:
        RenderedMarker[] = [];

    private selectedSelectionIds:
        ISelectionId[] = [];

    private currentLevel:
        MapLevel = "state";

    private lastDataSignature:
        string = "";

    private lastFormattingSignature:
        string = "";

    private pendingFitToData:
        boolean = false;

    private transitionTimer:
        number | null = null;

    private iconFeedbackTimer:
        number | null = null;

    private iconImportInProgress:
        boolean = false;

    private iconMenuOpen: boolean =
        false;

    private currentViewMode:
        ViewMode = ViewMode.View;

    private destroyed:
        boolean = false;

    private readonly handleDocumentPointerDown =
        (
            event:
                PointerEvent
        ): void => {
            if (
                !this.iconMenuOpen
            ) {
                return;
            }

            const target:
                Node | null =
                    event.target as
                        Node | null;

            if (
                target &&
                this.iconControlsElement
                    .contains(
                        target
                    )
            ) {
                return;
            }

            this.setIconMenuOpen(
                false
            );
        };

    private readonly handleWindowBlur =
        (): void => {
            this.setIconMenuOpen(
                false
            );
        };

    constructor(
        options: VisualConstructorOptions
    ) {
        this.host =
            options.host;

        this.tooltipService =
            options.host.tooltipService;

        this.selectionManager =
            options.host
                .createSelectionManager();

        this.selectionManager
            .registerOnSelectCallback(
                (
                    selectionIds
                ) => {
                    if (
                        this.destroyed
                    ) {
                        return;
                    }

                    this.selectedSelectionIds =
                        [
                            ...selectionIds as
                                ISelectionId[]
                        ];

                    this.updateMarkerSelectionStyles();
                }
            );

        this.formattingSettingsService =
            new FormattingSettingsService();

        this.rootElement =
            document.createElement(
                "div"
            );

        this.applyRootStyles(
            this.rootElement
        );

        this.mapElement =
            document.createElement(
                "div"
            );

        this.applyMapStyles(
            this.mapElement
        );

        this.markerLayerElement =
            document.createElement(
                "div"
            );

        this.applyMarkerLayerStyles(
            this.markerLayerElement
        );

        this.statusElement =
            document.createElement(
                "div"
            );

        this.applyStatusStyles(
            this.statusElement
        );

        this.statusElement.textContent =
            "Carregando mapa...";

        this.iconControlsElement =
            document.createElement(
                "div"
            );

        this.applyIconControlsStyles(
            this.iconControlsElement
        );

        this.iconSettingsButton =
            this.createIconSettingsButton();

        this.iconMenuElement =
            document.createElement(
                "div"
            );

        this.iconMenuElement.setAttribute(
            "role",
            "group"
        );

        this.iconMenuElement.setAttribute(
            "aria-label",
            "Configurações do ícone"
        );

        this.iconMenuElement.setAttribute(
            "aria-hidden",
            "true"
        );

        this.applyIconMenuStyles(
            this.iconMenuElement
        );

        this.importIconButton =
            this.createIconControlButton(
                "Importar PNG"
            );

        this.importIconButton.title =
            "Escolher um PNG de até 5 MB para todas as bolhas";

        this.iconFileInput =
            document.createElement(
                "input"
            );

        this.iconFileInput.type =
            "file";

        this.iconFileInput.accept =
            "image/png,.png";

        this.iconFileInput.setAttribute(
            "aria-label",
            "Selecionar ícone PNG"
        );

        this.iconFileInput.style.display =
            "none";

        this.iconFeedbackElement =
            document.createElement(
                "div"
            );

        this.applyIconFeedbackStyles(
            this.iconFeedbackElement
        );

        this.iconFeedbackElement.setAttribute(
            "role",
            "status"
        );

        this.iconFeedbackElement.setAttribute(
            "aria-live",
            "polite"
        );

        this.iconFeedbackElement.setAttribute(
            "aria-atomic",
            "true"
        );

        this.iconMenuElement.appendChild(
            this.importIconButton
        );

        this.iconControlsElement.appendChild(
            this.iconSettingsButton
        );

        this.iconControlsElement.appendChild(
            this.iconMenuElement
        );

        this.iconControlsElement.appendChild(
            this.iconFileInput
        );

        this.iconControlsElement.appendChild(
            this.iconFeedbackElement
        );

        this.attachIconControlEvents();

        document.addEventListener(
            "pointerdown",
            this.handleDocumentPointerDown,
            true
        );

        window.addEventListener(
            "blur",
            this.handleWindowBlur
        );

        this.rootElement.appendChild(
            this.mapElement
        );

        this.rootElement.appendChild(
            this.markerLayerElement
        );

        this.rootElement.appendChild(
            this.statusElement
        );

        this.rootElement.appendChild(
            this.iconControlsElement
        );

        options.element.appendChild(
            this.rootElement
        );

        this.updateIconControlsVisibility();

        this.initializeMap();
    }

    private initializeMap(): void {
        if (
            !MAPBOX_ACCESS_TOKEN ||
            MAPBOX_ACCESS_TOKEN ===
                "COLE_SEU_TOKEN_ATUAL_AQUI"
        ) {
            this.showStatus(
                "Informe o token público do Mapbox no visual.ts.",
                true
            );

            return;
        }

        try {
            this.map =
                new MapLibreMap({
                    container:
                        this.mapElement,

                    style: {
                        version: 8,

                        sources: {
                            "mapbox-background-source": {
                                type:
                                    "raster",

                                tiles: [
                                    MAPBOX_TILE_URL
                                ],

                                tileSize:
                                    512,

                                minzoom:
                                    0,

                                maxzoom:
                                    22,

                                attribution:
                                    "© Mapbox © OpenStreetMap"
                            }
                        },

                        layers: [
                            {
                                id:
                                    "mapbox-background-layer",

                                type:
                                    "raster",

                                source:
                                    "mapbox-background-source",

                                minzoom:
                                    0,

                                maxzoom:
                                    22
                            }
                        ]
                    },

                    center: [
                        -44.0,
                        -18.5
                    ],

                    zoom:
                        5,

                    minZoom:
                        2,

                    maxZoom:
                        18,

                    trackResize:
                        false,

                    attributionControl: {
                        compact:
                            true
                    }
                });

            this.map.addControl(
                new NavigationControl({
                    showCompass:
                        true,

                    showZoom:
                        true,

                    visualizePitch:
                        true
                }),

                "top-right"
            );

            const updateMarkerPositions =
                (): void => {
                    this.layoutMarkers();
                };

            this.map.on(
                "load",

                () => {
                    this.map?.resize();

                    if (
                        this.pendingFitToData &&
                        this.cityPoints.length >
                            0
                    ) {
                        this.fitMapToData();

                        this.pendingFitToData =
                            false;
                    }

                    this.currentLevel =
                        this.determineMapLevel();

                    this.rebuildMarkers(
                        false
                    );

                    this.layoutMarkers();

                    this.updateStatus();
                }
            );

            this.map.on(
                "move",
                updateMarkerPositions
            );

            this.map.on(
                "zoom",
                updateMarkerPositions
            );

            this.map.on(
                "rotate",
                updateMarkerPositions
            );

            this.map.on(
                "pitch",
                updateMarkerPositions
            );

            this.map.on(
                "resize",
                updateMarkerPositions
            );

            this.map.on(
                "render",
                updateMarkerPositions
            );

            this.map.on(
                "zoomend",

                () => {
                    this.handleZoomLevelChange();
                }
            );

            this.map.on(
                "click",

                () => {
                    void this.clearVisualSelection();
                }
            );

            this.map.on(
                "error",

                (event) => {
                    console.error(
                        "MapVisual — erro do MapLibre:",
                        event.error
                    );
                }
            );
        } catch (
            error:
                unknown
        ) {
            console.error(
                "MapVisual — erro ao inicializar:",
                error
            );

            this.showStatus(
                "O mapa não pôde ser inicializado.",
                true
            );
        }
    }

    public update(
        options:
            VisualUpdateOptions
    ): void {
        if (
            this.destroyed
        ) {
            return;
        }

        this.selectedSelectionIds =
            [
                ...this.selectionManager
                    .getSelectionIds() as
                        ISelectionId[]
            ];

        if (
            options.viewMode !==
            undefined
        ) {
            this.currentViewMode =
                options.viewMode;
        } else if (
            (
                options.type &
                VisualUpdateType.ViewMode
            ) !== 0
        ) {
            this.currentViewMode =
                ViewMode.View;
        }

        const width:
            number =
                Math.max(
                    0,
                    options.viewport.width
                );

        const height:
            number =
                Math.max(
                    0,
                    options.viewport.height
                );

        this.rootElement.style.width =
            `${width}px`;

        this.rootElement.style.height =
            `${height}px`;

        const dataView =
            options.dataViews?.[0];

        const table =
            dataView?.table;

        let formattingChanged:
            boolean = false;

        let dataChanged:
            boolean = false;

        if (
            dataView
        ) {
            this.formattingSettings =
                this
                    .formattingSettingsService
                    .populateFormattingSettingsModel(
                        VisualFormattingSettingsModel,
                        dataView
                    );

            this.applyFormattingSettings();

            const formattingSignature:
                string =
                    this
                        .createFormattingSignature();

            formattingChanged =
                formattingSignature !==
                this
                    .lastFormattingSignature;

            this.lastFormattingSignature =
                formattingSignature;
        }

        this.updateIconControlsVisibility();

        if (
            table?.columns &&
            table.rows
        ) {
            const convertedData:
                ConvertedData =
                    this
                        .convertDataViewToPoints(
                            options
                        );

            const dataSignature:
                string =
                    this.createDataSignature(
                        convertedData
                            .cityPoints
                    );

            dataChanged =
                dataSignature !==
                this.lastDataSignature;

            if (
                dataChanged
            ) {
                this.cityPoints =
                    convertedData
                        .cityPoints;

                this.statePoints =
                    convertedData
                        .statePoints;

                this.lastDataSignature =
                    dataSignature;

                this.pendingFitToData =
                    true;
            }
        } else if (
            dataView
        ) {
            dataChanged =
                this.lastDataSignature !==
                "[]";

            if (
                dataChanged
            ) {
                this.cityPoints =
                    [];

                this.statePoints =
                    [];

                this.lastDataSignature =
                    "[]";

                this.pendingFitToData =
                    false;
            }
        }

        if (
            formattingChanged
        ) {
            this.markerLayerElement
                .style
                .transitionDuration =
                    `${this.transitionDuration}ms`;
        }

        if (
            dataChanged ||
            formattingChanged
        ) {
            this.cancelLevelTransition();

            this.currentLevel =
                this.determineMapLevel();

            this.rebuildMarkers(
                false
            );
        } else {
            this.updateMarkerSelectionStyles();
        }

        window.requestAnimationFrame(
            () => {
                if (
                    this.destroyed
                ) {
                    return;
                }

                this.map?.resize();

                this.layoutMarkers();

                if (
                    this.pendingFitToData &&
                    this.cityPoints.length >
                        0
                ) {
                    this.fitMapToData();

                    this.pendingFitToData =
                        false;

                    window.requestAnimationFrame(
                        () => {
                            this
                                .handleZoomLevelChange();
                        }
                    );
                }

                this.updateStatus();
            }
        );
    }

    public getFormattingModel():
        powerbi.visuals.FormattingModel {

        return this
            .formattingSettingsService
            .buildFormattingModel(
                this.formattingSettings
            );
    }

    private applyFormattingSettings():
        void {

        this.bubbleColor =
            this.formattingSettings
                .bubbleCard
                .bubbleColor
                .value
                .value ||
            DEFAULT_BUBBLE_COLOR;

        this.bubbleTransparencyPercent =
            this.clamp(
                this.formattingSettings
                    .bubbleCard
                    .bubbleOpacity
                    .value,

                0,
                100
            );

        this.borderColor =
            this.formattingSettings
                .bubbleCard
                .borderColor
                .value
                .value ||
            DEFAULT_BORDER_COLOR;

        this.borderWidth =
            this.clamp(
                this.formattingSettings
                    .bubbleCard
                    .borderWidth
                    .value,

                0,
                12
            );

        this.showSelectionOutline =
            this.formattingSettings
                .bubbleCard
                .showSelectionOutline
                .value;

        this.selectionOutlineColor =
            this.formattingSettings
                .bubbleCard
                .selectionOutlineColor
                .value
                .value ||
            DEFAULT_SELECTION_OUTLINE_COLOR;

        this.formattingSettings
            .bubbleCard
            .selectionOutlineColor
            .visible =
                this.showSelectionOutline;

        this.minimumRadius =
            this.clamp(
                this.formattingSettings
                    .bubbleCard
                    .minimumRadius
                    .value,

                4,
                120
            );

        this.maximumRadius =
            this.clamp(
                this.formattingSettings
                    .bubbleCard
                    .maximumRadius
                    .value,

                4,
                180
            );

        if (
            this.maximumRadius <
            this.minimumRadius
        ) {
            this.maximumRadius =
                this.minimumRadius;
        }

        this.showValue =
            this.formattingSettings
                .bubbleCard
                .showValue
                .value;

        this.showIcon =
            this.formattingSettings
                .iconCard
                .showIcon
                .value;

        this.showIconControls =
            this.formattingSettings
                .iconCard
                .showIconControls
                .value;

        this.customIconDataUrl =
            this.normalizeIconDataUrl(
                this.formattingSettings
                    .iconCard
                    .customIconDataUrl
                    .value
            );

        this.iconSizePercent =
            this.clamp(
                this.formattingSettings
                    .iconCard
                    .iconSize
                    .value,

                10,
                100
            );

        this.iconOpacityPercent =
            this.clamp(
                this.formattingSettings
                    .iconCard
                    .iconOpacity
                    .value,

                0,
                100
            );

        this.enableAutoLevels =
            this.formattingSettings
                .mapLevelsCard
                .enableAutoLevels
                .value;

        this.cityZoomThreshold =
            this.clamp(
                this.formattingSettings
                    .mapLevelsCard
                    .cityZoomThreshold
                    .value,

                2,
                18
            );

        this.transitionDuration =
            this.clamp(
                this.formattingSettings
                    .mapLevelsCard
                    .transitionDuration
                    .value,

                0,
                1500
            );

        this.showStateLabel =
            this.formattingSettings
                .mapLevelsCard
                .showStateLabel
                .value;

        this.showCityLabel =
            this.formattingSettings
                .mapLevelsCard
                .showCityLabel
                .value;

        this.tooltipEnabled =
            this.formattingSettings
                .tooltipCard
                .enableTooltip
                .value;

        this.tooltipIncludeQuantity =
            this.formattingSettings
                .tooltipCard
                .includeQuantity
                .value;
    }

    private convertDataViewToPoints(
        options:
            VisualUpdateOptions
    ): ConvertedData {
        const table =
            options
                .dataViews?.[0]
                ?.table;

        if (
            !table?.columns ||
            !table.rows
        ) {
            return {
                cityPoints: [],
                statePoints: []
            };
        }

        const stateIndex =
            this.getRoleIndex(
                table.columns,
                "state"
            );

        const cityIndex =
            this.getRoleIndex(
                table.columns,
                "city"
            );

        const latitudeIndex =
            this.getRoleIndex(
                table.columns,
                "latitude"
            );

        const longitudeIndex =
            this.getRoleIndex(
                table.columns,
                "longitude"
            );

        const sizeIndex =
            this.getRoleIndex(
                table.columns,
                "size"
            );

        const labelIndex =
            this.getRoleIndex(
                table.columns,
                "label"
            );

        const tooltipIndices =
            this.getRoleIndices(
                table.columns,
                "tooltips"
            );

        if (
            stateIndex < 0 ||
            cityIndex < 0 ||
            latitudeIndex < 0 ||
            longitudeIndex < 0
        ) {
            return {
                cityPoints: [],
                statePoints: []
            };
        }

        const cityAccumulators =
            new Map<
                string,
                CityAccumulator
            >();

        table.rows.forEach(
            (
                row:
                    powerbi.DataViewTableRow,

                rowIndex:
                    number
            ) => {
                const state:
                    string =
                        this.toText(
                            row[stateIndex]
                        ).trim();

                const city:
                    string =
                        this.toText(
                            row[cityIndex]
                        ).trim();

                const latitude =
                    this.toFiniteNumber(
                        row[
                            latitudeIndex
                        ]
                    );

                const longitude =
                    this.toFiniteNumber(
                        row[
                            longitudeIndex
                        ]
                    );

                if (
                    !state ||
                    !city ||
                    latitude === null ||
                    longitude === null ||
                    latitude < -90 ||
                    latitude > 90 ||
                    longitude < -180 ||
                    longitude > 180
                ) {
                    return;
                }

                const rawSize =
                    sizeIndex >= 0
                        ? this
                            .toFiniteNumber(
                                row[
                                    sizeIndex
                                ]
                            )
                        : 1;

        const size:
    number =
        sizeIndex >= 0
            ? Math.max(
                0,
                rawSize ?? 0
            )
            : 1;

if (
    sizeIndex >= 0 &&
    size <= 0
) {
    return;
}

const coordinateWeight:
    number =
        size;
     



                const label:
                    string =
                        labelIndex >= 0
                            ? this
                                .toText(
                                    row[
                                        labelIndex
                                    ]
                                )
                                .trim()
                            : "";

                const key:
                    string =
                        `${state}` +
                        "\u001F" +
                        `${city}`;

                let accumulator =
                    cityAccumulators.get(
                        key
                    );

                if (
                    !accumulator
                ) {
                    accumulator = {
                        state,
                        city,

                        weightedLatitude:
                            0,

                        weightedLongitude:
                            0,

                        coordinateWeight:
                            0,

                        size:
                            0,

                        labels:
                            [],

                        firstRowIndex:
                            rowIndex,

                        tooltipBuckets:
                            new Map<
                                string,
                                TooltipValueBucket
                            >(),

                        selectionIds:
                            []
                    };

                    cityAccumulators.set(
                        key,
                        accumulator
                    );
                }

                accumulator.size +=
                    size;

                accumulator
                    .weightedLatitude +=
                        latitude *
                        coordinateWeight;

                accumulator
                    .weightedLongitude +=
                        longitude *
                        coordinateWeight;

                accumulator
                    .coordinateWeight +=
                        coordinateWeight;

                this.appendUniqueText(
                    accumulator.labels,
                    label
                );

                tooltipIndices.forEach(
                    (
                        tooltipIndex:
                            number
                    ) => {
                        const tooltipValue:
                            string =
                                this
                                    .toTooltipText(
                                        row[
                                            tooltipIndex
                                        ]
                                    );

                        if (
                            !tooltipValue
                        ) {
                            return;
                        }

                        const column =
                            table.columns[
                                tooltipIndex
                            ];

                        const displayName:
                            string =
                                column
                                    .displayName ||
                                column
                                    .queryName ||
                                "Informação";

                        const bucketKey:
                            string =
                                `${tooltipIndex}:` +
                                `${displayName}`;

                        this.appendTooltipValue(
                            accumulator
                                .tooltipBuckets,

                            bucketKey,
                            displayName,
                            tooltipValue
                        );
                    }
                );

                const selectionId =
                    this
                        .createTableSelectionId(
                            table,
                            rowIndex
                        );

                if (
                    selectionId
                ) {
                    this.appendSelectionId(
                        accumulator
                            .selectionIds,

                        selectionId
                    );
                }
            }
        );

        const cityPoints:
            MapPoint[] =
                [];

        const stateAccumulators =
            new Map<
                string,
                StateAccumulator
            >();

        cityAccumulators.forEach(
            (
                accumulator:
                    CityAccumulator
            ) => {
                const latitude:
                    number =
                        accumulator
                            .weightedLatitude /
                        Math.max(
                            1,
                            accumulator
                                .coordinateWeight
                        );

                const longitude:
                    number =
                        accumulator
                            .weightedLongitude /
                        Math.max(
                            1,
                            accumulator
                                .coordinateWeight
                        );

                cityPoints.push({
                    level:
                        "city",

                    state:
                        accumulator.state,

                    city:
                        accumulator.city,

                    latitude,
                    longitude,

                    size:
                        accumulator.size,

                    radius:
                        this.minimumRadius,

                    cityCount:
                        1,

                    customLabel:
                        accumulator
                            .labels
                            .join(", "),

                    extraTooltipItems:
                        this
                            .bucketsToTooltipItems(
                                accumulator
                                    .tooltipBuckets
                            ),

                    selectionIds:
                        accumulator
                            .selectionIds
                });

                let stateAccumulator =
                    stateAccumulators.get(
                        accumulator.state
                    );

                if (
                    !stateAccumulator
                ) {
                    stateAccumulator = {
                        state:
                            accumulator.state,

                        weightedLatitude:
                            0,

                        weightedLongitude:
                            0,

                        coordinateWeight:
                            0,

                        size:
                            0,

                        cityCount:
                            0,

                        tooltipBuckets:
                            new Map<
                                string,
                                TooltipValueBucket
                            >(),

                        selectionIds:
                            []
                    };

                    stateAccumulators.set(
                        accumulator.state,
                        stateAccumulator
                    );
                }

                const stateCoordinateWeight:
                    number =
                        accumulator.size >
                        0
                            ? accumulator
                                .size
                            : 1;

                stateAccumulator.size +=
                    accumulator.size;

                stateAccumulator.cityCount +=
                    1;

                stateAccumulator
                    .weightedLatitude +=
                        latitude *
                        stateCoordinateWeight;

                stateAccumulator
                    .weightedLongitude +=
                        longitude *
                        stateCoordinateWeight;

                stateAccumulator
                    .coordinateWeight +=
                        stateCoordinateWeight;

                accumulator
                    .tooltipBuckets
                    .forEach(
                        (
                            bucket:
                                TooltipValueBucket,

                            bucketKey:
                                string
                        ) => {
                            bucket
                                .values
                                .forEach(
                                    (
                                        value:
                                            string
                                    ) => {
                                        this
                                            .appendTooltipValue(
                                                stateAccumulator
                                                    .tooltipBuckets,

                                                bucketKey,

                                                bucket
                                                    .displayName,

                                                value
                                            );
                                    }
                                );
                        }
                    );

                accumulator
                    .selectionIds
                    .forEach(
                        (
                            selectionId:
                                ISelectionId
                        ) => {
                            this
                                .appendSelectionId(
                                    stateAccumulator
                                        .selectionIds,

                                    selectionId
                                );
                        }
                    );
            }
        );

        const statePoints:
            MapPoint[] =
                Array.from(
                    stateAccumulators
                        .values()
                ).map(
                    (
                        accumulator:
                            StateAccumulator
                    ) => ({
                        level:
                            "state",

                        state:
                            accumulator.state,

                        city:
                            "",

                        latitude:
                            accumulator
                                .weightedLatitude /
                            Math.max(
                                1,
                                accumulator
                                    .coordinateWeight
                            ),

                        longitude:
                            accumulator
                                .weightedLongitude /
                            Math.max(
                                1,
                                accumulator
                                    .coordinateWeight
                            ),

                        size:
                            accumulator
                                .size,

                        radius:
                            this.minimumRadius,

                        cityCount:
                            accumulator
                                .cityCount,

                        customLabel:
                            "",

                        extraTooltipItems:
                            this
                                .bucketsToTooltipItems(
                                    accumulator
                                        .tooltipBuckets
                                ),

                        selectionIds:
                            accumulator
                                .selectionIds
                    })
                );

        this.applyRadiusScaleToPoints(
            cityPoints
        );

        this.applyRadiusScaleToPoints(
            statePoints
        );

        return {
            cityPoints,
            statePoints
        };
    }

    private applyRadiusScaleToPoints(
        points:
            MapPoint[]
    ): void {
        if (
            points.length ===
            0
        ) {
            return;
        }

        const maximumSize:
            number =
                Math.max(
                    1,

                    ...points.map(
                        (
                            point:
                                MapPoint
                        ) =>
                            point.size
                    )
                );

        points.forEach(
            (
                point:
                    MapPoint
            ) => {
                const proportion:
                    number =
                        Math.sqrt(
                            point.size /
                            maximumSize
                        );

                point.radius =
                    this.minimumRadius +
                    (
                        this.maximumRadius -
                        this.minimumRadius
                    ) *
                    proportion;
            }
        );
    }

    private determineMapLevel():
        MapLevel {

        if (
            !this.enableAutoLevels
        ) {
            return "city";
        }

        const zoom:
            number =
                this.map?.getZoom() ??
                0;

        return zoom >=
            this.cityZoomThreshold
                ? "city"
                : "state";
    }

    private handleZoomLevelChange():
        void {

        const targetLevel:
            MapLevel =
                this.determineMapLevel();

        if (
            targetLevel ===
            this.currentLevel
        ) {
            return;
        }

        this.transitionToLevel(
            targetLevel
        );
    }

    private cancelLevelTransition():
        void {

        if (
            this.transitionTimer !==
            null
        ) {
            window.clearTimeout(
                this.transitionTimer
            );

            this.transitionTimer =
                null;
        }

        if (
            this.iconFeedbackTimer !==
            null
        ) {
            window.clearTimeout(
                this.iconFeedbackTimer
            );

            this.iconFeedbackTimer =
                null;
        }

        this.iconFileInput.value =
            "";

        this.markerLayerElement
            .style
            .opacity =
                "1";
    }

    private transitionToLevel(
        targetLevel:
            MapLevel
    ): void {
        this.cancelLevelTransition();

        const duration:
            number =
                this.transitionDuration;

        if (
            duration <= 0
        ) {
            this.currentLevel =
                targetLevel;

            this.rebuildMarkers(
                false
            );

            return;
        }

        this.markerLayerElement
            .style
            .opacity =
                "0";

        this.transitionTimer =
            window.setTimeout(
                () => {
                    this.currentLevel =
                        targetLevel;

                    this.rebuildMarkers(
                        false
                    );

                    window
                        .requestAnimationFrame(
                            () => {
                                this
                                    .markerLayerElement
                                    .style
                                    .opacity =
                                        "1";
                            }
                        );

                    this.transitionTimer =
                        null;
                },

                Math.max(
                    50,
                    Math.round(
                        duration *
                        0.45
                    )
                )
            );
    }

    private getActivePoints():
        MapPoint[] {

        return this.currentLevel ===
            "city"
                ? this.cityPoints
                : this.statePoints;
    }

    private rebuildMarkers(
        useTransition:
            boolean
    ): void {
        if (
            useTransition
        ) {
            this.markerLayerElement
                .style
                .opacity =
                    "0";
        }

        this.hideTooltip();

        this.markerLayerElement
            .replaceChildren();

        this.renderedMarkers =
            [];

        const activePoints:
            MapPoint[] =
                this.getActivePoints();

        this.applyRadiusScaleToPoints(
            activePoints
        );

        activePoints.forEach(
            (
                point:
                    MapPoint
            ) => {
                const marker =
                    document.createElement(
                        "div"
                    );

                marker.classList.add(
                    "map-visual-marker"
                );

                this.applyMarkerStyles(
                    marker,
                    point
                );

                marker.tabIndex =
                    0;

                marker.setAttribute(
                    "aria-label",

                    this.createMarkerTitle(
                        point
                    ).replace(
                        /\n/g,
                        ". "
                    )
                );

                marker.setAttribute(
                    "role",
                    point.selectionIds.length >
                            0 &&
                        this.canInteract()
                        ? "button"
                        : "img"
                );

                const bubble =
                    document.createElement(
                        "div"
                    );

                bubble.classList.add(
                    "map-visual-bubble"
                );

                this.applyBubbleStyles(
                    bubble
                );

                if (
                    this.showIcon
                ) {
                    bubble.appendChild(
                        this.createIconElement()
                    );
                }

                if (
                    this.showValue
                ) {
                    const value =
                        document.createElement(
                            "div"
                        );

                    this.applyValueStyles(
                        value
                    );

                    value.textContent =
                        this.formatNumber(
                            point.size
                        );

                    bubble.appendChild(
                        value
                    );
                }

                marker.appendChild(
                    bubble
                );

                const markerLabel:
                    string =
                        this.getMarkerLabel(
                            point
                        );

                if (
                    markerLabel
                ) {
                    const label =
                        document.createElement(
                            "div"
                        );

                    this.applyLabelStyles(
                        label
                    );

                    label.textContent =
                        markerLabel;

                    marker.appendChild(
                        label
                    );
                }

                this.attachTooltipEvents(
                    marker,
                    point
                );

                this.attachSelectionEvents(
                    marker,
                    point
                );

                this.markerLayerElement
                    .appendChild(
                        marker
                    );

                this.renderedMarkers.push({
                    point,
                    element:
                        marker
                });
            }
        );

        this.layoutMarkers();

        this.updateMarkerSelectionStyles();

        if (
            useTransition
        ) {
            window
                .requestAnimationFrame(
                    () => {
                        this
                            .markerLayerElement
                            .style
                            .opacity =
                                "1";
                    }
                );
        }
    }

    private attachIconControlEvents():
        void {

        [
            "pointerdown",
            "mousedown",
            "dblclick",
            "wheel"
        ].forEach(
            (
                eventName:
                    string
            ) => {
                this.iconControlsElement
                    .addEventListener(
                        eventName,

                        (
                            event:
                                Event
                        ) => {
                            event.stopPropagation();
                        }
                    );
            }
        );

        this.iconSettingsButton
            .addEventListener(
                "click",

                (
                    event:
                        MouseEvent
                ) => {
                    event.preventDefault();
                    event.stopPropagation();

                    this.setIconMenuOpen(
                        !this.iconMenuOpen
                    );
                }
            );

        this.iconControlsElement
            .addEventListener(
                "keydown",

                (
                    event:
                        KeyboardEvent
                ) => {
                    if (
                        event.key !==
                            "Escape" ||
                        !this.iconMenuOpen
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    this.setIconMenuOpen(
                        false
                    );

                    this.iconSettingsButton
                        .focus();
                }
            );

        this.iconControlsElement
            .addEventListener(
                "focusout",

                (
                    event:
                        FocusEvent
                ) => {
                    const nextTarget:
                        Node | null =
                            event.relatedTarget as
                                Node | null;

                    if (
                        nextTarget &&
                        this.iconControlsElement
                            .contains(
                                nextTarget
                            )
                    ) {
                        return;
                    }

                    this.setIconMenuOpen(
                        false
                    );
                }
            );

        this.importIconButton
            .addEventListener(
                "click",

                (
                    event:
                        MouseEvent
                ) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (
                        this.iconImportInProgress ||
                        !this.isAuthoringMode()
                    ) {
                        return;
                    }

                    this.iconFileInput.value =
                        "";

                    this.setIconMenuOpen(
                        false
                    );

                    this.iconFileInput.click();

                    this.iconSettingsButton
                        .focus();
                }
            );

        this.iconFileInput
            .addEventListener(
                "change",

                () => {
                    const file:
                        File | undefined =
                            this.iconFileInput
                                .files?.[0];

                    this.iconFileInput.value =
                        "";

                    if (
                        file &&
                        this.isAuthoringMode()
                    ) {
                        void this.importCustomIcon(
                            file
                        );
                    }
                }
            );
    }

    private async importCustomIcon(
        file:
            File
    ): Promise<void> {
        if (
            !this.isAuthoringMode()
        ) {
            return;
        }

        this.iconImportInProgress =
            true;

        this.updateIconControlState();

        this.showIconFeedback(
            "Processando PNG...",
            false
        );

        try {
            const dataUrl:
                string =
                    await this
                        .resizePngForPersistence(
                            file
                        );

            if (
                !this.isAuthoringMode()
            ) {
                return;
            }

            this.persistCustomIcon(
                dataUrl
            );

            this.showIconFeedback(
                "Ícone salvo no relatório.",
                false
            );
        } catch (
            error:
                unknown
        ) {
            if (
                !this.destroyed
            ) {
                this.setIconMenuOpen(
                    true
                );

                this.showIconFeedback(
                    this.getIconErrorMessage(
                        error,
                        "Não foi possível importar o PNG."
                    ),
                    true
                );
            }
        } finally {
            this.iconImportInProgress =
                false;

            if (
                !this.destroyed
            ) {
                this.updateIconControlState();
            }
        }
    }

    private async resizePngForPersistence(
        file:
            File
    ): Promise<string> {
        const isPng:
            boolean =
                file.type ===
                    "image/png" ||
                (
                    !file.type &&
                    /\.png$/i.test(
                        file.name
                    )
                );

        if (
            !isPng
        ) {
            throw new Error(
                "Selecione um arquivo PNG."
            );
        }

        if (
            file.size <= 0
        ) {
            throw new Error(
                "O arquivo PNG está vazio."
            );
        }

        if (
            file.size >
            MAX_ICON_FILE_BYTES
        ) {
            throw new Error(
                "O PNG deve ter no máximo 5 MB."
            );
        }

        const sourceDataUrl:
            string =
                await this.readFileAsDataUrl(
                    file
                );

        const sourceImage:
            HTMLImageElement =
                await this.loadIconImage(
                    sourceDataUrl
                );

        const sourceWidth:
            number =
                sourceImage.naturalWidth;

        const sourceHeight:
            number =
                sourceImage.naturalHeight;

        if (
            sourceWidth <= 0 ||
            sourceHeight <= 0
        ) {
            throw new Error(
                "O PNG não possui dimensões válidas."
            );
        }

        if (
            sourceWidth *
            sourceHeight >
            40000000
        ) {
            throw new Error(
                "A resolução do PNG é muito grande."
            );
        }

        const scale:
            number =
                Math.min(
                    1,
                    MAX_ICON_EDGE /
                        Math.max(
                            sourceWidth,
                            sourceHeight
                        )
                );

        const targetWidth:
            number =
                Math.max(
                    1,
                    Math.round(
                        sourceWidth *
                        scale
                    )
                );

        const targetHeight:
            number =
                Math.max(
                    1,
                    Math.round(
                        sourceHeight *
                        scale
                    )
                );

        const canvas:
            HTMLCanvasElement =
                document.createElement(
                    "canvas"
                );

        canvas.width =
            targetWidth;

        canvas.height =
            targetHeight;

        const context:
            CanvasRenderingContext2D | null =
                canvas.getContext(
                    "2d"
                );

        if (
            !context
        ) {
            throw new Error(
                "O navegador não conseguiu processar o PNG."
            );
        }

        context.imageSmoothingEnabled =
            true;

        context.imageSmoothingQuality =
            "high";

        context.clearRect(
            0,
            0,
            targetWidth,
            targetHeight
        );

        context.drawImage(
            sourceImage,
            0,
            0,
            targetWidth,
            targetHeight
        );

        const dataUrl:
            string =
                canvas.toDataURL(
                    "image/png"
                );

        const normalizedDataUrl:
            string =
                this.normalizeIconDataUrl(
                    dataUrl
                );

        if (
            !normalizedDataUrl
        ) {
            throw new Error(
                "O PNG processado não pôde ser salvo."
            );
        }

        return normalizedDataUrl;
    }

    private readFileAsDataUrl(
        file:
            File
    ): Promise<string> {
        return new Promise(
            (
                resolve,
                reject
            ) => {
                const reader:
                    FileReader =
                        new FileReader();

                reader.onload =
                    () => {
                        if (
                            typeof reader.result ===
                            "string"
                        ) {
                            resolve(
                                reader.result
                            );

                            return;
                        }

                        reject(
                            new Error(
                                "O PNG não pôde ser lido."
                            )
                        );
                    };

                reader.onerror =
                    () => {
                        reject(
                            new Error(
                                "O PNG não pôde ser lido."
                            )
                        );
                    };

                reader.onabort =
                    () => {
                        reject(
                            new Error(
                                "A leitura do PNG foi cancelada."
                            )
                        );
                    };

                reader.readAsDataURL(
                    file
                );
            }
        );
    }

    private loadIconImage(
        dataUrl:
            string
    ): Promise<HTMLImageElement> {
        return new Promise(
            (
                resolve,
                reject
            ) => {
                const image:
                    HTMLImageElement =
                        document.createElement(
                            "img"
                        );

                image.decoding =
                    "async";

                image.onload =
                    () => {
                        resolve(
                            image
                        );
                    };

                image.onerror =
                    () => {
                        reject(
                            new Error(
                                "O arquivo selecionado não é um PNG válido."
                            )
                        );
                    };

                image.src =
                    dataUrl;
            }
        );
    }

    private normalizeIconDataUrl(
        value:
            string
    ): string {
        if (
            typeof value !==
                "string"
        ) {
            return "";
        }

        const normalizedValue:
            string =
                value.trim();

        const prefix:
            string =
                "data:image/png;base64,";

        if (
            !normalizedValue.startsWith(
                prefix
            ) ||
            normalizedValue.length >
                MAX_ICON_DATA_URL_LENGTH
        ) {
            return "";
        }

        const payload:
            string =
                normalizedValue.substring(
                    prefix.length
                );

        if (
            !payload ||
            !/^[A-Za-z0-9+/]+={0,2}$/.test(
                payload
            )
        ) {
            return "";
        }

        return normalizedValue;
    }

    private persistCustomIcon(
        dataUrl:
            string
    ): void {
        if (
            !this.isAuthoringMode()
        ) {
            throw new Error(
                "A importação de PNG só está disponível no modo de edição."
            );
        }

        const normalizedDataUrl:
            string =
                dataUrl
                    ? this.normalizeIconDataUrl(
                        dataUrl
                    )
                    : "";

        if (
            dataUrl &&
            !normalizedDataUrl
        ) {
            throw new Error(
                "O PNG processado não pôde ser salvo."
            );
        }

        this.host.persistProperties({
            merge: [
                {
                    objectName:
                        "iconSettings",

                    selector:
                        null,

                    properties: {
                        customIconDataUrl:
                            normalizedDataUrl
                    }
                }
            ]
        });

        this.customIconDataUrl =
            normalizedDataUrl;

        this.formattingSettings
            .iconCard
            .customIconDataUrl
            .value =
                normalizedDataUrl;

        this.lastFormattingSignature =
            this.createFormattingSignature();

        this.rebuildMarkers(
            false
        );

        this.updateIconControlState();
    }

    private updateIconControlsVisibility():
        void {

        const canShowControls:
            boolean =
                this.canShowIconControls();

        if (
            !canShowControls
        ) {
            this.setIconMenuOpen(
                false
            );
        }

        this.iconControlsElement
            .style
            .display =
                canShowControls
                    ? "flex"
                    : "none";

        this.updateIconControlState();
    }

    private canShowIconControls():
        boolean {
        return this.isAuthoringMode() &&
            this.showIconControls;
    }

    private isAuthoringMode():
        boolean {
        return !this.destroyed &&
            (
                this.currentViewMode ===
                    ViewMode.Edit ||
                this.currentViewMode ===
                    ViewMode.InFocusEdit
            );
    }

    private setIconMenuOpen(
        isOpen:
            boolean
    ): void {
        const shouldOpen:
            boolean =
                isOpen &&
                this.canShowIconControls();

        this.iconMenuOpen =
            shouldOpen;

        this.iconMenuElement
            .style
            .display =
                shouldOpen
                    ? "flex"
                    : "none";

        this.iconMenuElement.setAttribute(
            "aria-hidden",
            shouldOpen
                ? "false"
                : "true"
        );

        this.iconSettingsButton.setAttribute(
            "aria-expanded",
            shouldOpen
                ? "true"
                : "false"
        );
    }

    private updateIconControlState():
        void {
        const isAuthoring:
            boolean =
                this.isAuthoringMode();

        this.iconSettingsButton.disabled =
            !isAuthoring;

        this.importIconButton.disabled =
            this.iconImportInProgress ||
            !isAuthoring;

        this.iconFileInput.disabled =
            !isAuthoring;

        this.iconMenuElement.setAttribute(
            "aria-busy",
            this.iconImportInProgress
                ? "true"
                : "false"
        );

        this.importIconButton.style.opacity =
            this.importIconButton.disabled
                ? "0.55"
                : "1";

        this.importIconButton.style.cursor =
            this.importIconButton.disabled
                ? "default"
                : "pointer";

        this.iconSettingsButton.style.opacity =
            this.iconSettingsButton.disabled
                ? "0.55"
                : "1";

        this.iconSettingsButton.style.cursor =
            this.iconSettingsButton.disabled
                ? "default"
                : "pointer";
    }

    private showIconFeedback(
        message:
            string,

        isError:
            boolean
    ): void {
        if (
            this.iconFeedbackTimer !==
            null
        ) {
            window.clearTimeout(
                this.iconFeedbackTimer
            );

            this.iconFeedbackTimer =
                null;
        }

        this.iconFeedbackElement
            .textContent =
                message;

        this.iconFeedbackElement
            .style
            .color =
                isError
                    ? "#991B1B"
                    : "#166534";

        this.iconFeedbackElement
            .style
            .display =
                message
                    ? "block"
                    : "none";

        if (
            message
        ) {
            this.iconFeedbackTimer =
                window.setTimeout(
                    () => {
                        this.iconFeedbackElement
                            .style
                            .display =
                                "none";

                        this.iconFeedbackTimer =
                            null;
                    },

                    ICON_FEEDBACK_DURATION
                );
        }
    }

    private getIconErrorMessage(
        error:
            unknown,

        fallbackMessage:
            string
    ): string {
        return error instanceof
            Error &&
            error.message
                ? error.message
                : fallbackMessage;
    }

    private createIconControlButton(
        label:
            string
    ): HTMLButtonElement {
        const button:
            HTMLButtonElement =
                document.createElement(
                    "button"
                );

        button.type =
            "button";

        button.className =
            "map-visual-icon-action-button";

        button.textContent =
            label;

        this.applyIconControlButtonStyles(
            button
        );

        return button;
    }

    private createIconSettingsButton():
        HTMLButtonElement {
        const button:
            HTMLButtonElement =
                document.createElement(
                    "button"
                );

        button.type =
            "button";

        button.className =
            "map-visual-icon-settings-button";

        button.title =
            "Configurações do ícone";

        button.setAttribute(
            "aria-label",
            "Configurações do ícone"
        );

        button.setAttribute(
            "aria-haspopup",
            "true"
        );

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        const svgNamespace:
            "http://www.w3.org/2000/svg" =
                "http://www.w3.org/2000/svg";

        const icon:
            SVGSVGElement =
                document.createElementNS(
                    svgNamespace,
                    "svg"
                );

        icon.setAttribute(
            "viewBox",
            "0 0 24 24"
        );

        icon.setAttribute(
            "width",
            "18"
        );

        icon.setAttribute(
            "height",
            "18"
        );

        icon.setAttribute(
            "aria-hidden",
            "true"
        );

        icon.setAttribute(
            "focusable",
            "false"
        );

        const outerCircle:
            SVGCircleElement =
                document.createElementNS(
                    svgNamespace,
                    "circle"
                );

        outerCircle.setAttribute(
            "cx",
            "12"
        );

        outerCircle.setAttribute(
            "cy",
            "12"
        );

        outerCircle.setAttribute(
            "r",
            "6.5"
        );

        const innerCircle:
            SVGCircleElement =
                document.createElementNS(
                    svgNamespace,
                    "circle"
                );

        innerCircle.setAttribute(
            "cx",
            "12"
        );

        innerCircle.setAttribute(
            "cy",
            "12"
        );

        innerCircle.setAttribute(
            "r",
            "2.25"
        );

        const spokes:
            SVGPathElement =
                document.createElementNS(
                    svgNamespace,
                    "path"
                );

        spokes.setAttribute(
            "d",
            "M12 2v3m0 14v3 " +
                "M4.93 4.93l2.12 2.12 " +
                "m9.9 9.9 2.12 2.12 " +
                "M2 12h3m14 0h3 " +
                "M4.93 19.07l2.12-2.12 " +
                "m9.9-9.9 2.12-2.12"
        );

        [
            outerCircle,
            innerCircle,
            spokes
        ].forEach(
            (
                shape:
                    SVGElement
            ) => {
                shape.setAttribute(
                    "fill",
                    "none"
                );

                shape.setAttribute(
                    "stroke",
                    "currentColor"
                );

                shape.setAttribute(
                    "stroke-width",
                    "1.8"
                );

                shape.setAttribute(
                    "stroke-linecap",
                    "round"
                );

                shape.setAttribute(
                    "stroke-linejoin",
                    "round"
                );

                icon.appendChild(
                    shape
                );
            }
        );

        button.appendChild(
            icon
        );

        this.applyIconSettingsButtonStyles(
            button
        );

        return button;
    }

    private getMarkerLabel(
        point:
            MapPoint
    ): string {
        if (
            point.level ===
            "state"
        ) {
            return this.showStateLabel
                ? point.state
                : "";
        }

        if (
            !this.showCityLabel
        ) {
            return "";
        }

        return (
            point.customLabel ||
            point.city
        );
    }

    private createIconElement():
        HTMLImageElement {
        const image =
            document.createElement(
                "img"
            );

        const defaultIcon:
            string =
                this.getTractorDataUri();

        const iconSources:
            Array<{
                url: string;
                alt: string;
            }> = [];

        if (
            this.customIconDataUrl
        ) {
            iconSources.push({
                url:
                    this.customIconDataUrl,

                alt:
                    "Ícone PNG personalizado"
            });
        }

        iconSources.push({
            url:
                defaultIcon,

            alt:
                "Ícone de trator"
        });

        image.draggable =
            false;

        this.applyIconStyles(
            image
        );

        let sourceIndex:
            number = 0;

        const applySource =
            (): void => {
                const source =
                    iconSources[
                        sourceIndex
                    ];

                image.alt =
                    source.alt;

                image.src =
                    source.url;
            };

        image.addEventListener(
            "error",

            () => {
                sourceIndex +=
                    1;

                if (
                    sourceIndex <
                    iconSources.length
                ) {
                    applySource();
                }
            }
        );

        applySource();

        return image;
    }

    private attachSelectionEvents(
        marker:
            HTMLDivElement,

        point:
            MapPoint
    ): void {
        marker.addEventListener(
            "click",

            (
                event:
                    MouseEvent
            ) => {
                event.preventDefault();
                event.stopPropagation();

                void this.selectPoint(
                    point,
                    event.ctrlKey ||
                        event.metaKey
                );
            }
        );

        marker.addEventListener(
            "keydown",

            (
                event:
                    KeyboardEvent
            ) => {
                if (
                    event.key !==
                        "Enter" &&
                    event.key !==
                        " "
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                void this.selectPoint(
                    point,
                    event.ctrlKey ||
                        event.metaKey
                );
            }
        );
    }

    private async selectPoint(
        point:
            MapPoint,

        multiSelect:
            boolean
    ): Promise<void> {
        if (
            !this.canInteract() ||
            point.selectionIds.length ===
                0
        ) {
            return;
        }

        try {
            const selectedIds =
                await this.selectionManager
                    .select(
                        point.selectionIds,
                        multiSelect
                    );

            if (
                this.destroyed
            ) {
                return;
            }

            this.selectedSelectionIds =
                selectedIds as
                    ISelectionId[];

            this.updateMarkerSelectionStyles();
        } catch (
            error:
                unknown
        ) {
            console.warn(
                "MapVisual — não foi possível selecionar a bolha:",
                error
            );
        }
    }

    private async clearVisualSelection():
        Promise<void> {
        if (
            !this.canInteract() ||
            (
                !this.selectionManager
                    .hasSelection() &&
                this.selectedSelectionIds
                    .length === 0
            )
        ) {
            return;
        }

        try {
            await this.selectionManager
                .clear();

            if (
                this.destroyed
            ) {
                return;
            }

            this.selectedSelectionIds =
                [];

            this.updateMarkerSelectionStyles();
        } catch (
            error:
                unknown
        ) {
            console.warn(
                "MapVisual — não foi possível limpar a seleção:",
                error
            );
        }
    }

    private updateMarkerSelectionStyles():
        void {
        const selectedSelectionKeys =
            new Set<string>(
                this.selectedSelectionIds
                    .map(
                        (
                            selectionId:
                                ISelectionId
                        ) =>
                            selectionId
                                .getKey()
                    )
            );

        const selectionStates:
            Array<
                "none" |
                "partial" |
                "full"
            > =
                this.renderedMarkers.map(
                    (
                        renderedMarker:
                            RenderedMarker
                    ) => {
                        const pointSelectionIds =
                            renderedMarker
                                .point
                                .selectionIds;

                        const matchingCount:
                            number =
                                pointSelectionIds
                                    .filter(
                                        (
                                            pointSelectionId:
                                                ISelectionId
                                        ) =>
                                            selectedSelectionKeys
                                                .has(
                                                    pointSelectionId
                                                        .getKey()
                                                )
                                    )
                                    .length;

                        if (
                            matchingCount === 0
                        ) {
                            return "none";
                        }

                        return matchingCount ===
                            pointSelectionIds.length
                                ? "full"
                                : "partial";
                    }
                );

        const hasRelevantSelection:
            boolean =
                selectionStates.some(
                    (
                        state
                    ) =>
                        state !==
                            "none"
                );

        this.renderedMarkers.forEach(
            (
                renderedMarker:
                    RenderedMarker,

                index:
                    number
            ) => {
                const selectionState:
                    "none" |
                    "partial" |
                    "full" =
                        selectionStates[
                            index
                        ];

                const isSelected:
                    boolean =
                        selectionState !==
                            "none";

                const isSelectable:
                    boolean =
                        this.canInteract() &&
                        renderedMarker
                            .point
                            .selectionIds
                            .length > 0;

                renderedMarker
                    .element
                    .style
                    .opacity =
                        !hasRelevantSelection ||
                        isSelected
                            ? "1"
                            : "0.35";

                renderedMarker
                    .element
                    .style
                    .filter =
                        "none";

                renderedMarker
                    .element
                    .style
                    .zIndex =
                        isSelected
                            ? "2"
                            : "1";

                renderedMarker
                    .element
                    .style
                    .cursor =
                        isSelectable
                            ? "pointer"
                            : "default";

                renderedMarker
                    .element
                    .setAttribute(
                        "role",
                        isSelectable
                            ? "button"
                            : "img"
                    );

                const bubbleElement =
                    renderedMarker
                        .element
                        .querySelector<
                            HTMLDivElement
                        >(
                            ".map-visual-bubble"
                        );

                if (
                    bubbleElement
                ) {
                    bubbleElement
                        .style
                        .outline =
                            !this
                                .showSelectionOutline ||
                            selectionState ===
                                "none"
                                ? "none"
                                : selectionState ===
                                "full"
                                    ? `3px solid ${this.selectionOutlineColor}`
                                    : `3px dashed ${this.selectionOutlineColor}`;

                    bubbleElement
                        .style
                        .outlineOffset =
                            "2px";
                }

                if (
                    isSelectable
                ) {
                    renderedMarker
                        .element
                        .setAttribute(
                            "aria-pressed",
                            selectionState ===
                                "full"
                                ? "true"
                                : selectionState ===
                                    "partial"
                                    ? "mixed"
                                    : "false"
                        );
                } else {
                    renderedMarker
                        .element
                        .removeAttribute(
                            "aria-pressed"
                        );
                }
            }
        );
    }

    private canInteract():
        boolean {
        return !this.destroyed &&
            this.host
                .hostCapabilities
                .allowInteractions !==
                    false;
    }

    private attachTooltipEvents(
        marker:
            HTMLDivElement,

        point:
            MapPoint
    ): void {
        marker.addEventListener(
            "mouseenter",

            (
                event:
                    MouseEvent
            ) => {
                this.showTooltip(
                    event,
                    point
                );
            }
        );

        marker.addEventListener(
            "mousemove",

            (
                event:
                    MouseEvent
            ) => {
                this.moveTooltip(
                    event,
                    point
                );
            }
        );

        marker.addEventListener(
            "mouseleave",

            () => {
                this.hideTooltip();
            }
        );

        marker.addEventListener(
            "blur",

            () => {
                this.hideTooltip();
            }
        );
    }

    private showTooltip(
        event:
            MouseEvent,

        point:
            MapPoint
    ): void {
        if (
            !this.tooltipEnabled ||
            !this.tooltipService
                .enabled()
        ) {
            return;
        }

        const dataItems:
            VisualTooltipDataItem[] =
                this.buildTooltipItems(
                    point
                );

        if (
            dataItems.length ===
            0
        ) {
            return;
        }

        this.tooltipService.show({
            coordinates: [
                event.clientX,
                event.clientY
            ],

            isTouchEvent:
                false,

            dataItems,

            identities:
                point.selectionIds
        });
    }

    private moveTooltip(
        event:
            MouseEvent,

        point:
            MapPoint
    ): void {
        if (
            !this.tooltipEnabled ||
            !this.tooltipService
                .enabled()
        ) {
            return;
        }

        this.tooltipService.move({
            coordinates: [
                event.clientX,
                event.clientY
            ],

            isTouchEvent:
                false,

            dataItems:
                this.buildTooltipItems(
                    point
                ),

            identities:
                point.selectionIds
        });
    }

    private hideTooltip():
        void {

        if (
            !this.tooltipService
                .enabled()
        ) {
            return;
        }

        this.tooltipService.hide({
            isTouchEvent:
                false,

            immediately:
                true
        });
    }

    private buildTooltipItems(
        point:
            MapPoint
    ): VisualTooltipDataItem[] {
        const items:
            VisualTooltipDataItem[] =
                [];

        if (
            point.level ===
            "state"
        ) {
            items.push({
                displayName:
                    "Estado",

                value:
                    point.state
            });

            items.push({
                displayName:
                    "Cidades",

                value:
                    this.formatNumber(
                        point.cityCount
                    )
            });
        } else {
            items.push({
                displayName:
                    "Cidade",

                value:
                    point.city
            });

            items.push({
                displayName:
                    "Estado",

                value:
                    point.state
            });
        }

        if (
            this.tooltipIncludeQuantity
        ) {
            items.push({
                displayName:
                    "Quantidade",

                value:
                    this.formatNumber(
                        point.size
                    )
            });
        }

        point.extraTooltipItems.forEach(
            (
                item:
                    ExtraTooltipItem
            ) => {
                items.push({
                    displayName:
                        item.displayName,

                    value:
                        item.value
                });
            }
        );

        return items;
    }

    private layoutMarkers():
        void {

        if (
            !this.map ||
            this.destroyed
        ) {
            return;
        }

        const canvas =
            this.map.getCanvas();

        const canvasWidth:
            number =
                canvas.clientWidth;

        const canvasHeight:
            number =
                canvas.clientHeight;

        this.renderedMarkers.forEach(
            (
                {
                    point,
                    element
                }:
                    RenderedMarker
            ) => {
                const projected =
                    this.map?.project([
                        point.longitude,
                        point.latitude
                    ]);

                if (
                    !projected
                ) {
                    element
                        .style
                        .display =
                            "none";

                    return;
                }

                const margin:
                    number =
                        point.radius +
                        100;

                const visible:
                    boolean =
                        projected.x >=
                            -margin &&

                        projected.x <=
                            canvasWidth +
                            margin &&

                        projected.y >=
                            -margin &&

                        projected.y <=
                            canvasHeight +
                            margin;

                element.style.display =
                    visible
                        ? "block"
                        : "none";

                element.style.transform =
                    `translate(` +
                    `${projected.x}px, ` +
                    `${projected.y}px) ` +
                    "translate(-50%, -50%)";
            }
        );
    }

    private fitMapToData():
        void {

        if (
            !this.map ||
            this.cityPoints.length ===
                0
        ) {
            return;
        }

        if (
            this.cityPoints.length ===
            1
        ) {
            const point:
                MapPoint =
                    this.cityPoints[0];

            this.map.jumpTo({
                center: [
                    point.longitude,
                    point.latitude
                ],

                zoom:
                    9
            });

            return;
        }

        const bounds =
            new LngLatBounds();

        this.cityPoints.forEach(
            (
                point:
                    MapPoint
            ) => {
                bounds.extend([
                    point.longitude,
                    point.latitude
                ]);
            }
        );

        this.map.fitBounds(
            bounds,

            {
                padding:
                    70,

                maxZoom:
                    11,

                duration:
                    0
            }
        );
    }

    private updateStatus():
        void {

        if (
            this.cityPoints.length ===
            0
        ) {
            this.showStatus(
                "Adicione Estado, Cidade, Latitude e Longitude.",
                false
            );

            return;
        }

        this.statusElement
            .style
            .display =
                "none";
    }

    private showStatus(
        message:
            string,

        isError:
            boolean
    ): void {
        this.statusElement.textContent =
            message;

        this.statusElement.style.color =
            isError
                ? "#991B1B"
                : "#1F2937";

        this.statusElement.style.display =
            "block";
    }

    private createMarkerTitle(
        point:
            MapPoint
    ): string {
        const lines:
            string[] =
                [];

        if (
            point.level ===
            "state"
        ) {
            lines.push(
                `Estado: ${
                    point.state
                }`
            );

            lines.push(
                `Cidades: ${
                    this.formatNumber(
                        point.cityCount
                    )
                }`
            );
        } else {
            lines.push(
                `Cidade: ${
                    point.city
                }`
            );

            lines.push(
                `Estado: ${
                    point.state
                }`
            );
        }

        lines.push(
            `Quantidade: ${
                this.formatNumber(
                    point.size
                )
            }`
        );

        point.extraTooltipItems.forEach(
            (
                item:
                    ExtraTooltipItem
            ) => {
                lines.push(
                    `${item.displayName}: ` +
                    `${item.value}`
                );
            }
        );

        return lines
            .filter(
                Boolean
            )
            .join(
                "\n"
            );
    }

    private appendUniqueText(
        values:
            string[],

        value:
            string
    ): void {
        if (
            value &&
            !values.includes(
                value
            )
        ) {
            values.push(
                value
            );
        }
    }

    private appendTooltipValue(
        buckets:
            Map<
                string,
                TooltipValueBucket
            >,

        bucketKey:
            string,

        displayName:
            string,

        value:
            string
    ): void {
        if (
            !value
        ) {
            return;
        }

        let bucket =
            buckets.get(
                bucketKey
            );

        if (
            !bucket
        ) {
            bucket = {
                displayName,
                values: []
            };

            buckets.set(
                bucketKey,
                bucket
            );
        }

        if (
            bucket.values.length <
                MAX_TOOLTIP_VALUES_PER_FIELD &&

            !bucket.values.includes(
                value
            )
        ) {
            bucket.values.push(
                value
            );
        }
    }

    private bucketsToTooltipItems(
        buckets:
            Map<
                string,
                TooltipValueBucket
            >
    ): ExtraTooltipItem[] {
        return Array
            .from(
                buckets.values()
            )
            .map(
                (
                    bucket:
                        TooltipValueBucket
                ) => ({
                    displayName:
                        bucket.displayName,

                    value:
                        this.joinTooltipValues(
                            bucket.values
                        )
                })
            );
    }

    private joinTooltipValues(
        values:
            string[]
    ): string {
        const joined:
            string =
                values.join(
                    ", "
                );

        if (
            joined.length <=
            MAX_TOOLTIP_TEXT_LENGTH
        ) {
            return joined;
        }

        return (
            joined.substring(
                0,
                MAX_TOOLTIP_TEXT_LENGTH -
                    3
            ) +
            "..."
        );
    }

    private appendSelectionId(
        selectionIds:
            ISelectionId[],

        selectionId:
            ISelectionId
    ): void {
        const alreadyIncluded:
            boolean =
                selectionIds.some(
                    (
                        existingSelectionId:
                            ISelectionId
                    ) =>
                        existingSelectionId
                            .equals(
                                selectionId
                            )
                );

        if (
            !alreadyIncluded
        ) {
            selectionIds.push(
                selectionId
            );
        }
    }

    private createTableSelectionId(
        table:
            powerbi.DataViewTable,

        rowIndex:
            number
    ): ISelectionId | null {
        try {
            return this.host
                .createSelectionIdBuilder()
                .withTable(
                    table,
                    rowIndex
                )
                .createSelectionId();
        } catch (
            error:
                unknown
        ) {
            console.warn(
                "MapVisual — não foi possível criar a identidade da linha:",
                error
            );

            return null;
        }
    }

    private getTractorDataUri():
        string {

        const svg:
            string = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 48"
            >
                <path
                    d="M14 25h28l7 8H13z"
                    fill="#FFFFFF"
                />

                <path
                    d="M24 10h15l7 15H21z"
                    fill="#FFFFFF"
                />

                <path
                    d="M28 14h8l4 9H26z"
                    fill="#264653"
                />

                <path
                    d="M46 20h8v13h-8z"
                    fill="#FFFFFF"
                />

                <path
                    d="M50 10h3v11h-3z"
                    fill="#FFFFFF"
                />

                <circle
                    cx="22"
                    cy="35"
                    r="10"
                    fill="#FFFFFF"
                />

                <circle
                    cx="22"
                    cy="35"
                    r="4"
                    fill="#E67E22"
                />

                <circle
                    cx="48"
                    cy="36"
                    r="7"
                    fill="#FFFFFF"
                />

                <circle
                    cx="48"
                    cy="36"
                    r="3"
                    fill="#E67E22"
                />
            </svg>
        `;

        return (
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
                svg
            )
        );
    }

    private createDataSignature(
        points:
            MapPoint[]
    ): string {
        return JSON.stringify(
            points.map(
                (
                    point:
                        MapPoint
                ) => ({
                    state:
                        point.state,

                    city:
                        point.city,

                    latitude:
                        point.latitude,

                    longitude:
                        point.longitude,

                    size:
                        point.size,

                    customLabel:
                        point.customLabel,

                    tooltip:
                        point
                            .extraTooltipItems,

                    selectionKeys:
                        point.selectionIds
                            .map(
                                (
                                    selectionId:
                                        ISelectionId
                                ) =>
                                    selectionId
                                        .getKey()
                            )
                })
            )
        );
    }

    private createFormattingSignature():
        string {

        return JSON.stringify({
            bubbleColor:
                this.bubbleColor,

            bubbleTransparencyPercent:
                this
                    .bubbleTransparencyPercent,

            borderColor:
                this.borderColor,

            borderWidth:
                this.borderWidth,

            showSelectionOutline:
                this.showSelectionOutline,

            selectionOutlineColor:
                this.selectionOutlineColor,

            minimumRadius:
                this.minimumRadius,

            maximumRadius:
                this.maximumRadius,

            showValue:
                this.showValue,

            showIcon:
                this.showIcon,

            showIconControls:
                this.showIconControls,

            customIconDataUrl:
                this.customIconDataUrl,

            iconSizePercent:
                this.iconSizePercent,

            iconOpacityPercent:
                this.iconOpacityPercent,

            enableAutoLevels:
                this.enableAutoLevels,

            cityZoomThreshold:
                this.cityZoomThreshold,

            transitionDuration:
                this.transitionDuration,

            showStateLabel:
                this.showStateLabel,

            showCityLabel:
                this.showCityLabel,

            tooltipEnabled:
                this.tooltipEnabled,

            tooltipIncludeQuantity:
                this
                    .tooltipIncludeQuantity
        });
    }

    private getRoleIndex(
        columns:
            powerbi
                .DataViewMetadataColumn[],

        roleName:
            string
    ): number {
        return columns.findIndex(
            (
                column:
                    powerbi
                        .DataViewMetadataColumn
            ) =>
                Boolean(
                    column.roles?.[
                        roleName
                    ]
                )
        );
    }

    private getRoleIndices(
        columns:
            powerbi
                .DataViewMetadataColumn[],

        roleName:
            string
    ): number[] {
        const indices:
            number[] =
                [];

        columns.forEach(
            (
                column:
                    powerbi
                        .DataViewMetadataColumn,

                index:
                    number
            ) => {
                if (
                    column.roles?.[
                        roleName
                    ]
                ) {
                    indices.push(
                        index
                    );
                }
            }
        );

        return indices;
    }

    private toFiniteNumber(
        value:
            powerbi.PrimitiveValue
    ): number | null {
        if (
            typeof value ===
            "number"
        ) {
            return Number.isFinite(
                value
            )
                ? value
                : null;
        }

        if (
            typeof value ===
            "string"
        ) {
            const normalizedValue:
                string =
                    value
                        .trim()
                        .replace(
                            ",",
                            "."
                        );

            const parsedValue:
                number =
                    Number(
                        normalizedValue
                    );

            return Number.isFinite(
                parsedValue
            )
                ? parsedValue
                : null;
        }

        return null;
    }

    private toText(
        value:
            powerbi.PrimitiveValue
    ): string {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        if (
            value instanceof Date
        ) {
            return value
                .toLocaleDateString(
                    "pt-BR"
                );
        }

        return String(
            value
        );
    }

    private toTooltipText(
        value:
            powerbi.PrimitiveValue
    ): string {
        if (
            typeof value ===
            "number"
        ) {
            return this.formatNumber(
                value
            );
        }

        if (
            typeof value ===
            "boolean"
        ) {
            return value
                ? "Sim"
                : "Não";
        }

        return this
            .toText(
                value
            )
            .trim();
    }

    private formatNumber(
        value:
            number
    ): string {
        return new Intl
            .NumberFormat(
                "pt-BR",

                {
                    maximumFractionDigits:
                        2
                }
            )
            .format(
                value
            );
    }

    private clamp(
        value:
            number,

        minimum:
            number,

        maximum:
            number
    ): number {
        const safeValue:
            number =
                Number.isFinite(
                    value
                )
                    ? value
                    : minimum;

        return Math.min(
            maximum,

            Math.max(
                minimum,
                safeValue
            )
        );
    }

    private colorWithOpacity(
        color:
            string,

        opacity:
            number
    ): string {
        const normalizedColor:
            string =
                color.trim();

        const shortHexMatch =
            /^#([0-9a-fA-F]{3})$/
                .exec(
                    normalizedColor
                );

        const longHexMatch =
            /^#([0-9a-fA-F]{6})$/
                .exec(
                    normalizedColor
                );

        let hexValue:
            string | null =
                null;

        if (
            shortHexMatch
        ) {
            hexValue =
                shortHexMatch[1]
                    .split("")
                    .map(
                        (
                            character:
                                string
                        ) =>
                            character +
                            character
                    )
                    .join("");
        } else if (
            longHexMatch
        ) {
            hexValue =
                longHexMatch[1];
        }

        if (
            !hexValue
        ) {
            return (
                normalizedColor ||
                DEFAULT_BUBBLE_COLOR
            );
        }

        const red:
            number =
                parseInt(
                    hexValue.substring(
                        0,
                        2
                    ),
                    16
                );

        const green:
            number =
                parseInt(
                    hexValue.substring(
                        2,
                        4
                    ),
                    16
                );

        const blue:
            number =
                parseInt(
                    hexValue.substring(
                        4,
                        6
                    ),
                    16
                );

        const safeOpacity:
            number =
                this.clamp(
                    opacity,
                    0,
                    1
                );

        return (
            `rgba(` +
            `${red}, ` +
            `${green}, ` +
            `${blue}, ` +
            `${safeOpacity})`
        );
    }

    private applyRootStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "relative";

        element.style.width =
            "100%";

        element.style.height =
            "100%";

        element.style.minWidth =
            "0";

        element.style.minHeight =
            "0";

        element.style.overflow =
            "hidden";

        element.style.fontFamily =
            "Segoe UI, Arial, sans-serif";
    }

    private applyMapStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.inset =
            "0";

        element.style.width =
            "100%";

        element.style.height =
            "100%";

        element.style.zIndex =
            "0";
    }

    private applyMarkerLayerStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.inset =
            "0";

        element.style.width =
            "100%";

        element.style.height =
            "100%";

        element.style.zIndex =
            "10";

        element.style.pointerEvents =
            "none";

        element.style.overflow =
            "hidden";

        element.style.opacity =
            "1";

        element.style.transitionProperty =
            "opacity";

        element.style.transitionTimingFunction =
            "ease";

        element.style.transitionDuration =
            `${this.transitionDuration}ms`;
    }

    private applyStatusStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.left =
            "50%";

        element.style.top =
            "10px";

        element.style.zIndex =
            "40";

        element.style.transform =
            "translateX(-50%)";

        element.style.padding =
            "6px 10px";

        element.style.fontSize =
            "12px";

        element.style.fontWeight =
            "600";

        element.style.color =
            "#1F2937";

        element.style.background =
            "rgba(255, 255, 255, 0.94)";

        element.style.border =
            "1px solid rgba(31, 41, 55, 0.18)";

        element.style.borderRadius =
            "6px";

        element.style.boxShadow =
            "0 1px 4px rgba(0, 0, 0, 0.16)";

        element.style.pointerEvents =
            "none";

        element.style.whiteSpace =
            "nowrap";
    }

    private applyIconControlsStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.left =
            "10px";

        element.style.top =
            "10px";

        element.style.zIndex =
            "50";

        element.style.display =
            "none";

        element.style.alignItems =
            "flex-start";

        element.style.width =
            "calc(100% - 20px)";

        element.style.minHeight =
            "32px";

        element.style.maxWidth =
            "calc(100% - 20px)";

        element.style.pointerEvents =
            "none";
    }

    private applyIconSettingsButtonStyles(
        element:
            HTMLButtonElement
    ): void {
        element.style.width =
            "32px";

        element.style.minWidth =
            "32px";

        element.style.height =
            "32px";

        element.style.padding =
            "0";

        element.style.display =
            "inline-flex";

        element.style.alignItems =
            "center";

        element.style.justifyContent =
            "center";

        element.style.border =
            "1px solid rgba(31, 41, 55, 0.28)";

        element.style.borderRadius =
            "6px";

        element.style.background =
            "rgba(255, 255, 255, 0.96)";

        element.style.color =
            "#1F2937";

        element.style.boxShadow =
            "0 1px 4px rgba(0, 0, 0, 0.16)";

        element.style.cursor =
            "pointer";

        element.style.pointerEvents =
            "auto";
    }

    private applyIconMenuStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.left =
            "0";

        element.style.top =
            "38px";

        element.style.zIndex =
            "1";

        element.style.display =
            "none";

        element.style.flexDirection =
            "column";

        element.style.alignItems =
            "stretch";

        element.style.gap =
            "5px";

        element.style.minWidth =
            "154px";

        element.style.padding =
            "6px";

        element.style.border =
            "1px solid rgba(31, 41, 55, 0.20)";

        element.style.borderRadius =
            "7px";

        element.style.background =
            "rgba(255, 255, 255, 0.98)";

        element.style.boxShadow =
            "0 4px 12px rgba(0, 0, 0, 0.18)";

        element.style.pointerEvents =
            "auto";
    }

    private applyIconControlButtonStyles(
        element:
            HTMLButtonElement
    ): void {
        element.style.minHeight =
            "32px";

        element.style.width =
            "100%";

        element.style.padding =
            "6px 9px";

        element.style.border =
            "1px solid rgba(31, 41, 55, 0.28)";

        element.style.borderRadius =
            "5px";

        element.style.background =
            "rgba(255, 255, 255, 0.96)";

        element.style.color =
            "#1F2937";

        element.style.fontFamily =
            "Segoe UI, Arial, sans-serif";

        element.style.fontSize =
            "11px";

        element.style.fontWeight =
            "600";

        element.style.lineHeight =
            "16px";

        element.style.textAlign =
            "left";

        element.style.cursor =
            "pointer";

        element.style.whiteSpace =
            "nowrap";
    }

    private applyIconFeedbackStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.left =
            "38px";

        element.style.top =
            "0";

        element.style.display =
            "none";

        element.style.padding =
            "5px 8px";

        element.style.border =
            "1px solid rgba(31, 41, 55, 0.18)";

        element.style.borderRadius =
            "5px";

        element.style.background =
            "rgba(255, 255, 255, 0.96)";

        element.style.fontSize =
            "11px";

        element.style.fontWeight =
            "600";

        element.style.lineHeight =
            "16px";

        element.style.boxShadow =
            "0 1px 4px rgba(0, 0, 0, 0.16)";

        element.style.whiteSpace =
            "normal";

        element.style.maxWidth =
            "calc(100% - 38px)";

        element.style.pointerEvents =
            "none";
    }

    private applyMarkerStyles(
        element:
            HTMLDivElement,

        point:
            MapPoint
    ): void {
        const diameter:
            number =
                point.radius *
                2;

        element.style.position =
            "absolute";

        element.style.left =
            "0";

        element.style.top =
            "0";

        element.style.width =
            `${diameter}px`;

        element.style.height =
            `${diameter}px`;

        element.style.zIndex =
            "1";

        element.style.transformOrigin =
            "center center";

        element.style.pointerEvents =
            "auto";

        element.style.cursor =
            "pointer";

        element.style.willChange =
            "transform, opacity";

        element.style.transition =
            "opacity 120ms ease";

        element.style.outlineOffset =
            "3px";
    }

    private applyBubbleStyles(
        element:
            HTMLDivElement
    ): void {
        const opacity:
            number =
                1 -
                this
                    .bubbleTransparencyPercent /
                100;

        element.style.position =
            "relative";

        element.style.display =
            "flex";

        element.style.alignItems =
            "center";

        element.style.justifyContent =
            "center";

        element.style.width =
            "100%";

        element.style.height =
            "100%";

        element.style.boxSizing =
            "border-box";

        element.style.borderRadius =
            "50%";

        element.style.background =
            this.colorWithOpacity(
                this.bubbleColor,
                opacity
            );

        element.style.border =
            `${this.borderWidth}px ` +
            `solid ${this.borderColor}`;

        element.style.boxShadow =
            "0 2px 7px rgba(0, 0, 0, 0.32)";
    }

    private applyIconStyles(
        element:
            HTMLImageElement
    ): void {
        element.style.display =
            "block";

        element.style.width =
            `${this.iconSizePercent}%`;

        element.style.height =
            `${this.iconSizePercent}%`;

        element.style.objectFit =
            "contain";

        element.style.opacity =
            String(
                this
                    .iconOpacityPercent /
                100
            );

        element.style.pointerEvents =
            "none";

        element.style.filter =
            "drop-shadow(" +
            "0 1px 1px " +
            "rgba(0, 0, 0, 0.32)" +
            ")";
    }

    private applyValueStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.top =
            "-7px";

        element.style.right =
            "-7px";

        element.style.display =
            "flex";

        element.style.alignItems =
            "center";

        element.style.justifyContent =
            "center";

        element.style.minWidth =
            "24px";

        element.style.height =
            "24px";

        element.style.padding =
            "0 5px";

        element.style.boxSizing =
            "border-box";

        element.style.borderRadius =
            "12px";

        element.style.background =
            "#1F2937";

        element.style.border =
            "2px solid #FFFFFF";

        element.style.color =
            "#FFFFFF";

        element.style.fontSize =
            "11px";

        element.style.fontWeight =
            "700";

        element.style.whiteSpace =
            "nowrap";
    }

    private applyLabelStyles(
        element:
            HTMLDivElement
    ): void {
        element.style.position =
            "absolute";

        element.style.left =
            "50%";

        element.style.top =
            "calc(100% + 5px)";

        element.style.transform =
            "translateX(-50%)";

        element.style.padding =
            "3px 6px";

        element.style.borderRadius =
            "4px";

        element.style.background =
            "rgba(255, 255, 255, 0.94)";

        element.style.color =
            "#111827";

        element.style.fontSize =
            "11px";

        element.style.fontWeight =
            "600";

        element.style.whiteSpace =
            "nowrap";

        element.style.boxShadow =
            "0 1px 3px rgba(0, 0, 0, 0.20)";

        element.style.maxWidth =
            "180px";

        element.style.overflow =
            "hidden";

        element.style.textOverflow =
            "ellipsis";
    }

    public destroy():
        void {

        this.destroyed =
            true;

        document.removeEventListener(
            "pointerdown",
            this.handleDocumentPointerDown,
            true
        );

        window.removeEventListener(
            "blur",
            this.handleWindowBlur
        );

        this.setIconMenuOpen(
            false
        );

        this.hideTooltip();

        if (
            this.transitionTimer !==
            null
        ) {
            window.clearTimeout(
                this.transitionTimer
            );

            this.transitionTimer =
                null;
        }

        if (
            this.iconFeedbackTimer !==
            null
        ) {
            window.clearTimeout(
                this.iconFeedbackTimer
            );

            this.iconFeedbackTimer =
                null;
        }

        this.renderedMarkers =
            [];

        this.markerLayerElement
            .replaceChildren();

        if (
            this.map
        ) {
            this.map.remove();

            this.map =
                null;
        }
    }
}
