import {
  createElement,
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
  type SVGProps,
} from "react";

export type IconNode = Array<
  [tag: keyof React.JSX.IntrinsicElements, attrs: SVGProps<SVGSVGElement>]
>;

export type CustomIconProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  viewBox?: string;
};

export type CustomIcon = ForwardRefExoticComponent<
  CustomIconProps & RefAttributes<SVGSVGElement>
>;

function createCustomIcon(displayName: string, iconNode: IconNode): CustomIcon {
  const Component = forwardRef<SVGSVGElement, CustomIconProps>(
    (
      {
        color = "currentColor",
        size = 24,
        strokeWidth = 2,
        absoluteStrokeWidth = false,
        children,
        viewBox = "0 0 24 24",
        ...props
      },
      ref,
    ) => {
      const computedStrokeWidth = absoluteStrokeWidth
        ? (Number(strokeWidth) * 24) / Number(size)
        : strokeWidth;

      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          fill="none"
          color={color}
          viewBox={viewBox}
          {...props}
        >
          {iconNode.map(([tag, attrs], index) =>
            createElement(tag, {
              key: `${displayName}-${index}`,
              ...attrs,
              ...(attrs.stroke ? { stroke: color } : {}),
              ...(attrs.fill
                ? { fill: attrs.fill === "none" ? "none" : color }
                : {}),
              ...(attrs.strokeWidth
                ? { strokeWidth: computedStrokeWidth }
                : {}),
            }),
          )}
          {children}
        </svg>
      );
    },
  );

  Component.displayName = displayName;

  return Component;
}

export const MugIcon = createCustomIcon("MugIcon", [
  [
    "path",
    {
      d: "M7 19C5.9 19 4.95833 18.6083 4.175 17.825C3.39167 17.0417 3 16.1 3 15V5H19C19.55 5 20.0208 5.19583 20.4125 5.5875C20.8042 5.97917 21 6.45 21 7V10C21 10.55 20.8042 11.0208 20.4125 11.4125C20.0208 11.8042 19.55 12 19 12H17V15C17 16.1 16.6083 17.0417 15.825 17.825C15.0417 18.6083 14.1 19 13 19H7ZM7 17H13C13.55 17 14.0208 16.8042 14.4125 16.4125C14.8042 16.0208 15 15.55 15 15V7H5V15C5 15.55 5.19583 16.0208 5.5875 16.4125C5.97917 16.8042 6.45 17 7 17ZM17 10H19V7H17V10ZM7 17H5H15H7Z",
      fill: "currentColor",
    },
  ],
]);

