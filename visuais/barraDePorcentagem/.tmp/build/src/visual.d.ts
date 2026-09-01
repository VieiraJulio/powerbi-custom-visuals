import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
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
export declare class Visual implements IVisual {
    private readonly container;
    private view;
    private formattingSettingsService;
    private formattingSettings;
    private renderVersion;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    getFormattingModel(): powerbi.visuals.FormattingModel;
    private render;
    private createSpec;
    /**
     * Calcula uma área fixa para o rótulo.
     *
     * O resultado atual não participa do cálculo,
     * evitando que o trilho aumente ou diminua.
     */
    private calculateFixedLabelAreaWidth;
    private resolveBarColor;
    private getRoleColumns;
    /**
     * Verifica se um campo foi configurado para o papel informado,
     * mesmo quando o filtro faz a consulta retornar apenas BLANK().
     */
    private hasRole;
    private getFirstRoleValue;
    /**
     * Obtém os campos adicionados ao papel
     * Dica de ferramenta.
     */
    private getTooltipItems;
    private normalizeNumber;
    private showMessage;
    private disposeView;
    destroy(): void;
}
