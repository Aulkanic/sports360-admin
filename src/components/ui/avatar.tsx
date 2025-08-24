import * as React from "react";

export const Avatar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...rest }) => (
	<div className={["inline-flex items-center justify-center rounded-full bg-muted overflow-hidden", className].join(" ")} {...rest}>{children}</div>
);
export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
	<img {...props} alt={props.alt ?? "avatar"} className={["h-full w-full object-cover", props.className ?? ""].join(" ")} />
);
export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...rest }) => (
	<div className={["text-xs font-medium text-muted-foreground", className].join(" ")} {...rest}>{children}</div>
);
