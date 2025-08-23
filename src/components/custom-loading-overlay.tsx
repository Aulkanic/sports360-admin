import type { CustomLoadingOverlayProps } from "ag-grid-react";

const CustomLoadingOverlay = (
  props: CustomLoadingOverlayProps & { loadingMessage: string }
) => {
  return (
    <div className="ag-overlay-loading-center" role="presentation">
      <div
        role="presentation"
        className="custom-loading-overlay"
        style={{
          height: 100,
          width: 100,
          background:
            "url(/logo.png) center / contain no-repeat",
          margin: "0 auto",
        }}
      ></div>
      <div aria-live="polite" aria-atomic="true">
        {props.loadingMessage}
      </div>
    </div>
  );
};

export default CustomLoadingOverlay;