export const CupIcon = createCustomIcon("CupIcon", [
  [
    "path",
    {
      d: "M5.0375 16.9625C6.39583 18.3208 8.05 19 10 19C11.95 19 13.6042 18.3208 14.9625 16.9625C16.3208 15.6042 17 13.95 17 12V11H17.5C18.4667 11 19.2917 10.6583 19.975 9.975C20.6583 9.29167 21 8.46667 21 7.5C21 6.53333 20.6583 5.70833 19.975 5.025C19.2917 4.34167 18.4667 4 17.5 4H5C4.45 4 3.97917 4.19583 3.5875 4.5875C3.19583 4.97917 3 5.45 3 6V12C3 13.95 3.67917 15.6042 5.0375 16.9625ZM15 9H5V6H15V9ZM13.5375 15.5375C12.5625 16.5125 11.3833 17 10 17C8.61667 17 7.4375 16.5125 6.4625 15.5375C5.4875 14.5625 5 13.3833 5 12V11H15V12C15 13.3833 14.5125 14.5625 13.5375 15.5375ZM17.5 9H17V6H17.5C17.9167 6 18.2708 6.14583 18.5625 6.4375C18.8542 6.72917 19 7.08333 19 7.5C19 7.91667 18.8542 8.27083 18.5625 8.5625C18.2708 8.85417 17.9167 9 17.5 9Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    },
  ],
]);

export const BeerIcon = createCustomIcon("BeerIcon", [
  [
    "path",
    {
      d: "M16 8H17C17.7956 8 18.5587 8.31607 19.1213 8.87868C19.6839 9.44129 20 10.2044 20 11C20 11.7956 19.6839 12.5587 19.1213 13.1213C18.5587 13.6839 17.7956 14 17 14H16",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M8 9V15",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M12 9V15",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M10 5.02271L4.00004 4.99995",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M16 5.02271L10 4.99995",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M4 5V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H14C14.5304 19 15.0391 18.7893 15.4142 18.4142C15.7893 18.0391 16 17.5304 16 17V5",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
]);

export const GlassIcon = createCustomIcon("GlassIcon", [
  [
    "path",
    {
      d: "M6 5L7.75 17.28C7.81792 17.7606 8.05827 18.2 8.42624 18.5165C8.79421 18.8329 9.26469 19.0048 9.75 19H14.29C14.7753 19.0048 15.2458 18.8329 15.6138 18.5165C15.9817 18.2 16.2221 17.7606 16.29 17.28L18 5",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M6 5L18 5",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M7 12.0001C7.79175 11.6684 8.64158 11.4976 9.5 11.4976C10.3584 11.4976 11.2083 11.6684 12 12.0001C12.7917 12.3318 13.6416 12.5026 14.5 12.5026C15.3584 12.5026 16.2083 12.3318 17 12.0001",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
]);

export const PitcherIcon = createCustomIcon("PitcherIcon", [
  [
    "path",
    {
      d: "M10 2V4",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M14 2V4",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M16 8C16.2652 8 16.5196 8.10536 16.7071 8.29289C16.8946 8.48043 17 8.73478 17 9V17C17 18.0609 16.5786 19.0783 15.8284 19.8284C15.0783 20.5786 14.0609 21 13 21H7C5.93913 21 4.92172 20.5786 4.17157 19.8284C3.42143 19.0783 3 18.0609 3 17V9C3 8.73478 3.10536 8.48043 3.29289 8.29289C3.48043 8.10536 3.73478 8 4 8H18C19.0609 8 20.0783 8.42143 20.8284 9.17157C21.5786 9.92172 22 10.9391 22 12C22 13.0609 21.5786 14.0783 20.8284 14.8284C20.0783 15.5786 19.0609 16 18 16H17",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M6 2V4",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
]);

export const TallGlassIcon = createCustomIcon("TallGlassIcon", [
  [
    "path",
    {
      d: "M5.11602 4.104C5.10145 3.96471 5.11631 3.82392 5.15962 3.69074C5.20293 3.55756 5.27373 3.43496 5.36744 3.33089C5.46114 3.22681 5.57566 3.14358 5.70358 3.08658C5.83151 3.02958 5.96997 3.00008 6.11002 3H17.89C18.0302 3.00007 18.1687 3.02959 18.2967 3.08665C18.4247 3.14371 18.5393 3.22703 18.633 3.33122C18.7267 3.43541 18.7975 3.55813 18.8407 3.69143C18.884 3.82473 18.8987 3.96564 18.884 4.105L17.19 20.21C17.1381 20.7015 16.9061 21.1564 16.5386 21.487C16.1711 21.8175 15.6943 22.0003 15.2 22H8.80002C8.30404 22.0027 7.82474 21.8211 7.45516 21.4903C7.08558 21.1595 6.85209 20.7032 6.80002 20.21L5.11602 4.104Z",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M6 12C6.86548 11.3509 7.91815 11 9 11C10.0819 11 11.1345 11.3509 12 12C12.8655 12.6491 13.9181 13 15 13C16.0819 13 17.1345 12.6491 18 12",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
]);

export const ThermosIcon = createCustomIcon("ThermosIcon", [
  [
    "path",
    {
      d: "M15.175 11H9.82496C9.74162 11.2 9.64162 11.3958 9.52496 11.5875C9.40829 11.7792 9.26662 11.9417 9.09996 12.075L9.82496 20H15.175L15.9 12.075C15.7333 11.925 15.5916 11.7583 15.475 11.575C15.3583 11.3917 15.2583 11.2 15.175 11ZM9.54996 7L9.27496 8.1C9.39162 8.23333 9.49579 8.375 9.58746 8.525C9.67912 8.675 9.75829 8.83333 9.82496 9H15.175C15.2416 8.83333 15.3208 8.675 15.4125 8.525C15.5041 8.375 15.6083 8.23333 15.725 8.1L15.45 7H9.54996ZM9.82496 22C9.30829 22 8.85829 21.8292 8.47496 21.4875C8.09162 21.1458 7.87496 20.7167 7.82496 20.2L7.04996 11.55C7.03329 11.3833 7.06246 11.2292 7.13746 11.0875C7.21246 10.9458 7.32496 10.8333 7.47496 10.75C7.60829 10.6667 7.72496 10.5667 7.82496 10.45C7.92496 10.3333 7.97496 10.1917 7.97496 10.025C7.97496 9.875 7.94162 9.7375 7.87496 9.6125C7.80829 9.4875 7.70829 9.38333 7.57496 9.3C7.40829 9.21667 7.28329 9.0875 7.19996 8.9125C7.11662 8.7375 7.09996 8.55833 7.14996 8.375L7.79996 5.75C7.84996 5.51667 7.96662 5.33333 8.14996 5.2C8.33329 5.06667 8.54162 5 8.77496 5H11.5V4H9.99996V2H15V4H13.5V5H16.225C16.4583 5 16.6625 5.06667 16.8375 5.2C17.0125 5.33333 17.125 5.51667 17.175 5.75L17.85 8.375C17.9 8.55833 17.8833 8.7375 17.8 8.9125C17.7166 9.0875 17.5916 9.21667 17.425 9.3C17.2916 9.36667 17.1875 9.45833 17.1125 9.575C17.0375 9.69167 17 9.825 17 9.975C17 10.1583 17.0458 10.3125 17.1375 10.4375C17.2291 10.5625 17.35 10.6667 17.5 10.75C17.65 10.8333 17.7666 10.9458 17.85 11.0875C17.9333 11.2292 17.9666 11.3833 17.95 11.55L17.175 20.175C17.125 20.6917 16.9083 21.125 16.525 21.475C16.1416 21.825 15.6916 22 15.175 22H9.82496Z",
      fill: "currentColor",
    },
  ],
]);

export const BottleIcon = createCustomIcon("BottleIcon", [
  [
    "path",
    {
      d: "M10 3C10 2.73478 10.1054 2.48043 10.2929 2.29289C10.4804 2.10536 10.7348 2 11 2H13C13.2652 2 13.5196 2.10536 13.7071 2.29289C13.8946 2.48043 14 2.73478 14 3V5C14 6.29822 14.4211 7.56142 15.2 8.6L15.8 9.4C16.5789 10.4386 17 11.7018 17 13V21C17 21.2652 16.8946 21.5196 16.7071 21.7071C16.5196 21.8946 16.2652 22 16 22H8C7.73478 22 7.48043 21.8946 7.29289 21.7071C7.10536 21.5196 7 21.2652 7 21V13C7 11.7018 7.42107 10.4386 8.2 9.4L8.8 8.6C9.57893 7.56142 10 6.29822 10 5V3Z",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
]);

export const BottleWaveIcon = createCustomIcon("BottleWaveIcon", [
  [
    "path",
    {
      d: "M9 2L15 2",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M9 2V4.789C8.99998 5.57879 8.76616 6.3509 8.328 7.008L7.672 7.992C7.23366 8.64939 6.99982 9.42187 7 10.212V20C7 20.5304 7.21071 21.0391 7.58579 21.4142C7.96086 21.7893 8.46957 22 9 22H15C15.5304 22 16.0391 21.7893 16.4142 21.4142C16.7893 21.0391 17 20.5304 17 20V10.211C17 9.42121 16.7662 8.6491 16.328 7.992L15.672 7.008C15.2337 6.35061 14.9998 5.57813 15 4.788V2",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
  [
    "path",
    {
      d: "M7 14.9999C7.79177 14.6683 8.6416 14.4976 9.5 14.4976C10.3584 14.4976 11.2082 14.6683 12 14.9999C12.7917 15.3316 13.6416 15.5024 14.5 15.5024C15.3584 15.5024 16.2083 15.3316 17 14.9999",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
  ],
]);
