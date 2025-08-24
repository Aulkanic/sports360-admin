/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	AllCommunityModule,
	ModuleRegistry,
	themeQuartz,
	type GridOptions,
	type Theme,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CustomLoadingOverlay from "./custom-loading-overlay";

ModuleRegistry.registerModules([AllCommunityModule]);

interface AgGridTableProps {
	columnDefs: any[];
	rowData: any[];
	paginationPageSize?: number;
	loading?: boolean;
	gridOptions?: GridOptions;
	className?: string;
	onGridReady?: (params: any) => void;
	gridRef?: React.RefObject<any>;
	customTheme?: "legacy" | Theme | undefined;
}

const resolveCssVar = (variableName: string, fallback: string): string => {
	if (typeof window === "undefined") return fallback;
	const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	return value || fallback;
};

const CustomDataTable: React.FC<AgGridTableProps> = ({
	columnDefs,
	rowData,
	paginationPageSize = 20,
	loading = false,
	gridOptions = {},
	className = "",
	gridRef,
	onGridReady,
	customTheme,
}) => {
	const internalGridRef = useRef<any>(null);
	const [computedTheme, setComputedTheme] = useState<Theme | undefined>(undefined);
	const paginationPageSizeSelector = useMemo<number[] | boolean>(() => {
		return [5, 10, 20, 50, 100, 200];
	}, []);

	const activeRef = gridRef || internalGridRef;

	useEffect(() => {
		// derive colors from CSS variables so AG Grid matches the site theme
		const bg = resolveCssVar("--background", "#ffffff");
		const fg = resolveCssVar("--foreground", "#0a0a0a");
		const primary = resolveCssVar("--primary", "#FF5C00");
		const input = resolveCssVar("--input", "#e6e6e6");
		const muted = resolveCssVar("--muted", "#f5f5f5");

		const isDark = document.documentElement.classList.contains("dark");

		const themed = themeQuartz.withParams({
			backgroundColor: bg,
			foregroundColor: fg,
			browserColorScheme: isDark ? "dark" : "light",
			headerBackgroundColor: primary,
			headerFontSize: 14,
			oddRowBackgroundColor: muted,
			rowVerticalPaddingScale: 1.4,
			chromeBackgroundColor: { ref: "foregroundColor", mix: 0.05, onto: "backgroundColor" },
			borderColor: input,
            headerTextColor: '#F4EDED'
		});
		setComputedTheme(themed);
	}, []);

	useEffect(() => {
		if (activeRef.current?.api) {
			if (loading) {
				activeRef.current.api.showLoadingOverlay();
			} else {
				activeRef.current.api.hideOverlay();
			}
		}
	}, [loading, activeRef]);

	const loadingOverlayComponentParams = useMemo(() => {
		return { loadingMessage: "One moment please..." };
	}, []);

	const themeToUse = customTheme || computedTheme;

	const defaultGridOptions: GridOptions = useMemo(
		() => ({
			rowHeight: 44,
			headerHeight: 44,
			animateRows: true,
		}),
		[]
	);

	const mergedGridOptions: GridOptions = useMemo(() => ({
		...defaultGridOptions,
		...gridOptions,
	}), [defaultGridOptions, gridOptions]);

	const baseWrapperClasses = "rounded-lg border overflow-hidden";

	return (
		<div className={`ag-theme-quartz ${baseWrapperClasses} ${className}`}>
			<AgGridReact
				ref={activeRef}
				columnDefs={columnDefs}
				rowData={rowData}
				pagination={true}
				paginationPageSizeSelector={paginationPageSizeSelector}
				loadingOverlayComponent={CustomLoadingOverlay}
				loadingOverlayComponentParams={loadingOverlayComponentParams}
				domLayout="autoHeight"
				paginationPageSize={paginationPageSize}
				enableFilterHandlers={true}
				onGridReady={onGridReady}
				loading={loading}
				{...mergedGridOptions}
				theme={themeToUse}
			/>
		</div>
	);
};

export default CustomDataTable;
