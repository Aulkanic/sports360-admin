/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type GridOptions,
  type Theme,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useRef } from "react";
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
  const paginationPageSizeSelector = useMemo<number[] | boolean>(() => {
    return [5, 10, 20, 50, 100, 200];
  }, []);

  const activeRef = gridRef || internalGridRef;

  const myTheme = themeQuartz.withParams({
    backgroundColor: "#2F2F2F",
    browserColorScheme: "dark",
    chromeBackgroundColor: {
      ref: "foregroundColor",
      mix: 0.07,
      onto: "backgroundColor",
    },
    foregroundColor: "#FFF",
    headerBackgroundColor: "#f89004",
    headerFontSize: 14,
    oddRowBackgroundColor: "#1E1E20",
    rowVerticalPaddingScale: 1.5,
  });

  const themeToUse = customTheme || myTheme;

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

  return (
    <div className={`ag-theme-quartz ${className}`}>
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
        {...gridOptions}
        theme={themeToUse}
      />
    </div>
  );
};

export default CustomDataTable;
